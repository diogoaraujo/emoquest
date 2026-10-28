// Valida o banco de perguntas (src/data/perguntas/<tema>/<faixa>/<NNN>.json). Uso: npm run perguntas:check
// Com --chunks <pasta>, valida lotes ainda sem id (arquivos *.json com listas de perguntas).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const EMOTIONS = ['alegria', 'tristeza', 'raiva', 'medo', 'nojinho', 'ansiedade', 'inveja', 'vergonha', 'tedio', 'nostalgia']
const THEMES = ['escola', 'amizades', 'familia', 'amor', 'quem-sou', 'futuro', 'respeito', 'momentos-dificeis', 'conquistas', 'tempo-livre']
const BANDS = ['13-16', '17-23']
const SHARD_MAX = 250
const REPEATED_MIN = 25
const optionTexts = []
const EMOTION_WORDS = /\b(alegria|tristeza|raiva|medo|nojo|nojinho|ansiedade|inveja|vergonha|t[ée]dio|nostalgia)\b/i

const chunkMode = process.argv[2] === '--chunks'
const root = chunkMode ? process.argv[3] : 'src/data/perguntas'
const errors = []
const warnings = []
// Heurística (só avisa): verbos de estado seguidos de adjetivos que marcam gênero de quem joga.
const GENDERED_OPTION = /\b(sozinh[oa]s?|sentad[oa]|calad[oa]|deitad[oa]|quiet[oa]|parad[oa] (na|no|em|olhando)|encolhid[oa]|de olhos fechados e (calad|quiet)[oa])\b/i
const GENDERED =
  /\b(ficar|fica|ficou|estar|está|estava|sentir-se|se sentir|se sente|sentindo-se|parecer)\s+(muito\s+|tão\s+|meio\s+)?(sozinh|preocupad|chatead|cansad|nervos|envergonhad|animad|orgulhos|ansios|perdid|convidad|escolhid|excluíd|irritad|frustrad|magoad|assustad|confus|empolgad|aliviad|culpad|isolad|obrigad|emocionad|decepcionad|tranquil|calm|sobrecarregad)(o|a|os|as)\b/i
const seenText = new Map()
const seenId = new Set()
const counts = {}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim()
const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : f.endsWith('.json') ? [join(dir, f)] : []))

// Mesma regra do jogo (strongestEffect): maior valor; no empate, a que vem primeiro em EMOTIONS.
function strongest(effects) {
  let best = null
  for (const id of EMOTIONS) if ((effects[id] ?? 0) > (best ? effects[best] : 0)) best = id
  return best
}

function check(q, where) {
  const err = (m) => errors.push(`${where}: ${m}`)
  if (!chunkMode) {
    if (typeof q.id !== 'string' || !/^[a-z-]+-\d\d-\d\d-\d{5}$/.test(q.id)) err(`id inválido (${q.id})`)
    else if (seenId.has(q.id)) err(`id repetido (${q.id})`)
    seenId.add(q.id)
  }
  if (typeof q.text !== 'string' || q.text.length < 40 || q.text.length > 260) err(`texto deve ter 40–260 caracteres (${q.text?.length})`)
  if (!Array.isArray(q.choices) || q.choices.length !== 3) return err('precisa de exatamente 3 opções')
  const tops = new Set()
  q.choices.forEach((c, i) => {
    if (typeof c.text !== 'string' || c.text.length < 3 || c.text.length > 110) err(`opção ${i + 1}: texto deve ter 3–110 caracteres`)
    const entries = Object.entries(c.effects ?? {})
    if (entries.length < 1 || entries.length > 2) err(`opção ${i + 1}: use 1 ou 2 emoções`)
    for (const [k, v] of entries) {
      if (!EMOTIONS.includes(k)) err(`opção ${i + 1}: emoção desconhecida "${k}"`)
      if (!Number.isInteger(v) || v < 1 || v > 3) err(`opção ${i + 1}: valor de ${k} deve ser 1–3`)
    }
    if (entries.reduce((s, [, v]) => s + v, 0) > 4) err(`opção ${i + 1}: soma dos efeitos acima de 4`)
    // A opção descreve o que a pessoa FAZ ou PENSA; se ela nomeia a emoção, o jogo fica óbvio.
    if (typeof c.text === 'string' && /^(sentir|sente|sentindo)\b/i.test(c.text)) err(`opção ${i + 1}: não comece com "Sentir" — descreva uma ação ou pensamento ("${c.text}")`)
    if (typeof c.text === 'string') optionTexts.push([`${where}/${i + 1}`, c.text])
    const named = typeof c.text === 'string' && c.text.match(EMOTION_WORDS)
    if (named) warnings.push(`${where}: opção ${i + 1} nomeia a emoção ("${named[0]}") — mostre a reação em vez de dizê-la`)
    tops.add(strongest(c.effects ?? {}))
  })
  if (tops.size !== 3) err('a emoção mais forte deve ser diferente em cada opção')
  // Opção curta demais ("Sentir raiva") quase sempre é uma reação genérica: peça uma ação concreta.
  q.choices.forEach((c, i) => {
    if (typeof c.text === 'string' && c.text.length < 20) warnings.push(`${where}: opção ${i + 1} curta e genérica ("${c.text}") — descreva uma reação concreta`)
  })
  for (const t of [q.text, ...q.choices.map((c) => c.text)]) {
    const m = typeof t === 'string' && t.match(GENDERED)
    if (m) warnings.push(`${where}: possível marca de gênero de quem joga ("${m[0]}")`)
  }
  // "decidido(a)", "cansada\o", "sozinho/a": marcação de gênero improvisada, proibida.
  for (const t of [q.text, ...q.choices.map((c) => c.text)])
    if (typeof t === 'string' && /\p{L}(\\[oa]|\([oa]\)|\/[oa])(?!\p{L})/u.test(t)) err(`marcação de gênero improvisada em "${t.slice(0, 60)}" — reescreva de forma neutra`)
  // Nas opções quem age é sempre quem joga: estes adjetivos soltos quase sempre se referem a essa pessoa.
  for (const c of q.choices) {
    const m = typeof c.text === 'string' && c.text.match(GENDERED_OPTION)
    if (m) warnings.push(`${where}: possível marca de gênero de quem joga na opção ("${m[0]}")`)
  }
  const key = norm(q.text ?? '')
  if (seenText.has(key)) err(`texto repetido (igual a ${seenText.get(key)})`)
  else seenText.set(key, where)
}

for (const file of files(root)) {
  const rel = relative(root, file).replaceAll('\\', '/')
  let list
  try {
    list = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(`${rel}: JSON inválido (${e.message})`)
    continue
  }
  if (!Array.isArray(list)) {
    errors.push(`${rel}: o arquivo deve conter uma lista`)
    continue
  }
  if (!chunkMode) {
    const [theme, band, shard] = rel.replace(/\.json$/, '').split('/')
    if (!THEMES.includes(theme) || !BANDS.includes(band) || !/^\d{3}$/.test(shard ?? '')) errors.push(`${rel}: caminho deve ser <tema>/<faixa>/<NNN>.json`)
    if (list.length > SHARD_MAX) errors.push(`${rel}: no máximo ${SHARD_MAX} perguntas por arquivo`)
    for (const q of list) if (typeof q.id === 'string' && !q.id.startsWith(`${theme}-${band}-`)) errors.push(`${rel}: id ${q.id} não corresponde ao tema/faixa`)
    counts[`${theme} ${band}`] = (counts[`${theme} ${band}`] ?? 0) + list.length
  } else counts[rel] = list.length
  list.forEach((q, i) => check(q, `${rel}#${i + 1}`))
}

// Opções que começam sempre igual (ex.: "Procurar alguém da família...") indicam texto em série, sem a cena.
const openings = new Map()
for (const [where, text] of optionTexts) {
  const key = norm(text).split(' ').slice(0, 4).join(' ')
  if (!openings.has(key)) openings.set(key, [])
  openings.get(key).push(where)
}
for (const [key, list] of openings)
  if (list.length >= REPEATED_MIN && list.length > optionTexts.length * 0.01)
    warnings.push(`${list.length} opções começam com "${key}..." (ex.: ${list.slice(0, 3).join(', ')}) — reescreva com reações próprias de cada cena`)

const total = Object.values(counts).reduce((a, b) => a + b, 0)
if (!chunkMode)
  for (const t of THEMES) console.log(`${t.padEnd(18)} ${BANDS.map((b) => `${b}: ${String(counts[`${t} ${b}`] ?? 0).padStart(5)}`).join('  ')}`)
console.log(`\nTotal: ${total} perguntas, ${errors.length} problema(s).`)
for (const e of errors.slice(0, 50)) console.log(' - ' + e)
if (errors.length > 50) console.log(` ... e mais ${errors.length - 50}`)
if (warnings.length) {
  console.log(`\n${warnings.length} aviso(s) — revise e reescreva:`)
  for (const w of warnings.slice(0, 30)) console.log(' ~ ' + w)
  if (warnings.length > 30) console.log(` ... e mais ${warnings.length - 30}`)
}
process.exit(errors.length ? 1 : 0)
