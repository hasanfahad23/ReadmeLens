/**
 * Supported documentation and repository host providers.
 */
export type ProviderType = 
  | 'github' 
  | 'gitlab' 
  | 'bitbucket' 
  | 'npm' 
  | 'pypi' 
  | 'crates' 
  | 'raw' 
  | 'local';

/**
 * Normalized representation of a parsed documentation source target.
 */
export interface ParsedSource {
  /** Target provider type. */
  provider: ProviderType;
  /** Repository owner or organization namespace (e.g., 'facebook' in 'facebook/react'). */
  owner?: string;
  /** Repository or project slug (e.g., 'react'). */
  repo?: string;
  /** Git branch, tag, or commit hash reference (defaults to HEAD / main). */
  ref?: string;
  /** File path within the repository or package archive (e.g., 'README.md' or 'docs/api.md'). */
  path: string;
  /** Optional anchor or heading section fragment (e.g., '#quick-start'). */
  section?: string;
  /** Resolved direct HTTPS raw download URL if known. */
  rawUrl?: string;
  /** Package identifier for package registry sources (e.g., 'lodash' for npm). */
  packageName?: string;
  /** The original unmodified user input string. */
  originalInput: string;
}

/**
 * File tree entry representation for documentation repository browsing.
 */
export interface RepoTreeNode {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
}

/**
 * Standardized repository metadata returned across diverse upstream host APIs.
 */
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

/**
 * Container holding fetched documentation text along with origin provenance.
 */
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
