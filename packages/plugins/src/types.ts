export type DirectiveType = 'tip' | 'warning' | 'note' | 'caution' | 'important' | 'tabs' | 'steps' | 'cards' | 'accordion';

export interface DirectiveBlock {
  type: DirectiveType;
  title?: string;
  content: string;
  attributes?: Record<string, string>;
}

export interface DiagramBlock {
  engine: 'mermaid' | 'plantuml' | 'graphviz' | 'd2' | 'vegalite';
  source: string;
  title?: string;
}

export interface CodeRunnerResult {
  output: string;
  error?: string;
  executionTimeMs: number;
}

export interface ReadmePlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  init?(): void | Promise<void>;
  transformMarkdown?(content: string): string;
  processDirectives?(blocks: DirectiveBlock[]): DirectiveBlock[];
}
