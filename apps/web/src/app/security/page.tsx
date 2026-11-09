import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy',
  description: 'Vulnerability disclosure policy and security controls for ReadmeLens Pro.',
};

export default function SecurityPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Security Policy</h1>
        <p className="text-slate-400 text-sm">
          Guidelines on reporting security vulnerabilities and implemented platform controls.
        </p>
      </div>

      <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-lg font-semibold text-white">Reporting a Vulnerability</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          If you discover a security vulnerability in ReadmeLens Pro, please notify us immediately by emailing{' '}
          <a href="mailto:security@readmelens.dev" className="text-indigo-400 underline">security@readmelens.dev</a>.
          Please do not disclose security issues publicly until we have reviewed and addressed the report.
        </p>
        <div className="text-xs text-slate-400">
          Expected initial response: within 48 business hours.
        </div>
      </section>

      <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-lg font-semibold text-white">Platform Controls</h2>
        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2">
          <li><strong>Content-Security-Policy:</strong> Strict per-request nonces, script-src self, object-src none, frame-ancestors none.</li>
          <li><strong>Sanitization:</strong> rehype-sanitize custom strict allowlist disallowing script tags, raw event handlers, and data/javascript URIs.</li>
          <li><strong>SSRF Defense:</strong> Fetch proxy blocking loopback, link-local, RFC1918 private subnets, and capping downloads at 5 MB.</li>
        </ul>
      </section>
    </div>
  );
}
