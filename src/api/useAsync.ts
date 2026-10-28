import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from './client'

/**
 * Carrega dados e mantém o último valor durante recargas (sem "piscar" a tela).
 * `pollMs` refaz a busca periodicamente (ex.: acompanhar uma sessão ao vivo).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], pollMs?: number) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fnRef.current())
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'Erro inesperado.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setData(null)
    reload()
    if (!pollMs) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') reload()
    }, pollMs)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, pollMs])

  return { data, error, loading, reload, setData }
}
