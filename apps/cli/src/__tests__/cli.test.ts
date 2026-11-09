import { describe, it, expect } from 'vitest';
import { analyzeDocument, lintMarkdown } from '@readmelens/core';

describe('@readmelens/cli', () => {
  it('analyzes and scores local test files successfully', () => {
    const testContent = `# ReadmeLens Pro\n\nFull documentation platform.\n\n## Installation\n\`\`\`bash\nnpm i readmelens\n\`\`\`\n\n## License\nMIT\n`;
    const report = analyzeDocument(testContent);
    expect(report.health.score).toBeGreaterThan(60);
    expect(report.security.passed).toBe(true);
  });

  it('lints markdown and reports violation counts', () => {
    const testContent = `## No H1\n![](missing-alt.png)`;
    const result = lintMarkdown(testContent);
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.warningCount).toBeGreaterThan(0);
  });
});
