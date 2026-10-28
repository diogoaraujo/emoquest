import { EmotionAvatar } from '../components/EmotionAvatar'
import { btnPrimary, btnSecondary } from '../components/ui'
import { EMOTIONS } from '../data/emotions'

const STEPS = [
  { n: '1', title: 'Viva situações reais', text: 'Escola nova, grupo do zap, véspera de prova, festa... histórias do seu dia a dia.' },
  { n: '2', title: 'Faça suas escolhas', text: 'Cada decisão muda o caminho da história e desperta emoções diferentes.' },
  { n: '3', title: 'Descubra seu mix', text: 'No final, veja quais emoções mais apareceram e o que elas têm a te dizer.' },
]

export function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-6 pt-6 pb-8 md:grid-cols-2 md:gap-10 md:py-16">
        {/* No celular a turma aparece primeiro: é o que chama para jogar. */}
        <div className="grid grid-cols-5 gap-1 sm:gap-4 md:order-last">
          {EMOTIONS.map((e, i) => (
            <a
              key={e.id}
              href="#/personagens"
              aria-label={`${e.personagem}, ${e.nome}`}
              className="flex flex-col items-center rounded-2xl p-1 transition active:scale-90 md:hover:scale-110"
            >
              <span className="block aspect-square w-full max-w-24 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                <EmotionAvatar id={e.id} size="100%" />
              </span>
              <span className="hidden text-sm font-extrabold sm:block" style={{ color: e.corForte }}>
                {e.personagem}
              </span>
            </a>
          ))}
        </div>
        <div className="animate-pop">
          <p className="mb-3 inline-block rounded-full bg-brand/10 px-4 py-1 text-sm font-extrabold text-brand">
            Um jogo sobre o que acontece aí dentro
          </p>
          <h1 className="font-display text-[2.5rem] leading-[1.05] font-extrabold sm:text-6xl">
            Suas escolhas,
            <br />
            <span className="bg-gradient-to-r from-[#F2701F] via-[#E8508E] to-brand bg-clip-text text-transparent">suas emoções.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-ink/80">
            No <strong>EmoQuest</strong>, você vive histórias do cotidiano e conhece dez personagens que representam emoções que
            todo mundo sente. Nenhuma delas é boa ou ruim: cada uma tem algo importante para te contar.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#/jogar/jornada" className={btnPrimary}>
              Começar a jornada ✨
            </a>
            <a href="#/jogar" className={btnSecondary}>
              Escolher história
            </a>
          </div>
          <a href="#/sala" className="mt-4 inline-flex min-h-12 items-center gap-2 font-extrabold text-brand underline-offset-4 hover:underline">
            <span aria-hidden>🔑</span> Recebeu um código de sala? Entre aqui
          </a>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <h2 className="mb-4 font-display text-3xl font-extrabold md:mb-6 md:text-center">Como funciona</h2>
        <ol className="grid gap-3 md:grid-cols-3 md:gap-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 md:flex-col md:gap-3 md:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand font-display text-xl font-extrabold text-white">
                {s.n}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-ink/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="my-6 grid items-center gap-4 rounded-[2rem] bg-gradient-to-br from-[#E3ECFF] via-[#FFE3EE] to-[#FFF4D1] p-6 md:my-8 md:grid-cols-[auto_1fr] md:gap-6 md:p-8">
        <div className="flex justify-center -space-x-6">
          <EmotionAvatar id="tristeza" size={84} />
          <EmotionAvatar id="alegria" size={104} />
          <EmotionAvatar id="raiva" size={84} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold">Não existe emoção boa ou ruim</h2>
          <p className="mt-2 text-ink/80">
            Todas as emoções são mensageiras. A tristeza pede pausa, a raiva protege seus limites, o medo te alerta sobre perigos, o
            tédio abre espaço para ideias novas. O que faz diferença é como a gente escuta e lida com cada uma.
          </p>
          <a href="#/emocoes" className="mt-2 inline-flex min-h-12 items-center font-extrabold text-brand underline-offset-4 hover:underline">
            Entender melhor as emoções →
          </a>
        </div>
      </section>
    </div>
  )
}
