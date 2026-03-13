# Telegram Lite — Руководство по запуску и тестированию

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Подготовка окружения

Скопируйте `.env.example` в корень проекта:

```bash
cp .env.example .env
```

**Важно:** Замените секреты в `.env` на свои значения:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `MINIO_SECRET_KEY`

### 3. Запуск через Docker Compose

```bash
docker compose up --build
```

Сервисы доступны по адресам:
- **Web:** http://localhost:3000
- **API:** http://localhost:3001/api/v1
- **Health check:** http://localhost:3001/api/v1/health

---

## Тестирование

### Unit тесты

```bash
npm run test:unit --workspace @telegram-lite/server
```

Проверяют:
- Валидацию username
- Формирование direct chat key
- Auth сервис (register, login)

### Integration тесты

```bash
npm run test:integration --workspace @telegram-lite/server
```

Требуют запущенные PostgreSQL и Redis:
```bash
docker compose up -d postgres redis
```

Проверяют:
- Регистрацию и логин
- Валидацию данных
- Работу с БД

### E2E тесты

```bash
npm run test:e2e --workspace @telegram-lite/server
```

Полный цикл тестирования:
1. Регистрация пользователя A и B
2. Поиск пользователей
3. Создание direct-чата
4. Отправка сообщений
5. Проверка unique chat constraints
6. Health check

---

## Запуск клиентов

### Web клиент

```bash
npm run dev --workspace @telegram-lite/web
```

### Mobile клиент (Expo)

```bash
npm run dev --workspace @telegram-lite/mobile
```

Откройте Expo Go на устройстве или используйте эмулятор.

### Desktop клиент (Tauri)

```bash
npm run dev --workspace @telegram-lite/desktop
```

Требует установленный Rust toolchain.

---

## Smoke check

Пройдитесь по сценариям из [`plans/smoke-check-v1.md`](plans/smoke-check-v1.md):

1. Регистрация двух пользователей
2. Поиск по username
3. Создание чата
4. Отправка текстовых сообщений
5. Отправка изображений
6. Проверка realtime обновлений

---

## CI/CD

GitHub Actions workflow автоматически запускает:
- `lint`
- `typecheck`
- `test:unit`
- `test:integration`
- `test:e2e`
- `build`

При пуше в репозиторий.

---

## Структура проекта

```
/apps
  /server       — NestJS API + Prisma
  /web          — Next.js клиент
  /mobile       — Expo React Native
  /desktop      — Tauri wrapper
/packages
  /types        — Общие DTO и типы
  /api-client   — REST клиент
  /realtime-client — WebSocket клиент
  /ui           — UI компоненты
  /utils        — Утилиты
```

---

## Полезные команды

```bash
# Проверка типов
npm run typecheck

# Линтинг
npm run lint

# Сборка всех проектов
npm run build

# Prisma команды
npm run prisma:generate --workspace @telegram-lite/server
npm run prisma:migrate --workspace @telegram-lite/server
npm run prisma:seed --workspace @telegram-lite/server
```

---

## Troubleshooting

### Ошибки подключения к БД

Убедитесь, что PostgreSQL запущен:
```bash
docker compose ps
```

### Проблемы с миграциями

```bash
npm run prisma:generate --workspace @telegram-lite/server
npm run prisma:migrate --workspace @telegram-lite/server
```

### Ошибки тестов

Запустите тесты с подробным логом:
```bash
npm run test:e2e --workspace @telegram-lite/server -- --verbose
```

---

## Готовность к продакшену

Перед деплоем:
1. Замените все секреты в `.env`
2. Включите SSL для MinIO
3. Настройте бэкапы PostgreSQL
4. Проверьте [`plans/release-checklist.md`](plans/release-checklist.md)
