import type { LintResult, LintViolation } from '../types.js';
import { builtInRules, type RuleContext } from './rules.js';

export interface LintOptions {
  filePath?: string;
  enabledRules?: Record<string, 'off' | 'warn' | 'error'>;
}

export function lintMarkdown(content: string, options: LintOptions = {}): LintResult {
  const lines = content.split('\n');
  const ctx: RuleContext = { content, lines };
  const violations: LintViolation[] = [];

  for (const rule of builtInRules) {
    const config = options.enabledRules?.[rule.id];
    if (config === 'off') {
      continue;
    }

    const ruleViolations = rule.run(ctx);
    for (const v of ruleViolations) {
      if (config === 'error') v.severity = 'error';
      else if (config === 'warn') v.severity = 'warning';
      violations.push(v);
    }
  }

  // Sort by line number
  violations.sort((a, b) => a.line - b.line);

  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;
  const infoCount = violations.filter(v => v.severity === 'info').length;

  return {
    filePath: options.filePath,
    violations,
    errorCount,
    warningCount,
    infoCount,
  };
}

export * from './rules.js';
export * from './sarif.js';
