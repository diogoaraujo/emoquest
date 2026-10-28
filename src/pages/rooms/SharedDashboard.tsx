import { api } from '../../api/client'
import { useAsync } from '../../api/useAsync'
import { DashboardView } from '../../components/DashboardView'
import { EmotionAvatar } from '../../components/EmotionAvatar'
import { Spinner } from '../../components/forms'

/** Painel para visualizadores autorizados: somente dados agregados e anonimizados. */
export function SharedDashboard({ token }: { token: string }) {
  const { data, error, loading } = useAsync(() => api.shared(token), [token], 60000)

  if (error)
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center gap-2 px-4 text-center">
        <EmotionAvatar id="medo" size={110} animated />
        <h1 className="font-display text-2xl font-extrabold">Painel indisponível</h1>
        <p className="text-ink/75">{error.message}</p>
      </div>
    )
  if (!data) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-10">
      <p className="text-sm font-extrabold tracking-wide text-brand uppercase">Painel compartilhado</p>
      <h1 className="mb-4 font-display text-[2rem] leading-tight font-extrabold">{data.room.name}</h1>
      <DashboardView data={data} busy={loading} />
    </div>
  )
}
