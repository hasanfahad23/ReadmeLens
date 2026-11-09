import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSiteUrl } from '@/lib/env';

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ReadmeLens Pro — Documentation Platform',
    template: '%s | ReadmeLens Pro',
  },
  description: 'View, analyze, score, lint, and publish documentation with AST parsing, security audits, and WCAG accessibility.',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
    },
  },
  openGraph: {
    title: 'ReadmeLens Pro — Documentation Platform',
    description: 'View, analyze, score, lint, and publish documentation with AST parsing and security audits.',
    url: siteUrl,
    siteName: 'ReadmeLens Pro',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReadmeLens Pro — Documentation Platform',
    description: 'View, analyze, score, lint, and publish documentation with AST parsing and security audits.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'ReadmeLens Pro',
      description: 'Documentation Platform and README Analyzer',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#software`,
      name: 'ReadmeLens Pro',
      operatingSystem: 'Any',
      applicationCategory: 'DeveloperApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'ReadmeLens',
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
    },
  ],
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:outline-none"
        >
          Skip to main content
        </a>
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
              <a href="/docs" className="hover:text-white transition-colors">
                Docs
              </a>
              <a href="/security" className="hover:text-white transition-colors">
                Security
              </a>
              <a href="/changelog" className="hover:text-white transition-colors">
                Changelog
              </a>
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
        <footer className="border-t border-slate-800 bg-[#060911] py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              ReadmeLens Pro. Open source developer tool released under the MIT License.
            </div>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="/security" className="hover:text-white transition-colors">Security Policy</a>
              <a href="/feed.xml" className="hover:text-white transition-colors">RSS Feed</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
