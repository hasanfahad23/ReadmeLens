export type ProviderType = 
  | 'github' 
  | 'gitlab' 
  | 'bitbucket' 
  | 'npm' 
  | 'pypi' 
  | 'crates' 
  | 'raw' 
  | 'local';

export interface ParsedSource {
  provider: ProviderType;
  owner?: string;
  repo?: string;
  ref?: string;
  path: string;
  section?: string;
  rawUrl?: string;
  packageName?: string;
  originalInput: string;
}

export interface RepoTreeNode {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
}

export interface ProviderRepoMeta {
  name: string;
  fullName: string;
  description?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  defaultBranch?: string;
  license?: string;
  lastCommitDate?: string;
  primaryLanguage?: string;
  homepage?: string;
}

export interface FetchedDocFile {
  content: string;
  path: string;
  source: ParsedSource;
  sha?: string;
  rawUrl?: string;
  editUrl?: string;
  meta?: ProviderRepoMeta;
}

export interface FetchOptions {
  token?: string;
  ref?: string;
  cacheTtlMs?: number;
}

export interface IProviderAdapter {
  id: ProviderType;
  name: string;
  canHandle(input: string): boolean;
  parse(input: string): ParsedSource;
  fetchFile(source: ParsedSource, options?: FetchOptions): Promise<FetchedDocFile>;
  fetchTree?(source: ParsedSource, options?: FetchOptions): Promise<RepoTreeNode[]>;
  fetchMeta?(source: ParsedSource, options?: FetchOptions): Promise<ProviderRepoMeta>;
}
