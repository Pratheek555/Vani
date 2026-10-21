# Develop Vani in the cloud

This guide prepares a private development environment. It does not create a Codespace, publish a Codex Cloud environment, deploy Vani, or expose a production service.

## Use GitHub Codespaces

1. Open [Vani in GitHub Codespaces](https://codespaces.new/Pratheek555/Vani).
2. Create the Codespace with the repository's devcontainer configuration.
3. Wait for `bash .devcontainer/setup.sh` to finish.
4. Start the core, gateway, and website in separate terminals.

```bash
pnpm dev:core
```

```bash
pnpm dev:gateway
```

```bash
pnpm dev:web
```

The setup script derives public Codespaces origins from `CODESPACE_NAME` and `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN`. It writes the gateway origin for port 8787 to the root `.env` and the website origin for port 3000 to `apps/web/.env.local`. `GATEWAY_URL` stays `http://localhost:8787` because the Next.js server reaches the gateway inside the same Codespace.

The devcontainer forwards port 3000 for the website and port 8787 for the gateway. Both ports are private by default. Port 8788 belongs to the core, is ignored by automatic port forwarding, and must not be made public.

Private forwarded URLs require GitHub authentication. Keiki cannot deliver webhooks to the gateway under this baseline. To test external channels, deliberately expose only the gateway through a temporary public tunnel or change port 8787 visibility for the test, then restore private visibility. Keep webhook signature verification enabled and use synthetic data.

Codespaces stop after the idle timeout set by your account or organization. A Codespace is a development machine, not hosting. Deploy the website, gateway, and cores to their intended hosting services for continuous availability.

## Use the persistent data directory

The devcontainer mounts the `vani-data` Docker volume at `/data`. The Codespaces setup writes `DATA_DIR=/data`, so gateway and local core SQLite files survive container rebuilds. Deleting the Codespace or its volume deletes that development data.

The gateway and core have separate Dockerfiles under `apps/`. Build either image from the repository root:

```bash
docker build -f apps/gateway/Dockerfile .
docker build -f apps/core/Dockerfile .
```

Those images do not serve the Next.js website. Build and host `apps/web` separately. Hosted core containers must keep their SQLite files under `/data`. Do not copy a personal or production database into a development volume.

## Publish a Codex Cloud environment manually

The repository setup command is:

```bash
bash scripts/cloud-setup.sh
```

Publish the environment through ChatGPT:

1. Open ChatGPT on the web or in the desktop app and sign in.
2. Choose **Work in**, choose **Cloud**, and open **Select environment**.
3. Choose **Create environment**. Connect GitHub if ChatGPT asks.
4. Select `Pratheek555/Vani`, then choose **Get started**.
5. Set the install script to `bash scripts/cloud-setup.sh` if the generated setup does not already use it.
6. Review the dependency installation and test results. Add only the access that development tasks need.
7. Save the changes and choose **Publish**.
8. Wait until ChatGPT shows **Environment published**, then start a new task from that environment.

These steps follow the [Codex Cloud guide](https://learn.chatgpt.com/docs/cloud). Codex Cloud keeps each task in a separate workspace and reuses the published environment setup across tasks.

Use the **Package managers** internet-access preset for dependency installation. Add allowed domains only when a task needs them. Put ordinary non-secret configuration in **Environment variables**. Put credentials for allowed HTTPS services in **Network secrets**. Keep **Who can use** set to **Only me** unless you intend to share the environment.

The baseline setup does not need Keiki, Maritime, Telegram, or production credentials. Add those credentials only for a task that must call the service. Never put a credential in the install script, an environment file committed to Git, a task prompt, or a terminal transcript.

## Understand what the setup script changes

`scripts/cloud-setup.sh` performs the same steps in Codespaces and Codex Cloud:

- Activates pnpm 10.33.4 through Corepack.
- Runs the frozen install through `corepack pnpm@10.33.4`, without writing system-wide package-manager shims.
- Copies `.env.example` to `.env` only when `.env` is missing.
- Replaces a missing or example `KEIKI_WEBHOOK_SECRET` with a random 32-byte value.
- Sets `LOG_KEIKI_PAYLOADS=0`.
- Creates `apps/web/.env.local` only when that file is missing outside Codespaces.
- Writes Codespaces URLs when Codespaces provides its hostname variables.

You can run the script again. It preserves a real webhook secret and converges on the same configuration. It never runs `pnpm keiki:sync`.

## Authenticate the optional agent CLIs

The devcontainer installs `@anthropic-ai/claude-code@2.1.306` and `@openai/codex@0.163.0` globally. Update these versions deliberately in `.devcontainer/Dockerfile`. Authenticate each CLI manually with its normal login command. Do not copy a local credential directory into the container or commit its files.

CLI access depends on your Anthropic and OpenAI account, organization policy, subscription, and usage limits. Installing a CLI does not grant a subscription or increase those limits.

## Handle development secrets

The generated `KEIKI_WEBHOOK_SECRET` protects local webhook verification. It is not a shared production secret. Store real `KEIKI_API_KEY`, `MARITIME_API_KEY`, bot credentials, and deployment secrets in the provider's secret manager.

Keep `LOG_KEIKI_PAYLOADS=0` for normal development. Turn it on only for a short test with synthetic users, then turn it off and remove the captured logs.
