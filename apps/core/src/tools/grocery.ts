import { asc, eq, sql } from 'drizzle-orm'
import type { Caller, CoreResponse, ToolInput } from '@vani/shared'
import type { FamilyDb } from '../db/client'
import { groceryItems } from '../db/schema'

const MAX_ITEMS = 100

type Row = typeof groceryItems.$inferSelect
type ListItem = { name: string; quantity: string | null; addedBy: string | null }

/** One key per item, whatever the case, spacing, punctuation or leading article: " The Amul  Milk." → "amul milk". */
const tidy = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/^(the|a|an|some) /, '')

/** Tolerates plurals: "egg"/"eggs", "tomato"/"tomatoes", "berry"/"berries". */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  return long === `${short}s` || long === `${short}es` || (short.endsWith('y') && long === `${short.slice(0, -1)}ies`)
}

/** The same item up to plurals: "brown egg" and "brown eggs". */
function sameItem(a: string, b: string): boolean {
  const wa = a.split(' ')
  const wb = b.split(' ')
  return wa.length === wb.length && wa.every((w, i) => sameWord(w, wb[i] ?? ''))
}

/** Every word asked for is in the item: "milk" is in "amul milk". */
const covers = (item: string, asked: string) =>
  asked.split(' ').every((w) => item.split(' ').some((x) => sameWord(w, x)))

/** Exact name first, then plurals, then the one item containing every word asked for. */
function findForRemoval(rows: Row[], key: string): Row | undefined {
  const match = rows.find((r) => r.key === key) ?? rows.find((r) => sameItem(r.key, key))
  if (match) return match
  const loose = rows.filter((r) => covers(r.key, key))
  return loose.length === 1 ? loose[0] : undefined
}

const label = (item: { name: string; quantity: string | null }) =>
  item.quantity ? `${item.name} (${item.quantity})` : item.name

const count = (n: number) => `${n} item${n === 1 ? '' : 's'}`

/** "a", "a and b", "a, b and c" */
const join = (parts: string[]) =>
  parts.length < 2 ? (parts[0] ?? '') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`

/** The list in the order things were added, with the name of whoever added each item. */
async function listItems(db: FamilyDb): Promise<ListItem[]> {
  const rows = await db.select().from(groceryItems).orderBy(asc(groceryItems.createdAt), sql`rowid`)
  const nameOf = new Map((await db.query.members.findMany()).map((m) => [m.id, m.name]))
  return rows.map((r) => ({ name: r.name, quantity: r.quantity, addedBy: nameOf.get(r.addedBy) ?? null }))
}

function describeList(items: ListItem[]): string {
  if (!items.length) return 'The grocery list is empty.'
  const lines = items.map((i) => `- ${label(i)}${i.addedBy ? `, added by ${i.addedBy}` : ''}`)
  return [`The grocery list has ${count(items.length)}:`, ...lines].join('\n')
}

/** Adds new items and updates the amount of ones already there, so asking twice changes nothing. */
export async function addGroceryItems(
  db: FamilyDb,
  input: ToolInput<'add_grocery_items'>,
  caller: Caller,
): Promise<CoreResponse> {
  const now = new Date()
  const added: string[] = []
  const updated: string[] = []
  const unchanged: string[] = []
  const notAdded: string[] = []
  const invalid: string[] = []
  await db.transaction(async (tx) => {
    const rows = await tx.select().from(groceryItems)
    for (const item of input.items) {
      const key = tidy(item.name)
      const name = item.name.replace(/^(the|a|an|some)\s+/i, '')
      const quantity = item.quantity || null
      if (!key) {
        invalid.push(`"${item.name}"`)
        continue
      }
      const match = rows.find((r) => r.key === key) ?? rows.find((r) => sameItem(r.key, key))
      if (match) {
        if (!quantity || quantity === match.quantity) {
          unchanged.push(label(match))
          continue
        }
        await tx.update(groceryItems).set({ quantity, updatedAt: now }).where(eq(groceryItems.key, match.key))
        match.quantity = quantity
        updated.push(label(match))
        continue
      }
      if (rows.length >= MAX_ITEMS) {
        notAdded.push(name)
        continue
      }
      const row = { key, name, quantity, addedBy: caller.memberId, createdAt: now, updatedAt: now }
      await tx.insert(groceryItems).values(row)
      rows.push(row)
      added.push(label(row))
    }
  })

  const items = await listItems(db)
  const summary: string[] = []
  if (added.length) summary.push(`Added ${join(added)}.`)
  if (updated.length) summary.push(`Updated ${join(updated)}.`)
  if (unchanged.length) summary.push(`Already on the list: ${join(unchanged)}.`)
  if (notAdded.length) {
    summary.push(`The list is full (${MAX_ITEMS} items), so ${join(notAdded)} wasn't added. Remove something first.`)
  }
  if (invalid.length) summary.push(`Skipped ${join(invalid)}: not an item name.`)
  summary.push(`The list now has ${count(items.length)}.`)
  return {
    ok: added.length + updated.length + unchanged.length > 0,
    summary: summary.join(' '),
    data: { added, updated, unchanged, items },
  }
}

export async function getGroceryList(db: FamilyDb): Promise<CoreResponse> {
  const items = await listItems(db)
  return { ok: true, summary: describeList(items), data: { items } }
}

/** Removes what it can match. Anything it can't comes back with the current list, so the model can retry or ask. */
export async function removeGroceryItems(
  db: FamilyDb,
  input: ToolInput<'remove_grocery_items'>,
): Promise<CoreResponse> {
  const asked = [...new Map(input.names.map((name) => [tidy(name), name])).values()]
  const removed: string[] = []
  const notFound: string[] = []
  await db.transaction(async (tx) => {
    let rows = await tx.select().from(groceryItems)
    for (const name of asked) {
      const match = findForRemoval(rows, tidy(name))
      if (!match) {
        notFound.push(`"${name}"`)
        continue
      }
      await tx.delete(groceryItems).where(eq(groceryItems.key, match.key))
      rows = rows.filter((r) => r !== match)
      removed.push(match.name)
    }
  })

  const items = await listItems(db)
  const summary: string[] = []
  if (removed.length) summary.push(`Removed ${join(removed)}.`)
  if (notFound.length) {
    summary.push(`Couldn't find ${join(notFound)} on the list.`)
    summary.push(
      items.length
        ? `It has: ${join(items.map((i) => i.name))}. Retry once with the exact name, or ask which item they meant.`
        : 'The list is empty.',
    )
  } else {
    summary.push(items.length ? `${count(items.length)} left.` : 'The list is now empty.')
  }
  return { ok: removed.length > 0, summary: summary.join(' '), data: { removed, notFound, items } }
}

/** Empties the list. It's a separate tool, so removing items can never wipe everything by accident. */
export async function clearGroceryList(db: FamilyDb): Promise<CoreResponse> {
  const cleared = await db.delete(groceryItems).returning({ key: groceryItems.key })
  return {
    ok: true,
    summary: cleared.length ? `Cleared the grocery list (${count(cleared.length)}).` : 'The grocery list was already empty.',
    data: { cleared: cleared.length },
  }
}
