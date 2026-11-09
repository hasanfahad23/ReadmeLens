import type { LintViolation } from '../types.js';

export interface RuleContext {
  content: string;
  lines: string[];
}

export type RuleFunction = (ctx: RuleContext) => LintViolation[];

export interface RuleMeta {
  id: string;
  description: string;
  defaultSeverity: 'error' | 'warning' | 'info';
  run: RuleFunction;
}

export const builtInRules: RuleMeta[] = [
  {
    id: 'require-h1',
    description: 'Document must have at least one top-level H1 heading for the title.',
    defaultSeverity: 'error',
    run: ({ lines }) => {
      const hasH1 = lines.some(l => /^#\s+\S+/.test(l));
      if (!hasH1) {
        return [{
          ruleId: 'require-h1',
          message: 'Missing top-level H1 heading. Add "# Project Name" at the start of the document.',
          severity: 'error',
          line: 1,
          autoFixable: true,
          fix: {
            range: [0, 0],
            replacement: '# Project Title\n\n',
          },
        }];
      }
      return [];
    },
  },
  {
    id: 'heading-hierarchy',
    description: 'Headings should not skip levels (e.g. jumping from H1 directly to H3).',
    defaultSeverity: 'warning',
    run: ({ lines }) => {
      const violations: LintViolation[] = [];
      let lastLevel = 0;

      lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+/);
        if (match) {
          const currentLevel = match[1].length;
          if (lastLevel > 0 && currentLevel > lastLevel + 1) {
            violations.push({
              ruleId: 'heading-hierarchy',
              message: `Heading level jumped from H${lastLevel} to H${currentLevel}. Headings should only increase by one level at a time.`,
              severity: 'warning',
              line: index + 1,
              autoFixable: false,
            });
          }
          lastLevel = currentLevel;
        }
      });

      return violations;
    },
  },
  {
    id: 'require-code-lang',
    description: 'Fenced code blocks must specify a language identifier for syntax highlighting.',
    defaultSeverity: 'warning',
    run: ({ lines }) => {
      const violations: LintViolation[] = [];
      let inBlock = false;

      lines.forEach((line, index) => {
        if (line.startsWith('```')) {
          if (!inBlock) {
            inBlock = true;
            const lang = line.slice(3).trim();
            if (!lang) {
              violations.push({
                ruleId: 'require-code-lang',
                message: 'Code block is missing a syntax language identifier (e.g. ```ts, ```bash, ```json).',
                severity: 'warning',
                line: index + 1,
                autoFixable: true,
                fix: {
                  range: [index, index + 3],
                  replacement: '```text',
                },
              });
            }
          } else {
            inBlock = false;
          }
        }
      });

      return violations;
    },
  },
  {
    id: 'require-img-alt',
    description: 'Images must have descriptive alternative text for accessibility.',
    defaultSeverity: 'warning',
    run: ({ lines }) => {
      const violations: LintViolation[] = [];
      const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

      lines.forEach((line, index) => {
        let match: RegExpExecArray | null;
        while ((match = imgRegex.exec(line)) !== null) {
          if (!match[1]?.trim()) {
            violations.push({
              ruleId: 'require-img-alt',
              message: `Image "${match[2]}" is missing descriptive alt text.`,
              severity: 'warning',
              line: index + 1,
              column: match.index + 1,
              autoFixable: false,
            });
          }
        }
      });

      return violations;
    },
  },
  {
    id: 'no-raw-curl-bash',
    description: 'Avoid instructing users to pipe curl or wget directly to bash/sh.',
    defaultSeverity: 'error',
    run: ({ lines }) => {
      const violations: LintViolation[] = [];
      const curlBashRegex = /(?:curl|wget)\s+[^\n|;]+?\|\s*(?:bash|sh|zsh|sudo\s+bash)/i;

      lines.forEach((line, index) => {
        if (curlBashRegex.test(line)) {
          violations.push({
            ruleId: 'no-raw-curl-bash',
            message: 'Insecure pipe to shell detected ("curl ... | bash"). Suggest inspecting and downloading the script first.',
            severity: 'error',
            line: index + 1,
            autoFixable: false,
          });
        }
      });

      return violations;
    },
  },
  {
    id: 'no-generic-link-text',
    description: 'Links should use descriptive anchor text rather than "click here" or "link".',
    defaultSeverity: 'info',
    run: ({ lines }) => {
      const violations: LintViolation[] = [];
      const genericRegex = /\[\s*(?:click\s+here|here|link|more)\s*\]\(/gi;

      lines.forEach((line, index) => {
        let match: RegExpExecArray | null;
        while ((match = genericRegex.exec(line)) !== null) {
          violations.push({
            ruleId: 'no-generic-link-text',
            message: 'Non-descriptive link label. Use text describing where the link navigates to.',
            severity: 'info',
            line: index + 1,
            column: match.index + 1,
            autoFixable: false,
          });
        }
      });

      return violations;
    },
  },
  {
    id: 'require-license',
    description: 'Documentation should mention an open source or proprietary license.',
    defaultSeverity: 'warning',
    run: ({ content }) => {
      const hasLicense = /license|MIT|Apache|BSD|GPL|proprietary/i.test(content);
      if (!hasLicense) {
        return [{
          ruleId: 'require-license',
          message: 'No license information detected. Add a "## License" section.',
          severity: 'warning',
          line: 1,
          autoFixable: false,
        }];
      }
      return [];
    },
  },
];
