import { useEffect, useState } from 'react'

const current = () => window.location.hash.replace(/^#/, '') || '/'

/** Roteamento mínimo por hash (#/jogar, #/personagens...), compatível com GitHub Pages. */
export function useHashRoute(): string {
  const [path, setPath] = useState(current)

  useEffect(() => {
    const onChange = () => {
      setPath(current())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export function navigate(to: string) {
  window.location.hash = to
}
