'use strict';

const { routes, sendText, sendJson } = require('./routes');

// Main request handler: looks up the path, then the method.
function handleRequest(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const route = routes[pathname];
  const isApi = pathname.startsWith('/api/');

  // 404: unknown path
  if (!route) {
    if (isApi) return sendJson(res, 404, { error: 'Not Found' });
    return sendText(res, 404, 'Not Found\n');
  }

  // HEAD is answered like GET; Node omits the body automatically.
  const method = req.method === 'HEAD' && route.GET ? 'GET' : req.method;
  const handler = route[method];

  // 405: known path, unsupported method
  if (!handler) {
    const allowed = Object.keys(route);
    if (allowed.includes('GET')) allowed.push('HEAD');
    const headers = { Allow: allowed.join(', ') };
    if (isApi) return sendJson(res, 405, { error: 'Method Not Allowed' }, headers);
    return sendText(res, 405, 'Method Not Allowed\n', headers);
  }

  try {
    handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendText(res, 500, 'Internal Server Error\n');
    else res.end();
  }
}

module.exports = { handleRequest };
