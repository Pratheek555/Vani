import type { Caller, CoreResponse, FamilyProfile } from '@vani/shared'
import type { FamilyDb } from '../db/client'
import { family, members } from '../db/schema'

export async function syncFamily(db: FamilyDb, profile: FamilyProfile): Promise<CoreResponse> {
  const now = new Date()
  await db.transaction(async (tx) => {
    await tx
      .insert(family)
      .values({ id: profile.id, name: profile.name, updatedAt: now })
      .onConflictDoUpdate({ target: family.id, set: { name: profile.name, updatedAt: now } })
    for (const m of profile.members) {
      const row = { name: m.name, role: m.role, timezone: m.timezone, updatedAt: now }
      await tx.insert(members).values({ id: m.id, ...row }).onConflictDoUpdate({ target: members.id, set: row })
    }
  })
  return { ok: true, summary: `Synced ${profile.members.length} members of ${profile.name}.` }
}

export async function getFamily(db: FamilyDb, _input: Record<string, never>, caller: Caller): Promise<CoreResponse> {
  const fam = await db.query.family.findFirst()
  const rows = await db.query.members.findMany()
  const list = rows.map((m) => `${m.name} (${m.role}, ${m.timezone})${m.id === caller.memberId ? ' [asking]' : ''}`)
  return {
    ok: true,
    summary: `${fam?.name ?? 'This family'}: ${list.join('; ')}.`,
    data: { family: fam?.name ?? null, members: rows.map(({ id, name, role, timezone }) => ({ id, name, role, timezone })) },
  }
}
