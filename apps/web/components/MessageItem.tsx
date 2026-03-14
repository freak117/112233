'use client';

import { Message } from '../store/chatStore';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  const theme = {
    messageOut: 'var(--message-out-bg, #3b82f6)',
    messageIn: 'var(--message-in-bg, #f1f5f9)',
    messageOutText: '#ffffff',
    messageInText: 'var(--message-in-text, #0f172a)',
    timeText: 'rgba(255,255,255,0.7)',
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: '60%',
          padding: 12,
          borderRadius: 16,
          background: isOwn ? theme.messageOut : theme.messageIn,
          color: isOwn ? theme.messageOutText : theme.messageInText,
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.4 }}>{message.text}</div>
        <div
          style={{
            fontSize: 11,
            marginTop: 6,
            opacity: 0.7,
            textAlign: 'right',
          }}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
