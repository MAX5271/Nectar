import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BASELINE_COMMIT, BENCH_SECRETS, REPO, WORK } from './env.mjs';
import { assertNoDotenv, cleanEnv } from './guards.mjs';
import { dbUrl } from './postgres.mjs';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

// The code revisions under comparison. The only intended variable between
// BASELINE and CURRENT is the code itself (docs/PERFORMANCE.md section 7).
//   baseline: an immutable commit checked out in its own git worktree
//   current : the working tree of this repo
export function revision(role) {
  if (role === 'baseline') {
    const root = join(WORK, 'worktrees', 'baseline');
    return {
      role,
      root,
      serverDir: join(root, 'server'),
      // The old code stored the refresh token raw; it also required a Bearer token on /refresh.
      refreshTokenStorage: 'raw',
      refreshNeedsBearer: true,
      hasIndexMigration: false,
      describe: () => ({ commit: git(root, 'rev-parse', '--short', 'HEAD'), dirty: dirtyState(root), branch: 'detached' }),
    };
  }
  if (role === 'current') {
    return {
      role,
      root: REPO,
      serverDir: join(REPO, 'server'),
      refreshTokenStorage: 'sha256',
      refreshNeedsBearer: false,
      hasIndexMigration: true,
      describe: () => ({
        commit: git(REPO, 'rev-parse', '--short', 'HEAD'),
        dirty: dirtyState(REPO),
        branch: git(REPO, 'rev-parse', '--abbrev-ref', 'HEAD'),
      }),
    };
  }
  throw new Error(`Unknown revision role: ${role}`);
}

function dirtyState(root) {
  // Ignore performance/ itself: the harness lives inside the repo it measures.
  const out = git(root, 'status', '--porcelain', '--', '.', ':(exclude)performance', ':(exclude)docs');
  return out.length > 0;
}

export function migrationFiles(rev) {
  const dir = join(rev.serverDir, 'prisma', 'migrations');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((name) => ({ name, path: join(dir, name, 'migration.sql') }));
}

// Creates the baseline worktree and installs its own dependency set.
export function ensureBaselineWorktree() {
  const rev = revision('baseline');
  if (!existsSync(rev.root)) {
    mkdirSync(join(WORK, 'worktrees'), { recursive: true });
    git(REPO, 'worktree', 'add', '--detach', rev.root, BASELINE_COMMIT);
  }
  if (!existsSync(join(rev.serverDir, 'node_modules'))) {
    assertNoDotenv(rev.serverDir);
    execFileSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: rev.serverDir, stdio: 'inherit' });
    // prisma.config.ts requires DATABASE_URL to be set; `generate` never connects.
    execFileSync('npx', ['prisma', 'generate'], {
      cwd: rev.serverDir,
      stdio: 'inherit',
      env: cleanEnv({ DATABASE_URL: dbUrl('postgres') }),
    });
  }
  return rev;
}

export function apiEnv(dbName, extra = {}) {
  return cleanEnv({
    DATABASE_URL: dbUrl(dbName),
    ACCESS_TOKEN_SECRET: BENCH_SECRETS.access,
    REFRESH_TOKEN_SECRET: BENCH_SECRETS.refresh,
    // Real key deliberately absent: Phase 0A never talks to Gemini.
    GEMINI_API_KEY: '',
    NODE_ENV: 'development',
    ...extra,
  });
}
