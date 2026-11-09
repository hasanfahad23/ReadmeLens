import type { IProviderAdapter, ParsedSource, FetchedDocFile, ProviderRepoMeta, FetchOptions } from '../types.js';

export class NpmProvider implements IProviderAdapter {
  id = 'npm' as const;
  name = 'npm Registry';

  canHandle(input: string): boolean {
    const trimmed = input.trim();
    return (
      trimmed.startsWith('https://www.npmjs.com/package/') ||
      trimmed.startsWith('npmjs.com/package/') ||
      trimmed.startsWith('npm:')
    );
  }

  parse(input: string): ParsedSource {
    let packageName = input.trim();
    if (packageName.startsWith('npm:')) {
      packageName = packageName.slice(4);
    } else {
      packageName = packageName.replace(/^https?:\/\/(?:www\.)?npmjs\.com\/package\//, '');
    }

    return {
      provider: 'npm',
      packageName,
      path: 'README.md',
      originalInput: input,
    };
  }

  async fetchFile(source: ParsedSource, _options?: FetchOptions): Promise<FetchedDocFile> {
    const pkg = source.packageName;
    const url = `https://registry.npmjs.org/${pkg}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ReadmeLens-Pro', Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Package "${pkg}" not found on npm registry.`);
    }

    const data = await res.json() as {
      readme?: string;
      description?: string;
      license?: string;
      homepage?: string;
      repository?: { url?: string };
    };

    const content = data.readme || `# ${pkg}\n\n${data.description || 'No README provided in this npm package.'}`;

    return {
      content,
      path: 'README.md',
      source,
      editUrl: `https://www.npmjs.com/package/${pkg}`,
      meta: {
        name: pkg || '',
        fullName: pkg || '',
        description: data.description,
        license: typeof data.license === 'string' ? data.license : undefined,
        homepage: data.homepage,
      },
    };
  }
}

export class PyPiProvider implements IProviderAdapter {
  id = 'pypi' as const;
  name = 'PyPI';

  canHandle(input: string): boolean {
    const trimmed = input.trim();
    return (
      trimmed.startsWith('https://pypi.org/project/') ||
      trimmed.startsWith('pypi.org/project/') ||
      trimmed.startsWith('pypi:')
    );
  }

  parse(input: string): ParsedSource {
    let packageName = input.trim();
    if (packageName.startsWith('pypi:')) {
      packageName = packageName.slice(5);
    } else {
      packageName = packageName.replace(/^https?:\/\/pypi\.org\/project\//, '').replace(/\/.*$/, '');
    }

    return {
      provider: 'pypi',
      packageName,
      path: 'README.md',
      originalInput: input,
    };
  }

  async fetchFile(source: ParsedSource, _options?: FetchOptions): Promise<FetchedDocFile> {
    const pkg = source.packageName;
    const url = `https://pypi.org/pypi/${pkg}/json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ReadmeLens-Pro', Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Package "${pkg}" not found on PyPI.`);
    }

    const data = await res.json() as {
      info?: {
        name?: string;
        description?: string;
        summary?: string;
        license?: string;
        home_page?: string;
      };
    };

    const content = data.info?.description || `# ${pkg}\n\n${data.info?.summary || 'No description provided.'}`;

    return {
      content,
      path: 'README.md',
      source,
      editUrl: `https://pypi.org/project/${pkg}/`,
      meta: {
        name: pkg || '',
        fullName: pkg || '',
        description: data.info?.summary,
        license: data.info?.license,
        homepage: data.info?.home_page,
      },
    };
  }
}
