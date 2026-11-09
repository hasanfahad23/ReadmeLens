# Architectural and Security Decisions

This record documents design decisions, trade-offs, and conflict resolutions made during the launch-hardening pass of ReadmeLens Pro.

## Decision Log

### 1. Unified Icon Surface via `packages/ui/src/icons`
- **Context**: Direct imports of `lucide-react` across multiple apps/packages can cause inconsistent icon styles, uncontrolled bundle bloating, and redundant SVG definitions.
- **Decision**: All icons must be imported from `@readmelens/ui/icons` only. Stroke width is standardized to 2, colors use `currentColor`, and all decorative icons carry `aria-hidden="true"`.

### 2. Strict Zero-Emoji Policy Outside Fixtures
- **Context**: Decorator emojis and pictographs in source code and UI add visual noise, render inconsistently across operating systems, and complicate screen reader output.
- **Decision**: Emojis are strictly prohibited in user-facing copy, code, docs, and git commits. Emojis are only permitted in isolated test fixtures (`tests/fixtures/unicode/`) for verifying unicode handling. Enforced via `scripts/check-no-emoji.mjs`.

### 3. Absolute Disallow of Indexing Dynamic User Content
- **Context**: Serving user-specified markdown from arbitrary URLs or repositories creates risk of malicious phishing, spam hosting, or search engine poisoning if indexed under the product's primary domain.
- **Decision**: Dynamic viewer routes (`/view`, `/r/`, `/api/`) send `X-Robots-Tag: noindex, nofollow` and `<meta name="robots" content="noindex, nofollow">`. Only canonical, static marketing and documentation pages are included in `sitemap.xml`.

### 4. Fetch Proxy and SSRF Protection Architecture
- **Context**: `/api/fetch` can be targeted to probe cloud metadata services (`169.254.169.254`), private RFC1918 subnets, or localhost.
- **Decision**: The fetch proxy validates target URLs against strict protocol allowlists (HTTPS only in production), blocks private/loopback/link-local IPv4 and IPv6 subnets, caps payload streaming at 5 MB, limits redirects to 3 hops, and strips inbound auth/cookie headers.
