import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// The gateway only knows accounts and identity. Family data (meds, orders, vault)
// lives in each family's core.

/** Website logins. Only the owner (the student abroad) signs in; parents only use chat. */
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  /** scrypt: `<salt hex>:<hash hex>` */
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

/** Website sessions. Only the sha256 of the cookie token is stored. */
export const sessions = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
})

export const families = sqliteTable('families', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** The website account that created this family. Null for families made before logins existed. */
  ownerAccountId: text('owner_account_id').references(() => accounts.id),
  /** Maritime agent id for this family's core ('local' in local mode). Null until provisioned. */
  coreAgentId: text('core_agent_id'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  familyId: text('family_id')
    .notNull()
    .references(() => families.id),
  name: text('name').notNull(),
  role: text('role', { enum: ['owner', 'parent', 'member'] }).notNull(),
  timezone: text('timezone').notNull(),
  /** `<channel>:<channel user id>` as Keiki reports the sender, e.g. `telegram:12345`. */
  chatIdentity: text('chat_identity').unique(),
  linkedAt: integer('linked_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

/** Single-use deep-link tokens. Only the sha256 is stored. */
export const linkTokens = sqliteTable('link_tokens', {
  tokenHash: text('token_hash').primaryKey(),
  memberId: text('member_id')
    .notNull()
    .references(() => members.id),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp_ms' }),
})

/** Keiki conversations (DMs and groups) pinned to the family of the first linked member seen in them. */
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  familyId: text('family_id')
    .notNull()
    .references(() => families.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export type Member = typeof members.$inferSelect
export type Account = typeof accounts.$inferSelect
