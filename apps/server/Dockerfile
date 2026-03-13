FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN npm install --workspace @telegram-lite/server --workspace @telegram-lite/types

COPY apps/server ./apps/server
COPY packages/types ./packages/types

RUN npm run prisma:generate --workspace @telegram-lite/server
RUN npm run build --workspace @telegram-lite/server

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace", "@telegram-lite/server"]

