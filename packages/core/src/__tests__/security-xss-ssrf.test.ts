import { describe, it, expect } from 'vitest';
import {
  renderMarkdownToHtml,
  isPrivateOrReservedIp,
  validateTargetUrl,
} from '../index.js';

describe('Pre-Launch Security Audit: XSS Neutralization Corpus', () => {
  const xssPayloads = [
    { name: 'Raw script tag', input: '<script>alert("xss")</script>' },
    { name: 'Inline event handler onerror on img', input: '<img src="x" onerror="alert(1)"/>' },
    { name: 'Inline event handler onload on svg', input: '<svg onload="alert(1)"><circle r="10"/></svg>' },
    { name: 'JavaScript URI in link', input: '[Click](javascript:alert(1))' },
    { name: 'VBScript URI in link', input: '[Click](vbscript:msgbox(1))' },
    { name: 'Data URI in link', input: '[Click](data:text/html,<script>alert(1)</script>)' },
    { name: 'Iframe injection', input: '<iframe src="https://evil.com"></iframe>' },
    { name: 'Base tag hijacking', input: '<base href="https://evil.com"/>' },
    { name: 'Meta refresh injection', input: '<meta http-equiv="refresh" content="0;url=https://evil.com"/>' },
    { name: 'Form action hijacking', input: '<form action="https://evil.com"><input type="submit"/></form>' },
    { name: 'HTML entity obfuscated JS URI', input: '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">Click</a>' },
    { name: 'SVG foreignObject script', input: '<svg><foreignObject><script>alert(1)</script></foreignObject></svg>' },
    { name: 'Srcdoc attribute injection', input: '<iframe srcdoc="<script>alert(1)</script>"></iframe>' },
  ];

  for (const payload of xssPayloads) {
    it(`neutralizes ${payload.name}`, async () => {
      const sanitizedHtml = await renderMarkdownToHtml(payload.input);

      // Must not contain active execution vectors
      expect(sanitizedHtml).not.toMatch(/<script\b/i);
      expect(sanitizedHtml).not.toMatch(/\bon[a-z]+\s*=/i);
      expect(sanitizedHtml).not.toMatch(/href\s*=\s*["']?javascript:/i);
      expect(sanitizedHtml).not.toMatch(/href\s*=\s*["']?data:/i);
      expect(sanitizedHtml).not.toMatch(/href\s*=\s*["']?vbscript:/i);
      expect(sanitizedHtml).not.toMatch(/<iframe\b/i);
      expect(sanitizedHtml).not.toMatch(/<base\b/i);
      expect(sanitizedHtml).not.toMatch(/<meta\b/i);
    });
  }
});

describe('Pre-Launch Security Audit: SSRF and Private IP Blocking', () => {
  const privateIps = [
    '127.0.0.1',       // Loopback
    '127.1.2.3',       // Loopback range
    '10.0.0.1',        // RFC 1918 Class A
    '10.254.0.1',      // RFC 1918 Class A
    '172.16.0.1',      // RFC 1918 Class B lower
    '172.31.255.255',  // RFC 1918 Class B upper
    '192.168.1.1',     // RFC 1918 Class C
    '169.254.169.254', // AWS / GCP / Azure Cloud Metadata
    '169.254.1.1',     // Link-local
    '100.64.0.1',      // Carrier Grade NAT
    '224.0.0.1',       // Multicast
    '::1',             // IPv6 Loopback
    'fe80::1',         // IPv6 Link-local
    'fc00::1',         // IPv6 Unique Local
    'fd12:3456::1',    // IPv6 Unique Local
    '::ffff:127.0.0.1', // IPv4-mapped IPv6 loopback
    '::ffff:169.254.169.254', // IPv4-mapped metadata
  ];

  for (const ip of privateIps) {
    it(`identifies and blocks private/reserved IP: ${ip}`, () => {
      expect(isPrivateOrReservedIp(ip)).toBe(true);
    });
  }

  const publicIps = [
    '8.8.8.8',
    '1.1.1.1',
    '140.82.121.4', // GitHub IP
    '151.101.1.140', // npm CDN
    '2606:4700:4700::1111', // Cloudflare public IPv6
  ];

  for (const ip of publicIps) {
    it(`permits genuine public IP: ${ip}`, () => {
      expect(isPrivateOrReservedIp(ip)).toBe(false);
    });
  }

  it('rejects forbidden URL schemes (file, gopher, ftp, javascript)', () => {
    expect(() => validateTargetUrl('file:///etc/passwd')).toThrow();
    expect(() => validateTargetUrl('gopher://127.0.0.1:70/')).toThrow();
    expect(() => validateTargetUrl('ftp://ftp.example.com/')).toThrow();
    expect(() => validateTargetUrl('javascript:alert(1)')).toThrow();
  });

  it('rejects cloud metadata and loopback hostnames', () => {
    expect(() => validateTargetUrl('https://169.254.169.254/latest/meta-data/')).toThrow(/SSRF blocked/);
    expect(() => validateTargetUrl('https://localhost/admin')).toThrow(/restricted/);
    expect(() => validateTargetUrl('https://metadata.google.internal/computeMetadata/v1/')).toThrow(/restricted/);
  });
});
