'use strict';

// Smoke test for the Lecture 1 routes. No dependencies: uses node:child_process and global fetch.
// Starts the server on a spare port, checks each route, prints results, then stops the server.

const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = process.env.VERIFY_PORT || '8099';
const BASE = `http://localhost:${PORT}`;

const checks = [
  { method: 'GET', path: '/', status: 200, type: 'text/plain', body: 'Hello' },
  { method: 'GET', path: '/demo', status: 200, type: 'text/html', body: '<h1>' },
  { method: 'GET', path: '/api/health', status: 200, type: 'application/json', json: { status: 'ok' } },
  { method: 'GET', path: '/does-not-exist', status: 404, type: 'text/plain' },
  { method: 'GET', path: '/api/does-not-exist', status: 404, type: 'application/json' },
  { method: 'POST', path: '/api/health', status: 405, type: 'application/json', allow: 'GET, HEAD' },
  { method: 'DELETE', path: '/', status: 405, type: 'text/plain', allow: 'GET, HEAD' },
];

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { await fetch(`${BASE}/api/health`); return; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
  throw new Error('Server did not start');
}

async function main() {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], {
    env: { ...process.env, PORT },
    stdio: 'inherit',
  });
  let failed = 0;
  try {
    await waitForServer();
    for (const c of checks) {
      const res = await fetch(BASE + c.path, { method: c.method });
      const text = await res.text();
      const type = res.headers.get('content-type') || '';
      const problems = [];
      if (res.status !== c.status) problems.push(`status ${res.status}`);
      if (!type.startsWith(c.type)) problems.push(`content-type ${type}`);
      if (c.allow && res.headers.get('allow') !== c.allow) problems.push(`allow ${res.headers.get('allow')}`);
      if (c.body && !text.includes(c.body)) problems.push('body mismatch');
      if (c.json && JSON.stringify(JSON.parse(text)) !== JSON.stringify(c.json)) problems.push('json mismatch');
      const ok = problems.length === 0;
      if (!ok) failed++;
      const allow = res.headers.get('allow') ? ` | Allow: ${res.headers.get('allow')}` : '';
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.method.padEnd(6)} ${c.path.padEnd(20)} -> ${res.status} | ${type}${allow}${ok ? '' : '  (' + problems.join(', ') + ')'}`);
    }
  } finally {
    server.kill();
  }
  console.log(failed ? `\n${failed} check(s) failed` : `\nAll ${checks.length} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch(err => { console.error(err); process.exitCode = 1; });
