# Vani

Vani is a family errand runner and care assistant for Indian parents and their children abroad. It connects a family chat to a gateway and a per-family core service. The project uses Keiki for conversations and Maritime for planned hosted core instances.

## Current MVP

The repository currently implements:

- Account signup, login, family setup, and member-link tokens in the gateway.
- Signed Keiki identity and tool webhooks, with Telegram as the tested channel.
- Per-family routing to a local core process or a Maritime core instance.
- Family profile storage and a shared grocery list with add, read, remove, and clear tools.
- Idempotency records for repeated core tool calls.
- A Next.js landing page. The website proxies `/login`, `/signup`, `/app`, and `/api/*` to the gateway.

The product plan also covers grocery checkout, medicines, refill forecasts, health support, document storage, proactive schedules, and family digests. Those workflows are not complete. The landing page describes the planned product as well as the working MVP.

## Repository map

```text
apps/
  core/       Per-family state and tool execution. Runs on port 8788 locally.
  gateway/    Accounts, family linking, Keiki webhooks, and core routing. Port 8787.
  web/        Next.js landing page and gateway rewrites. Port 3000.
packages/
  shared/     Zod contracts and Keiki tool definitions shared by the services.
keiki/        Agent prompt and the manual Keiki configuration sync command.
scripts/      Local simulation and cloud development setup scripts.
docs/         Development and operations guides.
```

## Run Vani locally

Use Node.js 24 and pnpm 10.33.4. Corepack reads the same pnpm version from `package.json`.

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install --frozen-lockfile
cp .env.example .env
```

Replace `KEIKI_WEBHOOK_SECRET` in `.env` with a random value of at least 16 characters. Keep `LOG_KEIKI_PAYLOADS=0` unless you are inspecting a test payload. Payload logs can contain message and identity data.

The root `.env` configures the gateway and the core. Next.js reads `apps/web/.env.local` separately. Create that file for local development:

```dotenv
GATEWAY_URL=http://localhost:8787
SITE_URL=http://localhost:3000
```

Start each process in a separate terminal:

```bash
pnpm dev:core
```

```bash
pnpm dev:gateway
```

```bash
pnpm dev:web
```

Open `http://localhost:3000`. Check the services directly with:

```bash
curl --fail http://localhost:8788/health
curl --fail http://localhost:8787/health
curl --fail --head http://localhost:3000
```

## Check a change

```bash
pnpm typecheck
pnpm --filter @vani/web build
```

CI runs both commands on Node.js 24 after `pnpm install --frozen-lockfile`. It does not deploy Vani.

## Develop in the cloud

Open the repository in [GitHub Codespaces](https://codespaces.new/Pratheek555/Vani). The devcontainer installs Node.js 24, pnpm 10.33.4, the Claude Code CLI, and the Codex CLI. It forwards the website and gateway ports as private ports. It does not automatically forward the core port.

The same setup script works in Codex Cloud and other Linux development environments:

```bash
bash scripts/cloud-setup.sh
```

The script installs locked dependencies and creates missing local environment files. It does not sync Keiki, deploy a service, copy personal data, or publish a cloud environment. See [Cloud development](docs/cloud-development.md) for Codespaces URLs, Codex Cloud publishing, `/data` persistence, and CLI authentication.

## Keep secrets and family data out of Git

Do not commit `.env`, `apps/web/.env.local`, API keys, bot tokens, CLI credentials, SQLite databases, message payloads, prescriptions, reports, or family details. Add service credentials through the cloud provider's secret settings. Use synthetic data for development.

`pnpm keiki:sync` changes the remote Keiki agent. Run it only when you intend to publish that configuration. Cloud setup never runs it automatically.
