# VEMAK app

Zero-dependency Node (>= 20) server plus a plain-JS front end.

    cd app
    npm start                 # http://localhost:3000 (PORT, VEMAK_DATA env vars)

Optional AI mentor: set `OPENAI_API_KEY` in the server's hosting environment. Keep this secret off the browser/client. `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Without a key or if the provider is unavailable, the existing rules-based mentor remains available. Authenticated `/api/ask/ai` calls use server-derived, revealed weekly results, never student identifiers; requests are limited per IP. Set a billing limit with the provider before sharing the game with students.

Pages: `/` landing + demo · `/teacher` teacher dashboard · `/play` students (`/play?kodas=ABC123`)

## Layout
- `public/engine.js`    economy rules; pure functions, shared by server and browser demo. All tunables are in `CONFIG`
- `public/content.js`   all weekly events/choices in Lithuanian (the translation file for decision 2)
- `server/teaching.mjs` lesson plans and quiz answers (server-only so answers are never sent to students)
- `server.mjs`          API, auth, JSON-file database in `data/db.json`
- `test/`               engine.test.mjs, api.test.mjs; ui.test.mjs needs `jsdom` + `esbuild` installed and the server running (`BASE=http://localhost:3111`)

## Before a real school pilot (not done)
- Replace the JSON file with a real DB; host in the EU; HTTPS is required (put it behind Caddy/nginx)
- Sessions never expire and there is no password reset or e-mail verification
- Pilot requests are stored in `data/db.json` (`pilots`); nobody is notified, so add e-mail or a view
- Children's-data/GDPR review and a privacy policy; the landing page makes privacy claims that must match reality
- Curriculum alignment is NOT claimed anywhere; keep it that way until it is mapped
- Rate limiting is per-IP in memory (behind a proxy every user shares one IP unless you forward it)
- Never visually checked in a real browser (Chromium could not start in this container); only DOM-level tests were run
