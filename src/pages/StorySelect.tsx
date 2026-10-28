import { EmotionAvatar } from '../components/EmotionAvatar'
import { getEmotion } from '../data/emotions'
import { STORIES } from '../data/stories'

export function StorySelect() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-8 md:py-10">
      <h1 className="font-display text-[2rem] leading-tight font-extrabold sm:text-4xl">Escolha uma história</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink/75">
        Jogue uma de cada vez ou encare a jornada completa. Não existem respostas certas: escolha o que <em>você</em> faria de
        verdade.
      </p>

      <a
        href="#/jogar/jornada"
        className="mt-6 flex flex-col gap-4 rounded-[1.75rem] bg-ink p-5 text-white shadow-xl shadow-ink/20 transition active:scale-[0.98] sm:flex-row sm:items-center sm:p-6 md:hover:-translate-y-1"
      >
        <div className="flex -space-x-3">
          {STORIES.map((s) => (
            <EmotionAvatar key={s.id} id={s.cover} size={52} />
          ))}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-extrabold">Jornada completa</h2>
          <p className="text-white/80">Todas as {STORIES.length} histórias seguidas, para um resultado mais completo (≈10 min).</p>
        </div>
        <span className="flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-extrabold text-ink">Jogar →</span>
      </a>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {STORIES.map((s) => {
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
