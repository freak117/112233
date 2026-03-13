'use client';

import { ApiClient } from '@telegram-lite/api-client';
import { RealtimeClient } from '@telegram-lite/realtime-client';
import { Card, Row, ScreenContainer } from '@telegram-lite/ui';
import type { ChatSummary, MessageItem, SearchUser, UserProfile } from '@telegram-lite/types';
import { FormEvent, useEffect, useMemo, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function HomePage(): JSX.Element {
  const api = useMemo(() => new ApiClient(API_URL), []);
  const realtime = useMemo(() => new RealtimeClient(), []);

  const [token, setToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [me, setMe] = useState<UserProfile | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [text, setText] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('demo1@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [registerEmail, setRegisterEmail] = useState('demo1@example.com');
  const [registerPassword, setRegisterPassword] = useState('password123');
  const [username, setUsername] = useState('demo_user_1');
  const [displayName, setDisplayName] = useState('Demo User 1');

  const isAuth = token.length > 0;

  async function bootstrapAfterAuth(accessToken: string): Promise<void> {
    const [profile, chatList] = await Promise.all([api.getMe(accessToken), api.listChats(accessToken)]);
    setMe(profile);
    setBio(profile.bio ?? '');
    setChats(chatList);
    if (chatList[0]) {
      setSelectedChatId(chatList[0].chatId);
    }
  }

  async function onRegister(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    try {
      const response = await api.register({
        email: registerEmail,
        password: registerPassword,
        username,
        displayName,
      });
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      await bootstrapAfterAuth(response.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    try {
      const response = await api.login({ email: loginEmail, password: loginPassword });
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      await bootstrapAfterAuth(response.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onSearch(): Promise<void> {
    if (!token || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchResults(await api.searchUsers(token, searchQuery));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onUpdateProfile(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!token || !me) return;

    setError('');
    try {
      const updated = await api.updateMe(token, {
        displayName: me.displayName,
        bio,
      });
      setMe(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function createDirectChat(targetUserId: string): Promise<void> {
    if (!token) return;
    try {
      await api.createDirectChat(token, targetUserId);
      const chatList = await api.listChats(token);
      setChats(chatList);
      if (chatList[0]) setSelectedChatId(chatList[0].chatId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
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

  async function sendTextMessage(): Promise<void> {
    if (!token || !selectedChatId || !text.trim()) return;
    const optimistic: MessageItem = {
      id: `optimistic-${Date.now()}`,
      chatId: selectedChatId,
      senderId: me?.id ?? 'me',
      type: 'text',
      text,
      clientMessageId: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    try {
      await api.sendMessage(token, {
        chatId: selectedChatId,
        text: optimistic.text ?? '',
        clientMessageId: optimistic.clientMessageId ?? `client-${Date.now()}`,
      });
      await loadMessages(selectedChatId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void loadMessages(selectedChatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId, token]);

  useEffect(() => {
    if (!token || !selectedChatId) return;
    const timer = setInterval(() => {
      void loadMessages(selectedChatId);
    }, 2500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedChatId]);

  useEffect(() => {
    if (!token) {
      setSocketConnected(false);
      return;
    }

    setSocketConnected(true);
    realtime.on('new_message', ({ chatId, message }) => {
      if (chatId === selectedChatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      setSocketConnected(false);
    };
  }, [realtime, token, selectedChatId]);

  const colors =
    theme === 'dark'
      ? { background: '#0f172a', color: '#e2e8f0', accent: '#38bdf8' }
      : { background: '#f8fafc', color: '#0f172a', accent: '#0369a1' };

  return (
    <ScreenContainer>
      <div style={{ minHeight: '100vh', background: colors.background, color: colors.color, padding: 12 }}>
      <h1>Telegram Lite Web MVP</h1>
      <p>Этап 8: auth, chats list, chat, profile, search, optimistic send, light/dark theme.</p>
      <Row>
        <button onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>Theme: {theme}</button>
        <span style={{ color: colors.accent }}>socket: {socketConnected ? 'connected' : 'disconnected'}</span>
      </Row>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      {!isAuth ? (
        <Row>
          <Card title="Auth">
            <form onSubmit={onLogin} style={{ display: 'grid', gap: 8 }}>
              <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="email" />
              <input
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="password"
                type="password"
              />
              <button type="submit">Login</button>
            </form>
          </Card>
          <Card title="Register">
            <form onSubmit={onRegister} style={{ display: 'grid', gap: 8 }}>
              <input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="email" />
              <input
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="password"
                type="password"
              />
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="display name"
              />
              <button type="submit">Register</button>
            </form>
          </Card>
        </Row>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
          <Card title="Sidebar">
            <p>
              Logged in as <strong>{me?.displayName ?? me?.username}</strong>
            </p>
            <p style={{ marginTop: 4 }}>refresh token length: {refreshToken.length}</p>

            <h4>Search</h4>
            <Row>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="username"
              />
              <button onClick={() => void onSearch()}>Find</button>
            </Row>
            <ul>
              {searchResults.map((user) => (
                <li key={user.id}>
                  {user.username} ({user.displayName}){' '}
                  <button onClick={() => void createDirectChat(user.id)}>chat</button>
                </li>
              ))}
            </ul>

            <h4>Chats</h4>
            <ul>
              {chats.map((chat) => (
                <li key={chat.chatId}>
                  <button onClick={() => setSelectedChatId(chat.chatId)}>
                    {chat.participants
                      .filter((p) => p.id !== me?.id)
                      .map((p) => p.username)
                      .join(', ') || 'Self'}
                  </button>
                </li>
              ))}
            </ul>

            <h4>Profile</h4>
            <form onSubmit={onUpdateProfile} style={{ display: 'grid', gap: 8 }}>
              <input
                value={me?.displayName ?? ''}
                onChange={(e) => setMe((prev) => (prev ? { ...prev, displayName: e.target.value } : prev))}
                placeholder="display name"
              />
              <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="bio" />
              <button type="submit">Save profile</button>
            </form>
          </Card>

          <Card title="Chat">
            <div style={{ minHeight: 340, maxHeight: 520, overflowY: 'auto', marginBottom: 8 }}>
              {messages.map((message) => (
                <div key={message.id} style={{ marginBottom: 8 }}>
                  <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                  <div>{message.text ?? '[image]'}</div>
                </div>
              ))}
            </div>
            <Row>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message" />
              <button onClick={() => void sendTextMessage()}>Send</button>
            </Row>
          </Card>
        </div>
      )}
      </div>
    </ScreenContainer>
  );
}

