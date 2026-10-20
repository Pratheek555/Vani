# Build from the repo root:  docker build -f apps/gateway/Dockerfile .
FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/gateway/package.json apps/gateway/
RUN pnpm install --frozen-lockfile --prod --filter @vani/gateway...
COPY packages/shared packages/shared
COPY apps/gateway apps/gateway
ENV NODE_ENV=production DATA_DIR=/data
# Maritime injects PORT; the app binds 0.0.0.0:$PORT itself.
CMD ["node", "--import", "tsx", "apps/gateway/src/index.ts"]
