/**
 * Rotas dos jovens: entram pelo código da sala, sem cadastro.
 * Recebem um token aleatório guardado só no próprio celular; nada aqui devolve dados de outras pessoas,
 * exceto o resultado da turma já anonimizado.
 */
import type { FastifyPluginAsync } from 'fastify'
import { and, asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { HttpError, isUuid, type AppContext } from '../app'
import { gameSessions, participantIdentities, participants, responses, results, rooms, sessionAggregates, users } from '../db/schema'
import { publicStats, refreshAggregate } from '../lib/analytics'
import { randomToken, sha256 } from '../lib/crypto'
import { ageProfile, dominantOf, GameError, MAX_AGE, MIN_AGE, scoresFromCheckin, scoresFromResponses, storiesFinished, validateChoice } from '../lib/game'

const joinBody = z.object({
  // Nome é opcional e pode ser um apelido. Removemos caracteres de controle.
  displayName: z
    .string()
    .trim()
    .max(40, 'Use até 40 caracteres.')
    .transform((s) => s.replace(/[\p{C}]/gu, ''))
    .optional(),
  // Idade é opcional; só a faixa etária é gravada.
  age: z.number().int().min(MIN_AGE, 'Confira a idade.').max(MAX_AGE, 'Confira a idade.').optional(),
  consent: z.literal(true, { error: 'Para participar, é preciso concordar com o uso dos dados descrito acima.' }),
  consentVersion: z.string().max(20),
})

const choiceBody = z.object({ storyId: z.string().max(60), nodeId: z.string().max(60), choiceIndex: z.number().int().min(0).max(10) })
const checkinBody = z.object({ items: z.array(z.object({ emotion: z.string(), intensity: z.number().int() })).min(1).max(3) })

export const participantRoutes =
  (ctx: AppContext): FastifyPluginAsync =>
  async (app) => {
    const { db, config } = ctx

    async function roomByCode(code: string) {
      const [row] = await db
        .select({ room: rooms, ownerName: users.name })
        .from(rooms)
        .innerJoin(users, eq(users.id, rooms.ownerId))
        .where(eq(rooms.joinCode, code.toUpperCase()))
        .limit(1)
      if (!row) throw new HttpError(404, 'Sala não encontrada. Confira o link ou o código.')
      return row
    }

    const sessionSummary = (s: typeof gameSessions.$inferSelect) => ({ id: s.id, title: s.title, activity: s.activity, storyIds: s.storyIds, status: s.status })

    async function openSession(roomId: string, sessionId: string) {
      if (!isUuid(sessionId)) throw new HttpError(404, 'Sessão não encontrada.')
      const [s] = await db
        .select()
        .from(gameSessions)
        .where(and(eq(gameSessions.id, sessionId), eq(gameSessions.roomId, roomId)))
        .limit(1)
      if (!s) throw new HttpError(404, 'Sessão não encontrada.')
      return s
    }

    async function assertNotDone(sessionId: string, participantId: string) {
      const [done] = await db
        .select({ id: results.id })
        .from(results)
        .where(and(eq(results.sessionId, sessionId), eq(results.participantId, participantId)))
        .limit(1)
      if (done) throw new HttpError(409, 'Você já concluiu esta atividade.')
    }

    async function saveResult(sessionId: string, participantId: string, scores: Record<string, number>) {
      const dominant = dominantOf(scores as never)
      await db.insert(results).values({ sessionId, participantId, scores, dominant })
      await refreshAggregate(db, sessionId)
      return { scores, dominant }
    }

    /** Informações para a tela de entrada (transparência antes do consentimento). */
    app.get<{ Params: { code: string } }>('/rooms/:code', async (req) => {
      const { room, ownerName } = await roomByCode(req.params.code)
      return {
        room: { name: room.name, description: room.description, ownerName, retentionDays: room.retentionDays, minGroupSize: room.minGroupSize },
        consentVersion: config.consentVersion,
      }
    })

    app.post<{ Params: { code: string } }>('/rooms/:code/join', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req, reply) => {
      const { room } = await roomByCode(req.params.code)
      const body = joinBody.parse(req.body)
      if (body.consentVersion !== config.consentVersion) throw new HttpError(409, 'Os termos foram atualizados. Recarregue a página.')
      const token = randomToken()
      const [p] = await db
        .insert(participants)
        .values({
          roomId: room.id,
          tokenHash: sha256(token),
          consentVersion: body.consentVersion,
          consentedAt: new Date(),
          ageBand: body.age === undefined ? null : ageProfile(body.age).band,
        })
        .returning({ id: participants.id })
      if (body.displayName) await db.insert(participantIdentities).values({ participantId: p.id, roomId: room.id, displayName: body.displayName })
      return reply.status(201).send({ participantToken: token })
    })

    /** Estado do próprio participante: sessões abertas e quais já concluiu. */
    app.get('/me', async (req) => {
      const { participant, room } = await ctx.requireParticipant(req)
      await db.update(participants).set({ lastSeenAt: new Date() }).where(eq(participants.id, participant.id))
      const sessions = await db.select().from(gameSessions).where(eq(gameSessions.roomId, room.id)).orderBy(asc(gameSessions.createdAt))
      const mine = await db.select({ sessionId: results.sessionId }).from(results).where(eq(results.participantId, participant.id))
      const [identity] = await db.select({ displayName: participantIdentities.displayName }).from(participantIdentities).where(eq(participantIdentities.participantId, participant.id))
      return {
        room: { name: room.name, joinCode: room.joinCode },
        displayName: identity?.displayName ?? null,
        sessions: sessions.map((s) => ({ ...sessionSummary(s), done: mine.some((m) => m.sessionId === s.id) })),
      }
    })

    /** Registra uma escolha (validada contra o caminho da história). */
    app.post<{ Params: { sessionId: string } }>('/sessions/:sessionId/responses', async (req, reply) => {
      const { participant, room } = await ctx.requireParticipant(req)
      const session = await openSession(room.id, req.params.sessionId)
      if (session.status !== 'aberta') throw new HttpError(409, 'Esta sessão já foi encerrada.')
      if (session.activity !== 'historias') throw new GameError('Esta sessão não é de histórias.')
      await assertNotDone(session.id, participant.id)
      const body = choiceBody.parse(req.body)
      const history = await db
        .select({ storyId: responses.storyId, nodeId: responses.nodeId, choiceIndex: responses.choiceIndex })
        .from(responses)
        .where(and(eq(responses.sessionId, session.id), eq(responses.participantId, participant.id)))
        .orderBy(asc(responses.createdAt))
      const effects = validateChoice(session.storyIds, history, body)
      await db.insert(responses).values({ sessionId: session.id, participantId: participant.id, ...body, effects: effects as Record<string, number> })
      return reply.status(201).send({ ok: true })
    })

    /** Recomeça uma partida não concluída (ex.: a página foi recarregada no meio da história). */
    app.post<{ Params: { sessionId: string } }>('/sessions/:sessionId/restart', async (req) => {
      const { participant, room } = await ctx.requireParticipant(req)
      const session = await openSession(room.id, req.params.sessionId)
      if (session.status !== 'aberta') throw new HttpError(409, 'Esta sessão já foi encerrada.')
      await assertNotDone(session.id, participant.id)
      await db.delete(responses).where(and(eq(responses.sessionId, session.id), eq(responses.participantId, participant.id)))
      return { ok: true }
    })

    /** Conclui a partida: o servidor recalcula a pontuação a partir das respostas registradas. */
    app.post<{ Params: { sessionId: string } }>('/sessions/:sessionId/complete', async (req) => {
      const { participant, room } = await ctx.requireParticipant(req)
      const session = await openSession(room.id, req.params.sessionId)
      if (session.status !== 'aberta') throw new HttpError(409, 'Esta sessão já foi encerrada.')
      await assertNotDone(session.id, participant.id)
      const history = await db
        .select({ storyId: responses.storyId, nodeId: responses.nodeId, choiceIndex: responses.choiceIndex })
        .from(responses)
        .where(and(eq(responses.sessionId, session.id), eq(responses.participantId, participant.id)))
        .orderBy(asc(responses.createdAt))
      if (!storiesFinished(session.storyIds, history)) throw new GameError('Termine todas as histórias antes de concluir.')
      return saveResult(session.id, participant.id, scoresFromResponses(history))
    })

    app.post<{ Params: { sessionId: string } }>('/sessions/:sessionId/checkin', async (req) => {
      const { participant, room } = await ctx.requireParticipant(req)
      const session = await openSession(room.id, req.params.sessionId)
      if (session.status !== 'aberta') throw new HttpError(409, 'Esta sessão já foi encerrada.')
      if (session.activity !== 'checkin') throw new GameError('Esta sessão não é um check-in.')
      await assertNotDone(session.id, participant.id)
      const body = checkinBody.parse(req.body)
      return saveResult(session.id, participant.id, scoresFromCheckin(body.items))
    })

    /** O próprio resultado (cada jovem vê apenas o seu). */
    app.get<{ Params: { sessionId: string } }>('/sessions/:sessionId/mine', async (req) => {
      const { participant, room } = await ctx.requireParticipant(req)
      const session = await openSession(room.id, req.params.sessionId)
      const [mine] = await db
        .select({ scores: results.scores, dominant: results.dominant })
        .from(results)
        .where(and(eq(results.sessionId, session.id), eq(results.participantId, participant.id)))
      if (!mine) throw new HttpError(404, 'Você ainda não concluiu esta atividade.')
      return { session: sessionSummary(session), ...mine }
    })

    /** Resultado da turma: sempre anonimizado (só sessões encerradas e com k participantes). */
    app.get<{ Params: { sessionId: string } }>('/sessions/:sessionId/group', async (req) => {
      const { room } = await ctx.requireParticipant(req)
      const session = await openSession(room.id, req.params.sessionId)
      const [agg] = await db.select().from(sessionAggregates).where(eq(sessionAggregates.sessionId, session.id))
      return { stats: publicStats(session, agg, Math.max(room.minGroupSize, config.minK)), minGroupSize: Math.max(room.minGroupSize, config.minK) }
    })

    /** Direito de exclusão: o jovem apaga a própria participação e tudo ligado a ela. */
    app.delete('/me', async (req) => {
      const { participant } = await ctx.requireParticipant(req)
      const affected = await db.select({ sessionId: results.sessionId }).from(results).where(eq(results.participantId, participant.id))
      await db.delete(participants).where(eq(participants.id, participant.id))
      for (const s of affected) await refreshAggregate(db, s.sessionId)
      return { ok: true }
    })
  }
