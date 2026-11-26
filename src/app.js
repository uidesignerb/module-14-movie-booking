'use strict';

const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const methodNotAllowed = require('./middleware/methodNotAllowed');
const moviesRouter = require('./routes/movies');

const app = express();

// 1. Application-level middleware: runs first, for every request.
app.use(requestLogger);

// 2. Routes defined directly on the app (from Lecture 1, now in Express).
//    res.send() picks the Content-Type itself: a string is sent as text/html and an
//    object as application/json. '/' calls res.type('text') to keep Lecture 1's text/plain.
const demoPage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Demo</title>
  </head>
  <body>
    <h1>Demo page</h1>
    <p>This HTML was sent by an Express server with res.send().</p>
  </body>
</html>
`;

app.route('/')
  .get((req, res) => res.type('text').send('Hello from the movie booking server!\n'))
  .all(methodNotAllowed(['GET', 'HEAD']));

app.route('/demo')
  .get((req, res) => res.send(demoPage))
  .all(methodNotAllowed(['GET', 'HEAD']));

app.route('/api/health')
  .get((req, res) => res.send({ status: 'ok' }))
  .all(methodNotAllowed(['GET', 'HEAD']));

// 3. Router: requests under /api/movies go through the movies router and its own middleware.
app.use('/api/movies', moviesRouter);

// 4. Nothing matched: 404 (JSON under /api/, plain text elsewhere), as in Lecture 1.
app.use((req, res) => {
  res.status(404);
  if (req.originalUrl.startsWith('/api/')) return res.json({ error: 'Not Found' });
  return res.type('text').send('Not Found\n');
});

module.exports = app;
