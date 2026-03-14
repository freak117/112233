'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useAuth, useChats } from '../hooks';
import {
  AuthScreen,
  Sidebar,
  ChatList,
  ChatWindow,
  ProfilePanel,
  SearchPanel,
} from '../components';
import { usersApi } from '../api';

export default function HomePage(): JSX.Element {
  const { token, isAuthenticated, logout } = useAuth();
  const { selectedChatId, setSelectedChat, addMessage, setOnlineUsers } = useChatStore();
  const { sendMessage, selectChat, createDirectChat, loadMessages, loadChats } = useChats();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'search' | 'profile'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; displayName: string }>>([]);

  // Handle search
  const handleSearch = async () => {
    if (!token || !searchQuery.trim()) return;
    try {
      const results = await usersApi.searchUsers(token, searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error('Search failed:', e);
    }
  };

  // Handle create chat from search
  const handleCreateChat = async (userId: string) => {
    await createDirectChat(userId);
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('chats');
  };

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!selectedChatId) return;
    await sendMessage(selectedChatId, text);
  };

  // Theme CSS variables
  const themeVars = isDarkMode
    ? {
        '--sidebar-bg': '#1e293b',
        '--sidebar-border': '#334155',
        '--sidebar-text': '#f1f5f9',
        '--sidebar-text-secondary': '#94a3b8',
        '--chatlist-bg': '#1e293b',
        '--chatlist-border': '#334155',
        '--chatlist-text': '#f1f5f9',
        '--chatlist-text-secondary': '#94a3b8',
        '--chat-window-bg': '#0f172a',
        '--chat-window-border': '#334155',
        '--chat-window-header-bg': '#1e293b',
        '--chat-window-text': '#f1f5f9',
        '--chat-window-text-secondary': '#94a3b8',
        '--message-input-bg': '#1e293b',
        '--message-input-border': '#334155',
        '--message-input-field-bg': '#0f172a',
        '--message-input-text': '#f1f5f9',
        '--message-out-bg': '#3b82f6',
        '--message-in-bg': '#1e293b',
        '--profile-bg': '#1e293b',
        '--profile-border': '#334155',
        '--profile-text': '#f1f5f9',
        '--profile-text-secondary': '#94a3b8',
        '--search-bg': '#1e293b',
        '--search-border': '#334155',
        '--search-text': '#f1f5f9',
        '--search-text-secondary': '#94a3b8',
      }
    : {
        '--sidebar-bg': '#f1f5f9',
        '--sidebar-border': '#e2e8f0',
        '--sidebar-text': '#0f172a',
        '--sidebar-text-secondary': '#64748b',
        '--chatlist-bg': '#ffffff',
        '--chatlist-border': '#e2e8f0',
        '--chatlist-text': '#0f172a',
        '--chatlist-text-secondary': '#64748b',
        '--chat-window-bg': '#f0f2f5',
        '--chat-window-border': '#e2e8f0',
        '--chat-window-header-bg': '#f1f5f9',
        '--chat-window-text': '#0f172a',
        '--chat-window-text-secondary': '#64748b',
        '--message-input-bg': '#f1f5f9',
        '--message-input-border': '#e2e8f0',
        '--message-input-field-bg': '#ffffff',
        '--message-input-text': '#0f172a',
        '--message-out-bg': '#3b82f6',
        '--message-in-bg': '#f1f5f9',
        '--profile-bg': '#ffffff',
        '--profile-border': '#e2e8f0',
        '--profile-text': '#0f172a',
        '--profile-text-secondary': '#64748b',
        '--search-bg': '#ffffff',
        '--search-border': '#e2e8f0',
        '--search-text': '#0f172a',
        '--search-text-secondary': '#64748b',
      };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />;
  }

  // Main app layout
  return (
    <div style={{ ...themeVars, display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        isOpen={sidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      >
        {activeTab === 'chats' && (
          <ChatList
            selectedChatId={selectedChatId}
            onSelectChat={(chatId) => selectChat(chatId)}
            onCreateChat={(userId) => handleCreateChat(userId)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            searchResults={searchResults}
          />
        )}

        {activeTab === 'search' && (
          <SearchPanel onSearch={async (q) => {
            if (!token) return [];
            const results = await usersApi.searchUsers(token, q);
            setSearchResults(results);
            return results;
          }} onCreateChat={handleCreateChat} />
        )}

        {activeTab === 'profile' && <ProfilePanel token={token} />}
      </Sidebar>

      <ChatWindow onSend={handleSendMessage} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  );
}
