import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// One database per family, so no table needs a family_id column.

export const family = sqliteTable('family', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

/** Mirror of the gateway's members, pushed by `sync_family`. */
export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role', { enum: ['owner', 'parent', 'member'] }).notNull(),
  timezone: text('timezone').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})
