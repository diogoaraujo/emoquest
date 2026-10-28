import { EmotionAvatar } from '../components/EmotionAvatar'
import { EmotionInfo } from '../components/EmotionDetail'
import { EMOTIONS } from '../data/emotions'

const BASICS = [
  {
    title: 'Emoções são mensageiras',
    text: 'Cada emoção carrega uma informação: algo importa, algo é perigoso, algo é injusto, algo te faz falta. Ouvir a mensagem ajuda a decidir o que fazer.',
  },
  {
    title: 'Nenhuma é boa ou ruim',
    text: 'Algumas são agradáveis de sentir e outras são desconfortáveis, mas todas têm uma função. O que pode ajudar ou atrapalhar é o jeito como agimos com elas.',
  },
  {
    title: 'Elas se misturam',
    text: 'É comum sentir alegria e medo antes de algo novo, ou nostalgia e tristeza ao rever fotos. Sentir várias coisas ao mesmo tempo é normal.',
  },
  {
    title: 'Dar nome ajuda',
    text: 'Quando você diz "estou com vergonha" ou "estou ansioso, ansiosa", a emoção fica mais fácil de entender e de acolher. Isso é inteligência emocional.',
  },
]

export function Learn() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-8 md:py-10">
      <h1 className="font-display text-[2rem] leading-tight font-extrabold sm:text-4xl">Sobre as emoções</h1>
      <p className="mt-2 text-lg text-ink/70">
        Entender o que a gente sente é um superpoder. Aqui vai um guia rápido para conhecer cada emoção da turma do EmoQuest.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {BASICS.map((b) => (
          <div key={b.title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
            <h2 className="font-display text-xl font-bold">{b.title}</h2>
            <p className="mt-1 text-ink/75">{b.text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-display text-[1.75rem] leading-tight sm:text-3xl font-extrabold">As dez emoções</h2>
      <div className="space-y-3">
        {EMOTIONS.map((e) => (
          <details key={e.id} className="group overflow-hidden rounded-3xl ring-1 ring-ink/10" style={{ background: e.corSuave }}>
            <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 p-3 sm:gap-4 sm:p-4 [&::-webkit-details-marker]:hidden">
              <EmotionAvatar id={e.id} size={64} />
              <div className="flex-1">
                <h3 className="font-display text-xl font-extrabold" style={{ color: e.corForte }}>
                  {e.nome}
                </h3>
                <p className="text-sm font-bold text-ink/75">
                  {e.personagem} · “{e.frase}”
                </p>
              </div>
              <span className="text-2xl font-bold transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <div className="bg-white p-5 sm:p-6">
              <EmotionInfo id={e.id} />
            </div>
          </details>
        ))}
      </div>

      <section className="mt-10 rounded-[2rem] bg-ink p-5 text-white sm:p-8">
        <h2 className="font-display text-2xl font-extrabold">Precisa conversar?</h2>
        <p className="mt-2 text-white/85">
          Se alguma emoção estiver muito pesada, durando muito tempo ou atrapalhando sua rotina, você não precisa lidar com isso
          sem apoio. Fale com alguém de confiança — família, professores, orientação escolar — ou procure um profissional de saúde.
        </p>
        <p className="mt-3 text-white/85">
          <strong>CVV — Centro de Valorização da Vida:</strong> ligue{' '}
          <a href="tel:188" className="font-extrabold underline underline-offset-4">
            188
          </a>{' '}
          (gratuito, 24h) ou acesse{' '}
          <a href="https://cvv.org.br" target="_blank" rel="noreferrer" className="font-extrabold underline underline-offset-4">
            cvv.org.br
          </a>
          .
        </p>
      </section>
    </div>
  )
}
