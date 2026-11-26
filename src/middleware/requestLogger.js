'use strict';

// Application-level middleware (registered with app.use in src/app.js).
// It runs for EVERY request, before any route or router, then calls next().
function requestLogger(req, res, next) {
  console.log(`[app] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  req.middlewareTrace = ['app:requestLogger'];
  next(); // without next() the request would hang here and never reach a handler
}

module.exports = requestLogger;
