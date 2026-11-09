import { describe, it, expect, vi } from 'vitest';
import { defaultProviderRegistry, GitHubProvider, NpmProvider, LocalMemoryProvider } from '../index.js';

describe('@readmelens/providers', () => {
  it('identifies and parses GitHub URLs and shorthand owner/repo', () => {
    const gh = new GitHubProvider();
    expect(gh.canHandle('vercel/next.js')).toBe(true);
    expect(gh.canHandle('https://github.com/facebook/react/blob/main/README.md#features')).toBe(true);

    const parsed = gh.parse('https://github.com/facebook/react/blob/main/README.md#features');
    expect(parsed.owner).toBe('facebook');
    expect(parsed.repo).toBe('react');
    expect(parsed.ref).toBe('main');
    expect(parsed.path).toBe('README.md');
    expect(parsed.section).toBe('features');
  });

  it('identifies and parses npm package URLs and identifiers', () => {
    const npm = new NpmProvider();
    expect(npm.canHandle('npm:lodash')).toBe(true);
    expect(npm.canHandle('https://www.npmjs.com/package/@types/node')).toBe(true);

    const parsed = npm.parse('npm:@types/node');
    expect(parsed.packageName).toBe('@types/node');
  });

  it('fetches files from LocalMemoryProvider', async () => {
    const local = new LocalMemoryProvider();
    local.setFile('docs/guide.md', '# Local Documentation Guide');

    const parsed = local.parse('docs/guide.md');
    const doc = await local.fetchFile(parsed);
    expect(doc.content).toBe('# Local Documentation Guide');
    expect(doc.path).toBe('docs/guide.md');
  });

  it('delegates through defaultProviderRegistry', () => {
    const ghAdapter = defaultProviderRegistry.getAdapterForInput('expressjs/express');
    expect(ghAdapter.id).toBe('github');

    const npmAdapter = defaultProviderRegistry.getAdapterForInput('npm:express');
    expect(npmAdapter.id).toBe('npm');

    const rawAdapter = defaultProviderRegistry.getAdapterForInput('https://raw.githubusercontent.com/owner/repo/main/doc.md');
    expect(rawAdapter.id).toBe('raw');
  });
});
