import { AGE_BANDS, type AgeProfile } from './age'
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

const AGE_KEY = 'emoquest:faixa-etaria'

/** Só a faixa etária fica guardada neste aparelho, nunca a idade exata. */
export function loadAgeProfile(): AgeProfile | null {
  try {
    const raw = localStorage.getItem(AGE_KEY)
    const profile = raw ? (JSON.parse(raw) as AgeProfile) : null
    // Faixa de uma versão anterior (ex.: "17-19"): pede a idade de novo.
    return profile && AGE_BANDS.includes(profile.band) ? profile : null
  } catch {
    return null
  }
}

export function saveAgeProfile(profile: AgeProfile | null): void {
  try {
    if (profile) localStorage.setItem(AGE_KEY, JSON.stringify(profile))
    else localStorage.removeItem(AGE_KEY)
  } catch {
    /* ignora */
  }
}
