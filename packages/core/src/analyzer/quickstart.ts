import type { QuickStartData } from '../types.js';

export function extractQuickStart(content: string): QuickStartData {
  const packageManagers: QuickStartData['packageManagers'] = {};
  const envVariables: QuickStartData['envVariables'] = [];
  const scripts: QuickStartData['scripts'] = [];
  const portsSet = new Set<number>();
  const requirementsSet = new Set<string>();

  // Extract code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = codeBlockRegex.exec(content)) !== null) {
    const lang = blockMatch[1]?.toLowerCase() || '';
    const code = blockMatch[2] || '';

    // Check package manager commands
    if (['sh', 'bash', 'shell', 'zsh', 'terminal', ''].includes(lang)) {
      const pnpmMatch = code.match(/pnpm\s+(?:add|i|install)\s+([^\n]+)/);
      if (pnpmMatch && !packageManagers.pnpm) packageManagers.pnpm = pnpmMatch[0].trim();

      const npmMatch = code.match(/npm\s+(?:install|i)\s+([^\n]+)/);
      if (npmMatch && !packageManagers.npm) packageManagers.npm = npmMatch[0].trim();

      const yarnMatch = code.match(/yarn\s+add\s+([^\n]+)/);
      if (yarnMatch && !packageManagers.yarn) packageManagers.yarn = yarnMatch[0].trim();

      const bunMatch = code.match(/bun\s+add\s+([^\n]+)/);
      if (bunMatch && !packageManagers.bun) packageManagers.bun = bunMatch[0].trim();

      const cargoMatch = code.match(/cargo\s+add\s+([^\n]+)/);
      if (cargoMatch && !packageManagers.cargo) packageManagers.cargo = cargoMatch[0].trim();

      const pipMatch = code.match(/pip\s+install\s+([^\n]+)/);
      if (pipMatch && !packageManagers.pip) packageManagers.pip = pipMatch[0].trim();

      const goMatch = code.match(/go\s+get\s+([^\n]+)/);
      if (goMatch && !packageManagers.go) packageManagers.go = goMatch[0].trim();

      const dockerMatch = code.match(/docker\s+(?:run|build|compose)[^\n]+/);
      if (dockerMatch && !packageManagers.docker) packageManagers.docker = dockerMatch[0].trim();

      // Common run scripts
      const runMatches = code.matchAll(/(?:pnpm|npm\s+run|yarn|bun\s+run)\s+([a-zA-Z0-9_\-:]+)/g);
      for (const m of runMatches) {
        if (m[1]) {
          scripts.push({
            name: m[1],
            command: m[0],
          });
        }
      }
    }

    // Extract env vars from env, bash, or config blocks
    const envVarMatches = code.matchAll(/^([A-Z0-9_]{3,})\s*=\s*(.*)$/gm);
    for (const em of envVarMatches) {
      if (em[1] && !envVariables.some(e => e.name === em[1])) {
        envVariables.push({
          name: em[1],
          defaultValue: em[2]?.trim(),
        });
      }
    }

    // Check for common port mentions: localhost:3000, 127.0.0.1:8080, PORT=8000
    const portMatches = code.matchAll(/(?:localhost:|PORT\s*=\s*|:\s*)(\b[1-9][0-9]{2,4}\b)/g);
    for (const pm of portMatches) {
      const port = parseInt(pm[1], 10);
      if (port >= 80 && port <= 65535) {
        portsSet.add(port);
      }
    }
  }

  // Detect requirements like Node.js, Python, Go, Docker
  const reqMatches = content.matchAll(/(Node(?:\.js)?\s*(?:>=?|>)?\s*v?\d+|Python\s*(?:>=?|>)?\s*\d+(?:\.\d+)?|Docker\s*(?:>=?|>)?\s*\d+|Go\s*(?:>=?|>)?\s*\d+(?:\.\d+)?)/gi);
  for (const rm of reqMatches) {
    requirementsSet.add(rm[0].trim());
  }

  // Deduplicate scripts by name
  const uniqueScripts = Array.from(
    new Map(scripts.map(s => [s.name, s])).values()
  );

  return {
    packageManagers,
    envVariables,
    scripts: uniqueScripts,
    ports: Array.from(portsSet),
    requirements: Array.from(requirementsSet),
  };
}
