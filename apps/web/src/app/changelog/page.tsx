import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Release history and updates for ReadmeLens Pro.',
};

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-4">Changelog</h1>
      <p className="text-slate-400 text-sm mb-8">
        Official release notes and architecture changes.
      </p>

      <article id="1.0.0" className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white">Version 1.0.0</h2>
          <time className="text-xs font-mono text-slate-400">2026-11-09</time>
        </div>
        <div className="text-sm text-slate-300 space-y-2">
          <p>Initial production release of ReadmeLens Pro:</p>
          <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
            <li>Unified Markdown/MDX AST pipeline with strict sanitization schema.</li>
            <li>Explainable 0-100 health scoring engine across six dimensions.</li>
            <li>Security scanner auditing malicious shell pipes, base64 payloads, and Trojan Source Unicode characters.</li>
            <li>Standardized Lucide-only icon surface across all packages.</li>
            <li>Next.js 15 App Router reader with accessible design system.</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
