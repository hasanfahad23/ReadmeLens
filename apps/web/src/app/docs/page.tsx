import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Technical reference, CLI commands, AST pipeline architecture, and integration guides for ReadmeLens Pro.',
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-4">ReadmeLens Pro Documentation</h1>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        Technical reference for the ReadmeLens parser, CLI, health scoring algorithm, and security scanning engine.
      </p>

      <section className="space-y-6">
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
          <h2 className="text-lg font-semibold text-white mb-2">CLI Quick Reference</h2>
          <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
{`# Calculate documentation health score
npx readmelens score README.md

# Lint with CI-friendly exit code (0 or 1)
npx readmelens lint README.md --strict

# Export SARIF for GitHub Code Scanning
npx readmelens lint README.md --sarif > report.sarif.json`}
          </pre>
        </div>

        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
          <h2 className="text-lg font-semibold text-white mb-2">Health Score Breakdown (0-100)</h2>
          <ul className="text-xs text-slate-300 space-y-2">
            <li><strong>Structure (15 pts):</strong> Heading hierarchy without skipping levels, clean H1 title.</li>
            <li><strong>Completeness (20 pts):</strong> Standard documentation sections (Installation, Usage, License, etc.).</li>
            <li><strong>Readability (15 pts):</strong> Flesch Reading Ease formula and balanced code-to-prose ratio.</li>
            <li><strong>Accessibility (15 pts):</strong> Image alt text audits, descriptive link labels, syntax language tags.</li>
            <li><strong>Security (15 pts):</strong> Zero-threat verification (no curl|bash, base64 payloads, or hidden control characters).</li>
            <li><strong>Onboarding Quality (20 pts):</strong> Executable package manager commands, environment tables, ports.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
