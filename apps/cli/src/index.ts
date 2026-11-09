#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'node:fs';
import pc from 'picocolors';
import {
  analyzeDocument,
  lintMarkdown,
  formatSarif,
  renderMarkdownToHtml,
} from '@readmelens/core';
import { defaultProviderRegistry } from '@readmelens/providers';

const program = new Command();

/**
 * Command-Line Interface for ReadmeLens Pro.
 * Provides terminal workflows for developers and CI/CD pipelines:
 * - `score`: Analyzes health score, readability, and security threats with terminal or JSON output.
 * - `lint`: Scans markdown rules with SARIF output support for GitHub Code Scanning integration.
 * - `export`: Compiles Markdown into standalone HTML or JSON analysis reports.
 */
program
  .name('readmelens')
  .description('ReadmeLens Pro CLI: View, analyze, score, lint, and export READMEs')
  .version('1.0.0');

// Command: score
program
  .command('score [target]')
  .description('Calculate documentation health score (0-100) and security audit')
  .option('--json', 'Output results as JSON')
  .action(async (target = 'README.md', options) => {
    try {
      let content = '';
      if (fs.existsSync(target)) {
        content = fs.readFileSync(target, 'utf-8');
      } else {
        const fetched = await defaultProviderRegistry.fetch(target);
        content = fetched.content;
      }

      const report = analyzeDocument(content, target);

      if (options.json) {
        console.log(JSON.stringify(report.health, null, 2));
        return;
      }

      console.log(pc.bold(pc.cyan('\nReadmeLens Pro -- Documentation Health Report\n')));
      console.log(`Target: ${pc.bold(target)}`);
      
      const scoreColor = report.health.score >= 85 ? pc.green : report.health.score >= 70 ? pc.yellow : pc.red;
      console.log(`Score:  ${scoreColor(pc.bold(`${report.health.score}/100`))} (Grade: ${report.health.grade})\n`);

      console.log(pc.bold('Breakdown:'));
      console.log(`  - Structure:          ${report.health.breakdown.structure}/15`);
      console.log(`  - Completeness:       ${report.health.breakdown.completeness}/20`);
      console.log(`  - Readability:        ${report.health.breakdown.readability}/15`);
      console.log(`  - Accessibility:      ${report.health.breakdown.accessibility}/15`);
      console.log(`  - Security:           ${report.health.breakdown.security}/15`);
      console.log(`  - Onboarding Quality: ${report.health.breakdown.onboardingQuality}/20\n`);

      if (report.security.threats.length > 0) {
        console.log(pc.bold(pc.red('Security Threats Detected:')));
        for (const threat of report.security.threats) {
          console.log(`  [${threat.severity.toUpperCase()}] ${threat.title} (line ${threat.line || '?'})`);
          console.log(`    Snippet: ${threat.snippet || ''}`);
          console.log(`    Fix:     ${threat.remediation}\n`);
        }
      } else {
        console.log(pc.green('[PASS] Security check: No high-risk scripts or obfuscated commands.'));
      }

      if (report.health.improvements.length > 0) {
        console.log(pc.bold(pc.yellow('\nSuggestions for Improvement:')));
        for (const imp of report.health.improvements) {
          console.log(`  - ${imp}`);
        }
      }
      console.log('');
    } catch (err: any) {
      console.error(pc.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Command: lint
program
  .command('lint [target]')
  .description('Lint README against best practice rules with CI exit codes')
  .option('--sarif', 'Output report in SARIF format for CI/CD')
  .option('--strict', 'Fail on warnings as well as errors')
  .action((target = 'README.md', options) => {
    try {
      if (!fs.existsSync(target)) {
        console.error(pc.red(`File not found: ${target}`));
        process.exit(1);
      }

      const content = fs.readFileSync(target, 'utf-8');
      const result = lintMarkdown(content, { filePath: target });

      if (options.sarif) {
        console.log(JSON.stringify(formatSarif([result]), null, 2));
        if (result.errorCount > 0 || (options.strict && result.warningCount > 0)) {
          process.exit(1);
        }
        return;
      }

      console.log(pc.bold(`\nLinting ${target}...\n`));

      if (result.violations.length === 0) {
        console.log(pc.green('[PASS] Zero lint violations found.'));
        process.exit(0);
      }

      for (const v of result.violations) {
        const color = v.severity === 'error' ? pc.red : v.severity === 'warning' ? pc.yellow : pc.blue;
        console.log(`${color(v.severity.toUpperCase().padEnd(7))} line ${v.line}: ${v.message} [${v.ruleId}]`);
      }

      console.log(`\nFound ${result.errorCount} error(s), ${result.warningCount} warning(s).\n`);

      if (result.errorCount > 0 || (options.strict && result.warningCount > 0)) {
        process.exit(1);
      }
    } catch (err: any) {
      console.error(pc.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Command: export
program
  .command('export [target]')
  .description('Export README to sanitized HTML or cleaned markdown')
  .option('-o, --output <path>', 'Destination output path')
  .option('--format <format>', 'Output format: html or md', 'html')
  .action(async (target = 'README.md', options) => {
    try {
      let content = '';
      if (fs.existsSync(target)) {
        content = fs.readFileSync(target, 'utf-8');
      } else {
        const fetched = await defaultProviderRegistry.fetch(target);
        content = fetched.content;
      }

      let outputData = content;
      if (options.format === 'html') {
        outputData = await renderMarkdownToHtml(content);
      }

      if (options.output) {
        fs.writeFileSync(options.output, outputData, 'utf-8');
        console.log(pc.green(`[OK] Exported to ${options.output}`));
      } else {
        console.log(outputData);
      }
    } catch (err: any) {
      console.error(pc.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
