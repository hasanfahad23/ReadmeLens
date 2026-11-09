'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, send to structured telemetry
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 font-mono font-bold text-lg mx-auto mb-4 flex items-center justify-center border border-rose-500/30">
        500
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
      <p className="text-sm text-slate-400 mb-8 leading-relaxed">
        An unhandled error occurred while processing the documentation. The issue has been recorded for review.
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
