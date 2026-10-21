import { randomUUID } from 'node:crypto'
import { Hono, type Context } from 'hono'
import { z } from 'zod'
import { verifyWebhook, type IdentityWebhookAnswer } from '@onkeiki/agents/cloud'
import { isToolName, type ConversationKind, type CoreResponse } from '@vani/shared'
import { env } from './env'
import { callTool, hashToken } from './families'
import type { Member } from './db/schema'
import { claimConversation, findMember, getMember, redeemToken, startToken } from './identity'

// Keiki sends more fields than these; parse only what we rely on.
const IdentityRequest = z.looseObject({
  sender: z.looseObject({
    channel: z.string(),
    userId: z.string().optional(),
    conversationId: z.string().optional(),
    addressing: z.looseObject({ isDm: z.boolean() }).optional(),
  }),
  conversation: z.looseObject({ id: z.string() }),
  messages: z.array(z.looseObject({ text: z.string() })).optional(),
})

// Seen from Keiki (Oct 20, 2026): the principal our identity webhook returned is under
// `context.principal`, and `context.phone` carries the identity webhook's `conversation.id`.
// Telegram turns skip the identity webhook, so there is no principal; `context.channel`
// still carries the verified sender and the inbound text, all covered by the signature.
// `channelId` / `isDirect` / `messageId` come from the SDK's ChannelEnvelope type and are
// not yet seen on real traffic.
// API-channel turns (seen Oct 21, 2026) name no person: the sender and `context.channel` only
// carry the caller's `conversationId`, and the identity webhook gets no `messages`.
const ToolCall = z.looseObject({
  input: z.unknown(),
  context: z.looseObject({
    phone: z.string().nullish(),
    principal: z.looseObject({ userId: z.string().nullish() }).nullish(),
    channel: z
      .looseObject({
        channel: z.string(),
        userId: z.string().nullish(),
        conversationId: z.string().nullish(),
        inboundText: z.string().nullish(),
        messageId: z.string().nullish(),
        channelId: z.string().nullish(),
        isDirect: z.boolean().nullish(),
      })
      .nullish(),
  }),
})
type ToolContext = z.infer<typeof ToolCall>['context']

/**
 * `<channel>:<sender id>`. An API-channel conversation stands in for its sender: only holders
 * of our Keiki key can open one, and the caller picks its id.
 */
function senderIdentity(channel: string, userId?: string | null, conversationId?: string | null): string | null {
  const id = userId || (channel === 'api' ? conversationId : null)
  return id ? `${channel}:${id}` : null
}

const chatIdentityOf = (ctx: ToolContext) =>
  ctx.channel ? senderIdentity(ctx.channel.channel, ctx.channel.userId, ctx.channel.conversationId) : null

/**
 * The room this turn happened in and whether it's private. On Telegram `phone` is per
 * sender (`tg:<userId>`), so a group must be keyed by its `channelId` instead.
 */
function conversationOf(ctx: ToolContext): { id: string | null; kind: ConversationKind } {
  const ch = ctx.channel
  const id = ch?.channelId ? `${ch.channel}:${ch.channelId}` : (ctx.phone ?? null)
  let kind: ConversationKind = 'unknown'
  if (ch?.isDirect != null) kind = ch.isDirect ? 'dm' : 'group'
  // Telegram: a private chat's id is the user's id; groups have their own (negative) id.
  else if (ch?.channelId && ch.userId) kind = ch.channelId === ch.userId ? 'dm' : 'group'
  if (kind === 'unknown' && env.LOG_KEIKI_PAYLOADS) console.warn('[keiki] cannot tell DM from group', ch)
  return { id, kind }
}

/** Who is calling: the identity webhook's principal, else the signed channel sender. */
async function callerOf(ctx: ToolContext): Promise<Member | undefined> {
  if (ctx.principal?.userId) return getMember(ctx.principal.userId)
  const chatIdentity = chatIdentityOf(ctx)
  return chatIdentity ? findMember(chatIdentity) : undefined
}

const NOBODY: IdentityWebhookAnswer = { userId: null, scopes: [], ttlSeconds: 0 }

/** Reads the raw body and checks X-Keiki-Signature. Null when the signature is bad. */
async function signedJson(c: Context): Promise<unknown | null> {
  const body = await c.req.text()
  if (!(await verifyWebhook(c.req.raw, body, env.KEIKI_WEBHOOK_SECRET))) {
    console.warn(`[keiki] ${c.req.path} rejected: bad or stale signature`)
    return null
  }
  if (env.LOG_KEIKI_PAYLOADS) console.log(`[keiki] ${c.req.path}`, body)
  return JSON.parse(body)
}

export const keiki = new Hono()

/** Called by Keiki before every turn: who is this sender in our system? */
keiki.post('/identity', async (c) => {
  const raw = await signedJson(c)
  if (raw === null) return c.json({ error: 'bad signature' }, 401)
  const { sender, conversation, messages } = IdentityRequest.parse(raw)
  const chatIdentity = senderIdentity(sender.channel, sender.userId, sender.conversationId)
  if (!chatIdentity) return c.json(NOBODY)
  const isDm = sender.addressing?.isDm ?? false

  let member = await findMember(chatIdentity)
  if (!member) {
    const token = startToken(messages)
    member = (token && (await redeemToken(token, chatIdentity))) || undefined
    if (member) {
      await claimConversation(conversation.id, member.familyId)
      return c.json({
        userId: member.id,
        role: member.role,
        scopes: ['family'],
        ttlSeconds: 0,
        reply: `Hi ${member.name}, you're all set. I'm Vani, your family's helper. Tell me what you need, anytime.`,
      } satisfies IdentityWebhookAnswer)
    }
    // Stay quiet for strangers in groups; point DMs at signup.
    if (!isDm) return c.json(NOBODY)
    return c.json({
      ...NOBODY,
      reply: token
        ? 'That link has expired or was already used. Ask whoever set up Vani for a fresh one.'
        : `Hi! I'm Vani. I only work with families who have signed up. Start here: ${env.PUBLIC_URL}`,
    } satisfies IdentityWebhookAnswer)
  }

  if (!(await claimConversation(conversation.id, member.familyId))) return c.json(NOBODY)
  return c.json({ userId: member.id, role: member.role, scopes: ['family'], ttlSeconds: 0 } satisfies IdentityWebhookAnswer)
})

/** Webhook tools: the caller comes from Keiki's signed context, never from tool input. */
keiki.post('/tools/:tool', async (c) => {
  const raw = await signedJson(c)
  if (raw === null) return c.json({ error: 'bad signature' }, 401)
  const tool = c.req.param('tool')
  const { input, context } = ToolCall.parse(raw)

  const deny = (summary: string) => c.json({ ok: false, summary } satisfies CoreResponse)
  if (tool === 'link_account') return c.json(await linkAccount(context))
  if (!isToolName(tool)) return deny(`Unknown tool ${tool}.`)

  const member = await callerOf(context)
  if (!member) return deny("I don't know who is asking. They need to open their personal Vani link first.")
  const conversation = conversationOf(context)
  if (conversation.id && !(await claimConversation(conversation.id, member.familyId))) {
    return deny('This conversation belongs to a different family.')
  }

  const messageId = context.channel?.messageId
  return c.json(
    await callTool(member.familyId, {
      requestId: randomUUID(),
      // A redelivered call has the same message, tool and input; the core replays its answer.
      idempotencyKey: messageId
        ? hashToken(`${conversation.id}|${messageId}|${tool}|${JSON.stringify(input ?? {})}`)
        : null,
      tool,
      input: input ?? {},
      caller: {
        familyId: member.familyId,
        memberId: member.id,
        role: member.role,
        conversationId: conversation.id,
        conversationKind: conversation.kind,
      },
    }),
  )
})

/** Redeems the `/start <token>` in the signed inbound text for the signed sender. */
async function linkAccount(ctx: ToolContext): Promise<CoreResponse> {
  const chatIdentity = chatIdentityOf(ctx)
  if (!chatIdentity) return { ok: false, summary: "I can't tell who sent this message." }

  const existing = await findMember(chatIdentity)
  if (existing) return { ok: true, summary: `Already linked as ${existing.name}.`, data: { name: existing.name } }

  const token = startToken(ctx.channel?.inboundText ? [{ text: ctx.channel.inboundText }] : [])
  if (!token) return { ok: false, summary: 'No link code in this message. Ask them to tap their personal Vani link.' }
  const member = await redeemToken(token, chatIdentity)
  if (!member) return { ok: false, summary: 'That link has expired or was already used. Ask whoever set up Vani for a fresh one.' }

  const conversationId = conversationOf(ctx).id
  if (conversationId) await claimConversation(conversationId, member.familyId)
  return { ok: true, summary: `Linked. This is ${member.name} (${member.role}).`, data: { name: member.name, role: member.role } }
}
