#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const bannedPhrases = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'scripts', 'banned-phrases.json'), 'utf-8')
);

const IGNORED_PATHS = [
  path.normalize('.git'),
  path.normalize('node_modules'),
  path.normalize('.next'),
  path.normalize('dist'),
  path.normalize('build'),
  path.normalize('.pnpm-store'),
  path.normalize('scripts/banned-phrases.json'),
  path.normalize('scripts/check-copy.mjs'),
];

function isIgnored(filePath) {
  const norm = path.normalize(filePath);
  return IGNORED_PATHS.some(item => norm.includes(item));
}

let violations = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isIgnored(fullPath)) continue;

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.css', '.html'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const lower = line.toLowerCase();
          for (const phrase of bannedPhrases) {
            // Match word boundary where feasible
            const regex = new RegExp(`\\b${phrase.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lower)) {
              console.error(`[COPY SLOP VIOLATION] ${fullPath}:${idx + 1} contains banned phrase "${phrase}": ${line.trim()}`);
              violations++;
            }
          }
        });
      }
    }
  }
}

console.log('Running Copy and Marketing Phrase Audit...');
walk(process.cwd());

if (violations > 0) {
  console.error(`FAILED: Found ${violations} copy slop violation(s). Remove all marketing filler and AI buzzwords.`);
  process.exit(1);
} else {
  console.log('PASSED: Zero banned phrases found across repository.');
  process.exit(0);
}
