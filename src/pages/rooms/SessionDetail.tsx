import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAsync } from '../../api/useAsync'
import { ChartFrame, DataTable, EmotionBars } from '../../components/charts'
import { EmotionAvatar } from '../../components/EmotionAvatar'
import { Alert, Card, Spinner, formatDate, formatDateTime } from '../../components/forms'
import { btnPrimary, btnSecondary } from '../../components/ui'
import { getEmotion } from '../../data/emotions'
import { getStory } from '../../data/stories'
import { navigate } from '../../hooks/useHashRoute'
import { GROUP_FORMAT_LABEL, groupFormat } from '../../lib/groupFormat'
import { EMOTION_IDS } from '../../types'
import { StatusBadge } from './RoomDetail'

/** Acompanhamento de uma sessão pelo responsável (atualiza sozinho enquanto está aberta). */
export function SessionDetail({ roomId, sessionId }: { roomId: string; sessionId: string }) {
  const [live, setLive] = useState(true)
  const { data, error, loading, reload } = useAsync(() => api.sessionResults(roomId, sessionId), [roomId, sessionId], live ? 5000 : undefined)
  const [showNames, setShowNames] = useState(false)
  const [busy, setBusy] = useState(false)
  const status = data?.session.status

  // Só fica consultando o servidor enquanto a sessão está aberta.
  useEffect(() => {
    if (status) setLive(status === 'aberta')
  }, [status])

  if (error) return <div className="mx-auto max-w-4xl px-4 pt-4"><Alert>{error.message}</Alert></div>
  if (!data) return <Spinner />
  const { session, stats, results } = data
  const open = session.status === 'aberta'

  async function toggleStatus() {
    setBusy(true)
    try {
      await api.updateSession(roomId, sessionId, { status: open ? 'encerrada' : 'aberta' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm('Apagar esta sessão e todos os resultados dela? Não dá para desfazer.')) return
    await api.deleteSession(roomId, sessionId)
    navigate(`/painel/sala/${roomId}/sessoes`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 pt-4 pb-10">
      <a href={`#/painel/sala/${roomId}/sessoes`} className="inline-flex min-h-11 items-center font-bold text-ink/70">
        ← Voltar à sala
      </a>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-extrabold">{session.title}</h1>
          <p className="text-ink/75">
            {session.activity === 'checkin' ? '💬 Check-in emocional' : `🎮 ${session.storyIds.map((id) => getStory(id)?.title).join(' · ')}`} · {formatDate(session.createdAt)}
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="flex items-center gap-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-ink/5">
        <p className="font-display text-5xl font-extrabold tabular-nums">{stats.n}</p>
        <p className="flex-1 text-lg font-bold">
          {stats.n === 1 ? 'pessoa concluiu' : 'pessoas concluíram'}
          {groupFormat(stats.n) && <span className="ml-2 rounded-full bg-ink/10 px-3 py-0.5 align-middle text-sm font-extrabold">{GROUP_FORMAT_LABEL[groupFormat(stats.n)!]}</span>}
          {open && <span className="block text-sm font-normal text-ink/70">Atualiza automaticamente a cada 5 segundos.</span>}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={toggleStatus} disabled={busy} className={`${open ? btnPrimary : btnSecondary} disabled:opacity-60`}>
          {open ? 'Encerrar sessão' : 'Reabrir sessão'}
        </button>
      </div>
      {open && (
        <p className="text-sm text-ink/70">
          Ao encerrar, ninguém mais consegue responder e o resultado da turma (anonimizado) passa a aparecer para os participantes, se houver pelo menos k pessoas. Em dupla ou individual, cada pessoa vê só o próprio resultado.
        </p>
      )}

      {stats.n > 0 ? (
        <>
          <ChartFrame
            busy={loading}
            title="Distribuição das emoções"
            subtitle="Média do peso de cada emoção nos resultados"
            table={<DataTable head={['Emoção', '% médio', 'Predominante (pessoas)']} rows={EMOTION_IDS.map((id) => [getEmotion(id).nome, `${stats.shares[id]}%`, stats.dominant[id]])} />}
          >
            <EmotionBars
              data={EMOTION_IDS.map((id) => ({
                id,
                value: stats.shares[id],
                label: `${stats.shares[id]}%`,
                detail: `${stats.dominant[id]} ${stats.dominant[id] === 1 ? 'pessoa' : 'pessoas'} com esta emoção principal`,
              }))}
            />
          </ChartFrame>

          <Card
            title="Resultados individuais"
            action={
              <button onClick={() => setShowNames((v) => !v)} className="min-h-11 rounded-full px-4 text-sm font-bold ring-1 ring-ink/15" aria-pressed={showNames}>
                {showNames ? '🙈 Ocultar nomes' : '👁 Mostrar nomes'}
              </button>
            }
          >
            <p className="mb-3 text-sm text-ink/70">🔒 Visível apenas para você. Evite projetar esta lista para o grupo.</p>
            <ul className="space-y-2">
              {results.map((r, i) => {
                const e = getEmotion(r.dominant)
                return (
                  <li key={r.participantId} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: e.corSuave }}>
                    <EmotionAvatar id={r.dominant} size={40} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{showNames ? (r.displayName ?? 'Sem nome') : `Participante ${i + 1}`}</p>
                      <p className="text-sm text-ink/75">
                        {e.nome} · {formatDateTime(r.completedAt)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </>
      ) : (
        results.length === 0 && <Alert tone="info">{open ? 'Aguardando o grupo... compartilhe o QR Code da sala.' : 'Sem resultados individuais (nenhuma participação, ou dados já removidos pela política de retenção).'}</Alert>
      )}

      <button onClick={remove} className={`${btnSecondary} border-[#8C2410] text-[#8C2410]`}>
        Apagar sessão
      </button>
    </div>
  )
}
