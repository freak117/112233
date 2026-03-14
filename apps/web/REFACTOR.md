# Telegram Lite Web — Refactored

## 📁 Структура проекта

```
apps/web/
├── api/                    # API слой
│   ├── api-client.ts       # Базовый HTTP клиент
│   ├── auth.api.ts         # Auth endpoints
│   ├── users.api.ts        # Users endpoints
│   ├── chats.api.ts        # Chats endpoints
│   ├── messages.api.ts     # Messages endpoints
│   ├── uploads.api.ts      # Upload endpoints
│   └── index.ts
│
├── components/             # UI компоненты
│   ├── AuthScreen.tsx      # Экран авторизации
│   ├── Sidebar.tsx         # Боковая панель
│   ├── ChatList.tsx        # Список чатов
│   ├── ChatWindow.tsx      # Окно чата
│   ├── MessageInput.tsx    # Ввод сообщений
│   ├── MessageItem.tsx     # Сообщение
│   ├── ProfilePanel.tsx    # Профиль
│   ├── SearchPanel.tsx     # Поиск
│   └── index.ts
│
├── hooks/                  # React hooks
│   ├── useAuth.ts          # Auth логика
│   ├── useChats.ts         # Chats логика
│   └── index.ts
│
├── store/                  # Zustand stores
│   ├── authStore.ts        # Auth state
│   ├── chatStore.ts        # Chats state
│   └── index.ts
│
└── app/
    └── page.tsx            # Главный компонент (150 строк!)
```

## 🚀 Установка

```bash
cd apps/web
npm install
```

## 📦 Зависимости

- **zustand** — глобальное состояние
- **next** — React фреймворк
- **react** — UI библиотека

## 🎯 Преимущества новой архитектуры

| Было | Стало |
|------|-------|
| 1 файл, 1500 строк | 24 файла, ~100 строк в среднем |
| God Component | Разделённые компоненты |
| Смешанная логика | Чистые слои (API, Store, UI) |
| Трудно тестировать | Можно тестировать отдельно |
| Polling в компоненте | В хуках |

## 📊 Сравнение

### До рефакторинга:
```
page.tsx — 1500 строк
- Auth логика
- API вызовы
- UI рендеринг
- State management
- Realtime polling
```

### После рефакторинга:
```
page.tsx — ~150 строк
├── api/* — 6 файлов (~200 строк)
├── components/* — 9 файлов (~800 строк)
├── hooks/* — 3 файла (~250 строк)
└── store/* — 3 файла (~150 строк)
```

## 🔧 Разработка

### Добавить новый компонент:
```bash
# Создать файл
touch components/NewComponent.tsx

# Экспортировать
echo "export { NewComponent } from './NewComponent';" >> components/index.ts
```

### Добавить новый API endpoint:
```bash
# Создать файл
touch api/newFeature.api.ts

# Использовать в хуке
import { newFeatureApi } from '../api';
```

## ✅ Чеклист после развёртывания

- [ ] Скопировать файлы на сервер
- [ ] Установить `npm install`
- [ ] Пересобрать `docker compose build web`
- [ ] Проверить авторизацию
- [ ] Проверить чаты
- [ ] Проверить отправку сообщений
- [ ] Проверить поиск пользователей
