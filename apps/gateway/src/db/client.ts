import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { env } from '../env'
import * as schema from './schema'

mkdirSync(env.DATA_DIR, { recursive: true })

export const db = drizzle(createClient({ url: `file:${env.DATA_DIR}/gateway.db` }), { schema })

export async function migrateDb() {
  await migrate(db, { migrationsFolder: path.join(import.meta.dirname, 'migrations') })
}
