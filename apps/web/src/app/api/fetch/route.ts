import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateTargetUrl } from '@readmelens/core';
import { defaultProviderRegistry } from '@readmelens/providers';

/**
 * Input validation schema enforcing string length bounds and rejecting unknown keys.
 */
const fetchInputSchema = z
  .object({
    source: z.string().min(1).max(2048),
  })
  .strict();

/**
 * Route handler for securely resolving and fetching documentation from upstream sources.
 *
 * Security measures:
 * - Validates JSON payload strictly using Zod (.strict()).
 * - Performs SSRF validation on remote URLs before network dispatch.
 * - Enforces content length limits and blocks private IP subnets and cloud metadata endpoints.
 * - Handles errors gracefully with appropriate HTTP 400, 403, or 404 status codes.
 *
 * @param req - Incoming HTTP POST request with `{ source: string }` JSON body.
 * @returns JSON response containing document content, file path, source metadata, and edit URL.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsedInput = fetchInputSchema.safeParse(rawBody);

    if (!parsedInput.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsedInput.error.format() },
        { status: 400 }
      );
    }

    const { source } = parsedInput.data;

    // If source is a full URL, validate against SSRF
    if (source.startsWith('http://') || source.startsWith('https://')) {
      validateTargetUrl(source, process.env.NODE_ENV !== 'production');
    }

    const fetched = await defaultProviderRegistry.fetch(source);

    return NextResponse.json({
      content: fetched.content,
      path: fetched.path,
      source: fetched.source,
      meta: fetched.meta,
      editUrl: fetched.editUrl,
    });
  } catch (err: any) {
    const isSecurityError = err.message?.includes('SSRF') || err.message?.includes('restricted');
    const status = isSecurityError ? 403 : 404;

    return NextResponse.json(
      {
        error: isSecurityError ? 'Access Denied: Target URL is disallowed by SSRF security policy.' : err.message || 'Fetch failed',
      },
      { status }
    );
  }
}
