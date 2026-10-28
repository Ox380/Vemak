"""VEMAK economy balance simulator (v0.1).

Purpose: check that the season rules reward balanced play, punish having no reserve,
and that no single strategy dominates. Pure stdlib. Run: python3 sim.py

Model (one game "week" = one game month of pay):
  - Student gets PAY each week. Needs are fixed, wants are adjustable.
  - Free cash is split by the weekly strategy into 4 buckets:
        savings, investments, business, reserve
  - Shared, seeded events hit the whole class (same for every student).
  - Unexpected expense must be paid from reserve, then savings, then by forced
    sale of investments at a penalty (loans are out of scope for v1).
"""
import random
import statistics
import sys

WEEKS = 6
PAY = 1000.0
NEEDS = 600.0          # housing, food, transport (fixed)
WANTS = 150.0          # leisure + other (default; adjustable by student)
FREE = PAY - NEEDS - WANTS   # 250 EUR/week allocated by strategy

SAVINGS_RATE = 0.003   # per week
FORCED_SALE_PENALTY = 0.10
BUSINESS_BASE = 0.045  # expected weekly return on business capital
BUSINESS_SD = 0.08
BUSINESS_CAP = 500.0   # level-1 capacity; capital above it earns only savings rate

# asset: (mean weekly return, sd)
ASSETS = {
    "etf":   (0.010, 0.040),
    "tech":  (0.012, 0.090),
    "green": (0.011, 0.075),
    "reit":  (0.006, 0.025),
    "gold":  (0.003, 0.030),
}

# strategy = (savings, investments, business, reserve, invest_mix)
STRATEGIES = {
    "balanced":      (0.30, 0.25, 0.25, 0.20, {"etf": .4, "reit": .3, "green": .2, "gold": .1}),
    "all_tech":      (0.00, 1.00, 0.00, 0.00, {"tech": 1.0}),
    "all_business":  (0.00, 0.00, 1.00, 0.00, {}),
    "saver":         (0.60, 0.10, 0.00, 0.30, {"etf": 1.0}),
    "spend_it_all":  (0.00, 0.00, 0.00, 0.00, {}),   # free cash is spent, not kept
    "no_reserve":    (0.30, 0.40, 0.30, 0.00, {"etf": .5, "tech": .5}),
}


def season_events(rng):
    """Shared events: (week -> dict). Deterministic given rng."""
    ev = {w: {"expense": 0.0, "price_rise": 0.0, "market_shock": 0.0} for w in range(1, WEEKS + 1)}
    # two unexpected expenses, one price rise, one market dip, all seeded
    for w in rng.sample(range(2, WEEKS + 1), 2):
        ev[w]["expense"] = rng.choice([150.0, 200.0, 250.0, 300.0])
    ev[rng.randint(3, WEEKS)]["price_rise"] = 0.12
    ev[rng.randint(2, WEEKS)]["market_shock"] = -rng.uniform(0.04, 0.10)
    return ev


def run(strategy, seed):
    rng = random.Random(seed)
    events = season_events(rng)
    s_sav, s_inv, s_bus, s_res, mix = STRATEGIES[strategy]
    cash_reserve = savings = invest = business = 0.0
    forced = 0
    debt_weeks = 0
    for w in range(1, WEEKS + 1):
        e = events[w]
        needs = NEEDS * (1 + e["price_rise"])
        free = max(0.0, PAY - needs - WANTS)
        if strategy == "spend_it_all":
            free = 0.0
        savings += free * s_sav
        invest += free * s_inv
        business += free * s_bus
        cash_reserve += free * s_res

        # market and business returns (shared market noise + personal luck-free)
        mr = e["market_shock"]
        if invest > 0 and mix:
            r = 0.0
            for a, share in mix.items():
                mu, sd = ASSETS[a]
                r += share * (rng.gauss(mu, sd) + mr * (sd / 0.04) * 0.5)
            invest *= (1 + r)
        productive = min(business, BUSINESS_CAP)
        overflow = business - productive
        productive *= (1 + rng.gauss(BUSINESS_BASE, BUSINESS_SD) - e["price_rise"] * 0.2)
        overflow *= (1 + SAVINGS_RATE)
        business = productive + overflow
        savings *= (1 + SAVINGS_RATE)

        # unexpected expense: reserve -> savings -> forced sale (penalised)
        need = e["expense"]
        if need > 0:
            for pool in ("cash_reserve", "savings"):
                take = min(need, locals()[pool])
                if pool == "cash_reserve":
                    cash_reserve -= take
                else:
                    savings -= take
                need -= take
            if need > 0:
                take = min(need / (1 - FORCED_SALE_PENALTY), invest)
                invest -= take
                need -= take * (1 - FORCED_SALE_PENALTY)
                forced += 1
            if need > 0:
                take = min(need / (1 - FORCED_SALE_PENALTY), business)
                business -= take
                need -= take * (1 - FORCED_SALE_PENALTY)
                forced += 1
            if need > 0:
                debt_weeks += 1  # unpaid expense -> visible debt state
    net = cash_reserve + savings + invest + business
    return net, forced, debt_weeks


def main(n=2000):
    names = list(STRATEGIES)
    finals = {k: [] for k in names}
    forced_pct = {k: 0 for k in names}
    debt_pct = {k: 0 for k in names}
    wins = {k: 0 for k in names}
    for seed in range(n):
        res = {k: run(k, seed) for k in names}
        for k, (net, f, d) in res.items():
            finals[k].append(net)
            forced_pct[k] += f > 0
            debt_pct[k] += d > 0
        wins[max(res, key=lambda k: res[k][0])] += 1
    print(f"{n} seasons, {WEEKS} weeks, free cash {FREE:.0f} EUR/week\n")
    print(f"{'strategy':14}{'median':>9}{'p10':>9}{'p90':>9}{'forced%':>9}{'debt%':>8}{'wins%':>8}")
    for k in names:
        v = sorted(finals[k])
        p = lambda q: v[int(q * (len(v) - 1))]
        print(f"{k:14}{statistics.median(v):9.0f}{p(.10):9.0f}{p(.90):9.0f}"
              f"{100*forced_pct[k]/n:9.1f}{100*debt_pct[k]/n:8.1f}{100*wins[k]/n:8.1f}")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 2000)
