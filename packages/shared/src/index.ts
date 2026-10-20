import { z } from 'zod'

export * from './tools'

export const Role = z.enum(['owner', 'parent', 'member'])
export type Role = z.infer<typeof Role>

export const FamilyId = z.string().regex(/^fam_[a-f0-9]{16}$/)

export const Timezone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz })
    return true
  } catch {
    return false
  }
}, 'Unknown IANA timezone')

export const MemberProfile = z.object({
  id: z.string(),
  name: z.string(),
  role: Role,
  timezone: Timezone,
})
export type MemberProfile = z.infer<typeof MemberProfile>

export const FamilyProfile = z.object({
  id: FamilyId,
  name: z.string(),
  members: z.array(MemberProfile),
})
export type FamilyProfile = z.infer<typeof FamilyProfile>

/**
 * Who is calling. The gateway resolves this from Keiki's signed context, never from
 * model-provided tool input.
 */
export const Caller = z.object({
  familyId: FamilyId,
  memberId: z.string(),
  role: Role,
  conversationId: z.string().nullable(),
})
export type Caller = z.infer<typeof Caller>

/** Gateway → core. Sent as the `message` string of Maritime's `POST /chat`. */
export const CoreRequest = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('sync_family'), family: FamilyProfile }),
  z.object({
    kind: z.literal('tool'),
    requestId: z.string(),
    tool: z.string(),
    input: z.unknown(),
    caller: Caller,
  }),
])
export type CoreRequest = z.infer<typeof CoreRequest>

/** Core → gateway → Keiki. `summary` is what the agent reads first. */
export const CoreResponse = z.object({
  ok: z.boolean(),
  summary: z.string(),
  data: z.unknown().optional(),
})
export type CoreResponse = z.infer<typeof CoreResponse>

/** Maritime's custom-container `/chat` contract. */
export const ChatBody = z.object({ message: z.string(), source: z.string().optional() })

export function parseCoreReply(text: string): CoreResponse {
  return CoreResponse.parse(JSON.parse(text))
}
