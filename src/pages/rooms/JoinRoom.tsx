import { useEffect, useState, type FormEvent } from 'react'
import { api, participantStore, type ParticipantSession, type PublicSessionStats } from '../../api/client'
import { useAsync } from '../../api/useAsync'
import { EmotionBars } from '../../components/charts'
import { Checkin } from '../../components/Checkin'
import { EmotionAvatar } from '../../components/EmotionAvatar'
import { Alert, Checkbox, Field, Spinner } from '../../components/forms'
import { btnPrimary, btnSecondary } from '../../components/ui'
import { getStory } from '../../data/stories'
import { navigate } from '../../hooks/useHashRoute'
import { EMOTION_IDS, type RunResult, type Scores, type Story } from '../../types'
import { Play } from '../Play'
import { Result } from '../Result'

/** Entrada dos jovens pelo link/QR: #/sala/CODIGO e #/sala/CODIGO/sessao/ID */
export function JoinRoom({ code, sessionId }: { code: string; sessionId?: string }) {
  const [token, setToken] = useState<string | null>(() => participantStore.get(code) ?? null)

  const forget = () => {
    participantStore.set(code, null)
    setToken(null)
  }

  if (!token)
    return (
      <Consent
        code={code}
        onJoined={(t) => {
          participantStore.set(code, t)
          setToken(t)
        }}
      />
    )
  return sessionId ? <SessionActivity code={code} token={token} sessionId={sessionId} onInvalid={forget} /> : <RoomHome code={code} token={token} onInvalid={forget} />
}

// ---------- Consentimento ----------

function Consent({ code, onJoined }: { code: string; onJoined: (token: string) => void }) {
  const { data, error } = useAsync(() => api.publicRoom(code), [code])
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!data) return
    setBusy(true)
    setFormError(null)
    try {
      const res = await api.join(code, { displayName: name.trim() || undefined, consent, consentVersion: data.consentVersion })
      onJoined(res.participantToken)
    } catch (e) {
      setFormError((e as Error).message)
      setBusy(false)
    }
  }

  if (error)
    return (
      <Centered>
        <EmotionAvatar id="medo" size={110} animated />
        <h1 className="mt-2 font-display text-2xl font-extrabold">Sala não encontrada</h1>
        <p className="text-ink/75">{error.message}</p>
      </Centered>
    )
  if (!data) return <Spinner />
  const { room } = data

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-10">
      <div className="flex items-center gap-3">
        <EmotionAvatar id="alegria" size={72} animated />
        <div>
          <p className="text-sm font-extrabold tracking-wide text-brand uppercase">Convite para a sala</p>
          <h1 className="font-display text-[1.75rem] leading-tight font-extrabold">{room.name}</h1>
          <p className="text-ink/75">com {room.ownerName}</p>
        </div>
      </div>

      <section className="mt-5 rounded-[1.75rem] bg-white p-5 ring-1 ring-ink/5">
        <h2 className="font-display text-xl font-extrabold">Antes de entrar, o que acontece com seus dados</h2>
        <ul className="mt-3 space-y-2.5 text-base">
          <li>📝 <strong>O que guardamos:</strong> o nome ou apelido que você quiser informar (é opcional), suas escolhas nas atividades e o resultado emocional.</li>
          <li>🎯 <strong>Para quê:</strong> atividades educativas sobre emoções e para {room.ownerName} acompanhar como o grupo está, ao longo do tempo.</li>
          <li>🔒 <strong>Quem vê seu nome e suas respostas:</strong> somente {room.ownerName}, responsável pela sala. Ninguém mais.</li>
          <li>👥 <strong>O que os outros veem:</strong> só resultados da turma inteira, sem nomes, e apenas quando pelo menos {room.minGroupSize} pessoas participaram.</li>
          <li>⏳ <strong>Por quanto tempo:</strong> até {room.retentionDays} dias. Depois disso, seus dados individuais são apagados automaticamente.</li>
          <li>🗑️ <strong>Seus direitos:</strong> você pode apagar sua participação quando quiser, aqui mesmo, ou pedir a {room.ownerName}.</li>
          <li>💛 <strong>Não é teste:</strong> o EmoQuest não é avaliação nem diagnóstico. Nenhuma emoção é boa ou ruim.</li>
        </ul>
        <a href="#/privacidade" target="_blank" className="mt-3 inline-flex min-h-11 items-center font-bold text-brand underline">
          Ler a política de privacidade completa
        </a>
      </section>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <Field
          label="Seu nome ou apelido (opcional)"
          autoComplete="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          hint="Use só o primeiro nome ou um apelido que quem conduz reconheça. Pode deixar em branco."
        />
        <Checkbox checked={consent} onChange={setConsent}>
          Entendi como meus dados serão usados e quero participar. Sei que posso sair e apagar minha participação quando quiser.
        </Checkbox>
        {formError && <Alert>{formError}</Alert>}
        <button type="submit" disabled={!consent || busy} className={`${btnPrimary} sm:w-full disabled:opacity-50`}>
          {busy ? 'Entrando...' : 'Entrar na sala'}
        </button>
      </form>
    </div>
  )
}

// ---------- Início da sala (participante) ----------

function RoomHome({ code, token, onInvalid }: { code: string; token: string; onInvalid: () => void }) {
  const { data, error } = useAsync(() => api.me(token), [token], 10000)

  useEffect(() => {
    if (error?.status === 401) onInvalid()
  }, [error, onInvalid])

  async function leave() {
    if (!window.confirm('Apagar sua participação? Seu nome, suas respostas e seus resultados nesta sala serão excluídos definitivamente.')) return
    await api.leave(token)
    onInvalid()
    navigate('/')
  }

  if (error && error.status !== 401) return <div className="mx-auto max-w-lg px-4 pt-6"><Alert>{error.message}</Alert></div>
  if (!data) return <Spinner />

  const open = data.sessions.filter((s) => s.status === 'aberta' && !s.done)
  const done = data.sessions.filter((s) => s.done)

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-10">
      <p className="text-sm font-extrabold tracking-wide text-brand uppercase">Sala</p>
      <h1 className="font-display text-[1.75rem] leading-tight font-extrabold">{data.room.name}</h1>
      {data.displayName && <p className="text-ink/75">Você entrou como {data.displayName}</p>}

      <h2 className="mt-6 mb-3 font-display text-xl font-extrabold">Atividades abertas</h2>
      {open.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[1.5rem] bg-white p-5 ring-1 ring-ink/5">
          <EmotionAvatar id="tedio" size={64} animated />
          <p className="text-ink/80">Nenhuma atividade aberta agora. Quando quem conduz abrir uma nova sessão, ela aparece aqui.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {open.map((s) => (
            <SessionLink key={s.id} code={code} session={s} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 font-display text-xl font-extrabold">Já concluídas</h2>
          <ul className="space-y-3">
            {done.map((s) => (
              <SessionLink key={s.id} code={code} session={s} />
            ))}
          </ul>
        </>
      )}

      <section className="mt-10 rounded-[1.5rem] bg-white p-5 ring-1 ring-ink/5">
        <h2 className="font-display text-lg font-extrabold">Seus dados</h2>
        <p className="mt-1 text-ink/75">Sua participação fica salva só neste aparelho. Se quiser, você pode apagar tudo agora.</p>
        <button onClick={leave} className={`${btnSecondary} mt-3 border-[#8C2410] text-[#8C2410]`}>
          Apagar minha participação
        </button>
      </section>
    </div>
  )
}

function SessionLink({ code, session }: { code: string; session: ParticipantSession }) {
  const isCheckin = session.activity === 'checkin'
  return (
    <li>
      <a
        href={`#/sala/${code}/sessao/${session.id}`}
        className={`flex items-center gap-3 rounded-[1.5rem] p-4 shadow-sm ring-1 ring-ink/5 transition active:scale-[0.98] ${session.done ? 'bg-white' : 'bg-ink text-white'}`}
      >
        <span className="text-3xl" aria-hidden>
          {isCheckin ? '💬' : '🎮'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg leading-tight font-extrabold">{session.title}</span>
          <span className={`block text-sm ${session.done ? 'text-ink/70' : 'text-white/80'}`}>
            {isCheckin ? 'Check-in: como você está hoje?' : session.storyIds.map((id) => getStory(id)?.title).join(' · ')}
          </span>
        </span>
        <span className="font-extrabold">{session.done ? 'Ver resultado' : 'Começar →'}</span>
      </a>
    </li>
  )
}

// ---------- Atividade ----------

function SessionActivity({ code, token, sessionId, onInvalid }: { code: string; token: string; sessionId: string; onInvalid: () => void }) {
  const { data, error } = useAsync(() => api.me(token), [token, sessionId])
  const [ready, setReady] = useState(false)
  const [result, setResult] = useState<Scores | null>(null)
  const session = data?.sessions.find((s) => s.id === sessionId)
  const back = `/sala/${code}`

  useEffect(() => {
    if (error?.status === 401) onInvalid()
  }, [error, onInvalid])

  // Uma partida interrompida (ex.: página recarregada) recomeça do zero no servidor.
  useEffect(() => {
    if (!session || session.done || session.status !== 'aberta' || session.activity !== 'historias') return
    api.restart(token, sessionId).then(() => setReady(true), () => setReady(true))
  }, [session, token, sessionId])

  if (error && error.status !== 401) return <div className="mx-auto max-w-lg px-4 pt-6"><Alert>{error.message}</Alert></div>
  if (!data) return <Spinner />
  if (!session) return <Centered><p className="text-lg">Atividade não encontrada.</p><a href={`#${back}`} className={btnPrimary}>Voltar à sala</a></Centered>

  if (result || session.done) return <MyResult token={token} sessionId={sessionId} back={back} initial={result} />
  if (session.status !== 'aberta')
    return (
      <Centered>
        <EmotionAvatar id="nostalgia" size={110} animated />
        <p className="text-lg">Esta atividade já foi encerrada.</p>
        <a href={`#${back}`} className={btnPrimary}>
          Voltar à sala
        </a>
      </Centered>
    )

  if (session.activity === 'checkin')
    return <Checkin title={session.title} onSubmit={async (items) => setResult((await api.checkin(token, sessionId, items)).scores)} />

  const stories = session.storyIds.map((id) => getStory(id)).filter((s): s is Story => !!s)
  if (!ready) return <Spinner label="Preparando a história..." />
  return (
    <Play
      stories={stories}
      exitTo={back}
      onChoice={(storyId, nodeId, choiceIndex) => api.respond(token, sessionId, { storyId, nodeId, choiceIndex }).then(() => undefined)}
      onFinish={async () => setResult((await api.complete(token, sessionId)).scores)}
    />
  )
}

function MyResult({ token, sessionId, back, initial }: { token: string; sessionId: string; back: string; initial: Scores | null }) {
  const mine = useAsync(() => (initial ? Promise.resolve({ scores: initial }) : api.mine(token, sessionId)), [sessionId])
  const group = useAsync(() => api.group(token, sessionId), [sessionId])
  if (mine.error) return <div className="mx-auto max-w-lg px-4 pt-6"><Alert>{mine.error.message}</Alert></div>
  if (!mine.data) return <Spinner />

  const run: RunResult = { scores: mine.data.scores, storyIds: [], log: [], finishedAt: new Date().toISOString() }
  return (
    <Result
      result={run}
      extra={group.data && <GroupCard stats={group.data.stats} k={group.data.minGroupSize} />}
      actions={
        <a href={`#${back}`} className={btnPrimary}>
          Voltar à sala
        </a>
      }
    />
  )
}

function GroupCard({ stats, k }: { stats: PublicSessionStats; k: number }) {
  return (
    <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:mt-6 sm:p-8">
      <h2 className="font-display text-xl font-extrabold">Como a turma se sentiu</h2>
      {stats.suppressed ? (
        <p className="mt-2 text-ink/80">
          {stats.reason === 'aberta'
            ? 'O resultado da turma aparece quando quem conduz encerrar a atividade. Volte depois para ver!'
            : `Para proteger a privacidade de todo mundo, o resultado da turma só aparece quando pelo menos ${k} pessoas participam.`}
        </p>
      ) : (
        <>
          <p className="mt-1 mb-4 text-sm text-ink/70">{stats.nAtLeast} ou mais pessoas · resultado anônimo, sem nomes</p>
          <EmotionBars data={EMOTION_IDS.map((id) => ({ id, value: stats.shares![id], label: `${stats.shares![id]}%` }))} />
        </>
      )}
    </section>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">{children}</div>
}

