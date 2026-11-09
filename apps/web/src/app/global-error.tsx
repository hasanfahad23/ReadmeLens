'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#090d16', color: '#f1f5f9', fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Critical System Error</h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>A fatal application error occurred.</p>
        <button
          onClick={() => reset()}
          style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
