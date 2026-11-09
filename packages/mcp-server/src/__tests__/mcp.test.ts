import { describe, it, expect } from 'vitest';
import { analyzeDocument, lintMarkdown } from '@readmelens/core';

describe('@readmelens/mcp-server', () => {
  it('validates tool logic for analyze_readme and lint_readme', () => {
    const doc = `# Awesome Tool\n\nA modern tool.\n\n## Installation\n\`\`\`bash\npnpm add awesome\n\`\`\`\n\n## License\nMIT\n`;
    const report = analyzeDocument(doc);
    expect(report.health.score).toBeGreaterThan(60);

    const lint = lintMarkdown(doc);
    expect(lint.errorCount).toBe(0);
  });
});
