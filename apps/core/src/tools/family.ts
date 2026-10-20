import { notInArray } from 'drizzle-orm'
import type { Caller, CoreResponse, FamilyProfile } from '@vani/shared'
import type { FamilyDb } from '../db/client'
import { family, members } from '../db/schema'

/** Makes the core's copy of the family match the gateway's: upserts, and drops removed members. */
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
    await tx.delete(members).where(notInArray(members.id, profile.members.map((m) => m.id)))
  })
  return { ok: true, summary: `Synced ${profile.members.length} members of ${profile.name}.` }
}

const sameMembers = (a: FamilyProfile['members'], b: FamilyProfile['members']) => {
  const key = (ms: FamilyProfile['members']) =>
    JSON.stringify(ms.map(({ id, name, role, timezone }) => [id, name, role, timezone]).sort())
  return key(a) === key(b)
}

/** Cheap read-only check before every tool call; writes only when the gateway's profile changed. */
export async function syncIfChanged(db: FamilyDb, profile: FamilyProfile): Promise<void> {
  const fam = await db.query.family.findFirst()
  const rows = await db.query.members.findMany()
  if (fam?.id === profile.id && fam.name === profile.name && sameMembers(rows, profile.members)) return
  await syncFamily(db, profile)
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
