# performance/

Benchmark harness for NECTAR. The plan, methodology and results live in [../docs/PERFORMANCE.md](../docs/PERFORMANCE.md); this file only says how to drive the tool.

**Safety.** Everything here targets a throwaway Postgres on `127.0.0.1` and refuses any other database (guards G1–G4 in `lib/guards.mjs`). It never reads `server/.env`. It must never be pointed at the remote Supabase database or any deployed API.

## Requirements

Node 24, Docker. k6 runs from its pinned Docker image (no host install). Postgres runs in a container bound to loopback.

```bash
cd performance && npm install
```

## Commands

```bash
node perf.mjs db up                                   # start local Postgres (loopback only)
node perf.mjs seed --dataset D-M --revision baseline  # build a deterministic template DB + fixtures
node perf.mjs calibrate --scenario S6 --revision baseline --dataset D-M
node perf.mjs run --scenario S6 --revision baseline --dataset D-M --profile quick --rate 200
node perf.mjs aa --scenario S6 --revision baseline --dataset D-M --profile quick --fraction 0.5 --runs 5
node perf.mjs compare --scenario S6 --dataset D-M --profile quick --fraction 0.5 --runs 5
node perf.mjs summarize --scenario S6
node perf.mjs db down [--wipe]
```

- `--revision baseline` = commit `b6650da` in its own git worktree under `work/worktrees/` (created and installed on first `seed`).
- `--revision current` = this working tree. A run against a dirty tree is recorded with `git.dirty: true` and is **unpublishable**.
- Dataset ids: `D-S`, `D-M`, `D-L`, with modifiers `/p<plans-per-user>` and `/u<users>`, e.g. `D-M/p365`.
- Profiles: `quick` (10 s ramp, 10 s warm-up, 60 s measured) is interim; `standard` (30/30/300) is the plan's proposed profile.

## Layout

| Path | What |
|---|---|
| `perf.mjs` | CLI and run orchestration |
| `lib/` | guards, Postgres container, revisions/worktrees, deterministic seeding, API launcher, k6 runner |
| `k6/scenarios.js` | scenarios S1–S8 |
| `runs/` | **Committed** run records (`<run-id>.json`) plus k6 summaries (`<run-id>.k6.json`) |
| `work/` | Ignored: fixtures, template metadata, worktrees, logs, capacity files |
