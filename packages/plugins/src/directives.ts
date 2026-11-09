import type { DirectiveBlock, DirectiveType } from './types.js';

export function parseDirectives(content: string): DirectiveBlock[] {
  const blocks: DirectiveBlock[] = [];
  const regex = /:::(tip|warning|note|caution|important|tabs|steps|cards|accordion)(?:\[(.*?)\])?\n([\s\S]*?):::/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      type: match[1] as DirectiveType,
      title: match[2]?.trim(),
      content: match[3]?.trim() || '',
    });
  }

  return blocks;
}

export function transformDirectivesToHtml(content: string): string {
  return content.replace(
    /:::(tip|warning|note|caution|important|tabs|steps|cards|accordion)(?:\[(.*?)\])?\n([\s\S]*?):::/g,
    (_, type: string, rawTitle?: string, body?: string) => {
      const title = rawTitle?.trim() || type.toUpperCase();
      const inner = (body || '').trim();

      const bgMap: Record<string, string> = {
        tip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        note: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        caution: 'border-red-500/40 bg-red-500/10 text-red-300',
        important: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
        tabs: 'border-slate-700 bg-slate-900/60 text-slate-200',
        steps: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
        cards: 'border-slate-700 bg-slate-800/40 text-slate-200',
        accordion: 'border-slate-700 bg-slate-900/40 text-slate-200',
      };

      const classes = bgMap[type] || 'border-slate-700 bg-slate-900 text-slate-200';

      return `<div class="readmelens-directive my-4 rounded-xl border p-4 ${classes}" data-directive="${type}">
  <div class="mb-2 font-semibold tracking-wide flex items-center gap-2">
    <span>${title}</span>
  </div>
  <div class="prose-content text-sm leading-relaxed">${inner}</div>
</div>`;
    }
  );
}
