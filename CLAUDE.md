# CLAUDE.md: Vani

Vani is a family errand runner and care assistant. It lives in a family's WhatsApp or iMessage group and helps Indian parents with whatever their child (a student abroad) would normally handle from far away. We're building it for the Keiki x Maritime competition. **See `PLAN.md` for the full product plan, scope and week-1 schedule.**

## Key decisions (don't re-litigate without asking)
- **Users:** Indian parents in India + student abroad (owner). **English only** for MVP. Input is text plus photos. No voice yet.
- **v1 focus:** errands (groceries, medicines), medicine manager (refill forecasting), and a health support layer (report explainer, doctor-visit prep, red-flag escalation, medical vault). **Fitness devices are deferred.**
- **Group behavior:** Vani listens in the group and chimes in when clearly useful. Detailed or private work moves to DMs.
- **Execution:** both *prepare mode* (agent builds the cart, a human pays) and *autonomous mode* (COD or prepaid wallet within caps). The **approval policy is configurable per family.**
- **Architecture:** **Keiki** = front (channels, persona, conversation memory, approvals). **Maritime** = brain (Vani Core: state, task engine, scheduler, vendor browser automation, document vault), exposed to Keiki as HTTP tools.
- **Stack:** TypeScript (strict), Node LTS, pnpm, Hono, SQLite + Drizzle, Playwright, zod.
- **Builder:** solo. Week-1 MVP deadline is Sat Oct 25, 2026.

## Layout (pnpm workspace)
```
vani/
  packages/shared/  # zod contracts: CoreRequest/CoreResponse, Caller, FamilyProfile, tool schemas (tools.ts)
  apps/gateway/     # ONE public service: website signup, Telegram deep links, Keiki identity
                    #   webhook, Keiki tool webhooks → routes each call to that family's core
    src/runtime/    # where cores run: local (one process, SQLite file per family) | maritime (one VM per family)
  apps/core/        # Vani Core, ONE PER FAMILY on Maritime: /health /chat /schedules, SQLite in /data
    src/tools/      # tool implementations (domain, tasks, scheduler, vendors, health grow here)
  keiki/            # system prompt + sync.ts (pushes tools + identity webhook to Keiki)
  scripts/keiki-sim.ts  # signs and sends fake Keiki identity/tool webhooks to a local gateway
  PLAN.md
```
Flow: Keiki identity webhook → gateway maps `<channel>:<userId>` to a member (linked by `/start <token>`) → Keiki tool call with signed `context.userId` → gateway → `CoreRequest` as the `message` of the family core's `POST /chat` → `CoreResponse` back.
Isolation: never trust ids in tool input. Each conversation is pinned to one family. In local mode each family gets its own DB file; on Maritime each family gets its own VM and `/data`.

## Non-negotiable agent rules
- **Health:** never diagnose, change dosages, or tell anyone to start or stop a medication. Always defer to a doctor. Red-flag symptoms get emergency guidance (112/108) right away and an immediate alert to the owner and nearest member, even in quiet mode.
- **Privacy:** health and financial details go **only in DMs**, never in the group, unless that person has explicitly allowed it. Get explicit parent consent before storing health data (India DPDP Act).
- **Money:** never store card numbers, CVVs, UPI PINs or passwords. Enforce policy caps. Fall back to human approval on any OTP/3DS/UPI prompt. Log every spend to the audit log.
- **Prescription medicines:** need a valid prescription in the vault. Never work around this.
- **Tone in groups:** short, warm, rare. At most one unprompted message per topic. Respect quiet mode and quiet hours in both timezones.

## Engineering conventions
- Every Keiki-facing tool: zod-validated input and output, idempotent where possible, returns a short human-readable `summary` alongside data.
- Vendor adapters are brittle by nature. Isolate them behind `search / addToCart / getCart / checkout(mode) / trackOrder`, fail loudly, and degrade to "list + deep link".
- Store times in UTC. Render in each member's timezone.
- Keep it simple. Solo week-1 MVP, so prefer boring and working over clever.

## Commands
- `pnpm install`, then copy `.env.example` to `.env`
- `pnpm dev:core` and `pnpm dev:gateway` (ports 8788 / 8787). The signup page is at http://localhost:8787
- `pnpm typecheck`
- `pnpm db:generate` after any change to a `db/schema.ts` (migrations run automatically at boot)
- `pnpm sim identity <tgUserId> "/start <token>" [--group <id>]` and `pnpm sim tool <memberId> <tool> [json] [--conv <id>]`. In Git Bash, a leading `/start` gets mangled into a path, so run `MSYS_NO_PATHCONV=1 node node_modules/tsx/dist/cli.mjs scripts/keiki-sim.ts ...` instead.
- `pnpm keiki:print` / `pnpm keiki:sync` push the agent config to Keiki
- Docker: `docker build -f apps/<gateway|core>/Dockerfile .` from the repo root

## Unverified platform assumptions
Keiki and Maritime are new (Sept 2026). Before relying on any of these, check their docs: WhatsApp/iMessage **group** support, custom HTTP tools, proactive outbound messaging API, media passed to tools, Maritime SDK/deploy flow. Record what you confirm here.

### Findings (Oct 19, 2026)
Legend: ✅ tested by us · 📄 the docs say so, not yet tested · ❓ unclear

**Keiki** (onkeiki.com/docs/cloud-agents, /openapi.json)
- ✅ A **Telegram** bot works and can be added to groups.
- 📄 In Telegram groups the bot answers only @-mentions by default. To make it listen to everything, set `replyMode: "always"` per identity. `mentionAliases` adds custom names (e.g. "Vani").
- 📄 Groups also work on **WhatsApp and iMessage**. The whole group shares one conversation, with shared history and memory.
- 📄 **Custom tools:** you can upload *webhook tools* through the REST API. Keiki POSTs `{ input, context }` to our endpoint and expects JSON back. Remote MCP servers and OpenAPI specs can also be added as tool sources.
- 📄 **Media:** Keiki can describe images and extract documents before the agent sees them. Raw attachments carry `attachment_id`, `media_id`, `mime`, `size` and a URL that **expires in 15 minutes**, so download it right away.
- ❓ **Proactive outbound:** `POST /api/v1/developer/agents/{agentId}/notice` sends a "notice" for the agent to consider in its conversations. It's unclear whether the agent will reliably send a message that we choose, to a conversation that we choose. **Test this.**
- 📄 **Identity webhook** (docs/identity, /conversation-auth): set `identity: { webhook_url, secret }`. Before every turn, Keiki POSTs the sender (`channel`, `userId`, ..., plus an optional `messages` array that includes text "for linking challenges") to our endpoint. We reply `{ userId, role, scopes, ttlSeconds, reply? }`. For an unknown sender we return `userId: null` with a `reply`: that ends the turn before the model sees any history. Calls are signed with `X-Keiki-Signature`, an HMAC-SHA256 of `<timestamp>.<body>`; reject anything older than 5 min, and use `verifyWebhook` from `@onkeiki/agents/cloud`. Webhook tool calls carry signed agent/conversation/channel/principal context (`context.userId`). The docs only show sender shapes for Slack, iMessage and API. ❓ **Telegram sender shape, and whether `/start <payload>` text reaches the identity webhook.**
- 📄 **Partner deployments** (docs/partner-deployments): `POST /api/v1/developer/deployments` with a unique `external_ref` creates or updates one agent per customer, with its own tools/channels. A Telegram channel needs a `bot_token` **per deployment**, so it doesn't fit one shared bot link. Per-user MCP credentials go through `PUT .../mcp-senders`.
- 📄 Keiki also has a managed cloud browser with screenshots and handoff to a person. It's an alternative to running Playwright ourselves.

**Maritime** (maritime.sh/docs/frameworks/custom)
- 📄 Any Docker container works. It must bind to `0.0.0.0:$PORT` (never hardcode the port) and serve `GET /health` and `POST /chat`.
- 📄 `POST /chat` must **reply within 30 seconds**. Long work, like building a cart in a browser, has to be async: reply with "on it" and finish later.
- 📄 **Only `/data` persists.** The SQLite file must live there.
- 📄 The VM sleeps when idle and is snapshotted and resumed, so connections (DB, browser) must re-open lazily.
- 📄 **Scheduled triggers:** expose cron entries from `GET /schedules`. Maritime wakes the VM and POSTs `/chat` with `source: "scheduled"`. Use this for refills and digests.
- 📄 **Public URL** (docs/web-apps): `maritime create <name> --repo <url> --public --port <port>` gives a no-login HTTPS URL that exposes whatever routes the app serves. There's no built-in auth, so we have to check a shared secret ourselves.
- 📄 **Per-user agents** (docs/build, /sdk, /api): `maritime.agents.provision({ externalId, name, template, env?, idleTtlSeconds? })` is get-or-create keyed on `externalId`. To message an agent, use `agents.chat(id, message)` → `{ response }`, or REST `POST /api/agents/{id}/chat` `{ message, conversation_id? }` with `Authorization: Bearer mk_...`. The call is synchronous (the SDK times out after 60s by default) and wakes a sleeping agent. Secrets go in with `setEnv(id, k, v, { secret: true })`. Lifecycle webhooks: `agent.deployed|error|sleeping|woken|restarted|stopped`.
- ❓ Per-agent addressing needs our Maritime API key, so Keiki can't call per-family agents directly. The gateway (`apps/gateway`) handles this.
- 📄 `maritime-sdk` 0.9 also has **Projects** (`projects.update({ newChatPolicy: 'spawn', warmPoolSize })` + `projects.message({ externalUserId, message, wait })`). It routes each end user to their own agent and keeps a warm pool for ~1s binds. A cold first contact returns `provisioning`, and the reply then arrives later via the `message.reply` webhook. We use `agents.provision` + `agents.chat` (synchronous) for now. Switch to Projects if cold starts are too slow.
- ❓ Which template/framework value a custom `imageName` needs (`CORE_TEMPLATE`, default `custom`).

### Findings (Oct 20, 2026): real Keiki traffic via `keiki:sync` + API channel
- ✅ `keiki:sync` works with an org-wide key (agent "Vani", `externalRef: "vani"`). Re-running it keeps the Telegram channel attached in the dashboard.
- ✅ **Telegram turns never call the identity webhook** (the bot was attached in the dashboard; only the API channel called it). Tool calls still arrive signed with `context.channel{channel:"telegram", userId, inboundText}` and `context.phone: "tg:<userId>"`, with no `principal`. So the gateway falls back to the signed sender (`telegram:<userId>`), and linking happens through the `link_account` tool, which reads `/start <token>` from the signed `inboundText`. Side effect: there's no gate before the model, so unlinked people can chat with Vani but every tool refuses them.
- ✅ The identity webhook **and** tool webhooks are signed with the same `identity.secret`.
- ✅ Tool payload: `context.principal.userId` is what our identity webhook returned, and `context.phone` equals the identity webhook's `conversation.id`. Also `context.channel{channel, conversationId, inboundText, messageId}`. There is no top-level `context.userId`.
- ✅ If the identity webhook returns `userId: null` **without** a `reply`, Keiki still runs the model (with no principal). Only `reply` ends the turn. So strangers in a group still get model replies, just with no tool access.
- ✅ The model `google/gemini-3.8-flash` is accepted.
