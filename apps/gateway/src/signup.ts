import { Hono } from 'hono'
import { z } from 'zod'
import { Role, Timezone } from '@vani/shared'
import { requireAccount } from './auth'
import { createFamily, ensureCore } from './families'

const SignupInput = z.object({
  familyName: z.string().trim().min(1).max(80),
  members: z
    .array(z.object({ name: z.string().trim().min(1).max(60), role: Role, timezone: Timezone }))
    .min(1)
    .max(12)
    .refine((ms) => ms.filter((m) => m.role === 'owner').length === 1, 'Exactly one owner'),
})

export const signup = new Hono()

signup.post('/families', requireAccount, async (c) => {
  const parsed = SignupInput.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: z.prettifyError(parsed.error) }, 400)

  const family = await createFamily(parsed.data.familyName, parsed.data.members, c.get('account').id)
  // Warm the family's core in the background; tool calls also provision lazily.
  ensureCore(family.familyId).catch((err) => console.error(`[core] provision ${family.familyId}`, err))

  return c.json({
    ...family,
    summary: `Created ${parsed.data.familyName} with ${family.members.length} members. Send each person their own link.`,
  })
})
