import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { FamilyId } from '@vani/shared'
import { env } from '../env'
import * as schema from './schema'

const open = (file: string) => drizzle(createClient({ url: `file:${file}` }), { schema })
export type FamilyDb = ReturnType<typeof open>

const dbs = new Map<string, Promise<FamilyDb>>()

/** Opens (and migrates) the family's database lazily, so it survives VM sleep/resume. */
export function dbFor(familyId: string): Promise<FamilyDb> {
  FamilyId.parse(familyId) // also keeps the id safe to use in a file path
  let db = dbs.get(familyId)
  if (!db) {
    const dir = env.FAMILY_ID ? env.DATA_DIR : `${env.DATA_DIR}/families`
    const file = env.FAMILY_ID ? `${dir}/vani.db` : `${dir}/${familyId}.db`
    mkdirSync(dir, { recursive: true })
    db = (async () => {
      const opened = open(file)
      await migrate(opened, { migrationsFolder: path.join(import.meta.dirname, 'migrations') })
      return opened
    })()
    db.catch(() => dbs.delete(familyId))
    dbs.set(familyId, db)
  }
  return db
}
