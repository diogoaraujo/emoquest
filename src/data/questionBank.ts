import type { AgeBand, AgeProfile } from '../lib/age'
import type { BankQuestion, Story, ThemeId } from '../types'
import { getTheme, THEMES } from './stories'

/**
 * Banco de perguntas avulsas: src/data/perguntas/<tema>/<faixa>/<NNN>.json, com até 250 perguntas por arquivo.
 * Cada arquivo vira um pedaço separado do pacote; uma partida baixa só um ou poucos arquivos sorteados.
 */
const FILES = import.meta.glob<BankQuestion[]>('./perguntas/*/*/*.json', { import: 'default' })

export const QUICK_PLAY_SIZE = 10
export const ALL_THEMES = 'todos'
const STORY_PREFIX = 'perguntas:'

export const quickPlayStoryId = (themeId: string) => `${STORY_PREFIX}${themeId}`
export const quickPlayTheme = (storyId: string) => (storyId.startsWith(STORY_PREFIX) ? storyId.slice(STORY_PREFIX.length) : null)

/** Temas disponíveis para o perfil: menores de 13 não recebem os temas sensíveis. */
export const themesFor = (profile: AgeProfile) => THEMES.filter((t) => !(profile.under13 && t.sensivel))

/** Carrega um arquivo sorteado do tema e da faixa. */
async function loadShard(themeId: ThemeId, band: AgeBand): Promise<BankQuestion[]> {
  const prefix = `./perguntas/${themeId}/${band}/`
  const keys = Object.keys(FILES).filter((k) => k.startsWith(prefix))
  return keys.length ? await FILES[keys[Math.floor(Math.random() * keys.length)]]() : []
}

/** Em "todos os temas", sorteia alguns temas para não baixar o banco inteiro. */
const MIXED_THEMES = 5

// Evita repetir perguntas entre partidas seguidas (só neste aparelho; falhar aqui não atrapalha o jogo).
const SEEN_KEY = 'emoquest:perguntas-vistas'
const SEEN_MAX = 2000

function loadSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-SEEN_MAX)))
  } catch {
    /* ignora */
  }
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Sorteia uma partida rápida e a monta como uma história linear, para reaproveitar o Play e o Resultado. */
export async function drawQuickPlay(themeId: string, profile: AgeProfile, size = QUICK_PLAY_SIZE): Promise<Story | null> {
  const theme = themeId === ALL_THEMES ? null : getTheme(themeId)
  const themes = theme ? [theme] : shuffle(themesFor(profile)).slice(0, MIXED_THEMES)
  if (theme && profile.under13 && theme.sensivel) return null

  const pool = (await Promise.all(themes.map((t) => loadShard(t.id, profile.band)))).flat()
  if (pool.length === 0) return null

  const seen = loadSeen()
  const fresh = shuffle(pool.filter((q) => !seen.has(q.id)))
  const picked = [...fresh, ...shuffle(pool.filter((q) => seen.has(q.id)))].slice(0, size)
  for (const q of picked) seen.add(q.id)
  saveSeen(seen)

  const nodes: Story['nodes'] = {}
  picked.forEach((q, i) => {
    const next = i === picked.length - 1 ? 'fim' : `p${i + 1}`
    nodes[`p${i}`] = { text: q.text, choices: q.choices.map((c) => ({ text: c.text, effects: c.effects, next })) }
  })
  nodes.fim = {
    ending: true,
    text: 'Pronto! Não existem respostas certas: cada escolha mostrou um pouco de como você sente e reage. Veja o que suas emoções têm a dizer.',
  }

  return {
    id: quickPlayStoryId(themeId),
    title: theme ? `Partida rápida: ${theme.nome}` : 'Partida rápida',
    tagline: '',
    icon: theme?.icon ?? '⚡',
    cover: 'alegria',
    themes: theme ? [theme.id] : [],
    start: 'p0',
    nodes,
  }
}
