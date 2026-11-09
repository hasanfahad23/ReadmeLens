import { NextResponse } from 'next/server';
import { analyzeDocument, renderMarkdownToHtml } from '@readmelens/core';
import { transformDirectivesToHtml, transformDiagramsForRendering } from '@readmelens/plugins';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, filePath } = body;

    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid markdown content' }, { status: 400 });
    }

    const report = analyzeDocument(content, filePath);
    const withDirectives = transformDirectivesToHtml(content);
    const withDiagrams = transformDiagramsForRendering(withDirectives);
    const html = await renderMarkdownToHtml(withDiagrams);

    return NextResponse.json({
      report,
      html,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
