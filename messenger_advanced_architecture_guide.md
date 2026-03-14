# Advanced Messenger Architecture & page.tsx Refactor Guide

## Purpose

This document expands on the previous guide and focuses on:

-   Refactoring a **1500+ line `page.tsx`**
-   Designing a **scalable messenger architecture**
-   Implementing **WebSocket realtime messaging**
-   Structuring the project like **production systems (Telegram /
    Discord style)**

------------------------------------------------------------------------

# 1. The Core Problem

Your current `page.tsx` likely contains:

-   authentication logic
-   API calls
-   chat list logic
-   message logic
-   realtime polling
-   UI rendering
-   forms
-   state management

All inside one component.

This creates a **God Component**.

### Typical symptoms

    1500+ lines
    20+ useState hooks
    multiple useEffect blocks
    network requests inside UI
    polling loops
    complex JSX

This architecture becomes impossible to maintain.

------------------------------------------------------------------------

# 2. Refactor Goal

We want to reduce:

    page.tsx
    1500 lines

into:

    page.tsx
    ≈120 lines

by extracting logic into layers.

------------------------------------------------------------------------

# 3. Target Architecture

A modern messenger frontend should follow layered architecture:

    UI Components
    ↓
    Hooks (logic)
    ↓
    Store (state)
    ↓
    API Layer
    ↓
    Realtime Layer
    ↓
    Backend

------------------------------------------------------------------------

# 4. Recommended Project Structure

    src
    │
    ├ api
    │  ├ apiClient.ts
    │  ├ authApi.ts
    │  ├ chatApi.ts
    │  └ messageApi.ts
    │
    ├ auth
    │  ├ AuthProvider.tsx
    │  └ useAuth.ts
    │
    ├ components
    │  ├ AuthScreen.tsx
    │  ├ Layout.tsx
    │  ├ Sidebar.tsx
    │  ├ ChatList.tsx
    │  ├ ChatWindow.tsx
    │  ├ MessageItem.tsx
    │  ├ MessageInput.tsx
    │  └ ProfilePanel.tsx
    │
    ├ hooks
    │  ├ useChats.ts
    │  ├ useMessages.ts
    │  └ useRealtime.ts
    │
    ├ realtime
    │  └ websocket.ts
    │
    ├ store
    │  ├ chatStore.ts
    │  └ messageStore.ts
    │
    └ pages
       └ page.tsx

------------------------------------------------------------------------

# 5. Step‑by‑Step Refactor Plan

## Step 1 --- Extract Authentication

Move login / register logic out of `page.tsx`.

Create:

    auth/AuthProvider.tsx

Example:

``` ts
const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  async function login(email, password) {
    const res = await authApi.login(email, password)
    setToken(res.token)
    setUser(res.user)
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

------------------------------------------------------------------------

# 6. Step 2 --- Extract API Calls

Never call APIs directly inside UI.

Bad:

    fetch('/api/messages')

Good:

    api/messageApi.ts

Example:

``` ts
export async function getMessages(chatId, token) {

  const res = await fetch(`/api/chats/${chatId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return res.json()
}
```

Benefits:

-   reusable
-   testable
-   cleaner UI

------------------------------------------------------------------------

# 7. Step 3 --- Extract Hooks

Hooks contain logic.

Example:

    hooks/useMessages.ts

``` ts
export function useMessages(chatId) {

  const [messages, setMessages] = useState([])

  useEffect(() => {
    loadMessages()
  }, [chatId])

  async function loadMessages() {
    const data = await getMessages(chatId)
    setMessages(data)
  }

  return messages
}
```

------------------------------------------------------------------------

# 8. Step 4 --- Introduce Global Store

Chat apps require shared state.

Recommended library:

**Zustand**

Example:

    store/messageStore.ts

``` ts
import { create } from 'zustand'

export const useMessageStore = create((set) => ({
  messages: [],

  setMessages: (messages) =>
    set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    }))
}))
```

------------------------------------------------------------------------

# 9. Step 5 --- Split UI Components

Large UI blocks must become components.

Example split:

    AuthScreen
    Sidebar
    ChatList
    ChatWindow
    MessageInput

Benefits:

-   readable
-   reusable
-   smaller files

------------------------------------------------------------------------

# 10. Optimized page.tsx Example

After refactor:

``` tsx
export default function Page() {

  const { user } = useAuth()

  if (!user) {
    return <AuthScreen />
  }

  return (
    <Layout>

      <Sidebar />

      <ChatWindow />

    </Layout>
  )
}
```

Now the page only describes layout.

------------------------------------------------------------------------

# 11. Realtime Messaging

Your current system likely uses **polling**:

    setInterval(fetchMessages, 2000)

Problems:

-   high server load
-   slow message delivery
-   poor scalability

Instead use **WebSocket**.

------------------------------------------------------------------------

# 12. WebSocket Architecture

    Client
    ↓
    WebSocket Gateway
    ↓
    Chat Service
    ↓
    Database

------------------------------------------------------------------------

# 13. WebSocket Client Example

    realtime/websocket.ts

``` ts
class RealtimeClient {

  socket = null

  connect(token) {

    this.socket = new WebSocket(
      `ws://localhost:3001/ws?token=${token}`
    )

    this.socket.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (data.type === "message") {
        messageStore.addMessage(data.payload)
      }
    }
  }

  sendMessage(message) {

    this.socket.send(
      JSON.stringify(message)
    )
  }
}

export const realtime = new RealtimeClient()
```

------------------------------------------------------------------------

# 14. Message Flow (Professional Systems)

Modern messengers use **optimistic updates**.

Flow:

    User sends message
    ↓
    UI displays message instantly
    ↓
    Message sent via WebSocket
    ↓
    Server stores message
    ↓
    Server broadcasts message
    ↓
    Clients update message store

Benefits:

-   instant UI
-   real-time updates
-   better UX

------------------------------------------------------------------------

# 15. Performance Improvements

Recommended improvements:

### Virtualized message list

Use:

    react-virtual
    react-window

to render only visible messages.

------------------------------------------------------------------------

### Message pagination

Load messages in chunks.

Example:

    GET /messages?before=123&limit=50

------------------------------------------------------------------------

### Lazy loading components

Example:

``` ts
const ProfilePanel = dynamic(() => import('./ProfilePanel'))
```

------------------------------------------------------------------------

# 16. Features Used by Real Messengers

Production systems implement:

### typing indicators

    User is typing...

### online presence

    online / offline

### read receipts

    sent
    delivered
    read

### message reactions

👍 ❤️ 😂

### attachments

files / images

------------------------------------------------------------------------

# 17. Architecture Used by Telegram / Discord

Telegram:

    persistent socket
    MTProto protocol
    session keys

Discord:

    Gateway WebSocket
    event-driven system
    sharded infrastructure

Slack:

    event streaming
    socket mode

------------------------------------------------------------------------

# 18. Final Result

Before:

    page.tsx
    1500 lines
    mixed responsibilities
    polling system

After:

    page.tsx
    ~120 lines
    clean architecture
    component system
    WebSocket realtime
    scalable codebase

Your project becomes significantly easier to maintain and extend.
