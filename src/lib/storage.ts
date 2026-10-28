import type { RunResult } from '../types'

const KEY = 'emoquest:ultimo-resultado'

// localStorage pode falhar (aba anônima, bloqueio de cookies): o jogo segue funcionando sem ele.
export function loadResult(): RunResult | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as RunResult) : null
  } catch {
    return null
  }
}

export function saveResult(result: RunResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(result))
  } catch {
    /* ignora */
  }
}
