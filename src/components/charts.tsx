/**
 * Gráficos do dashboard, feitos à mão em HTML/SVG (leves e responsivos).
 * - Identidade das emoções: cor do personagem + nome + avatar (cor nunca sozinha).
 * - Um único eixo por gráfico; grade discreta; textos sempre na cor de texto, não na cor da série.
 * - Toque/hover mostra os valores; tudo também está disponível em "Ver tabela".
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { getEmotion } from '../data/emotions'
import { EMOTION_IDS, type EmotionId } from '../types'
import { EmotionAvatar } from './EmotionAvatar'

export const COMPARE_COLORS = { a: '#6a45f5', b: '#e0782f' }

/** Moldura de gráfico com alternância gráfico/tabela. */
export function ChartFrame({ title, subtitle, table, children, busy }: { title: string; subtitle?: ReactNode; table: ReactNode; children: ReactNode; busy?: boolean }) {
  const [asTable, setAsTable] = useState(false)
  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-ink/5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight font-extrabold">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-ink/70">{subtitle}</p>}
        </div>
        <button
          onClick={() => setAsTable((v) => !v)}
          className="min-h-11 shrink-0 rounded-full px-3 text-sm font-bold ring-1 ring-ink/15 hover:bg-ink/5"
          aria-pressed={asTable}
        >
          {asTable ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>
      <div className={`transition-opacity ${busy ? 'opacity-50' : ''}`}>{asTable ? table : children}</div>
    </section>
  )
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-ink/15">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-extrabold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/5">
              {r.map((c, j) => (
                <td key={j} className={`py-2 pr-3 ${j > 0 ? 'tabular-nums' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface BarDatum {
  id: EmotionId
  value: number | null
  label: string
  detail?: string
}

/** Barras horizontais, uma por emoção, ordenadas da maior para a menor. */
export function EmotionBars({ data, max }: { data: BarDatum[]; max?: number }) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value ?? 0))
  const sorted = [...data].sort((a, b) => (b.value ?? -1) - (a.value ?? -1))
  return (
    <ul className="space-y-2.5">
      {sorted.map((d) => {
        const e = getEmotion(d.id)
        return (
          <li key={d.id}>
            <div
              tabIndex={0}
              className="group relative flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`${e.nome}: ${d.label}${d.detail ? `, ${d.detail}` : ''}`}
            >
              <EmotionAvatar id={d.id} size={32} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-base font-bold">
                  <span className="truncate">{e.nome}</span>
                  <span className="tabular-nums">{d.label}</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-ink/8">
                  {d.value !== null && (
                    <div className="h-full rounded-r-[4px] rounded-l-full transition-all duration-500 group-hover:brightness-110" style={{ width: `${(d.value / top) * 100}%`, background: e.cor }} />
                  )}
                </div>
              </div>
              {d.detail && (
                <span className="pointer-events-none absolute right-0 -top-9 z-10 hidden rounded-xl bg-ink px-3 py-1.5 text-sm font-bold whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block">
                  {d.detail}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Comparação entre duas sessões: duas barras finas por emoção, com valores sempre visíveis. */
export function CompareBars({ a, b, labelA, labelB }: { a: Record<EmotionId, number>; b: Record<EmotionId, number>; labelA: string; labelB: string }) {
  const top = Math.max(1, ...EMOTION_IDS.flatMap((id) => [a[id], b[id]]))
  const ids = [...EMOTION_IDS].sort((x, y) => b[y] + a[y] - (b[x] + a[x]))
  return (
    <div>
      <Legend items={[{ color: COMPARE_COLORS.a, label: labelA }, { color: COMPARE_COLORS.b, label: labelB }]} />
      <ul className="mt-3 space-y-3">
        {ids.map((id) => {
          const e = getEmotion(id)
          const diff = Math.round((b[id] - a[id]) * 10) / 10
          return (
            <li key={id} tabIndex={0} className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={`${e.nome}: ${labelA} ${a[id]}%, ${labelB} ${b[id]}%`}>
              <EmotionAvatar id={id} size={32} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-base font-bold">
                  <span className="truncate">{e.nome}</span>
                  <span className="text-sm text-ink/70 tabular-nums">
                    {diff > 0 ? '▲' : diff < 0 ? '▼' : '='} {diff > 0 ? '+' : ''}
                    {diff} p.p.
                  </span>
                </div>
                {[
                  { v: a[id], c: COMPARE_COLORS.a },
                  { v: b[id], c: COMPARE_COLORS.b },
                ].map((bar, i) => (
                  <div key={i} className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-ink/8">
                      <div className="h-full rounded-r-[4px] rounded-l-full transition-all duration-500" style={{ width: `${(bar.v / top) * 100}%`, background: bar.c }} />
                    </div>
                    <span className="w-12 text-right text-sm font-bold tabular-nums">{bar.v}%</span>
                  </div>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Legend({ items, line = false }: { items: { color: string; label: string }[]; line?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span className={line ? 'h-[3px] w-5 rounded-full' : 'h-3 w-3 rounded-[3px]'} style={{ background: it.color }} aria-hidden />
          {it.label}
        </li>
      ))}
    </ul>
  )
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  // Mede antes de pintar: o SVG nunca nasce mais largo que o contêiner (evita rolagem horizontal).
  useLayoutEffect(() => {
    if (!ref.current) return
    setWidth(ref.current.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

export interface EvolutionPoint {
  label: string
  date: string
  values: Partial<Record<EmotionId, number>>
}

/** Evolução no tempo (uma linha por emoção escolhida; máx. 3 para continuar legível). */
export function EvolutionChart({ points, emotions }: { points: EvolutionPoint[]; emotions: EmotionId[] }) {
  const { ref, width } = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const height = 220
  const pad = { l: 36, r: 12, t: 12, b: 30 }
  const innerW = Math.max(40, width - pad.l - pad.r)
  const innerH = height - pad.t - pad.b
  const maxV = Math.max(10, ...points.flatMap((p) => emotions.map((id) => p.values[id] ?? 0)))
  const yMax = Math.ceil(maxV / 10) * 10
  const x = (i: number) => pad.l + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => pad.t + innerH - (v / yMax) * innerH
  const ticks = [0, yMax / 2, yMax]
  // Rótulos do eixo X sem colisão: mostra no máximo ~1 a cada 56px.
  const every = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(innerW / 56))))

  function onPointer(ev: React.PointerEvent<SVGRectElement>) {
    const box = ev.currentTarget.getBoundingClientRect()
    const px = ev.clientX - box.left
    let best = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - pad.l - px) < Math.abs(x(best) - pad.l - px)) best = i
    })
    setHover(best)
  }

  const hp = hover !== null ? points[hover] : null

  return (
    <div>
      <Legend line items={emotions.map((id) => ({ color: getEmotion(id).cor, label: getEmotion(id).nome }))} />
      <div ref={ref} className="relative mt-3 min-h-[220px]">
        {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Evolução das emoções por sessão" className="block touch-pan-y">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + innerW} y1={y(t)} y2={y(t)} stroke="#2a2346" strokeOpacity={t === 0 ? 0.3 : 0.08} />
              <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#2a2346" fillOpacity="0.7">
                {t}%
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % every === 0 || i === points.length - 1 ? (
              <text
                key={i}
                x={x(i)}
                y={height - 8}
                textAnchor={points.length > 1 && i === 0 ? 'start' : points.length > 1 && i === points.length - 1 ? 'end' : 'middle'}
                fontSize="12"
                fill="#2a2346"
                fillOpacity="0.7"
              >
                {p.label}
              </text>
            ) : null,
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} stroke="#2a2346" strokeOpacity="0.35" />}
          {emotions.map((id) => {
            const color = getEmotion(id).cor
            const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.values[id] ?? 0)}`).join(' ')
            return (
              <g key={id}>
                <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={x(i)} cy={y(p.values[id] ?? 0)} r={hover === i ? 6 : 4.5} fill={color} stroke="#fff" strokeWidth="2" />
                ))}
              </g>
            )
          })}
          <rect
            x={pad.l}
            y={0}
            width={innerW}
            height={height}
            fill="transparent"
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={(ev) => ev.pointerType === 'mouse' && setHover(null)}
          />
        </svg>
        )}
        {hp && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-xl bg-ink px-3 py-2 text-sm text-white shadow-lg"
            style={{ left: Math.min(Math.max(0, x(hover) - 72), width - 150) }}
            role="status"
          >
            <p className="font-bold text-white/75">{hp.date}</p>
            {emotions.map((id) => (
              <p key={id} className="flex items-center gap-2">
                <span className="h-[3px] w-4 rounded-full" style={{ background: getEmotion(id).cor }} aria-hidden />
                <strong className="tabular-nums">{hp.values[id] ?? 0}%</strong>
                <span className="text-white/80">{getEmotion(id).nome}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <p className="text-sm font-bold text-ink/70">{label}</p>
      <p className="font-display text-3xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="text-sm text-ink/70">{hint}</p>}
    </div>
  )
}
