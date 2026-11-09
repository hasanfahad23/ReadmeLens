import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data processing disclosures for ReadmeLens Pro.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Effective Date: November 9, 2026</p>

      <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-4 leading-relaxed">
        <h2 className="text-base font-semibold text-white">Data Collection and Processing</h2>
        <p>
          ReadmeLens Pro is designed with privacy-first principles. We do not use third-party analytics trackers, cookies, or profiling identifiers.
        </p>
        <h3 className="text-sm font-semibold text-white">Local Storage and Cache</h3>
        <p>
          The application may store user-selected preferences (such as light/dark mode and active workspace tabs) locally in your browser session using localStorage. This data never leaves your device.
        </p>
        <h3 className="text-sm font-semibold text-white">Third-Party Network Requests</h3>
        <p>
          When you request documentation from a remote repository (e.g., GitHub, npm, or PyPI), the server fetches the public repository file directly from the designated upstream API. No user identity or tracking headers are transmitted to the upstream provider.
        </p>
      </section>
    </div>
  );
}
