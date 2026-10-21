# CLAUDE.md: Vani

Vani is a family errand runner and care assistant. It lives in a family's WhatsApp or iMessage group and helps Indian parents with whatever their child (a student abroad) would normally handle from far away. We're building it for the Keiki x Maritime competition. **See `PLAN.md` for the full product plan, scope and week-1 schedule.**

## Key decisions (don't re-litigate without asking)
- **Users:** Indian parents in India + student abroad (owner). **English only** for MVP. Input is text plus photos. No voice yet.
- **v1 focus:** errands (groceries, medicines), medicine manager (refill forecasting), and a health support layer (report explainer, doctor-visit prep, red-flag escalation, medical vault). **Fitness devices are deferred.**
- **Group behavior:** Vani listens in the group and chimes in when clearly useful. Detailed or private work moves to DMs.
- **Execution:** both *prepare mode* (agent builds the cart, a human pays) and *autonomous mode* (COD or prepaid wallet within caps). The **approval policy is configurable per family.**
- **Groceries (decided Oct 21, 2026):** **Swiggy Instamart** through Swiggy's official MCP server, with no browser automation. Orders go through the **owner's** Swiggy account to the parents' saved address. The default payment is a **UPI payment link sent to the approver** (prepare mode). Cash on delivery and Swiggy Money are per-family options.
- **Architecture:** **Keiki** = front (channels, persona, conversation memory, approvals). **Maritime** = brain (Vani Core: state, task engine, scheduler, vendor browser automation, document vault), exposed to Keiki as HTTP tools.
- **Website:** React with Next.js App Router in `apps/web`. The landing page is built first. The customer onboarding and dashboard will also use Next.js.
- **Stack:** TypeScript (strict), Node LTS, pnpm, Hono, SQLite + Drizzle, Playwright, zod.
- **Builder:** solo. Week-1 MVP deadline is Sat Oct 25, 2026.

## Layout (pnpm workspace)
```
vani/
  packages/shared/  # zod contracts: CoreRequest/CoreResponse, Caller, FamilyProfile, tool schemas (tools.ts)
  apps/web/         # Next.js + React website: landing page at /; onboarding and dashboard next
    src/content/landing.ts  # landing-page copy, navigation, and CTA links
    src/components/landing/ # page sections and interactive setup preview
  apps/gateway/     # signup, sessions, Telegram deep links, Keiki identity
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
- `pnpm dev:core`, `pnpm dev:gateway`, and `pnpm dev:web` in separate terminals (ports 8788, 8787, and 3000).
- Open http://localhost:3000 for the landing page. Next.js proxies `/login`, `/signup`, `/app`, and `/api/*` to the gateway. `/app` requires a session.
- `pnpm typecheck`
- `pnpm --filter @vani/web build` and `pnpm --filter @vani/web start` for the production website.
- `pnpm db:generate` after any change to a `db/schema.ts` (migrations run automatically at boot)
- `pnpm sim identity <tgUserId> "/start <token>" [--group <id>]` and `pnpm sim tool <memberId> <tool> [json] [--conv <groupId>] [--msg <messageId>]` (default is a DM turn; reuse `--msg` to test replay). In Git Bash, a leading `/start` gets mangled into a path, so run `MSYS_NO_PATHCONV=1 node node_modules/tsx/dist/cli.mjs scripts/keiki-sim.ts ...` instead.
- `pnpm keiki:print` / `pnpm keiki:sync` push the agent config to Keiki
- Docker: `docker build -f apps/<gateway|core>/Dockerfile .` from the repo root

## Website status
- The landing page follows the linked Dribbble reference, with lavender gradients, chat examples, feature cards, setup tabs, approval modes, safety details, and an FAQ.
- `apps/web/src/content/landing.ts` owns the page copy. It describes the product scope in `PLAN.md`, not a claim that every planned core tool is implemented. Telegram is the only tested channel. Do not advertise WhatsApp, iMessage, voice, pricing, or customer numbers as available.
- Sign-up, login, and family setup still use gateway HTML through the Next.js rewrites. The React onboarding and dashboard are the next phase.
- Next.js reads environment files from `apps/web`, independently of the gateway's root `.env`. Set `GATEWAY_URL` and `SITE_URL` in `apps/web/.env.local` when overriding the local defaults. `GATEWAY_URL` is the gateway origin. `SITE_URL` is the public website origin used in share metadata.
- The gateway and core Dockerfiles do not serve the website. Deploy `apps/web` separately and set its environment variables before building.

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
- 📄 **Proactive outbound** (openapi.json, read Oct 21): `POST /api/v1/developer/agents/{agentId}/notice` with `{ text, phone? }` and a key with `agents:write`. `phone` targets one conversation (the key tools see as `context.phone`, e.g. `tg:<userId>`). Leave it out to broadcast to up to 200 recent conversations. The reply reports `ran | queued | unavailable` per conversation. It returns 404 when that phone has never talked to the agent. The agent rewrites the notice in its own words and "decides whether" to send it, so a nudge lands in that chat's history. ❓ **Test** whether it reliably relays our notice, and which `phone` a Telegram group uses.
- 📄 **SDK 0.1.4 types:** cloud tools accept `policy: { approval: 'ask' | 'allow', requiredScopes }`. `approval: 'ask'` presumably makes Keiki confirm with the speaker before running the tool, which suits a "place order" step. `defineAlert` (cron/webhook alerts) exists only for self-hosted kit agents, not cloud agents. `ToolAppPresentation` cards appear only on Keiki's own purchased lines, not Telegram.
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
- ❓ The SDK's `ChannelEnvelope` type lists `channelId` (the room, e.g. a Telegram group), `isDirect` and `messageId`. We now pin groups by `channelId` and set `Caller.conversationKind` from `isDirect` (or from `channelId === userId` on Telegram). If neither field shows up, the kind is `unknown` and is treated like a group. **Check this with `LOG_KEIKI_PAYLOADS=1` in a real Telegram group and DM.**

### Findings (Oct 21, 2026): API channel + real-model grocery test
- ✅ **API channel:** `POST https://onkeiki.com/api/v1/openai/chat/completions` with `{ model: <agentId>, messages, stream: false }` and an `x-conversation-id` header.
  - The sender has **no `userId`**, only that `conversationId`. The body's `user` field isn't passed through.
  - The identity webhook gets no `messages`, and its `conversation.id` is `api:<agentId>:<conversationId>`.
  - So the gateway treats `api:<conversationId>` as the sender, and linking on this channel goes through `link_account`.
- ✅ Keiki calls the identity webhook about 3 times per turn while we answer with `ttlSeconds: 0`.
- ✅ `keiki:sync` accepts `agent.max_steps`.
- ✅ **Grocery list, real model** (gemini-3.8-flash, API channel): 21 of 21 test turns picked the expected tool with the right input.
  - Correct non-calls: "done" got a question, a medicine was refused, "order it" got "not yet", and small talk got no tool.
  - One message can trigger two calls, for example a remove plus an add.
  - Turns took 4–12s through a cloudflared quick tunnel.
- ❓ The API channel can't cover Telegram group behavior (@mentions), photos, or Telegram DM/group detection. Replies use Markdown (bold, bullets), so check how Telegram shows them.
- ✅ **Telegram DM, real traffic:**
  - Tool calls carry `context.channel{channel:"telegram", userId, inboundText, messageId}` and `context.phone: "tg:<userId>"`. They have no `channelId`, `isDirect` or `principal`, and the identity webhook is never called.
  - So the gateway can't tell a DM from a group. `conversationKind` comes out `unknown`, which means `dmOnly` tools would be refused even in DMs.
  - `messageId` is present (e.g. "17"), so dedupe of redelivered messages works.
- ✅ Grocery list in a real Telegram DM: 8 of 8 turns were correct, at about 11–13s each.
- ❓ **Telegram groups are still untested:** the payload shape, @mention gating, and whether a group and a DM share history or memory.
  - Keiki's docs (cloud-agents, "Telegram group chats") say a group is one shared conversation by default (`identity: "chat"`).
  - `identity: "user"` gives each member their own conversation. `replyMode: "always"` answers every group message, and `mentionAliases` defaults to the bot's display name.
  - These are set per identity, in the dashboard. Keiki's per-user memory is a separate feature.
- Testing note: Telegram Web keeps more than one chat in the page. Before sending, scope the message box to `.chat.active` and check its title, or the message can land in a different chat.

### Maritime deploy (Oct 20, 2026)
- ✅ CLI: `npm install -g maritime-cli` (2.0.1). Run it from PowerShell, because the postinstall's `tar` fails on `C:\` paths in Git Bash. Auth is the `MARITIME_TOKEN` env var (an `mk_` key). `maritime doctor --agent` checks it.
- 📄 Three ways to get code onto an agent: a **public** prebuilt image (`imageName`; Docker Hub/GHCR only, no private registries), a GitHub repo, or a local dir/zip (`maritime agents create --from-dir`). Repo and zip builds take 1–3 min and need the `Dockerfile` **at the root**, so our `apps/*/Dockerfile` would have to be staged at the root.
- 📄 Custom containers use `framework`/`template` `"custom"`. `/chat` receives `{ message, source }` and reads the reply from `response` (then `reply`/`message`/`text`/`output`), which matches our core.
- 📄 Public apps (`--public --port`) sleep when idle and wake in about 1s on a request, and `/data` persists. Custom domains aren't documented.
- Plan: build the core image **once** and push it as a public GHCR image, so each new family VM just pulls it with no per-family build. Run the gateway as a public Maritime agent to get a stable URL in place of the trycloudflare tunnel.

### Maritime Computers, including Android (docs and changelog read Oct 21, 2026)
- 📄 A **Computer** is a persistent machine per end user that *our* model drives over MCP at `https://mcp.maritime.sh/mcp`. Pin it to one user with `/mcp/u/<externalUserId>`, so a prompt injection can't reach another family's machine.
- 📄 Its tools are `get_computer`, `computer` (screenshot, click, type, scroll, key), `computer_batch`, `run_shell`, `read_file` / `write_file`, `request_takeover` and `takeover_status`. `request_takeover` returns a link where a person finishes a login, OTP or payment and then hands control back.
- 📄 The REST equivalent is `/api/v1/computers`, called with an API key that has the `computers` scope.
- 📄 **Android** has been available since Sep 25, 2026 (`os: "android"`). For apps that ship only ARM code, `arch: "arm64"` has been available since Oct 9. The agent installs apps, taps through them and follows links, and a person can watch live.
- ❓ The docs page only describes the Linux desktop. Unknown: how apps get installed (Play Store region or APK), and whether Indian apps run (emulator checks).
- 📄 **Persistence:** logins and files last until the computer is deleted. It sleeps after 5 idle minutes. Waking takes about a second, but creating one can take up to 60s.
- 📄 **Plan:** a computer takes one machine slot (~$1/month) but **needs a paid plan**: Starter is $20/month for 20 machines, with 5 awake at once. Plan status reports `androidAvailable`.
- 📄 **Limits:** 30 creates, 300 actions and 30 viewer links per minute per key.

### How tool calls stay safe (Oct 20, 2026)
- **DM-only tools:** set `dmOnly: true` in `packages/shared/src/tools.ts` on any tool that returns health or money details. The core refuses it unless `caller.conversationKind === 'dm'`.
- **Idempotency:** the gateway hashes conversation + Keiki `messageId` + tool + input into `idempotencyKey`. The core stores the answer in `tool_calls` for 7 days and replays it on redelivery. Calls that throw aren't stored. With no `messageId`, there's no dedupe.
- **Profile drift:** every tool request carries the gateway's `FamilyProfile`. The core resyncs (and deletes removed members) whenever its copy differs.

### Swiggy Instamart MCP (docs read Oct 21, 2026)
Docs: mcp.swiggy.com/builders. `/builders/llms.txt` lists every page; add `.md` to a page URL for clean markdown.
- 📄 The server is `https://mcp.swiggy.com/im` (MCP over HTTP). Every tool returns `{ success, data, message? }`, or `{ success: false, error: { message } }`.
- 📄 **Auth:** OAuth 2.1 + PKCE with Dynamic Client Registration (`POST /auth/register`). The user logs in with phone + OTP on Swiggy's page. The access token lasts 5 days. Each refresh returns a new refresh token valid for 30 days. On a 401, refresh first, then re-authorize. Redirect URIs must be HTTPS and on Swiggy's allowlist, except `http://localhost`. Claude Desktop (`mcp-remote`) uses the localhost path against production, so our own family can connect without approval.
- 📄 **Production for other users is invite-only.** Apply at `/builders/access` with redirect URIs, use case and a demo video. Staging comes first (`mcp-staging.swiggy.com`, seeded data, no real orders). Production follows once staging has been green for 48 hours.
- 📄 **Grocery flow:**
  1. `get_addresses`.
  2. `your_go_to_items` (frequently ordered items at that address) or `search_products` (returns variants; pass `spinId` + `skuId`).
  3. `update_cart`. It **replaces the whole cart**. The cart lives on Swiggy's side, per account, tied to one address, and expires.
  4. `get_cart` (bill breakdown), then `get_payment_options`.
  5. `checkout`, then `track_order` (poll no more than once every 10s).

  The minimum order is ₹99. Errors are matched on message text: out of stock, address not serviceable, minimum not met, cart expired.
- 📄 **Payment** (`checkout.paymentMethod`):
  - `Cash` places the order at once.
  - `SwiggyPay` (Swiggy Money) takes the money from the wallet during checkout.
  - `UPI` + `generateUPIQR: true` creates the order as `PENDING_PAYMENT` and returns `bridgeUrl`, an HTTPS scan-or-tap payment page to send to the payer. Then poll `check_payment_status` (about 19s per call; honor `pollingIntervalInMs` and `maxTimeToPollForInMs`). Call `confirm_order({ orderId, paasId })` if Swiggy didn't confirm it automatically.

  Never ask anyone for a UPI ID.
- 📄 **`checkout` is not idempotent.** After an error or timeout, check `get_orders` before any retry. Never set `confirmDuplicate` on our own.
- 📄 **Swiggy's rules for agents:** before `checkout`, show the items, total, payment method and full delivery address, and get an explicit yes. Show Swiggy's success message as-is ("Instamart order placed successfully"). Orders can't be cancelled through MCP, so tell the user to call Swiggy customer care at 080-67466729.
- 📄 **Data:** Swiggy is the data fiduciary and we are a processor. Keep Swiggy data only as long as the task needs it, never use it for analytics or training, and hash identifiers at rest. Processing responses outside India (our LLM and VMs) needs a signed DPA with Swiggy before production.
- 📄 **Limits:** gateway caps return a 429 with `Retry-After`. Keep one MCP session per user, not one per call.
- 📄 Swiggy accepts phone numbers from 27 countries and international cards (press release, Oct 2024). ❓ Whether the MCP login page accepts a foreign number.
