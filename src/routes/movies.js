'use strict';

const express = require('express');
const moviesRouterLogger = require('../middleware/moviesRouterLogger');
const methodNotAllowed = require('../middleware/methodNotAllowed');

// Router for /api/movies. Mounted in src/app.js with app.use('/api/movies', moviesRouter),
// so the paths below are relative: '/' means /api/movies, '/:movieId' means /api/movies/42.
//
// Lecture 2 only introduces the HTTP methods, so these handlers are placeholders:
// they confirm which CRUD action was called. Nothing is stored yet (MongoDB comes later).
const router = express.Router();

// Router-level middleware: runs for every request that reaches this router.
router.use(moviesRouterLogger);

// Final step of the chain: the handler sends the response.
function reply(res, req, status, body) {
  req.middlewareTrace.push('handler');
  res.set('X-Middleware-Trace', req.middlewareTrace.join(' > '));
  res.status(status).json(body);
}

router
  .route('/')
  .get((req, res) => reply(res, req, 200, { message: 'List of movies (placeholder)', movies: [] }))
  .post((req, res) => reply(res, req, 201, { message: 'Movie created (placeholder, nothing is saved yet)' }))
  .all(methodNotAllowed(['GET', 'HEAD', 'POST']));

router
  .route('/:movieId')
  .get((req, res) => reply(res, req, 200, { message: 'One movie (placeholder)', movieId: req.params.movieId }))
  .put((req, res) =>
    reply(res, req, 200, { message: 'Movie replaced (placeholder, PUT)', movieId: req.params.movieId }))
  .patch((req, res) =>
    reply(res, req, 200, { message: 'Movie partly updated (placeholder, PATCH)', movieId: req.params.movieId }))
  .delete((req, res) =>
    reply(res, req, 200, { message: 'Movie deleted (placeholder, DELETE)', movieId: req.params.movieId }))
  .all(methodNotAllowed(['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE']));

module.exports = router;
