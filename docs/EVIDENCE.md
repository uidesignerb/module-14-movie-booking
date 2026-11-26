# Verification evidence

This file records the commands that were run and the results they actually produced, lecture by lecture. It's the source for the final report.

## Lecture 1: plain Node.js HTTP server (2026-11-26)

**Environment:** a Linux cloud workspace (Claude Code), Node.js v22.23.5, npm 10.9.9, git 2.43.0, curl 8.5.0. The workspace has no browser preview.

### Install

```
$ npm install
up to date, audited 1 package in 220ms
found 0 vulnerabilities
```

No dependencies. `package-lock.json` was generated (lockfileVersion 3).

### Automated check (`npm run verify`)

```
PASS  GET    /                    -> 200 | text/plain; charset=utf-8
PASS  GET    /demo                -> 200 | text/html; charset=utf-8
PASS  GET    /api/health          -> 200 | application/json; charset=utf-8
PASS  GET    /does-not-exist      -> 404 | text/plain; charset=utf-8
PASS  GET    /api/does-not-exist  -> 404 | application/json; charset=utf-8
PASS  POST   /api/health          -> 405 | application/json; charset=utf-8 | Allow: GET, HEAD
PASS  DELETE /                    -> 405 | text/plain; charset=utf-8 | Allow: GET, HEAD

All 7 checks passed
```

### Manual check (`npm start` on port 8080, then curl)

```
Server running at http://localhost:8080

$ curl -i http://localhost:8080/
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Hello from the movie booking server!

$ curl -i http://localhost:8080/demo
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
<!DOCTYPE html> ... <h1>Demo page</h1> ...

$ curl -i http://localhost:8080/api/health
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
{"status":"ok"}

$ curl -i http://localhost:8080/nope
HTTP/1.1 404 Not Found
Content-Type: text/plain; charset=utf-8
Not Found

$ curl -i -X POST http://localhost:8080/api/health
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json; charset=utf-8
Allow: GET, HEAD
{"error":"Method Not Allowed"}
```

Extra checks:

- `curl -I /api/health` returned 200 with headers and no body (HEAD).
- `PORT=3000 node src/server.js` returned 200 on port 3000.

### Not verified

- The Chrome DevTools walkthrough. The workspace has no visible browser, so the README gives the steps for running it on your own computer.

### Decisions

- HEAD is accepted wherever GET is, so the 405 response sends `Allow: GET, HEAD`.
- Errors under `/api/*` are JSON. Errors on other paths are plain text.
- Routes are kept in a table (`src/routes.js`) and kept apart from the request handler (`src/app.js`) and the server start-up code (`src/server.js`), so that moving to Express in a later lecture stays a small change.
- The file system exercises from the lecture were learning demos, so they aren't part of the app.
