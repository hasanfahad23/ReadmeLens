import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware providing runtime HTTP security controls:
 * 1. Generates a cryptographically strong per-request nonce using WebCrypto UUID.
 * 2. Injects a strict Content-Security-Policy (CSP) enforcing strict-dynamic script execution,
 *    safe image sources (including HTTPS badge hosts and blob previews), and framing restrictions.
 * 3. Enforces X-Robots-Tag: noindex, nofollow on dynamic/user-controlled doc view paths
 *    (/view, /r/, /preview, /share) to prevent search engine crawler poisoning.
 * 4. Routes CSP violation reports to the /api/csp-report endpoint.
 *
 * @param request - Incoming NextRequest object.
 * @returns Modified NextResponse with injected security and indexing headers.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const path = request.nextUrl.pathname;

  const isEmbed = path.startsWith('/embed');
  const isDynamicUserContent = path.startsWith('/view') || path.startsWith('/r/') || path.startsWith('/preview') || path.startsWith('/share');

  // CSP policy definition
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${isEmbed ? '*' : "'none'"};
    connect-src 'self' https:;
    report-uri /api/csp-report;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  // Enforce noindex on dynamic user content and preview links
  if (isDynamicUserContent) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
