import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'
import { loadConfig } from '../src/config'
import { openDatabase, type Database } from '../src/db/client'
import { gameSessions } from '../src/db/schema'
import { applyRetention } from '../src/lib/retention'

let database: Database
let app: FastifyInstance
const config = { ...loadConfig({}), consentVersion: 'teste-1' }

type Json = Record<string, any>

async function call(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, opts: { body?: unknown; token?: string; participant?: string } = {}) {
  const headers: Record<string, string> = {}
  if (opts.token) headers.authorization = `Bearer ${opts.token}`
  if (opts.participant) headers['x-participant-token'] = opts.participant
  const res = await app.inject({ method, url, headers, payload: opts.body as Json | undefined })
  return { status: res.statusCode, body: res.body ? (JSON.parse(res.body) as Json) : {}, raw: res.body }
}

async function registerOwner(email: string) {
  const r = await call('POST', '/api/auth/register', { body: { name: 'Prof. Teste', email, password: 'senha-segura-123', acceptTerms: true } })
  expect(r.status).toBe(201)
  return r.body.token as string
}

async function join(code: string, displayName?: string) {
  const r = await call('POST', `/api/public/rooms/${code}/join`, { body: { displayName, consent: true, consentVersion: 'teste-1' } })
  expect(r.status).toBe(201)
  return r.body.participantToken as string
}

/** Caminho válido da história "escola-nova" que termina num final. */
const PATH = [
  { storyId: 'escola-nova', nodeId: 'inicio', choiceIndex: 0 },
  { storyId: 'escola-nova', nodeId: 'conversa', choiceIndex: 0 },
  { storyId: 'escola-nova', nodeId: 'intervalo', choiceIndex: 0 },
]

async function playFull(sessionId: string, participant: string) {
  for (const step of PATH) expect((await call('POST', `/api/public/sessions/${sessionId}/responses`, { participant, body: step })).status).toBe(201)
  return call('POST', `/api/public/sessions/${sessionId}/complete`, { participant })
}

let ownerA: string
let ownerB: string
let room: Json
let session: Json

beforeAll(async () => {
  database = await openDatabase({ pgliteDir: 'memory' })
  app = await buildApp(database.db, config)
  ownerA = await registerOwner('a@escola.br')
  ownerB = await registerOwner('b@escola.br')
  room = (await call('POST', '/api/rooms', { token: ownerA, body: { name: '1º ano B', legalBasisAck: true } })).body.room
  session = (await call('POST', `/api/rooms/${room.id}/sessions`, { token: ownerA, body: { title: 'Semana 1', activity: 'historias', storyIds: ['escola-nova'] } })).body.session
})

afterAll(async () => {
  await app.close()
  await database.close()
})

describe('autenticação e isolamento por sala', () => {
  it('exige login nas rotas do responsável', async () => {
    expect((await call('GET', '/api/rooms')).status).toBe(401)
  })

  it('não permite criar sala sem declarar base legal', async () => {
    expect((await call('POST', '/api/rooms', { token: ownerA, body: { name: 'X' } })).status).toBe(400)
  })

  it('não permite k abaixo de 5', async () => {
    expect((await call('POST', '/api/rooms', { token: ownerA, body: { name: 'Sala', legalBasisAck: true, minGroupSize: 2 } })).status).toBe(400)
  })

  it('outra conta não enxerga nem altera a sala (404, sem revelar existência)', async () => {
    for (const [m, url] of [
      ['GET', `/api/rooms/${room.id}`],
      ['GET', `/api/rooms/${room.id}/participants`],
      ['GET', `/api/rooms/${room.id}/dashboard`],
      ['GET', `/api/rooms/${room.id}/sessions/${session.id}/results`],
      ['DELETE', `/api/rooms/${room.id}`],
    ] as const) {
      expect((await call(m, url, { token: ownerB })).status).toBe(404)
    }
    expect((await call('GET', '/api/rooms', { token: ownerB })).body.rooms).toHaveLength(0)
  })

  it('login com senha errada falha', async () => {
    expect((await call('POST', '/api/auth/login', { body: { email: 'a@escola.br', password: 'errada' } })).status).toBe(401)
  })
})

describe('participação e regras do jogo', () => {
  it('exige consentimento para entrar', async () => {
    const r = await call('POST', `/api/public/rooms/${room.joinCode}/join`, { body: { displayName: 'Ana', consentVersion: 'teste-1' } })
    expect(r.status).toBe(400)
  })

  it('rejeita escolha fora do caminho e conclusão antecipada; calcula pontos no servidor', async () => {
    const p = await join(room.joinCode, 'Ana Souza')
    const skip = await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[1] })
    expect(skip.status).toBe(409)
    const bogus = await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: { ...PATH[0], choiceIndex: 9 } })
    expect(bogus.status).toBe(400)
    await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[0] })
    expect((await call('POST', `/api/public/sessions/${session.id}/complete`, { participant: p })).status).toBe(400)
    await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[1] })
    await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[2] })
    const done = await call('POST', `/api/public/sessions/${session.id}/complete`, { participant: p })
    expect(done.status).toBe(200)
    expect(done.body.dominant).toBe('alegria')
    expect(done.body.scores).toMatchObject({ alegria: 6, medo: 2, ansiedade: 1 })
    expect((await call('POST', `/api/public/sessions/${session.id}/complete`, { participant: p })).status).toBe(409)
  })

  it('permite recomeçar uma partida interrompida', async () => {
    const p = await join(room.joinCode)
    await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[0] })
    expect((await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[0] })).status).toBe(409)
    expect((await call('POST', `/api/public/sessions/${session.id}/restart`, { participant: p })).status).toBe(200)
    expect((await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[0] })).status).toBe(201)
    await call('DELETE', '/api/public/me', { participant: p })
  })

  it('participante de uma sala não acessa sessão de outra sala', async () => {
    const other = (await call('POST', '/api/rooms', { token: ownerB, body: { name: 'Outra', legalBasisAck: true } })).body.room
    const p = await join(other.joinCode, 'Bia')
    expect((await call('POST', `/api/public/sessions/${session.id}/responses`, { participant: p, body: PATH[0] })).status).toBe(404)
  })

  it('check-in valida emoções e intensidades', async () => {
    const s = (await call('POST', `/api/rooms/${room.id}/sessions`, { token: ownerA, body: { title: 'Check-in', activity: 'checkin' } })).body.session
    const p = await join(room.joinCode)
    expect((await call('POST', `/api/public/sessions/${s.id}/checkin`, { participant: p, body: { items: [{ emotion: 'xyz', intensity: 1 }] } })).status).toBe(400)
    const ok = await call('POST', `/api/public/sessions/${s.id}/checkin`, { participant: p, body: { items: [{ emotion: 'medo', intensity: 3 }, { emotion: 'alegria', intensity: 1 }] } })
    expect(ok.body.dominant).toBe('medo')
  })
})

describe('privacidade e anonimização', () => {
  const NAMES = ['Ana Souza', 'Carlos', 'Duda', 'Enzo', 'Fê', 'Gabi']

  it('agregado fica oculto enquanto a sessão está aberta e com menos de k pessoas', async () => {
    const p = await join(room.joinCode, 'Carlos')
    await playFull(session.id, p)
    const open = await call('GET', `/api/public/sessions/${session.id}/group`, { participant: p })
    expect(open.body.stats).toMatchObject({ suppressed: true, reason: 'aberta', shares: null })

    await call('PATCH', `/api/rooms/${room.id}/sessions/${session.id}`, { token: ownerA, body: { status: 'encerrada' } })
    const small = await call('GET', `/api/public/sessions/${session.id}/group`, { participant: p })
    expect(small.body.stats).toMatchObject({ suppressed: true, reason: 'poucos-participantes' })
  })

  it('com k participantes mostra só valores generalizados, e nunca nomes', async () => {
    await call('PATCH', `/api/rooms/${room.id}/sessions/${session.id}`, { token: ownerA, body: { status: 'aberta' } })
    for (const name of NAMES.slice(2)) await playFull(session.id, await join(room.joinCode, name))
    await call('PATCH', `/api/rooms/${room.id}/sessions/${session.id}`, { token: ownerA, body: { status: 'encerrada' } })

    const viewer = await join(room.joinCode, 'Visitante')
    const group = await call('GET', `/api/public/sessions/${session.id}/group`, { participant: viewer })
    expect(group.body.stats.suppressed).toBe(false)
    expect(group.body.stats.nAtLeast).toBe(5) // 6 pessoas → faixa "5 ou mais"
    expect(group.body.stats.dominantPct.alegria).toBe(100)

    const share = (await call('POST', `/api/rooms/${room.id}/share`, { token: ownerA })).body.room.shareUrl as string
    const shared = await call('GET', `/api/shared/${share.split('/').pop()}`)
    expect(shared.status).toBe(200)
    for (const res of [group, shared, await call('GET', `/api/rooms/${room.id}/dashboard`, { token: ownerA })]) {
      for (const name of NAMES) expect(res.raw).not.toContain(name)
      expect(res.raw).not.toContain('participantId')
      expect(res.raw).not.toContain('@escola.br')
    }
  })

  it('células pequenas são suprimidas no painel compartilhado', async () => {
    // 6 pessoas, todas com alegria; adiciona 2 com medo em outra sessão encerrada → célula "medo" < 3.
    const s = (await call('POST', `/api/rooms/${room.id}/sessions`, { token: ownerA, body: { title: 'Mix', activity: 'checkin' } })).body.session
    const answers = ['alegria', 'alegria', 'alegria', 'alegria', 'medo', 'medo']
    for (const emotion of answers) {
      await call('POST', `/api/public/sessions/${s.id}/checkin`, { participant: await join(room.joinCode), body: { items: [{ emotion, intensity: 2 }] } })
    }
    await call('PATCH', `/api/rooms/${room.id}/sessions/${s.id}`, { token: ownerA, body: { status: 'encerrada' } })
    const token = (await call('GET', `/api/rooms/${room.id}`, { token: ownerA })).body.room.shareUrl.split('/').pop()
    const mix = (await call('GET', `/api/shared/${token}`)).body.sessions.find((x: Json) => x.id === s.id)
    expect(mix.dominantPct.medo).toBeNull()
    expect(mix.dominantPct.alegria).toBe(65) // 4/6 = 66,7% → passos de 5%
  })

  it('nomes aparecem apenas para o responsável', async () => {
    const res = await call('GET', `/api/rooms/${room.id}/sessions/${session.id}/results`, { token: ownerA })
    expect(res.raw).toContain('Ana Souza')
  })

  it('compartilhamento desativado invalida o link', async () => {
    const token = (await call('GET', `/api/rooms/${room.id}`, { token: ownerA })).body.room.shareUrl.split('/').pop()
    await call('DELETE', `/api/rooms/${room.id}/share`, { token: ownerA })
    expect((await call('GET', `/api/shared/${token}`)).status).toBe(404)
  })

  it('o jovem pode apagar a própria participação e o agregado é recalculado', async () => {
    const before = (await call('GET', `/api/rooms/${room.id}/dashboard`, { token: ownerA })).body.sessions.find((x: Json) => x.id === session.id).n
    await call('PATCH', `/api/rooms/${room.id}/sessions/${session.id}`, { token: ownerA, body: { status: 'aberta' } })
    const p = await join(room.joinCode, 'Temporário')
    await playFull(session.id, p)
    expect((await call('DELETE', '/api/public/me', { participant: p })).status).toBe(200)
    const after = (await call('GET', `/api/rooms/${room.id}/dashboard`, { token: ownerA })).body.sessions.find((x: Json) => x.id === session.id).n
    expect(after).toBe(before)
    expect((await call('GET', '/api/public/me', { participant: p })).status).toBe(401)
  })
})

describe('retenção', () => {
  it('mantém só o agregado de sessões antigas com k pessoas e apaga as pequenas', async () => {
    const db = database.db
    const small = (await call('POST', `/api/rooms/${room.id}/sessions`, { token: ownerA, body: { title: 'Antiga pequena', activity: 'checkin' } })).body.session
    await call('POST', `/api/public/sessions/${small.id}/checkin`, { participant: await join(room.joinCode), body: { items: [{ emotion: 'tedio', intensity: 1 }] } })
    const old = new Date(Date.now() - 400 * 86_400_000)
    await db.update(gameSessions).set({ createdAt: old }).where(eq(gameSessions.id, small.id))
    await db.update(gameSessions).set({ createdAt: old }).where(eq(gameSessions.id, session.id))

    const summary = await applyRetention(db, 5)
    expect(summary.sessionsDeleted).toBeGreaterThanOrEqual(1)
    const dash = (await call('GET', `/api/rooms/${room.id}/dashboard`, { token: ownerA })).body
    expect(dash.sessions.find((x: Json) => x.id === small.id)).toBeUndefined()
    expect(dash.sessions.find((x: Json) => x.id === session.id).n).toBeGreaterThanOrEqual(5)
    expect((await call('GET', `/api/rooms/${room.id}/sessions/${session.id}/results`, { token: ownerA })).body.results).toHaveLength(0)
  })
})

describe('exclusão de conta', () => {
  it('apaga a conta e todas as salas em cascata', async () => {
    const t = await registerOwner('c@escola.br')
    const r = (await call('POST', '/api/rooms', { token: t, body: { name: 'Temp', legalBasisAck: true } })).body.room
    expect((await call('DELETE', '/api/auth/me', { token: t, body: { password: 'senha-segura-123' } })).status).toBe(200)
    expect((await call('GET', `/api/public/rooms/${r.joinCode}`)).status).toBe(404)
  })
})
