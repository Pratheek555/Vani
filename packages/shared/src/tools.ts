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
  add_grocery_items: {
    description:
      'Add groceries or household items to the family\'s shared grocery list, or change the amount of an item already on it. Use it when someone asks to add, buy, get or remember something for the house ("add milk", "we need atta 5kg and 2 dozen eggs", "make the milk 2 litres"). Put every item from the message in one call. Keep names in the person\'s own words ("atta", not "wheat flour") and put any amount in quantity exactly as said. Never add medicines; they are handled separately. This only updates the list; it does not order anything.',
    input: z.object({
      items: z
        .array(
          z.object({
            name: z
              .string()
              .trim()
              .min(1)
              .max(60)
              .describe('The item without the amount, in the person\'s own words, e.g. "atta", "Amul milk", "eggs"'),
            quantity: z
              .string()
              .trim()
              .max(30)
              .optional()
              .describe('The amount exactly as said, e.g. "5kg", "2 dozen", "2 litres". Leave it out when none was given.'),
          }),
        )
        .min(1)
        .max(30),
    }),
  },
  get_grocery_list: {
    description:
      "Show the family's shared grocery list: every item with its amount and who added it. Use it when someone asks what's on the list or what to buy, and before removing an item whose exact name you aren't sure of.",
    input: z.object({}),
  },
  remove_grocery_items: {
    description:
      'Remove items from the family\'s grocery list, for example when they were bought ("we got the milk") or aren\'t needed anymore ("remove the atta"). Pass the names as the person said them; small differences such as "egg" and "eggs" still match. Anything that can\'t be matched comes back with the current list: retry once with the exact name, or ask which item they meant. It never empties the whole list; use clear_grocery_list for that.',
    input: z.object({
      names: z
        .array(z.string().trim().min(1).max(60))
        .min(1)
        .max(30)
        .describe('Names of the items to remove, e.g. ["milk", "atta"]'),
    }),
  },
  clear_grocery_list: {
    description:
      'Empty the whole grocery list. Use it only when someone clearly asks to clear or empty the list, or says they bought everything on it ("we got everything"). If it\'s unclear whether they mean the whole list (for example just "done"), ask first.',
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
export type ToolInput<T extends ToolName> = z.infer<(typeof tools)[T]['input']>

export function isToolName(name: string): name is ToolName {
  return Object.hasOwn(tools, name)
}
