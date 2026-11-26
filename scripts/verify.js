'use strict';

// Smoke test for the server. No extra dependencies: uses node:child_process and global fetch.
// Starts the server on a spare port, checks each route, the middleware order, prints results,
// then stops the server.

const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = process.env.VERIFY_PORT || '8099';
const BASE = `http://localhost:${PORT}`;
const TRACE = 'app:requestLogger > router:moviesRouterLogger > handler';

// logs: the server's console lines printed while handling that request, in order.
const checks = [
  // Lecture 1 routes (behaviour kept)
  { method: 'GET', path: '/', status: 200, type: 'text/plain', body: 'Hello', logs: ['[app]'] },
  { method: 'GET', path: '/demo', status: 200, type: 'text/html', body: '<h1>' },
  { method: 'GET', path: '/api/health', status: 200, type: 'application/json', json: { status: 'ok' } },
  { method: 'GET', path: '/does-not-exist', status: 404, type: 'text/plain' },
  { method: 'GET', path: '/api/does-not-exist', status: 404, type: 'application/json' },
  { method: 'POST', path: '/api/health', status: 405, type: 'application/json', allow: 'GET, HEAD' },
  { method: 'DELETE', path: '/', status: 405, type: 'text/plain', allow: 'GET, HEAD' },
  // Lecture 2: CRUD methods on the movies router
  { method: 'GET', path: '/api/movies', status: 200, type: 'application/json', trace: TRACE,
    logs: ['[app]', '[movies router] GET /'] },
  { method: 'POST', path: '/api/movies', status: 201, type: 'application/json', trace: TRACE,
    logs: ['[app]', '[movies router] POST /'] },
  { method: 'GET', path: '/api/movies/7', status: 200, type: 'application/json', trace: TRACE, body: '"movieId":"7"' },
  { method: 'PUT', path: '/api/movies/7', status: 200, type: 'application/json', trace: TRACE, body: 'PUT' },
  { method: 'PATCH', path: '/api/movies/7', status: 200, type: 'application/json', trace: TRACE, body: 'PATCH' },
  { method: 'DELETE', path: '/api/movies/7', status: 200, type: 'application/json', trace: TRACE,
    logs: ['[app]', '[movies router] DELETE /7'] },
  { method: 'DELETE', path: '/api/movies', status: 405, type: 'application/json', allow: 'GET, HEAD, POST' },
  { method: 'POST', path: '/api/movies/7', status: 405, type: 'application/json', allow: 'GET, HEAD, PUT, PATCH, DELETE' },
  { method: 'GET', path: '/api/movies/7/extra', status: 404, type: 'application/json' },
];

let output = '';

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { await fetch(`${BASE}/api/health`); return; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
  throw new Error('Server did not start');
}

async function main() {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], {
    env: { ...process.env, PORT },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  server.stdout.on('data', d => { output += d; });
  let failed = 0;
  try {
    await waitForServer();
    for (const c of checks) {
      const before = output.length;
      const res = await fetch(BASE + c.path, { method: c.method });
      const text = await res.text();
      await new Promise(r => setTimeout(r, 50)); // let the server's log lines arrive
      const lines = output.slice(before).split('\n').filter(Boolean);
      const type = res.headers.get('content-type') || '';
      const problems = [];
      if (res.status !== c.status) problems.push(`status ${res.status}`);
      if (!type.startsWith(c.type)) problems.push(`content-type ${type}`);
      if (c.allow && res.headers.get('allow') !== c.allow) problems.push(`allow ${res.headers.get('allow')}`);
      if (c.trace && res.headers.get('x-middleware-trace') !== c.trace) problems.push(`trace ${res.headers.get('x-middleware-trace')}`);
      if (c.body && !text.includes(c.body)) problems.push('body mismatch');
      if (c.json && JSON.stringify(JSON.parse(text)) !== JSON.stringify(c.json)) problems.push('json mismatch');
      if (c.logs) {
        const got = lines.map(l => (l.startsWith('[app]') ? '[app]' : l.replace(/ \(full URL.*$/, '')));
        if (JSON.stringify(got) !== JSON.stringify(c.logs)) problems.push(`logs ${JSON.stringify(got)}`);
      }
      const ok = problems.length === 0;
      if (!ok) failed++;
      const extra = res.headers.get('allow') ? ` | Allow: ${res.headers.get('allow')}` : '';
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.method.padEnd(6)} ${c.path.padEnd(22)} -> ${res.status} | ${type}${extra}${ok ? '' : '  (' + problems.join(', ') + ')'}`);
    }
  } finally {
    server.kill();
  }
  console.log(failed ? `\n${failed} check(s) failed` : `\nAll ${checks.length} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch(err => { console.error(err); process.exitCode = 1; });
