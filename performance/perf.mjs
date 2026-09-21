#!/usr/bin/env node
// Benchmark harness CLI. See docs/PERFORMANCE.md.
//
//   node perf.mjs db up|down|status
//   node perf.mjs seed      --dataset D-M --revision baseline|current
//   node perf.mjs calibrate --scenario S6 --revision baseline --dataset D-M
//   node perf.mjs run       --scenario S6 --revision baseline --dataset D-M --profile quick --rate 200 [--label baseline]
//   node perf.mjs aa        --scenario S6 --revision baseline --dataset D-M --profile quick --fraction 0.5 --runs 5
//   node perf.mjs compare   --scenario S6 --dataset D-M --profile quick --fraction 0.5 --runs 5
//   node perf.mjs summarize [--scenario S6]
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import {
  API_PORT, BENCHMARK_VERSION, BENCH_PASSWORD, CPU_PINNING, K6_IMAGE, PG, RUNS, WORK,
} from './lib/env.mjs';
import { BASE_URL, startApi } from './lib/api.mjs';
import { runK6 } from './lib/k6.mjs';
import * as pgm from './lib/postgres.mjs';
import { ensureBaselineWorktree, revision } from './lib/revisions.mjs';
import { buildTemplate, ensureTemplate, fixturePath, parseDataset, templateName } from './lib/seed.mjs';

const PROFILES = {
  // PROPOSED "standard" from docs/PERFORMANCE.md 4.4; "quick" is an interim shortened profile.
  standard: { ramp_s: 30, warmup_s: 30, duration_s: 300 },
  quick: { ramp_s: 10, warmup_s: 10, duration_s: 60 },
};
const LADDER = [5, 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120];

function args() {
  const a = {}; const argv = process.argv.slice(3);
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[++i]; }
  return a;
}
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

function machine() {
  const read = (p) => { try { return readFileSync(p, 'utf8').trim(); } catch { return null; } };
  return {
    os: `${os.type()} ${os.release()}`, node: process.version, k6_image: K6_IMAGE,
    cpu_model: os.cpus()[0].model, threads_total: os.cpus().length, physical_cores: 6, ram_gb: Math.round(os.totalmem() / 2 ** 30),
    cpu_governor: read('/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor'),
    turbo_disabled: read('/sys/devices/system/cpu/intel_pstate/no_turbo') === '1',
    ac_power: ['AC', 'AC0', 'ACAD', 'ADP1'].some((n) => read(`/sys/class/power_supply/${n}/online`) === '1'),
    load_average_before: os.loadavg()[0].toFixed(2) * 1,
    cpu_pinning: CPU_PINNING, uv_threadpool_size: 4, bcrypt_cost: 10,
  };
}

// Foreign-load gate. The A/A test showed identical code varying 4x in p95 when other
// services on this machine were busy. Sample CPU use on every core the benchmark
// pins (plus the OS core) and wait until they are idle before starting a run.
function cpuTimes() {
  const out = {};
  for (const line of readFileSync('/proc/stat', 'utf8').split('\n')) {
    const m = line.match(/^cpu(\d+) (.*)$/);
    if (!m) continue;
    const f = m[2].trim().split(/\s+/).map(Number);
    out[m[1]] = { idle: f[3] + f[4], total: f.slice(0, 8).reduce((a, b) => a + b, 0) };
  }
  return out;
}
function expandCpus(list) {
  return list.split(',').flatMap((x) => (x.includes('-') ? Array.from({ length: +x.split('-')[1] - +x.split('-')[0] + 1 }, (_, i) => +x.split('-')[0] + i) : [+x]));
}
async function waitForQuiet({ maxBusyPct = 10, timeoutS = 300, windowMs = 3000 } = {}) {
  const cpus = [...new Set([0, 6, ...Object.values(CPU_PINNING).flatMap(expandCpus)])].map(String);
  const start = Date.now();
  for (;;) {
    const a = cpuTimes(); await sleep(windowMs); const b = cpuTimes();
    const busy = cpus.map((c) => 100 * (1 - (b[c].idle - a[c].idle) / (b[c].total - a[c].total)));
    const worst = Math.max(...busy);
    if (worst <= maxBusyPct) return { waited_s: Math.round((Date.now() - start) / 1000), busiest_cpu_pct: +worst.toFixed(1), threshold_pct: maxBusyPct };
    if (Date.now() - start > timeoutS * 1000) throw new Error(`Machine not quiet after ${timeoutS}s (busiest CPU ${worst.toFixed(0)}% > ${maxBusyPct}%). Refusing to record a noisy run.`);
  }
}

function scenarioEnv(scenario, rev) {
  const server = {};
  const local = { RATE_LIMIT_DISABLED: 'true' };
  // E1/E2 only exist in CURRENT; the baseline revision has no limiter and no stub.
  if (rev.role === 'current') { Object.assign(server, local); if (scenario === 'S8') server.GEMINI_MODE = 'stub'; }
  return server;
}

// ---------------------------------------------------------------------------
async function withRun({ rev, dataset, scenario, runId }, body) {
  const tpl = await ensureTemplate({ dataset, rev });
  const runDb = `bench_run_${runId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(-18)}`;
  await pgm.createDb(runDb, templateName(dataset, rev.role));
  let api;
  try {
    api = await startApi({ rev, dbName: runDb, runId, extraEnv: scenarioEnv(scenario, rev) });
    return await body({ runDb, api, tpl });
  } finally {
    if (api) await api.stop();
    await pgm.dropDb(runDb);
  }
}

function k6Env({ scenario, rev, dataset, extra }) {
  return {
    BASE_URL, SCENARIO: scenario, FIXTURE: `/work/work/fixtures/${parseDataset(dataset).key}.json`,
    BENCH_PASSWORD, REFRESH_NEEDS_BEARER: rev.refreshNeedsBearer ? 1 : 0,
    // Baseline had no ownership check, so it returned the other user's plan.
    EXPECT_FOREIGN_STATUS: rev.role === 'baseline' ? 200 : 404,
    EXPECT_GENERATE_STATUS: rev.role === 'baseline' ? 200 : 201,
    SEED: 1, ...extra,
  };
}

async function pollConnections(runDb, state) {
  const c = await pgm.connect('postgres');
  try {
    while (!state.stop) {
      const r = await c.query('SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = $1', [runDb]);
      state.max = Math.max(state.max ?? 0, r.rows[0].n);
      await sleep(1000);
    }
  } finally { await c.end(); }
}

function sub(metrics, name, scenario) { return metrics[`${name}{scenario:${scenario}}`]?.values ?? null; }

function extract(data, scenario) {
  const m = data.metrics;
  const lat = sub(m, 'http_req_duration', scenario) ?? {};
  const reqs = sub(m, 'http_reqs', scenario) ?? { count: 0, rate: 0 };
  const failed = sub(m, 'http_req_failed', scenario) ?? { rate: 0, passes: 0, fails: 0 };
  const checks = sub(m, 'checks', scenario) ?? { rate: 1, passes: 0, fails: 0 };
  const cnt = (n) => sub(m, n, scenario)?.count ?? 0;
  const bytes = sub(m, 'body_bytes', scenario) ?? {};
  return {
    latency_ms: { p50: lat['p(50)'], p90: lat['p(90)'], p95: lat['p(95)'], p99: lat['p(99)'], min: lat.min, max: lat.max },
    requests: {
      total: reqs.count, failed: failed.passes, unexpected_status_rate: failed.rate,
      check_failures: checks.fails, http_2xx: cnt('resp_2xx'), http_4xx: cnt('resp_4xx'), http_429: cnt('resp_429'),
      http_5xx: cnt('resp_5xx'), dropped_iterations: cnt('dropped_iterations'), pool_exhausted: cnt('pool_exhausted'),
    },
    response_bytes: { p50: bytes['p(50)'], p95: bytes['p(95)'], max: bytes.max },
  };
}

function validity(result, loadgenCpuPctOfAllotment) {
  const v = []; const r = result.requests;
  if (r.dropped_iterations > 0) v.push(`dropped_iterations=${r.dropped_iterations}`);
  if (r.http_429 > 0) v.push(`http_429=${r.http_429}`);
  if (r.pool_exhausted > 0) v.push(`pool_exhausted=${r.pool_exhausted}`);
  if (r.total > 0 && r.unexpected_status_rate > 0.001) v.push(`unexpected_status_rate=${r.unexpected_status_rate}`);
  if (r.total > 0 && r.check_failures / r.total > 0.001) v.push(`check_failures=${r.check_failures}`);
  if (loadgenCpuPctOfAllotment > 70) v.push(`loadgen_cpu=${loadgenCpuPctOfAllotment.toFixed(0)}%`);
  return { valid: v.length === 0, violations: v };
}

async function runOnce(o) {
  const rev = revision(o.revision);
  const git = rev.describe();
  const profile = PROFILES[o.profile];
  if (!profile) throw new Error(`unknown profile ${o.profile}`);
  const label = o.label ?? o.revision;
  const runId = `${stamp()}_local_${o.scenario}_${git.commit}${git.dirty ? '-dirty' : ''}_${label}_r${String(o.n ?? 1).padStart(2, '0')}`;
  const quiet = await waitForQuiet();
  const host = { ...machine(), pre_run_quiet_gate: quiet };
  const rate = Number(o.rate);

  return withRun({ rev, dataset: o.dataset, scenario: o.scenario, runId }, async ({ runDb, api, tpl }) => {
    if (o.scenario === 'S8') {
      const need = Math.ceil((profile.ramp_s * rate) / 2) + 10 + profile.warmup_s * rate + 10 + profile.duration_s * rate + 10;
      if (need > tpl.counts.User) throw new Error(`S8 needs ${need} unused users at ${rate} rps but ${o.dataset} has ${tpl.counts.User}. Use e.g. --dataset ${o.dataset.split('/')[0]}/u${need + 500}/p1`);
    }
    const admin = await pgm.connect(runDb);
    await admin.query('SELECT pg_stat_statements_reset()');
    const conn = { stop: false, max: 0 }; const poller = pollConnections(runDb, conn);
    const cpu0 = api.cpuSeconds(); const t0 = Date.now();

    const k6 = await runK6({
      runId,
      env: k6Env({ scenario: o.scenario, rev, dataset: o.dataset, extra: {
        MODE: 'measured', RATE: rate, RAMP_S: profile.ramp_s, WARMUP_S: profile.warmup_s, DURATION_S: profile.duration_s,
        PRE_VUS: o.prevus ?? 50, MAX_VUS: o.maxvus ?? 400,
      } }),
    });

    const wall = (Date.now() - t0) / 1000; const cpu1 = api.cpuSeconds();
    conn.stop = true; await poller;
    api.assertLoopback(); // G4 again, now that the pool has connections

    if (!existsSync(k6.summaryPath)) throw new Error(`k6 produced no summary (exit ${k6.code}):\n${k6.log.slice(-1500)}`);
    const data = JSON.parse(readFileSync(k6.summaryPath, 'utf8'));
    const result = extract(data, 'measured');

    const total = ['ramp', 'warmup', 'measured'].reduce((s, n) => s + (sub(data.metrics, 'http_reqs', n)?.count ?? 0), 0);
    const stmts = (await admin.query(
      `SELECT left(query, 160) AS query, calls::int, round(total_exec_time::numeric, 2)::float AS total_ms,
              round(mean_exec_time::numeric, 3)::float AS mean_ms, rows::int
       FROM pg_stat_statements WHERE dbid = (SELECT oid FROM pg_database WHERE datname = $1)
         AND query NOT ILIKE '%pg_stat_statements%' ORDER BY total_exec_time DESC LIMIT 8`, [runDb])).rows;
    const allCalls = (await admin.query(
      `SELECT coalesce(sum(calls),0)::int AS n FROM pg_stat_statements
       WHERE dbid = (SELECT oid FROM pg_database WHERE datname = $1)
         AND query NOT ILIKE '%pg_stat_statements%' AND query !~* '^(BEGIN|COMMIT|ROLLBACK)'`, [runDb])).rows[0].n;
    await admin.end();

    const avg = (xs) => (xs?.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
    const st = k6.stats;
    const lgKey = Object.keys(st).find((k) => k.startsWith('bench-k6'));
    const lgPct = lgKey ? avg(st[lgKey]) / (CPU_PINNING.loadgen.split(',').length * 100) * 100 : 0;
    const v = validity(result, lgPct);

    const record = {
      run_id: runId, record_version: 1, benchmark_version: BENCHMARK_VERSION, timestamp_utc: new Date().toISOString(),
      run_type: o.runType ?? 'measured', role: label, environment: 'local', approval_ref: null,
      git,
      scenario: {
        id: o.scenario, executor: 'constant-arrival-rate', target_rate_rps: rate, rate_fraction_of_capacity: o.fraction ? Number(o.fraction) : null,
        profile: o.profile, ...profile, gemini_mode: o.scenario === 'S8' ? (rev.role === 'current' ? 'stub' : 'n/a (baseline has no stub)') : 'none',
        rate_limit_mode: rev.role === 'current' ? 'disabled' : 'not present in this revision',
      },
      database: {
        engine: 'postgres', ...(await pgm.serverInfo()), dataset_id: o.dataset, dataset_checksum: tpl.checksum, counts: tpl.counts,
        migrations_applied: tpl.migrations, pool_max: 10, pool_max_note: 'pg default; not set by the app',
        max_connections_observed: conn.max, template: tpl.name,
      },
      runtime: { ...host, k6_container: k6.containerName },
      result: {
        ...result,
        throughput_rps: { offered: rate, achieved: +(result.requests.total / profile.duration_s).toFixed(2) },
        db: { statements_per_request: total ? +(allCalls / total).toFixed(2) : null, window: 'entire run incl. ramp+warm-up', top_statements: stmts },
        infra: {
          api_cpu_pct_of_one_core: +(((cpu1 - cpu0) / wall) * 100).toFixed(1), api_rss_peak_mb: api.rssMb(),
          db_cpu_pct_avg: avg(st[PG.container] ?? null), db_cpu_pct_max: st[PG.container] ? Math.max(...st[PG.container]) : null,
          loadgen_cpu_pct_of_allotment: +lgPct.toFixed(1),
        },
      },
      validity: v,
      raw_output_path: `performance/runs/${runId}.k6.json`,
    };
    mkdirSync(RUNS, { recursive: true });
    writeFileSync(join(RUNS, `${runId}.json`), JSON.stringify(record, null, 2));
    copyFileSync(k6.summaryPath, join(RUNS, `${runId}.k6.json`));
    const l = record.result.latency_ms;
    console.log(`${runId}  n=${result.requests.total} p50=${l.p50?.toFixed(1)} p95=${l.p95?.toFixed(1)} p99=${l.p99?.toFixed(1)} ${v.valid ? 'VALID' : 'INVALID ' + v.violations.join(',')}${git.dirty ? ' DIRTY(unpublishable)' : ''}`);
    return record;
  });
}

// ---------------------------------------------------------------------------
const capacityPath = (rev, dataset, scenario) => join(WORK, 'capacity', `${rev}_${parseDataset(dataset).key}_${scenario}.json`);

async function calibrate(o) {
  const rev = revision(o.revision); const git = rev.describe();
  const stepS = Number(o.steps ?? 20);
  const ladder = (o.ladder ? String(o.ladder).split(',').map(Number) : LADDER);
  await waitForQuiet();
  const runId = `${stamp()}_local_${o.scenario}_${git.commit}${git.dirty ? '-dirty' : ''}_calibration_r01`;

  return withRun({ rev, dataset: o.dataset, scenario: o.scenario, runId }, async ({ api, tpl }) => {
    if (o.scenario === 'S8') {
      const need = ladder.reduce((sum, r) => sum + r * stepS + 10, 0);
      if (need > tpl.counts.User) throw new Error(`S8 calibration needs ${need} unused users but ${o.dataset} has ${tpl.counts.User}. Use a smaller --ladder or a larger /u dataset.`);
    }
    const k6 = await runK6({ runId, env: k6Env({ scenario: o.scenario, rev, dataset: o.dataset, extra: {
      MODE: 'calibrate', STEPS: ladder.join(','), STEP_S: stepS, PRE_VUS: o.prevus ?? 50, MAX_VUS: o.maxvus ?? 400 } }) });
    api.assertLoopback();
    if (!existsSync(k6.summaryPath)) throw new Error(`k6 produced no summary:\n${k6.log.slice(-1500)}`);
    const data = JSON.parse(readFileSync(k6.summaryPath, 'utf8'));
    const steps = ladder.map((rate, i) => ({ rate, ...extract(data, `step_${i}`) }));
    // Reference p95 = the lowest p95 seen before the first saturated step. (Low rates are
    // slower than moderate ones on this laptop: powersave governor + idle states.)
    const saturated = (s) => s.requests.dropped_iterations > 0 || s.requests.http_429 > 0 || s.requests.unexpected_status_rate > 0.001;
    const firstBad = steps.findIndex(saturated);
    const usable = firstBad === -1 ? steps : steps.slice(0, firstBad);
    const bestP95 = Math.min(...usable.map((s) => s.latency_ms.p95));
    // Steps below the best one are the low-load regime and are ignored; scan upward from the best step.
    const bestIdx = steps.findIndex((s) => s.latency_ms.p95 === bestP95);
    let capacity = null;
    for (const s of steps.slice(bestIdx)) {
      if (saturated(s) || s.latency_ms.p95 > 2 * bestP95) break;
      capacity = s.rate;
    }
    const out = { run_id: runId, run_type: 'calibration', environment: 'local', git, dataset_id: o.dataset,
      scenario: o.scenario, step_seconds: stepS, best_p95_ms: bestP95, capacity_rps: capacity,
      rule: 'scanning up from the step with the lowest p95: the last step before the first that has dropped iterations, 429s, >0.1% unexpected status, or p95 > 2x that lowest p95',
      database: { checksum: tpl.checksum }, steps: steps.map((s) => ({ rate: s.rate, achieved_rps: +(s.requests.total / stepS).toFixed(1), p50: s.latency_ms.p50, p95: s.latency_ms.p95, p99: s.latency_ms.p99, dropped: s.requests.dropped_iterations, errors: s.requests.http_5xx + s.requests.http_4xx })) };
    mkdirSync(join(WORK, 'capacity'), { recursive: true });
    writeFileSync(capacityPath(o.revision, o.dataset, o.scenario), JSON.stringify(out, null, 2));
    writeFileSync(join(RUNS, `${runId}.json`), JSON.stringify(out, null, 2));
    console.log(`${o.scenario} ${o.revision} ${o.dataset}: capacity=${capacity} rps (best p95 ${bestP95?.toFixed(1)} ms)`);
    for (const s of out.steps) console.log(`   ${String(s.rate).padStart(5)} rps -> achieved ${s.achieved_rps?.toFixed(0).padStart(5)}  p50 ${s.p50?.toFixed(1)}  p95 ${s.p95?.toFixed(1)}  p99 ${s.p99?.toFixed(1)}  dropped ${s.dropped}  err ${s.errors}`);
    return out;
  });
}

const readCapacity = (rev, dataset, scenario) => JSON.parse(readFileSync(capacityPath(rev, dataset, scenario), 'utf8')).capacity_rps;

// ---------------------------------------------------------------------------
async function main() {
  const cmd = process.argv[2]; const sub2 = process.argv[3]; const a = args();
  if (cmd === 'db') {
    if (sub2 === 'up') { pgm.up(); await pgm.waitReady(); console.log('postgres up', await pgm.serverInfo()); }
    else if (sub2 === 'down') { pgm.down({ wipe: process.argv.includes('--wipe') }); console.log('postgres down'); }
    else console.log(pgm.containerRunning() ? 'running' : 'stopped');
    return;
  }
  if (cmd === 'seed') {
    const rev = a.revision === 'baseline' ? ensureBaselineWorktree() : revision(a.revision);
    await pgm.waitReady();
    await buildTemplate({ dataset: a.dataset, rev });
    return;
  }
  if (cmd === 'calibrate') { await pgm.waitReady(); await calibrate(a); return; }
  if (cmd === 'run') { await pgm.waitReady(); await runOnce(a); return; }
  if (cmd === 'aa') {
    await pgm.waitReady();
    const rate = a.rate ?? Math.round(Number(a.fraction) * readCapacity(a.revision, a.dataset, a.scenario));
    console.log(`A/A ${a.scenario} on ${a.revision}: rate ${rate} rps (fraction ${a.fraction})`);
    for (let i = 1; i <= Number(a.runs ?? 5); i++) for (const label of ['a', 'b']) {
      await runOnce({ ...a, rate, label: `aa-${label}`, runType: 'aa', n: i }); await sleep(3000);
    }
    return;
  }
  if (cmd === 'compare') {
    await pgm.waitReady();
    const caps = ['baseline', 'current'].map((r) => readCapacity(r, a.dataset, a.scenario));
    const rate = a.rate ?? Math.round(Number(a.fraction) * Math.min(...caps));
    console.log(`BASELINE vs CURRENT ${a.scenario}: capacities ${caps.join(' / ')} -> common rate ${rate} rps`);
    for (let i = 1; i <= Number(a.runs ?? 5); i++) for (const r of ['baseline', 'current']) {
      await runOnce({ ...a, revision: r, rate, label: r, n: i }); await sleep(3000);
    }
    return;
  }
  if (cmd === 'summarize') { summarize(a); return; }
  if (cmd === 'report') { report(); return; }
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'));
}

function summarize(a) {
  const recs = readdirSync(RUNS).filter((f) => f.endsWith('.json') && !f.endsWith('.k6.json'))
    .map((f) => JSON.parse(readFileSync(join(RUNS, f), 'utf8'))).filter((r) => r.run_type !== 'calibration' && (!a.scenario || r.scenario.id === a.scenario));
  const groups = {};
  for (const r of recs) (groups[`${r.scenario.id}|${r.role}|${r.git.commit}|${r.database.dataset_id}|${r.scenario.target_rate_rps}|${r.scenario.profile}`] ||= []).push(r);
  for (const [k, rs] of Object.entries(groups)) {
    const valid = rs.filter((r) => r.validity.valid);
    const p95 = valid.map((r) => r.result.latency_ms.p95);
    const cv = p95.length > 1 ? (Math.sqrt(p95.reduce((s, x) => s + (x - p95.reduce((a2, b) => a2 + b, 0) / p95.length) ** 2, 0) / (p95.length - 1)) / (p95.reduce((a2, b) => a2 + b, 0) / p95.length)) * 100 : NaN;
    console.log(`${k}  runs=${rs.length} valid=${valid.length}  p95 median=${p95.length ? median(p95).toFixed(2) : '-'} [${p95.length ? Math.min(...p95).toFixed(2) : '-'}–${p95.length ? Math.max(...p95).toFixed(2) : '-'}] CV=${cv.toFixed(1)}%`);
  }
}

// ---------------------------------------------------------------------------
// Renders docs/PERFORMANCE.md section 14.1 from run records. Only clean-tree,
// valid runs are published; everything else is counted and reported as excluded.
function report() {
  const DOC = join(RUNS, '..', '..', 'docs', 'PERFORMANCE.md');
  const all = readdirSync(RUNS).filter((f) => f.endsWith('.json') && !f.endsWith('.k6.json'))
    .map((f) => JSON.parse(readFileSync(join(RUNS, f), 'utf8')));
  const measured = all.filter((r) => r.run_type !== 'calibration');
  const calibs = all.filter((r) => r.run_type === 'calibration');
  const pub = measured.filter((r) => r.validity.valid && !r.git.dirty);
  const f1 = (x) => (x == null || Number.isNaN(x) ? '—' : x.toFixed(x < 10 ? 2 : 1));
  const cvOf = (xs) => { if (xs.length < 2) return NaN; const m = xs.reduce((a, b) => a + b, 0) / xs.length; return (Math.sqrt(xs.reduce((q, x) => q + (x - m) ** 2, 0) / (xs.length - 1)) / m) * 100; };

  const groups = {};
  for (const r of pub) (groups[[r.scenario.id, r.role, r.git.commit, r.database.dataset_id, r.scenario.target_rate_rps, r.scenario.profile, r.benchmark_version].join('|')] ||= []).push(r);

  const rows = []; const index = [];
  for (const [k, rs] of Object.entries(groups).sort()) {
    const [sc, role, commit, ds, rate, profile, bver] = k.split('|');
    const col = (fn) => rs.map(fn);
    const p95 = col((r) => r.result.latency_ms.p95);
    const cv = cvOf(p95);
    rows.push(`| ${sc} | ${role} | \`${commit}\` | \`${ds}\` | ${rate} | ${profile} | ${bver} | ${rs.length} | ${median(col((r) => r.result.requests.total)).toFixed(0)} | ${f1(median(col((r) => r.result.latency_ms.p50)))} | ${f1(median(col((r) => r.result.latency_ms.p90)))} | ${f1(median(p95))} | ${f1(median(col((r) => r.result.latency_ms.p99)))} | ${f1(median(col((r) => r.result.latency_ms.max)))} | ${f1(Math.min(...p95))}–${f1(Math.max(...p95))} | ${f1(cv)}${cv > 10 ? ' **noisy**' : ''} | ${f1(median(col((r) => r.result.db.statements_per_request)))} | ${f1(median(col((r) => r.result.response_bytes.p50)))} |`);
    index.push(`- **${sc} / ${role} / ${commit} / ${ds} / ${rate} rps / ${profile} / harness ${bver}**: ${rs.map((r) => `\`${r.run_id}\``).join(', ')}`);
  }

  const capRows = calibs.filter((c) => !c.git.dirty).sort((a, b) => a.scenario.localeCompare(b.scenario) || a.run_id.localeCompare(b.run_id))
    .map((c) => `| ${c.scenario} | \`${c.git.commit}\` | \`${c.dataset_id}\` | ${c.capacity_rps ?? '—'} | ${f1(c.best_p95_ms)} | \`${c.run_id}\` |`);

  const excluded = measured.length - pub.length;
  const dirty = measured.filter((r) => r.git.dirty).length;
  const invalid = measured.filter((r) => !r.validity.valid).length;

  const body = [
    `_Rendered by \`node performance/perf.mjs report\` from ${pub.length} published run record(s) in \`performance/runs/\`. Excluded: ${excluded} (${dirty} from a dirty tree, ${invalid} failed validity). Latencies in ms, per-run percentiles aggregated by **median across runs** (section 4.5)._`,
    '',
    '| Scenario | Role | Commit | Dataset | Rate (rps) | Profile | Harness | Runs | n / run | p50 | p90 | p95 | p99 | max | p95 min–max | CV(p95) % | Stmts / req | Resp bytes p50 |',
    '|---|---|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|',
    ...(rows.length ? rows : ['| — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |']),
    '',
    '**Calibrated capacity** (clean-tree calibration runs; rule in section 4.3):',
    '',
    '| Scenario | Commit | Dataset | Capacity (rps) | Best p95 (ms) | Run |',
    '|---|---|---|---:|---:|---|',
    ...(capRows.length ? capRows : ['| — | — | — | — | — | — |']),
    '',
    '<details><summary>Run index (every run behind the tables above)</summary>',
    '',
    ...index,
    '',
    '</details>',
  ].join('\n');

  const doc = readFileSync(DOC, 'utf8');
  const re = /<!-- BEGIN GENERATED:phase0a -->[\s\S]*?<!-- END GENERATED:phase0a -->/;
  if (!re.test(doc)) throw new Error('markers not found in docs/PERFORMANCE.md');
  writeFileSync(DOC, doc.replace(re, `<!-- BEGIN GENERATED:phase0a -->\n${body}\n<!-- END GENERATED:phase0a -->`));
  console.log(`report: ${pub.length} published runs, ${excluded} excluded, ${calibs.length} calibrations`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
