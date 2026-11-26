# Movie Booking App (Scaler Module 14)

An original movie ticket booking app inspired by BookMyShow, built step by step, one lecture at a time.

## Current milestone: Lecture 1, a plain Node.js HTTP server

The server uses only Node's built-in `node:http` module and `http.createServer()`. It has **no external npm dependencies**.

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

This milestone has no dependencies, so the command only confirms `package-lock.json`. Keep running it anyway, because later lectures add packages.

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

## URLs to check

| Method | URL | Expected response |
|---|---|---|
| GET | http://localhost:8080/ | 200, plain-text greeting (`text/plain`) |
| GET | http://localhost:8080/demo | 200, small HTML page (`text/html`) |
| GET | http://localhost:8080/api/health | 200, `{"status":"ok"}` (`application/json`) |

Error behaviour:

- Any other path returns **404**. Paths under `/api/` return a JSON error, and other paths return plain text.
- Any method other than GET or HEAD on a known path returns **405** with the header `Allow: GET, HEAD`.

## Automated check

```bash
npm run verify
```

This starts the server on port 8099, checks all three routes, a 404 and a 405 (status code, `Content-Type` and `Allow`), prints PASS or FAIL for each check, and stops the server.

## Inspect the status code and headers in Chrome DevTools

1. Start the server and open one of the URLs above in Chrome.
2. Press `F12` (or `Ctrl+Shift+I`, or `Cmd+Option+I` on a Mac) and open the **Network** tab.
3. Reload the page (`Ctrl+R` or `Cmd+R`) so the request is captured.
4. Click the request in the list. The **Headers** tab shows the **Status Code** (for example `200 OK`) and the **Response Headers**, such as `Content-Type`.

To see a 405 from the browser, run this in the DevTools **Console**, then look at the new request in the Network tab:

```js
fetch('/api/health', { method: 'POST' }).then(r => console.log(r.status, r.headers.get('allow')));
```

From a terminal, you can run `curl -i -X POST http://localhost:8080/api/health` instead.

## Workspace preview

The cloud workspace where this milestone was built has **no browser preview** and does not expose its ports, so `localhost:8080` there can't be opened from your browser. To see the pages in Chrome, copy the project to your own computer, run `npm start`, and open the URLs above. Inside the workspace, the routes were checked with `curl` and `npm run verify` (see [docs/EVIDENCE.md](docs/EVIDENCE.md)).

## Project structure

```
movie-booking-app/
├── package.json          # npm scripts: start, verify (no dependencies)
├── package-lock.json
├── src/
│   ├── server.js         # creates the HTTP server and listens on PORT (default 8080)
│   ├── app.js            # request handler: 404 / 405 / dispatch to a route
│   └── routes.js         # route table (path -> method -> handler) and response helpers
├── scripts/
│   └── verify.js         # smoke test used by `npm run verify`
├── docs/
│   ├── EVIDENCE.md       # commands run and actual results, per lecture
│   └── AI-ASSISTANCE.md  # record of where AI assisted
└── README.md
```

## Roadmap

Node.js → Express REST APIs → MVC → MongoDB with Mongoose → JWT auth → React frontend → deploy on Render. Ticket-booking features are added once later lectures confirm the requirements. OAuth was mentioned only as a reference and is not confirmed.
