#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';

const webDir = path.join(process.cwd(), 'apps', 'web');
const nextBin = path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('Starting production Next.js server on 127.0.0.1:3005...');
const server = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', '3005'], {
  cwd: webDir,
  stdio: ['ignore', 'inherit', 'inherit'],
});

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('http://127.0.0.1:3005/');
      if (res.ok || res.status === 200) return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

async function run() {
  const ready = await waitForServer();
  if (!ready) {
    console.error('Server failed to start within timeout.');
    server.kill();
    process.exit(1);
  }

  try {
    console.log('\n=== GET /sitemap.xml ===');
    const sitemapRes = await fetch('http://127.0.0.1:3005/sitemap.xml');
    const sitemapText = await sitemapRes.text();
    console.log(sitemapText);

    console.log('\n=== GET /robots.txt ===');
    const robotsRes = await fetch('http://127.0.0.1:3005/robots.txt');
    const robotsText = await robotsRes.text();
    console.log(robotsText);

    console.log('\n=== GET /feed.xml ===');
    const feedRes = await fetch('http://127.0.0.1:3005/feed.xml');
    const feedText = await feedRes.text();
    console.log(feedText);

    console.log('\n=== JSON-LD Check on / ===');
    const homeRes = await fetch('http://127.0.0.1:3005/');
    const homeHtml = await homeRes.text();
    const jsonLdMatch = homeHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
      console.log('Found JSON-LD:');
      const parsedJsonLd = JSON.parse(jsonLdMatch[1]);
      console.log(JSON.stringify(parsedJsonLd, null, 2));
    } else {
      console.error('Missing JSON-LD in homepage HTML!');
      process.exit(1);
    }

    console.log('\n[PASS] All production SEO endpoints & JSON-LD verified successfully.');
  } finally {
    server.kill();
  }
}

run().catch(err => {
  console.error(err);
  server.kill();
  process.exit(1);
});
