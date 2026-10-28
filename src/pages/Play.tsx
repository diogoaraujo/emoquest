import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EmotionAvatar } from '../components/EmotionAvatar'
import { ScoreBars } from '../components/ScoreBars'
import { btnPrimary, haptic, prefersReducedMotion } from '../components/ui'
import { getEmotion } from '../data/emotions'
import { navigate } from '../hooks/useHashRoute'
import { addEffects, emptyScores, rankEmotions, strongestEffect } from '../lib/scoring'
import type { Choice, ChoiceLog, EmotionId, RunResult, Scores, Story } from '../types'

interface Props {
  stories: Story[]
  onFinish: (result: RunResult) => void | Promise<void>
  /** Modo sala: registra cada escolha no servidor antes de mostrar a reação. */
  onChoice?: (storyId: string, nodeId: string, choiceIndex: number) => Promise<void>
  /** Para onde o botão de sair leva. */
  exitTo?: string
}

interface Feedback {
  choice: Choice
  emotion: EmotionId
  line: string
}

const LETTERS = ['A', 'B', 'C', 'D']
/** Tempo para o jogador ver a escolha marcada antes da reação do personagem. */
const PICK_DELAY = 260

export function Play({ stories, onFinish, onChoice, exitTo = '/jogar' }: Props) {
  const [storyIndex, setStoryIndex] = useState(0)
  const story = stories[storyIndex]
  const [nodeId, setNodeId] = useState(story.start)
  const [scores, setScores] = useState(emptyScores)
  const [log, setLog] = useState<ChoiceLog[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [picked, setPicked] = useState<Choice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pickTimer = useRef<number | undefined>(undefined)

  const node = story.nodes[nodeId]
  const isLastStory = storyIndex === stories.length - 1
  const stepInStory = log.filter((l) => l.storyId === story.id).length
  const cover = getEmotion(story.cover)
  const screenKey = `${story.id}-${nodeId}-${feedback ? 'reacao' : 'cena'}`

  // A cada nova tela: volta ao topo e leva o foco para o título (leitores de tela anunciam a mudança).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    headingRef.current?.focus({ preventScroll: true })
  }, [screenKey])

  useEffect(() => () => window.clearTimeout(pickTimer.current), [])

  function choose(choice: Choice) {
    if (picked) return
    haptic()
    setPicked(choice)
    setError(null)
    const index = node.choices?.indexOf(choice) ?? -1
    const saving = onChoice ? onChoice(story.id, nodeId, index) : Promise.resolve()
    const delay = new Promise((r) => (pickTimer.current = window.setTimeout(r, PICK_DELAY)))
    Promise.all([saving, delay]).then(() => {
      const emotion = strongestEffect(choice.effects)
      const falas = getEmotion(emotion).falas
      setScores((s) => addEffects(s, choice.effects))
      setLog((l) => [...l, { storyId: story.id, choiceText: choice.text, effects: choice.effects }])
      setFeedback({ choice, emotion, line: falas[log.length % falas.length] })
      setPicked(null)
    }, (e: Error) => {
      setError(e.message)
      setPicked(null)
    })
  }

  function proceed() {
    if (!feedback) return
    haptic()
    setNodeId(feedback.choice.next)
    setFeedback(null)
  }

  function nextStory() {
    haptic()
    const next = stories[storyIndex + 1]
    setStoryIndex(storyIndex + 1)
    setNodeId(next.start)
  }

  async function finish() {
    haptic(30)
    setFinishing(true)
    setError(null)
    try {
      await onFinish({ scores, storyIds: stories.map((s) => s.id), log, finishedAt: new Date().toISOString() })
    } catch (e) {
      setError((e as Error).message)
      setFinishing(false)
    }
  }

  function exit() {
    if (log.length === 0 || window.confirm('Sair da partida? Seu progresso nesta jornada será perdido.')) navigate(exitTo)
  }

  let action: ReactNode = null
  if (feedback) {
    action = (
      <button onClick={proceed} className={btnPrimary}>
        Continuar →
      </button>
    )
  } else if (node.ending) {
    action = isLastStory ? (
      <button onClick={finish} disabled={finishing} className={`${btnPrimary} disabled:opacity-60`}>
        {finishing ? 'Enviando...' : 'Ver meu resultado ✨'}
      </button>
    ) : (
      <button onClick={nextStory} className={btnPrimary}>
        Próxima história →
      </button>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 overflow-x-clip px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 sm:gap-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {/* Barra superior do jogo */}
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={exit}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold ring-1 ring-ink/10 transition active:scale-95"
            aria-label="Sair da partida"
          >
            ✕
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink/70">
              {stories.length > 1 ? `História ${storyIndex + 1} de ${stories.length}` : 'História'}
            </p>
            {stories.length > 1 && (
              <div className="mt-1 flex gap-1" aria-hidden>
                {stories.map((s, i) => (
                  <div
                    key={s.id}
                    className="h-2 flex-1 rounded-full transition-colors duration-500"
                    style={{ background: i <= storyIndex ? getEmotion(s.cover).cor : '#2a234618' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <article key={screenKey} className="animate-slide-in overflow-hidden rounded-[1.75rem] bg-white shadow-lg shadow-ink/5 ring-1 ring-ink/5">
          <div className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-8 sm:py-5" style={{ background: cover.corSuave }}>
            <EmotionAvatar id={story.cover} size={56} animated className="shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-wide uppercase" style={{ color: cover.corForte }}>
                {story.icon} {node.ending ? 'Fim da história' : feedback ? 'Reação' : `Momento ${stepInStory + 1}`}
              </p>
              <h1 ref={headingRef} tabIndex={-1} className="font-display text-xl leading-tight font-extrabold outline-none sm:text-2xl">
                {story.title}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-8" aria-live="polite">
            {feedback ? (
              <FeedbackView feedback={feedback} />
            ) : (
              <>
                <p className="text-[1.1875rem] leading-relaxed sm:text-xl">{node.text}</p>
                {node.choices && (
                  <fieldset className="mt-6">
                    <legend className="mb-3 font-extrabold text-ink/70">O que você faz?</legend>
                    <div className="grid gap-3">
                      {node.choices.map((c, i) => {
                        const isPicked = picked === c
                        return (
                          <button
                            key={c.text}
                            onClick={() => choose(c)}
                            disabled={picked !== null}
                            className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[1.0625rem] font-bold transition duration-200 active:scale-[0.98] sm:text-lg ${
                              isPicked
                                ? 'scale-[1.02] border-brand bg-brand text-white shadow-lg shadow-brand/25'
                                : picked
                                  ? 'border-ink/10 bg-paper opacity-50'
                                  : 'border-ink/10 bg-paper hover:border-brand hover:bg-brand/5'
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-lg ${
                                isPicked ? 'bg-white text-brand' : 'bg-white text-ink/70 ring-1 ring-ink/10'
                              }`}
                              aria-hidden
                            >
                              {LETTERS[i]}
                            </span>
                            <span>{c.text}</span>
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                )}
              </>
            )}
          </div>
        </article>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-[#FFE4DC] px-4 py-3 font-bold text-[#8C2410]">
            {error}
          </p>
        )}

        {/* Ação principal: fixa ao alcance do polegar no celular, logo abaixo do card em telas maiores. */}
        {action && (
          <>
            <div className="h-24 sm:hidden" aria-hidden />
            <div className="fixed inset-x-0 bottom-0 z-20 animate-fade border-t border-ink/10 bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              {action}
            </div>
          </>
        )}
      </div>

      <EmotionPanel scores={scores} />
    </div>
  )
}

function FeedbackView({ feedback }: { feedback: Feedback }) {
  const e = getEmotion(feedback.emotion)
  const others = (Object.keys(feedback.choice.effects) as EmotionId[]).filter((id) => id !== feedback.emotion)

  return (
    <div>
      <p className="text-sm font-bold text-ink/70">Você escolheu:</p>
      <p className="text-lg font-bold">“{feedback.choice.text}”</p>
      <div className="mt-5 flex animate-pop flex-col items-center gap-3 rounded-3xl p-5 text-center sm:flex-row sm:gap-5 sm:text-left" style={{ background: e.corSuave }}>
        <EmotionAvatar id={e.id} size={120} animated className="shrink-0" />
        <div>
          <p className="font-display text-xl font-extrabold" style={{ color: e.corForte }}>
            {e.personagem} ({e.nome}) apareceu!
          </p>
          <p className="mt-1 text-lg">“{feedback.line}”</p>
          {others.length > 0 && (
            <p className="mt-2 text-base text-ink/70">Também deram as caras: {others.map((id) => getEmotion(id).personagem).join(', ')}.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Celular: resumo recolhível com as 3 emoções mais fortes. Desktop: painel lateral completo. */
function EmotionPanel({ scores }: { scores: Scores }) {
  const [open, setOpen] = useState(false)
  const top = rankEmotions(scores).filter((r) => r.value > 0).slice(0, 3)

  return (
    <aside className="h-fit rounded-[1.75rem] bg-white shadow-sm ring-1 ring-ink/5 lg:sticky lg:top-24 lg:p-5" aria-label="Painel das emoções">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left lg:hidden"
      >
        <span className="flex-1">
          <span className="block font-display text-lg font-extrabold">Painel das emoções</span>
          <span className="block text-sm text-ink/70">{top.length ? 'Mais presentes até agora' : 'Faça sua primeira escolha'}</span>
        </span>
        <span className="flex -space-x-3">
          {top.map((r) => (
            <EmotionAvatar key={r.id} id={r.id} size={40} />
          ))}
        </span>
        <span className={`text-xl transition ${open ? 'rotate-180' : ''}`} aria-hidden>
          ⌄
        </span>
      </button>
      <div className={`${open ? 'block animate-fade' : 'hidden'} px-5 pb-5 lg:block lg:p-0`}>
        <div className="mb-4 hidden lg:block">
          <h2 className="font-display text-lg font-extrabold">Painel das emoções</h2>
          <p className="text-sm text-ink/70">Veja o que suas escolhas estão despertando.</p>
        </div>
        <ScoreBars scores={scores} compact />
      </div>
    </aside>
  )
}
