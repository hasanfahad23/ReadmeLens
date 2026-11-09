import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const report = await req.json();
    // Sanitized structured log without recording personal or query parameters
    const sanitizedReport = {
      timestamp: new Date().toISOString(),
      blockedUri: typeof report['csp-report']?.['blocked-uri'] === 'string'
        ? report['csp-report']['blocked-uri'].split('?')[0]
        : undefined,
      violatedDirective: report['csp-report']?.['violated-directive'],
      effectiveDirective: report['csp-report']?.['effective-directive'],
    };

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[CSP Violation Report]:', sanitizedReport);
    }

    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Invalid report payload' }, { status: 400 });
  }
}
