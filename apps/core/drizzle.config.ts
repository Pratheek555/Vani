import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './apps/core/src/db/schema.ts',
  out: './apps/core/src/db/migrations',
})
