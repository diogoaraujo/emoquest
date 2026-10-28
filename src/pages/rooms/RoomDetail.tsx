import { useState, type FormEvent } from 'react'
import { api, type Activity, type Room } from '../../api/client'
import { useAsync } from '../../api/useAsync'
import { DashboardView } from '../../components/DashboardView'
import { Alert, Card, Checkbox, Field, Spinner, formatDate } from '../../components/forms'
import { QrCode } from '../../components/QrCode'
import { btnBrand, btnPrimary, btnSecondary } from '../../components/ui'
import { STORIES } from '../../data/stories'
import { navigate } from '../../hooks/useHashRoute'
import { AGE_BAND_LABEL } from '../../lib/age'
import { GROUP_FORMAT_LABEL, groupFormat } from '../../lib/groupFormat'

const TABS = [
  { id: 'sessoes', label: 'Sessões' },
  { id: 'painel', label: 'Painel' },
  { id: 'pessoas', label: 'Pessoas' },
  { id: 'ajustes', label: 'Ajustes' },
] as const
type Tab = (typeof TABS)[number]['id']

export function RoomDetail({ roomId, tab = 'sessoes' }: { roomId: string; tab?: string }) {
  const { data, error, setData } = useAsync(() => api.room(roomId), [roomId])
  const active: Tab = (TABS.find((t) => t.id === tab)?.id ?? 'sessoes') as Tab

  if (error) return <Page><Alert>{error.message}</Alert></Page>
  if (!data) return <Spinner />
  const room = data.room
  const update = (r: Room) => setData({ room: r })

  return (
    <Page>
      <a href="#/painel" className="inline-flex min-h-11 items-center font-bold text-ink/70">
        ← Minhas salas
      </a>
      <h1 className="font-display text-[2rem] leading-tight font-extrabold">{room.name}</h1>
      {room.description && <p className="text-lg text-ink/75">{room.description}</p>}

      {active === 'sessoes' && <Invite room={room} />}

      <nav className="sticky top-14 z-20 -mx-4 mt-5 bg-paper/95 px-4 py-2 backdrop-blur md:top-16" aria-label="Seções da sala">
        <ul className="grid grid-cols-4 gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
          {TABS.map((t) => (
            <li key={t.id}>
              <a
                href={`#/painel/sala/${room.id}/${t.id}`}
                aria-current={active === t.id ? 'page' : undefined}
                className={`flex min-h-11 items-center justify-center rounded-full text-sm font-extrabold transition sm:text-base ${active === t.id ? 'bg-ink text-white' : 'hover:bg-ink/5'}`}
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 animate-fade" key={active}>
        {active === 'sessoes' && <Sessions roomId={room.id} />}
        {active === 'painel' && <RoomDashboard roomId={room.id} />}
        {active === 'pessoas' && <People roomId={room.id} />}
        {active === 'ajustes' && <Settings room={room} onChange={update} />}
      </div>
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 pt-4 pb-10">{children}</div>
}

// ---------- Convite (link + QR) ----------

function Invite({ room }: { room: Room }) {
  const [projecting, setProjecting] = useState(false)
  // Endereço curto onde se digita o código, ex.: "emoquest.app/#/sala"
  const enterUrl = room.joinUrl.replace(/\/?#\/sala\/.*$/, '/#/sala').replace(/^https?:\/\//, '')
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(room.joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link:', room.joinUrl)
    }
  }

  return (
    <section className="mt-4 flex flex-col items-center gap-4 rounded-[1.75rem] bg-gradient-to-br from-[#EEE7FF] to-[#FFE3EE] p-5 sm:flex-row sm:items-center">
      <button onClick={() => setProjecting(true)} className="shrink-0 rounded-2xl transition active:scale-95" aria-label="Ampliar QR Code para projetar">
        <QrCode value={room.joinUrl} size={140} />
      </button>
      <div className="w-full min-w-0 text-center sm:text-left">
        <p className="font-bold text-ink/75">Código da sala</p>
        <p className="font-display text-3xl font-extrabold tracking-[0.15em] break-all">{room.joinCode}</p>
        <p className="mt-1 text-sm text-ink/70">
          Os jovens entram pelo QR Code, pelo link ou digitando o código em <strong className="break-all">{enterUrl}</strong> — sem criar conta.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button onClick={copy} className={btnSecondary}>
            {copied ? '✓ Link copiado' : 'Copiar link'}
          </button>
          <button onClick={() => setProjecting(true)} className={btnBrand}>
            Projetar QR Code
          </button>
        </div>
      </div>

      {projecting && (
        <div className="fixed inset-0 z-50 flex animate-fade flex-col items-center justify-center gap-4 bg-white p-6 text-center" role="dialog" aria-modal="true" aria-label="QR Code da sala">
          <p className="font-display text-2xl font-extrabold sm:text-4xl">Entre na sala “{room.name}”</p>
          <QrCode value={room.joinUrl} size={Math.min(window.innerWidth - 48, window.innerHeight - 260, 520)} />
          <p className="text-lg">
            ou acesse <strong className="break-all">{enterUrl}</strong> e digite o código
          </p>
          <p className="font-display text-4xl font-extrabold tracking-[0.2em] sm:text-6xl">{room.joinCode}</p>
          <button onClick={() => setProjecting(false)} className={btnPrimary} autoFocus>
            Fechar
          </button>
        </div>
      )}
    </section>
  )
}

// ---------- Sessões ----------

function Sessions({ roomId }: { roomId: string }) {
  const { data, error, reload } = useAsync(() => api.sessions(roomId), [roomId])
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-4">
      {creating ? (
        <CreateSession
          roomId={roomId}
          onDone={() => {
            setCreating(false)
            reload()
          }}
        />
      ) : (
        <button onClick={() => setCreating(true)} className={btnPrimary}>
          + Nova sessão
        </button>
      )}
      {error && <Alert>{error.message}</Alert>}
      {!data && !error && <Spinner />}
      {data?.sessions.length === 0 && !creating && <Alert tone="info">Nenhuma sessão ainda. Crie uma para o grupo jogar ou fazer um check-in.</Alert>}
      <ul className="space-y-3">
        {data?.sessions.map((s) => (
          <li key={s.id}>
            <a
              href={`#/painel/sala/${roomId}/sessao/${s.id}`}
              className="flex items-center gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-ink/5 transition active:scale-[0.98]"
            >
              <span className="text-3xl" aria-hidden>
                {s.activity === 'checkin' ? '💬' : '🎮'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight font-extrabold">{s.title}</p>
                <p className="text-sm text-ink/70">
                  {formatDate(s.createdAt)} · {s.completed} {s.completed === 1 ? 'concluiu' : 'concluíram'}
                  {groupFormat(s.completed) && ` · ${GROUP_FORMAT_LABEL[groupFormat(s.completed)!]}`}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const open = status === 'aberta'
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-extrabold ${open ? 'bg-[#E6F7DA] text-[#2F6B12]' : 'bg-ink/10 text-ink/75'}`}>
      {open ? '● Aberta' : 'Encerrada'}
    </span>
  )
}

function CreateSession({ roomId, onDone }: { roomId: string; onDone: () => void }) {
  const [title, setTitle] = useState(`Sessão de ${new Date().toLocaleDateString('pt-BR')}`)
  const [activity, setActivity] = useState<Activity>('historias')
  const [storyIds, setStoryIds] = useState<string[]>([STORIES[0].id])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.createSession(roomId, { title, activity, storyIds })
      onDone()
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Card title="Nova sessão">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        <fieldset>
          <legend className="mb-2 font-bold">Atividade</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { v: 'historias' as const, t: '🎮 Histórias interativas', d: 'O grupo joga uma ou mais histórias e descobre o mix emocional.' },
              { v: 'checkin' as const, t: '💬 Check-in emocional', d: '“Como você está hoje?” — até 3 emoções com intensidade. Rápido.' },
            ].map((o) => (
              <label key={o.v} className={`flex cursor-pointer gap-3 rounded-2xl p-4 ring-2 ${activity === o.v ? 'bg-brand/5 ring-brand' : 'ring-ink/10'}`}>
                <input type="radio" name="activity" checked={activity === o.v} onChange={() => setActivity(o.v)} className="mt-1 h-5 w-5 accent-[#6a45f5]" />
                <span>
                  <span className="block font-bold">{o.t}</span>
                  <span className="text-sm text-ink/70">{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {activity === 'historias' && (
          <fieldset>
            <legend className="mb-2 font-bold">Histórias (na ordem em que aparecem)</legend>
            <div className="space-y-2">
              {STORIES.map((s) => (
                <Checkbox
                  key={s.id}
                  checked={storyIds.includes(s.id)}
                  onChange={(on) => setStoryIds((ids) => (on ? STORIES.map((x) => x.id).filter((id) => id === s.id || ids.includes(id)) : ids.filter((id) => id !== s.id)))}
                >
                  {s.icon} <strong>{s.title}</strong> — {s.tagline}
                </Checkbox>
              ))}
            </div>
          </fieldset>
        )}
        {error && <Alert>{error}</Alert>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-60`}>
            {busy ? 'Criando...' : 'Criar e abrir sessão'}
          </button>
          <button type="button" onClick={onDone} className={btnSecondary}>
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  )
}

// ---------- Painel ----------

function RoomDashboard({ roomId }: { roomId: string }) {
  const { data, error, loading } = useAsync(() => api.dashboard(roomId), [roomId], 15000)
  if (error) return <Alert>{error.message}</Alert>
  if (!data) return <Spinner />
  return (
    <div className="space-y-4">
      <Alert tone="info">Este painel usa apenas dados agregados, sem nomes. Valores exatos ficam visíveis só para você.</Alert>
      <DashboardView data={data} busy={loading} />
    </div>
  )
}

// ---------- Pessoas ----------

function People({ roomId }: { roomId: string }) {
  const { data, error, reload } = useAsync(() => api.participants(roomId), [roomId])
  const [busyId, setBusyId] = useState<string | null>(null)

  async function remove(id: string, name: string) {
    if (!window.confirm(`Apagar definitivamente ${name} e todas as respostas dessa pessoa? Os gráficos serão recalculados.`)) return
    setBusyId(id)
    try {
      await api.deleteParticipant(roomId, id)
      await reload()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Alert tone="info">🔒 Nomes são visíveis somente para você, responsável pela sala. Cada acesso a esta lista fica registrado.</Alert>
      {error && <Alert>{error.message}</Alert>}
      {!data && !error && <Spinner />}
      {data?.participants.length === 0 && <p className="text-ink/70">Ninguém entrou na sala ainda.</p>}
      <ul className="space-y-2">
        {data?.participants.map((p) => {
          const name = p.displayName ?? 'Participante sem nome'
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/5">
              <div className="min-w-0 flex-1">
                <p className={`truncate font-bold ${p.displayName ? '' : 'text-ink/70 italic'}`}>{name}</p>
                <p className="text-sm text-ink/70">
                  {p.ageBand && `${AGE_BAND_LABEL[p.ageBand]} · `}Entrou em {formatDate(p.joinedAt)} · {p.sessionsCompleted} {p.sessionsCompleted === 1 ? 'atividade' : 'atividades'}
                </p>
              </div>
              <button
                onClick={() => remove(p.id, name)}
                disabled={busyId === p.id}
                className="min-h-11 shrink-0 rounded-full px-4 text-sm font-bold text-[#8C2410] ring-1 ring-[#8C2410]/30 hover:bg-[#FFE4DC] disabled:opacity-50"
              >
                Apagar
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------- Ajustes ----------

function Settings({ room, onChange }: { room: Room; onChange: (r: Room) => void }) {
  const [name, setName] = useState(room.name)
  const [description, setDescription] = useState(room.description)
  const [k, setK] = useState(room.minGroupSize)
  const [retention, setRetention] = useState(room.retentionDays)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  async function run(fn: () => Promise<{ room: Room }>, ok: string) {
    setMsg(null)
    try {
      onChange((await fn()).room)
      setMsg({ tone: 'ok', text: ok })
    } catch (e) {
      setMsg({ tone: 'error', text: (e as Error).message })
    }
  }

  async function removeRoom() {
    const typed = window.prompt(`Isso apaga a sala, todas as sessões, participantes e resultados. Não dá para desfazer.\n\nDigite o nome da sala para confirmar:`)
    if (typed?.trim() !== room.name) return
    await api.deleteRoom(room.id)
    navigate('/painel')
  }

  return (
    <div className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <Card title="Sala">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => api.updateRoom(room.id, { name, description }), 'Sala atualizada.')
          }}
        >
          <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <Field label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
          <button className={btnPrimary}>Salvar</button>
        </form>
      </Card>

      <Card title="Privacidade e retenção">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => api.updateRoom(room.id, { minGroupSize: k, retentionDays: retention }), 'Regras de privacidade atualizadas.')
          }}
        >
          <Field
            label="Tamanho mínimo do grupo (k)"
            type="number"
            min={3}
            max={50}
            inputMode="numeric"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            hint="Resultados de grupo só aparecem para participantes e no painel compartilhado quando pelo menos k pessoas concluíram. Mínimo: 3. Com 2 pessoas a sessão é uma dupla e com 1 é individual: todos participam normalmente, só o resultado de grupo fica oculto."
          />
          <Field
            label="Guardar dados individuais por (dias)"
            type="number"
            min={30}
            max={730}
            inputMode="numeric"
            value={retention}
            onChange={(e) => setRetention(Number(e.target.value))}
            hint="Padrão: 90 dias. Depois desse prazo, nomes, respostas e resultados individuais são apagados. Ficam só os totais anônimos de sessões com pelo menos k pessoas."
          />
          <button className={btnPrimary}>Salvar regras</button>
        </form>
      </Card>

      <Card title="Painel compartilhado">
        <p className="mb-3 text-ink/80">
          Gere um link para coordenação, equipe ou turma verem os resultados <strong>agregados e anonimizados</strong> — sem nomes, sem respostas individuais e
          só de sessões encerradas.
        </p>
        {room.shareUrl ? (
          <div className="space-y-3">
            <p className="rounded-2xl bg-paper p-3 font-mono text-sm break-all">{room.shareUrl}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => navigator.clipboard?.writeText(room.shareUrl!)} className={btnSecondary}>
                Copiar link
              </button>
              <button onClick={() => run(() => api.enableShare(room.id), 'Novo link gerado. O anterior parou de funcionar.')} className={btnSecondary}>
                Gerar novo link
              </button>
              <button onClick={() => run(() => api.disableShare(room.id), 'Compartilhamento desativado.')} className={btnSecondary}>
                Desativar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => run(() => api.enableShare(room.id), 'Link do painel criado.')} className={btnBrand}>
            Criar link do painel
          </button>
        )}
      </Card>

      <Card title="Código de entrada">
        <p className="mb-3 text-ink/80">Se o link da sala vazou, gere um novo código. Quem já entrou continua participando normalmente.</p>
        <button onClick={() => run(() => api.rotateJoinCode(room.id), 'Novo código gerado.')} className={btnSecondary}>
          Gerar novo código
        </button>
      </Card>

      <Card title="Zona de perigo">
        <button onClick={removeRoom} className={`${btnSecondary} border-[#8C2410] text-[#8C2410]`}>
          Apagar sala e todos os dados
        </button>
      </Card>
    </div>
  )
}
