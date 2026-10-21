# Build from the repo root:  docker build -f apps/core/Dockerfile .
FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/core/package.json apps/core/
RUN pnpm install --frozen-lockfile --prod --filter @vani/core...
COPY packages/shared packages/shared
COPY apps/core apps/core
ENV NODE_ENV=production DATA_DIR=/data
# Maritime injects PORT; the app binds 0.0.0.0:$PORT itself.
WORKDIR /app/apps/core
CMD ["node", "--import", "tsx", "src/index.ts"]
