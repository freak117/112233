FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --filter @telegram-lite/server... --filter @telegram-lite/types...

COPY apps/server ./apps/server
COPY packages/types ./packages/types

RUN pnpm --filter @telegram-lite/server build
RUN pnpm --filter @telegram-lite/server prisma:generate

EXPOSE 3001

CMD ["pnpm", "--filter", "@telegram-lite/server", "start"]

