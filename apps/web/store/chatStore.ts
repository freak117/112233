import { create } from 'zustand';

export type MessageType = 'text' | 'image' | 'text_image' | 'system';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  text: string | null;
  clientMessageId: string | null;
  createdAt: string;
}

export interface ChatSummary {
  chatId: string;
  type: 'direct';
  updatedAt: string;
  participants: Array<{
    id: string;
    username: string;
    displayName: string;
  }>;
  lastMessage: Message | null;
}

interface ChatState {
  chats: ChatSummary[];
  messages: Record<string, Message[]>; // chatId -> messages
  selectedChatId: string | null;
  onlineUserIds: Set<string>;

  setChats: (chats: ChatSummary[]) => void;
  addChat: (chat: ChatSummary) => void;
  updateChat: (chatId: string, updates: Partial<ChatSummary>) => void;
  
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  getMessages: (chatId: string) => Message[];
  
  setSelectedChat: (chatId: string | null) => void;
  
  setOnlineUsers: (userIds: string[]) => void;
  isUserOnline: (userId: string) => boolean;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  selectedChatId: null,
  onlineUserIds: new Set(),

  setChats: (chats) => set({ chats }),

  addChat: (chat) =>
    set((state) => ({
      chats: [...state.chats, chat],
    })),

  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.chatId === chatId ? { ...chat, ...updates } : chat
      ),
    })),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];
      
      // Check if message already exists
      const exists = chatMessages.some((m) => m.id === message.id);
      if (exists) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message],
        },
      };
    }),

  getMessages: (chatId) => {
    return get().messages[chatId] || [];
  },

  setSelectedChat: (chatId) => set({ selectedChatId: chatId }),

  setOnlineUsers: (userIds) =>
    set({
      onlineUserIds: new Set(userIds),
    }),

  isUserOnline: (userId) => {
    return get().onlineUserIds.has(userId);
  },
}));
