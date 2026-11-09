#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ALLOWLIST = [
  path.normalize('tests/fixtures/unicode'),
  path.normalize('.git'),
  path.normalize('node_modules'),
  path.normalize('.next'),
  path.normalize('dist'),
  path.normalize('build'),
  path.normalize('.pnpm-store'),
];

// Regex matching raw emoji, pictographs, variation selectors, and decorative dingbats
const EMOJI_REGEX = /[\p{Extended_Pictographic}\uFE0F\u2700-\u27BF\u2600-\u26FF\u2B50\u2705\u274C\u2728\u2714\u2716\u2713]/u;

function isAllowlisted(filePath) {
  const norm = path.normalize(filePath);
  return ALLOWLIST.some(item => norm.includes(item));
}

let violationsCount = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isAllowlisted(fullPath)) continue;

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      // Check text files
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.css', '.html', '.yaml', '.yml'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, lineIndex) => {
          if (EMOJI_REGEX.test(line)) {
            console.error(`[EMOJI VIOLATION] ${fullPath}:${lineIndex + 1}: ${line.trim()}`);
            violationsCount++;
          }
        });
      }
    }
  }
}

console.log('Running Emoji and Pictograph Check...');
walk(process.cwd());

if (violationsCount > 0) {
  console.error(`FAILED: Found ${violationsCount} emoji/pictograph violation(s). Remove all decorative emojis or move test fixtures to tests/fixtures/unicode/.`);
  process.exit(1);
} else {
  console.log('PASSED: Zero emojis found outside allowlist.');
  process.exit(0);
}
