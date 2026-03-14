'use client';

import { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

interface ChatWindowProps {
  onSend: (text: string) => void;
  onToggleSidebar: () => void;
}

export function ChatWindow({ onSend, onToggleSidebar }: ChatWindowProps) {
  const { selectedChatId, messages, getMessages, chats } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.chatId === selectedChatId);
  const participant = chat?.participants.find((p) => p.id !== user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const theme = {
    border: 'var(--chat-window-border, #e2e8f0)',
    bg: 'var(--chat-window-bg, #f0f2f5)',
    bgSecondary: 'var(--chat-window-header-bg, #f1f5f9)',
    text: 'var(--chat-window-text, #0f172a)',
    textSecondary: 'var(--chat-window-text-secondary, #64748b)',
  };

  const chatMessages = selectedChatId ? getMessages(selectedChatId) : [];

  if (!selectedChatId) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.bg,
        }}
      >
        <div style={{ textAlign: 'center', color: theme.textSecondary }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Welcome to Telegram Lite
          </div>
          <div style={{ fontSize: 14 }}>Select a chat to start messaging</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: 16,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: theme.bgSecondary,
        }}
      >
        <button
          onClick={onToggleSidebar}
          style={{
            padding: 8,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: theme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          ☰
        </button>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {(participant?.displayName || participant?.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {participant?.displayName || participant?.username || 'Unknown'}
          </div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
          background: theme.bg,
        }}
      >
        {chatMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.senderId === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSend} />
    </div>
  );
}
