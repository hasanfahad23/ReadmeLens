# ReadmeLens Pro — Product Specification

## 0. Product Vision
ReadmeLens Pro is a documentation platform: a README/Markdown viewer, analyzer, editor, and docs-site generator.
- Open any README or doc from anywhere and read it better than on the source site.
- Analyze, score, lint, improve, translate, present, and publish it.
- Work offline, self-hostable, extensible by plugins, usable from browser, CLI, VS Code, and AI agents.

## 1. Monorepo Architecture
- Monorepo (pnpm + Turborepo):
  - apps/web (Next.js 15, App Router, Tailwind CSS, Lucide)
  - apps/cli (readmelens CLI: score, lint, export)
  - packages/core (Unified Markdown AST pipeline, health score engine, linter, security scanner, SARIF generator)
  - packages/providers (Provider adapter interface, GitHub, npm, PyPI, raw URL, local memory)
  - packages/plugins (Directives :::tip/:::tabs/etc., diagrams, isolated JS runner)
  - packages/ui (Design system primitives, health badges, accessible buttons/cards)
  - packages/mcp-server (Model Context Protocol server with fetch_readme, analyze_readme, lint_readme, search_docs)

## 2. Hardening Scope
Per the launch-hardening pass:
- Section 1: Remove AI slop and emojis (script-verified ban, no marketing buzzwords, clean copy)
- Section 2: Unified icons (Lucide-only surface via packages/ui/src/icons, proper strokes, scale, a11y, brand assets)
- Section 3: Sitemap, robots, and SEO (sitemap.ts, robots.ts, noindex for user content, metadataBase, RSS feed, security.txt, error pages)
- Section 4: Security hardening (HTTP security headers, strict rehype-sanitize, SSRF and fetch proxy protections, API rate limiting, WebCrypto token safety, supply chain audit)
- Section 5: Launch readiness (quality gates, Lighthouse, complete states, accessibility, legal/trust pages, Docker, documentation)
