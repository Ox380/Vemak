# VEMAK roadmap: 2-day project (replaces the earlier weeks-long plan)

## Day 1: playable game (DONE, tested)
- [x] Economy engine, seeded and deterministic per class (`app/public/engine.js`)
- [x] 6 weeks of Lithuanian content: events, choices, lessons, quiz (`content.js`, `server/teaching.mjs`)
- [x] Server: teachers, classes with join code, nickname-only students, lock/reveal/next-week, CSV export
- [x] Student game: join, pre-test, city map, decision, strategy, results, leaderboard, investments, budget, mentor, finish + post-test
- [x] Isometric city (procedural SVG)

## Day 2: teachers, landing, polish (DONE, tested in a headless DOM)
- [x] Teacher dashboard: class control, live stats, student table, lesson plans, report (print to PDF) and CSV
- [x] Landing page: 3 audiences, live demo (no login), pilot request form
- [x] PWA shell (manifest + service worker)

## Not in the 2 days (deliberately cut; see app/README.md "Before a real school pilot")
1. Designer-made art replacing the procedural city (decision 20)
2. LLM-written mentor wording (the rule-based text works; an LLM would only reword it)
3. Real database (JSON file now) and EU hosting
4. GDPR / children's-data review by a lawyer, privacy policy page, retention policy
5. Mapping lesson plans to the Lithuanian curriculum (decision 18)
6. Sound (decision 21: off), English text, loans (decision 11: no)
7. Real-browser visual QA on phones and Chromebooks
8. Pilot with a real class, then tune `CONFIG` in `engine.js`

## Still open for you
1. Who hosts it, and where (EU)? 2. Is "VEMAK" final, and is `vemak.lt` free? 3. Which grades and subject first? 4. Pricing after the free pilot?
