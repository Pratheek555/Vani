// Plays Keiki against a local gateway with correctly signed webhooks.
//   pnpm sim identity <telegramUserId> [message text] [--group <conversationId>]
//   pnpm sim tool <memberId> <toolName> [jsonInput] [--conv <groupId>] [--msg <messageId>]
//     --conv makes it a group turn (default: a DM). Reuse --msg to test redelivery replay.
import { createHmac } from 'node:crypto'

try {
  process.loadEnvFile()
} catch {}

const base = process.env.GATEWAY_URL ?? `http://localhost:${process.env.PORT ?? 8787}`
const secret = process.env.KEIKI_WEBHOOK_SECRET
if (!secret) throw new Error('KEIKI_WEBHOOK_SECRET is not set')

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : args.splice(i, 2)[1]
}
const group = flag('--group')
const conv = flag('--conv')
const msg = flag('--msg')
const [kind, ...rest] = args

async function post(path: string, payload: unknown) {
  const body = JSON.stringify(payload)
  const timestamp = String(Date.now())
  const signature = `sha256=${createHmac('sha256', secret!).update(`${timestamp}.${body}`).digest('hex')}`
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-keiki-timestamp': timestamp, 'x-keiki-signature': signature },
    body,
  })
  console.log(res.status, JSON.stringify(await res.json(), null, 2))
}

if (kind === 'identity') {
  const [userId, text] = rest
  await post('/keiki/identity', {
    agent: { id: 'agt_sim', externalRef: 'vani' },
    sender: { channel: 'telegram', userId, addressing: { isDm: !group, mentionsAgent: true, mentionsOthers: false } },
    conversation: { id: group ?? `dm_${userId}` },
    messages: text ? [{ text }] : [],
  })
} else if (kind === 'tool') {
  const [userId, tool, input] = rest
  await post(`/keiki/tools/${tool}`, {
    input: input ? JSON.parse(input) : {},
    // Shape as observed from Keiki; `phone` is the identity webhook's conversation.id.
    context: {
      phone: conv ?? null,
      agentId: 'agt_sim',
      principal: { userId, role: null, scopes: ['family'] },
      channel: {
        channel: 'telegram',
        inboundText: '',
        messageId: msg ?? `sim_${Date.now()}`,
        ...(conv ? { channelId: conv, isDirect: false } : { isDirect: true }),
      },
    },
  })
} else {
  console.log('usage: pnpm sim identity <telegramUserId> [text] [--group id] | pnpm sim tool <memberId> <tool> [json] [--conv groupId] [--msg id]')
  process.exit(1)
}
