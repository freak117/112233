FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --filter @telegram-lite/web...

COPY apps/web ./apps/web

RUN pnpm --filter @telegram-lite/web build

EXPOSE 3000

CMD ["pnpm", "--filter", "@telegram-lite/web", "start"]

