FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

RUN corepack enable \
    && corepack prepare pnpm@10.33.4 --activate \
    && npm install --global @anthropic-ai/claude-code@2.1.306 @openai/codex@0.163.0 \
    && mkdir -p /data \
    && chown node:node /data
