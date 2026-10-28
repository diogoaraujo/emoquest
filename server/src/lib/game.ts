/**
 * Regras do jogo no servidor. Reaproveita as mesmas histórias e emoções do frontend,
 * mas recalcula tudo aqui: o cliente só informa "qual escolha", nunca pontos.
 */
import { STORIES, getStory } from '../../../src/data/stories'
import { ageProfile, MAX_AGE, MIN_AGE } from '../../../src/lib/age'
import { groupFormat, type GroupFormat } from '../../../src/lib/groupFormat'
import { addEffects, emptyScores, rankEmotions } from '../../../src/lib/scoring'
import { EMOTION_IDS, type EmotionId, type Scores } from '../../../src/types'

export { ageProfile, EMOTION_IDS, MAX_AGE, MIN_AGE, STORIES, getStory, groupFormat, type EmotionId, type GroupFormat, type Scores }

export const isEmotionId = (v: string): v is EmotionId => (EMOTION_IDS as readonly string[]).includes(v)

export interface StoredResponse {
  storyId: string
  nodeId: string
  choiceIndex: number
}

export class GameError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

/**
 * Valida uma nova escolha contra o caminho já percorrido naquela história:
 * o nó precisa ser o início (primeira escolha) ou o destino da escolha anterior.
 */
export function validateChoice(storyIds: string[], history: StoredResponse[], next: StoredResponse) {
  if (!storyIds.includes(next.storyId)) throw new GameError('História não faz parte desta sessão.')
  const story = getStory(next.storyId)
  if (!story) throw new GameError('História inexistente.')
  const node = story.nodes[next.nodeId]
  if (!node?.choices) throw new GameError('Momento inválido.')
  const choice = node.choices[next.choiceIndex]
  if (!choice) throw new GameError('Escolha inválida.')

  const path = history.filter((h) => h.storyId === next.storyId)
  const last = path.at(-1)
  const expectedNode = last ? story.nodes[last.nodeId]?.choices?.[last.choiceIndex]?.next : story.start
  if (expectedNode !== next.nodeId) throw new GameError('Essa escolha não segue o caminho da história.', 409)

  return choice.effects as Partial<Scores>
}

/** A partida termina quando todas as histórias da sessão chegaram a um final. */
export function storiesFinished(storyIds: string[], history: StoredResponse[]): boolean {
  return storyIds.every((id) => {
    const story = getStory(id)
    const last = history.filter((h) => h.storyId === id).at(-1)
    if (!story || !last) return false
    const nextId = story.nodes[last.nodeId]?.choices?.[last.choiceIndex]?.next
    return nextId !== undefined && story.nodes[nextId]?.ending === true
  })
}

export function scoresFromResponses(history: StoredResponse[]): Scores {
  return history.reduce((acc, h) => {
    const effects = getStory(h.storyId)?.nodes[h.nodeId]?.choices?.[h.choiceIndex]?.effects ?? {}
    return addEffects(acc, effects)
  }, emptyScores())
}

/** Check-in: até 3 emoções com intensidade 1–3. */
export function scoresFromCheckin(items: { emotion: string; intensity: number }[]): Scores {
  const scores = emptyScores()
  const seen = new Set<string>()
  if (items.length < 1 || items.length > 3) throw new GameError('Escolha de 1 a 3 emoções.')
  for (const item of items) {
    if (!isEmotionId(item.emotion) || seen.has(item.emotion)) throw new GameError('Emoção inválida.')
    if (!Number.isInteger(item.intensity) || item.intensity < 1 || item.intensity > 3) throw new GameError('Intensidade inválida.')
    seen.add(item.emotion)
    scores[item.emotion] = item.intensity
  }
  return scores
}

export const dominantOf = (scores: Scores): EmotionId => rankEmotions(scores)[0].id
