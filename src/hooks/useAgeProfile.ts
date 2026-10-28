import { useState } from 'react'
import type { AgeProfile } from '../lib/age'
import { loadAgeProfile, saveAgeProfile } from '../lib/storage'

/** Faixa etária do jogador neste aparelho (null = ainda não informou). */
export function useAgeProfile() {
  const [profile, setProfile] = useState<AgeProfile | null>(loadAgeProfile)
  const update = (next: AgeProfile | null) => {
    saveAgeProfile(next)
    setProfile(next)
  }
  return [profile, update] as const
}
