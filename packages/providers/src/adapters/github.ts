import type { IProviderAdapter, ParsedSource, FetchedDocFile, ProviderRepoMeta, FetchOptions } from '../types.js';

export class GitHubProvider implements IProviderAdapter {
  id = 'github' as const;
  name = 'GitHub';

  canHandle(input: string): boolean {
    return (
      input.startsWith('https://github.com/') ||
      input.startsWith('github.com/') ||
      /^[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+$/.test(input.trim())
    );
  }

  parse(input: string): ParsedSource {
    const clean = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/^github\.com\//, '');
    const [repoPart, hashPart] = clean.split('#');
    const parts = repoPart.split('/');
    const owner = parts[0];
    const repo = parts[1];

    let ref: string | undefined = undefined;
    let path = 'README.md';

    if (parts.length > 2 && (parts[2] === 'blob' || parts[2] === 'tree')) {
      ref = parts[3];
      if (parts.length > 4) {
        path = parts.slice(4).join('/');
      }
    }

    return {
      provider: 'github',
      owner,
      repo,
      ref,
      path,
      section: hashPart,
      originalInput: input,
    };
  }

  async fetchFile(source: ParsedSource, options?: FetchOptions): Promise<FetchedDocFile> {
    const owner = source.owner;
    const repo = source.repo;
    const ref = source.ref || 'HEAD';
    const filePath = source.path || 'README.md';

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
    const headers: Record<string, string> = {
      'User-Agent': 'ReadmeLens-Pro',
    };
    if (options?.token) {
      headers['Authorization'] = `token ${options.token}`;
    }

    const res = await fetch(rawUrl, { headers });
    if (!res.ok) {
      // If README.md failed, try lowercase or other standard variants
      if (filePath === 'README.md') {
        const fallbackUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/readme.md`;
        const fallbackRes = await fetch(fallbackUrl, { headers });
        if (fallbackRes.ok) {
          const content = await fallbackRes.text();
          return {
            content,
            path: 'readme.md',
            source,
            rawUrl: fallbackUrl,
            editUrl: `https://github.com/${owner}/${repo}/edit/${ref}/readme.md`,
          };
        }
      }
      throw new Error(`Failed to fetch file from GitHub (${res.status}): ${res.statusText}`);
    }

    const content = await res.text();
    return {
      content,
      path: filePath,
      source,
      rawUrl,
      editUrl: `https://github.com/${owner}/${repo}/edit/${ref}/${filePath}`,
    };
  }

  async fetchMeta(source: ParsedSource, options?: FetchOptions): Promise<ProviderRepoMeta> {
    const { owner, repo } = source;
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const headers: Record<string, string> = {
      'User-Agent': 'ReadmeLens-Pro',
      Accept: 'application/vnd.github.v3+json',
    };
    if (options?.token) {
      headers['Authorization'] = `token ${options.token}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      return {
        name: repo || '',
        fullName: `${owner}/${repo}`,
      };
    }

    const data = await res.json() as Record<string, any>;
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      license: data.license?.spdx_id || data.license?.name,
      lastCommitDate: data.pushed_at,
      primaryLanguage: data.language,
      homepage: data.homepage,
    };
  }
}
