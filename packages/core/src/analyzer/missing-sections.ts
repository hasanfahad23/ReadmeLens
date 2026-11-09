import type { MissingSectionCheck } from '../types.js';

interface SectionDefinition {
  key: string;
  name: string;
  required: boolean;
  scoreWeight: number;
  patterns: RegExp[];
  suggestion: string;
}

const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    key: 'title',
    name: 'Project Title',
    required: true,
    scoreWeight: 2,
    patterns: [/^#\s+.+/m],
    suggestion: 'Add an H1 heading at the very beginning of the README with your project title.',
  },
  {
    key: 'description',
    name: 'Summary / Description',
    required: true,
    scoreWeight: 2,
    patterns: [/^(?:(?:#\s+[^\n]+\n+)(?:[^\n#]+)){1,3}/m],
    suggestion: 'Provide a concise 1-2 sentence description explaining what problem this project solves.',
  },
  {
    key: 'badges',
    name: 'Status Badges',
    required: false,
    scoreWeight: 1,
    patterns: [/\[!\[.*?\]\(.*?\)\]\(.*?\)|shields\.io|badgen\.net|img\.shields\.io/i],
    suggestion: 'Add status badges (CI status, version, license, test coverage) near the top.',
  },
  {
    key: 'installation',
    name: 'Installation',
    required: true,
    scoreWeight: 3,
    patterns: [/^#{2,4}\s+.*(?:install|getting\s+started|quick\s*start|setup).*$/im],
    suggestion: 'Add an Installation section with clear terminal commands (e.g. npm install or pip install).',
  },
  {
    key: 'usage',
    name: 'Usage / Quickstart',
    required: true,
    scoreWeight: 3,
    patterns: [/^#{2,4}\s+.*(?:usage|how\s+to\s+use|quick\s*start|example\s+usage).*$/im],
    suggestion: 'Add a Usage section showing minimal working code that developers can copy and run.',
  },
  {
    key: 'examples',
    name: 'Examples',
    required: false,
    scoreWeight: 1.5,
    patterns: [/^#{2,4}\s+.*(?:examples?|demo|showcase|samples?).*$/im],
    suggestion: 'Include concrete examples or link to an examples/ directory or live interactive demo.',
  },
  {
    key: 'api_config',
    name: 'API / Configuration',
    required: false,
    scoreWeight: 2,
    patterns: [/^#{2,4}\s+.*(?:api|configuration|options|parameters|reference|props).*$/im],
    suggestion: 'Document key configuration options, environment variables, or exported API methods.',
  },
  {
    key: 'contributing',
    name: 'Contributing Guide',
    required: false,
    scoreWeight: 1.5,
    patterns: [/^#{2,4}\s+.*(?:contribut|development|guidelines).*$/im, /CONTRIBUTING\.md/i],
    suggestion: 'Provide instructions on how to set up the dev environment and submit pull requests.',
  },
  {
    key: 'license',
    name: 'License',
    required: true,
    scoreWeight: 1.5,
    patterns: [/^#{2,4}\s+.*license.*$/im, /MIT|Apache-2\.0|GPL|BSD|ISC/i],
    suggestion: 'Specify the open-source license so developers know how they can legally use the code.',
  },
  {
    key: 'security',
    name: 'Security Policy',
    required: false,
    scoreWeight: 1,
    patterns: [/^#{2,4}\s+.*(?:security|vulnerability).*$/im, /SECURITY\.md/i],
    suggestion: 'Add a Security section detailing how to report vulnerabilities privately.',
  },
  {
    key: 'changelog',
    name: 'Changelog / Release History',
    required: false,
    scoreWeight: 0.5,
    patterns: [/^#{2,4}\s+.*(?:changelog|releases?|history).*$/im, /CHANGELOG\.md/i],
    suggestion: 'Link to releases or a CHANGELOG.md documenting changes between versions.',
  },
  {
    key: 'faq',
    name: 'FAQ / Troubleshooting',
    required: false,
    scoreWeight: 0.5,
    patterns: [/^#{2,4}\s+.*(?:faq|troubleshooting|frequently\s+asked).*$/im],
    suggestion: 'Answer common questions and error solutions in an FAQ section.',
  },
];

export function detectMissingSections(content: string): MissingSectionCheck[] {
  return SECTION_DEFINITIONS.map(def => {
    let found = false;
    let matchedHeading: string | undefined;

    for (const pattern of def.patterns) {
      const match = content.match(pattern);
      if (match) {
        found = true;
        matchedHeading = match[0].replace(/^#+\s*/, '').trim();
        break;
      }
    }

    return {
      key: def.key,
      name: def.name,
      found,
      required: def.required,
      scoreWeight: def.scoreWeight,
      matchedHeading,
      suggestion: def.suggestion,
    };
  });
}
