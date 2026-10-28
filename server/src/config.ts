export interface Config {
  port: number
  host: string
  /** Postgres em produção. Vazio = PGlite (Postgres embutido) em PGLITE_DIR, para desenvolvimento. */
  databaseUrl?: string
  pgliteDir?: string
  /** Origens do frontend autorizadas a chamar a API (CORS). */
  corsOrigins: string[]
  /** URL pública do frontend, usada para montar links de convite. */
  publicAppUrl: string
  authTokenTtlDays: number
  /** Versão do texto de consentimento exibido aos participantes. */
  consentVersion: string
  /** Mínimo absoluto de k para anonimização (nenhuma sala pode configurar abaixo disso). */
  minK: number
}

export function loadConfig(env = process.env): Config {
  return {
    port: Number(env.PORT ?? 3333),
    host: env.HOST ?? '0.0.0.0',
    databaseUrl: env.DATABASE_URL || undefined,
    pgliteDir: env.PGLITE_DIR ?? './.data/pglite',
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
    publicAppUrl: env.PUBLIC_APP_URL ?? 'http://localhost:5173',
    authTokenTtlDays: Number(env.AUTH_TOKEN_TTL_DAYS ?? 7),
    consentVersion: env.CONSENT_VERSION ?? '2026-10',
    minK: 3,
  }
}
