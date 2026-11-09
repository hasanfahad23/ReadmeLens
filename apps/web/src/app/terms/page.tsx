import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of service and acceptable use for ReadmeLens Pro.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-white">Terms of Use</h1>
      <p className="text-xs text-slate-400">Effective Date: November 9, 2026</p>

      <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-4 leading-relaxed">
        <h2 className="text-base font-semibold text-white">Acceptable Use</h2>
        <p>
          ReadmeLens Pro is an open-source documentation analysis utility provided under the MIT License. You agree not to abuse the fetch proxies for denial of service, network scanning, or accessing unauthorized private infrastructure.
        </p>
        <h2 className="text-base font-semibold text-white">Disclaimer of Warranties</h2>
        <p>
          The software is provided &quot;as is&quot;, without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim or damages.
        </p>
      </section>
    </div>
  );
}
