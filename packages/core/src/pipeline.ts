import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';

import type {
  DocMetadata,
  HeadingItem,
  DocSection,
  AnalysisReport,
} from './types.js';
import { calculateReadability } from './analyzer/readability.js';
import { scanSecurityThreats } from './analyzer/security.js';
import { detectMissingSections } from './analyzer/missing-sections.js';
import { extractQuickStart } from './analyzer/quickstart.js';
import { calculateHealthScore } from './analyzer/health.js';
import { lintMarkdown } from './linter/index.js';

/**
 * Converts a raw header text string into a URL-safe slug identifier.
 * Strips non-alphanumeric characters, converts whitespace to hyphens, and trims bounding dashes.
 *
 * @param text - The raw header string (e.g., "Getting Started & Quick Setup").
 * @returns Lowercase, URL-safe slug (e.g., "getting-started-quick-setup").
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extracts YAML frontmatter bounded by triple-dashes (`---`) at the start of a document.
 * Returns the parsed key-value metadata object along with the remaining Markdown body.
 *
 * @param content - Raw Markdown document content.
 * @returns An object containing the extracted metadata and the cleaned content.
 */
export function extractFrontmatter(content: string): { metadata: DocMetadata; cleanContent: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { metadata: {}, cleanContent: content };
  }

  const rawYaml = match[1];
  const cleanContent = content.slice(match[0].length);
  const metadata: DocMetadata = {};

  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && val) {
        metadata[key] = val;
      }
    }
  }

  return { metadata, cleanContent };
}

/**
 * Parses Markdown heading elements (# through ######) to build a document outline.
 *
 * @param content - Markdown document text without frontmatter.
 * @returns Array of HeadingItem objects with slug ID, clean display text, and heading depth level.
 */
export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/[#*`~_]/g, '');
      const id = slugify(text);
      headings.push({ id, text, level });
    }
  });

  return headings;
}

/**
 * Divides a document into discrete semantic sections demarcated by heading boundaries.
 * Records the line ranges and text contents for contextual linting and security scanning.
 *
 * @param content - Clean Markdown document text.
 * @returns Array of DocSection objects representing the document tree.
 */
export function extractSections(content: string): DocSection[] {
  const sections: DocSection[] = [];
  const lines = content.split('\n');
  let currentSection: DocSection | null = null;
  let currentLines: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      if (currentSection) {
        currentSection.content = currentLines.join('\n').trim();
        currentSection.endLine = index;
        sections.push(currentSection);
      }

      const level = match[1].length;
      const title = match[2].trim();
      currentSection = {
        id: slugify(title),
        title,
        level,
        content: '',
        startLine: index + 1,
        endLine: index + 1,
      };
      currentLines = [];
    } else if (currentSection) {
      currentLines.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = currentLines.join('\n').trim();
    currentSection.endLine = lines.length;
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Custom strict HTML sanitization schema extending GitHub's default rehype-sanitize rules.
 * Strictly permits safe styling classes, pre-approved badge/image attributes, link rel/target tags,
 * and data attributes for accessible UI components, while stripping scripts, dangerous iframes,
 * event handlers, and unknown protocols.
 */
export const customSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'data-*'],
    a: [...(defaultSchema.attributes?.a || []), 'target', 'rel', 'aria-label'],
    img: [...(defaultSchema.attributes?.img || []), 'src', 'alt', 'title', 'width', 'height', 'loading'],
    table: [...(defaultSchema.attributes?.table || []), 'className'],
    th: [...(defaultSchema.attributes?.th || []), 'align', 'className'],
    td: [...(defaultSchema.attributes?.td || []), 'align', 'className'],
  },
};

/**
 * Executes the unified markdown processing pipeline:
 * 1. remark-parse: Parses Markdown text into an MDAST syntax tree.
 * 2. remark-gfm / remark-math / remark-directive: Expands tables, strikethrough, autolinks, math, and custom directives.
 * 3. remark-rehype: Transforms MDAST to HAST (HTML syntax tree).
 * 4. rehype-raw & rehype-sanitize: Parses embedded HTML and strictly sanitizes it against XSS vectors.
 * 5. rehype-slug & rehype-autolink-headings: Generates stable anchor IDs and clickable heading anchors.
 * 6. rehype-stringify: Serializes HAST into secure, ready-to-render HTML.
 *
 * @param markdown - Raw input Markdown string.
 * @returns Sanitized and formatted HTML output string.
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDirective)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, customSanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify);

  const file = await processor.process(markdown);
  return String(file);
}

/**
 * Analyzes a Markdown document comprehensively, generating:
 * - Outline & Headings tree
 * - Flesch Reading Ease & reading time statistics
 * - Security threats (curl-pipe-bash, plaintext secrets, unpinned actions)
 * - Required documentation section audit
 * - Extracted Quick Start code snippets
 * - Markdown linter rule violations with SARIF report compatibility
 * - Composite 0-100 Health Score rating
 *
 * @param content - Raw Markdown document text.
 * @param filePath - Optional path or filename for SARIF source mapping.
 * @returns Structured AnalysisReport with all audit dimensions.
 */
export function analyzeDocument(content: string, filePath?: string): AnalysisReport {
  const { metadata, cleanContent } = extractFrontmatter(content);
  const headings = extractHeadings(cleanContent);
  const sections = extractSections(cleanContent);
  const readability = calculateReadability(cleanContent);
  const threats = scanSecurityThreats(cleanContent);
  const missingSections = detectMissingSections(cleanContent);
  const quickStart = extractQuickStart(cleanContent);
  const lint = lintMarkdown(cleanContent, { filePath });

  const health = calculateHealthScore({
    headings,
    readability,
    missingSections,
    threats,
    quickStart,
    content: cleanContent,
  });

  return {
    metadata,
    headings,
    sections,
    readability,
    health,
    security: {
      threats,
      passed: threats.filter(t => t.severity === 'critical' || t.severity === 'high').length === 0,
    },
    missingSections,
    quickStart,
    lint,
  };
}
