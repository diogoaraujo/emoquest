import { EMOTION_IDS, type EmotionId, type Scores } from '../types'

export const emptyScores = (): Scores =>
  Object.fromEntries(EMOTION_IDS.map((id) => [id, 0])) as Scores

export function addEffects(scores: Scores, effects: Partial<Scores>): Scores {
  const next = { ...scores }
  for (const id of EMOTION_IDS) next[id] += effects[id] ?? 0
  return next
}

export interface RankedEmotion {
  id: EmotionId
  value: number
  percent: number
}

/** Ordena as emoções da mais para a menos presente (empates mantêm a ordem original). */
export function rankEmotions(scores: Scores): RankedEmotion[] {
  const total = EMOTION_IDS.reduce((sum, id) => sum + scores[id], 0) || 1
  return EMOTION_IDS.map((id) => ({ id, value: scores[id], percent: Math.round((scores[id] / total) * 100) })).sort(
    (a, b) => b.value - a.value,
  )
}

/** Emoção que mais pesou numa escolha. */
export function strongestEffect(effects: Partial<Scores>): EmotionId {
  let best: EmotionId = 'alegria'
  let max = -Infinity
  for (const id of EMOTION_IDS) {
    const v = effects[id] ?? 0
    if (v > max) {
      max = v
      best = id
    }
  }
  return best
}
