# Messenger Project Improvements Guide

## Overview

This document describes improvements for the current `page.tsx` file and
the overall architecture of the messenger project.

The current implementation places most application logic inside a single
large React component (\~1500 lines). While this works for a prototype,
it creates long‑term problems for maintainability, scalability, and
performance.

This guide explains:

-   Why the current structure is problematic
-   How to refactor `page.tsx`
-   How to split the application into components
-   How to separate UI, logic, and networking
-   How to replace polling with WebSockets
-   How to structure a production‑ready messenger frontend

------------------------------------------------------------------------

# Problems in the Current Architecture

The file currently mixes several layers:

-   Authentication logic
-   API calls
-   Chat state
-   UI rendering
-   Realtime logic (polling)
-   Form state
-   Layout

This results in a **God Component**.

Problems this causes:

1.  Difficult to maintain
2.  Hard to debug
3.  Hard to test
4.  Hard to reuse components
5.  Large re-render scope
6.  Difficult to scale the project

------------------------------------------------------------------------

# Refactoring Goals

The main goals of refactoring are:

1.  Separate responsibilities
2.  Reduce file size
3.  Improve readability
4.  Make features reusable
5.  Improve performance
6.  Make the code production-ready

------------------------------------------------------------------------

# Target Architecture

A better project structure:

    src
    │
    ├ api
    │  ├ client.ts
    │  ├ auth.api.ts
    │  ├ chats.api.ts
    │  └ messages.api.ts
    │
    ├ auth
    │  ├ AuthProvider.tsx
    │  └ useAuth.ts
    │
    ├ realtime
    │  ├ websocket.ts
    │  └ useRealtime.ts
    │
    ├ store
    │  ├ chatStore.ts
    │  └ messageStore.ts
    │
    ├ hooks
    │  ├ useChats.ts
    │  └ useMessages.ts
    │
    ├ components
    │  ├ AuthScreen.tsx
    │  ├ Sidebar.tsx
    │  ├ ChatList.tsx
    │  ├ ChatWindow.tsx
    │  ├ MessageItem.tsx
    │  ├ MessageInput.tsx
    │  └ ProfilePanel.tsx
    │
    └ pages
       └ page.tsx

------------------------------------------------------------------------

# Step 1 --- Split UI into Components

The page currently renders:

-   login
-   register
-   sidebar
-   chat list
-   chat window
-   message input
-   profile page

Each of these should be its own component.

Example:

    components/
      AuthScreen.tsx
      Sidebar.tsx
      ChatList.tsx
      ChatWindow.tsx
      MessageInput.tsx
      ProfilePanel.tsx

Benefits:

-   smaller files
-   easier debugging
-   reusable UI blocks

------------------------------------------------------------------------

# Step 2 --- Extract Authentication Logic

Authentication should not live inside `page.tsx`.

Create:

    auth/AuthProvider.tsx

Example:

``` ts
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  )
}
```

Now any component can access authentication via:

    useAuth()

------------------------------------------------------------------------

# Step 3 --- Create an API Layer

All network calls should live in the `api` directory.

Example:

    api/chats.api.ts

``` ts
export async function getChats(token: string) {
  return fetch("/api/chats", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
```

Benefits:

-   easier testing
-   cleaner components
-   reusable networking logic

------------------------------------------------------------------------

# Step 4 --- Use Custom Hooks

Instead of storing logic in components, use hooks.

Example:

    hooks/useChats.ts

``` ts
export function useChats(token) {
  const [chats, setChats] = useState([])

  useEffect(() => {
    loadChats()
  }, [token])

  async function loadChats() {
    const data = await getChats(token)
    setChats(data)
  }

  return chats
}
```

Benefits:

-   reusable logic
-   smaller components

------------------------------------------------------------------------

# Step 5 --- Introduce Global State

For chat applications, local state is not ideal.

Better solutions:

-   Zustand
-   Redux
-   React Query

Example with Zustand:

    store/chatStore.ts

``` ts
import { create } from "zustand"

export const useChatStore = create((set) => ({
  chats: [],
  messages: [],

  setChats: (c) => set({ chats: c }),
  setMessages: (m) => set({ messages: m })
}))
```

Benefits:

-   shared state across components
-   fewer prop chains
-   better performance

------------------------------------------------------------------------

# Step 6 --- Replace Polling with WebSockets

Current approach:

    setInterval(() => {
      fetch messages
    }, 2000)

Problems:

-   high server load
-   slow updates
-   poor scalability

Better approach: WebSocket.

Architecture:

    Client
     ↓
    WebSocket connection
     ↓
    Server pushes events

------------------------------------------------------------------------

# WebSocket Client Example

    realtime/websocket.ts

``` ts
class RealtimeClient {

  socket = null

  connect(token) {
    this.socket = new WebSocket(`ws://server/ws?token=${token}`)

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "message") {
        addMessageToStore(data.payload)
      }
    }
  }

}
```

Benefits:

-   real-time messaging
-   no polling
-   much lower server load

------------------------------------------------------------------------

# Step 7 --- Message Flow Architecture

Professional chat systems use:

Optimistic UI.

Flow:

    user sends message
    ↓
    UI shows message instantly
    ↓
    message sent to server
    ↓
    server stores message
    ↓
    server broadcasts message
    ↓
    clients update message store

Benefits:

-   instant feedback
-   better UX

------------------------------------------------------------------------

# Step 8 --- Simplified page.tsx

After refactoring the page becomes small.

Example:

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

Now the page contains only layout logic.

------------------------------------------------------------------------

# Step 9 --- Additional Improvements

Recommended features for a messenger:

### Message pagination

Load messages in pages.

### Virtualized message list

Needed for large chats.

### Typing indicators

    user is typing...

### Online presence

    online / offline

### Delivery status

    sent
    delivered
    read

------------------------------------------------------------------------

# Final Result

Before refactoring:

    page.tsx
    1500+ lines
    mixed responsibilities

After refactoring:

    page.tsx
    ~100 lines
    clean architecture
    separated logic
    scalable codebase

This structure is closer to the architecture used by modern messaging
platforms such as Slack, Discord, and Telegram Web.
