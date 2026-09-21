import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = resolve(ROOT, '..');
export const WORK = resolve(ROOT, 'work');
export const RUNS = resolve(ROOT, 'runs');

export const BENCHMARK_VERSION = '0.2.0';

// Local throwaway Postgres. Bound to loopback only (see lib/postgres.mjs).
export const PG = {
  container: 'nectar-bench-postgres',
  // Pinned by digest so every run uses byte-identical Postgres binaries.
  image: 'postgres@sha256:1957b2ff3137e4ef7f3bc813e74fff50b1e1ffddc85c8b9d6f14ade972be8687',
  host: '127.0.0.1',
  port: 55432,
  user: 'bench',
  password: 'bench',
  adminDb: 'postgres',
  volume: 'nectar_bench_pgdata',
};

export const K6_IMAGE = 'grafana/k6@sha256:5221b620a4f874faff6e32ba597aa667c058391fe4898b1c6f6377f062c6cdec'; // k6 v2.2.0

export const API_PORT = 5055;

// Throwaway secrets. They exist only for local benchmark runs and protect nothing.
export const BENCH_SECRETS = {
  access: 'bench-only-access-secret-protects-nothing',
  refresh: 'bench-only-refresh-secret-protects-nothing',
};
export const BENCH_PASSWORD = 'bench-password-1';
export const BENCH_EMAIL_DOMAIN = 'bench.nectar.invalid';

// PROPOSED CPU split on this 6-core / 12-thread machine (physical core 0 left for the OS). Recorded in every run.
export const CPU_PINNING = { db: '1,7', api: '2,3,8,9', loadgen: '4,5,10,11' }; // by physical core: SMT siblings are (0,6)(1,7)(2,8)(3,9)(4,10)(5,11)

export const BASELINE_COMMIT = 'b6650da';

// Date all seeded plans are anchored to (never "now"), so datasets are deterministic.
export const SEED_ANCHOR_UTC = Date.UTC(2026, 0, 1);
