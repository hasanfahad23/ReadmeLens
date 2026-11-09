import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReadmeLens Pro — The Ultimate Documentation & README Platform',
  description: 'View, analyze, score, lint, and publish documentation better than anywhere else.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#090d16] backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
                R
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg tracking-tight text-white">ReadmeLens</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </div>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                v1.0.0
              </span>
              <a
                href="https://github.com/readmelens/readmelens"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
