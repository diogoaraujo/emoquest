import { useMemo, useState } from 'react'
import type { DashboardData, EmotionMap } from '../api/client'
import { getEmotion } from '../data/emotions'
import { EMOTION_IDS, type EmotionId } from '../types'
import { ChartFrame, CompareBars, DataTable, EmotionBars, EvolutionChart, Kpi } from './charts'
import { EmotionAvatar } from './EmotionAvatar'
import { Alert, shortDate, formatDate } from './forms'

/** Sessão normalizada para os gráficos, venha ela da visão do responsável ou da pública. */
interface ViewSession {
  id: string
  title: string
  date: string
  visible: boolean
  hiddenReason?: string
  /** Exato (responsável) ou faixa "n ou mais" (público). */
  nLabel: string
  shares: EmotionMap | null
  dominant: { id: EmotionId; value: number | null; label: string; detail?: string }[] | null
}

function normalize(data: DashboardData): ViewSession[] {
  if (data.mode === 'owner') {
    return data.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      visible: s.n > 0,
      hiddenReason: s.n === 0 ? 'Ninguém concluiu ainda.' : undefined,
      nLabel: `${s.n} ${s.n === 1 ? 'pessoa' : 'pessoas'}`,
      shares: s.shares,
      dominant: EMOTION_IDS.map((id) => ({
        id,
        value: s.dominant[id],
        label: `${s.dominant[id]}`,
        detail: s.n ? `${Math.round((s.dominant[id] / s.n) * 100)}% do grupo` : undefined,
      })),
    }))
  }
  return data.sessions.map((s) => ({
    id: s.id,
    title: s.title,
    date: s.date,
    visible: !s.suppressed,
    hiddenReason:
      s.reason === 'aberta' ? 'Sessão em andamento: o resultado aparece quando ela for encerrada.' : `Menos de ${data.room.minGroupSize} participantes: oculto para proteger a privacidade.`,
    nLabel: s.nAtLeast !== null ? `${s.nAtLeast} ou mais pessoas` : '—',
    shares: s.shares,
    dominant: s.dominantPct
      ? EMOTION_IDS.map((id) => {
          const v = s.dominantPct![id]
          return { id, value: v, label: v === null ? 'poucas' : `${v}%`, detail: v === null ? 'Menos de 3 pessoas: valor oculto' : undefined }
        })
      : null,
  }))
}

function combine(sessions: ViewSession[]): EmotionMap {
  const out = Object.fromEntries(EMOTION_IDS.map((id) => [id, 0])) as EmotionMap
  const vis = sessions.filter((s) => s.visible && s.shares)
  if (!vis.length) return out
  for (const id of EMOTION_IDS) out[id] = Math.round((vis.reduce((sum, s) => sum + s.shares![id], 0) / vis.length) * 10) / 10
  return out
}

export function DashboardView({ data, busy }: { data: DashboardData; busy?: boolean }) {
  const sessions = useMemo(() => normalize(data), [data])
  const visible = sessions.filter((s) => s.visible)
  const [selected, setSelected] = useState<string>('todas')
  const current = sessions.find((s) => s.id === selected)
  const shares = current ? current.shares : data.mode === 'owner' ? data.totals.shares : combine(sessions)

  const topIds = useMemo(() => [...EMOTION_IDS].sort((a, b) => (shares?.[b] ?? 0) - (shares?.[a] ?? 0)), [shares])
  const [chosen, setChosen] = useState<EmotionId[] | null>(null)
  const lineEmotions = chosen ?? topIds.slice(0, 2)
  const toggleEmotion = (id: EmotionId) =>
    setChosen((prev) => {
      const list = prev ?? lineEmotions
      if (list.includes(id)) return list.length > 1 ? list.filter((x) => x !== id) : list
      return [...list, id].slice(-3)
    })

  const [cmpA, setCmpA] = useState<string>('')
  const [cmpB, setCmpB] = useState<string>('')
  const a = visible.find((s) => s.id === cmpA) ?? visible.at(-2)
  const b = visible.find((s) => s.id === cmpB) ?? visible.at(-1)

  // Várias sessões no mesmo dia geram rótulos repetidos: nesse caso numeramos (S1, S2...).
  const uniqueDates = new Set(visible.map((s) => shortDate(s.date))).size === visible.length
  const evolution = visible.map((s, i) => ({ label: uniqueDates ? shortDate(s.date) : `S${i + 1}`, date: `${s.title} · ${formatDate(s.date)}`, values: (s.shares ?? {}) as Partial<EmotionMap> }))

  const dominantData = current?.dominant ?? (data.mode === 'owner' ? sumDominant(data) : null)

  return (
    <div className="space-y-4">
      {data.mode === 'public' && (
        <Alert tone="info">
          Painel anonimizado: mostra apenas sessões encerradas com pelo menos {data.room.minGroupSize} participantes. Números são arredondados e
          grupos muito pequenos ficam ocultos.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.mode === 'owner' ? (
          <>
            <Kpi label="Participantes" value={data.totals.participants} />
            <Kpi label="Sessões" value={data.totals.sessions} />
            <Kpi label="Atividades concluídas" value={data.totals.results} />
          </>
        ) : (
          <>
            <Kpi label="Sessões" value={data.totals.sessions} />
            <Kpi label="Com resultado visível" value={data.totals.visibleSessions} />
          </>
        )}
      </div>

      {/* Filtro único, acima de todos os gráficos. */}
      <div>
        <label htmlFor="filtro-sessao" className="mb-1 block font-bold">
          Mostrar
        </label>
        <select
          id="filtro-sessao"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="min-h-14 w-full rounded-2xl border-2 border-ink/15 bg-white px-4 text-lg sm:w-auto"
        >
          <option value="todas">Todas as sessões</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} · {formatDate(s.date)}
            </option>
          ))}
        </select>
      </div>

      {current && !current.visible ? (
        <Alert tone="info">{current.hiddenReason}</Alert>
      ) : !visible.length ? (
        <EmptyState />
      ) : (
        <>
          <ChartFrame
            busy={busy}
            title="Distribuição das emoções"
            subtitle={current ? `${current.title} · ${current.nLabel}` : 'Média de todas as sessões com resultado'}
            table={<DataTable head={['Emoção', '% médio']} rows={topIds.map((id) => [getEmotion(id).nome, `${shares?.[id] ?? 0}%`])} />}
          >
            <EmotionBars data={EMOTION_IDS.map((id) => ({ id, value: shares?.[id] ?? 0, label: `${shares?.[id] ?? 0}%`, detail: getEmotion(id).personagem }))} />
          </ChartFrame>

          {dominantData && (
            <ChartFrame
              busy={busy}
              title="Emoção predominante"
              subtitle={data.mode === 'owner' ? 'Quantas pessoas tiveram cada emoção como principal' : '% de pessoas por emoção principal (passos de 5%)'}
              table={
                <DataTable
                  head={['Emoção', data.mode === 'owner' ? 'Pessoas' : '% do grupo']}
                  rows={dominantData.filter((d) => d.value !== 0).map((d) => [getEmotion(d.id).nome, d.label])}
                />
              }
            >
              <EmotionBars data={dominantData.filter((d) => d.value !== 0)} />
            </ChartFrame>
          )}

          {visible.length >= 2 && (
            <ChartFrame
              busy={busy}
              title="Evolução ao longo do tempo"
              subtitle="Toque nas emoções para escolher até 3 e no gráfico para ver os valores."
              table={
                <DataTable
                  head={['Sessão', ...lineEmotions.map((id) => getEmotion(id).nome)]}
                  rows={evolution.map((p) => [p.date, ...lineEmotions.map((id) => `${p.values[id] ?? 0}%`)])}
                />
              }
            >
              <div className="mb-4 grid grid-cols-5 gap-1" role="group" aria-label="Emoções no gráfico">
                {EMOTION_IDS.map((id) => {
                  const on = lineEmotions.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleEmotion(id)}
                      aria-pressed={on}
                      aria-label={getEmotion(id).nome}
                      className={`flex min-h-12 items-center justify-center rounded-2xl transition active:scale-95 ${on ? 'bg-ink/10 ring-2 ring-ink' : 'opacity-60 ring-1 ring-ink/10'}`}
                    >
                      <EmotionAvatar id={id} size={34} />
                    </button>
                  )
                })}
              </div>
              <EvolutionChart points={evolution} emotions={lineEmotions} />
            </ChartFrame>
          )}

          {visible.length >= 2 && a && b && (
            <ChartFrame
              busy={busy}
              title="Comparar sessões"
              subtitle="Diferença em pontos percentuais (p.p.) entre as duas sessões."
              table={<DataTable head={['Emoção', a.title, b.title]} rows={EMOTION_IDS.map((id) => [getEmotion(id).nome, `${a.shares![id]}%`, `${b.shares![id]}%`])} />}
            >
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {[
                  { label: 'Sessão A', value: a.id, set: setCmpA },
                  { label: 'Sessão B', value: b.id, set: setCmpB },
                ].map((c) => (
                  <label key={c.label} className="block">
                    <span className="mb-1 block text-sm font-bold">{c.label}</span>
                    <select value={c.value} onChange={(e) => c.set(e.target.value)} className="min-h-12 w-full rounded-2xl border-2 border-ink/15 bg-white px-3 text-base">
                      {visible.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} · {shortDate(s.date)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <CompareBars a={a.shares!} b={b.shares!} labelA={`A · ${a.title}`} labelB={`B · ${b.title}`} />
            </ChartFrame>
          )}
        </>
      )}
    </div>
  )
}

function sumDominant(data: Extract<DashboardData, { mode: 'owner' }>) {
  const total = data.sessions.reduce((s, x) => s + x.n, 0)
  return EMOTION_IDS.map((id) => {
    const v = data.sessions.reduce((s, x) => s + x.dominant[id], 0)
    return { id, value: v, label: `${v}`, detail: total ? `${Math.round((v / total) * 100)}% das participações` : undefined }
  })
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-[1.75rem] bg-white p-8 text-center ring-1 ring-ink/5">
      <EmotionAvatar id="tedio" size={96} animated />
      <p className="mt-2 font-display text-xl font-extrabold">Ainda não há resultados para mostrar</p>
      <p className="text-ink/70">Os gráficos aparecem assim que houver atividades concluídas.</p>
    </div>
  )
}
