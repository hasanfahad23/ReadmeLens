import { NextResponse } from 'next/server';

/**
 * Health check endpoint for uptime monitoring, load balancers, and Docker container orchestration.
 * Returns service status, UTC timestamp, uptime, and application version.
 *
 * @returns JSON response with 200 OK status.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'ReadmeLens Pro Web App',
  });
}
