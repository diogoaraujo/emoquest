import { lazy, Suspense, useState } from 'react'
import { EmotionAvatar } from './components/EmotionAvatar'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { getStory, STORIES } from './data/stories'
import { navigate, useHashRoute } from './hooks/useHashRoute'
import { useAuth } from './api/auth'
import { loadResult, saveResult } from './lib/storage'
import { Home } from './pages/Home'
import type { RunResult } from './types'

// A tela inicial vem no pacote principal; o resto é carregado sob demanda para abrir mais rápido no celular.
const Play = lazy(() => import('./pages/Play').then((m) => ({ default: m.Play })))
const StorySelect = lazy(() => import('./pages/StorySelect').then((m) => ({ default: m.StorySelect })))
const Result = lazy(() => import('./pages/Result').then((m) => ({ default: m.Result })))
const Characters = lazy(() => import('./pages/Characters').then((m) => ({ default: m.Characters })))
const Learn = lazy(() => import('./pages/Learn').then((m) => ({ default: m.Learn })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
// Salas
const Auth = lazy(() => import('./pages/rooms/Auth').then((m) => ({ default: m.Auth })))
const RoomsList = lazy(() => import('./pages/rooms/RoomsList').then((m) => ({ default: m.RoomsList })))
const RoomDetail = lazy(() => import('./pages/rooms/RoomDetail').then((m) => ({ default: m.RoomDetail })))
const SessionDetail = lazy(() => import('./pages/rooms/SessionDetail').then((m) => ({ default: m.SessionDetail })))
const JoinRoom = lazy(() => import('./pages/rooms/JoinRoom').then((m) => ({ default: m.JoinRoom })))
const SharedDashboard = lazy(() => import('./pages/rooms/SharedDashboard').then((m) => ({ default: m.SharedDashboard })))

function Loading() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-2" role="status">
      <EmotionAvatar id="alegria" size={72} animated />
      <span className="font-bold text-ink/70">Carregando...</span>
    </div>
  )
}

export default function App() {
  const route = useHashRoute()
  const [result, setResult] = useState<RunResult | null>(loadResult)
  const user = useAuth()

  function handleFinish(r: RunResult) {
    setResult(r)
    saveResult(r)
    navigate('/resultado')
  }

  const [section, param, sub, subId] = route.split('/').filter(Boolean)
  let page
  let immersive = false
  switch (section) {
    case 'jogar': {
      const stories = param === 'jornada' ? STORIES : param ? [getStory(param)].filter((s) => s !== undefined) : []
      immersive = stories.length > 0
      page = immersive ? <Play key={route} stories={stories} onFinish={handleFinish} /> : <StorySelect />
      break
    }
    case 'resultado':
      page = <Result result={result} />
      break
    case 'personagens':
      page = <Characters />
      break
    case 'emocoes':
      page = <Learn />
      break
    case 'privacidade':
      page = <Privacy />
      break
    case 'entrar':
    case 'cadastro':
      page = <Auth key={section} mode={section} />
      break
    case 'painel':
      // #/painel · #/painel/sala/:id[/:aba] · #/painel/sala/:id/sessao/:sid
      if (!user) page = <Auth mode="entrar" />
      else if (param === 'sala' && sub && subId === 'sessao') page = <SessionDetail roomId={sub} sessionId={route.split('/').filter(Boolean)[4] ?? ''} />
      else if (param === 'sala' && sub) page = <RoomDetail key={sub} roomId={sub} tab={subId} />
      else page = <RoomsList />
      break
    case 'sala':
      // #/sala/:codigo · #/sala/:codigo/sessao/:sid (jovens, sem cadastro)
      immersive = sub === 'sessao'
      page = <JoinRoom key={`${param}-${subId ?? ''}`} code={param ?? ''} sessionId={sub === 'sessao' ? subId : undefined} />
      break
    case 'compartilhado':
      page = <SharedDashboard token={param ?? ''} />
      break
    default:
      page = <Home />
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('conteudo')?.focus()
        }}
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>
      <Navbar route={route} immersive={immersive} />
      <main
        id="conteudo"
        tabIndex={-1}
        key={section ?? 'inicio'}
        className="flex-1 animate-fade outline-none"
      >
        <Suspense fallback={<Loading />}>{page}</Suspense>
      </main>
      <Footer hiddenOnMobile={immersive} />
    </div>
  )
}
