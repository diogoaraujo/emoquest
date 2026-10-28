import { useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { logout, useAuth } from '../../api/auth'
import { useAsync } from '../../api/useAsync'
import { EmotionAvatar } from '../../components/EmotionAvatar'
import { Alert, Card, Checkbox, Field, Spinner } from '../../components/forms'
import { btnPrimary, btnSecondary } from '../../components/ui'
import { navigate } from '../../hooks/useHashRoute'

export function RoomsList() {
  const user = useAuth()
  const { data, error, loading } = useAsync(() => api.rooms(), [])
  const [creating, setCreating] = useState(false)

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold tracking-wide text-brand uppercase">Olá, {user?.name.split(' ')[0]}</p>
          <h1 className="font-display text-[2rem] leading-tight font-extrabold">Minhas salas</h1>
        </div>
        <button onClick={() => logout().then(() => navigate('/entrar'))} className="min-h-12 rounded-full px-4 font-bold ring-1 ring-ink/15 hover:bg-ink/5">
          Sair
        </button>
      </div>
      <p className="mt-2 text-lg text-ink/80">
        Cada sala é um grupo permanente (por exemplo, uma turma). Dentro dela você aplica várias sessões ao longo do tempo e acompanha a evolução.
      </p>

      <div className="mt-5">
        {creating ? (
          <CreateRoom onCancel={() => setCreating(false)} onCreated={(id) => navigate(`/painel/sala/${id}`)} />
        ) : (
          <button onClick={() => setCreating(true)} className={btnPrimary}>
            + Nova sala
          </button>
        )}
      </div>

      <div className="mt-6">
        {loading && !data && <Spinner />}
        {error && <Alert>{error.message}</Alert>}
        {data && data.rooms.length === 0 && !creating && (
          <div className="flex flex-col items-center rounded-[1.75rem] bg-white p-8 text-center ring-1 ring-ink/5">
            <EmotionAvatar id="alegria" size={96} animated />
            <p className="mt-2 font-display text-xl font-extrabold">Crie sua primeira sala</p>
            <p className="text-ink/70">Depois é só compartilhar o QR Code com o grupo.</p>
          </div>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {data?.rooms.map((r) => (
            <li key={r.id}>
              <a
                href={`#/painel/sala/${r.id}`}
                className="flex h-full flex-col rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-ink/5 transition active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:shadow-md"
              >
                <h2 className="font-display text-xl leading-tight font-extrabold">{r.name}</h2>
                {r.description && <p className="mt-1 line-clamp-2 text-ink/70">{r.description}</p>}
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-base font-bold text-ink/75">
                  <span>👥 {r.participants} participantes</span>
                  <span>🎮 {r.sessions} sessões</span>
                </p>
                <span className="mt-3 font-extrabold text-brand">Abrir sala →</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CreateRoom({ onCancel, onCreated }: { onCancel: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ack, setAck] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { room } = await api.createRoom({ name, description, legalBasisAck: ack })
      onCreated(room.id)
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Card title="Nova sala">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nome da sala" placeholder="Ex.: 1º ano B — 2026" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        <Field label="Descrição (opcional)" placeholder="Ex.: Projeto de vida, terças às 10h" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
        <Checkbox checked={ack} onChange={setAck}>
          Declaro que tenho autorização da instituição e, quando necessário, dos responsáveis legais para aplicar esta atividade com adolescentes, e que
          os dados serão usados apenas para fins educativos e de acompanhamento do grupo.
        </Checkbox>
        <p className="text-sm text-ink/70">
          Por padrão, resultados de grupo só aparecem para outras pessoas com no mínimo 5 participantes e os dados individuais são guardados por 365 dias.
          Você pode ajustar isso depois.
        </p>
        {error && <Alert>{error}</Alert>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-60`}>
            {busy ? 'Criando...' : 'Criar sala'}
          </button>
          <button type="button" onClick={onCancel} className={btnSecondary}>
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  )
}
