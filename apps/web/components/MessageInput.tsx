'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const theme = {
    border: 'var(--message-input-border, #e2e8f0)',
    bg: 'var(--message-input-bg, #f1f5f9)',
    inputBg: 'var(--message-input-field-bg, #ffffff)',
    text: 'var(--message-input-text, #0f172a)',
  };

  return (
    <div
      style={{
        padding: 16,
        borderTop: `1px solid ${theme.border}`,
        background: theme.bg,
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 20,
            border: `1px solid ${theme.border}`,
            background: theme.inputBg,
            color: theme.text,
            fontSize: 15,
            outline: 'none',
            disabled: disabled ? 'disabled' : undefined,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          style={{
            padding: '14 24',
            borderRadius: 20,
            border: 'none',
            background: text.trim() && !disabled ? '#3b82f6' : theme.border,
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: text.trim() && !disabled ? 'pointer' : 'not-allowed',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
