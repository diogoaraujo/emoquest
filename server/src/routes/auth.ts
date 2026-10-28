import type { FastifyPluginAsync } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { HttpError, type AppContext } from '../app'
import { authTokens, users } from '../db/schema'
import { hashPassword, randomToken, sha256, verifyPassword } from '../lib/crypto'

const registerBody = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email: z.email('E-mail inválido.').max(160).transform((e) => e.toLowerCase()),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(200),
  acceptTerms: z.literal(true, { error: 'É preciso aceitar os termos e a política de privacidade.' }),
})

const loginBody = z.object({
  email: z.email('E-mail inválido.').transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(200),
})

// Hash fixo para gastar o mesmo tempo quando o e-mail não existe (evita descobrir contas por tempo de resposta).
const DUMMY_HASH = await hashPassword('emoquest-dummy-password')

const publicUser = (u: typeof users.$inferSelect) => ({ id: u.id, name: u.name, email: u.email })

export const authRoutes =
  (ctx: AppContext): FastifyPluginAsync =>
  async (app) => {
    const { db, config } = ctx
    const strict = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }

    async function issueToken(userId: string) {
      const token = randomToken()
      await db.insert(authTokens).values({
        userId,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + config.authTokenTtlDays * 86_400_000),
      })
      return token
    }

    app.post('/register', strict, async (req, reply) => {
      const body = registerBody.parse(req.body)
      const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1)
      if (exists) throw new HttpError(409, 'Já existe uma conta com este e-mail.')
      const [user] = await db
        .insert(users)
        .values({ name: body.name, email: body.email, passwordHash: await hashPassword(body.password), termsAcceptedAt: new Date() })
        .returning()
      return reply.status(201).send({ token: await issueToken(user.id), user: publicUser(user) })
    })

    app.post('/login', strict, async (req) => {
      const body = loginBody.parse(req.body)
      const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
      const ok = await verifyPassword(body.password, user?.passwordHash ?? DUMMY_HASH)
      if (!user || !ok) throw new HttpError(401, 'E-mail ou senha incorretos.')
      return { token: await issueToken(user.id), user: publicUser(user) }
    })

    app.post('/logout', async (req) => {
      const token = req.headers.authorization?.slice(7)
      if (token) await db.delete(authTokens).where(eq(authTokens.tokenHash, sha256(token)))
      return { ok: true }
    })

    app.get('/me', async (req) => ({ user: publicUser(await ctx.requireUser(req)) }))

    /** Exclusão da conta: apaga em cascata salas, sessões, participantes, respostas e resultados. */
    app.delete('/me', strict, async (req) => {
      const user = await ctx.requireUser(req)
      const { password } = z.object({ password: z.string().min(1) }).parse(req.body ?? {})
      if (!(await verifyPassword(password, user.passwordHash))) throw new HttpError(401, 'Senha incorreta.')
      await db.delete(users).where(eq(users.id, user.id))
      return { ok: true }
    })
  }
