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

/** The family's shared grocery list. `key` is the tidied name, so "Milk" and "milk." are one line. */
export const groceryItems = sqliteTable('grocery_items', {
  key: text('key').primaryKey(),
  /** As the person wrote it. */
  name: text('name').notNull(),
  /** Free text as said ("5kg", "2 dozen"); null when none was given. */
  quantity: text('quantity'),
  /** Member id; the name is looked up when the list is shown. */
  addedBy: text('added_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

/** Answers to tool calls that carried an idempotency key, replayed on redelivery. Pruned after a week. */
export const toolCalls = sqliteTable('tool_calls', {
  key: text('key').primaryKey(),
  tool: text('tool').notNull(),
  /** JSON-encoded CoreResponse */
  response: text('response').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})
