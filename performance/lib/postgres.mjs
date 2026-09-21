import { execFileSync, spawnSync } from 'node:child_process';
import pg from 'pg';
import { CPU_PINNING, PG } from './env.mjs';
import { assertBenchDatabaseName, assertBenchDatabaseUrl } from './guards.mjs';

const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8' }).trim();

export function dbUrl(dbName) {
  const url = `postgresql://${PG.user}:${PG.password}@${PG.host}:${PG.port}/${dbName}`;
  assertBenchDatabaseUrl(url);
  return url;
}

export function containerRunning() {
  const r = spawnSync('docker', ['inspect', '-f', '{{.State.Running}}', PG.container], { encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim() === 'true';
}

export function up() {
  if (containerRunning()) return;
  spawnSync('docker', ['rm', '-f', PG.container], { stdio: 'ignore' });
  docker(
    'run', '-d', '--name', PG.container,
    // Loopback only: never reachable from the network.
    '-p', `127.0.0.1:${PG.port}:5432`,
    '--cpuset-cpus', CPU_PINNING.db,
    '-v', `${PG.volume}:/var/lib/postgresql`,
    '-e', `POSTGRES_USER=${PG.user}`, '-e', `POSTGRES_PASSWORD=${PG.password}`, '-e', `POSTGRES_DB=${PG.adminDb}`,
    PG.image,
    'postgres',
    '-c', 'shared_preload_libraries=pg_stat_statements',
    '-c', 'pg_stat_statements.track=all',
    '-c', 'track_io_timing=on',
    '-c', 'log_min_duration_statement=250',
    '-c', 'max_connections=200',
  );
}

export function down({ wipe = false } = {}) {
  spawnSync('docker', ['rm', '-f', PG.container], { stdio: 'ignore' });
  if (wipe) spawnSync('docker', ['volume', 'rm', '-f', PG.volume], { stdio: 'ignore' });
}

export async function waitReady(timeoutMs = 60_000) {
  const start = Date.now();
  for (;;) {
    try {
      const c = await connect(PG.adminDb);
      await c.end();
      return;
    } catch {
      if (Date.now() - start > timeoutMs) throw new Error('Postgres did not become ready');
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

export async function connect(dbName) {
  const c = new pg.Client({ connectionString: dbUrl(dbName) });
  await c.connect();
  return c;
}

export async function dbExists(name) {
  assertBenchDatabaseName(name);
  const c = await connect(PG.adminDb);
  try {
    const r = await c.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
    return r.rowCount > 0;
  } finally {
    await c.end();
  }
}

export async function dropDb(name) {
  assertBenchDatabaseName(name);
  const c = await connect(PG.adminDb);
  try {
    await c.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  } finally {
    await c.end();
  }
}

export async function createDb(name, template) {
  assertBenchDatabaseName(name);
  if (template) assertBenchDatabaseName(template);
  const c = await connect(PG.adminDb);
  try {
    await c.query(`CREATE DATABASE "${name}"${template ? ` TEMPLATE "${template}"` : ''}`);
  } finally {
    await c.end();
  }
}

export async function serverInfo() {
  const c = await connect(PG.adminDb);
  try {
    const v = (await c.query('SHOW server_version')).rows[0].server_version;
    const cfg = {};
    for (const k of ['shared_buffers', 'fsync', 'synchronous_commit', 'max_connections', 'work_mem', 'effective_cache_size']) {
      cfg[k] = (await c.query(`SHOW ${k}`)).rows[0][k];
    }
    return { version: v, config: cfg };
  } finally {
    await c.end();
  }
}
