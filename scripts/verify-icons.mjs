#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_LUCIDE_SURFACE = path.normalize('packages/ui/src/icons');
const IGNORED = ['.git', 'node_modules', '.next', 'dist', 'build'];

let violations = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (IGNORED.some(ig => full.includes(path.normalize(ig)))) continue;

    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(full, 'utf-8');
      
      // Check for direct lucide-react import
      if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
        const norm = path.normalize(full);
        if (!norm.includes(ALLOWED_LUCIDE_SURFACE)) {
          console.error(`[ICON VIOLATION] Direct lucide-react import found outside ui/icons: ${full}`);
          violations++;
        }
      }

      // Check for prohibited icon libraries
      const prohibitedLibs = ['react-icons', '@heroicons', '@tabler/icons', '@fontawesome', 'feather-icons'];
      for (const lib of prohibitedLibs) {
        if (content.includes(`from '${lib}`) || content.includes(`from "${lib}`)) {
          console.error(`[ICON VIOLATION] Prohibited icon library ${lib} imported in: ${full}`);
          violations++;
        }
      }
    }
  }
}

console.log('Running Icon Architecture and Import Surface Verification...');
walk(process.cwd());

if (violations > 0) {
  console.error(`FAILED: ${violations} icon architecture violation(s) found.`);
  process.exit(1);
} else {
  console.log('PASSED: Only @readmelens/ui/icons imports lucide-react. Zero direct or third-party icon leaks.');
  process.exit(0);
}
