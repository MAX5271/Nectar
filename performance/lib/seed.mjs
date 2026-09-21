import crypto from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  BENCH_EMAIL_DOMAIN, BENCH_PASSWORD, BENCH_SECRETS, SEED_ANCHOR_UTC, WORK,
} from './env.mjs';
import { assertBenchDatabaseName } from './guards.mjs';
import { connect, createDb, dbExists, dropDb } from './postgres.mjs';
import { migrationFiles } from './revisions.mjs';

export const SEED_VERSION = '1';

const BASE = {
  'D-S': { users: 100, plansPerUser: 7 },
  'D-M': { users: 1000, plansPerUser: 30 },
  'D-L': { users: 10000, plansPerUser: 90 },
};

// "D-M", "D-M/p365" (365 plans per user), "D-M/u5000" (5000 users)
export function parseDataset(id) {
  const [base, ...mods] = id.split('/');
  const spec = { ...BASE[base] };
  if (!spec.users) throw new Error(`Unknown dataset ${id}`);
  for (const m of mods) {
    if (m[0] === 'p') spec.plansPerUser = Number(m.slice(1));
    else if (m[0] === 'u') spec.users = Number(m.slice(1));
    else throw new Error(`Unknown dataset modifier ${m}`);
  }
  const key = id.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return { id, key, ...spec };
}

export const templateName = (dataset, role) => `bench_seed_${parseDataset(dataset).key}_${role}`;
export const templateMetaPath = (name) => join(WORK, 'templates', `${name}.json`);
export const fixturePath = (dataset) => join(WORK, 'fixtures', `${parseDataset(dataset).key}.json`);

function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic UUID (v5-style) so ids are identical on every rebuild.
function uuid(kind, i) {
  const h = crypto.createHash('sha1').update(`nectar-bench:${kind}:${i}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Fixed iat/exp keep the minted tokens (and therefore the seeded data) deterministic
// and stop them expiring mid-run.
function mint(id, secret) {
  return jwt.sign({ id, iat: 1_767_225_600, exp: 4_102_444_800 }, secret);
}

const MEALS = [
  ['Breakfast', 'Greek yogurt with oats', '250g'],
  ['Lunch', 'Grilled chicken salad', '1 bowl'],
  ['Dinner', 'Baked salmon and rice', '1 plate'],
  ['Snack', 'Apple and almonds', '1 serving'],
  ['Snack', 'Protein shake', '1 shake'],
];
const PLAN_TYPES = ['CUTTING', 'BULKING', 'RECOMP'];
const GENDERS = ['MALE', 'FEMALE'];
const UNITS = ['METRIC', 'IMPERIAL'];
const PREFS = ['', 'High Protein', 'Vegetarian', 'No Dairy', 'No Nuts'];

const iso = (ms) => new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
const CHUNK = 5000;

async function bulk(client, sql, columns) {
  const rows = columns[0].length;
  for (let off = 0; off < rows; off += CHUNK) {
    await client.query(sql, columns.map((c) => c.slice(off, off + CHUNK)));
  }
}

// Builds (or rebuilds) the template database for one dataset and revision.
export async function buildTemplate({ dataset, rev, log = console.log }) {
  const spec = parseDataset(dataset);
  const name = templateName(dataset, rev.role);
  assertBenchDatabaseName(name);

  log(`[seed] ${name}: dropping and recreating`);
  await dropDb(name);
  await createDb(name);
  const db = await connect(name);

  try {
    // Each revision is built from ITS OWN migration set (sec. 7.3).
    const migrations = migrationFiles(rev);
    for (const m of migrations) await db.query(readFileSync(m.path, 'utf8'));
    await db.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements');
    log(`[seed] applied ${migrations.length} migrations`);

    const rand = prng(0xbe11);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const passwordHash = await bcrypt.hash(BENCH_PASSWORD, 10); // one hash, reused (cost 10 = app cost)

    const users = [];
    const constraints = [];
    for (let i = 0; i < spec.users; i++) {
      const id = uuid('user', i);
      const refresh = mint(id, BENCH_SECRETS.refresh);
      users.push({
        id,
        email: `bench-${i}@${BENCH_EMAIL_DOMAIN}`,
        username: `bench_${i}`,
        refreshToken: rev.refreshTokenStorage === 'raw' ? refresh : sha256(refresh),
        fixture: { id, email: `bench-${i}@${BENCH_EMAIL_DOMAIN}`, accessToken: mint(id, BENCH_SECRETS.access), refreshToken: refresh, planIds: [] },
      });
      constraints.push({
        id: uuid('constraint', i), planType: pick(PLAN_TYPES), gender: pick(GENDERS), unitSystem: pick(UNITS),
        height: 150 + Math.floor(rand() * 50), weight: 50 + Math.floor(rand() * 60), age: 18 + Math.floor(rand() * 42),
        preferences: pick(PREFS), userId: id,
      });
    }

    await bulk(db,
      `INSERT INTO "User"(id,email,username,password,"refreshToken")
       SELECT * FROM unnest($1::text[],$2::text[],$3::text[],$4::text[],$5::text[])`,
      [users.map((u) => u.id), users.map((u) => u.email), users.map((u) => u.username),
        users.map(() => passwordHash), users.map((u) => u.refreshToken)]);

    await bulk(db,
      `INSERT INTO "DietaryConstraint"(id,"planType",gender,"unitSystem",height,weight,age,preferences,"userId")
       SELECT * FROM unnest($1::text[],$2::"PlanType"[],$3::"Gender"[],$4::"UnitSystem"[],$5::float8[],$6::float8[],$7::int[],$8::text[],$9::text[])`,
      [constraints.map((c) => c.id), constraints.map((c) => c.planType), constraints.map((c) => c.gender),
        constraints.map((c) => c.unitSystem), constraints.map((c) => c.height), constraints.map((c) => c.weight),
        constraints.map((c) => c.age), constraints.map((c) => c.preferences), constraints.map((c) => c.userId)]);

    // Plans and meals, one user at a time, flushed in chunks.
    let plans = { id: [], date: [], cal: [], pro: [], fat: [], carb: [], user: [] };
    let meals = { id: [], type: [], portion: [], meal: [], cal: [], carb: [], pro: [], fat: [], date: [], plan: [] };
    const flush = async () => {
      if (!plans.id.length) return;
      await bulk(db,
        `INSERT INTO "DietPlan"(id,date,"totalCalories","totalProtein","totalFat","totalCarbs","userId")
         SELECT * FROM unnest($1::text[],$2::timestamp[],$3::float8[],$4::float8[],$5::float8[],$6::float8[],$7::text[])`,
        [plans.id, plans.date, plans.cal, plans.pro, plans.fat, plans.carb, plans.user]);
      await bulk(db,
        `INSERT INTO "Diet"(id,type,portion,meal,calories,carb,protein,fat,date,"dietPlanId")
         SELECT * FROM unnest($1::text[],$2::text[],$3::text[],$4::text[],$5::float8[],$6::float8[],$7::float8[],$8::float8[],$9::timestamp[],$10::text[])`,
        [meals.id, meals.type, meals.portion, meals.meal, meals.cal, meals.carb, meals.pro, meals.fat, meals.date, meals.plan]);
      plans = { id: [], date: [], cal: [], pro: [], fat: [], carb: [], user: [] };
      meals = { id: [], type: [], portion: [], meal: [], cal: [], carb: [], pro: [], fat: [], date: [], plan: [] };
    };

    let planIdx = 0;
    for (let i = 0; i < spec.users; i++) {
      for (let k = 0; k < spec.plansPerUser; k++, planIdx++) {
        const planId = uuid('plan', planIdx);
        const date = iso(SEED_ANCHOR_UTC - k * 86_400_000);
        let tc = 0; let tp = 0; let tf = 0; let tcb = 0;
        for (let m = 0; m < 5; m++) {
          const cal = 250 + Math.floor(rand() * 400);
          const pro = 10 + Math.floor(rand() * 40);
          const fat = 5 + Math.floor(rand() * 25);
          const carb = 15 + Math.floor(rand() * 70);
          tc += cal; tp += pro; tf += fat; tcb += carb;
          meals.id.push(uuid('diet', planIdx * 5 + m));
          meals.type.push(MEALS[m][0]); meals.portion.push(MEALS[m][2]); meals.meal.push(MEALS[m][1]);
          meals.cal.push(cal); meals.carb.push(carb); meals.pro.push(pro); meals.fat.push(fat);
          meals.date.push(date); meals.plan.push(planId);
        }
        plans.id.push(planId); plans.date.push(date); plans.cal.push(tc); plans.pro.push(tp);
        plans.fat.push(tf); plans.carb.push(tcb); plans.user.push(users[i].id);
        if (users[i].fixture.planIds.length < 10) users[i].fixture.planIds.push(planId);
      }
      if (plans.id.length >= 2000) await flush();
    }
    await flush();

    await db.query('ANALYZE'); // as autovacuum would have done on a live database
    const counts = {}; let hash = crypto.createHash('sha256');
    for (const t of ['User', 'DietaryConstraint', 'DietPlan', 'Diet']) {
      const r = (await db.query(`SELECT count(*)::int AS n, md5(string_agg(id, ',' ORDER BY id)) AS h FROM "${t}"`)).rows[0];
      counts[t] = r.n; hash = hash.update(`${t}:${r.n}:${r.h}`);
    }
    const checksum = hash.digest('hex').slice(0, 16);

    mkdirSync(join(WORK, 'templates'), { recursive: true });
    mkdirSync(join(WORK, 'fixtures'), { recursive: true });
    writeFileSync(templateMetaPath(name), JSON.stringify({
      name, dataset, role: rev.role, seed_version: SEED_VERSION, counts, checksum,
      migrations: migrations.map((m) => m.name), plansPerUser: spec.plansPerUser, built_at: new Date().toISOString(),
    }, null, 2));
    writeFileSync(fixturePath(dataset), JSON.stringify({ dataset, users: users.map((u) => u.fixture) }));
    log(`[seed] ${name}: ${JSON.stringify(counts)} checksum=${checksum}`);
    return { name, counts, checksum };
  } finally {
    await db.end();
  }
}

export async function ensureTemplate(opts) {
  const name = templateName(opts.dataset, opts.rev.role);
  if (!(await dbExists(name)) || !existsSync(templateMetaPath(name)) || !existsSync(fixturePath(opts.dataset))) {
    await buildTemplate(opts);
  }
  return JSON.parse(readFileSync(templateMetaPath(name), 'utf8'));
}
