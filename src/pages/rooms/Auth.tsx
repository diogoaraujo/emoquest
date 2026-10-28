import { useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { setSession } from '../../api/auth'
import { EmotionAvatar } from '../../components/EmotionAvatar'
import { Alert, Checkbox, Field } from '../../components/forms'
import { btnPrimary } from '../../components/ui'
import { navigate } from '../../hooks/useHashRoute'

export function Auth({ mode }: { mode: 'entrar' | 'cadastro' }) {
  const isRegister = mode === 'cadastro'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = isRegister ? await api.register({ name, email, password, acceptTerms }) : await api.login({ email, password })
      setSession(res)
      navigate('/painel')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-10">
      <div className="flex items-center gap-3">
        <EmotionAvatar id="nostalgia" size={64} animated />
        <div>
          <p className="text-sm font-extrabold tracking-wide text-brand uppercase">Salas EmoQuest</p>
          <h1 className="font-display text-[2rem] leading-tight font-extrabold">{isRegister ? 'Criar conta' : 'Entrar'}</h1>
        </div>
      </div>
      <p className="mt-3 text-lg text-ink/80">
        Para professores, psicólogos e profissionais que conduzem grupos. Os jovens não precisam de conta: entram pelo link ou QR Code da sala.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {isRegister && <Field label="Seu nome" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <Field label="E-mail" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field
          label="Senha"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={isRegister ? 'Mínimo de 8 caracteres.' : undefined}
          required
        />
        {isRegister && (
          <Checkbox checked={acceptTerms} onChange={setAcceptTerms}>
            Li e aceito a{' '}
            <a href="#/privacidade" target="_blank" className="font-bold text-brand underline">
              política de privacidade
            </a>
            . Entendo que sou responsável pelos dados das salas que eu criar.
          </Checkbox>
        )}
        {error && <Alert>{error}</Alert>}
        <button type="submit" disabled={busy} className={`${btnPrimary} sm:w-full disabled:opacity-60`}>
          {busy ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center">
        {isRegister ? 'Já tem conta? ' : 'Ainda não tem conta? '}
        <a href={isRegister ? '#/entrar' : '#/cadastro'} className="inline-flex min-h-12 items-center font-extrabold text-brand underline-offset-4 hover:underline">
          {isRegister ? 'Entrar' : 'Criar conta grátis'}
        </a>
      </p>
    </div>
  )
}
