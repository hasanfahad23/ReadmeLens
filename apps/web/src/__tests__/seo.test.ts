import { describe, it, expect } from 'vitest';
import sitemap from '../app/sitemap.js';
import robots from '../app/robots.js';
import { getSiteUrl } from '../lib/env.js';

describe('SEO, Sitemap, and Robots.txt Suite', () => {
  it('generates a valid sitemap with absolute, unique, canonical URLs', () => {
    const map = sitemap();
    const siteUrl = getSiteUrl();

    expect(map.length).toBeGreaterThanOrEqual(5);

    const urls = map.map(item => item.url);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(urls.length);

    // Every URL starts with the siteUrl
    for (const item of map) {
      expect(item.url.startsWith(siteUrl)).toBe(true);
      expect(item.lastModified).toBeInstanceOf(Date);
      expect(item.priority).toBeGreaterThanOrEqual(0.1);
      expect(item.priority).toBeLessThanOrEqual(1.0);
    }
  });

  it('guarantees that no dynamic user-content (noindex) routes appear in sitemap', () => {
    const map = sitemap();
    const urls = map.map(item => item.url);

    // Ensure disallow / user-content routes are NOT in sitemap
    for (const url of urls) {
      expect(url).not.toContain('/view');
      expect(url).not.toContain('/r/');
      expect(url).not.toContain('/api/');
      expect(url).not.toContain('/_next');
      expect(url).not.toContain('/preview');
      expect(url).not.toContain('/share');
    }
  });

  it('generates valid robots.txt referencing the canonical sitemap and disallowing dynamic paths', () => {
    const botConfig = robots();
    const siteUrl = getSiteUrl();

    expect(botConfig.sitemap).toBe(`${siteUrl}/sitemap.xml`);

    const rules = Array.isArray(botConfig.rules) ? botConfig.rules[0] : botConfig.rules;
    expect(rules).toBeDefined();

    const disallowList = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    expect(disallowList).toContain('/api/');
    expect(disallowList).toContain('/view');
    expect(disallowList).toContain('/r/');
    expect(disallowList).toContain('/_next/');
  });
});
