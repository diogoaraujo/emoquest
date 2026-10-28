/**
 * Política de retenção (executada na inicialização e a cada 24h).
 *
 * Para cada sala, sessões mais antigas que `retention_days`:
 *  - se o agregado tem pelo menos k participantes, ele é mantido (é estatística anônima) e todas as
 *    respostas e resultados individuais da sessão são apagados;
 *  - se tem menos de k, a sessão inteira é apagada (o agregado ainda poderia identificar alguém).
 * Participantes sem atividade há mais de `retention_days` são apagados (com nome e tudo o mais).
 * Tokens de login expirados também são removidos.
 */
import { and, eq, inArray, lt, sql } from 'drizzle-orm'
import type { DB } from '../db/client'
import { authTokens, gameSessions, participants, responses, results, rooms, sessionAggregates } from '../db/schema'

export async function applyRetention(db: DB, minK: number, now = new Date()) {
  const summary = { sessionsAnonymized: 0, sessionsDeleted: 0, participantsDeleted: 0 }
  const allRooms = await db.select({ id: rooms.id, retentionDays: rooms.retentionDays, k: rooms.minGroupSize }).from(rooms)

  for (const room of allRooms) {
    const cutoff = new Date(now.getTime() - room.retentionDays * 86_400_000)
    const k = Math.max(room.k, minK)
    const expired = await db
      .select({ id: gameSessions.id, n: sessionAggregates.n })
      .from(gameSessions)
      .leftJoin(sessionAggregates, eq(sessionAggregates.sessionId, gameSessions.id))
      .where(and(eq(gameSessions.roomId, room.id), lt(gameSessions.createdAt, cutoff)))

    const keep = expired.filter((s) => (s.n ?? 0) >= k).map((s) => s.id)
    const drop = expired.filter((s) => (s.n ?? 0) < k).map((s) => s.id)

    if (keep.length) {
      await db.update(gameSessions).set({ status: 'encerrada', closedAt: sql`coalesce(${gameSessions.closedAt}, now())` }).where(inArray(gameSessions.id, keep))
      const r1 = await db.delete(responses).where(inArray(responses.sessionId, keep)).returning({ id: responses.id })
      const r2 = await db.delete(results).where(inArray(results.sessionId, keep)).returning({ id: results.id })
      if (r1.length || r2.length) summary.sessionsAnonymized += keep.length
    }
    if (drop.length) {
      await db.delete(gameSessions).where(inArray(gameSessions.id, drop))
      summary.sessionsDeleted += drop.length
    }
    const gone = await db
      .delete(participants)
      .where(and(eq(participants.roomId, room.id), lt(participants.lastSeenAt, cutoff)))
      .returning({ id: participants.id })
    summary.participantsDeleted += gone.length
  }

  await db.delete(authTokens).where(lt(authTokens.expiresAt, now))
  return summary
}
