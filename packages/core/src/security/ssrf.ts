/**
 * Options configuring secure upstream fetching constraints.
 */
export interface SafeFetchOptions {
  /** Maximum allowable response body payload in bytes. Defaults to 5 MB. */
  maxSizeBytes?: number;
  /** Request timeout window in milliseconds. Defaults to 8,000 ms. */
  timeoutMs?: number;
  /** Maximum number of allowable redirect hops before failing. Defaults to 3. */
  maxRedirects?: number;
  /** Permits unencrypted HTTP schemes for testing environments. Defaults to false in production. */
  allowHttpForTest?: boolean;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_TIMEOUT = 8000; // 8 seconds
const DEFAULT_MAX_REDIRECTS = 3;

/**
 * Checks whether an IP address belongs to a private, loopback, link-local,
 * cloud metadata (e.g., 169.254.169.254), or reserved subnet.
 *
 * Covers IPv4 RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16),
 * loopback (127.0.0.0/8), CGNAT (100.64.0.0/10), link-local (169.254.0.0/16),
 * and IPv6 equivalents (::1, fe80::/10, fc00::/7, IPv4-mapped IPv6).
 *
 * @param ip - String representation of an IP address.
 * @returns True if the IP is internal, reserved, or prohibited; false otherwise.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // Normalize IPv4-mapped IPv6
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  // IPv4 checks
  const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [b0, b1] = [parseInt(ipv4Match[1], 10), parseInt(ipv4Match[2], 10)];

    if (b0 === 0) return true; // 0.0.0.0/8
    if (b0 === 127) return true; // 127.0.0.0/8 loopback
    if (b0 === 10) return true; // 10.0.0.0/8 private
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true; // 172.16.0.0/12 private
    if (b0 === 192 && b1 === 168) return true; // 192.168.0.0/16 private
    if (b0 === 169 && b1 === 254) return true; // 169.254.0.0/16 link-local / cloud metadata
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true; // 100.64.0.0/10 CGNAT
    if (b0 >= 224 && b0 <= 239) return true; // Multicast
    if (b0 >= 240) return true; // Reserved
    return false;
  }

  // IPv6 checks
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // Link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local (fc00::/7)

  return false;
}

/**
 * Validates a target URL against SSRF (Server-Side Request Forgery) attacks.
 * Verifies scheme (HTTPS-only unless in non-production test mode), ensures valid hostname,
 * and rejects loopback, RFC 1918 subnets, and cloud instance metadata addresses.
 *
 * @param rawUrl - Target URL string to inspect.
 * @param allowHttpForTest - Whether HTTP is allowed (for local integration testing only).
 * @returns Parsed URL instance if validation passes.
 * @throws Error if the URL is invalid or targets a forbidden address.
 */
export function validateTargetUrl(rawUrl: string, allowHttpForTest = false): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsed.protocol !== 'https:' && (!allowHttpForTest || parsed.protocol !== 'http:')) {
    throw new Error('Invalid URL protocol. Only HTTPS URLs are permitted.');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard loopback hostnames
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === 'metadata.google.internal') {
    if (!allowHttpForTest) {
      throw new Error('Target hostname resolves to a restricted local or internal address.');
    }
  }

  // Check if hostname is a raw IP literal
  if (isPrivateOrReservedIp(hostname)) {
    throw new Error(`SSRF blocked: IP address "${hostname}" is within a private, loopback, or cloud-metadata range.`);
  }

  return parsed;
}

/**
 * Performs a network fetch guarded against SSRF, infinite redirect loops, slowloris attacks,
 * and memory exhaustion.
 *
 * Security mechanisms:
 * - SSRF verification at origin and across every redirect hop (manual redirect mode).
 * - Hard streaming response byte cap (default 5 MB) preventing memory saturation.
 * - Enforced request timeout via AbortController.
 * - Sanitized request headers and custom User-Agent.
 *
 * @param targetUrl - Upstream URL to fetch.
 * @param options - Configurable timeout, byte cap, and redirect limits.
 * @returns Object containing the fetched decoded text and content type.
 */
export async function safeFetchWithCap(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<{ text: string; contentType: string | null }> {
  const maxSize = options.maxSizeBytes || DEFAULT_MAX_SIZE;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT;
  const maxRedirects = options.maxRedirects || DEFAULT_MAX_REDIRECTS;
  const allowHttp = options.allowHttpForTest || process.env.NODE_ENV !== 'production';

  let currentUrl = targetUrl;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    validateTargetUrl(currentUrl, allowHttp);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: 'manual', // handle redirects explicitly to validate each hop
        headers: {
          'User-Agent': 'ReadmeLens-Pro/1.0.0 (+https://readmelens.dev)',
          Accept: 'text/markdown, text/plain, text/x-rst, application/json;q=0.9, */*;q=0.5',
        },
      });

      // Handle redirect
      if ([301, 302, 307, 308].includes(res.status)) {
        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          throw new Error(`Too many redirects (capped at ${maxRedirects} hops)`);
        }
        const location = res.headers.get('location');
        if (!location) {
          throw new Error('Redirect response missing location header');
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      if (!res.ok) {
        throw new Error(`Upstream request failed with status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');

      // Stream response with hard size cap
      const body = res.body;
      if (!body) {
        return { text: '', contentType };
      }

      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > maxSize) {
            reader.cancel();
            throw new Error(`Response exceeded maximum allowed size of ${maxSize / (1024 * 1024)} MB`);
          }
          chunks.push(value);
        }
      }

      const decoder = new TextDecoder('utf-8');
      const text = chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('') + decoder.decode();

      return { text, contentType };
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`Redirect chain exceeded limit of ${maxRedirects} hops`);
}
