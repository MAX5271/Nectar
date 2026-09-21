import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { CPU_PINNING, K6_IMAGE, PG, ROOT, WORK } from './env.mjs';

const uid = process.getuid();
const gid = process.getgid();

// Samples `docker stats` for the given containers while k6 runs.
function startStatsSampler(names) {
  const samples = {};
  let stopped = false;
  const loop = (async () => {
    while (!stopped) {
      try {
        const out = execFileSync('docker', ['stats', '--no-stream', '--format', '{{.Name}} {{.CPUPerc}}', ...names], { encoding: 'utf8', timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'] });
        for (const line of out.trim().split('\n')) {
          const [n, p] = line.split(' ');
          (samples[n] ||= []).push(parseFloat(p));
        }
      } catch { /* container not up yet or already gone */ }
      await new Promise((r) => setTimeout(r, 1000));
    }
  })();
  return async () => { stopped = true; await loop; return samples; };
}

export async function runK6({ runId, env }) {
  mkdirSync(join(WORK, 'out'), { recursive: true });
  const name = `bench-k6-${runId.replace(/[^A-Za-z0-9_.-]/g, '_').slice(-60)}`;
  const args = [
    'run', '--rm', '--name', name, '--network', 'host',
    '--cpuset-cpus', CPU_PINNING.loadgen, '--user', `${uid}:${gid}`,
    '-v', `${ROOT}:/work`,
    ...Object.entries({ ...env, RUN_ID: runId }).flatMap(([k, v]) => ['-e', `${k}=${v}`]),
    K6_IMAGE, 'run', '--quiet', '--no-usage-report', '/work/k6/scenarios.js',
  ];
  const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const stopSampler = startStatsSampler([name, PG.container]);
  const code = await new Promise((r) => child.on('exit', r));
  const stats = await stopSampler();
  return { code, log, stats, summaryPath: join(WORK, 'out', `${runId}.summary.json`), containerName: name };
}
