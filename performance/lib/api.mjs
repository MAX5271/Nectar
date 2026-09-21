import { spawn, execFileSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { API_PORT, CPU_PINNING, ROOT, WORK } from './env.mjs';
import { assertNoDotenv, assertOnlyLoopbackConnections } from './guards.mjs';
import { apiEnv } from './revisions.mjs';

export const BASE_URL = `http://127.0.0.1:${API_PORT}`;
const CLK_TCK = Number(execFileSync('getconf', ['CLK_TCK'], { encoding: 'utf8' }));

export async function startApi({ rev, dbName, runId, extraEnv = {} }) {
  // G1: an empty working directory, so dotenv can never find a .env.
  const cwd = join(WORK, 'cwd');
  mkdirSync(cwd, { recursive: true });
  assertNoDotenv(cwd);

  mkdirSync(join(WORK, 'logs'), { recursive: true });
  const logFd = openSync(join(WORK, 'logs', `${runId}.api.log`), 'w');

  const env = apiEnv(dbName, {
    PORT: API_PORT,
    UV_THREADPOOL_SIZE: 4, // Node's default, set explicitly so it is recorded
    TSX_TSCONFIG_PATH: join(rev.serverDir, 'tsconfig.json'),
    ...extraEnv,
  });

  const tsx = import.meta.resolve('tsx');
  const child = spawn('taskset', [
    '-c', CPU_PINNING.api, process.execPath,
    '--import', tsx,
    '--import', pathToFileURL(join(ROOT, 'lib', 'loopback-preload.mjs')).href,
    join(rev.serverDir, 'src', 'index.ts'),
  ], { cwd, env, stdio: ['ignore', logFd, logFd] });
  closeSync(logFd);

  let exited = null;
  child.on('exit', (code) => { exited = code; });

  const start = Date.now();
  for (;;) {
    if (exited !== null) throw new Error(`API exited early (code ${exited}); see work/logs/${runId}.api.log`);
    try {
      // 401 on an unauthenticated profile request proves the app is serving on both revisions.
      const r = await fetch(`${BASE_URL}/api/user/profile`);
      if (r.status === 401) break;
    } catch { /* not up yet */ }
    if (Date.now() - start > 60_000) { child.kill('SIGKILL'); throw new Error('API did not become ready'); }
    await new Promise((r) => setTimeout(r, 250));
  }

  // G4: listening on loopback only, and every outbound connection is loopback.
  const listen = execFileSync('ss', ['-ltnpH'], { encoding: 'utf8' })
    .split('\n').filter((l) => l.includes(`pid=${child.pid},`));
  if (!listen.length || !listen.every((l) => l.includes('127.0.0.1:'))) {
    child.kill('SIGKILL');
    throw new Error(`REFUSED: API is not bound to loopback only: ${listen.join(' | ')}`);
  }
  // Force the pool to open at least one connection before checking.
  assertOnlyLoopbackConnections(child.pid);

  return {
    pid: child.pid,
    cpuSeconds() {
      const f = readFileSync(`/proc/${child.pid}/stat`, 'utf8').split(') ')[1].split(' ');
      return (Number(f[11]) + Number(f[12])) / CLK_TCK; // utime + stime
    },
    rssMb() {
      const m = readFileSync(`/proc/${child.pid}/status`, 'utf8').match(/VmHWM:\s+(\d+) kB/);
      return m ? Math.round(Number(m[1]) / 1024) : null;
    },
    assertLoopback() { assertOnlyLoopbackConnections(child.pid); },
    async stop() {
      child.kill('SIGTERM');
      await new Promise((r) => { const t = setTimeout(() => { child.kill('SIGKILL'); r(); }, 5000); child.on('exit', () => { clearTimeout(t); r(); }); });
    },
  };
}
