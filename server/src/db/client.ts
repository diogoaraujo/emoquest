import { mkdirSync } from 'node:fs'
import path from 'node:path'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export type DB = NodePgDatabase<typeof schema>

export interface Database {
  db: DB
  close: () => Promise<void>
}

// Relativo ao diretório de execução (pasta server/), funciona tanto com tsx quanto com o bundle em dist/.
const migrationsFolder = path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle')

/**
 * Postgres de verdade quando há DATABASE_URL; caso contrário PGlite (Postgres em WASM),
 * em disco para desenvolvimento ou em memória (`memory`) para testes. Sempre aplica as migrações.
 */
export async function openDatabase(opts: { databaseUrl?: string; pgliteDir?: string | 'memory' }): Promise<Database> {
  if (opts.databaseUrl) {
    const { default: pg } = await import('pg')
    const { drizzle } = await import('drizzle-orm/node-postgres')
    const { migrate } = await import('drizzle-orm/node-postgres/migrator')
    const pool = new pg.Pool({ connectionString: opts.databaseUrl, max: 10 })
    const db = drizzle(pool, { schema })
    await migrate(db, { migrationsFolder })
    return { db, close: () => pool.end() }
  }

  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')
  if (opts.pgliteDir && opts.pgliteDir !== 'memory') mkdirSync(opts.pgliteDir, { recursive: true })
  const client = opts.pgliteDir === 'memory' ? new PGlite() : new PGlite(opts.pgliteDir)
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder })
  // A API de consultas do Drizzle é a mesma nos dois drivers.
  return { db: db as unknown as DB, close: () => client.close() }
}
