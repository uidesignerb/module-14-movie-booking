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

## Lecture 2: Express routes and middleware (2026-11-26)

**Environment:** the same Linux cloud workspace, Node.js v22.23.5, npm 10.9.9. No browser preview, so Postman and Thunder Client could not be run here; the same requests were sent with curl.

### Install

```
$ npm install express@4.22.3
found 0 vulnerabilities

$ npm ls
movie-booking-app@0.2.0
`-- express@4.22.3
```

A clean `rm -rf node_modules && npm install` from the lockfile also finished with 0 vulnerabilities.

### Automated check (`npm run verify`)

```
PASS  GET    /                      -> 200 | text/plain; charset=utf-8
PASS  GET    /demo                  -> 200 | text/html; charset=utf-8
PASS  GET    /api/health            -> 200 | application/json; charset=utf-8
PASS  GET    /does-not-exist        -> 404 | text/plain; charset=utf-8
PASS  GET    /api/does-not-exist    -> 404 | application/json; charset=utf-8
PASS  POST   /api/health            -> 405 | application/json; charset=utf-8 | Allow: GET, HEAD
PASS  DELETE /                      -> 405 | text/plain; charset=utf-8 | Allow: GET, HEAD
PASS  GET    /api/movies            -> 200 | application/json; charset=utf-8
PASS  POST   /api/movies            -> 201 | application/json; charset=utf-8
PASS  GET    /api/movies/7          -> 200 | application/json; charset=utf-8
PASS  PUT    /api/movies/7          -> 200 | application/json; charset=utf-8
PASS  PATCH  /api/movies/7          -> 200 | application/json; charset=utf-8
PASS  DELETE /api/movies/7          -> 200 | application/json; charset=utf-8
PASS  DELETE /api/movies            -> 405 | application/json; charset=utf-8 | Allow: GET, HEAD, POST
PASS  POST   /api/movies/7          -> 405 | application/json; charset=utf-8 | Allow: GET, HEAD, PUT, PATCH, DELETE
PASS  GET    /api/movies/7/extra    -> 404 | application/json; charset=utf-8
All 16 checks passed
```

The movies checks also confirm the `X-Middleware-Trace` header is `app:requestLogger > router:moviesRouterLogger > handler`, and that the server's log lines come in the order `[app]` then `[movies router]`. `GET /` prints only the `[app]` line.

### Manual check (`npm start` on port 8080, then curl)

```
$ curl -i http://localhost:8080/
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Hello from the movie booking server!

$ curl -i -X POST http://localhost:8080/api/movies
HTTP/1.1 201 Created
X-Middleware-Trace: app:requestLogger > router:moviesRouterLogger > handler
Content-Type: application/json; charset=utf-8
{"message":"Movie created (placeholder, nothing is saved yet)"}

$ curl -i -X PATCH http://localhost:8080/api/movies/42
HTTP/1.1 200 OK
X-Middleware-Trace: app:requestLogger > router:moviesRouterLogger > handler
Content-Type: application/json; charset=utf-8
{"message":"Movie partly updated (placeholder, PATCH)","movieId":"42"}

$ curl -i -X DELETE http://localhost:8080/api/movies/42
HTTP/1.1 200 OK
X-Middleware-Trace: app:requestLogger > router:moviesRouterLogger > handler
Content-Type: application/json; charset=utf-8
{"message":"Movie deleted (placeholder, DELETE)","movieId":"42"}

$ curl -i -X DELETE http://localhost:8080/api/movies
HTTP/1.1 405 Method Not Allowed
Allow: GET, HEAD, POST
Content-Type: application/json; charset=utf-8
{"error":"Method Not Allowed"}

$ curl -i http://localhost:8080/nope
HTTP/1.1 404 Not Found
Content-Type: text/plain; charset=utf-8
Not Found

$ curl -I http://localhost:8080/api/movies
HTTP/1.1 200 OK
```

Server console for those requests (application-level line first, router-level line second, and no router line for `/` or `/nope`):

```
Server running at http://localhost:8080
[app] 2026-11-26T10:06:06.749Z GET /
[app] 2026-11-26T10:06:06.756Z POST /api/movies
[movies router] POST / (full URL: /api/movies)
[app] 2026-11-26T10:06:06.761Z PATCH /api/movies/42
[movies router] PATCH /42 (full URL: /api/movies/42)
[app] 2026-11-26T10:06:06.766Z DELETE /api/movies/42
[movies router] DELETE /42 (full URL: /api/movies/42)
[app] 2026-11-26T10:06:06.770Z DELETE /api/movies
[movies router] DELETE / (full URL: /api/movies)
[app] 2026-11-26T10:06:06.775Z GET /nope
[app] 2026-11-26T10:06:06.779Z HEAD /api/movies
[movies router] HEAD / (full URL: /api/movies)
```

`docs/postman-collection.json` was checked to be valid JSON (Postman collection v2.1 format).

### Not verified

- Importing and running the collection in Postman or Thunder Client. Neither can run in this workspace; the README gives the steps.

### Requirements taken from the lecture

- Install Express and create the app with `express()`, start it with `app.listen(PORT)`.
- Handle the CRUD methods with `app.get/post/put/patch/delete` (here on a router).
- `res.send()` sets the Content-Type itself (text/html for a string, application/json for an object).
- Status code families: 2xx success, 3xx redirect, 4xx client error (404 for a missing route), 5xx server error.
- Test non-GET methods with Postman or Thunder Client, because the browser address bar only sends GET.
- Application-level middleware with `app.use`, called for every request, in registration order, and `next()` must be called.
- Router-level middleware with `express.Router()` and `router.use`, called only for the router's paths.
- `node_modules/` stays out of Git via `.gitignore`; `npm start` script.

### Class demos not copied into the project

- `/get-user-info`, `/create-new-user`, `/update-user`, `/delete-user` and the `/user` router. The project uses movies instead, because it is a movie booking app.
- The `auth` middleware with `?password=123` in the URL. The instructor said this is the wrong way to send a password; real auth comes with JWT later.
- The query-parameter printing demo and the port-number discussion.
- Error-handling middleware (it did not work in class and was moved to the next class), built-in `express.json()` and third-party middleware, also moved to the next class.

### Decisions and assumptions

- **Express 4, not 5.** The lecture installed 4.18.2. The project uses the latest 4.x (4.22.3). Express 5 changes some routing rules, so moving to it is left for later if the course does.
- **The movies resource and its URLs are an assumption.** The lecture used user endpoints with action names (`/create-new-user`) and said the proper URL convention would be taught with the BookMyShow project. The project uses `/api/movies` and `/api/movies/:movieId`, which matches the `/api/...` style the instructor showed from a real site. `:movieId` is an Express route parameter, which the lecture didn't cover; it was added so that PUT, PATCH and DELETE name the movie they act on. Easy to rename if a later lecture uses other paths.
- **Placeholders only.** Handlers reply with a message, like the class demos. Nothing is stored and the request body is not read (that needs `express.json()`, next class).
- **404 and 405 kept from Lecture 1.** Express answers 404 for a wrong method; the project keeps the Lecture 1 405 + `Allow` header via `.all()` on each route. Unknown `/api/` paths still get a JSON 404.
- **`/` stays `text/plain`.** `res.send()` of a string would make it `text/html`, so `res.type('text')` keeps the Lecture 1 behaviour. `/demo` (HTML) and `/api/health` (JSON) now rely on `res.send()`'s automatic Content-Type.
- **`X-Middleware-Trace` header** on `/api/movies` responses, so the middleware order can be seen in Postman and tested automatically. It shows that middleware can change the request and response objects, as the lecture's definition says.
- No error-handling middleware yet. If a handler threw, Express's own default handler would answer 500.
