FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/realtime-client/package.json ./packages/realtime-client/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN npm ci --workspace @telegram-lite/web

COPY apps/web ./apps/web
COPY packages/api-client ./packages/api-client
COPY packages/realtime-client ./packages/realtime-client
COPY packages/ui ./packages/ui
COPY packages/types ./packages/types

RUN npm run build --workspace @telegram-lite/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "@telegram-lite/web"]

