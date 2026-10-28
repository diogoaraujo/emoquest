/**
 * Estatísticas e anonimização.
 *
 * Os gráficos leem apenas `session_aggregates` (sem identificadores). Para quem NÃO é o responsável
 * (participantes e painel compartilhado), aplicamos ainda, na leitura:
 *  1. Só sessões ENCERRADAS — impede o "ataque de diferença" (comparar o agregado antes e depois
 *     de uma pessoa terminar para descobrir o resultado dela).
 *  2. Limiar k (min_group_size, nunca abaixo de 5): sessões com menos participantes são suprimidas.
 *  3. Supressão de células pequenas: emoção predominante de menos de 3 pessoas não é exibida.
 *  4. Generalização: percentuais arredondados (1% nas médias, 5% nas contagens) e n em faixas.
 */
import { eq } from 'drizzle-orm'
import type { DB } from '../db/client'
import { results, sessionAggregates } from '../db/schema'
import { EMOTION_IDS, type EmotionId } from './game'

export type EmotionMap = Record<EmotionId, number>
const zeros = (): EmotionMap => Object.fromEntries(EMOTION_IDS.map((id) => [id, 0])) as EmotionMap

export const MIN_CELL = 3

/** Recalcula o agregado de uma sessão a partir dos resultados individuais atuais. */
export async function refreshAggregate(db: DB, sessionId: string) {
  const rows = await db.select({ scores: results.scores, dominant: results.dominant }).from(results).where(eq(results.sessionId, sessionId))
  const shareSums = zeros()
  const dominantCounts = zeros()
  for (const r of rows) {
    const total = EMOTION_IDS.reduce((s, id) => s + (r.scores[id] ?? 0), 0) || 1
    for (const id of EMOTION_IDS) shareSums[id] += (r.scores[id] ?? 0) / total
    if (r.dominant in dominantCounts) dominantCounts[r.dominant as EmotionId] += 1
  }
  const values = { n: rows.length, shareSums, dominantCounts, updatedAt: new Date() }
  await db
    .insert(sessionAggregates)
    .values({ sessionId, ...values })
    .onConflictDoUpdate({ target: sessionAggregates.sessionId, set: values })
}

export interface SessionMeta {
  id: string
  title: string
  activity: string
  status: string
  createdAt: Date
  closedAt: Date | null
}

export interface AggregateRow {
  n: number
  shareSums: Record<string, number>
  dominantCounts: Record<string, number>
}

/** Visão completa (apenas para o responsável): valores exatos, inclusive de sessões abertas. */
export interface OwnerSessionStats {
  id: string
  title: string
  activity: string
  status: string
  date: string
  n: number
  /** % médio de cada emoção nos resultados (0–100, 1 casa). */
  shares: EmotionMap
  /** Pessoas por emoção predominante. */
  dominant: EmotionMap
}

export function ownerStats(meta: SessionMeta, agg: AggregateRow | undefined): OwnerSessionStats {
  const n = agg?.n ?? 0
  const shares = zeros()
  const dominant = zeros()
  for (const id of EMOTION_IDS) {
    shares[id] = n ? Math.round(((agg!.shareSums[id] ?? 0) / n) * 1000) / 10 : 0
    dominant[id] = agg?.dominantCounts[id] ?? 0
  }
  return { id: meta.id, title: meta.title, activity: meta.activity, status: meta.status, date: (meta.closedAt ?? meta.createdAt).toISOString(), n, shares, dominant }
}

/** Visão anonimizada (participantes e painel compartilhado). */
export interface PublicSessionStats {
  id: string
  title: string
  activity: string
  date: string
  suppressed: boolean
  /** Motivo da supressão, para explicar na interface. */
  reason?: 'aberta' | 'poucos-participantes'
  /** Faixa de participantes (ex.: 10 = "10 ou mais"), nunca o número exato. */
  nAtLeast: number | null
  shares: EmotionMap | null
  /** % de pessoas por emoção predominante, em passos de 5%; null = célula suprimida. */
  dominantPct: Record<EmotionId, number | null> | null
}

export function publicStats(meta: SessionMeta, agg: AggregateRow | undefined, k: number): PublicSessionStats {
  const base = { id: meta.id, title: meta.title, activity: meta.activity, date: (meta.closedAt ?? meta.createdAt).toISOString() }
  const n = agg?.n ?? 0
  if (meta.status !== 'encerrada') return { ...base, suppressed: true, reason: 'aberta', nAtLeast: null, shares: null, dominantPct: null }
  if (n < k) return { ...base, suppressed: true, reason: 'poucos-participantes', nAtLeast: null, shares: null, dominantPct: null }

  const shares = zeros()
  const dominantPct = {} as Record<EmotionId, number | null>
  for (const id of EMOTION_IDS) {
    shares[id] = Math.round(((agg!.shareSums[id] ?? 0) / n) * 100)
    const count = agg!.dominantCounts[id] ?? 0
    dominantPct[id] = count === 0 ? 0 : count < MIN_CELL ? null : Math.round((count / n) * 20) * 5
  }
  return { ...base, suppressed: false, nAtLeast: Math.floor(n / 5) * 5, shares, dominantPct }
}

/** Média ponderada de várias sessões (usada no total da sala). */
export function combineShares(stats: { n: number; shares: EmotionMap }[]): EmotionMap {
  const out = zeros()
  const total = stats.reduce((s, x) => s + x.n, 0)
  if (!total) return out
  for (const id of EMOTION_IDS) out[id] = Math.round((stats.reduce((s, x) => s + x.shares[id] * x.n, 0) / total) * 10) / 10
  return out
}
