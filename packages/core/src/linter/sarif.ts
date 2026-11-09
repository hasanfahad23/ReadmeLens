import type { LintResult } from '../types.js';

export function formatSarif(results: LintResult[], toolVersion = '1.0.0') {
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'ReadmeLens Linter',
            version: toolVersion,
            informationUri: 'https://github.com/readmelens/readmelens',
            rules: [
              {
                id: 'require-h1',
                shortDescription: { text: 'Missing H1 heading' },
                defaultConfiguration: { level: 'error' },
              },
              {
                id: 'heading-hierarchy',
                shortDescription: { text: 'Heading hierarchy skipped levels' },
                defaultConfiguration: { level: 'warning' },
              },
              {
                id: 'require-code-lang',
                shortDescription: { text: 'Missing code block language identifier' },
                defaultConfiguration: { level: 'warning' },
              },
              {
                id: 'require-img-alt',
                shortDescription: { text: 'Missing image alt text' },
                defaultConfiguration: { level: 'warning' },
              },
              {
                id: 'no-raw-curl-bash',
                shortDescription: { text: 'Insecure pipe to shell' },
                defaultConfiguration: { level: 'error' },
              },
              {
                id: 'no-generic-link-text',
                shortDescription: { text: 'Non-descriptive link label' },
                defaultConfiguration: { level: 'note' },
              },
              {
                id: 'require-license',
                shortDescription: { text: 'Missing license section' },
                defaultConfiguration: { level: 'warning' },
              },
            ],
          },
        },
        results: results.flatMap(res =>
          res.violations.map(v => ({
            ruleId: v.ruleId,
            level: v.severity === 'error' ? 'error' : v.severity === 'warning' ? 'warning' : 'note',
            message: { text: v.message },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: res.filePath || 'README.md',
                  },
                  region: {
                    startLine: Math.max(1, v.line),
                    startColumn: v.column || 1,
                  },
                },
              },
            ],
          }))
        ),
      },
    ],
  };
}
