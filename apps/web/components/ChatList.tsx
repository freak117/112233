'use client';

import { useChatStore } from '../store/chatStore';

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (userId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  searchResults: Array<{ id: string; username: string; displayName: string }>;
}

export function ChatList({
  selectedChatId,
  onSelectChat,
  onCreateChat,
  searchQuery,
  onSearchChange,
  onSearch,
  searchResults,
}: ChatListProps) {
  const { chats, isUserOnline } = useChatStore();

  const theme = {
    border: 'var(--chatlist-border, #e2e8f0)',
    text: 'var(--chatlist-text, #0f172a)',
    textSecondary: 'var(--chatlist-text-secondary, #64748b)',
    bg: 'var(--chatlist-bg, #f1f5f9)',
    selected: '#3b82f615',
  };

  if (chats.length === 0 && searchResults.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: theme.textSecondary }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <div>No chats yet</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>Search for users to start chatting</div>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ padding: 16, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              color: theme.text,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={onSearch}
            style={{
              padding: '12 16',
              borderRadius: 10,
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔍
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          {searchResults.map((user) => (
            <div
              key={user.id}
              style={{
                padding: 16,
                borderBottom: `1px solid ${theme.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  {(user.displayName || user.username)[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{user.displayName}</div>
                  <div style={{ fontSize: 13, color: theme.textSecondary }}>@{user.username}</div>
                </div>
              </div>
              <button
                onClick={() => onCreateChat(user.id)}
                style={{
                  padding: '8 16',
                  borderRadius: 8,
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat List */}
      {searchResults.length === 0 &&
        chats.map((chat) => {
          const participant = chat.participants.find((p) => p.id !== chat.participants[0]?.id);
          const isOnline = participant?.id ? isUserOnline(participant.id) : false;

          return (
            <div
              key={chat.chatId}
              onClick={() => onSelectChat(chat.chatId)}
              style={{
                padding: 16,
                borderBottom: `1px solid ${theme.border}`,
                cursor: 'pointer',
                background: selectedChatId === chat.chatId ? theme.selected : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 18,
                    }}
                  >
                    {(participant?.displayName || participant?.username || 'U')[0].toUpperCase()}
                  </div>
                  {isOnline && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#22c55e',
                        border: `2px solid ${theme.bg}`,
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                    {participant?.displayName || participant?.username || 'Unknown'}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chat.lastMessage?.text || 'No messages yet'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
