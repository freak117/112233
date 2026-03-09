# Release Checklist (v1)

## 1) Environment
- [ ] `.env` создан на основе [`apps/server/.env.example`](apps/server/.env.example)
- [ ] `.env` создан на основе [`apps/web/.env.example`](apps/web/.env.example)
- [ ] `.env` создан на основе [`apps/mobile/.env.example`](apps/mobile/.env.example)
- [ ] `.env` создан на основе [`apps/desktop/.env.example`](apps/desktop/.env.example)

## 2) Infrastructure
- [ ] `docker compose up --build` поднимает postgres/redis/minio/server/web
- [ ] [`apps/server/src/modules/health/health.controller.ts`](apps/server/src/modules/health/health.controller.ts) возвращает `ok/degraded` и статусы зависимостей

## 3) Core Scenarios
- [ ] Регистрация/логин/рефреш/логаут
- [ ] Создание direct-чата
- [ ] Отправка текстового сообщения
- [ ] Отправка изображения
- [ ] Пагинация истории сообщений
- [ ] Поиск пользователей

## 4) Realtime
- [ ] `new_message`
- [ ] `message_delivered`
- [ ] `message_read`
- [ ] `user_typing`
- [ ] `user_online` / `user_offline`

## 5) Quality Gates
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] CI workflow [` .github/workflows/ci.yml`](.github/workflows/ci.yml) зеленый

