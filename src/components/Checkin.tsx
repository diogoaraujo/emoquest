import { useState } from 'react'
import { EMOTIONS, getEmotion } from '../data/emotions'
import type { EmotionId } from '../types'
import { EmotionAvatar } from './EmotionAvatar'
import { Alert } from './forms'
import { btnPrimary, haptic } from './ui'

const LEVELS = [
  { v: 1, label: 'Um pouco' },
  { v: 2, label: 'Bastante' },
  { v: 3, label: 'Muito' },
]

/** Atividade "Como você está hoje?": até 3 emoções, cada uma com intensidade. */
export function Checkin({ title, onSubmit }: { title: string; onSubmit: (items: { emotion: EmotionId; intensity: number }[]) => Promise<void> }) {
  const [picked, setPicked] = useState<{ emotion: EmotionId; intensity: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function toggle(id: EmotionId) {
    haptic()
    setPicked((list) => (list.some((p) => p.emotion === id) ? list.filter((p) => p.emotion !== id) : list.length >= 3 ? list : [...list, { emotion: id, intensity: 2 }]))
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await onSubmit(picked)
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-6">
      <p className="text-sm font-extrabold tracking-wide text-brand uppercase">Check-in emocional</p>
      <h1 className="font-display text-[1.75rem] leading-tight font-extrabold">{title}</h1>
      <p className="mt-1 text-lg text-ink/80">Como você está se sentindo agora? Escolha até 3 emoções. Não existe resposta certa.</p>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {EMOTIONS.map((e) => {
          const on = picked.some((p) => p.emotion === e.id)
          const full = !on && picked.length >= 3
          return (
            <li key={e.id}>
              <button
                onClick={() => toggle(e.id)}
                aria-pressed={on}
                disabled={full}
                className={`flex w-full flex-col items-center rounded-3xl p-3 transition active:scale-95 disabled:opacity-40 ${on ? 'ring-4' : 'ring-1 ring-ink/10'}`}
                style={{ background: e.corSuave, ['--tw-ring-color' as string]: on ? e.corForte : undefined }}
              >
                <EmotionAvatar id={e.id} size={72} animated={on} />
                <span className="font-display text-lg font-extrabold" style={{ color: e.corForte }}>
                  {e.nome}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {picked.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="font-display text-xl font-extrabold">Com que intensidade?</h2>
          {picked.map((p) => {
            const e = getEmotion(p.emotion)
            return (
              <fieldset key={p.emotion} className="rounded-3xl bg-white p-4 ring-1 ring-ink/10">
                <legend className="sr-only">Intensidade de {e.nome}</legend>
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <EmotionAvatar id={p.emotion} size={32} /> {e.nome}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l.v}
                      onClick={() => setPicked((list) => list.map((x) => (x.emotion === p.emotion ? { ...x, intensity: l.v } : x)))}
                      aria-pressed={p.intensity === l.v}
                      className={`min-h-12 rounded-2xl font-bold transition active:scale-95 ${p.intensity === l.v ? 'bg-ink text-white' : 'bg-paper ring-1 ring-ink/10'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )
          })}
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="h-24 sm:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
        <button onClick={submit} disabled={!picked.length || busy} className={`${btnPrimary} disabled:opacity-50`}>
          {busy ? 'Enviando...' : 'Enviar meu check-in'}
        </button>
      </div>
    </div>
  )
}
