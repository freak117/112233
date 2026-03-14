'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthScreenProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

type AuthTab = 'login' | 'register';

export function AuthScreen({ isDarkMode, onToggleTheme }: AuthScreenProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');

  const theme = {
    bg: isDarkMode ? '#0f172a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#1e293b' : '#f1f5f9',
    accent: '#3b82f6',
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(registerEmail, registerPassword, registerUsername, registerDisplayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: theme.cardBg,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Telegram Lite
          </h1>
          <p style={{ color: theme.textSecondary, marginTop: 8, fontSize: 14 }}>
            Fast & Simple Messaging
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}` }}>
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
            <div
              style={{
                background: '#ef444415',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
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
                    background: theme.inputBg,
                    color: theme.text,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
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
                    background: theme.inputBg,
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
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
                    background: theme.inputBg,
                    color: theme.text,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
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
                    background: theme.inputBg,
                    color: theme.text,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
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
                    background: theme.inputBg,
                    color: theme.text,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
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
                    background: theme.inputBg,
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
        <div
          style={{
            padding: '16 32',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onToggleTheme}
            style={{
              padding: '10 20',
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: theme.inputBg,
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
