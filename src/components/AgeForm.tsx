import { useState, type FormEvent } from 'react'
import { AGE_BAND_LABEL, ageProfile, isValidAge, MAX_AGE, MIN_AGE, type AgeProfile } from '../lib/age'
import { Alert } from './forms'
import { btnPrimary } from './ui'

/** Pergunta a idade e devolve só a faixa etária. */
export function AgeForm({ onDone, compact = false }: { onDone: (profile: AgeProfile) => void; compact?: boolean }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const age = Number(value)
  const preview = value && isValidAge(age) ? ageProfile(age) : null

  function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!isValidAge(age)) return setError(`Digite sua idade em anos (entre ${MIN_AGE} e ${MAX_AGE}).`)
    onDone(ageProfile(age))
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-3' : 'space-y-4'} noValidate>
      <div>
        <label htmlFor="idade" className="mb-1 block font-display text-xl font-extrabold">
          Quantos anos você tem?
        </label>
        <p className="mb-2 text-ink/75">As perguntas mudam conforme a idade. Guardamos só a faixa etária, neste aparelho.</p>
        <div className="flex gap-2">
          <input
            id="idade"
            type="number"
            inputMode="numeric"
            min={MIN_AGE}
            max={MAX_AGE}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
            placeholder="Ex.: 15"
            aria-invalid={error ? true : undefined}
            aria-describedby="idade-faixa"
            className="min-h-14 w-28 rounded-2xl border-2 border-ink/15 bg-white px-4 text-center text-2xl font-extrabold transition outline-none focus:border-brand"
          />
          <button type="submit" className={`${btnPrimary} flex-1`}>
            Continuar
          </button>
        </div>
        <p id="idade-faixa" className="mt-2 min-h-6 text-sm font-bold text-ink/70" aria-live="polite">
          {preview && `Perguntas da faixa ${AGE_BAND_LABEL[preview.band]}${preview.under13 ? ', sem os temas sensíveis' : ''}.`}
        </p>
      </div>
      {error && <Alert>{error}</Alert>}
    </form>
  )
}
