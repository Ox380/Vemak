# VEMAK — Data Model v0.1 (draft)

Stack suggestion (not decided; you did not choose one): TypeScript, a React/Vite PWA, Postgres, hosted in the EU.

## Tables

```
school        id, name, municipality, created_at
teacher       id, school_id, email, password_hash, name
class         id, teacher_id, name ("10A"), join_code, grade, season_id, created_at
season        id, class_id, seed, start_date, weeks (6), status (draft|live|done)
student       id, class_id, nickname, avatar_json, joined_at          -- no email, no real name required
week          id, season_id, number (1-6), event_id, opens_at, locks_at, reveals_at
event         id, type (price_rise|market_dip|expense|opportunity|job), params_json, title_lt, body_lt
decision      id, week_id, key, options_json                          -- e.g. "sneakers_or_business"
student_decision   student_id, decision_id, option_key, decided_at
strategy      student_id, week_id, savings_pct, invest_pct, business_pct, reserve_pct, invest_mix_json, locked_at
portfolio     student_id, week_id, savings, invest, business, reserve, debt, net_worth   -- snapshot per week
business      student_id, level, capital, weekly_income, weekly_expense
award         week_id, type, student_id, value
mentor_note   student_id, week_id, facts_json, text_lt, generated_at  -- facts first, text second
consent       class_id, type, status, evidence_ref, recorded_at
audit_log     id, actor, action, subject, at
```

## Rules the code must enforce

1. Strategies are **not readable by other students or the API** before `reveals_at` (server-side check, not UI hiding).
2. The weekly result is computed on the server from `season.seed`, so every client gets the same market.
3. A strategy locks at `locks_at` or when the student confirms, whichever comes first, and cannot be edited afterwards.
4. The mentor sees only `facts_json` (numbers and decision keys), never the nickname, class, school, or anything else that identifies the student.
5. Deleting a class deletes its students, strategies and mentor notes (data-retention rule to confirm with a lawyer).

## Key API endpoints (sketch)

```
POST /teacher/classes                 create class and join code
POST /join                            {code, nickname} -> student session
GET  /season/current                  week, event, decisions
POST /strategy                        lock allocation
GET  /week/:n/results                 only after reveal
GET  /teacher/classes/:id/dashboard   participation, mission completion, knowledge change, skills by topic
GET  /teacher/classes/:id/export.csv|pdf
```
