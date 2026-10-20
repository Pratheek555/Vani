import { z } from 'zod'

/**
 * Tool contracts shared by Keiki (schemas it syncs) and core (implementations).
 * Inputs never carry family or member ids: the caller comes from the signed context.
 * Set `dmOnly: true` on anything returning health or money details; the core refuses
 * it outside a DM no matter what the model decides.
 */
export type ToolDef = { description: string; input: z.ZodType; dmOnly?: boolean }

export const tools = {
  get_family: {
    description:
      "List the members of the caller's family with their role and timezone. Use it to learn who is who before helping.",
    input: z.object({}),
  },
} as const satisfies Record<string, ToolDef>

/**
 * Tools the gateway answers itself (no family core involved). `link_account` reads the
 * `/start <token>` from Keiki's signed copy of the message, never from model input.
 */
export const gatewayTools = {
  link_account: {
    description:
      'Link this chat to the family account. Call it whenever the message starts with /start, then greet the person by name.',
    input: z.object({}),
  },
} as const

export type ToolName = keyof typeof tools

export function isToolName(name: string): name is ToolName {
  return Object.hasOwn(tools, name)
}
