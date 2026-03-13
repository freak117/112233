# Telegram Lite Monorepo

Монорепозиторий Telegram-lite (MVP) с приложениями:

- `apps/server` — NestJS API + Prisma + PostgreSQL + Redis + MinIO
- `apps/web` — Next.js web client
- `apps/mobile` — Expo React Native client
- `apps/desktop` — Tauri desktop wrapper
- `packages/*` — shared типы, клиенты и UI/утилиты

## Статус проекта ✅

**Все этапы roadmap завершены:**
- ✅ Этап 0-2: Foundation, Backend skeleton, миграции
- ✅ Этап 3-6: Auth, Users, Chats, Messages, Realtime, Uploads
- ✅ Этап 7: Shared packages
- ✅ Этап 8: Web client
- ✅ Этап 9: Mobile client (Expo)
- ✅ Этап 10: Desktop client (Tauri)
- ✅ Этап 11: Тестирование (Unit/Integration/E2E)
- ✅ Этап 12: DevOps и CI/CD
- ✅ Этап 13: Стабилизация

## Структура

```text
/apps
  /server
  /web
  /mobile
  /desktop
/packages
  /types
  /api-client
  /realtime-client
  /ui
  /utils
  /config
```

## Требования

- Node.js 20+
- npm 10+
- (опционально) Docker Desktop для `docker compose`

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Подготовка переменных окружения

Скопировать `.env.example` в `.env` и заменить секреты:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `MINIO_SECRET_KEY`

### 3. Запуск через Docker Compose

```bash
docker compose up --build
```

Сервисы:
- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- Health: http://localhost:3001/api/v1/health

### 4. Запуск тестов

```bash
# Unit тесты
npm run test:unit --workspace @telegram-lite/server

# Integration тесты (требуют PostgreSQL и Redis)
docker compose up -d postgres redis
npm run test:integration --workspace @telegram-lite/server

# E2E тесты (полный цикл)
npm run test:e2e --workspace @telegram-lite/server
```

## Полезные команды

- `npm run lint` — линтинг
- `npm run typecheck` — проверка типов
- `npm run test:unit` — unit тесты
- `npm run test:integration` — integration тесты
- `npm run test:e2e` — e2e тесты
- `npm run build` — сборка всех проектов

## Запуск клиентов

### Web
```bash
npm run dev --workspace @telegram-lite/web
```

### Mobile (Expo)
```bash
npm run dev --workspace @telegram-lite/mobile
```

### Desktop (Tauri)
```bash
npm run dev --workspace @telegram-lite/desktop
```

## Документация

- **Полная инструкция:** [`RUNNING.md`](RUNNING.md)
- **Roadmap:** [`plans/telegram-lite-roadmap.md`](plans/telegram-lite-roadmap.md)
- **Smoke tests:** [`plans/smoke-check-v1.md`](plans/smoke-check-v1.md)
- **Release checklist:** [`plans/release-checklist.md`](plans/release-checklist.md)
- **Техническое задание:** [`telegram_lite_spec_for_ai.md`](telegram_lite_spec_for_ai.md)

## CI/CD

GitHub Actions workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Автоматически запускает: lint, typecheck, unit, integration, e2e, build.

## Production запуск

1. Подготовить production env:
```bash
cp .env.production.example .env
```

2. Обязательно поменять секреты в `.env`

3. Собрать и поднять контейнеры:
```bash
docker compose --env-file .env up -d --build
```

4. Проверить health:
`GET http://localhost:3001/api/v1/health`

### Бэкапы

- PostgreSQL: ежедневный `pg_dump`
- MinIO: репликация бакета `telegram-lite`

## License

MIT

