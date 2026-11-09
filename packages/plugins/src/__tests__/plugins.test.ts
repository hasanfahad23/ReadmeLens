import { describe, it, expect } from 'vitest';
import {
  parseDirectives,
  transformDirectivesToHtml,
  extractDiagramBlocks,
  transformDiagramsForRendering,
  extractRunnableBlocks,
  executeIsolatedJs,
} from '../index.js';

describe('@readmelens/plugins', () => {
  it('parses and transforms custom :::tip directives', () => {
    const markdown = `:::tip[Pro Tip]
Use bun or pnpm for 5x faster installations.
:::`;

    const parsed = parseDirectives(markdown);
    expect(parsed.length).toBe(1);
    expect(parsed[0].type).toBe('tip');
    expect(parsed[0].title).toBe('Pro Tip');
    expect(parsed[0].content).toContain('Use bun or pnpm');

    const html = transformDirectivesToHtml(markdown);
    expect(html).toContain('data-directive="tip"');
    expect(html).toContain('Pro Tip');
  });

  it('extracts diagram blocks and prepares diagram containers', () => {
    const markdown = `\`\`\`mermaid
flowchart TD
  A[Start] --> B[Process]
\`\`\``;

    const diagrams = extractDiagramBlocks(markdown);
    expect(diagrams.length).toBe(1);
    expect(diagrams[0].engine).toBe('mermaid');

    const html = transformDiagramsForRendering(markdown);
    expect(html).toContain('data-diagram-engine="mermaid"');
  });

  it('detects runnable code blocks and executes isolated JS code safely', async () => {
    const markdown = `\`\`\`javascript runnable
console.log("Calculated:", 40 + 2);
\`\`\``;

    const runnable = extractRunnableBlocks(markdown);
    expect(runnable.length).toBe(1);
    expect(runnable[0].language).toBe('javascript');

    const result = await executeIsolatedJs(runnable[0].code);
    expect(result.output).toBe('Calculated: 42');
    expect(result.error).toBeUndefined();
  });
});
