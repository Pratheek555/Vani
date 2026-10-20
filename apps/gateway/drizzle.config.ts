import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './apps/gateway/src/db/schema.ts',
  out: './apps/gateway/src/db/migrations',
})
