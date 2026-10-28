import { buildApp } from './app'
import { loadConfig } from './config'
import { openDatabase } from './db/client'
import { applyRetention } from './lib/retention'

const config = loadConfig()
const { db, close } = await openDatabase({ databaseUrl: config.databaseUrl, pgliteDir: config.pgliteDir })
const app = await buildApp(db, config, { logger: true })

async function retention() {
  try {
    app.log.info({ retention: await applyRetention(db, config.minK) }, 'retenção aplicada')
  } catch (err) {
    app.log.error(err, 'falha ao aplicar retenção')
  }
}
await retention()
const timer = setInterval(retention, 24 * 3_600_000)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    clearInterval(timer)
    await app.close()
    await close()
    process.exit(0)
  })
}

await app.listen({ port: config.port, host: config.host })
