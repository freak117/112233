# Telegram Lite Monorepo

Монорепозиторий Telegram-lite (MVP) с приложениями:

- `apps/server` — NestJS API + Prisma + PostgreSQL + Redis + MinIO
- `apps/web` — Next.js web client
- `apps/mobile` — Expo React Native client
- `apps/desktop` — Tauri desktop wrapper
- `packages/*` — shared типы, клиенты и UI/утилиты

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

1. Установить зависимости:

```bash
npm install
```

2. Подготовить переменные окружения:

- Скопировать `.env` из `./.env.example`
- Для app-specific окружений использовать:
  - `apps/server/.env.example`
  - `apps/web/.env.example`
  - `apps/mobile/.env.example`
  - `apps/desktop/.env.example`

3. Запустить проверки:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Локальный запуск

### Через Docker Compose (если установлен Docker)

```bash
docker compose up --build
```

Сервисы:
- Web: http://localhost:3000
- API: http://localhost:3001/api/v1

### Без Docker

Запускать по workspace-скриптам приложений вручную (server/web/mobile/desktop).

## Полезные команды

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

## Production запуск на сервере

1. Подготовить production env:

```bash
cp .env.production.example .env
```

2. Обязательно поменять секреты в `.env`:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `MINIO_SECRET_KEY`

3. Собрать и поднять контейнеры:

```bash
docker compose --env-file .env up -d --build
```

4. Проверить состояние:

```bash
docker compose ps
docker compose logs -f server
```

5. Проверить API health:

`GET http://212.119.42.176:3001/api/v1/health`

### Важно по безопасности

- Внешне публикуются только web/api порты.
- PostgreSQL/Redis/MinIO остаются во внутренней сети docker-compose.
- MinIO console в production не публикуется наружу по умолчанию.

### Бэкапы (минимум)

- PostgreSQL: ежедневный `pg_dump` в отдельное хранилище.
- MinIO: регулярная репликация/копирование бакета `telegram-lite`.
- Проверять восстановление из бэкапов не реже 1 раза в месяц.

## Документация проекта

- Roadmap: `plans/telegram-lite-roadmap.md`
- Smoke checks: `plans/smoke-check-v1.md`
- Release checklist: `plans/release-checklist.md`

