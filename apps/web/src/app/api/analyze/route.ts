import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeDocument, renderMarkdownToHtml } from '@readmelens/core';
import { transformDirectivesToHtml, transformDiagramsForRendering } from '@readmelens/plugins';

/**
 * Strict schema ensuring analysis payloads do not exceed 5 MB and reject unvalidated properties.
 */
const analyzeInputSchema = z
  .object({
    content: z.string().min(1).max(5 * 1024 * 1024), // Max 5 MB markdown payload
    filePath: z.string().max(1024).optional(),
  })
  .strict();

/**
 * Route handler for document quality analysis and HTML rendering.
 *
 * Capabilities:
 * - Validates input bounds (1 byte to 5 MB).
 * - Executes document analysis: readability, security threats, health score, outline, linter.
 * - Expands container directives (:::tip, :::tabs, :::steps) and diagram syntax (Mermaid, PlantUML).
 * - Sanitizes and compiles Markdown into safe HTML.
 *
 * @param req - Incoming HTTP POST request with `{ content: string, filePath?: string }`.
 * @returns JSON response containing the structured AnalysisReport and sanitized HTML string.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = analyzeInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid analysis input payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { content, filePath } = parsed.data;

    const report = analyzeDocument(content, filePath);
    const withDirectives = transformDirectivesToHtml(content);
    const withDiagrams = transformDiagramsForRendering(withDirectives);
    const html = await renderMarkdownToHtml(withDiagrams);

    return NextResponse.json({
      report,
      html,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Analysis processing failed' },
      { status: 500 }
    );
  }
}
