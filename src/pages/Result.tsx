import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EmotionAvatar } from '../components/EmotionAvatar'
import { EmotionInfo } from '../components/EmotionDetail'
import { ScoreBars } from '../components/ScoreBars'
import { btnBrand, btnPrimary, btnSecondary, haptic, prefersReducedMotion } from '../components/ui'
import { getEmotion } from '../data/emotions'
import { getStory } from '../data/stories'
import { rankEmotions, strongestEffect } from '../lib/scoring'
import { EMOTION_IDS, type RunResult } from '../types'

const canShare = typeof navigator !== 'undefined' && 'share' in navigator

function share(personagem: string, nome: string) {
  navigator
    .share({
      title: 'EmoQuest',
      text: `No EmoQuest, minha emoção predominante foi ${personagem}, a ${nome}! Descubra a sua:`,
      url: window.location.href.split('#')[0],
    })
    .catch(() => {
      /* compartilhamento cancelado */
    })
}

/** Pequena "revelação" antes do resultado, para dar clima de jogo. */
function Revealing() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-4 text-center" role="status">
      <div className="grid grid-cols-5 gap-2">
        {EMOTION_IDS.map((id, i) => (
          <span key={id} className="animate-float" style={{ animationDelay: `${i * 0.12}s`, animationDuration: '1.2s' }}>
            <EmotionAvatar id={id} size={44} />
          </span>
        ))}
      </div>
      <p className="font-display text-2xl font-extrabold">Juntando suas emoções...</p>
    </div>
  )
}

interface ResultProps {
  result: RunResult | null
  /** Substitui os botões padrão (usado no modo sala). */
  actions?: ReactNode
  /** Conteúdo extra abaixo do mix emocional (ex.: resultado da turma). */
  extra?: ReactNode
}

export function Result({ result, actions, extra }: ResultProps) {
  const [revealed, setRevealed] = useState(() => !result || prefersReducedMotion())
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (revealed) return
    const t = window.setTimeout(() => {
      setRevealed(true)
      haptic(30)
    }, 1300)
    return () => window.clearTimeout(t)
  }, [revealed])

  useEffect(() => {
    if (revealed) headingRef.current?.focus({ preventScroll: true })
  }, [revealed])

  if (!result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <EmotionAvatar id="tedio" size={140} animated className="mx-auto" />
        <h1 className="mt-4 font-display text-3xl font-extrabold">Ainda não tem resultado por aqui</h1>
        <p className="mt-2 text-ink/70">Jogue uma história para descobrir seu mix emocional.</p>
        <a href="#/jogar" className={`${btnPrimary} mt-6`}>
          Escolher história
        </a>
      </div>
    )
  }

  if (!revealed) return <Revealing />

  const ranked = rankEmotions(result.scores)
  const top = ranked[0]
  const tied = ranked.filter((r) => r.value === top.value && r.id !== top.id)
  const trio = ranked.slice(1, 4).filter((r) => r.value > 0)
  const main = getEmotion(top.id)
  const replayHref = result.storyIds.length > 1 ? '#/jogar/jornada' : `#/jogar/${result.storyIds[0]}`

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-8 md:py-10">
      <section className="animate-pop overflow-hidden rounded-[2rem] text-center shadow-xl shadow-ink/5" style={{ background: main.corSuave }}>
        <div className="px-5 py-8 sm:px-6 sm:py-10">
          <p className="font-extrabold tracking-wider uppercase" style={{ color: main.corForte }}>
            Sua emoção predominante
          </p>
          <EmotionAvatar id={main.id} size={200} animated className="mx-auto my-2 h-40 w-40 sm:h-52 sm:w-52" />
          <h1 ref={headingRef} tabIndex={-1} className="font-display text-5xl font-extrabold outline-none" style={{ color: main.corForte }}>
            {main.personagem}
          </h1>
          <p className="text-xl font-bold">
            {main.nome} · {top.percent}% das suas reações
          </p>
          <p className="mx-auto mt-3 max-w-xl text-lg italic">“{main.frase}”</p>
          {tied.length > 0 && (
            <p className="mt-3 text-sm font-bold text-ink/70">
              Empatou com: {tied.map((t) => getEmotion(t.id).personagem).join(', ')} — vocês dividiram o comando!
            </p>
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-8">
          <h2 className="font-display text-2xl font-extrabold">O que {main.personagem} quer te dizer</h2>
          <div className="mt-4">
            <EmotionInfo id={main.id} />
          </div>
          <div className="mt-6 rounded-2xl p-5" style={{ background: main.corSuave }}>
            <p className="font-display text-lg font-bold" style={{ color: main.corForte }}>
              Para pensar 💭
            </p>
            <p className="mt-1">{main.reflexao}</p>
          </div>
        </section>

        <div className="space-y-4 sm:space-y-6">
          {trio.length > 0 && (
            <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
              <h2 className="font-display text-xl font-extrabold">Também estiveram por perto</h2>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {trio.map((r) => {
                  const e = getEmotion(r.id)
                  return (
                    <div key={r.id} className="rounded-2xl px-1 py-2" style={{ background: e.corSuave }}>
                      <EmotionAvatar id={r.id} size={64} className="mx-auto" />
                      <p className="text-sm font-extrabold" style={{ color: e.corForte }}>
                        {e.personagem}
                      </p>
                      <p className="text-sm font-bold text-ink/75">{e.nome}</p>
                      <p className="text-sm font-bold text-ink/75">{r.percent}%</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
            <h2 className="mb-4 font-display text-xl font-extrabold">Seu mix emocional</h2>
            <ScoreBars scores={result.scores} />
          </section>
        </div>
      </div>

      {extra}

      <section className="mt-4 rounded-[2rem] bg-gradient-to-br from-[#E5E6FA] to-[#FFE3EE] p-5 sm:mt-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold">Lembrete importante</h2>
        <p className="mt-2 text-ink/80">
          Este resultado não é um diagnóstico nem diz quem você é. Ele mostra quais emoções apareceram mais nesta
          atividade. Todas as emoções são válidas e úteis — elas mudam com o dia, com as pessoas e com as situações. Jogue de novo e
          veja como o mix muda!
        </p>
      </section>

      {result.log.length > 0 && (
      <details className="mt-4 rounded-[2rem] bg-white shadow-sm ring-1 ring-ink/5 sm:mt-6">
        <summary className="flex min-h-16 cursor-pointer items-center px-5 font-display text-xl font-extrabold sm:px-6">Rever minhas escolhas ({result.log.length})</summary>
        <ol className="space-y-2 px-5 pb-5 sm:px-6 sm:pb-6">
          {result.log.map((l, i) => {
            return (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-paper p-3">
                <EmotionAvatar id={strongestEffect(l.effects)} size={36} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink/70">{getStory(l.storyId)?.title}</p>
                  <p className="font-bold">{l.choiceText}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </details>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center print:hidden">
        {actions ?? (
        <>
        <a href={replayHref} className={btnPrimary}>
          Jogar de novo
        </a>
        {canShare && (
          <button onClick={() => share(main.personagem, main.nome)} className={btnBrand}>
            Compartilhar resultado
          </button>
        )}
        <a href="#/jogar" className={btnSecondary}>
          Outras histórias
        </a>
        <a href="#/personagens" className={btnSecondary}>
          Ver personagens
        </a>
        </>
        )}
      </div>
    </div>
  )
}
