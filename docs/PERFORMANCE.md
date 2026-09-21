# NECTAR — Performance Engineering Plan & Log

**Plan revision 3 · 2026-09-21 · Phase 0A in progress: harness built, calibration and A/A noise floor measured, BASELINE-vs-CURRENT comparison waiting on a commit (decision N1, section 16.1)**

This file is two things: the **plan** for measuring and improving NECTAR's performance (sections 1–13), and the **log** of what was measured and what moved (sections 14–17).

### Status labels

Every number or claim in this file carries one of these. If it has no label it does not belong here.

| Label | Meaning |
|---|---|
| `MEASURED` | Produced by a run. Must cite a run ID (section 6) |
| `TARGET` | Agreed by the owner as a goal |
| `PROPOSED` | Suggested by this plan, not yet agreed. Includes every benchmark parameter the repository does not itself justify |
| `UNAVAILABLE` | Cannot be produced yet. The reason is stated |
| `—` | Not yet measured |

---

## 1. Principles

1. **Provenance.** A number without a run ID is a rumour. Numbers in this file are rendered from machine-readable run records, never typed by hand (section 6).
2. **Environments never mix.** Local, staging and production numbers are separate columns, separate baselines and separate conclusions.
3. **One variable.** A before/after comparison changes the code revision and nothing else (section 7).
4. **Measure before optimising.** Each hotspot gets a diagnosis step before any fix (section 10).
5. **Noise is a measurement too.** Before trusting any difference, measure the harness's own run-to-run variation (section 4.5).
6. **No metric without a reason.** Each metric in section 3 states what decision it informs.
7. **Safety over speed.** No synthetic load reaches anything that might hold real user data (sections 2.2, 12).

---

## 2. Environments

### 2.1 Definitions

| | **Local** | **Staging** | **Production** |
|---|---|---|---|
| **Purpose** | Repeatable benchmarks, regression tests, query optimisation, CI | Realistic end-to-end performance: real network, real DB host, real Gemini, real deployment | What users actually experience: real traffic, availability, real latency |
| **Stack** | API on this machine + **throwaway local PostgreSQL** (Docker) | Separate deployment of the API + separate database + separate secrets | The live deployment |
| **Gemini** | `stub` by default; `real` only in a controlled run (Phase 0B) | `real` | `real` (users' own traffic) |
| **Synthetic load** | Yes | Yes, within provider limits | **No.** Observation and safe probes only |
| **Data** | Deterministic seed, disposable | Synthetic, clearly labelled, disposable | Real user data. Never touched by tests |
| **May gate CI** | Yes (Phase 2) | No | No |
| **Exists today** | Yes: built in Phase 0A (`performance/`) | **Unknown, treated as not existing.** A prerequisite for Phase 0B-ii | Yes. `client/.env` points at a remote API |

Local latencies are **not** comparable to staging or production: there is no network hop to the database or client and no shared tenancy. Compare an environment only against itself.

### 2.2 Policy on the existing Supabase database

> **Until the owner explicitly confirms otherwise, the remote Supabase database referenced by `server/.env` is treated as production or production-adjacent and must not receive synthetic load, test data, migrations from a benchmark harness, or load-driven queries of any kind.**

Nothing in this plan connects to it. Optimisation and regression work runs on local Postgres. If staging does not exist, creating one is a stated prerequisite (section 16). Production is never a substitute.

### 2.3 Guardrails found in the repository

Reading the code turned up two ways a benchmark could reach the remote database by accident. Both must be closed before any run.

| # | Finding | Why it matters | Required guardrail |
|---|---|---|---|
| G1 | [index.ts](../server/src/index.ts) and [prisma.config.ts](../server/prisma.config.ts) both `import "dotenv/config"`, which loads `./.env` from the working directory. `server/.env` holds the remote `DATABASE_URL`. `dotenv` fills only variables that are **unset** | Starting the API or a Prisma command from `server/` with `DATABASE_URL` unset silently targets the remote database. Any other unset variable (for example the Gemini key) is also pulled from that file | The harness sets **every** variable explicitly, runs from a working directory that contains no `.env`, and never reads `server/.env` |
| G2 | The `dev` script passes `--env-file=.env` | Same leak, by a different route | The harness never uses `npm run dev` |
| G3 | Nothing stops a benchmark process from pointing at a non-local host | One typo reaches a real database | **Allow-list guard:** the harness refuses to start unless the `DATABASE_URL` host is `localhost`, `127.0.0.1`, `::1` or the compose service name **and** the database name starts with `bench_`. The same check runs before every seed, migrate and cleanup command |
| G4 | The API does not report which database it connected to | The guard in G3 checks the URL the harness intended, not what the app used | **Implemented without touching the app, so it works on every revision:** a preloaded shim forces the API to listen on `127.0.0.1` only, and the harness checks the API process's listening sockets and every established TCP connection (`ss`) and aborts on any non-loopback address, before and after the load |

### 2.4 Data integrity

Applies to every environment where synthetic data exists.

| Concern | Rule |
|---|---|
| Isolation from real accounts | All synthetic users use the address pattern `bench-<n>@bench.nectar.invalid`. `.invalid` is a reserved TLD and cannot collide with a real address. Usernames are prefixed `bench_` |
| Test database | Local: a throwaway Postgres container bound to `127.0.0.1` only, on a named volume. Not `tmpfs`: that would remove disk cost and flatter every write benchmark |
| Deterministic seed | Fixed PRNG seed; UUIDs derived deterministically from an index so plan IDs are identical on every rebuild; plan dates anchored to a fixed reference date, not "now", so "latest" is well defined |
| Reset strategy | Build the dataset **once** as a template database (`bench_seed_<dataset-id>`), then create each run's database from it (`CREATE DATABASE … TEMPLATE …`). Every run starts from byte-identical data and the run database is dropped afterwards |
| Cleanup (staging) | Delete by namespace only, in dependency order **Diet → DietPlan → DietaryConstraint → User**. Foreign keys are `ON DELETE RESTRICT`, so order matters. The script prints the affected row counts first and aborts if any matched row is outside the namespace |
| Seeded credentials | One bcrypt hash of one throwaway password at cost 10 (matching the cost in [userRepository.ts](../server/src/repository/userRepository.ts)) is computed once and reused for every seeded user. Tokens are minted with throwaway local secrets and long expiry so they do not lapse mid-run. **Real secrets are never used** |
| Growth during a run | Scenarios that create rows (S2, S8) run against a fresh clone and are discarded |

---

## 3. Metrics and why each exists

No metric is collected because it is conventional. The "Decision it informs" column is the test for keeping it.

### 3.1 Latency (per endpoint, milliseconds)

| Metric | Decision it informs |
|---|---|
| p50 | The typical experience. Detects a change that affects everything |
| p90 | Early warning that a tail is forming |
| p95 | The primary target and the regression-gate metric |
| p99 | Stalls: pool waits, GC pauses, cold paths. **Reported, never gated** (too noisy at these sample sizes) |
| max | Diagnosing a single anomaly. **Never gated, never averaged** |

Every latency figure states its sample count, its arrival rate and its environment.

### 3.2 Throughput

| Metric | Decision it informs |
|---|---|
| Requests/s (offered) | Confirms the generator delivered the intended load |
| Successful requests/s | The real capacity figure |
| Failed requests/s | Separates "slow" from "broken" |
| Capacity | Highest rate where p95 stays inside its target and errors stay under the validity threshold. Anchors the load ladder (section 4.3) |

### 3.3 Reliability

| Metric | Definition | Decision it informs |
|---|---|---|
| Error rate | 5xx ÷ total. 4xx excluded except 429 | Whether the system stays correct under load |
| 429 rate | Rate-limit rejections | **Validity check:** any 429 in a benchmark means the limiter was not disabled and the run measures the limiter, not the app |
| Timeout rate | Client-observed timeouts ÷ total | Whether users hit a wall before the server finishes (matters for generation) |
| Retry rate | Generations needing a second Gemini attempt ÷ generations | Whether the retry policy earns its worst-case latency |

### 3.4 Database

| Metric | Source | Decision it informs |
|---|---|---|
| Statements per request | `pg_stat_statements` (local, no app change) / Prisma timing (later) | Detects over-fetching and N+1 patterns |
| Query duration p50/p95 | Same | Whether the DB or the application dominates a request |
| Rows returned | Same | Over-fetching |
| Slow queries | `log_min_duration_statement` on the local instance | Finding candidates for `EXPLAIN` |
| Connection usage | `pg_stat_activity` | Whether the pool is a bottleneck. Prisma's pg adapter currently runs on `pg`'s default pool (max 10) since [db.ts](../server/src/utils/db.ts) sets no size |
| Pool wait time | Prisma/adapter timing (Phase 1) | Distinguishes pool starvation from slow queries |

### 3.5 Gemini (Phase 0B only)

| Metric | Decision it informs |
|---|---|
| Attempt latency p50/p95 | The real cost of the generation path. **Per attempt**, not per generation |
| Successful-generation rate (first attempt / final) | Whether validation is too strict or the prompt unreliable |
| Retry rate, timeout rate | Whether 2 attempts × 30 s is justified |
| Failure reason mix | `parse_error`, `schema_error`, `calorie_drift`, `timeout`, `api_error`. Tells you which fix to build |
| Input / output tokens | Cost driver |
| Estimated cost per plan | Tokens × the price in force on the run date (record the price used) |

### 3.6 Infrastructure (only where measurable)

| Metric | Source | Decision it informs |
|---|---|---|
| API process CPU | `pidstat` / `docker stats` | Detects CPU-bound paths (bcrypt) and single-thread saturation |
| API process RSS | Same | Leaks and JSON-heavy responses |
| Postgres CPU / memory | `docker stats` | DB-bound versus app-bound |
| Load-generator CPU | `pidstat` | **Validity check:** a saturated generator invalidates latency |
| Response size | k6 `http_res_body` / Content-Length | Payload-bound versus query-bound (history) |

### 3.7 Deliberately excluded

| Excluded | Reason |
|---|---|
| Mean latency | Hides tails. Recorded in raw output but never reported |
| Apdex | A composite that duplicates the percentiles |
| Frontend vitals (LCP, INP, CLS) | Not part of the API baseline. Captured as its own baseline before the client refactor (Phase 6) |
| MTTR | Needs incident history that does not exist yet. Derived later from availability data |

---

## 4. Benchmark methodology

### 4.1 Tool and harness

- **k6**, version pinned and recorded in every run. Percentiles configured explicitly (`p(50),p(90),p(95),p(99),max`); k6's default summary omits p99.
- **Not installed today.** Installation is deferred to implementation (section 15). Running k6 from its Docker image is an alternative that avoids a host install.
- **CPU isolation:** the load generator, API and Postgres run on **disjoint CPU sets**, allocated by **physical core** so SMT sibling threads never share work. This machine is an Intel i5-11400H **laptop with 6 physical cores / 12 threads** (not 12 cores). The `PROPOSED` split, recorded in every run: Postgres core 1, API cores 2–3, load generator cores 4–5, core 0 left to the OS.
- **Node knobs recorded per run:** Node version, `UV_THREADPOOL_SIZE` (default 4, which caps concurrent bcrypt operations), Postgres pool size.

### 4.2 Open-model load, not closed-loop

Latency is measured with the **constant-arrival-rate** executor: requests arrive at a fixed rate regardless of how slowly the server responds. A closed-loop fixed-VU test slows its own arrivals whenever the server slows down, which understates tail latency (coordinated omission). Fixed-VU runs are used only to probe saturation.

### 4.3 Calibration before measurement

Arbitrary request rates are not justified by anything in the repository, so they are derived, not chosen:

1. **Calibration run** per scenario: `ramping-arrival-rate` from low to failure. The output is that scenario's **capacity** on this machine (highest rate meeting the validity criteria). Recorded as a run of type `calibration`. Never a baseline.
2. **Measured runs** use `constant-arrival-rate` at **25 %, 50 % and 75 % of calibrated capacity**.

The absolute rates therefore differ per scenario and per machine. That is intended.

**Capacity rule as implemented.** Scanning up from the ladder step with the **lowest p95**, capacity is the last step before the first that has dropped iterations, any 429, more than 0.1 % unexpected statuses, or a p95 above 2× that lowest p95. Steps below the best one are ignored: on this machine low rates are *slower* than moderate ones (see 4.7). The first version of this rule used the lowest-rate step as its reference and returned no capacity at all; the second scanned from the bottom and had the same flaw. Neither result was kept.

### 4.4 Run shape (`PROPOSED`, every value)

| Phase | Duration | Kept in results |
|---|---|---|
| Ramp to target rate | 30 s | No |
| Warm-up at target rate | 30 s | No |
| **Measured window** | **5 min** | **Yes** |
| Cool-down | 30 s | No |

- **Profiles.** `standard` is the profile above. `quick` (10 s ramp, 10 s warm-up, 60 s measured) is an **interim** profile used in Phase 0A so a full suite fits in a working session; every run record names its profile and quick runs are never mixed with standard runs. Standard-profile confirmation runs are still owed (section 15.1).
- **Measured runs per configuration:** 5.
- **Baseline vs current** runs are **interleaved** (B C B C …), not run in two blocks, so machine drift (thermal state, background load) cannot masquerade as a code effect.

### 4.5 Statistics

| Rule | Why |
|---|---|
| Percentiles are computed **per run** by k6 over all measured samples, then aggregated **across runs by median**. Raw samples from different runs are never pooled | Pooling hides run-to-run variance |
| Each aggregate reports median, min–max and coefficient of variation (CV) | Shows how trustworthy the number is |
| A configuration whose CV of p95 exceeds **10 %** (`PROPOSED`) is labelled `noisy` and is not used as a baseline until the cause is found | An unstable baseline makes every later comparison meaningless |
| **A/A test first:** run the identical commit against itself with the full procedure | Measures the harness's own noise floor. Every threshold in this plan must sit above it |
| **A change is called an improvement or regression only if** the two sets of 5 run values **do not overlap** *and* the difference of medians exceeds the absolute floor (section 8) | With 5 vs 5 runs, complete separation by chance has probability 2 ÷ C(10,5) = 2/252 ≈ 0.8 %. It is simple, needs no distribution assumptions and is defensible |
| Anything else is written as **"no detectable change"** | Small differences are not results |
| p99 and max are reported for diagnosis only | Too few tail samples to compare reliably |

### 4.6 Datasets (`PROPOSED`)

No production row counts exist to calibrate against. Sizes are proposals to be replaced once production observation (Phase 0C) gives real growth data. Counts are derived from users × plans per user × 5 meals (the generator always produces 5).

| ID | Users | Plans / user | Plans | Meals | Use |
|---|---:|---:|---:|---:|---|
| `D-S` | 100 | 7 | 700 | 3,500 | Smoke tests, CI |
| `D-M` | 1,000 | 30 | 30,000 | 150,000 | **Default baseline dataset** |
| `D-L` | 10,000 | 90 | 900,000 | 4,500,000 | Scaling study (Phase 3), run only if this machine has the headroom |

- Plans per user is uniform (`PROPOSED`); a skewed variant is deferred until real usage shows skew.
- Each request selects its user or plan **uniformly at random** from the pool. Hitting one user repeatedly would measure a warm cache, not the workload.
- `/diet/history` returns at most 7 plans however many exist, so plans-per-user changes its cost through the **index and sort**, not payload size. S6 therefore also runs at **7, 30 and 365 plans per user** to expose that.
- Dataset ID, generator version, PRNG seed and a checksum of row counts are stored in every run record.

### 4.7 Harness findings from Phase 0A

Each of these changed the harness or the interpretation of results. They are recorded because they are exactly the kind of error that produces a wrong "improvement".

| Finding | Evidence | Consequence |
|---|---|---|
| **Foreign load on the machine swamps small latencies.** Ten S4 A/A runs on identical code, harness 0.1.1: p95 spanned 0.87–3.74 ms (CV 63 %). The noisy runs were those started while the 1-minute load average was 2–4 from other services | Rows `S4 / aa-a, aa-b / harness 0.1.1` in 14.1 | Added a **quiet gate** (harness 0.2.0): before every run and calibration, sample CPU use on every pinned core and the OS core and wait until all are at or below 10 % |
| **The quiet gate works.** Ten S4 A/A runs, harness 0.2.0: p95 spanned 0.82–0.86 ms (CV 1.4 %) | Rows `S4 / … / harness 0.2.0` in 14.1 | The S4 noise floor at this rate is about ±0.04 ms. The 0.1.1 S4 rows stay in the table, marked `noisy`, and are not a baseline |
| **DB-bound endpoints are stable without the gate.** Ten S6 A/A runs, harness 0.1.1: p95 30.6–36.4 ms (CV 5 %), the two halves' ranges overlap | Rows `S6` in 14.1 | Under the 10 % noise limit, and the "ranges do not overlap" rule correctly reports *no detectable change* for identical code |
| **Low request rates are slower than moderate ones.** S4 p50 fell from about 2 ms at the lowest ladder step to below 1 ms at 640 rps. The CPU governor is `powersave` (turbo enabled, on AC power) | Calibration runs in 14.1 | Measure at 25–75 % of calibrated capacity, never at a trickle; record governor and power state in every run (done) |
| **Each k6 phase restarts its own iteration counter.** S8's measured phase reused users already consumed by warm-up and received `409` | Smoke run, discarded | Each phase draws from its own slice of the seeded user pool; the harness refuses to start S8 if the pool is too small |
| **The current revision validates input the old one did not.** S2's generated usernames exceeded the 50-character limit and every request was rejected | Calibration run, discarded | Shorter unique identifiers; the validity criteria caught it because no step had a usable p95 |
| **Datasets are identical across revisions.** `D-M` built from each revision's own migrations has the same content checksum | `database.dataset_checksum` in every record | Confirms the only intended variable is the code (plus its own migrations) |

---

## 5. Scenarios

All scenarios use the **Local** environment unless stated. The **Common parameters** apply unless a scenario overrides them.

### 5.1 Common parameters

| Parameter | Value | Label |
|---|---|---|
| Environment | `local` | — |
| Database | Throwaway local Postgres, cloned from template `bench_seed_D-M` | `PROPOSED` |
| Postgres major version | Same major as the deployed database once known (see section 16); pinned and recorded | `PROPOSED` |
| Executor | `constant-arrival-rate` at 25/50/75 % of calibrated capacity | `PROPOSED` |
| Ramp-up / warm-up / measured / cool-down | 30 s / 30 s / 5 min / 30 s | `PROPOSED` |
| Runs per configuration | 5, interleaved with the comparison revision | `PROPOSED` |
| Rate limiting | **Disabled** for the run (Enabler E1). Recorded as `rate_limit_mode` | required |
| Gemini mode | `none` unless stated | — |
| Auth material | Pre-minted tokens, long expiry, throwaway secrets | required |

### 5.2 Run validity criteria (distinct from performance targets)

A run is **invalid** and discarded if any of these hold. This separates "the test was broken" from "the app is slow".

| Criterion | Threshold |
|---|---|
| k6 `dropped_iterations` | > 0 (the generator could not deliver the rate; the system or generator is past capacity) |
| Any 429 response | > 0 (limiter still active) |
| Unexpected status codes | > 0.1 % (`PROPOSED`); for deterministic seeded requests the expectation is zero |
| Response `check` failures | > 0.1 % (`PROPOSED`) |
| Load-generator CPU | > 70 % sustained (`PROPOSED`) |
| Machine load average before start | Above idle threshold recorded in the run header |

### 5.3 Scenario specifications

Endpoints and behaviour are taken from the current routes. "Expected queries" are hypotheses to be **confirmed** with `pg_stat_statements`, not assumptions.

---

**S1 — `POST /api/auth/login`**
- **Auth:** none (issues the refresh cookie and access token)
- **Request:** JSON `{ email, password }`; user chosen uniformly from the seeded pool; all seeded users share one password
- **Response:** `200` `{ success, data: { id, username, email, accessToken } }` plus `Set-Cookie: jwt`
- **Database work:** expected 1 select by unique email, 1 update of the hashed refresh token
- **Dataset:** `D-M`
- **Extra recorded:** bcrypt cost (10), `UV_THREADPOOL_SIZE`, API CPU
- **Enabler:** E1 (login is limited to 30 per 15 min per IP today)
- **Success criteria:** `200` and non-empty `accessToken`
- **Comparable to previous revision:** **No.** The old code did not `await` `bcrypt.compare`, so it skipped the hash check entirely. A higher latency now is correct behaviour, not a regression

**S2 — `POST /api/user/signup`**
- **Auth:** none
- **Request:** valid full payload; unique address per iteration `bench-<run>-<vu>-<iter>@bench.nectar.invalid`
- **Response:** `201` plus cookie
- **Database work:** expected duplicate-email select, one nested create (user + constraint), refresh-token update; bcrypt hash at cost 10
- **Dataset:** fresh clone of `D-M`, discarded after the run (rows accumulate)
- **Enabler:** E1
- **Success criteria:** `201`
- **Comparable:** **Partly.** The old signup did not persist a refresh token, so it performed one fewer write. Label any comparison accordingly

**S3 — `GET /api/auth/refresh`**
- **Auth:** pre-minted refresh token in the `jwt` cookie
- **Response:** `200` `{ accessToken, username }`
- **Database work:** expected 1 select by id
- **Dataset:** `D-M`. **Seed format differs by revision:** current code stores a SHA-256 hash of the refresh token, the old code stored the raw token. The harness needs a per-revision seed adapter
- **Success criteria:** `200`
- **Comparable:** **Conditionally.** The old route also demanded a valid `Authorization: Bearer` header. The old-revision adapter must send one

**S4 — `GET /api/user/profile`**
- **Auth:** Bearer access token
- **Response:** user with constraints (small JSON)
- **Database work:** expected 1–2 statements (relation load)
- **Dataset:** `D-M`
- **Success criteria:** `200`, `data.constraints` present
- **Comparable:** Yes

**S5 — `GET /api/diet/latest`**
- **Auth:** Bearer
- **Response:** one plan with its 5 meals
- **Database work:** expected 2 statements (plan ordered by date, meals by plan)
- **Dataset:** `D-M`, users with 30 plans
- **Success criteria:** `200`, 5 meals
- **Comparable:** Yes. Schema differs by the three new indexes, which are **part of the revision under test** (section 7)

**S6 — `GET /api/diet/history`**
- **Auth:** Bearer
- **Response:** up to 7 plans, each with 5 meals (35 meal rows). **Response size in bytes is reported**
- **Database work:** expected 2 statements; rows returned recorded
- **Dataset variants:** `D-M` at **7, 30 and 365 plans per user** (`PROPOSED`)
- **Success criteria:** `200`, `min(7, plans)` plans
- **Comparable:** Yes
- **Diagnosis:** section 10.2

**S7 — `GET /api/diet/:id`** and **S7b (authorisation check)**
- **Auth:** Bearer
- **S7:** the user's own plan id from the seed list, chosen uniformly. `200`, 5 meals
- **S7b:** another user's plan id. Expected `404`. A **functional assertion at a low, fixed rate**, not a latency measurement. It verifies the ownership filter still holds while under load
- **Database work:** expected 2 statements
- **Comparable:** S7 yes. S7b is a **behaviour difference, not a performance one**: the old code returned another user's plan (the missing ownership check) and must not be scored on latency

**S8 — `POST /api/diet/plan` with Gemini stubbed**
- **Auth:** Bearer
- **Gemini:** `stub`. Returns a fixed valid 5-meal payload after a configurable synthetic delay; default **0 ms**, so this scenario measures application overhead only (validation, transaction, serialisation). Longer fixed delays may be used for concurrency behaviour and must be labelled
- **Constraint:** one plan per user per UTC day (else `409`), so **each request needs a user with no plan today**. Iterations consume distinct seeded users; the pool is sized to the run's request count and reset between runs by deleting today's bench plans
- **Database work:** expected plan-exists select, constraints select, nested create of a plan and 5 meals
- **Enablers:** E1 (10 per hour per IP today), E2 (a Gemini stub seam, since none exists)
- **Success criteria:** `201`, 5 meals
- **Comparable:** **No.** The old route was `GET` with hard-coded biometrics

**S9 — Mixed workload** (`PROPOSED`)
- **Composition:** read-heavy with a smaller share of login/refresh and a small share of generation. The weights used in the previous plan (70/20/10) had no evidence behind them and are **withdrawn**; they are replaced by the request mix observed in production logs once Phase 0C provides it. Until then S9 is `UNAVAILABLE` and excluded from any gate
- **Gemini:** `stub`

**S10 — `POST /api/diet/plan` with real Gemini** (Phase 0B)
- **Environment:** run first on **Local + real Gemini + throwaway DB** to isolate model variance from network and database; repeated later on **Staging**
- **Concurrency:** low and fixed (1–3), sequential-leaning, to respect API limits and keep cost bounded
- **Inputs:** a fixed list of preference strings (a fixed set, so one prompt does not bias the result), each with a distinct seeded user
- **Sample size:** enough generations that the p95 and the retry rate are not dominated by a handful of samples. The count is set with the owner against a stated **spend cap** before running (`PROPOSED`, no value chosen here)
- **Recorded:** attempt latency, failure reason, retry, tokens, cost, model, region, time of day
- **Never gated.** Gemini variability would make a CI gate noisy

---

## 6. Run records and provenance

### 6.1 Rules

- Every benchmark execution produces **one JSON record** at `performance/runs/<run-id>.json`. This path is the proposal; it changes only if the directory layout is decided otherwise.
- **Every number in this document must cite a run ID that exists.** Tables in sections 14 and 17 are **generated** from the records between marker comments; they are not edited by hand.
- A validation script (built in Phase 2) fails if a table row cites a missing run, or if a rendered value differs from its record.
- A run from a **dirty working tree is unpublishable.** It may be kept for debugging but cannot feed this file.

### 6.2 Run ID format (`PROPOSED`)

```
<UTC timestamp>_<env>_<scenario>_<sha7>_<role>_r<NN>
20260921T143000Z_local_S6_a1b2c3d_current_r03
```

`role` is `baseline`, `current`, `calibration` or `aa`.

### 6.3 Record schema

```jsonc
{
  "run_id": "20260921T143000Z_local_S6_a1b2c3d_current_r03",
  "record_version": 1,
  "benchmark_version": "…",            // version of the scenario scripts + harness
  "timestamp_utc": "2026-09-21T14:30:00Z",
  "run_type": "measured | calibration | aa",
  "role": "baseline | current",
  "environment": "local | staging | production",
  "approval_ref": null,                  // required for any non-local synthetic load

  "git": { "commit": "…", "dirty": false, "branch": "…" },

  "scenario": {
    "id": "S6",
    "params_hash": "…",                  // hash of the full parameter set
    "executor": "constant-arrival-rate",
    "target_rate_rps": 0,
    "rate_fraction_of_capacity": 0.5,
    "ramp_s": 30, "warmup_s": 30, "duration_s": 300,
    "gemini_mode": "none | stub | real",
    "rate_limit_mode": "disabled | enabled"
  },

  "database": {
    "engine": "postgres", "version": "…", "image_digest": "…",
    "dataset_id": "D-M", "plans_per_user": 30,
    "dataset_checksum": "…",             // row counts + aggregate hash
    "migrations_applied": ["…"],         // the revision's own migration set
    "pool_max": 10,
    "config": { "shared_buffers": "…", "fsync": "on" }
  },

  "runtime": {
    "node": "…", "uv_threadpool_size": 4, "bcrypt_cost": 10,
    "k6_version": "…", "os": "…",
    "cpu_model": "…", "cores_total": 12, "ram_gb": 0,
    "cpu_pinning": { "loadgen": "…", "api": "…", "db": "…" },
    "load_average_before": 0
  },

  "result": {
    "latency_ms": { "p50": 0, "p90": 0, "p95": 0, "p99": 0, "max": 0 },
    "requests": { "total": 0, "ok": 0, "failed": 0, "timeouts": 0, "http_429": 0, "dropped_iterations": 0 },
    "throughput_rps": { "offered": 0, "successful": 0, "failed": 0 },
    "response_bytes": { "p50": 0, "p95": 0 },
    "db": { "statements_per_request": 0, "top_statements": [] },
    "infra": { "api_cpu_pct": 0, "api_rss_mb": 0, "db_cpu_pct": 0, "loadgen_cpu_pct": 0 }
  },

  "validity": { "valid": true, "violations": [] },
  "raw_output_path": "performance/runs/<run-id>.k6.json"
}
```

Gemini-specific fields (`gemini.attempts`, `gemini.tokens`, `gemini.cost_estimate`, `gemini.price_used`) are added for `gemini_mode: real` runs only.

---

## 7. Before/after methodology

The comparison is between two revisions of the code:

```text
BASELINE  = commit b6650da   (before the security/correctness pass)
CURRENT   = the working tree once committed
```

### 7.1 Precondition: CURRENT has no commit today

`git status` shows **41 uncommitted changes** on top of `b6650da`. A run against an uncommitted tree cannot be reproduced. **The pending work must be committed (or placed on a branch) before CURRENT can be benchmarked.** Committing is the owner's decision.

### 7.2 What is held constant

Same machine, Node version, Postgres version and image digest, dataset content, environment variables, scenarios, workload, k6 version, warm-up and duration, CPU pinning. **The revision is the only intended variable.** Runs are interleaved (section 4.5). Each revision runs in its own **git worktree** with its own dependency install, because the dependency sets differ (the new code adds `zod`, `helmet` and `express-rate-limit`, among others).

### 7.3 What legitimately differs between revisions

These are part of the revision, not confounders, and are recorded in the run record:

| Difference | Handling |
|---|---|
| The database is built from **each revision's own migration set** (CURRENT adds three indexes) | Same seed data loaded into both; migrations differ by design |
| Refresh-token storage format (raw vs hashed) | Per-revision seed adapter |
| Route contracts (`GET`→`POST` for plan generation; refresh/logout auth) | Per-revision scenario adapter |

### 7.4 Comparability matrix

| Scenario | Comparable BASELINE ↔ CURRENT | Notes |
|---|---|---|
| S1 login | **No** | Old code skipped `bcrypt.compare` |
| S2 signup | Partly | Old code did one fewer write |
| S3 refresh | Conditionally | Old route also required a Bearer token |
| S4 profile | Yes | |
| S5 latest | Yes | Includes new indexes |
| S6 history | Yes | Includes new indexes |
| S7 by id | Latency: yes. Behaviour: no | Old code lacked the ownership check |
| S8 generate | **No** | Different method and inputs |

Only rows marked *Yes* may be presented as "the fixes made this faster/slower". Everything else is reported as a **behaviour change**.

---

## 8. Regression gate (Phase 2)

### 8.1 Rule

A benchmark run is a **regression** only if **both** hold, for the scenario's p95:

```text
relative increase  > 20 %      (PROPOSED)
AND
absolute increase  > 50 ms     (PROPOSED)
```

and the run-set is not `noisy`, and the run ranges do not overlap (section 4.5).

### 8.2 Why both thresholds

| Threshold alone | Failure mode |
|---|---|
| Relative only | A 6 ms → 8 ms endpoint "regresses" by 33 % on noise |
| Absolute only | A 1,200 ms endpoint drifting by 40 ms (3 %) trips it, while a real 45 ms slowdown on a 100 ms endpoint (45 %) does not |

Requiring both trades a few missed marginal regressions for far fewer false alarms. The 20 % / 50 ms values are defaults to be tuned from the A/A noise floor, **never set below it**. A separate slow-creep report (cumulative drift against the last release baseline) covers what this rule can miss.

### 8.3 Edge cases

| Situation | Behaviour |
|---|---|
| **Baseline missing** | Gate passes with an explicit "no baseline" warning. The run is stored as a *candidate*; a human promotes it |
| **Sample too small** | Fewer than the minimum requests in the measured window (`PROPOSED`: set from the A/A run) or fewer than 5 runs → result is `inconclusive`, gate does not fail |
| **Variance too high** | CV above the noise limit → rerun once; if still noisy, `inconclusive`, non-blocking warning. Never a red build from a noisy result |
| **Naturally variable endpoints** (bcrypt-bound login/signup) | Own thresholds, set per scenario from that scenario's A/A spread, not the global default |
| **Gemini-dependent** | Excluded from the gate entirely. Stubbed scenarios stand in |
| **Baseline vs PR execution** | PR and its merge base run **back-to-back, interleaved, on the same runner** (a paired comparison), so shared-runner noise cancels rather than being compared against a stored number from another day |
| **Rollout** | **Advisory only** for the first weeks. It becomes blocking only after enough history shows a false-positive rate the owner accepts |

---

## 9. Instrumentation

### 9.1 Minimum useful set (Phase 1)

| Signal | Fields |
|---|---|
| Request | request ID (generated, echoed in a response header), method, **route pattern** (not the raw URL, so IDs do not create unbounded values), status, duration ms, response bytes |
| Database | Prisma operation name and duration; statement count per request. Confirm support under Prisma 7 with the pg driver adapter before committing to the mechanism, with a client extension around operations as the fallback |
| Gemini, per attempt | attempt number, latency ms, outcome (`ok`, `parse_error`, `schema_error`, `calorie_drift`, `timeout`, `api_error`), token counts when the SDK provides them |
| Gemini, per generation | total latency, attempts used, final outcome |

Local runs need **none of this** to produce a baseline: k6 supplies client-observed latency and `pg_stat_statements` supplies query counts and durations. Application instrumentation is what makes **production** observable and gives the history hotspot its serialisation timing.

### 9.2 Never logged

Passwords, JWTs (access or refresh), refresh-token hashes, API keys, secrets, `Authorization` and `Cookie` headers, `Set-Cookie` values, request bodies (signup bodies hold passwords; preferences are free text), and any personal data that is not needed. Log the **length** of preferences, not the content. The logger is configured with explicit redaction paths, not left to convention.

### 9.3 `/health`

Defined as an **availability signal**, not a performance proxy.

| Property | Definition |
|---|---|
| Purpose | Is the process alive and can it reach its database |
| Checks | Process responds; a trivial DB query (`SELECT 1`) under a short timeout (`PROPOSED`: 2 s) |
| Result | `200 { status: "ok" }` or `503 { status: "unavailable" }` |
| Excludes | Gemini. An external dependency outage should not mark the service down |
| Access | Unauthenticated, exempt from rate limiting, no secrets or version detail in the body |
| Benchmarking | Reported as its own line for monitoring-cost purposes. **Not** used to represent application performance |

`/ready` is introduced **only if** the hosting platform benefits from a separate readiness signal (an orchestrator that routes traffic on it, for example). That depends on the platform, which is unknown. Until then, one `/health` endpoint.

### 9.4 Prometheus and `/metrics`

**Not in Phase 1.** A metrics endpoint is added only when a concrete consumer exists (a Grafana or Better Stack agent, for example). Until then structured logs, k6 output and `pg_stat_statements` answer every question in this plan. An exposed `/metrics` also needs access control, which is one more reason not to add it speculatively. Listed as an optional next step in Phase 1.

---

## 10. Hotspot investigations

Three suspected hotspots. Each is a **measurement plan**, not a fix. No optimisation is chosen before its diagnosis is recorded.

### 10.1 Authentication (bcrypt)

Login is expected to be CPU-bound by design.

- **Measure:** S1 p50/p95/p99 across the load ladder; an isolated micro-benchmark of `bcrypt.hash` and `bcrypt.compare` at the configured cost on the benchmark machine; effect of `UV_THREADPOOL_SIZE` (default 4 bounds parallel hashing) at 1, 4 and 8 concurrent logins.
- **Current configuration:** cost **10**, hard-coded at [userRepository.ts:16](../server/src/repository/userRepository.ts#L16).
- **Not the goal:** the lowest possible latency. The goal is an appropriate security/performance balance. Cost is **not** lowered to hit a number. The security floor is set first (check current OWASP password-storage guidance for the minimum work factor) and the latency target is derived from it.
- **Legitimate levers if a target is missed:** thread-pool sizing, capacity, rate-limit design, and only then algorithm choice on security grounds.

### 10.2 Diet history

The endpoint returns up to 7 plans with all their meals. Whether the cost is query execution, relation loading, over-fetching, serialisation or payload size is **not yet known**.

| Step | What | Tool |
|---|---|---|
| 1 | Statement count and per-statement time, rows returned | `pg_stat_statements` |
| 2 | Plan for each statement | `EXPLAIN (ANALYZE, BUFFERS)` on the statements the ORM actually issues |
| 3 | End-to-end handler time versus DB time; the remainder is framework plus serialisation | k6 vs statement time; application timing once Phase 1 exists |
| 4 | Serialisation cost | Micro-benchmark `JSON.stringify` on a captured response |
| 5 | Payload size | k6 response bytes |
| 6 | Effect of data shape | S6 at 7, 30, 365 plans per user; with and without the new indexes (BASELINE vs CURRENT) |

| If the data shows | The candidate is |
|---|---|
| DB time dominates, plan shows a scan/sort | Index or query shape |
| Statement count is high | Relation loading strategy |
| Payload bytes dominate | Field selection, pagination, compression |
| Serialisation dominates | Response shaping |
| Pool wait dominates | Pool sizing |

### 10.3 Diet generation

The retry policy is `MAX_ATTEMPTS = 2` with a 30 s timeout per attempt ([geminiService.ts](../server/src/services/geminiService.ts)), so the worst case is **60 s plus database time**. The hosting proxy may cut a request sooner than that. The proxy limit is unknown (section 16).

- **Instrument** (section 9.1): attempt number, latency, outcome, timeout, retry, total.
- **Phase 0A:** S8 with the stub measures the non-Gemini overhead.
- **Phase 0B:** S10 measures the real distribution.
- **No change to retry behaviour** until the measured retry rate and failure-reason mix justify it. Also record the **client-observed timeout rate**, since users may abandon or be cut off before the server finishes.

---

## 11. Availability methodology

Historical availability **cannot be backfilled.** The server has kept no request logs and no monitor has ever run. The clock starts when probing is enabled.

| Parameter | Value | Status |
|---|---|---|
| Monitor start date | Not started | `UNAVAILABLE` |
| Monitor provider | To be chosen by the owner (options: an uptime-monitoring service, or a scheduled probe job) | Owner input |
| Probe target | `GET /health` (does not exist yet; a Phase 1 prerequisite) | `PROPOSED` |
| Probe regions | At least 2, outside the hosting provider's own network | `PROPOSED` |
| Probe interval | 60 s | `PROPOSED` |
| Probe timeout | 10 s | `PROPOSED` |
| A probe **fails** | Non-2xx, timeout, or invalid body | `PROPOSED` |
| **Downtime** begins | 2 consecutive failed probes from at least 2 locations (single location: 3) | `PROPOSED` |
| **Downtime** ends | First successful probe | `PROPOSED` |
| **Degraded** (recorded separately, not downtime) | Success but latency above 5× the baseline p95, or a cold start | `PROPOSED` |
| Maintenance | Excluded only if announced at least 24 h ahead and logged here with start and end. Otherwise counted | `PROPOSED` |
| Provider outages (host, database) | **Counted.** Users experience them as downtime | `PROPOSED` |
| Monthly availability | `1 − downtime_minutes ÷ minutes_in_calendar_month` (UTC). Probe-success ratio reported alongside | `PROPOSED` |

**Claim rules**

- No "30-day availability" figure is published before **30 full days** of data exist. Until then the figure is labelled `N days observed, partial`.
- Availability comes **only from production probes**. Windows in which a sanctioned load test or deployment ran are annotated and excluded from the comparison.
- Staging, if probed at all, is reported separately and never blended into production availability.
- An optional later probe that logs in and reads a profile (a synthetic journey) uses a **dedicated, flagged synthetic account** at a low rate (`PROPOSED`: no more than one per 5 min), because it exercises real code paths that `/health` does not.

---

## 12. Production safety rules

1. **Production never receives synthetic load without explicit, written approval.**
2. **Permitted without approval:** passive reading of logs and dashboards; and **safe probes**: unauthenticated `GET /health` at no more than one request per minute per location.
3. **If a production benchmark ever becomes necessary,** an approval record must define, *before* anything runs:

   | Item | Content |
   |---|---|
   | Traffic limit | Maximum requests/s and maximum concurrency |
   | Duration | Total and per-step |
   | Time window | A stated low-traffic window in UTC |
   | Rollback plan | How to stop the generator instantly and how to restore service |
   | Abort thresholds | For example: 5xx above 1 % for 30 s, p95 above 2× normal for 60 s, database connections or CPU near their limits, any user-facing complaint, or a stop request from the owner (all `PROPOSED`) |
   | Data isolation | Synthetic namespace, cleanup script, confirmation that no real records can be matched |
   | People | The owner reachable for the whole window |

   The approval reference is written into each run record (`approval_ref`).
4. **Synthetic load is aimed at Local or Staging.** Optimisation happens locally; staging confirms it under realistic conditions; production is only observed.

---

## 13. Targets

Kept separate from measurements. `PROPOSED` values are starting points and are **not** requirements until the owner agrees them. Where the repository gives no basis for a number the field says `TBD` rather than an invented figure.

| Metric | Baseline | Target | Target status | Actual | Run |
|---|---:|---:|---|---:|---|
| `GET /health` p95 (warm) | — | < 100 ms | `PROPOSED` | — | — |
| `GET /api/diet/history` p95 (local, `D-M`) | — | < 300 ms | `PROPOSED` | — | — |
| `GET /api/diet/latest` p95 (local, `D-M`) | — | < 300 ms | `PROPOSED` | — | — |
| `GET /api/user/profile` p95 (local, `D-M`) | — | < 300 ms | `PROPOSED` | — | — |
| `POST /api/auth/login` p95 | — | TBD | Derived from the bcrypt security floor (10.1) | — | — |
| `POST /api/user/signup` p95 | — | TBD | As above | — | — |
| `POST /api/diet/plan` (stub) p95 | — | TBD | Set from the baseline | — | — |
| `POST /api/diet/plan` (real) p95 | — | TBD | Needs Phase 0B data and the host's request timeout | — | — |
| Gemini first-attempt success | — | TBD | Needs Phase 0B data | — | — |
| 5xx rate (production) | — | TBD | Needs Phase 0C data | — | — |
| Monthly availability (production) | — | TBD | Owner decision; see section 11 | — | — |

Local targets are not production targets. Production targets are set only after Phase 0C observation.

---

## 14. Baseline results

Rendered from run records (section 6). Empty until the runs exist. Every cell is `—` for a reason stated beside it.

### 14.1 Phase 0A — Local, deterministic, Gemini not involved

**Status (2026-09-21):** harness built and validated; calibration done for S1–S7 on both revisions (S8 not yet calibrated); A/A noise floor measured for S4 and S6; **BASELINE-vs-CURRENT comparison not yet run**, because CURRENT is an uncommitted working tree and a dirty-tree run is unpublishable (decision N1, section 16.1). Only clean-tree, valid runs appear below.

**What the calibration already shows** (calibration is a capacity probe, not a result, and the CURRENT figures are from a dirty tree so they are not published here; both revisions' capacities are recorded in `work/capacity/` and are used only to pick the common rate for the comparison):
- The baseline schema has **no index on `DietPlan.userId` or `Diet.dietPlanId`**, and the baseline endpoints that filter on them (S5 latest, S6 history, S7 by id) saturate at a few tens of requests per second with the database as the bottleneck (Postgres pinned to one physical core), whereas the profile and refresh endpoints saturate at over a thousand. The three indexes added to CURRENT are therefore the leading candidate for the largest single change, which the comparison exists to confirm or refute.
- S1 (login) on the baseline hit the top of its ladder, consistent with the missing `await` on `bcrypt.compare`. S1 is not comparable across revisions (section 7.4).


<!-- BEGIN GENERATED:phase0a -->
_Rendered by `node performance/perf.mjs report` from 31 published run record(s) in `performance/runs/`. Excluded: 0 (0 from a dirty tree, 0 failed validity). Latencies in ms, per-run percentiles aggregated by **median across runs** (section 4.5)._

| Scenario | Role | Commit | Dataset | Rate (rps) | Profile | Harness | Runs | n / run | p50 | p90 | p95 | p99 | max | p95 min–max | CV(p95) % | Stmts / req | Resp bytes p50 |
|---|---|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|
| S4 | aa-a | `b6650da` | `D-M` | 640 | quick | 0.1.1 | 5 | 38401 | 0.64 | 0.83 | 0.97 | 2.63 | 15.3 | 0.88–1.68 | 30.6 **noisy** | 2.00 | 363.0 |
| S4 | aa-a | `b6650da` | `D-M` | 640 | quick | 0.2.0 | 5 | 38401 | 0.62 | 0.73 | 0.85 | 1.93 | 9.17 | 0.82–0.86 | 1.96 | 2.00 | 363.0 |
| S4 | aa-b | `b6650da` | `D-M` | 640 | quick | 0.1.1 | 5 | 38401 | 0.66 | 0.99 | 1.22 | 2.97 | 19.5 | 0.87–3.74 | 70.7 **noisy** | 2.00 | 363.0 |
| S4 | aa-b | `b6650da` | `D-M` | 640 | quick | 0.2.0 | 5 | 38401 | 0.62 | 0.72 | 0.84 | 1.89 | 9.26 | 0.84–0.85 | 0.69 | 2.00 | 363.0 |
| S4 | current | `b1fc986` | `D-M` | 320 | quick | 0.2.0 | 1 | 19201 | 1.12 | 1.67 | 1.92 | 3.81 | 11.9 | 1.92–1.92 | — | 2.00 | 363.0 |
| S6 | aa-a | `b6650da` | `D-M` | 10 | quick | 0.1.1 | 5 | 601 | 31.5 | 33.6 | 34.9 | 40.3 | 62.4 | 32.5–36.4 | 5.04 | 2.00 | 9988.0 |
| S6 | aa-b | `b6650da` | `D-M` | 10 | quick | 0.1.1 | 5 | 601 | 31.5 | 32.6 | 33.3 | 37.6 | 57.5 | 30.6–34.6 | 4.70 | 2.00 | 9988.0 |

**Calibrated capacity** (clean-tree calibration runs; rule in section 4.3):

| Scenario | Commit | Dataset | Capacity (rps) | Best p95 (ms) | Run |
|---|---|---|---:|---:|---|
| S1 | `b6650da` | `D-M` | 120 | 4.91 | `20260921T122534Z_local_S1_b6650da_calibration_r01` |
| S2 | `b6650da` | `D-M` | 60 | 52.1 | `20260921T123923Z_local_S2_b6650da_calibration_r01` |
| S3 | `b6650da` | `D-M` | 1280 | 0.85 | `20260921T120546Z_local_S3_b6650da_calibration_r01` |
| S4 | `b6650da` | `D-M` | 1280 | 1.17 | `20260921T115216Z_local_S4_b6650da_calibration_r01` |
| S5 | `b6650da` | `D-M` | 40 | 18.7 | `20260921T115534Z_local_S5_b6650da_calibration_r01` |
| S6 | `b6650da` | `D-M` | 20 | 57.0 | `20260921T115857Z_local_S6_b6650da_calibration_r01` |
| S7 | `b6650da` | `D-M` | 40 | 16.9 | `20260921T120223Z_local_S7_b6650da_calibration_r01` |

<details><summary>Run index (every run behind the tables above)</summary>

- **S4 / aa-a / b6650da / D-M / 640 rps / quick / harness 0.1.1**: `20260921T124620Z_local_S4_b6650da_aa-a_r01`, `20260921T124910Z_local_S4_b6650da_aa-a_r02`, `20260921T125159Z_local_S4_b6650da_aa-a_r03`, `20260921T125448Z_local_S4_b6650da_aa-a_r04`, `20260921T125736Z_local_S4_b6650da_aa-a_r05`
- **S4 / aa-a / b6650da / D-M / 640 rps / quick / harness 0.2.0**: `20260921T131454Z_local_S4_b6650da_aa-a_r01`, `20260921T131749Z_local_S4_b6650da_aa-a_r02`, `20260921T132047Z_local_S4_b6650da_aa-a_r03`, `20260921T132345Z_local_S4_b6650da_aa-a_r04`, `20260921T132641Z_local_S4_b6650da_aa-a_r05`
- **S4 / aa-b / b6650da / D-M / 640 rps / quick / harness 0.1.1**: `20260921T124745Z_local_S4_b6650da_aa-b_r01`, `20260921T125035Z_local_S4_b6650da_aa-b_r02`, `20260921T125324Z_local_S4_b6650da_aa-b_r03`, `20260921T125612Z_local_S4_b6650da_aa-b_r04`, `20260921T125901Z_local_S4_b6650da_aa-b_r05`
- **S4 / aa-b / b6650da / D-M / 640 rps / quick / harness 0.2.0**: `20260921T131622Z_local_S4_b6650da_aa-b_r01`, `20260921T131918Z_local_S4_b6650da_aa-b_r02`, `20260921T132215Z_local_S4_b6650da_aa-b_r03`, `20260921T132513Z_local_S4_b6650da_aa-b_r04`, `20260921T132808Z_local_S4_b6650da_aa-b_r05`
- **S4 / current / b1fc986 / D-M / 320 rps / quick / harness 0.2.0**: `20260921T143936Z_local_S4_b1fc986_current_r01`
- **S6 / aa-a / b6650da / D-M / 10 rps / quick / harness 0.1.1**: `20260921T130026Z_local_S6_b6650da_aa-a_r01`, `20260921T130315Z_local_S6_b6650da_aa-a_r02`, `20260921T130604Z_local_S6_b6650da_aa-a_r03`, `20260921T130853Z_local_S6_b6650da_aa-a_r04`, `20260921T131143Z_local_S6_b6650da_aa-a_r05`
- **S6 / aa-b / b6650da / D-M / 10 rps / quick / harness 0.1.1**: `20260921T130150Z_local_S6_b6650da_aa-b_r01`, `20260921T130440Z_local_S6_b6650da_aa-b_r02`, `20260921T130729Z_local_S6_b6650da_aa-b_r03`, `20260921T131018Z_local_S6_b6650da_aa-b_r04`, `20260921T131307Z_local_S6_b6650da_aa-b_r05`

</details>
<!-- END GENERATED:phase0a -->

**Database (local):** statements per request and top statements for S4–S8 — `—`. Pool wait — `UNAVAILABLE` until Phase 1 instrumentation.

### 14.2 Phase 0B — Real Gemini, then Staging

| Metric | Value | Environment | Status |
|---|---|---|---|
| Gemini attempt latency p50 / p95 | — | Local + real | `UNAVAILABLE`, needs a Gemini key and a spend cap |
| First-attempt success / retry / final failure | — | Local + real | `UNAVAILABLE` |
| Tokens and cost per plan | — | Local + real | `UNAVAILABLE` |
| End-to-end generation p50 / p95 | — | Local + real | `UNAVAILABLE` |
| Any API latency on real infrastructure | — | Staging | `UNAVAILABLE`, staging does not exist |

### 14.3 Phase 0C — Production observation

| Metric | Value | Status |
|---|---|---|
| Availability (7 d / 30 d) | — | `UNAVAILABLE`, no monitor running; cannot be backfilled |
| Request latency from real traffic | — | `UNAVAILABLE`, no request logging exists |
| Real request mix (feeds S9) | — | `UNAVAILABLE` |
| Cold-start behaviour | — | `UNAVAILABLE`, host and tier unknown |

---

## 15. Roadmap

Phases 0A/0B/0C run before everything else. Ordering follows the requested structure; the deviations and their reasons are stated.

### Phase 0A — Local deterministic measurement

Sequence in section 15.1. Needs **no** Gemini key, **no** remote database and **no** secrets from the owner.

### Phase 0B — Real Gemini and staging measurement

0B-i: real Gemini locally (S10). 0B-ii: staging, once it exists. Both gated on inputs in section 16.

### Phase 0C — Production monitoring

**Split**, because probing needs `/health` (Phase 1):
- **0C-1 (no code):** choose the provider and fix the methodology in section 11.
- **0C-2:** switch probes on once `/health` ships.

### Phase 1 — Foundation and instrumentation

**Ordered so the performance-relevant items come first:** `/health` and request-duration logging (the minimum set in 9.1) → configuration module → graceful shutdown → shared types → workspaces/tooling. Prometheus stays optional (9.4). **Deviation:** `/health` moves ahead of the rest of Phase 1 because Phase 0C-2 depends on it.

### Phase 2 — Safety net and performance regression CI

Unit and integration tests; the run-record validator; the paired PR-vs-base benchmark job, advisory first (section 8).

### Phase 3 — Data and query optimisation

Schema work (1-to-1 constraint, `@@unique([userId, date])`, timestamps, meal enum, `Session`), plus whatever the section 10 diagnoses justify. Each migration gets a BEFORE/AFTER entry and an `EXPLAIN` check. **Deviation from the earlier plan:** query optimisation is now driven by the diagnosis, not assumed.

### Phase 4 — Security and auth hardening

Session table, token rotation, password reset and email verification, 2FA, session management. Auth latency is re-measured after each change because these touch the login/refresh paths.

### Phase 5 — Tier 1 product features

Profile editing, activity level, meal logging, single-meal swap, weight tracking. Each ships with its own latency target.

### Phase 6 — Client refactor

**First step: capture a frontend baseline** (Lighthouse on mobile profile, five runs, median; JS transferred). It was deliberately excluded from Phase 0 and must exist before this phase changes anything.

### Phase 7 — Tier 2 features

Depth features (recipes, shopping list, weekly plans, structured allergies with deterministic checks, food-database verification).

### Phase 8 — Tier 3 / platform

Integrations, adaptive TDEE, coach mode, PWA/mobile, billing, admin.

### 15.1 Exact Phase 0A sequence

| # | Action | Output | Needs |
|---|---|---|---|
| 1 | **Decide how CURRENT gets a commit** (commit or branch the 41 pending changes) | An immutable SHA | Owner decision |
| 2 | Create the `performance/` directory skeleton and the safety guards G1–G4 | A harness that refuses unsafe targets | — |
| 3 | Local Postgres via Docker on `127.0.0.1`; enable `pg_stat_statements` and slow-query logging | Reproducible DB | — |
| 4 | Deterministic seed generator for `D-S`, `D-M` (and later `D-L`); build the template database; checksum it | `bench_seed_D-M` + dataset checksum | — |
| 5 | Token-minting step using throwaway secrets; per-revision seed adapters | Valid auth material for both revisions | — |
| 6 | **Enabler E1:** make the rate limits configurable so a benchmark can disable them | Unblocks S1, S2, S8 | Small application change |
| 7 | **Enabler E2:** add a Gemini stub seam | Unblocks S8 | Small application change |
| 8 | Install or containerise k6; write the scenario scripts (S3–S7 first, since they need no enabler) | Scenario scripts | — |
| 9 | **Smoke run** on `D-S`, one scenario, confirm the record schema and validity checks | First run record | — |
| 10 | **Calibration** per scenario | Capacity per scenario | — |
| 11 | **A/A test** (CURRENT vs CURRENT) | Noise floor | — |
| 12 | Interleaved **BASELINE vs CURRENT** runs, 5 each, for the comparable scenarios | Trustworthy baseline | Step 1 |
| 13 | Generate the tables in section 14 from the records; write the first improvement-log entries | Populated baseline | — |

**Status of the sequence (2026-09-21):** 2 done · 3 done · 4 done (`D-S`, `D-M`, and the S8 pool dataset `D-S/u2000/p1`; `D-M/u…` for S8 calibration not yet built) · 5 done · 6 and 7 done (E1, E2) · 8 done (k6 v2.2.0 from its pinned Docker image) · 9 done (smoke runs on both revisions; S8 smoke exposed the shared-pool bug) · 10 done for S1–S7, **S8 pending** · 11 done for S4 and S6 (S4 repeated after the quiet gate) · **12 blocked on N1** · 13 partially done (table below is generated; log entries added).

Owed before Phase 0A is closed: the BASELINE-vs-CURRENT runs (step 12), S8 calibration and runs, standard-profile confirmation runs, and A/A on the remaining scenarios.

S3–S7 (refresh, profile, latest, history, by-id) need **no application change** and can be baselined first. Only S1, S2 and S8 wait on E1/E2.

---

## 16. Inputs and blockers

### 16.1 Required now (blocks Phase 0A)

**Status:** N1 is **still open** and is the only remaining blocker. N2 and N3 were exercised when execution was authorised (k6 runs from its Docker image with no host install; E1 and E2 are implemented in `server/src/middleware/rateLimiters.ts` and `server/src/services/geminiStub.ts`, both refused in production).

| # | Input | Why |
|---|---|---|
| N1 | **Decision on committing the 41 pending changes** (or a branch) | Without a SHA, CURRENT cannot be reproduced. Only the BASELINE-vs-CURRENT comparison (step 12) waits on this; steps 2–11 do not |
| N2 | **Approval to install k6**, or to run its Docker image | Nothing else can generate load |
| N3 | **Approval for the two small enabler changes E1 and E2**, when implementation starts | S1, S2 and S8 cannot run against the current rate limits or without a stub |

Docker (29.1.3), Postgres tooling and Node 24.11.1 are already present. This machine has 6 physical cores (12 threads) and about 15 GB of RAM.

### 16.2 Required later

| # | Input | Needed for |
|---|---|---|
| L1 | Gemini API key, a **spend cap**, and permission to spend | Phase 0B-i |
| L2 | Whether a **staging** environment exists; if not, agreement to create one (separate deployment, database and secrets) | Phase 0B-ii |
| L3 | **Postgres major version** of the deployed database | Matching the local image so results are comparable |
| L4 | **Hosting platform, tier, region** and its **request-timeout limit** | Cold-start analysis and interpreting the 60 s generation worst case. The current setup connects directly on port 5432, not through a pooler |
| L5 | **Monitoring provider** and probe locations | Phase 0C |
| L6 | **Where users are** | Interpreting production latency |
| L7 | **Your targets** (or approval of section 13) | Pass/fail judgement of any number |
| L8 | Log retention and volume limits on the host | Deciding the production log level |

### 16.3 Not required

| Item | How it is handled |
|---|---|
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Throwaway values generated for local runs |
| A Gemini key for Phase 0A | Stub used; Gemini metrics stay `UNAVAILABLE` until 0B |
| Access to the remote Supabase database | **Not used and not wanted.** No synthetic load reaches it (section 2.2) |
| The production API URL for Phase 0A | Not touched until 0C, and then only by safe probes |
| Any secret from `server/.env` | Never read by the harness (G1). The unused `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` entries there should be removed since nothing consumes them |

---

## 17. Improvement log

Newest first. **An entry needs a before and an after from the same environment and scenario, each with a run ID.** An entry without both is a note, not a result. Entries are generated from run records.

### Entry template

```
### YYYY-MM-DD — <short title>
- Commit: <sha>   (BASELINE <sha> → CURRENT <sha>)
- Change: <what and why, one or two lines>
- Environment / scenario: <local|staging|production> / <Sx>
- Metric: <p95 | throughput | statements per request | …>
- Before: <median of 5> [min–max] (runs <ids>)
- After:  <median of 5> [min–max] (runs <ids>)
- Delta: <absolute and %>   Verdict: <improvement | regression | no detectable change>
- Side effects: <other scenarios, cost, complexity>
```

### 2026-09-21 — Phase 0A harness built; noise floor established
- Commit: `b6650da` (baseline, clean). CURRENT not yet committed.
- Change: benchmark harness (`performance/`), safety guards G1–G4, deterministic seeding, calibration, A/A, run records, generated tables. Two small server enablers added (E1, E2).
- Environment / scenario: local / S4 and S6 A/A on `b6650da`
- Metric: run-to-run spread of p95 on identical code
- Result: S4 spread fell from CV 63 % (harness 0.1.1) to 1.4 % (harness 0.2.0) after adding the quiet gate. S6 CV 5 % without it. See 14.1 and 4.7.
- Verdict: **harness validated.** No code-performance improvement is claimed: the comparison has not been run.
- Side effects: two harness defects found and fixed before any published number depended on them (shared S8 user pool; over-long S2 identifiers).

### 2026-09-21 — Plan revised
- Commit: `b6650da` (HEAD). The working tree is uncommitted.
- Change: this document rewritten. Environments separated, Gemini removed as a Phase 0 blocker, scenarios made reproducible, run provenance and statistics defined, regression gate hardened, production safety rules added.
- Result: **no measurements taken.**
- Note: the earlier security and correctness work (bcrypt `await`, hashed refresh tokens, helmet, rate limits, indexes, Gemini validation and retry, `POST /diet/plan`) was **not benchmarked before or after**. Its effect can be recovered through the BASELINE-vs-CURRENT method in section 7, limited to the comparable scenarios in section 7.4.

---

## 18. Document changelog

| Date | Change |
|---|---|
| 2026-09-21 | Created |
| 2026-09-21 | Revision 3: Phase 0A executed: harness, findings (4.7), capacity rule as implemented, profiles, guard G4 as built, hardware corrected to 6 cores / 12 threads, generated tables, status of steps and blockers |
| 2026-09-21 | Revision 2: environment separation; Phase 0 split into 0A/0B/0C; safety guardrails; scenario specifications; run-record schema; interleaved before/after with A/A noise floor; regression gate rules; instrumentation minimised; hotspot diagnosis plans; availability methodology; production safety rules; labelled targets |
