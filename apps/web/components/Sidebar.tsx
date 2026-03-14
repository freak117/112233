'use client';

import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

interface SidebarProps {
  isOpen: boolean;
  activeTab: 'chats' | 'search' | 'profile';
  onTabChange: (tab: 'chats' | 'search' | 'profile') => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, activeTab, onTabChange, onLogout, children }: SidebarProps) {
  const { user } = useAuthStore();
  const { onlineUserIds } = useChatStore();

  const theme = {
    bg: 'var(--sidebar-bg, #f1f5f9)',
    border: 'var(--sidebar-border, #e2e8f0)',
    text: 'var(--sidebar-text, #0f172a)',
    textSecondary: 'var(--sidebar-text-secondary, #64748b)',
    accent: '#3b82f6',
  };

  const isUserOnline = user?.id ? onlineUserIds.has(user.id) : false;

  return (
    <div
      style={{
        width: isOpen ? 360 : 0,
        background: theme.bg,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 20,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.displayName || user?.username}</div>
            <div
              style={{
                fontSize: 12,
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isUserOnline ? '#22c55e' : '#94a3b8',
                }}
              />
              {isUserOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '8 12',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: theme.textSecondary,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <button
          onClick={() => onTabChange('chats')}
          style={{
            flex: 1,
            padding: 14,
            background: activeTab === 'chats' ? `${theme.accent}20` : 'transparent',
            border: 'none',
            color: activeTab === 'chats' ? theme.accent : theme.textSecondary,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          💬 Chats
        </button>
        <button
          onClick={() => onTabChange('search')}
          style={{
            flex: 1,
            padding: 14,
            background: activeTab === 'search' ? `${theme.accent}20` : 'transparent',
            border: 'none',
            color: activeTab === 'search' ? theme.accent : theme.textSecondary,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔍 Search
        </button>
        <button
          onClick={() => onTabChange('profile')}
          style={{
            flex: 1,
            padding: 14,
            background: activeTab === 'profile' ? `${theme.accent}20` : 'transparent',
            border: 'none',
            color: activeTab === 'profile' ? theme.accent : theme.textSecondary,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          👤 Profile
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}
