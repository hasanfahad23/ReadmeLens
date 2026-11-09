import type { IProviderAdapter, ParsedSource, FetchedDocFile, FetchOptions } from '../types.js';

export class RawUrlProvider implements IProviderAdapter {
  id = 'raw' as const;
  name = 'Raw URL / Gist / Pastebin';

  canHandle(input: string): boolean {
    const trimmed = input.trim();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://')
    );
  }

  parse(input: string): ParsedSource {
    const url = new URL(input.trim());
    const pathParts = url.pathname.split('/');
    const path = pathParts[pathParts.length - 1] || 'document.md';

    return {
      provider: 'raw',
      rawUrl: input.trim(),
      path,
      section: url.hash.replace(/^#/, '') || undefined,
      originalInput: input,
    };
  }

  async fetchFile(source: ParsedSource, _options?: FetchOptions): Promise<FetchedDocFile> {
    if (!source.rawUrl) {
      throw new Error('Raw URL is missing in parsed source.');
    }

    const res = await fetch(source.rawUrl, {
      headers: { 'User-Agent': 'ReadmeLens-Pro' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch raw URL (${res.status}): ${res.statusText}`);
    }

    const content = await res.text();
    return {
      content,
      path: source.path,
      source,
      rawUrl: source.rawUrl,
    };
  }
}

export class LocalMemoryProvider implements IProviderAdapter {
  id = 'local' as const;
  name = 'Local File / Memory';

  private files: Map<string, string> = new Map();

  setFile(path: string, content: string) {
    this.files.set(path, content);
  }

  canHandle(input: string): boolean {
    return input.startsWith('local:') || this.files.has(input.trim());
  }

  parse(input: string): ParsedSource {
    const cleanPath = input.replace(/^local:/, '').trim();
    return {
      provider: 'local',
      path: cleanPath || 'README.md',
      originalInput: input,
    };
  }

  async fetchFile(source: ParsedSource, _options?: FetchOptions): Promise<FetchedDocFile> {
    const content = this.files.get(source.path);
    if (content === undefined) {
      throw new Error(`Local file "${source.path}" not found.`);
    }

    return {
      content,
      path: source.path,
      source,
    };
  }
}
