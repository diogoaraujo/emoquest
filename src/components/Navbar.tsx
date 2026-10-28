import type { ReactNode } from 'react'

interface NavLink {
  to: string
  label: string
  short: string
  icon: ReactNode
}

const icon = (d: string) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

const LINKS: NavLink[] = [
  { to: '/', label: 'Início', short: 'Início', icon: icon('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z') },
  { to: '/jogar', label: 'Jogar', short: 'Jogar', icon: icon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.5v7l6-3.5z') },
  {
    to: '/personagens',
    label: 'Personagens',
    short: 'Turma',
    icon: icon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01'),
  },
  { to: '/emocoes', label: 'Sobre as emoções', short: 'Emoções', icon: icon('M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 11h5') },
  { to: '/painel', label: 'Salas', short: 'Salas', icon: icon('M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8') },
]

const isActive = (route: string, to: string) => (to === '/' ? route === '/' : route.startsWith(to))

/**
 * Celular: cabeçalho enxuto + barra de abas fixa no rodapé (alcance do polegar).
 * Tablet/desktop: links no cabeçalho. Em modo imersivo (durante o jogo) as barras somem no celular.
 */
export function Navbar({ route, immersive }: { route: string; immersive: boolean }) {
  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-ink/10 bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur print:hidden ${
          immersive ? 'hidden md:block' : ''
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16" aria-label="Principal">
          <a href="#/" className="flex min-h-12 items-center font-display text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#FF8A3D] via-[#FF6FA5] to-brand bg-clip-text text-transparent">Emo</span>
            <span>Quest</span>
          </a>
          <div className="flex items-center">
            <ul className="hidden gap-1 md:flex">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <a
                    href={`#${l.to}`}
                    aria-current={isActive(route, l.to) ? 'page' : undefined}
                    className={`flex min-h-11 items-center rounded-full px-4 font-bold transition ${
                      isActive(route, l.to) ? 'bg-ink text-white' : 'hover:bg-ink/5'
                    }`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#/sala"
              aria-current={route === '/sala' ? 'page' : undefined}
              aria-label="Entrar numa sala com código"
              className="flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-4 font-extrabold text-white transition active:scale-95 md:hidden lg:ml-2 lg:flex"
            >
              <span aria-hidden>🔑</span>
              <span className="min-[400px]:hidden">Código</span>
              <span className="hidden min-[400px]:inline">Tenho um código</span>
            </a>
          </div>
        </nav>
      </header>

      {!immersive && (
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
          aria-label="Navegação"
        >
          <ul className="grid grid-cols-5">
            {LINKS.map((l) => {
              const active = isActive(route, l.to)
              return (
                <li key={l.to}>
                  <a
                    href={`#${l.to}`}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-extrabold transition active:scale-95 ${
                      active ? 'text-brand' : 'text-ink/70'
                    }`}
                  >
                    <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${active ? 'bg-brand/12' : ''}`}>{l.icon}</span>
                    {l.short}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </>
  )
}
