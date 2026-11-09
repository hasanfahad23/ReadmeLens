import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 font-mono font-bold text-lg mx-auto mb-4 flex items-center justify-center border border-slate-700">
        404
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-400 mb-8 leading-relaxed">
        The requested documentation page or resource could not be found. Please check the URL or return to the main dashboard.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
        >
          Return Home
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
        >
          Documentation
        </Link>
      </div>
    </div>
  );
}
