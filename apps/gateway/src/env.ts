import { z } from 'zod'

try {
  process.loadEnvFile()
} catch {
  // no .env file: rely on the real environment (Maritime injects it)
}

const Env = z.object({
  PORT: z.coerce.number().default(8787),
  PUBLIC_URL: z.url().default('http://localhost:8787'),
  DATA_DIR: z.string().default('/data'),
  TELEGRAM_BOT_USERNAME: z.string().min(1),
  KEIKI_WEBHOOK_SECRET: z.string().min(16),
  LOG_KEIKI_PAYLOADS: z.stringbool().default(false),
  LINK_TTL_HOURS: z.coerce.number().default(72),
  CORE_RUNTIME: z.enum(['local', 'maritime']).default('local'),
  LOCAL_CORE_URL: z.url().default('http://127.0.0.1:8788'),
  MARITIME_API_KEY: z.string().optional(),
  CORE_IMAGE: z.string().optional(),
  CORE_TEMPLATE: z.string().default('custom'),
})

export const env = Env.parse(process.env)
