import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import HomePage from '../app/page.js';

describe('@readmelens/web HomePage SSR', () => {
  it('renders the main heading and sample options without crashing', () => {
    const html = renderToString(<HomePage />);
    expect(html).toContain('ReadmeLens Pro');
    expect(html).toContain('Documentation Health Score');
    expect(html).toContain('Reader');
    expect(html).toContain('Analysis &amp; Health');
    expect(html).toContain('Security Audit');
    expect(html).toContain('Quick Start Extractor');
  });
});
