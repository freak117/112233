'use client';

import { ApiClient } from '@telegram-lite/api-client';
import { RealtimeClient } from '@telegram-lite/realtime-client';
import type { ChatSummary, MessageItem, SearchUser, UserProfile } from '@telegram-lite/types';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type ActiveTab = 'chats' | 'search' | 'profile' | 'login' | 'register';

export default function HomePage(): JSX.Element {
  const api = useMemo(() => new ApiClient(API_URL), []);
  const realtime = useMemo(() => new RealtimeClient(), []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [token, setToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [me, setMe] = useState<UserProfile | null>(null);
  
  // UI state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  
  // Chat state
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  
  // Profile state
  const [bio, setBio] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Loading & error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');

  const isAuth = token.length > 0;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function bootstrapAfterAuth(accessToken: string): Promise<void> {
    try {
      const [profile, chatList] = await Promise.all([
        api.getMe(accessToken),
        api.listChats(accessToken)
      ]);
      setMe(profile);
      setBio(profile.bio ?? '');
      setChats(chatList);
      if (chatList.length > 0) {
        setSelectedChatId(chatList[0].chatId);
        await loadMessages(chatList[0].chatId);
      }
      setActiveTab('chats');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.login({ email: loginEmail, password: loginPassword });
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      await bootstrapAfterAuth(response.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.register({
        email: registerEmail,
        password: registerPassword,
        username: registerUsername,
        displayName: registerDisplayName,
      });
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      await bootstrapAfterAuth(response.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(): Promise<void> {
    if (!token || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const results = await api.searchUsers(token, searchQuery);
      setSearchResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSaveProfile(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!token || !me) return;
    setLoading(true);
    setError('');
    try {
      const updated = await api.updateMe(token, { displayName: me.displayName, bio });
      setMe(updated);
      setIsEditingProfile(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function createDirectChat(targetUserId: string): Promise<void> {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await api.createDirectChat(token, targetUserId);
      const chatList = await api.listChats(token);
      setChats(chatList);
      if (chatList.length > 0) {
        setSelectedChatId(chatList[chatList.length - 1].chatId);
        await loadMessages(chatList[chatList.length - 1].chatId);
      }
      setActiveTab('chats');
      setSearchQuery('');
      setSearchResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(chatId: string): Promise<void> {
    if (!token || !chatId) return;
    try {
      const data = await api.listMessages(token, chatId);
      setMessages(data.items.reverse());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleSelectChat(chatId: string): Promise<void> {
    setSelectedChatId(chatId);
    await loadMessages(chatId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  async function sendTextMessage(): Promise<void> {
    if (!token || !selectedChatId || !messageText.trim()) return;
    
    const optimistic: MessageItem = {
      id: `optimistic-${Date.now()}`,
      chatId: selectedChatId,
      senderId: me?.id ?? 'me',
      type: 'text',
      text: messageText,
      clientMessageId: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimistic]);
    setMessageText('');
    
    try {
      await api.sendMessage(token, {
        chatId: selectedChatId,
        text: optimistic.text ?? '',
        clientMessageId: optimistic.clientMessageId ?? `client-${Date.now()}`,
      });
      await loadMessages(selectedChatId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setMessages((prev) => prev.filter(m => m.id !== optimistic.id));
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setToken('');
      setRefreshToken('');
      setMe(null);
      setChats([]);
      setMessages([]);
      setSelectedChatId('');
      setActiveTab('chats');
    }
  }

  // Форматирование времени сообщения
  function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Realtime polling - check for new messages every 2 seconds
  useEffect(() => {
    if (!token) {
      setSocketStatus('disconnected');
      return;
    }

    setSocketStatus('connected');
    
    const pollInterval = setInterval(async () => {
      if (selectedChatId && token) {
        try {
          const data = await api.listMessages(token, selectedChatId);
          const newMessages = data.items.reverse();
          setMessages((prev) => {
            if (newMessages.length > prev.length) {
              return newMessages;
            }
            return prev;
          });
        } catch (e) {
          console.error('Polling error:', e);
        }
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      setSocketStatus('disconnected');
    };
  }, [token, selectedChatId, api]);

  // Theme colors
  const theme = useMemo(() => ({
    bg: isDarkMode ? '#0f172a' : '#ffffff',
    bgSecondary: isDarkMode ? '#1e293b' : '#f1f5f9',
    bgTertiary: isDarkMode ? '#334155' : '#e2e8f0',
    text: isDarkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    messageOut: isDarkMode ? '#3b82f6' : '#3b82f6',
    messageIn: isDarkMode ? '#1e293b' : '#f1f5f9',
  }), [isDarkMode]);

  // Auth Screen
  if (!isAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0f172a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: theme.bg,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: 32,
            textAlign: 'center',
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Telegram Lite
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              marginTop: 8,
              fontSize: 14,
            }}>
              Fast & Simple Messaging
            </p>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: 16,
                background: 'transparent',
                border: 'none',
                color: theme.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: activeTab === 'login' ? `2px solid ${theme.accent}` : 'none',
              }}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                padding: 16,
                background: 'transparent',
                border: 'none',
                color: theme.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: activeTab === 'register' ? `2px solid ${theme.accent}` : 'none',
              }}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          <div style={{ padding: 32 }}>
            {error && (
              <div style={{
                background: '#ef444415',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: theme.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgSecondary,
                      color: theme.text,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: theme.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgSecondary,
                      color: theme.text,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'transform 0.2s',
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={onRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: theme.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgSecondary,
                      color: theme.text,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: theme.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="username"
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgSecondary,
                      color: theme.text,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: theme.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={registerDisplayName}
                    onChange={(e) => setRegisterDisplayName(e.target.value)}
                    placeholder="Your Name"
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgSecondary,
                      color: theme.text,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: theme.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgSecondary,
                      color: theme.text,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          {/* Theme Toggle */}
          <div style={{
            padding: '16 32',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                padding: '10 20',
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                background: theme.bgSecondary,
                color: theme.text,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main App Screen
  const selectedChat = chats.find(c => c.chatId === selectedChatId);
  const otherParticipant = selectedChat?.participants.find(p => p.id !== me?.id);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: theme.bg,
      color: theme.text,
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 360 : 0,
        background: theme.bgSecondary,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: 20,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
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
            }}>
              {(me?.displayName || me?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{me?.displayName || me?.username}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: socketStatus === 'connected' ? '#22c55e' : '#94a3b8',
                }}/>
                {socketStatus === 'connected' ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
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

        {/* Search */}
        <div style={{ padding: 16, borderBottom: `1px solid ${theme.border}` }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            style={{
              width: '100%',
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
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <button
            onClick={() => setActiveTab('chats')}
            style={{
              flex: 1,
              padding: 14,
              background: activeTab === 'chats' ? theme.accent + '20' : 'transparent',
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
            onClick={() => setActiveTab('search')}
            style={{
              flex: 1,
              padding: 14,
              background: activeTab === 'search' ? theme.accent + '20' : 'transparent',
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
            onClick={() => setActiveTab('profile')}
            style={{
              flex: 1,
              padding: 14,
              background: activeTab === 'profile' ? theme.accent + '20' : 'transparent',
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
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'chats' && (
            <div>
              {chats.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                  <div>No chats yet</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>Search for users to start chatting</div>
                </div>
              ) : (
                chats.map((chat) => {
                  const participant = chat.participants.find(p => p.id !== me?.id);
                  return (
                    <div
                      key={chat.chatId}
                      onClick={() => handleSelectChat(chat.chatId)}
                      style={{
                        padding: 16,
                        borderBottom: `1px solid ${theme.border}`,
                        cursor: 'pointer',
                        background: selectedChatId === chat.chatId ? theme.accent + '15' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{
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
                          flexShrink: 0,
                        }}>
                          {(participant?.displayName || participant?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                            {participant?.displayName || participant?.username || 'Unknown'}
                          </div>
                          <div style={{ fontSize: 13, color: theme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {chat.lastMessage?.text || 'No messages yet'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div style={{ padding: 16 }}>
                <button
                  onClick={onSearch}
                  disabled={loading || !searchQuery.trim()}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: 'none',
                    background: theme.accent,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !searchQuery.trim() ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
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
                    <div style={{
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
                    }}>
                      {(user.displayName || user.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{user.displayName}</div>
                      <div style={{ fontSize: 13, color: theme.textSecondary }}>@{user.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => createDirectChat(user.id)}
                    style={{
                      padding: '8 16',
                      borderRadius: 8,
                      border: 'none',
                      background: theme.accent,
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

          {activeTab === 'profile' && (
            <div style={{ padding: 20 }}>
              {isEditingProfile ? (
                <form onSubmit={onSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={me?.displayName || ''}
                      onChange={(e) => setMe(prev => prev ? { ...prev, displayName: e.target.value } : prev)}
                      style={{
                        width: '100%',
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
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 10,
                        border: `1px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 10,
                        border: 'none',
                        background: theme.accent,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 10,
                        border: `1px solid ${theme.border}`,
                        background: 'transparent',
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 32,
                      margin: '0 auto 16px',
                    }}>
                      {(me?.displayName || me?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{me?.displayName || me?.username}</div>
                    <div style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>@{me?.username}</div>
                  </div>
                  <div style={{
                    background: theme.bg,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{me?.email}</div>
                  </div>
                  <div style={{
                    background: theme.bg,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Bio</div>
                    <div style={{ fontSize: 15 }}>{bio || 'No bio yet'}</div>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 10,
                      border: 'none',
                      background: theme.accent,
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: 16,
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: theme.bgSecondary,
            }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
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
                }}
              >
                ☰
              </button>
              <div style={{
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
              }}>
                {(otherParticipant?.displayName || otherParticipant?.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {otherParticipant?.displayName || otherParticipant?.username || 'Unknown'}
                </div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>
                  {socketStatus === 'connected' ? 'Online' : 'Last seen recently'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 20,
              background: isDarkMode ? '#0f172a' : '#f0f2f5',
            }}>
              {messages.map((message) => {
                const isOwn = message.senderId === me?.id;
                return (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{
                      maxWidth: '60%',
                      padding: 12,
                      borderRadius: 16,
                      background: isOwn ? theme.messageOut : theme.messageIn,
                      color: isOwn ? '#fff' : theme.text,
                    }}>
                      <div style={{ fontSize: 14, lineHeight: 1.4 }}>{message.text}</div>
                      <div style={{ 
                        fontSize: 11, 
                        marginTop: 6, 
                        opacity: 0.7,
                        textAlign: 'right',
                      }}>
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: 16,
              borderTop: `1px solid ${theme.border}`,
              background: theme.bgSecondary,
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 20,
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!messageText.trim()}
                  style={{
                    padding: '14 24',
                    borderRadius: 20,
                    border: 'none',
                    background: messageText.trim() ? theme.accent : theme.border,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode ? '#0f172a' : '#f0f2f5',
          }}>
            <div style={{ textAlign: 'center', color: theme.textSecondary }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Welcome to Telegram Lite</div>
              <div style={{ fontSize: 14 }}>Select a chat to start messaging</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
