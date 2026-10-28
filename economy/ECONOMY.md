# VEMAK — Economy Rules v0.1

Numbers come from `sim.py` in this folder (stdlib Python; run `python3 sim.py 3000`).
These are starting values to tune with real classes, not final.

## Weekly money

| Item | Value |
|---|---|
| Pay | €1000 / week (one in-game month) |
| Needs (housing, food, transport) | €600, rises by event percentages |
| Wants (leisure, other) | €150 by default, student-adjustable |
| Free cash to allocate | about €250 |

## Four buckets (the Thursday allocation)

| Bucket | Return | Risk | Teaches |
|---|---|---|---|
| Savings | +0.3% / week | none | Safety, inflation erosion |
| Investments | by asset (below) | medium-high | Diversification |
| Business | about +4.5% / week, sd 8%, **only on the first €500 (level 1)** | high | Capital, scaling |
| Reserve (cash) | 0% | none | Emergency buffer |

### Investment assets (weekly mean / sd)

S&P 500 ETF 1.0% / 4% · Tech fund 1.2% / 9% · Green energy 1.1% / 7.5% · Real-estate fund 0.6% / 2.5% · Gold 0.3% / 3%

A shared market shock hits all assets once per season, and higher-volatility assets fall more.

## Shocks (same for the whole class, seeded)

- 2 unexpected expenses per season (€150-300), paid in this order: reserve, savings, **forced sale of investments (10% penalty)**, then business, then visible debt.
- 1 price rise (+12% on needs).
- 1 market dip (-4% to -10%).

## Business levels

Level 1 allows €500 of productive capital. Capital above the cap earns only the savings rate. Each upgrade (staff, equipment, supplier choice) raises the cap. Without this rule, "all in business" won 53% of simulated seasons.

## Awards (leaderboard is not only wealth)

- Highest growth, best strategy (risk-adjusted), biggest progress (rank change), best saver, best recovery.

## Simulation result (3000 seasons, v0.1 rules)

| Strategy | Median final | 10th pct | 90th pct | Hit by forced sale | In debt | Wins |
|---|---|---|---|---|---|---|
| Balanced | €1031 | €908 | €1156 | 21% | 0.1% | 26.5% |
| All business | €1039 | €876 | €1202 | 100% | 0.0% | 35.7% |
| All tech | €904 | €683 | €1159 | 100% | 0.1% | 12.4% |
| No reserve | €1027 | €883 | €1176 | 82.5% | 0.1% | 23.2% |
| Saver | €987 | €882 | €1091 | 0% | 0.0% | 2.2% |
| Spend it all | n/a | n/a | n/a | n/a | 100% | 0% |

### What this tells us

- **All tech is clearly the worst** choice, which is the intended lesson.
- **Balanced has a better worst case** than all-business (10th percentile €908 vs €876).
- **Reserve works:** only 21% of balanced seasons hit a forced sale, against 82-100% for no-reserve strategies.
- **Not yet right:** all-business still wins most often by raw wealth, and "no reserve" has almost the same median as balanced. The penalty for having no reserve is too weak. This is why the leaderboard scores risk-adjusted strategy and not net worth alone (decision 9).
- "Spend it all" shows as 0 because the model does not track what a student buys, so ignore that row.

## To tune before the pilot

1. Raise the forced-sale penalty from 10% to 15-20%.
2. Lower the business cap or the base return a little.
3. Add a "stress week" when the reserve is empty (a missed mission or a lost bonus) so having no reserve costs more than money.
4. Re-run with real student behaviour from the first pilot class.
