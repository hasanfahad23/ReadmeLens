/**
 * Pre-compiled regular expressions identifying common API tokens, bearer headers,
 * and secret credential patterns for diagnostic log sanitization.
 */
export const SENSITIVE_PATTERNS = [
  // GitHub tokens (ghp_, ghs_, gho_, ghu_, ghr_)
  /gh[pousr]_[A-Za-z0-9_]{20,255}/g,
  // Bearer / Basic authorization headers
  /(?:Bearer|Basic)\s+([A-Za-z0-9_\-\.+=]+)/gi,
  // Generic API keys like sk_live_..., key-...
  /(?:api[_-]?key|secret|token|password|auth)['"]?\s*[:=]\s*['"]?([A-Za-z0-9_\-\.]{8,})['"]?/gi,
];

/**
 * Sanitizes diagnostic log messages and exception traces by masking high-entropy credentials,
 * GitHub PATs, HTTP Authorization header tokens, and generic API key assignments before
 * writing to telemetry, terminal output, or persistent storage.
 *
 * @param message - Raw log message or stringified error.
 * @returns Scrubbed message with tokens replaced by redact placeholders.
 */
export function redactLogMessage(message: string): string {
  let clean = message;

  // First redact full Bearer/Basic token bodies
  clean = clean.replace(/(Bearer|Basic)\s+[^\s]+/gi, '$1 [REDACTED]');

  // Next redact known token patterns
  clean = clean.replace(/gh[pousr]_[A-Za-z0-9_]{20,255}/g, '[REDACTED_TOKEN]');

  // Next redact key/value pairs
  clean = clean.replace(
    /((?:api[_-]?key|secret|token|password|auth)['"]?\s*[:=]\s*['"]?)([A-Za-z0-9_\-\.]{8,})(['"]?)/gi,
    '$1[REDACTED]$3'
  );

  return clean;
}
