FROM node:20-alpine

WORKDIR /app

# Копируем только необходимые файлы
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/types/package.json ./packages/types/package.json

# Устанавливаем зависимости
RUN npm install --workspace @telegram-lite/server --workspace @telegram-lite/types

# Копируем только src (без тестов)
COPY apps/server/src ./apps/server/src
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/nest-cli.json ./apps/server/nest-cli.json
COPY apps/server/prisma ./apps/server/prisma
COPY packages/types ./packages/types

# Генерируем Prisma и собираем
RUN npm run prisma:generate --workspace @telegram-lite/server
RUN npm run build --workspace @telegram-lite/server

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace", "@telegram-lite/server"]
