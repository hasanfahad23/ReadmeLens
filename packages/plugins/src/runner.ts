import type { CodeRunnerResult } from './types.js';

export interface RunnableCodeBlock {
  language: 'javascript' | 'typescript' | 'python' | 'sql';
  code: string;
}

export function extractRunnableBlocks(content: string): RunnableCodeBlock[] {
  const blocks: RunnableCodeBlock[] = [];
  const regex = /```(javascript|js|typescript|ts|python|py|sql)\s+(?:runnable|eval)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const rawLang = match[1].toLowerCase();
    let language: RunnableCodeBlock['language'] = 'javascript';
    if (['python', 'py'].includes(rawLang)) language = 'python';
    else if (['typescript', 'ts'].includes(rawLang)) language = 'typescript';
    else if (['sql'].includes(rawLang)) language = 'sql';

    blocks.push({
      language,
      code: match[2]?.trim() || '',
    });
  }

  return blocks;
}

export async function executeIsolatedJs(code: string, timeoutMs = 2000): Promise<CodeRunnerResult> {
  const startTime = Date.now();
  try {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      warn: (...args: unknown[]) => logs.push('[warn] ' + args.join(' ')),
      error: (...args: unknown[]) => logs.push('[error] ' + args.join(' ')),
    };

    const runFunc = new Function('console', `"use strict";\n${code}`);
    runFunc(customConsole);

    return {
      output: logs.join('\n'),
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      output: '',
      error: err?.message || String(err),
      executionTimeMs: Date.now() - startTime,
    };
  }
}
