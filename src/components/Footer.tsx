export function Footer({ hiddenOnMobile = false }: { hiddenOnMobile?: boolean }) {
  return (
    <footer
      className={`border-t border-ink/10 py-8 text-center text-sm text-ink/70 print:hidden md:mt-16 ${
        hiddenOnMobile ? 'hidden md:block' : 'mb-[calc(4rem+env(safe-area-inset-bottom))] md:mb-0'
      }`}
    >
      <p className="mx-auto max-w-2xl px-4">
        EmoQuest é um jogo educativo e não substitui acompanhamento profissional. Se você estiver passando por um momento difícil,
        converse com um adulto de confiança ou ligue para o{' '}
        <a href="tel:188" className="font-extrabold underline underline-offset-4">
          CVV — 188
        </a>{' '}
        (gratuito, 24h).
      </p>
      <p className="mt-3">
        <a href="#/privacidade" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
          Privacidade e proteção de dados
        </a>
      </p>
    </footer>
  )
}
