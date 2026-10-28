# VEMAK handoff

Status: 2-day build finished. Working game, teacher dashboard and landing page exist and pass automated tests. Never viewed in a real browser.

## Run it
    cd /data/workspace/VEMAK/app
    npm start          # http://localhost:3000 (env: PORT, VEMAK_DATA)
    npm test           # engine tests + balance table + API end-to-end (no extra installs)
Pages: `/` landing + demo, `/teacher` dashboard, `/play` students (`/play?kodas=ABC123`).
Server is currently stopped. No background processes are running.

## Where things are
| Path | What |
|---|---|
| `app/public/engine.js` | Economy rules (pure functions, shared by server and browser demo). All tunables in `CONFIG` |
| `app/public/content.js` | 6 weeks of Lithuanian events, choices, lessons (the translation file) |
| `app/server/teaching.mjs` | Lesson plans + quiz answers (server-only, never sent to students) |
| `app/server.mjs` | API, auth, JSON-file DB at `app/data/db.json` |
| `app/public/{index,play,teacher}.html` + `landing.js`, `play.js`, `teacher.js`, `iso.js` | Front end. `iso.js` draws the procedural isometric city |
| `app/test/` | `engine.test.mjs`, `api.test.mjs`, `ui.test.mjs` |
| `ROADMAP.md`, `app/README.md` | Done / cut / open items |

## Verified
- 8 engine tests, 30 API checks (auth, ownership, lock/reveal rules, secrecy, CSV, path traversal), 21 simulated-DOM UI checks.
- `ui.test.mjs` needs `jsdom` and `esbuild` (installed only in `/data/cache/scratch/jsd`, which is temporary) and a running server (`BASE=http://localhost:3111`). It is not part of `npm test`.

## NOT verified
- No real-browser check: Chromium fails to start in this container (missing `libnspr4`). Layout, looks, phone and Chromebook sizes, the service worker and print-to-PDF are untested.
- Balance is only simulated: forced asset sales hit balanced players in about 42% of seasons (probably too high), and "no reserve" ties balanced on raw wealth. Retune `CONFIG` with a real class.

## Known gaps / risks
- Stale docs: `SPEC.md`, `economy/ECONOMY.md`, `economy/sim.py`, `DATA_MODEL.md` and `LANDING_PAGE.md` predate the build (e.g. they say 10% forced-sale penalty, the engine uses 15%). The code is the source of truth.
- Security and ops: JSON-file storage, no HTTPS, sessions never expire, no password reset or email verification, in-memory per-IP rate limits (shared IP behind a proxy), pilot requests are stored but nobody is notified.
- Privacy: the landing page promises "no student emails or real names" and that the mentor sees no personal data. Keep that true. A lawyer must review children's-data handling and consent.
- Curriculum alignment is deliberately not claimed (decision 18).
- Not built: designer art, LLM-worded mentor text, sound, English, loans.
- `Porject x` (Portal) is a separate project and was not touched.

## Locked decisions
All 24 Y/N answers are in `SPEC.md`. Notable: 6-week single-class season, no loans (11N), no sound (21N), Lithuanian only, virtual money only.

## Next steps (suggested order)
1. Open the app in a real browser and fix layout bugs, on a phone too.
2. Run one pilot class and tune `CONFIG` (forced-sale penalty, business cap, expense sizes).
3. Pick hosting (EU), add HTTPS, a real DB, session expiry and pilot-request notifications.
4. Legal review, then privacy policy and consent flow.
5. Commission designer art to replace `iso.js`.
6. Map lesson plans to curriculum objectives.

## Open questions for the owner
Hosting and EU region? Is "VEMAK" final and is `vemak.lt` free? First grades and subject? Pricing after the pilot?

## Other artifacts
`/data/workspace/TripoSR/` is an installed CPU TripoSR (patched `run.py` and `isosurface.py`). It is unrelated to the VEMAK 2D look.
