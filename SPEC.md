# VEMAK — Product Spec v0.1

Lithuanian financial-literacy game for school classes. Web app (PWA), virtual money only.

## Decisions locked (from your Y/N answers)

| # | Decision |
|---|---|
| 1 | Web app / PWA, no app stores at first |
| 2 | Lithuanian only at launch; all text in a translation file so English can be added later |
| 3 | All money is virtual: no payments, no real brokerage, no real prizes |
| 4 | v1 = one playable 6-week season for one class |
| 5 | Weekly loop: Mon event, Tue-Wed decisions, Thu allocate and lock, Fri reveal |
| 6 | Market is deterministic per season: the whole class sees the same prices and events |
| 7 | Unexpected expenses and price rises are real, and punish students with no reserve |
| 8 | Business (Kavos baras) is an upgradeable mini-game |
| 9 | Leaderboard rewards more than wealth; net worth is a secondary tab |
| 10 | Visible failure (debt, bankruptcy) with a guided "second chance" recovery |
| 11 | **No loans or credit in v1** (season 2) |
| 12-14 | AI mentor: personalised, rule-based facts with LLM-written wording, no names or personal data sent |
| 15 | Teacher creates a class and a join code; no student email |
| 16 | Teacher export to PDF and CSV |
| 17 | Ready-made lesson plan for each week |
| 18 | Curriculum-alignment claim only after specific objectives are mapped and verified |
| 19 | 2.5D isometric illustrated look, no real-time 3D |
| 20 | AI-generated art as a base, cleaned up by a designer |
| 21 | **No sound or music in v1** |
| 22-24 | Landing page: three audience sections, pilot-request CTA, live playable demo with no login |

## Who uses it

- **Student (grades 9-12):** plays about 10-15 minutes per decision day, on a phone or school Chromebook.
- **Teacher:** creates a class, runs the season, uses the weekly lesson plan and the dashboard.
- **School leadership:** reads the landing page, requests a pilot, and receives results and a privacy summary.

## Season structure (6 weeks = 6 in-game months of pay)

| Day | Student does | Game does |
|---|---|---|
| Mon | Reads the weekly event | Releases a shared event (price rise, market dip, opportunity) |
| Tue-Wed | Makes 1 life decision (the sneakers vs business-start screen) and a budget choice | Applies immediate effects |
| Thu | Allocates the weekly strategy and locks it | Hides strategies from the class until Friday |
| Fri | Sees results, rank and awards, then the AI mentor review | Reveals all strategies and runs the market for the week |

Strategies stay secret until Friday so students decide without copying, and the Friday reveal gives the teacher a shared discussion moment.

## Screens (from your board)

Welcome, City map, Weekly decision, Weekly strategy, Business, Class leaderboard, Investments, Budget, Economic events, AI mentor, Friday final, Teacher dashboard (12 total).

## Out of scope for v1

Loans and credit, real money, real-time 3D, sound, multiple seasons, school-wide leagues, English UI, native apps.

## Risks to resolve

1. **Children's data (GDPR):** needs a parental/school-consent flow, a data-processing agreement with schools, and a decision on hosting in the EU. This should be checked by a lawyer before the pilot.
2. **Curriculum claim:** the board says "Atitinka Lietuvos mokymo programą". Keep it off the landing page until objectives are mapped (decision 18).
3. **Balance:** see `economy/ECONOMY.md`; the simulation shows the rules are close but not final.
4. **AI mentor accuracy:** facts come from rules, so the LLM only rewrites tone (decision 13).
