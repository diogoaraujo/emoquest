/** Rotas do responsável. Toda rota com :roomId passa por requireOwnedRoom (isolamento por sala). */
import type { FastifyPluginAsync } from 'fastify'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { HttpError, isUuid, type AppContext } from '../app'
import { auditEvents, gameSessions, participantIdentities, participants, results, rooms, sessionAggregates } from '../db/schema'
import { combineShares, ownerStats, refreshAggregate } from '../lib/analytics'
import { joinCode, randomToken } from '../lib/crypto'
import { getStory, STORIES } from '../lib/game'

const roomBody = z.object({
  name: z.string().trim().min(2, 'Dê um nome para a sala.').max(80),
  description: z.string().trim().max(300).default(''),
  minGroupSize: z.number().int().min(3, 'O mínimo para anonimização é 3 pessoas.').max(50).default(3),
  retentionDays: z.number().int().min(30).max(730).default(90),
})

const createRoomBody = roomBody.extend({
  legalBasisAck: z.literal(true, { error: 'Confirme que você tem autorização para aplicar a atividade com o grupo.' }),
})

const sessionBody = z
  .object({
    title: z.string().trim().min(2, 'Dê um título para a sessão.').max(80),
    activity: z.enum(['historias', 'checkin']),
    storyIds: z.array(z.string()).max(STORIES.length).default([]),
  })
  .refine((s) => s.activity === 'checkin' || (s.storyIds.length > 0 && s.storyIds.every((id) => getStory(id))), {
    error: 'Escolha pelo menos uma história válida.',
  })

const roomView = (r: typeof rooms.$inferSelect, appUrl: string) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  joinCode: r.joinCode,
  joinUrl: `${appUrl}/#/sala/${r.joinCode}`,
  shareUrl: r.shareToken ? `${appUrl}/#/compartilhado/${r.shareToken}` : null,
  minGroupSize: r.minGroupSize,
  retentionDays: r.retentionDays,
  createdAt: r.createdAt,
})

export const roomRoutes =
  (ctx: AppContext): FastifyPluginAsync =>
  async (app) => {
    const { db, config } = ctx
    const view = (r: typeof rooms.$inferSelect) => roomView(r, config.publicAppUrl)
    const audit = (userId: string, roomId: string, action: string) => db.insert(auditEvents).values({ userId, roomId, action })

    async function ownedSession(roomId: string, sessionId: string) {
      if (!isUuid(sessionId)) throw new HttpError(404, 'Sessão não encontrada.')
      const [s] = await db
        .select()
        .from(gameSessions)
        .where(and(eq(gameSessions.id, sessionId), eq(gameSessions.roomId, roomId)))
        .limit(1)
      if (!s) throw new HttpError(404, 'Sessão não encontrada.')
      return s
    }

    // ---------- Salas ----------

    app.get('/', async (req) => {
      const user = await ctx.requireUser(req)
      const list = await db.select().from(rooms).where(eq(rooms.ownerId, user.id)).orderBy(desc(rooms.createdAt))
      const ids = list.map((r) => r.id)
      const pCounts = ids.length
        ? await db.select({ roomId: participants.roomId, n: count() }).from(participants).where(inArray(participants.roomId, ids)).groupBy(participants.roomId)
        : []
      const sCounts = ids.length
        ? await db.select({ roomId: gameSessions.roomId, n: count() }).from(gameSessions).where(inArray(gameSessions.roomId, ids)).groupBy(gameSessions.roomId)
        : []
      return {
        rooms: list.map((r) => ({
          ...view(r),
          participants: pCounts.find((c) => c.roomId === r.id)?.n ?? 0,
          sessions: sCounts.find((c) => c.roomId === r.id)?.n ?? 0,
        })),
      }
    })

    app.post('/', async (req, reply) => {
      const user = await ctx.requireUser(req)
      const body = createRoomBody.parse(req.body)
      const [room] = await db
        .insert(rooms)
        .values({
          ownerId: user.id,
          name: body.name,
          description: body.description,
          minGroupSize: body.minGroupSize,
          retentionDays: body.retentionDays,
          joinCode: joinCode(),
          legalBasisAckAt: new Date(),
        })
        .returning()
      return reply.status(201).send({ room: view(room) })
    })

    app.get<{ Params: { roomId: string } }>('/:roomId', async (req) => {
      const user = await ctx.requireUser(req)
      return { room: view(await ctx.requireOwnedRoom(user.id, req.params.roomId)) }
    })

    app.patch<{ Params: { roomId: string } }>('/:roomId', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const body = roomBody.partial().parse(req.body)
      const [updated] = await db.update(rooms).set(body).where(eq(rooms.id, room.id)).returning()
      return { room: view(updated) }
    })

    /** Exclusão definitiva da sala e de todos os dados ligados a ela. */
    app.delete<{ Params: { roomId: string } }>('/:roomId', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      await db.delete(rooms).where(eq(rooms.id, room.id))
      await audit(user.id, room.id, 'room.deleted')
      return { ok: true }
    })

    /** Troca o código de entrada (ex.: se o link vazou). Quem já entrou continua participando. */
    app.post<{ Params: { roomId: string } }>('/:roomId/join-code', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const [updated] = await db.update(rooms).set({ joinCode: joinCode() }).where(eq(rooms.id, room.id)).returning()
      return { room: view(updated) }
    })

    /** Liga (ou troca) o link do painel compartilhado, que mostra só dados agregados. */
    app.post<{ Params: { roomId: string } }>('/:roomId/share', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const [updated] = await db.update(rooms).set({ shareToken: randomToken(24) }).where(eq(rooms.id, room.id)).returning()
      await audit(user.id, room.id, 'share.enabled')
      return { room: view(updated) }
    })

    app.delete<{ Params: { roomId: string } }>('/:roomId/share', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const [updated] = await db.update(rooms).set({ shareToken: null }).where(eq(rooms.id, room.id)).returning()
      return { room: view(updated) }
    })

    // ---------- Participantes (dados identificáveis: só aqui) ----------

    app.get<{ Params: { roomId: string } }>('/:roomId/participants', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const rows = await db
        .select({
          id: participants.id,
          displayName: participantIdentities.displayName,
          ageBand: participants.ageBand,
          joinedAt: participants.createdAt,
          lastSeenAt: participants.lastSeenAt,
        })
        .from(participants)
        .leftJoin(participantIdentities, eq(participantIdentities.participantId, participants.id))
        .where(eq(participants.roomId, room.id))
        .orderBy(asc(participants.createdAt))
      const done = await db
        .select({ participantId: results.participantId, n: count() })
        .from(results)
        .innerJoin(participants, eq(participants.id, results.participantId))
        .where(eq(participants.roomId, room.id))
        .groupBy(results.participantId)
      await audit(user.id, room.id, 'participants.viewed')
      return {
        participants: rows.map((p) => ({ ...p, displayName: p.displayName ?? null, sessionsCompleted: done.find((d) => d.participantId === p.id)?.n ?? 0 })),
      }
    })

    /** Exclusão a pedido do titular (ou por decisão do responsável). Recalcula os agregados afetados. */
    app.delete<{ Params: { roomId: string; participantId: string } }>('/:roomId/participants/:participantId', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      if (!isUuid(req.params.participantId)) throw new HttpError(404, 'Participante não encontrado.')
      const affected = await db
        .select({ sessionId: results.sessionId })
        .from(results)
        .where(eq(results.participantId, req.params.participantId))
      const deleted = await db
        .delete(participants)
        .where(and(eq(participants.id, req.params.participantId), eq(participants.roomId, room.id)))
        .returning({ id: participants.id })
      if (!deleted.length) throw new HttpError(404, 'Participante não encontrado.')
      for (const s of affected) await refreshAggregate(db, s.sessionId)
      await audit(user.id, room.id, 'participant.deleted')
      return { ok: true }
    })

    // ---------- Sessões ----------

    app.get<{ Params: { roomId: string } }>('/:roomId/sessions', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const rows = await db
        .select({ s: gameSessions, n: sessionAggregates.n })
        .from(gameSessions)
        .leftJoin(sessionAggregates, eq(sessionAggregates.sessionId, gameSessions.id))
        .where(eq(gameSessions.roomId, room.id))
        .orderBy(desc(gameSessions.createdAt))
      return { sessions: rows.map(({ s, n }) => ({ ...s, completed: n ?? 0 })) }
    })

    app.post<{ Params: { roomId: string } }>('/:roomId/sessions', async (req, reply) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const body = sessionBody.parse(req.body)
      const [session] = await db
        .insert(gameSessions)
        .values({ roomId: room.id, title: body.title, activity: body.activity, storyIds: body.activity === 'checkin' ? [] : body.storyIds })
        .returning()
      return reply.status(201).send({ session: { ...session, completed: 0 } })
    })

    app.patch<{ Params: { roomId: string; sessionId: string } }>('/:roomId/sessions/:sessionId', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const session = await ownedSession(room.id, req.params.sessionId)
      const body = z.object({ status: z.enum(['aberta', 'encerrada']).optional(), title: z.string().trim().min(2).max(80).optional() }).parse(req.body)
      const [updated] = await db
        .update(gameSessions)
        .set({ ...body, closedAt: body.status === 'encerrada' ? new Date() : body.status === 'aberta' ? null : session.closedAt })
        .where(eq(gameSessions.id, session.id))
        .returning()
      return { session: updated }
    })

    app.delete<{ Params: { roomId: string; sessionId: string } }>('/:roomId/sessions/:sessionId', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const session = await ownedSession(room.id, req.params.sessionId)
      await db.delete(gameSessions).where(eq(gameSessions.id, session.id))
      return { ok: true }
    })

    /** Resultados individuais com nome: exclusivo do responsável, e cada acesso fica registrado. */
    app.get<{ Params: { roomId: string; sessionId: string } }>('/:roomId/sessions/:sessionId/results', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const session = await ownedSession(room.id, req.params.sessionId)
      const rows = await db
        .select({
          participantId: results.participantId,
          displayName: participantIdentities.displayName,
          scores: results.scores,
          dominant: results.dominant,
          completedAt: results.completedAt,
        })
        .from(results)
        .leftJoin(participantIdentities, eq(participantIdentities.participantId, results.participantId))
        .where(eq(results.sessionId, session.id))
        .orderBy(asc(results.completedAt))
      const [agg] = await db.select().from(sessionAggregates).where(eq(sessionAggregates.sessionId, session.id))
      await audit(user.id, room.id, 'results.viewed')
      return { session, stats: ownerStats(session, agg), results: rows.map((r) => ({ ...r, displayName: r.displayName ?? null })) }
    })

    /** Dashboard do responsável: só agregados (nenhum identificador), mas com valores exatos. */
    app.get<{ Params: { roomId: string } }>('/:roomId/dashboard', async (req) => {
      const user = await ctx.requireUser(req)
      const room = await ctx.requireOwnedRoom(user.id, req.params.roomId)
      const rows = await db
        .select({ s: gameSessions, agg: sessionAggregates })
        .from(gameSessions)
        .leftJoin(sessionAggregates, eq(sessionAggregates.sessionId, gameSessions.id))
        .where(eq(gameSessions.roomId, room.id))
        .orderBy(asc(gameSessions.createdAt))
      const sessions = rows.map(({ s, agg }) => ownerStats(s, agg ?? undefined))
      const [{ n: participantCount }] = await db.select({ n: count() }).from(participants).where(eq(participants.roomId, room.id))
      return {
        mode: 'owner' as const,
        room: { name: room.name, minGroupSize: room.minGroupSize },
        totals: {
          participants: participantCount,
          sessions: sessions.length,
          results: sessions.reduce((s, x) => s + x.n, 0),
          shares: combineShares(sessions),
        },
        sessions,
      }
    })
  }
