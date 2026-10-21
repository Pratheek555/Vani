# Develop Vani in the cloud

This guide prepares a private development environment. It does not create a Codespace, publish a Codex Cloud environment, deploy Vani, or expose a production service.

## Use GitHub Codespaces

1. Open [Vani in GitHub Codespaces](https://codespaces.new/Pratheek555/Vani).
2. Create the Codespace with the repository's devcontainer configuration.
3. Wait for `bash .devcontainer/setup.sh` to finish.
4. Connect the Codespace to T3 Connect once, if you have not connected this persistent volume before.

```bash
/data/bin/t3 connect --headless
```

5. Start the core, gateway, and website in separate terminals.

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

The devcontainer forwards port 3000 for the website and port 8787 for the gateway. Both ports are private by default. Port 8788 belongs to the core, is ignored by automatic port forwarding, and must not be made public. T3 listens only on `127.0.0.1:3773`, and the devcontainer does not forward that port. Use T3 Connect from your phone instead of exposing port 3773.

Private forwarded URLs require GitHub authentication. Keiki cannot deliver webhooks to the gateway under this baseline. To test external channels, deliberately expose only the gateway through a temporary public tunnel or change port 8787 visibility for the test, then restore private visibility. Keep webhook signature verification enabled and use synthetic data.

Codespaces stop after the idle timeout set by your account or organization. A Codespace is a development machine, not hosting. Deploy the website, gateway, and cores to their intended hosting services for continuous availability.

After the one-time connection, use GitHub on your phone to start or stop the Codespace. Then open T3 on your phone and select the cloud T3 environment. T3 can control agents while your laptop is off because both the T3 server and the agents run in the Codespace. The phone cannot reach the environment while the Codespace is stopped.

Codespaces has a monthly allowance, separate from Claude and Codex subscriptions. On a 2-core machine, GitHub Free includes 60 running hours and GitHub Pro includes 90. Paid overage is $0.18 per running hour. Storage has its own allowance and can accrue usage while the machine is stopped. Check your remaining usage and spending budget in [GitHub billing](https://github.com/settings/billing), and review the [current Codespaces prices](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces). Stop the Codespace when you finish using it.

## Use the persistent data directory

The devcontainer mounts the `vani-data` Docker volume at `/data`. The Codespaces setup writes `DATA_DIR=/data`, so gateway and local core SQLite files survive container rebuilds. T3 state lives in `/data/t3`. Codex credentials live in `/data/providers/codex`, and Claude credentials live in `/data/providers/claude`. These directories have mode `700`.

Container rebuilds preserve the `/data` volume, T3 connection state, CLI credentials, and Vani SQLite files. Deleting the Codespace or its volume deletes all of that state. The repository does not contain or print those credentials.

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

The devcontainer installs `@anthropic-ai/claude-code@2.1.306` and `@openai/codex@0.163.0` globally. It installs T3 0.1.1 from `https://t3.codes/install.sh` as the `node` user. Update these versions deliberately in `.devcontainer/Dockerfile` and `.devcontainer/t3-setup.sh`.

The setup creates persistent credential directories, but it does not sign in to any service. Authenticate each CLI interactively inside the Codespace:

```bash
export T3CODE_HOME=/data/t3 CODEX_HOME=/data/providers/codex CLAUDE_CONFIG_DIR=/data/providers/claude PATH=/data/bin:$PATH
claude auth login --claudeai
t3 connect link --headless
```

This setup uses Claude only. Codex remains installed and unauthenticated. Run `t3 connect link --headless` only for the one-time interactive T3 Connect setup or when you need to reconnect the environment. Do not copy a local credential directory into the container or commit its files.

From Windows PowerShell, run the cloud login through SSH:

```powershell
gh codespace ssh -c vani-cloud-development-jv94gppvj9xhpq64 -- 'env CLAUDE_CONFIG_DIR=/data/providers/claude claude auth login --claudeai'
```

Open the authorization link and paste the returned code into that terminal only.

CLI access depends on your Anthropic and OpenAI account, organization policy, subscription, and usage limits. Installing a CLI does not grant a subscription or increase those limits.

## Understand the T3 lifecycle

`.devcontainer/setup.sh` runs the existing Vani cloud setup first. It then runs `.devcontainer/t3-setup.sh`, which creates the persistent directories and installs the pinned T3 version in `/data/bin` when needed.

Each Codespace start runs `.devcontainer/t3-start.sh`. The script starts `/data/bin/t3 serve` from the repository root with these settings:

- The server binds to `127.0.0.1:3773`.
- T3 bootstraps the project from the current repository directory.
- `nohup` keeps the server detached without `systemd`.
- `/data/t3/server.pid` records the process ID.
- `/data/t3/server.log` receives server output.

The start script skips startup only when the PID and command match this T3 server and its HTTP check passes. It ignores a stale PID and never kills a process that reused the PID. It refuses to start if an untracked server occupies port 3773. Startup fails if no HTTP response arrives during the readiness wait.

If `/data/bin/t3` is missing on start, rebuild the devcontainer or run `bash .devcontainer/t3-setup.sh`. The start hook does not download an unpinned replacement.

## Handle development secrets

The generated `KEIKI_WEBHOOK_SECRET` protects local webhook verification. It is not a shared production secret. Store real `KEIKI_API_KEY`, `MARITIME_API_KEY`, bot credentials, and deployment secrets in the provider's secret manager.

Keep `LOG_KEIKI_PAYLOADS=0` for normal development. Turn it on only for a short test with synthetic users, then turn it off and remove the captured logs.
