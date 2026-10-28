import { AgeForm } from '../components/AgeForm'
import { Alert, Spinner } from '../components/forms'
import { btnPrimary } from '../components/ui'
import { useAsync } from '../api/useAsync'
import { drawQuickPlay } from '../data/questionBank'
import { useAgeProfile } from '../hooks/useAgeProfile'
import type { AgeProfile } from '../lib/age'
import type { RunResult } from '../types'
import { Play } from './Play'

/** Partida rápida: #/jogar/perguntas/:tema (ou "todos"). Pede a idade antes, se ainda não souber. */
export function QuickPlay({ themeId, onFinish }: { themeId: string; onFinish: (r: RunResult) => void }) {
  const [profile, setProfile] = useAgeProfile()

  if (!profile)
    return (
      <div className="mx-auto max-w-md px-4 pt-10 pb-10">
        <AgeForm onDone={setProfile} />
      </div>
    )
  return <Draw key={`${profile.band}-${profile.under13}`} themeId={themeId} profile={profile} onFinish={onFinish} />
}

function Draw({ themeId, profile, onFinish }: { themeId: string; profile: AgeProfile; onFinish: (r: RunResult) => void }) {
  const { data: story, error, loading } = useAsync(() => drawQuickPlay(themeId, profile), [themeId])

  if (error) return <Message text="Não foi possível carregar as perguntas. Confira a conexão e tente de novo." />
  if (loading) return <Spinner />
  if (!story) return <Message text="Ainda não há perguntas deste tema para a sua faixa etária." />
  return <Play stories={[story]} onFinish={onFinish} />
}

function Message({ text }: { text: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pt-10">
      <Alert tone="info">{text}</Alert>
      <a href="#/jogar" className={btnPrimary}>
        Voltar
      </a>
    </div>
  )
}
