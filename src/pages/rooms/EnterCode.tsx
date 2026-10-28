import { useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { EmotionAvatar } from '../../components/EmotionAvatar'
import { Alert } from '../../components/forms'
import { btnPrimary } from '../../components/ui'
import { navigate } from '../../hooks/useHashRoute'

/** Aceita o código puro ("abc 123") ou o link inteiro colado (".../#/sala/ABC123"). */
const normalize = (input: string) => (input.match(/sala\/([A-Za-z0-9]+)/)?.[1] ?? input).replace(/[^A-Za-z0-9]/g, '').toUpperCase()

/** Entrada dos jovens digitando o código: #/sala */
export function EnterCode() {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    const code = normalize(value)
    if (!code) return setError('Digite o código que aparece na tela ou que você recebeu.')
    setBusy(true)
    setError(null)
    try {
      await api.publicRoom(code)
      navigate(`/sala/${code}`)
    } catch {
      setError('Não encontramos uma sala com esse código. Confira as letras e os números e tente de novo.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-4 pt-6 pb-10">
      <EmotionAvatar id="alegria" size={96} animated className="mx-auto" />
      <h1 className="mt-3 text-center font-display text-[2rem] leading-tight font-extrabold">Entrar numa sala</h1>
      <p className="mt-2 text-center text-lg text-ink/75">Digite o código que quem conduz a atividade mostrou para a turma.</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <label htmlFor="codigo-sala" className="sr-only">
          Código da sala
        </label>
        <input
          id="codigo-sala"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="EX.: K7M2P9QX4R"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          autoFocus
          aria-invalid={error ? true : undefined}
          className="min-h-16 w-full rounded-2xl border-2 border-ink/15 bg-white px-4 text-center font-display text-2xl font-extrabold tracking-[0.15em] uppercase transition outline-none placeholder:text-ink/30 focus:border-brand"
        />
        {error && <Alert>{error}</Alert>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {busy ? 'Procurando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/70">Não precisa criar conta. Se tiver o QR Code, é só apontar a câmera do celular.</p>
    </div>
  )
}
