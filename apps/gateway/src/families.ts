import { createHash, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { CoreRequest, CoreResponse, FamilyProfile, Role } from '@vani/shared'
import { db } from './db/client'
import { families, linkTokens, members } from './db/schema'
import { env } from './env'
import { runtime } from './runtime'

export const newId = (prefix: 'fam' | 'mem' | 'acc') => `${prefix}_${randomBytes(8).toString('hex')}`
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export type NewMember = { name: string; role: Role; timezone: string }

/** Creates the family, its members and one Telegram deep link per member. */
export async function createFamily(name: string, newMembers: NewMember[], ownerAccountId?: string) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + env.LINK_TTL_HOURS * 3_600_000)
  const familyId = newId('fam')
  const created = newMembers.map((m) => ({ ...m, id: newId('mem'), token: randomBytes(24).toString('base64url') }))

  await db.transaction(async (tx) => {
    await tx.insert(families).values({ id: familyId, name, ownerAccountId, createdAt: now })
    for (const m of created) {
      await tx.insert(members).values({ id: m.id, familyId, name: m.name, role: m.role, timezone: m.timezone, createdAt: now })
      await tx.insert(linkTokens).values({ tokenHash: hashToken(m.token), memberId: m.id, expiresAt })
    }
  })

  return {
    familyId,
    expiresAt,
    members: created.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      telegramLink: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${m.token}`,
    })),
  }
}

async function loadProfile(familyId: string): Promise<FamilyProfile> {
  const family = await db.query.families.findFirst({ where: eq(families.id, familyId) })
  if (!family) throw new Error(`unknown family ${familyId}`)
  const rows = await db.query.members.findMany({ where: eq(members.familyId, familyId) })
  return {
    id: family.id,
    name: family.name,
    members: rows.map(({ id, name, role, timezone }) => ({ id, name, role, timezone })),
  }
}

/** Get-or-create the family's core and push its profile. Safe to call repeatedly. */
export async function ensureCore(familyId: string): Promise<string> {
  const family = await db.query.families.findFirst({ where: eq(families.id, familyId) })
  if (!family) throw new Error(`unknown family ${familyId}`)
  if (family.coreAgentId) return family.coreAgentId

  const agentId = await runtime.provision(familyId)
  const synced = await runtime.send(agentId, { kind: 'sync_family', family: await loadProfile(familyId) })
  if (!synced.ok) throw new Error(`core sync failed for ${familyId}: ${synced.summary}`)
  await db.update(families).set({ coreAgentId: agentId }).where(eq(families.id, familyId))
  return agentId
}

export async function callCore(familyId: string, req: CoreRequest): Promise<CoreResponse> {
  return runtime.send(await ensureCore(familyId), req)
}
