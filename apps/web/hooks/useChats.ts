import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { chatsApi, messagesApi, usersApi } from '../api';

export function useChats() {
  const { token } = useAuthStore();
  const {
    chats,
    messages,
    selectedChatId,
    setChats,
    setMessages,
    setSelectedChat,
    addMessage,
    setOnlineUsers,
  } = useChatStore();

  const loadChats = useCallback(async () => {
    if (!token) return;
    
    try {
      const chatList = await chatsApi.list(token);
      setChats(chatList);

      // Load online status for all participants
      const userIds = chatList.flatMap((chat) =>
        chat.participants
          .filter((p) => p.id !== chat.participants[0]?.id)
          .map((p) => p.id)
      );

      if (userIds.length > 0) {
        const onlineStatus = await usersApi.getBulkOnlineStatus(token, userIds);
        const onlineUserIds = Object.entries(onlineStatus)
          .filter(([_, isOnline]) => isOnline)
          .map(([id]) => id);
        setOnlineUsers(onlineUserIds);
      }
    } catch (e) {
      console.error('Failed to load chats:', e);
    }
  }, [token, setChats, setOnlineUsers]);

  const loadMessages = useCallback(
    async (chatId: string) => {
      if (!token || !chatId) return;

      try {
        const response = await messagesApi.list(token, chatId);
        setMessages(chatId, response.items);
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    },
    [token, setMessages]
  );

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      if (!token || !chatId || !text.trim()) return null;

      const optimisticMessage = {
        id: `optimistic-${Date.now()}`,
        chatId,
        senderId: 'me',
        type: 'text' as const,
        text,
        clientMessageId: `client-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      addMessage(optimisticMessage);

      try {
        await messagesApi.send(token, {
          chatId,
          text,
          clientMessageId: optimisticMessage.clientMessageId,
        });

        // Reload messages to get the real one from server
        await loadMessages(chatId);
        
        return optimisticMessage;
      } catch (e) {
        console.error('Failed to send message:', e);
        // Could remove optimistic message on error
        return null;
      }
    },
    [token, addMessage, loadMessages]
  );

  const selectChat = useCallback(
    (chatId: string) => {
      setSelectedChat(chatId);
      loadMessages(chatId);
    },
    [setSelectedChat, loadMessages]
  );

  const createDirectChat = useCallback(
    async (targetUserId: string) => {
      if (!token) return null;

      try {
        const chat = await chatsApi.createDirect(token, targetUserId);
        await loadChats();
        return chat;
      } catch (e) {
        console.error('Failed to create chat:', e);
        return null;
      }
    },
    [token, loadChats]
  );

  // Load chats on mount
  useEffect(() => {
    if (token) {
      loadChats();
    }
  }, [token, loadChats]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!token || !selectedChatId) return;

    const interval = setInterval(() => {
      loadMessages(selectedChatId);
    }, 3000);

    return () => clearInterval(interval);
  }, [token, selectedChatId, loadMessages]);

  // Poll for online status every 5 seconds
  useEffect(() => {
    if (!token || chats.length === 0) return;

    const updateOnlineStatus = async () => {
      const userIds = chats.flatMap((chat) =>
        chat.participants
          .filter((p) => p.id !== chat.participants[0]?.id)
          .map((p) => p.id)
      );

      if (userIds.length > 0) {
        try {
          const onlineStatus = await usersApi.getBulkOnlineStatus(token, userIds);
          const onlineUserIds = Object.entries(onlineStatus)
            .filter(([_, isOnline]) => isOnline)
            .map(([id]) => id);
          setOnlineUsers(onlineUserIds);
        } catch (e) {
          console.error('Failed to update online status:', e);
        }
      }
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 5000);

    return () => clearInterval(interval);
  }, [token, chats, setOnlineUsers]);

  return {
    chats,
    messages,
    selectedChatId,
    loadChats,
    loadMessages,
    sendMessage,
    selectChat,
    createDirectChat,
  };
}
