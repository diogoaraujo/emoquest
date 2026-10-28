import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { and, eq, gt } from 'drizzle-orm'
import { ZodError } from 'zod'
import type { Config } from './config'
import type { DB } from './db/client'
import { authTokens, participants, rooms, users } from './db/schema'
import { sha256 } from './lib/crypto'
import { GameError } from './lib/game'
import { authRoutes } from './routes/auth'
import { participantRoutes } from './routes/participant'
import { roomRoutes } from './routes/rooms'
import { sharedRoutes } from './routes/shared'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export interface AppContext {
  db: DB
  config: Config
  /** Usuário autenticado (responsável) ou 401. */
  requireUser: (req: FastifyRequest) => Promise<typeof users.$inferSelect>
  /** Sala do usuário ou 404 — nunca revela se uma sala de outra pessoa existe. */
  requireOwnedRoom: (userId: string, roomId: string) => Promise<typeof rooms.$inferSelect>
  /** Participante dono do token, ou 401. */
  requireParticipant: (req: FastifyRequest) => Promise<{ participant: typeof participants.$inferSelect; room: typeof rooms.$inferSelect }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function buildApp(db: DB, config: Config, opts: { logger?: boolean } = {}) {
  const app = Fastify({
    logger: opts.logger
      ? {
          // Nunca registrar tokens nem corpos de requisição (podem conter nomes de participantes).
          redact: ['req.headers.authorization', 'req.headers["x-participant-token"]'],
        }
      : false,
    trustProxy: true,
    bodyLimit: 32 * 1024,
  })

  await app.register(helmet, { contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } })
  await app.register(cors, {
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['content-type', 'authorization', 'x-participant-token'],
    maxAge: 600,
  })
  await app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' })

  app.addHook('onSend', async (_req, reply) => {
    // Respostas da API nunca devem ficar em cache compartilhado.
    reply.header('cache-control', 'no-store')
  })

  app.setErrorHandler((err: unknown, _req, reply: FastifyReply) => {
    if (err instanceof ZodError) return reply.status(400).send({ error: err.issues[0]?.message ?? 'Dados inválidos.' })
    if (err instanceof HttpError || err instanceof GameError) return reply.status(err.status).send({ error: err.message })
    const e = err as { statusCode?: number; message?: string }
    if (e.statusCode && e.statusCode < 500) return reply.status(e.statusCode).send({ error: e.message ?? 'Requisição inválida.' })
    app.log.error(err)
    return reply.status(500).send({ error: 'Erro interno.' })
  })

  const bearer = (req: FastifyRequest) => {
    const h = req.headers.authorization
    return h?.startsWith('Bearer ') ? h.slice(7) : undefined
  }

  const ctx: AppContext = {
    db,
    config,
    async requireUser(req) {
      const token = bearer(req)
      if (!token) throw new HttpError(401, 'Faça login para continuar.')
      const [row] = await db
        .select({ user: users })
        .from(authTokens)
        .innerJoin(users, eq(users.id, authTokens.userId))
        .where(and(eq(authTokens.tokenHash, sha256(token)), gt(authTokens.expiresAt, new Date())))
        .limit(1)
      if (!row) throw new HttpError(401, 'Sessão expirada. Faça login novamente.')
      return row.user
    },
    async requireOwnedRoom(userId, roomId) {
      if (!UUID_RE.test(roomId)) throw new HttpError(404, 'Sala não encontrada.')
      const [room] = await db.select().from(rooms).where(and(eq(rooms.id, roomId), eq(rooms.ownerId, userId))).limit(1)
      if (!room) throw new HttpError(404, 'Sala não encontrada.')
      return room
    },
    async requireParticipant(req) {
      const token = req.headers['x-participant-token']
      if (typeof token !== 'string' || !token) throw new HttpError(401, 'Entre na sala pelo link para participar.')
      const [row] = await db
        .select({ participant: participants, room: rooms })
        .from(participants)
        .innerJoin(rooms, eq(rooms.id, participants.roomId))
        .where(eq(participants.tokenHash, sha256(token)))
        .limit(1)
      if (!row) throw new HttpError(401, 'Sua participação não foi encontrada. Entre na sala novamente.')
      return row
    },
  }

  app.get('/api/health', async () => ({ ok: true }))
  await app.register(authRoutes(ctx), { prefix: '/api/auth' })
  await app.register(roomRoutes(ctx), { prefix: '/api/rooms' })
  await app.register(participantRoutes(ctx), { prefix: '/api/public' })
  await app.register(sharedRoutes(ctx), { prefix: '/api/shared' })

  return app
}

export const isUuid = (v: string) => UUID_RE.test(v)
