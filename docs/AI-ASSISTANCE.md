# AI assistance record

The project is built with Claude (Anthropic) working as a coding partner in Claude Code. The student supplies each lecture's transcript and requirements. Claude writes the code, runs the checks, and reports the results, and the student reviews and commits the work.

| Lecture | Date | What the AI did | What the student did |
|---|---|---|---|
| 1 | 2026-11-26 | Created the project folder and the dependency-free `node:http` server (`src/server.js`, `src/app.js`, `src/routes.js`). Wrote `package.json` (start and verify scripts), `scripts/verify.js`, the README and these docs. Ran `npm install`, `npm start`, `npm run verify` and the curl checks, recorded the outputs in `EVIDENCE.md`, and made the first Git commit. | Defined the milestone requirements from the lecture. Reviews the code and the evidence. |

Notes:

- The command outputs in `EVIDENCE.md` are real outputs from the workspace, not written by hand.
- Each lecture's work is a separate Git commit, so the history shows exactly what changed.
