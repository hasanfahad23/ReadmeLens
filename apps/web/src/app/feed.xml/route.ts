import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/env';

export async function GET() {
  const siteUrl = getSiteUrl();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ReadmeLens Pro Changelog</title>
    <link>${siteUrl}/changelog</link>
    <description>Releases and documentation updates for ReadmeLens Pro</description>
    <language>en-us</language>
    <lastBuildDate>Mon, 09 Nov 2026 00:00:00 GMT</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>ReadmeLens Pro 1.0.0 Release</title>
      <link>${siteUrl}/changelog#1.0.0</link>
      <guid>${siteUrl}/changelog#1.0.0</guid>
      <pubDate>Mon, 09 Nov 2026 00:00:00 GMT</pubDate>
      <description>Launch release of ReadmeLens Pro: AST Markdown pipeline, 0-100 health scoring, security threat scanner, and accessible reading experience.</description>
    </item>
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
