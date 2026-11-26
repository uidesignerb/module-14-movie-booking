'use strict';

// Route table: path -> { METHOD: handler }.
// Each handler receives (req, res) and must end the response.

function sendText(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

function sendHtml(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(data));
}

const demoPage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Demo</title>
  </head>
  <body>
    <h1>Demo page</h1>
    <p>This HTML was sent by a plain Node.js HTTP server.</p>
  </body>
</html>
`;

const routes = {
  '/': {
    GET: (req, res) => sendText(res, 200, 'Hello from the movie booking server!\n'),
  },
  '/demo': {
    GET: (req, res) => sendHtml(res, 200, demoPage),
  },
  '/api/health': {
    GET: (req, res) => sendJson(res, 200, { status: 'ok' }),
  },
};

module.exports = { routes, sendText, sendJson };
