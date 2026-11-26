'use strict';

// Keeps the Lecture 1 contract: a known path called with an unsupported method
// answers 405 with an Allow header (Express on its own would answer 404).
// Attach it last with .all() on a route, so it only runs when no method handler matched.
function methodNotAllowed(allowed) {
  const allow = allowed.join(', ');
  return (req, res) => {
    res.set('Allow', allow).status(405);
    if (req.originalUrl.startsWith('/api/')) return res.json({ error: 'Method Not Allowed' });
    return res.type('text').send('Method Not Allowed\n');
  };
}

module.exports = methodNotAllowed;
