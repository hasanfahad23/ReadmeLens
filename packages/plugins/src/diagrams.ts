import type { DiagramBlock } from './types.js';

export function extractDiagramBlocks(content: string): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  const regex = /```(mermaid|plantuml|graphviz|d2|vegalite)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      engine: match[1] as DiagramBlock['engine'],
      source: match[2]?.trim() || '',
    });
  }

  return blocks;
}

export function transformDiagramsForRendering(content: string): string {
  return content.replace(
    /```(mermaid|plantuml|graphviz|d2|vegalite)\n([\s\S]*?)```/g,
    (_, engine: string, source: string) => {
      const cleanSource = encodeURIComponent(source.trim());
      return `<div class="readmelens-diagram my-6 rounded-xl border border-slate-700/80 bg-slate-950 p-4 shadow-sm" data-diagram-engine="${engine}" data-diagram-source="${cleanSource}">
  <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
    <span>Diagram: ${engine.toUpperCase()}</span>
    <button class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition" data-action="export-svg">Export SVG</button>
  </div>
  <div class="diagram-preview font-mono text-xs text-slate-400 overflow-x-auto">${source.trim()}</div>
</div>`;
    }
  );
}
