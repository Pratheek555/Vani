import { z } from 'zod'

try {
  process.loadEnvFile()
} catch {
  // no .env file: rely on the real environment (Maritime injects it)
}

const Env = z.object({
  // Maritime injects PORT; locally the core sits next to the gateway on CORE_PORT.
  PORT: z.coerce.number().optional(),
  CORE_PORT: z.coerce.number().default(8788),
  DATA_DIR: z.string().default('/data'),
  /** Set on Maritime: this VM serves exactly one family. Unset locally: one SQLite file per family. */
  FAMILY_ID: z.string().optional(),
})

const parsed = Env.parse(process.env)
export const env = { ...parsed, PORT: parsed.PORT ?? parsed.CORE_PORT }
