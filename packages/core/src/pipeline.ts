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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

// Custom strict sanitization schema allowing safe elements, attributes, badges & directives
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
