import { getEmotion } from '../data/emotions'
import { rankEmotions } from '../lib/scoring'
import type { Scores } from '../types'
import { EmotionAvatar } from './EmotionAvatar'

export function ScoreBars({ scores, compact = false }: { scores: Scores; compact?: boolean }) {
  const ranked = rankEmotions(scores)
  const max = Math.max(1, ranked[0].value)

  return (
    <ul className={compact ? 'space-y-1.5' : 'space-y-3'}>
      {ranked.map(({ id, value, percent }) => {
        const e = getEmotion(id)
        return (
          <li key={id} className="flex items-center gap-3">
            <EmotionAvatar id={id} size={compact ? 28 : 40} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-base font-bold">
                <span className="truncate">
                  {e.nome}
                  {!compact && <span className="font-semibold text-ink/70"> · {e.personagem}</span>}
                </span>
                <span className="tabular-nums text-ink/75">{compact ? value : `${percent}%`}</span>
              </div>
              <div className={`${compact ? 'h-2' : 'h-3'} mt-1 overflow-hidden rounded-full bg-ink/10`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, background: e.cor }} />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
