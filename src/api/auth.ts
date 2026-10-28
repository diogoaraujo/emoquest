import { useEffect, useState } from 'react'
import { api, authStore, type AuthUser } from './client'

const EVENT = 'emoquest:auth'

export function setSession(value: { token: string; user: AuthUser } | null) {
  authStore.set(value)
  window.dispatchEvent(new Event(EVENT))
}

export async function logout() {
  try {
    await api.logout()
  } catch {
    /* mesmo offline, sai localmente */
  }
  setSession(null)
}

/** Usuário logado (responsável), sincronizado entre abas e componentes. */
export function useAuth(): AuthUser | null {
  const [user, setUser] = useState(() => authStore.get()?.user ?? null)
  useEffect(() => {
    const sync = () => setUser(authStore.get()?.user ?? null)
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return user
}
