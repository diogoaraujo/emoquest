import { useState } from 'react'
import { AgeForm } from '../components/AgeForm'
import { EmotionAvatar } from '../components/EmotionAvatar'
import { getEmotion } from '../data/emotions'
import { ALL_THEMES, QUICK_PLAY_SIZE, themesFor } from '../data/questionBank'
import { STORIES, storiesByTheme, THEMES } from '../data/stories'
import { useAgeProfile } from '../hooks/useAgeProfile'
import { AGE_BAND_LABEL } from '../lib/age'
import type { ThemeId } from '../types'

export function StorySelect() {
  const [profile, setProfile] = useAgeProfile()
  const [editingAge, setEditingAge] = useState(false)
  const [themeId, setThemeId] = useState<ThemeId | null>(null)
  const themes = profile ? themesFor(profile) : THEMES
  const theme = themes.find((t) => t.id === themeId)
  const hidden = THEMES.filter((t) => !themes.includes(t)).map((t) => t.id)
  const stories = (theme ? storiesByTheme(theme.id) : STORIES).filter((s) => !s.themes.some((id) => hidden.includes(id)))

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-8 md:py-10">
      <h1 className="font-display text-[2rem] leading-tight font-extrabold sm:text-4xl">Escolha uma história</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink/75">
        Jogue uma de cada vez ou encare a jornada completa. Não existem respostas certas: escolha o que <em>você</em> faria de
        verdade.
      </p>

      {profile && !editingAge ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-bold text-ink/80">
          <span>
            🎂 Perguntas para {AGE_BAND_LABEL[profile.band]}
            {profile.under13 && ' (sem temas sensíveis)'}
          </span>
          <button type="button" onClick={() => setEditingAge(true)} className="min-h-11 font-extrabold text-brand underline underline-offset-4">
            Trocar idade
          </button>
        </p>
      ) : (
        <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <AgeForm
            compact
            onDone={(p) => {
              setProfile(p)
              setEditingAge(false)
            }}
          />
        </div>
      )}

      <div role="group" aria-label="Filtrar por tema" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ id: null, nome: 'Todos', icon: '✨' }, ...themes].map((t) => {
          const active = t.id === themeId
          return (
            <button
              key={t.id ?? 'todos'}
              type="button"
              aria-pressed={active}
              onClick={() => setThemeId(t.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-extrabold ring-1 transition active:scale-95 ${
                active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink ring-ink/10 md:hover:ring-ink/30'
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.nome}
            </button>
          )
        })}
      </div>

      {(theme?.descricao || theme?.aviso) && (
        <div className="mt-3 space-y-2" aria-live="polite">
          {theme.descricao && <p className="font-bold text-ink/75">{theme.descricao}</p>}
          {theme.aviso && (
            <p className="rounded-2xl bg-ink/5 px-4 py-3 text-ink/80">
              <span aria-hidden>💬 </span>
              {theme.aviso}
            </p>
          )}
        </div>
      )}

      <a
        href={`#/jogar/perguntas/${theme?.id ?? ALL_THEMES}`}
        className="mt-6 flex items-center gap-4 rounded-[1.75rem] bg-brand p-5 text-white shadow-xl shadow-brand/20 transition active:scale-[0.98] sm:p-6 md:hover:-translate-y-1"
      >
        <span className="text-4xl" aria-hidden>
          ⚡
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-extrabold">{theme ? `Partida rápida: ${theme.nome}` : 'Partida rápida'}</h2>
          <p className="text-white/85">
            {QUICK_PLAY_SIZE} perguntas sorteadas {theme ? 'deste tema' : 'de todos os temas'}
            {profile ? `, para ${AGE_BAND_LABEL[profile.band]}` : ''}. A cada partida, perguntas novas.
          </p>
        </div>
        <span className="hidden min-h-12 items-center justify-center rounded-full bg-white px-6 font-extrabold text-brand sm:flex">Jogar →</span>
      </a>

      {stories.length > 1 && (
        <a
          href={theme ? `#/jogar/tema/${theme.id}` : '#/jogar/jornada'}
          className="mt-4 flex flex-col gap-4 rounded-[1.75rem] bg-ink p-5 text-white shadow-xl shadow-ink/20 transition active:scale-[0.98] sm:flex-row sm:items-center sm:p-6 md:hover:-translate-y-1"
        >
          <div className="flex items-center -space-x-3">
            {stories.slice(0, 5).map((s) => (
              <EmotionAvatar key={s.id} id={s.cover} size={52} />
            ))}
            {stories.length > 5 && (
              <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/15 font-extrabold ring-2 ring-ink">
                +{stories.length - 5}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-extrabold">{theme ? `Jornada: ${theme.nome}` : 'Jornada completa'}</h2>
            <p className="text-white/80">
              {theme
                ? `As ${stories.length} histórias deste tema seguidas (≈${stories.length * 2} min).`
                : `Todas as ${STORIES.length} histórias seguidas, para um resultado mais completo (≈${STORIES.length * 2} min).`}
            </p>
          </div>
          <span className="flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-extrabold text-ink">Jogar →</span>
        </a>
      )}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {stories.map((s) => {
          const e = getEmotion(s.cover)
          return (
            <li key={s.id}>
              <a
                href={`#/jogar/${s.id}`}
                className="flex h-full items-center gap-4 rounded-3xl p-4 ring-1 ring-ink/5 transition active:scale-[0.98] sm:flex-col sm:items-start sm:p-6 md:hover:-translate-y-1 md:hover:shadow-lg"
                style={{ background: e.corSuave }}
              >
                <EmotionAvatar id={s.cover} size={64} className="shrink-0 sm:hidden" />
                <div className="hidden w-full items-start justify-between sm:flex">
                  <span className="text-4xl" aria-hidden>
                    {s.icon}
                  </span>
                  <EmotionAvatar id={s.cover} size={64} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl leading-tight font-extrabold" style={{ color: e.corForte }}>
                    <span className="sm:hidden" aria-hidden>
                      {s.icon}{' '}
                    </span>
                    {s.title}
                  </h3>
                  <p className="mt-1 text-ink/75">{s.tagline}</p>
                </div>
                <span className="text-2xl font-extrabold sm:hidden" style={{ color: e.corForte }} aria-hidden>
                  ›
                </span>
                <span className="hidden font-extrabold sm:block" style={{ color: e.corForte }}>
                  Jogar esta história →
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
