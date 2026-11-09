import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button, Badge, HealthScoreBadge } from '../index.js';

describe('@readmelens/ui', () => {
  it('renders Button with variants and accessible attributes', () => {
    const html = renderToString(
      <Button variant="primary" size="md" aria-label="Analyze README">
        Analyze
      </Button>
    );

    expect(html).toContain('button');
    expect(html).toContain('aria-label="Analyze README"');
    expect(html).toContain('bg-indigo-600');
    expect(html).toContain('Analyze');
  });

  it('renders Badge with custom status colors', () => {
    const html = renderToString(<Badge variant="success">Passing</Badge>);
    expect(html).toContain('bg-emerald-500/15');
    expect(html).toContain('Passing');
  });

  it('renders HealthScoreBadge with correct grade and ARIA label', () => {
    const html = renderToString(<HealthScoreBadge score={92} grade="A" size="lg" />);
    expect(html).toContain('Documentation Health Score: 92 out of 100');
    expect(html).toContain('role="status"');
  });
});
