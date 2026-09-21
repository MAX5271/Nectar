// k6 scenarios S1-S8 for docs/PERFORMANCE.md section 5.
// Driven entirely by environment variables set by perf.mjs. Never run by hand
// against anything but the local benchmark stack.
import http from 'k6/http';
import exec from 'k6/execution';
import { check, randomSeed } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL;
const SCENARIO = __ENV.SCENARIO;
const MODE = __ENV.MODE || 'measured'; // measured | calibrate
const SEED = Number(__ENV.SEED || 1);
const PASSWORD = __ENV.BENCH_PASSWORD;
const REFRESH_NEEDS_BEARER = __ENV.REFRESH_NEEDS_BEARER === '1';
const EXPECT_FOREIGN_STATUS = Number(__ENV.EXPECT_FOREIGN_STATUS || 404);
const EXPECT_GENERATE_STATUS = Number(__ENV.EXPECT_GENERATE_STATUS || 201);

if (!BASE || !BASE.startsWith('http://127.0.0.1')) {
  throw new Error(`REFUSED: BASE_URL must be loopback, got "${BASE}"`);
}

const users = new SharedArray('users', () => JSON.parse(open(__ENV.FIXTURE)).users);

const bodyBytes = new Trend('body_bytes');
const r2xx = new Counter('resp_2xx');
const r4xx = new Counter('resp_4xx');
const r429 = new Counter('resp_429');
const r5xx = new Counter('resp_5xx');
const poolExhausted = new Counter('pool_exhausted');

const JSON_HEADERS = { 'Content-Type': 'application/json' };
let seeded = false;

function rnd() {
  // per-VU seed: reproducible, and VUs do not walk the same sequence
  if (!seeded) { randomSeed(SEED * 100003 + exec.vu.idInTest); seeded = true; }
  return Math.random();
}
const pickUser = () => users[Math.floor(rnd() * users.length)];
const bearer = (u) => ({ Authorization: `Bearer ${u.accessToken}` });

function record(res, name, expected) {
  bodyBytes.add(res.body ? res.body.length : 0);
  if (res.status === 429) r429.add(1);
  else if (res.status >= 500) r5xx.add(1);
  else if (res.status >= 400) r4xx.add(1);
  else if (res.status >= 200) r2xx.add(1);
  return check(res, { [`${name} status ${expected}`]: (r) => r.status === expected });
}

const params = (name, expected, headers = {}) => ({
  headers, tags: { name }, responseCallback: http.expectedStatuses(expected),
});

export function S1() {
  const u = pickUser();
  const res = http.post(`${BASE}/api/auth/login`, JSON.stringify({ email: u.email, password: PASSWORD }),
    params('S1', 200, JSON_HEADERS));
  record(res, 'S1', 200) && check(res, { 'S1 token': (r) => r.body.includes('accessToken') });
}

export function S2() {
  // Short on purpose: the current revision validates username <= 50 chars. Each run gets a fresh DB clone, so uniqueness within the run is enough.
  const n = `${exec.scenario.name}-${exec.vu.idInTest}-${exec.scenario.iterationInTest}`;
  const body = {
    email: `bench-${n}@bench.nectar.invalid`, username: `bench_${n}`, password: PASSWORD,
    authProvider: 'local', height: 180, weight: 80, age: 30,
    gender: 'male', planType: 'cutting', unitSystem: 'metric', preferences: 'None',
  };
  record(http.post(`${BASE}/api/user/signup`, JSON.stringify(body), params('S2', 201, JSON_HEADERS)), 'S2', 201);
}

export function S3() {
  const u = pickUser();
  const headers = { Cookie: `jwt=${u.refreshToken}`, ...(REFRESH_NEEDS_BEARER ? bearer(u) : {}) };
  const res = http.get(`${BASE}/api/auth/refresh`, params('S3', 200, headers));
  record(res, 'S3', 200) && check(res, { 'S3 token': (r) => r.body.includes('accessToken') });
}

export function S4() {
  const u = pickUser();
  const res = http.get(`${BASE}/api/user/profile`, params('S4', 200, bearer(u)));
  record(res, 'S4', 200) && check(res, { 'S4 constraints': (r) => r.body.includes('constraints') });
}

export function S5() {
  const u = pickUser();
  const res = http.get(`${BASE}/api/diet/latest`, params('S5', 200, bearer(u)));
  record(res, 'S5', 200) && check(res, { 'S5 diets': (r) => r.body.includes('diets') });
}

export function S6() {
  const u = pickUser();
  const res = http.get(`${BASE}/api/diet/history`, params('S6', 200, bearer(u)));
  record(res, 'S6', 200) && check(res, { 'S6 diets': (r) => r.body.includes('diets') });
}

export function S7() {
  const u = pickUser();
  const id = u.planIds[Math.floor(rnd() * u.planIds.length)];
  const res = http.get(`${BASE}/api/diet/${id}`, params('S7', 200, bearer(u)));
  record(res, 'S7', 200) && check(res, { 'S7 diets': (r) => r.body.includes('diets') });
}

// Functional authorisation check, not a latency measurement (run at a low fixed rate).
export function S7b() {
  const i = Math.floor(rnd() * users.length);
  const u = users[i];
  const other = users[(i + 1) % users.length];
  const res = http.get(`${BASE}/api/diet/${other.planIds[0]}`, params('S7b', EXPECT_FOREIGN_STATUS, bearer(u)));
  record(res, 'S7b', EXPECT_FOREIGN_STATUS);
}

// Each request consumes a distinct seeded user: one plan per user per UTC day.
// Every k6 phase restarts its own iteration counter, so each phase gets its own
// slice of the pool (userOffsets, computed alongside the scenarios below).
const userOffsets = {};
export function S8() {
  const i = (userOffsets[exec.scenario.name] || 0) + exec.scenario.iterationInTest;
  if (i >= users.length) { poolExhausted.add(1); return; }
  const res = http.post(`${BASE}/api/diet/plan`, null, params('S8', EXPECT_GENERATE_STATUS, bearer(users[i])));
  record(res, 'S8', EXPECT_GENERATE_STATUS);
}

function buildScenarios() {
  const pre = Number(__ENV.PRE_VUS || 50);
  const max = Number(__ENV.MAX_VUS || 400);
  const base = { timeUnit: '1s', preAllocatedVUs: pre, maxVUs: max, exec: SCENARIO };

  if (MODE === 'calibrate') {
    // A ladder of short constant-rate steps. The harness finds where the system saturates.
    const steps = __ENV.STEPS.split(',').map(Number);
    const stepS = Number(__ENV.STEP_S || 20);
    const scenarios = {};
    let offset = 0;
    steps.forEach((rate, i) => {
      userOffsets[`step_${i}`] = offset;
      offset += rate * stepS + 10;
      scenarios[`step_${i}`] = {
        ...base, executor: 'constant-arrival-rate', rate, duration: `${stepS}s`,
        startTime: `${i * (stepS + 5)}s`, tags: { rate: String(rate) },
      };
    });
    return scenarios;
  }

  const rate = Number(__ENV.RATE);
  const ramp = Number(__ENV.RAMP_S);
  const warm = Number(__ENV.WARMUP_S);
  const dur = Number(__ENV.DURATION_S);
  userOffsets.ramp = 0;
  userOffsets.warmup = Math.ceil((ramp * rate) / 2) + 10;
  userOffsets.measured = userOffsets.warmup + warm * rate + 10;
  return {
    // ramp and warm-up are discarded; only "measured" is reported
    ramp: { ...base, executor: 'ramping-arrival-rate', startRate: 1, stages: [{ target: rate, duration: `${ramp}s` }] },
    warmup: { ...base, executor: 'constant-arrival-rate', rate, duration: `${warm}s`, startTime: `${ramp}s` },
    measured: { ...base, executor: 'constant-arrival-rate', rate, duration: `${dur}s`, startTime: `${ramp + warm}s` },
  };
}

const scenarios = buildScenarios();

// Thresholds that can never fail: they only force k6 to keep per-scenario sub-metrics.
function forceSubmetrics() {
  const t = {};
  for (const name of Object.keys(scenarios)) {
    t[`http_req_duration{scenario:${name}}`] = ['max>=0'];
    t[`http_req_failed{scenario:${name}}`] = ['rate>=0'];
    t[`http_reqs{scenario:${name}}`] = ['count>=0'];
    t[`checks{scenario:${name}}`] = ['rate>=0'];
    t[`dropped_iterations{scenario:${name}}`] = ['count>=0'];
    t[`body_bytes{scenario:${name}}`] = ['max>=0'];
    for (const c of ['resp_2xx', 'resp_4xx', 'resp_429', 'resp_5xx', 'pool_exhausted']) t[`${c}{scenario:${name}}`] = ['count>=0'];
  }
  return t;
}

export const options = {
  scenarios,
  thresholds: forceSubmetrics(),
  summaryTrendStats: ['min', 'med', 'max', 'p(50)', 'p(90)', 'p(95)', 'p(99)'],
  discardResponseBodies: false,
};

export function handleSummary(data) {
  return { [`/work/work/out/${__ENV.RUN_ID}.summary.json`]: JSON.stringify(data) };
}
