/** Faixas etárias do jogo. Guardamos só a faixa, nunca a idade exata. */
export const AGE_BANDS = ['13-16', '17-23'] as const

export type AgeBand = (typeof AGE_BANDS)[number]

export const AGE_BAND_LABEL: Record<AgeBand, string> = { '13-16': '13 a 16 anos', '17-23': '17 a 23 anos' }

export const MIN_AGE = 5
export const MAX_AGE = 99

export interface AgeProfile {
  band: AgeBand
  /** Menos de 13 anos: joga com a faixa 13–16, mas sem os temas sensíveis. */
  under13: boolean
}

/** Quem está fora das faixas joga com a mais próxima: ninguém é barrado. */
export function ageProfile(age: number): AgeProfile {
  const band: AgeBand = age <= 16 ? '13-16' : '17-23'
  return { band, under13: age < 13 }
}

export const isValidAge = (age: number) => Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE
