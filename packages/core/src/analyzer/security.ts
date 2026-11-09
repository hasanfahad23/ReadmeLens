import type { SecurityThreat } from '../types.js';

export function scanSecurityThreats(content: string): SecurityThreat[] {
  const threats: SecurityThreat[] = [];
  const lines = content.split('\n');

  // 1. Check for curl | bash / wget | sh patterns
  const curlBashRegex = /(?:curl|wget)\s+[^\n|;]+?\|\s*(?:bash|sh|zsh|sudo\s+bash|sudo\s+sh)/i;
  const invokeExpressionRegex = /iex\s*\(\s*(?:New-Object|iwr|curl)/i;

  lines.forEach((line, idx) => {
    if (curlBashRegex.test(line)) {
      threats.push({
        id: `threat-curl-bash-${idx + 1}`,
        category: 'curl_bash',
        severity: 'high',
        title: 'Dangerous Remote Script Execution (curl | bash)',
        description: 'Executing remote scripts piped directly to bash/sh bypasses integrity verification and can lead to remote code execution.',
        snippet: line.trim(),
        line: idx + 1,
        remediation: 'Download the script first, verify its hash/checksum or signature, inspect its source, then execute it locally.',
      });
    }

    if (invokeExpressionRegex.test(line)) {
      threats.push({
        id: `threat-iex-${idx + 1}`,
        category: 'curl_bash',
        severity: 'high',
        title: 'PowerShell Invoke-Expression Pipe',
        description: 'Executing web requests directly in PowerShell via IEX can execute untrusted payloads with high privileges.',
        snippet: line.trim(),
        line: idx + 1,
        remediation: 'Save the PowerShell script to a file, inspect it, and execute with execution policy controls.',
      });
    }
  });

  // 2. Base64 payload detection in shell or HTML
  const base64PayloadRegex = /(?:echo\s+['"][A-Za-z0-9+/=]{28,}['"]\s*\|\s*base64\s+-d|powershell.*-e(?:nc|ncodedcommand)?\s+[A-Za-z0-9+/=]{28,})/i;
  lines.forEach((line, idx) => {
    if (base64PayloadRegex.test(line)) {
      threats.push({
        id: `threat-base64-${idx + 1}`,
        category: 'base64_payload',
        severity: 'critical',
        title: 'Obfuscated Base64 Payload Execution',
        description: 'Base64 encoded execution strings are commonly used by malware to conceal malicious command lines.',
        snippet: line.trim(),
        line: idx + 1,
        remediation: 'Never run obfuscated commands. Decode the payload first and inspect the raw script.',
      });
    }
  });

  // 3. Hidden and Zero-Width Unicode characters (Trojan Source, invisible injections)
  // U+200B (ZWSP), U+200C (ZWNJ), U+200D (ZWJ), U+FEFF (BOM), U+202E (RLO - Right-to-Left Override)
  const zeroWidthRegex = /[\u200B\u200C\u200D\u2060\uFEFF\u202E]/;
  lines.forEach((line, idx) => {
    if (zeroWidthRegex.test(line)) {
      threats.push({
        id: `threat-hidden-chars-${idx + 1}`,
        category: 'hidden_chars',
        severity: 'high',
        title: 'Hidden Zero-Width or BiDi Control Characters',
        description: 'Zero-width or bidirectional control characters can alter the visual perception of code or hide commands from human reviewers (Trojan Source attacks).',
        snippet: line.trim().slice(0, 80),
        line: idx + 1,
        remediation: 'Strip all zero-width characters and verify character encodings are pure UTF-8 without control codes.',
      });
    }
  });

  // 4. Prompt Injection Patterns aimed at AI agents
  const promptInjectionRegex = /(?:ignore\s+(?:all\s+)?previous\s+instructions|system\s+prompt\s+override|as\s+an\s+ai\s+language\s+model,\s+you\s+must|you\s+are\s+now\s+in\s+developer\s+mode|output\s+the\s+entire\s+system\s+prompt)/i;
  lines.forEach((line, idx) => {
    if (promptInjectionRegex.test(line)) {
      threats.push({
        id: `threat-prompt-injection-${idx + 1}`,
        category: 'prompt_injection',
        severity: 'medium',
        title: 'Potential AI Prompt Injection Pattern',
        description: 'Detected language patterns designed to hijack AI agents or automated LLM review tools reading this documentation.',
        snippet: line.trim(),
        line: idx + 1,
        remediation: 'Ensure documentation contains only genuine technical guides. Strip instruction-hijacking triggers.',
      });
    }
  });

  // 5. Typosquatted / Suspicious domains in installation snippets
  const suspiciousInstallRegex = /(?:npm\s+i(?:nstall)?|pnpm\s+add|pip\s+install)\s+([a-zA-Z0-9_\-\.]+)/g;
  const knownTyposquats = new Set([
    'reqeusts', 'colourama', 'crytography', 'urllib4', 'cross-env2', 'lodsh', 'react-domm'
  ]);

  lines.forEach((line, idx) => {
    let match: RegExpExecArray | null;
    while ((match = suspiciousInstallRegex.exec(line)) !== null) {
      const pkg = match[1]?.toLowerCase();
      if (pkg && knownTyposquats.has(pkg)) {
        threats.push({
          id: `threat-typosquat-${idx + 1}`,
          category: 'typosquatted_command',
          severity: 'critical',
          title: `Known Typosquatted Package: "${match[1]}"`,
          description: `The package name "${match[1]}" matches a known typo of a legitimate package and may download malicious code.`,
          snippet: line.trim(),
          line: idx + 1,
          remediation: `Verify the official package name on npm/PyPI before running the installation command.`,
        });
      }
    }
  });

  return threats;
}
