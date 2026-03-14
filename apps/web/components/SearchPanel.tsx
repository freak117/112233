'use client';

import { useState } from 'react';

interface SearchPanelProps {
  onSearch: (query: string) => Promise<Array<{ id: string; username: string; displayName: string }>>;
  onCreateChat: (userId: string) => void;
}

export function SearchPanel({ onSearch, onCreateChat }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; username: string; displayName: string }>>([]);
  const [loading, setLoading] = useState(false);

  const theme = {
    border: 'var(--search-border, #e2e8f0)',
    bg: 'var(--search-bg, #f1f5f9)',
    text: 'var(--search-text, #0f172a)',
    textSecondary: 'var(--search-text-secondary, #64748b)',
    accent: '#3b82f6',
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const users = await onSearch(query);
      setResults(users);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            style={{
              padding: '12 16',
              borderRadius: 10,
              border: 'none',
              background: theme.accent,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !query.trim() ? 0.7 : 1,
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {results.map((user) => (
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
  );
}
