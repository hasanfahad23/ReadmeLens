import { NextResponse } from 'next/server';
import { defaultProviderRegistry } from '@readmelens/providers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source } = body;

    if (!source || typeof source !== 'string') {
      return NextResponse.json({ error: 'Missing source parameter' }, { status: 400 });
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
    return NextResponse.json({ error: err.message || 'Fetch failed' }, { status: 404 });
  }
}
