/** Painel compartilhado (visualizadores autorizados): somente agregados anonimizados. */
import type { FastifyPluginAsync } from 'fastify'
import { asc, eq } from 'drizzle-orm'
import { HttpError, type AppContext } from '../app'
import { gameSessions, rooms, sessionAggregates } from '../db/schema'
import { combineShares, publicStats } from '../lib/analytics'

export const sharedRoutes =
  (ctx: AppContext): FastifyPluginAsync =>
  async (app) => {
    const { db, config } = ctx

    app.get<{ Params: { token: string } }>('/:token', async (req) => {
      const token = req.params.token
      if (!/^[\w-]{20,64}$/.test(token)) throw new HttpError(404, 'Painel não encontrado.')
      const [room] = await db.select().from(rooms).where(eq(rooms.shareToken, token)).limit(1)
      if (!room) throw new HttpError(404, 'Painel não encontrado ou compartilhamento desativado.')
      const k = Math.max(room.minGroupSize, config.minK)
      const rows = await db
        .select({ s: gameSessions, agg: sessionAggregates })
        .from(gameSessions)
        .leftJoin(sessionAggregates, eq(sessionAggregates.sessionId, gameSessions.id))
        .where(eq(gameSessions.roomId, room.id))
        .orderBy(asc(gameSessions.createdAt))
      const sessions = rows.map(({ s, agg }) => publicStats(s, agg ?? undefined, k))
      const visible = sessions.filter((s) => !s.suppressed)
      return {
        mode: 'public' as const,
        // Nenhum dado do responsável (e-mail) nem contagem exata de participantes.
        room: { name: room.name, minGroupSize: k },
        totals: {
          sessions: sessions.length,
          visibleSessions: visible.length,
          shares: combineShares(visible.map((s) => ({ n: s.nAtLeast ?? 0, shares: s.shares! }))),
        },
        sessions,
      }
    })
  }
