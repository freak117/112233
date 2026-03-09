# Smoke-check v1 (этап 11)

## Preconditions
- Поднят стек: `docker compose up --build`
- API доступен по `http://localhost:3001/api/v1`
- Web доступен по `http://localhost:3000`

## Сценарии (A/B)
1. Регистрация пользователя A через [`apps/web/app/page.tsx`](apps/web/app/page.tsx).
2. Регистрация пользователя B.
3. Логин A.
4. Поиск B по username.
5. Создание direct-чата A -> B.
6. Логин B и открытие того же чата.
7. Отправка text-сообщения A -> B.
8. Проверка realtime события `new_message` на стороне B.
9. Отправка image-сообщения B -> A.
10. Проверка отображения image в истории чата A.
11. Проверка пагинации history (cursor, без дублей/пропусков).
12. Негативные проверки: invalid JWT, invalid refresh token, forbidden chat access, invalid upload mime/size.

## Expected Results
- Auth-flow работает: register/login/refresh/logout.
- Unique direct chat соблюдается.
- Realtime порядок соблюдается: `new_message -> delivered -> read`.
- Presence обновляется при connect/disconnect.

