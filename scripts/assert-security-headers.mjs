import { spawn } from 'node:child_process';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, '../apps/web');
const nextBin = path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next');

const PORT = 3008;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

console.log('Starting Next.js production server for security header validation...');

const server = spawn(process.execPath, [nextBin, 'start', '-H', HOST, '-p', String(PORT)], {
  cwd: webDir,
  stdio: ['ignore', 'inherit', 'inherit'],
});

function cleanup() {
  if (server && !server.killed) {
    server.kill();
  }
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });
process.on('SIGTERM', () => { cleanup(); process.exit(1); });

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 200 || res.status === 404) {
        return;
      }
    } catch {
      // server still starting
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server failed to start on ${url} after ${maxAttempts} seconds`);
}

async function run() {
  try {
    await waitForServer(`${BASE_URL}/api/health`);
    console.log('\n[PASS] Server is listening and healthy.');

    // 1. Test root page security headers
    console.log('Testing GET / security headers...');
    const resHome = await fetch(`${BASE_URL}/`);
    assert.strictEqual(resHome.status, 200, 'Home page must return 200');

    // CSP
    const csp = resHome.headers.get('content-security-policy');
    assert.ok(csp, 'Content-Security-Policy header must be present');
    assert.ok(csp.includes('nonce-'), 'CSP must include nonce- dynamic token');
    assert.ok(csp.includes("default-src 'self'"), "CSP must contain default-src 'self'");
    assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must contain frame-ancestors 'none' on root");
    console.log('  [PASS] Content-Security-Policy with nonce validated.');

    // X-Content-Type-Options
    const nosniff = resHome.headers.get('x-content-type-options');
    assert.strictEqual(nosniff, 'nosniff', 'X-Content-Type-Options must be nosniff');
    console.log('  [PASS] X-Content-Type-Options: nosniff validated.');

    // Referrer-Policy
    const referrer = resHome.headers.get('referrer-policy');
    assert.strictEqual(referrer, 'strict-origin-when-cross-origin', 'Referrer-Policy must be strict-origin-when-cross-origin');
    console.log('  [PASS] Referrer-Policy: strict-origin-when-cross-origin validated.');

    // Absence of X-Powered-By
    assert.strictEqual(resHome.headers.get('x-powered-by'), null, 'X-Powered-By header must not be leaked');
    console.log('  [PASS] X-Powered-By header successfully suppressed.');

    // 2. Test /view dynamic route crawler restriction
    console.log('Testing GET /view crawler restrictions...');
    const resView = await fetch(`${BASE_URL}/view`);
    const robotsTag = resView.headers.get('x-robots-tag');
    assert.strictEqual(robotsTag, 'noindex, nofollow', 'X-Robots-Tag on /view must be noindex, nofollow');
    console.log('  [PASS] X-Robots-Tag: noindex, nofollow validated on dynamic doc view.');

    // 3. Test /api/health endpoint
    console.log('Testing GET /api/health...');
    const resHealth = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(resHealth.status, 200, 'Health endpoint must return 200');
    const healthJson = await resHealth.json();
    assert.strictEqual(healthJson.status, 'ok', 'Health response status must be ok');
    console.log('  [PASS] Health API endpoint functional.');

    console.log('\nALL SECURITY HEADER ASSERTIONS PASSED!\n');
    cleanup();
    process.exit(0);
  } catch (err) {
    console.error('\nFAIL: Security header validation failed:', err);
    cleanup();
    process.exit(1);
  }
}

run();
