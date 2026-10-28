export const EMOTION_IDS = [
  'alegria',
  'tristeza',
  'raiva',
  'medo',
  'nojinho',
  'ansiedade',
  'inveja',
  'vergonha',
  'tedio',
  'nostalgia',
] as const

export type EmotionId = (typeof EMOTION_IDS)[number]

export type Scores = Record<EmotionId, number>

export interface Emotion {
  id: EmotionId
  /** Nome da emoção, ex.: "Alegria" */
  nome: string
  /** Nome do personagem original, ex.: "Lumi" */
  personagem: string
  cor: string
  corSuave: string
  corForte: string
  frase: string
  descricao: string
  funcao: string
  sinais: string[]
  intensa: string
  acolher: string[]
  falas: string[]
  reflexao: string
}

export interface Choice {
  text: string
  effects: Partial<Scores>
  next: string
}

export interface StoryNode {
  text: string
  choices?: Choice[]
  ending?: boolean
}

export interface Story {
  id: string
  title: string
  tagline: string
  icon: string
  cover: EmotionId
  start: string
  nodes: Record<string, StoryNode>
}

export interface ChoiceLog {
  storyId: string
  choiceText: string
  effects: Partial<Scores>
}

export interface RunResult {
  scores: Scores
  storyIds: string[]
  log: ChoiceLog[]
  finishedAt: string
}
