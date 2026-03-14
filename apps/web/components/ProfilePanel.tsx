'use client';

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../api';

interface ProfilePanelProps {
  token: string | null;
}

export function ProfilePanel({ token }: ProfilePanelProps) {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');

  const theme = {
    bg: 'var(--profile-bg, #ffffff)',
    border: 'var(--profile-border, #e2e8f0)',
    text: 'var(--profile-text, #0f172a)',
    textSecondary: 'var(--profile-text-secondary, #64748b)',
    accent: '#3b82f6',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const updated = await usersApi.updateMe(token, { displayName, bio });
      updateUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: 20 }}>
      {isEditing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                display: 'block',
                color: theme.textSecondary,
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
            <label
              style={{
                display: 'block',
                color: theme.textSecondary,
                fontSize: 13,
                marginBottom: 8,
              }}
            >
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
              onClick={() => setIsEditing(false)}
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
            <div
              style={{
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
              }}
            >
              {(user.displayName || user.username || 'U')[0].toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{user.displayName || user.username}</div>
            <div style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>
              @{user.username}
            </div>
          </div>
          <div
            style={{
              background: theme.bg,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{user.email}</div>
          </div>
          <div
            style={{
              background: theme.bg,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Bio</div>
            <div style={{ fontSize: 15 }}>{user.bio || 'No bio yet'}</div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
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
  );
}
