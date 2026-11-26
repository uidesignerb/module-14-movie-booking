'use strict';

// Router-level middleware (registered with router.use in src/routes/movies.js).
// It runs only for requests that reach the movies router (/api/movies...),
// after the application-level middleware and before the movie handlers.
function moviesRouterLogger(req, res, next) {
  // Inside a router, req.url is relative to the mount path; req.originalUrl is the full URL.
  console.log(`[movies router] ${req.method} ${req.url} (full URL: ${req.originalUrl})`);
  (req.middlewareTrace ||= []).push('router:moviesRouterLogger');
  next();
}

module.exports = moviesRouterLogger;
