import type { AgeBand } from '../lib/age'
import type { GroupFormat } from '../lib/groupFormat'
import type { EmotionId, Scores } from '../types'

/** Em desenvolvimento o Vite redireciona /api para o servidor local; em produção use VITE_API_URL. */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// ---------- Armazenamento local (tokens) ----------

const AUTH_KEY = 'emoquest:auth'
const PARTICIPANT_KEY = 'emoquest:salas'

export interface AuthUser {
  id: string
  name: string
  email: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível */
  }
}

export const authStore = {
  get: () => readJson<{ token: string; user: AuthUser } | null>(AUTH_KEY, null),
  set: (v: { token: string; user: AuthUser } | null) => writeJson(AUTH_KEY, v),
}

/** Token de participante por código de sala (fica só neste aparelho). */
export const participantStore = {
  get: (code: string) => readJson<Record<string, string>>(PARTICIPANT_KEY, {})[code.toUpperCase()],
  set: (code: string, token: string | null) => {
    const all = readJson<Record<string, string>>(PARTICIPANT_KEY, {})
    if (token) all[code.toUpperCase()] = token
    else delete all[code.toUpperCase()]
    writeJson(PARTICIPANT_KEY, all)
  },
}

// ---------- Requisições ----------

interface RequestOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  participant?: string
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['content-type'] = 'application/json'
  if (opts.auth) {
    const token = authStore.get()?.token
    if (token) headers.authorization = `Bearer ${token}`
  }
  if (opts.participant) headers['x-participant-token'] = opts.participant

  let res: Response
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique sua internet e tente de novo.')
  }
  const data = res.status === 204 ? {} : await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && opts.auth) authStore.set(null)
    throw new ApiError(res.status, (data as { error?: string }).error ?? 'Algo deu errado. Tente de novo.')
  }
  return data as T
}

// ---------- Tipos de resposta ----------

export interface Room {
  id: string
  name: string
  description: string
  joinCode: string
  joinUrl: string
  shareUrl: string | null
  minGroupSize: number
  retentionDays: number
  createdAt: string
  participants?: number
  sessions?: number
}

export type Activity = 'historias' | 'checkin'

export interface Session {
  id: string
  roomId: string
  title: string
  activity: Activity
  storyIds: string[]
  status: 'aberta' | 'encerrada'
  createdAt: string
  closedAt: string | null
  completed: number
}

export type EmotionMap = Record<EmotionId, number>

export interface OwnerSessionStats {
  id: string
  title: string
  activity: Activity
  status: string
  date: string
  n: number
  shares: EmotionMap
  dominant: EmotionMap
}

export interface PublicSessionStats {
  id: string
  title: string
  activity: Activity
  date: string
  suppressed: boolean
  reason?: 'aberta' | 'poucos-participantes'
  format?: GroupFormat | null
  nAtLeast: number | null
  shares: EmotionMap | null
  dominantPct: Record<EmotionId, number | null> | null
}

export type DashboardData =
  | {
      mode: 'owner'
      room: { name: string; minGroupSize: number }
      totals: { participants: number; sessions: number; results: number; shares: EmotionMap }
      sessions: OwnerSessionStats[]
    }
  | {
      mode: 'public'
      room: { name: string; minGroupSize: number }
      totals: { sessions: number; visibleSessions: number; shares: EmotionMap }
      sessions: PublicSessionStats[]
    }

export interface Participant {
  id: string
  displayName: string | null
  ageBand: AgeBand | null
  joinedAt: string
  lastSeenAt: string
  sessionsCompleted: number
}

export interface IndividualResult {
  participantId: string
  displayName: string | null
  scores: Scores
  dominant: EmotionId
  completedAt: string
}

export interface ParticipantSession {
  id: string
  title: string
  activity: Activity
  storyIds: string[]
  status: 'aberta' | 'encerrada'
  done: boolean
}

// ---------- Endpoints ----------

type RoomInput = { name: string; description?: string; minGroupSize?: number; retentionDays?: number }

export const api = {
  register: (body: { name: string; email: string; password: string; acceptTerms: boolean }) =>
    request<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) => request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST', auth: true }),
  deleteAccount: (password: string) => request<{ ok: true }>('/auth/me', { method: 'DELETE', auth: true, body: { password } }),

  rooms: () => request<{ rooms: Room[] }>('/rooms', { auth: true }),
  createRoom: (body: RoomInput & { legalBasisAck: boolean }) => request<{ room: Room }>('/rooms', { method: 'POST', auth: true, body }),
  room: (id: string) => request<{ room: Room }>(`/rooms/${id}`, { auth: true }),
  updateRoom: (id: string, body: Partial<RoomInput>) => request<{ room: Room }>(`/rooms/${id}`, { method: 'PATCH', auth: true, body }),
  deleteRoom: (id: string) => request<{ ok: true }>(`/rooms/${id}`, { method: 'DELETE', auth: true }),
  rotateJoinCode: (id: string) => request<{ room: Room }>(`/rooms/${id}/join-code`, { method: 'POST', auth: true }),
  enableShare: (id: string) => request<{ room: Room }>(`/rooms/${id}/share`, { method: 'POST', auth: true }),
  disableShare: (id: string) => request<{ room: Room }>(`/rooms/${id}/share`, { method: 'DELETE', auth: true }),

  participants: (roomId: string) => request<{ participants: Participant[] }>(`/rooms/${roomId}/participants`, { auth: true }),
  deleteParticipant: (roomId: string, pid: string) => request<{ ok: true }>(`/rooms/${roomId}/participants/${pid}`, { method: 'DELETE', auth: true }),

  sessions: (roomId: string) => request<{ sessions: Session[] }>(`/rooms/${roomId}/sessions`, { auth: true }),
  createSession: (roomId: string, body: { title: string; activity: Activity; storyIds: string[] }) =>
    request<{ session: Session }>(`/rooms/${roomId}/sessions`, { method: 'POST', auth: true, body }),
  updateSession: (roomId: string, sid: string, body: { status?: 'aberta' | 'encerrada'; title?: string }) =>
    request<{ session: Session }>(`/rooms/${roomId}/sessions/${sid}`, { method: 'PATCH', auth: true, body }),
  deleteSession: (roomId: string, sid: string) => request<{ ok: true }>(`/rooms/${roomId}/sessions/${sid}`, { method: 'DELETE', auth: true }),
  sessionResults: (roomId: string, sid: string) =>
    request<{ session: Session; stats: OwnerSessionStats; results: IndividualResult[] }>(`/rooms/${roomId}/sessions/${sid}/results`, { auth: true }),
  dashboard: (roomId: string) => request<DashboardData>(`/rooms/${roomId}/dashboard`, { auth: true }),
  shared: (token: string) => request<DashboardData>(`/shared/${token}`),

  publicRoom: (code: string) =>
    request<{ room: { name: string; description: string; ownerName: string; retentionDays: number; minGroupSize: number }; consentVersion: string }>(
      `/public/rooms/${encodeURIComponent(code)}`,
    ),
  join: (code: string, body: { displayName?: string; age?: number; consent: boolean; consentVersion: string }) =>
    request<{ participantToken: string }>(`/public/rooms/${encodeURIComponent(code)}/join`, { method: 'POST', body }),
  me: (participant: string) =>
    request<{ room: { name: string; joinCode: string }; displayName: string | null; sessions: ParticipantSession[] }>('/public/me', { participant }),
  leave: (participant: string) => request<{ ok: true }>('/public/me', { method: 'DELETE', participant }),
  restart: (participant: string, sid: string) => request<{ ok: true }>(`/public/sessions/${sid}/restart`, { method: 'POST', participant }),
  respond: (participant: string, sid: string, body: { storyId: string; nodeId: string; choiceIndex: number }) =>
    request<{ ok: true }>(`/public/sessions/${sid}/responses`, { method: 'POST', participant, body }),
  complete: (participant: string, sid: string) => request<{ scores: Scores; dominant: EmotionId }>(`/public/sessions/${sid}/complete`, { method: 'POST', participant }),
  checkin: (participant: string, sid: string, items: { emotion: EmotionId; intensity: number }[]) =>
    request<{ scores: Scores; dominant: EmotionId }>(`/public/sessions/${sid}/checkin`, { method: 'POST', participant, body: { items } }),
  mine: (participant: string, sid: string) =>
    request<{ session: ParticipantSession; scores: Scores; dominant: EmotionId }>(`/public/sessions/${sid}/mine`, { participant }),
  group: (participant: string, sid: string) => request<{ stats: PublicSessionStats; minGroupSize: number }>(`/public/sessions/${sid}/group`, { participant }),
}
