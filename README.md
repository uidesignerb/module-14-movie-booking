# Movie Booking App (Scaler Module 14)

An original movie ticket booking app inspired by BookMyShow, built step by step, one lecture at a time.

## Current milestone: Lecture 2, Express routes and middleware

The server now uses **Express 4** (`express@^4.22.3`, the same major version used in the lecture) instead of the plain `node:http` module. The Lecture 1 routes still work the same way, and Lecture 2 adds:

- `app.listen(PORT)` to start the server (port 8080 by default, or `PORT`).
- `res.send()`, which sets the `Content-Type` by itself: HTML for a string, JSON for an object.
- A **movies router** at `/api/movies` with one placeholder handler for each HTTP method (GET, POST, PUT, PATCH, DELETE). Nothing is saved yet; the database comes in a later lecture.
- **Application-level middleware** (a request logger for every request) and **router-level middleware** (a logger that runs only for `/api/movies` requests).

## Prerequisite

- **Node.js 18 or newer** (npm comes with it). Download it from https://nodejs.org (the LTS version is fine).
- Tested with Node.js v22.23.5 and npm 10.9.9.

Check what you have:

```bash
node --version
npm --version
```

## Where to open the terminal

Open the terminal **in this project folder**, the `movie-booking-app/` folder that contains `package.json`.

- **VS Code:** File → Open Folder → choose `movie-booking-app`, then Terminal → New Terminal. It opens in the right folder.
- **Any other terminal:** `cd path/to/movie-booking-app`

## Install

```bash
npm install
```

This installs Express (the only dependency) into `node_modules/`, using the versions locked in `package-lock.json`. `node_modules/` is listed in `.gitignore`, so it is never committed: after cloning, always run `npm install` first.

## Start the server

```bash
npm start
```

You should see:

```
Server running at http://localhost:8080
```

The server uses port **8080** by default. To use another port:

```bash
PORT=3000 npm start            # macOS / Linux / Git Bash
$env:PORT=3000; npm start      # Windows PowerShell
```

Stop the server with `Ctrl+C`.

## Endpoints

| Method | URL | Expected response |
|---|---|---|
| GET | http://localhost:8080/ | 200, plain-text greeting (`text/plain`) |
| GET | http://localhost:8080/demo | 200, small HTML page (`text/html`) |
| GET | http://localhost:8080/api/health | 200, `{"status":"ok"}` (`application/json`) |
| GET | http://localhost:8080/api/movies | 200, list of movies (placeholder, empty) |
| POST | http://localhost:8080/api/movies | 201, "Movie created" (placeholder) |
| GET | http://localhost:8080/api/movies/42 | 200, one movie (placeholder) |
| PUT | http://localhost:8080/api/movies/42 | 200, "Movie replaced" (placeholder) |
| PATCH | http://localhost:8080/api/movies/42 | 200, "Movie partly updated" (placeholder) |
| DELETE | http://localhost:8080/api/movies/42 | 200, "Movie deleted" (placeholder) |

Every `/api/movies` response has an `X-Middleware-Trace` header that shows the order the request went through, for example `app:requestLogger > router:moviesRouterLogger > handler`.

Error behaviour (kept from Lecture 1):

- Any other path returns **404**. Paths under `/api/` return a JSON error, and other paths return plain text.
- A known path called with a method it doesn't support returns **405** with an `Allow` header, for example `DELETE /api/movies` returns `Allow: GET, HEAD, POST`. (Express on its own would answer 404 here, as the lecture showed. The project keeps the more precise 405 from Lecture 1.)

## Try it in Postman or Thunder Client

A browser address bar can only send GET requests, so use an API client for POST, PUT, PATCH and DELETE.

**Quickest way: import the collection.** [`docs/postman-collection.json`](docs/postman-collection.json) contains every request above.

- **Postman** (desktop app or the VS Code extension): Import → Upload Files → choose `docs/postman-collection.json`.
- **Thunder Client** (VS Code extension): Collections → menu (☰) → Import → choose the same file.

The collection uses a variable `baseUrl` = `http://localhost:8080`. Change it if you start the server on another port.

**By hand:** create a new request, choose the method, and type the URL.

| Try this | Method | URL | Look for |
|---|---|---|---|
| Create a movie | POST | `http://localhost:8080/api/movies` | Status `201 Created` |
| Update part of a movie | PATCH | `http://localhost:8080/api/movies/42` | `"movieId": "42"` in the body |
| Delete a movie | DELETE | `http://localhost:8080/api/movies/42` | Status `200 OK` |
| Wrong method | DELETE | `http://localhost:8080/api/movies` | Status `405`, header `Allow: GET, HEAD, POST` |
| Unknown route | GET | `http://localhost:8080/api/shows` | Status `404`, `{"error":"Not Found"}` |

Open the **Headers** tab of the response to see `Content-Type` and `X-Middleware-Trace`. Then look at the terminal running `npm start`: each request prints an `[app]` line, and `/api/movies` requests also print a `[movies router]` line right after it.

The POST, PUT and PATCH requests in the collection include a sample JSON body. The server doesn't read the body yet (reading `req.body` needs the built-in `express.json()` middleware, which the lecture moved to the next class), so the reply is the same with or without it.

The same requests from a terminal:

```bash
curl -i -X POST   http://localhost:8080/api/movies
curl -i -X PATCH  http://localhost:8080/api/movies/42
curl -i -X DELETE http://localhost:8080/api/movies
```

## How a request flows through the middleware

```
request
  │
  ▼
app.use(requestLogger)          application-level: runs for EVERY request, then next()
  │
  ├── '/', '/demo', '/api/health' → handler on the app → response
  │
  ├── '/api/movies...' → app.use('/api/movies', moviesRouter)
  │        │
  │        ▼
  │   router.use(moviesRouterLogger)   router-level: only for /api/movies, then next()
  │        │
  │        ▼
  │   router.get/post/put/patch/delete handler → response
  │
  └── nothing matched → 404 handler
```

Middleware runs in the order it is registered. Each middleware either ends the request by sending a response, or calls `next()` to pass it to the next one. If it does neither, the request hangs (the lecture showed this with the logger before `next()` was added).

## Automated check

```bash
npm run verify
```

This starts the server on port 8099 and runs 16 checks: the three Lecture 1 routes, each movies method, 404s and 405s (status code, `Content-Type` and `Allow`), the `X-Middleware-Trace` order, and the order of the log lines the server prints. It prints PASS or FAIL for each check, and stops the server.

## Inspect the status code and headers in Chrome DevTools

1. Start the server and open one of the URLs above in Chrome.
2. Press `F12` (or `Ctrl+Shift+I`, or `Cmd+Option+I` on a Mac) and open the **Network** tab.
3. Reload the page (`Ctrl+R` or `Cmd+R`) so the request is captured.
4. Click the request in the list. The **Headers** tab shows the **Status Code** (for example `200 OK`) and the **Response Headers**, such as `Content-Type`.

Requests made from the browser address bar are always GET. To see a 405 from the browser, run this in the DevTools **Console**, then look at the new request in the Network tab:

```js
fetch('/api/health', { method: 'POST' }).then(r => console.log(r.status, r.headers.get('allow')));
```

From a terminal, you can run `curl -i -X POST http://localhost:8080/api/health` instead.

## Workspace preview

The cloud workspace where this project is built has **no browser preview** and does not expose its ports, so `localhost:8080` there can't be opened from your browser, Postman or Thunder Client. Run the project on your own computer to try them. Inside the workspace, the routes were checked with `curl` and `npm run verify` (see [docs/EVIDENCE.md](docs/EVIDENCE.md)).

## Project structure

```
movie-booking-app/
├── package.json                    # npm scripts: start, verify; dependency: express
├── package-lock.json
├── src/
│   ├── server.js                   # app.listen on PORT (default 8080)
│   ├── app.js                      # Express app: app-level middleware, Lecture 1 routes, router, 404
│   ├── middleware/
│   │   ├── requestLogger.js        # application-level middleware (every request)
│   │   ├── moviesRouterLogger.js   # router-level middleware (/api/movies only)
│   │   └── methodNotAllowed.js     # 405 + Allow header for unsupported methods
│   └── routes/
│       └── movies.js               # express.Router() for /api/movies (CRUD placeholders)
├── scripts/
│   └── verify.js                   # smoke test used by `npm run verify`
├── docs/
│   ├── postman-collection.json     # import into Postman or Thunder Client
│   ├── EVIDENCE.md                 # commands run and actual results, per lecture
│   └── AI-ASSISTANCE.md            # record of where AI assisted
└── README.md
```

## Roadmap

Node.js → Express REST APIs → MVC → MongoDB with Mongoose → JWT auth → React frontend → deploy on Render. Ticket-booking features are added once later lectures confirm the requirements. Error-handling, built-in (`express.json()`) and third-party middleware were introduced in Lecture 2 but left for the next class, so they are not in the project yet. OAuth was mentioned only as a reference and is not confirmed.
