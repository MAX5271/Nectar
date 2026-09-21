import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// G3: refuse anything that is not a local, bench_-prefixed database.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function assertBenchDatabaseUrl(urlString) {
  const url = new URL(urlString);
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`REFUSED: database host "${url.hostname}" is not local. Benchmarks never touch remote databases.`);
  }
  if (!dbName.startsWith('bench_') && dbName !== 'postgres') {
    throw new Error(`REFUSED: database "${dbName}" does not start with "bench_".`);
  }
}

export function assertBenchDatabaseName(name) {
  if (!/^bench_[a-z0-9_]+$/.test(name)) {
    throw new Error(`REFUSED: "${name}" is not a valid bench_ database name.`);
  }
}

// G1: dotenv/config loads ./.env from the working directory and fills every
// variable that is unset. A benchmark process must run where no .env exists.
export function assertNoDotenv(cwd) {
  if (existsSync(join(cwd, '.env'))) {
    throw new Error(`REFUSED: ${cwd}/.env exists and would be loaded by dotenv.`);
  }
}

// G1/G2: build the child environment from scratch. Nothing from the parent's
// DATABASE_URL, GEMINI_*, secrets etc. can leak in.
const PASSTHROUGH = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TMPDIR', 'USER'];

export function cleanEnv(explicit) {
  const env = {};
  for (const key of PASSTHROUGH) if (process.env[key]) env[key] = process.env[key];
  for (const [k, v] of Object.entries(explicit)) env[k] = String(v);
  if (env.DATABASE_URL) assertBenchDatabaseUrl(env.DATABASE_URL);
  // dotenv must find nothing even if a .env somehow exists in cwd.
  env.DOTENV_CONFIG_PATH = '/dev/null';
  env.DOTENV_CONFIG_QUIET = 'true';
  return env;
}

// G4: independent of the application. Every established TCP connection of the
// API process must be to loopback. Works on any revision, needs no app change.
export function assertOnlyLoopbackConnections(pid) {
  const out = execFileSync('ss', ['-tnpH', 'state', 'established'], { encoding: 'utf8' });
  const offenders = [];
  for (const line of out.split('\n')) {
    if (!line.includes(`pid=${pid},`)) continue;
    const cols = line.trim().split(/\s+/);
    const peer = cols[cols.length - 2]; // "<addr>:<port>" of the remote end
    const host = peer.replace(/:\d+$/, '').replace(/^\[|\]$/g, '');
    if (!(host === '127.0.0.1' || host === '::1' || host.startsWith('::ffff:127.'))) offenders.push(peer);
  }
  if (offenders.length) {
    throw new Error(`REFUSED: API process ${pid} has non-loopback connections: ${offenders.join(', ')}`);
  }
}
