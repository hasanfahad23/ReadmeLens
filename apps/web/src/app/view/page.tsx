import React from 'react';
import type { Metadata } from 'next';
import { defaultProviderRegistry } from '@readmelens/providers';
import { analyzeDocument, renderMarkdownToHtml } from '@readmelens/core';
import { HealthScoreBadge } from '@readmelens/ui';

// Force search engines to not index arbitrary user-submitted dynamic content
export const metadata: Metadata = {
  title: 'Document Viewer',
  description: 'View rendered markdown documentation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ViewPage({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string; url?: string; path?: string }>;
}) {
  const params = await searchParams;
  const target = params.repo || params.url || '';

  if (!target) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-white mb-2">No Document Target Provided</h1>
        <p className="text-sm text-slate-400">Specify ?repo=owner/repo or ?url=https://... to load a document.</p>
      </div>
    );
  }

  try {
    const fetched = await defaultProviderRegistry.fetch(target);
    const report = analyzeDocument(fetched.content, fetched.path);
    const html = await renderMarkdownToHtml(fetched.content);

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{fetched.path}</h1>
            <div className="text-xs text-slate-400">{target}</div>
          </div>
          <HealthScoreBadge score={report.health.score} grade={report.health.grade} size="md" />
        </div>

        <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/40 readmelens-content">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-rose-400 mb-2">Failed to Load Document</h1>
        <p className="text-sm text-slate-400">{err.message}</p>
      </div>
    );
  }
}
