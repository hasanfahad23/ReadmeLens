import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Mission and engineering principles behind ReadmeLens Pro.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-white">About ReadmeLens Pro</h1>
      <p className="text-slate-300 text-sm leading-relaxed">
        ReadmeLens Pro is an open-source documentation analysis and rendering platform designed to raise the bar for open-source and internal software documentation.
      </p>
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-3 leading-relaxed">
        <h2 className="text-base font-semibold text-white">Engineering Principles</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Zero Marketing Fluff:</strong> Focus on deterministic AST metrics, measurable health scoring, and concrete security audits.</li>
          <li><strong>Security by Default:</strong> Treat all documentation inputs as untrusted data. Neutralize XSS, SSRF, and command injection patterns.</li>
          <li><strong>Privacy First:</strong> No tracking cookies, no third-party CDNs on load, and local-first execution.</li>
        </ul>
      </div>
    </div>
  );
}
