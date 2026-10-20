import { eq } from 'drizzle-orm'
import { db } from './db/client'
import { conversations, linkTokens, members, type Member } from './db/schema'
import { hashToken } from './families'

const START = /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})\s*$/

/** Pulls the deep-link token out of Telegram's `/start <token>` message, if present. */
export function startToken(messages: { text: string }[] | undefined): string | null {
  for (const { text } of messages ?? []) {
    const match = START.exec(text.trim())
    if (match?.[1]) return match[1]
  }
  return null
}

export function findMember(chatIdentity: string): Promise<Member | undefined> {
  return db.query.members.findFirst({ where: eq(members.chatIdentity, chatIdentity) })
}

export function getMember(memberId: string): Promise<Member | undefined> {
  return db.query.members.findFirst({ where: eq(members.id, memberId) })
}

/**
 * Binds a chat identity to the member the token was issued for. Single use, expiring,
 * and refuses members already linked to some other chat identity.
 */
export async function redeemToken(token: string, chatIdentity: string): Promise<Member | null> {
  const tokenHash = hashToken(token)
  return db.transaction(async (tx) => {
    const row = await tx.query.linkTokens.findFirst({ where: eq(linkTokens.tokenHash, tokenHash) })
    if (!row || row.usedAt || row.expiresAt < new Date()) return null
    const member = await tx.query.members.findFirst({ where: eq(members.id, row.memberId) })
    if (!member || member.chatIdentity) return null

    const now = new Date()
    await tx.update(linkTokens).set({ usedAt: now }).where(eq(linkTokens.tokenHash, tokenHash))
    await tx.update(members).set({ chatIdentity, linkedAt: now }).where(eq(members.id, member.id))
    return { ...member, chatIdentity, linkedAt: now }
  })
}

/**
 * Pins a conversation to a family the first time a linked member speaks in it.
 * Returns false when the conversation already belongs to a different family.
 */
export async function claimConversation(conversationId: string, familyId: string): Promise<boolean> {
  await db.insert(conversations).values({ id: conversationId, familyId, createdAt: new Date() }).onConflictDoNothing()
  const row = await db.query.conversations.findFirst({ where: eq(conversations.id, conversationId) })
  return row?.familyId === familyId
}
