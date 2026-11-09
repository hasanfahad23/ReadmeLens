import type { IProviderAdapter, ParsedSource, FetchedDocFile, FetchOptions } from './types.js';
import { GitHubProvider } from './adapters/github.js';
import { NpmProvider, PyPiProvider } from './adapters/package-registries.js';
import { RawUrlProvider, LocalMemoryProvider } from './adapters/raw-and-local.js';

export class ProviderRegistry {
  private adapters: IProviderAdapter[] = [];

  constructor() {
    this.register(new GitHubProvider());
    this.register(new NpmProvider());
    this.register(new PyPiProvider());
    this.register(new RawUrlProvider());
    this.register(new LocalMemoryProvider());
  }

  register(adapter: IProviderAdapter) {
    this.adapters.unshift(adapter); // newer or more specific adapters first
  }

  getAdapterForInput(input: string): IProviderAdapter {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(input)) {
        return adapter;
      }
    }
    // Default fallback to raw URL or GitHub
    if (input.includes('/')) {
      return this.adapters.find(a => a.id === 'github')!;
    }
    return this.adapters.find(a => a.id === 'raw')!;
  }

  parse(input: string): ParsedSource {
    const adapter = this.getAdapterForInput(input);
    return adapter.parse(input);
  }

  async fetch(input: string, options?: FetchOptions): Promise<FetchedDocFile> {
    const adapter = this.getAdapterForInput(input);
    const parsed = adapter.parse(input);
    return adapter.fetchFile(parsed, options);
  }
}

export const defaultProviderRegistry = new ProviderRegistry();
