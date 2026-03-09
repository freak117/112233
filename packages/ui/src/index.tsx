import type { ReactNode } from 'react';

export function ScreenContainer({ children }: { children: ReactNode }): JSX.Element {
  return <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>{children}</div>;
}

export function Card({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <section
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 12,
        background: '#fff',
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}

export function Row({ children }: { children: ReactNode }): JSX.Element {
  return <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>;
}

