# NECTAR — Development Plan

**Version 1 · 2026-09-21**

The single reference for what NECTAR is, what has been done, and what remains, in order. Performance measurement has its own document, [PERFORMANCE.md](PERFORMANCE.md); this file links to it and does not repeat it.

**Contents**

1. [Where the project stands](#1-where-the-project-stands)
2. [Guiding principles](#2-guiding-principles)
3. [Roadmap at a glance](#3-roadmap-at-a-glance)
4. [Phase details](#4-phase-details)
5. [Feature catalogue](#5-feature-catalogue)
6. [Code-quality backlog](#6-code-quality-backlog)
7. [Testing and CI](#7-testing-and-ci)
8. [Priorities](#8-priorities)
9. [Open decisions](#9-open-decisions)
10. [Risks](#10-risks)

Effort sizes: **S** ≈ days, **M** ≈ 1–2 weeks, **L** ≈ several weeks, **XL** ≈ a month or more.

---

## 1. Where the project stands

### 1.1 What NECTAR is

An AI-driven diet planner: a user registers with biometrics and a goal, and the server computes a calorie target (Mifflin-St Jeor) and asks Gemini for a five-meal daily plan, one per day. Architecture and commands are in [CLAUDE.md](../CLAUDE.md).

- **Server:** Express 5 + TypeScript (ESM), Prisma 7 on PostgreSQL (Supabase), layered routes → controller → service → repository.
- **Client:** React 19 + Vite + Tailwind 4, Redux Toolkit, axios with a refresh-token interceptor.

### 1.2 Completed

**Security and correctness pass** (uncommitted, see [§1.4](#14-pending-decision)):

| Area | Done |
|---|---|
| Login | `bcrypt.compare` is now awaited (any password used to be accepted); one generic 401 for bad credentials |
| Authorisation | `GET /diet/:id` is scoped to the owner (was readable by any logged-in user) |
| Auth flow | Refresh and logout use the HttpOnly cookie; expired tokens return 401 so the client refreshes; refresh tokens stored hashed; signup persists its refresh token; cookie `SameSite=None` in production; a single shared refresh call on the client |
| Signup | Fake "google" provider removed; zod validation (enums, ranges, password length); duplicate email returns 409 |
| Generation | Uses the user's saved biometrics; `POST /diet/plan`; one plan per UTC day enforced server-side; Gemini output validated and totals computed from the meals; preferences sanitised before entering the prompt |
| Hardening | helmet, rate limits, 10 KB body limit, central error handler, 1200-kcal floor |
| Client | Route guard, shared login/register flow, logout revokes the server session, real macro bars, unit-aware display, inline errors on login and dashboard |
| Tooling | Server `dev`/`build`/`start`/`typecheck` scripts, `.env.example` files, unused dependencies removed, index migration added |

**Performance Phase 0A** (harness, noise floor): see [PERFORMANCE.md §14.1](PERFORMANCE.md).

### 1.3 Known gaps

These are the facts that shape the plan.

- **The AI does one thing:** one prompt, once a day, producing text.
- **Data is write-once:** biometrics are captured at signup and can never change, and nothing the user does afterwards is recorded. Until that changes, no tracking, coaching or personalisation feature is buildable.
- **No tests, no CI, no shared types** between client and server.
- **Baseline schema has no indexes** on `DietPlan.userId` or `Diet.dietPlanId`; the calibration probes suggest this dominates the latency of three endpoints ([PERFORMANCE.md §14.1](PERFORMANCE.md)). The fix exists in the uncommitted migration and is unconfirmed until the comparison runs.
- **Left deliberately undone in the fix pass:** the access token still lives in `localStorage`; `DietaryConstraint` is still one-to-many; there is no unique `(userId, date)` constraint on plans (the daily limit relies on a check plus a process-local guard); onboarding still uses `alert()`.

### 1.4 Pending decision

**N1: commit the uncommitted work** (41+ changed files, plus the new `performance/` and `docs/` directories). Until then the current code has no commit SHA and cannot be benchmarked against the baseline. Proposed: a branch such as `perf/phase-0a`, in logical commits (security fixes, enablers, harness, docs), not on `main`.

---

## 2. Guiding principles

1. **Measure before optimising.** Every performance claim needs a before and after from the same environment ([PERFORMANCE.md §1](PERFORMANCE.md)).
2. **Safety-critical behaviour is a feature, not a follow-up.** An app that gives calorie advice to strangers must not fabricate macros or miss an allergy.
3. **Data before features.** Schema changes get more expensive as real data accumulates; do them before the features that depend on them.
4. **One source of truth for types.** The API contract is defined once and derived everywhere.
5. **No synthetic load reaches anything that might hold real user data.** The remote Supabase database is treated as production until you say otherwise.
6. **Small, reversible steps.** Each phase has exit criteria and can ship on its own.

---

## 3. Roadmap at a glance

| Phase | Goal | Size | Depends on |
|---|---|---|---|
| **0A** Local deterministic measurement | A trustworthy baseline | M | — |
| **0B** Real Gemini and staging measurement | Realistic AI and network numbers | M | Gemini key, staging (§9) |
| **0C** Production monitoring | Real availability and latency | S | `/health` from Phase 1 |
| **1** Foundation and instrumentation | Safe to change | M | — |
| **2** Safety net and perf-regression CI | Safe to refactor | M | Phase 0A harness |
| **3** Data and query optimisation | Unblock features; fix proven hotspots | S–M | Phase 0A results |
| **4** Security, auth and user-safety hardening | Defensible, recoverable accounts and advice | L | Phase 3 |
| **5** Tier 1 product features | A daily-use app | L | Phases 3, 4 |
| **6** Client refactor | Maintainable UI | M | API surface settled (after 5) |
| **7** Tier 2 features | Product depth | XL | Phase 5 |
| **8** Tier 3 and platform | Scale and business | XL | Phase 7 |

**Ordering notes and deviations**

- Phases 0A/0B/0C run before everything else. **0C is split:** the provider and methodology can be decided with no code, but the probes need `/health`, which ships first in Phase 1.
- **Phase 1 is ordered so `/health` and request-duration logging come first**, because 0C depends on them.
- **Phase 4 is broader than "security/auth".** The earlier plan had a separate phase for user-safety items (allergy checks, eating-disorder guardrails, medical disclaimer). Those are pulled forward into Phase 4 rather than left to Tier 2/3, because a wrong answer there can hurt someone. This is a deviation from a pure security scope.
- **Phase 6 is deliberately late.** A client refactor against a moving API is done twice. It begins by capturing a frontend performance baseline, which was excluded from Phase 0.
- Phases 4 and 5 can partly overlap; profile editing and meal logging do not depend on 2FA or OAuth.

---

## 4. Phase details

Each phase lists its work, then its exit criteria.

### Phase 0A — Local deterministic measurement (in progress)

Full sequence and status: [PERFORMANCE.md §15.1](PERFORMANCE.md). No Gemini key and no remote database are needed.

- **Done:** harness, safety guards, deterministic datasets, calibration for S1–S7, A/A noise floor for S4 and S6, generated tables.
- **Remaining:** the interleaved baseline-vs-current comparison (blocked on N1), S8 calibration and runs, A/A on the other scenarios, standard-profile confirmation runs.
- **Exit:** a published, clean-tree baseline for every comparable scenario, each with a noise floor.

### Phase 0B — Real Gemini and staging measurement

- 0B-i: real Gemini on local infrastructure (scenario S10), under a spend cap.
- 0B-ii: staging, once it exists.
- **Exit:** Gemini latency, retry rate, failure-reason mix, token use and cost per plan measured; the 60 s worst-case generation path confirmed or revised against the host's request timeout.

### Phase 0C — Production monitoring

- 0C-1 (no code): choose a monitor, fix the methodology in [PERFORMANCE.md §11](PERFORMANCE.md).
- 0C-2: switch probes on once `/health` ships.
- **Exit:** a monitor running from a recorded start date. No 30-day availability figure is claimed before 30 days of data.

### Phase 1 — Foundation and instrumentation (M)

In this order:

1. **`/health`** (liveness plus a trivial DB check, no Gemini) and **request-duration logging** with request ID, route pattern, status, duration, response size, and redaction of secrets and bodies. Required by 0C.
2. **Config module:** parse the environment once with zod and export a typed `config`; remove scattered `process.env` reads.
3. **Graceful shutdown:** handle `SIGTERM`, drain, `prisma.$disconnect()`.
4. **Structured logging** (pino) replacing `console.error`; Prisma query timing and Gemini per-attempt timing ([PERFORMANCE.md §9.1](PERFORMANCE.md)).
5. **Shared types workspace:** npm workspaces at the root; API request/response types derived from the zod schemas and Prisma types; one `ApiResponse<T>` envelope (today `/diet/*` returns `{ result }` while `/user/*` returns `{ success, data }`).
6. **Tooling:** Prettier, lint-staged, husky, ESLint on the server, type-aware ESLint, root-level `npm install` and `npm run dev`.
7. **Modern Gemini SDK:** move from `@google/generative-ai` to `@google/genai` with `responseSchema`, which would remove most of the parse-and-retry code. Measure S8/S10 before and after.
8. *Optional:* error tracking (Sentry). Prometheus and `/metrics` only if a consumer exists ([PERFORMANCE.md §9.4](PERFORMANCE.md)).

**Exit:** the server reports its own request latencies; one command starts everything; a schema change fails the client build.

### Phase 2 — Safety net and performance-regression CI (M)

- Unit tests (vitest): BMR/TDEE, macro rounding, the UTC date helper, the preference sanitiser.
- Integration tests (supertest + a Postgres container): the full auth lifecycle, the ownership guard on `/diet/:id`, the one-plan-per-day rule.
- Contract tests with a mocked Gemini returning malformed, short and out-of-range payloads.
- The run-record validator, so no number in a doc lacks a real run behind it.
- GitHub Actions: typecheck, lint, test, build on every PR; Dependabot.
- The paired PR-versus-base performance job, **advisory only** at first ([PERFORMANCE.md §8](PERFORMANCE.md)).

**Exit:** a red build on a real bug, and no red builds from noise.

### Phase 3 — Data and query optimisation (S–M)

Schema work, each migration with an `EXPLAIN` check and a before/after log entry:

- `DietaryConstraint` becomes one-to-one (`@unique` on `userId`).
- `@@unique([userId, date])` on `DietPlan`, replacing the process-local in-flight guard in [dietService.ts](../server/src/services/dietService.ts).
- Drop the redundant `Diet.date`.
- `createdAt` / `updatedAt` on every model.
- `mealType` as an enum.
- New tables needed by Phase 5: `WeightEntry`, `MealLog`, `Measurement`, `MealFeedback`.
- Whatever the [PERFORMANCE.md §10](PERFORMANCE.md) diagnoses justify for `/diet/history`, login and generation. Nothing is optimised before its diagnosis is recorded.

**Exit:** every hotspot has a recorded diagnosis and, where changed, a measured improvement.

### Phase 4 — Security, auth and user-safety hardening (L)

**Auth**

- `Session` table replacing the single `refreshToken` column, with rotation and reuse detection; per-device session list and revoke.
- Access token held in memory only, restored from the refresh cookie on page load (removes the `localStorage` XSS exposure).
- Password reset and email verification.
- Google OAuth with server-side ID-token verification; magic-link login; optional 2FA.
- Account deletion and data export. Foreign keys are `ON DELETE RESTRICT`, so deletion must run child-first.

**User safety** (moved here from later tiers)

- Medical disclaimer with an onboarding acknowledgement.
- **Structured allergies** with a **deterministic post-generation check**: an allergy the model misses is a safety incident.
- Eating-disorder guardrails: refuse dangerous deficits, check rate of loss and a BMI floor, notice repeated lowering of a target, surface support resources. Today only a 1200-kcal floor exists.
- Minor safeguards (the signup schema currently accepts age 10 with no special handling).
- Structured medical conditions (diabetes, PCOS, hypertension, CKD) gating the prompt with a "consult a professional" path; pregnancy and breastfeeding adjustments.

**Exit:** a lost password is recoverable; a stolen access token is short-lived and unreadable from script; an allergy in the profile can never appear in a saved plan.

### Phase 5 — Tier 1 product features (L)

- **Profile editing** (`PATCH /user/profile`). The single largest gap: the app is close to unusable without it.
- **Activity level** (five-point scale). The multiplier is hardcoded to 1.2 (sedentary) in [geminiService.ts](../server/src/services/geminiService.ts) and can be wrong by up to 60 %.
- **Meal adherence logging:** tick off what was eaten, show planned versus actual.
- **Single-meal swap/regenerate** with a reason. One bad suggestion currently ruins a whole day and the daily lock blocks a retry.
- **Weight tracking with a trend line** (smoothed moving average).
- **Explain the plan:** the BMR → TDEE → target → macro split, already computed server-side.
- **Guest / demo mode:** one sample plan with no signup. Usually the biggest conversion lever, since registration is currently required before any value is shown.
- Favourites and a block list ("never suggest paneer again").

**Exit:** a user can change their weight, log a day, and swap a meal, and returns tomorrow.

### Phase 6 — Client refactor (M)

Begins with a **frontend performance baseline** (Lighthouse, mobile profile, five runs; JS transferred). Then:

- RTK Query instead of hand-rolled `useEffect` fetching; local skeletons instead of the global `Loader`.
- `<Link>` instead of `onClick={() => navigate(...)}` in [Header.tsx](../client/src/components/Header.tsx).
- Split [Dashboard.tsx](../client/src/pages/ui/Dashboard.tsx) into panel, telemetry, meal-card and generate-button components.
- A real error boundary (today every render crash shows "404").
- Design tokens via Tailwind 4 `@theme`, plus `Button`, `Card`, `Field` primitives; remove the redundant `tailwind.config.ts` / PostCSS setup; delete unused `App.css`.
- React Hook Form with the shared zod schema; replace the remaining `alert()` calls.
- Accessibility pass: labels with `htmlFor`, menu `aria-expanded`, WCAG contrast; a light theme.

**Exit:** no page over roughly 150 lines; keyboard-only registration works; frontend numbers no worse than the baseline.

### Phase 7 — Tier 2 features (XL)

See [§5](#5-feature-catalogue) for the full list. Suggested internal order: food-database verification of macro claims → structured meal constraints (cuisine, budget, skill, equipment) → recipes and shopping list → weekly plans and calendar → streaming generation → conversational chat and natural-language/photo logging → reports, streaks, reminders.

### Phase 8 — Tier 3 and platform (XL)

Adaptive TDEE, health-platform integrations, coach mode, PWA/mobile, billing, admin and analytics. Depends on the logging data from Phase 5 and, for coach mode, on the multi-tenancy decision in [§9](#9-open-decisions).

---

## 5. Feature catalogue

Grouped by theme. The phase column says where each item lands.

### A. AI capabilities

| Feature | Phase |
|---|---|
| Explain the plan (BMR → TDEE → target → macro split) | 5 |
| Single-meal swap with a reason | 5 |
| Verification pass: check macro claims against a food database | 7 |
| Streaming generation (currently a blank "Compiling…" for 10+ s) | 7 |
| Per-meal thumbs up/down fed into future prompts | 7 |
| Conversational nutrition chat ("swap the chicken for tofu") | 7 |
| Natural-language meal logging ("two eggs, toast and a banana") | 7 |
| Photo meal logging (Gemini vision) | 7 |
| Prompt versioning and A/B testing (`promptVersion` stored per plan) | 7 |
| Semantic caching (similar profile reuses a recent plan; cuts cost) | 7 |
| Fridge/pantry photo → meal plan | 8 |
| Meal images (Imagen or stock) | 8 |
| Multi-model fallback instead of the current 502 | 8 |
| Voice input for logging | 8 |

### B. Nutrition science and coaching

| Feature | Phase |
|---|---|
| Activity level (five-point scale) | 5 |
| Goal weight and a projected timeline | 5 |
| Custom macro splits | 7 |
| Meal timing / intermittent-fasting windows | 7 |
| Micronutrients (fibre, sodium, iron, vitamin D) | 7 |
| Training-day versus rest-day calorie cycling | 7 |
| Diet breaks and refeeds within long cuts | 7 |
| Hydration and supplement tracking | 7 |
| Pre- and post-workout nutrition | 8 |
| **Adaptive TDEE** from weight trend versus intake (differentiator; makes the hardcoded 1.2 obsolete) | 8 |
| Body-fat % and the Katch-McArdle formula (also avoids the binary sex input; `Gender` is limited to `MALE`/`FEMALE`) | 8 |
| Menstrual-cycle phase awareness | 8 |

### C. Food and meal experience

| Feature | Phase |
|---|---|
| Favourites and block list | 5 |
| Cuisine / regional preference (plans are currently generic Western meals) | 7 |
| Budget-aware planning and a "cheap mode" | 7 |
| Cooking-skill and equipment constraints as user settings (the prompt currently picks one at random) | 7 |
| Recipes: steps, prep time, difficulty | 7 |
| Shopping list grouped by aisle | 7 |
| Portion scaling for a household | 7 |
| Batch-cooking / meal-prep mode | 8 |
| Restaurant / eating-out mode | 8 |
| Community meal library | 8 |
| Alcohol logging | 8 |

### D. Tracking and progress

| Feature | Phase |
|---|---|
| Meal adherence logging (planned versus actual) | 5 |
| Weight log and trend line | 5 |
| Weekly and monthly reports | 7 |
| Calendar view of plans and adherence | 7 |
| Body measurements | 7 |
| Milestones | 7 |
| Progress photos with before/after | 8 |

### E. Engagement and retention

| Feature | Phase |
|---|---|
| Guest / demo mode | 5 |
| Streaks and badges | 7 |
| Daily reminders (push, email or bot) | 7 |
| Weekly digest email | 7 |
| Habit checklist (sleep, steps, water) | 7 |

### F. Social and multi-user

| Feature | Phase |
|---|---|
| Shareable public plan links | 8 |
| Accountability partners | 8 |
| Family / household profiles | 8 |
| Coach ↔ client mode (the most plausible revenue path; changes the data model) | 8 |
| Leaderboards (opt-in, adherence-based rather than weight-based, for safety) | 8 |

### G. Integrations

| Feature | Phase |
|---|---|
| Food database: USDA FoodData Central, or Open Food Facts for packaged goods outside the US | 7 |
| Google Fit / Apple Health / Fitbit driving the activity multiplier | 8 |
| Barcode scanning | 8 |
| Grocery-delivery APIs | 8 |
| Google Calendar for meal-prep scheduling | 8 |
| Export to and import from MyFitnessPal and Cronometer | 8 |
| WhatsApp / Telegram bot as a low-friction logging surface | 8 |
| Public API and webhooks | 8 |

### H. Safety, inclusivity and compliance

Scheduled in Phase 4 unless noted.

| Item | Note |
|---|---|
| Eating-disorder guardrails | Rate-of-loss check, BMI floor, repeated-lowering detection, support resources |
| Medical disclaimer and acknowledgement | |
| Structured allergies with a deterministic post-generation check | Highest-risk item in the product |
| Structured medical conditions and pregnancy adjustments | |
| Minor safeguards | |
| Accessibility (WCAG) | Phase 6 |
| i18n and localised food data | Phase 8 |

### I. Platform and account

| Feature | Phase |
|---|---|
| Password reset, email verification | 4 |
| Google OAuth (server-verified), magic link, 2FA | 4 |
| Session management UI (per-device revoke) | 4 |
| Account deletion and data export (GDPR/DPDP) | 4 |
| Profile editing | 5 |
| Light theme (currently hardcoded dark via `color-scheme` in [index.css](../client/src/index.css)) | 6 |
| PWA with offline logging and sync-on-reconnect | 8 |
| Native mobile app (React Native / Expo) sharing the types package | 8 |

### J. Monetisation

Only if this is a product ([§9](#9-open-decisions)). Design before the schema hardens.

| Feature | Phase |
|---|---|
| Free versus Pro tiers (free: one plan a day; Pro: weekly plans, photo logging, chat) | 8 |
| Generation credits mapped to real per-plan Gemini cost | 8 |
| Stripe / Razorpay billing | 8 |
| Referral programme | 8 |
| Coach marketplace with revenue share | 8 |

### K. Operations and admin

| Feature | Phase |
|---|---|
| `/health`, structured logging, error tracking | 1 |
| Product analytics | 8 |
| Feature flags for staged rollout | 8 |
| Per-tier rate limiting (replaces the flat limits in [index.ts](../server/src/index.ts)) | 8 |
| Admin dashboard: signups, generations, failure rate, cost per user | 8 |
| Gemini cost monitoring and alerting | 8 |

---

## 6. Code-quality backlog

Everything not tied to a feature. The phase column says when it is done.

### Server

| Item | Why | Phase |
|---|---|---|
| Config module (zod-parsed env) | Env access is scattered across [db.ts](../server/src/utils/db.ts), [jwtHelper.ts](../server/src/utils/jwtHelper.ts), [cookie.ts](../server/src/utils/cookie.ts), [index.ts](../server/src/index.ts); failures surface at different times | 1 |
| `/health` and graceful shutdown | Uptime probes; clean deploys | 1 |
| Structured logging with request IDs | Debuggability; provenance for performance data | 1 |
| Replace class-singletons with plain functions | Every layer is `class X {}` + `export const x = new X()` with no state or DI; harder to test; `verifyJWT.verifyJWT` only works because it never touches `this` | Gradual, from 2 |
| Replace the in-flight `Set` with a DB unique constraint | The `Set` is per-process and does nothing on a second instance | 3 |
| `@google/genai` with `responseSchema` | Legacy SDK; structured output removes the retry loop | 1 |
| ESLint and Prettier on the server | It has neither | 1 |
| Remove `src/test.ts` once real tests exist | It is a manual script | 2 |

### Client

| Item | Why | Phase |
|---|---|---|
| RTK Query | Removes hand-rolled loading flags and boilerplate | 6 |
| `<Link>` for navigation | Middle-click, new tab and screen-reader semantics | 6 |
| Split Dashboard | 226 lines doing five jobs | 6 |
| Real error boundary | `errorElement` shows "404" for every crash | 6 |
| Local skeletons instead of a global `Loader` | A diet fetch currently blanks the whole app | 6 |
| Design tokens and primitives | The same colour and shadow classes repeat in every file | 6 |
| Clean up Tailwind 4 config; delete `App.css` | Redundant config; dead CSS | 6 |
| React Hook Form + shared zod schema | Onboarding gives no per-field feedback | 6 |
| Remove remaining `alert()` | Inconsistent with login and dashboard | 6 |
| Accessibility pass | Missing `htmlFor`, `aria-expanded`; contrast | 6 |

### Data

See [Phase 3](#phase-3--data-and-query-optimisation-sm). One-to-one constraints, the daily unique key, timestamps, enum, new tracking tables, and `Session` (Phase 4).

### Repository

| Item | Phase |
|---|---|
| npm workspaces at the root; single install and dev command | 1 |
| Shared types package | 1 |
| Prettier, lint-staged, husky | 1 |
| Type-aware ESLint (`recommendedTypeChecked`); `ecmaVersion: latest` in [eslint.config.js](../client/eslint.config.js) | 1 |
| Remove the unused `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from `server/.env` | Now |

---

## 7. Testing and CI

Currently no tests exist. In priority order:

| # | Layer | Tooling | Covers | Phase |
|---|---|---|---|---|
| 1 | Unit | vitest | BMR/TDEE, macro rounding, UTC date helper, preference sanitiser: pure functions, highest-risk logic | 2 |
| 2 | Integration | supertest + a Postgres container | Signup → login → refresh → logout; the `/diet/:id` ownership guard; one plan per day | 2 |
| 3 | Contract | mocked Gemini | Malformed, short and out-of-range model output; proves the validation layer holds | 2 |
| 4 | Performance regression | k6 via the harness | Paired PR-vs-base runs, advisory first ([PERFORMANCE.md §8](PERFORMANCE.md)) | 2 |
| 5 | Component | React Testing Library | Onboarding flow, the token-refresh interceptor | 6 |
| 6 | End to end | Playwright | Register → generate → view history | 6 |
| 7 | CI | GitHub Actions + Dependabot | Typecheck, lint, test, build on every PR | 2 |

---

## 8. Priorities

### If only five things get built

1. **Profile editing.** The app is close to unusable without it.
2. **Guest mode.** Lets anyone see the value without a three-step signup.
3. **Photo meal logging.** The highest perceived-value AI feature; Gemini already supports vision.
4. **Adaptive TDEE.** The genuine differentiator against every other calorie calculator.
5. **Structured allergies with a deterministic check.** The one place a model mistake could physically hurt someone.

### Why safety is in Phase 4 and not later

The generation pipeline in [geminiService.ts](../server/src/services/geminiService.ts) validates the *shape* of the model's answer and that calories land within ±10 % of target. It does not check that "200 g grilled chicken" has a plausible amount of protein, and it enforces allergy constraints only by asking the model. Both are failure modes with real-world consequences, so they are treated as blocking work, not polish.

---

## 9. Open decisions

Each one changes the plan.

| # | Decision | Affects |
|---|---|---|
| D1 | **Portfolio project or real product?** A portfolio project gains most from Phases 1, 2, 4 and a slice of 5; monetisation (J) is wasted effort. A product needs billing designed in before the schema hardens | Whole roadmap |
| D2 | **Who is the target user, and where?** Cuisine defaults and the food-database choice depend on it and are expensive to retrofit | Phase 7 |
| D3 | **Web only, or mobile eventually?** Photo logging, barcode scanning and reminders are all better native, which argues for Expo earlier and a leaner web client | Phases 6–8 |
| D4 | **Is coach mode in scope?** It is the clearest revenue path but changes the data model to organisation → coach → client; retrofitting multi-tenancy is painful | Phases 3, 8 |
| D5 | **N1: commit the pending work** ([§1.4](#14-pending-decision)) | Phase 0A |
| D6 | **Does a staging environment exist**, and if not, may one be created? | Phase 0B-ii |
| D7 | **Is the remote Supabase database production?** Treated as production until confirmed otherwise | All load testing |
| D8 | **Hosting platform, tier, region and request timeout** | Phases 0B, 0C |
| D9 | **Performance targets:** approve the proposed values or supply your own ([PERFORMANCE.md §13](PERFORMANCE.md)) | Phase 2 gates |

---

## 10. Risks

| Risk | Likelihood | Effect | Mitigation |
|---|---|---|---|
| Gemini returns wrong macros or misses an allergy | Certain over time | User harm | Deterministic checks and food-database verification (Phases 4, 7) |
| Gemini cost grows faster than usage | Medium | Budget | Caching, credits, per-tier limits, cost monitoring (Phases 7–8) |
| Schema changes on a database with real data | Medium | Data loss | Do Phase 3 early; test migrations on a clone first |
| A benchmark reaches a real database | Low, now guarded | Data pollution | Guards G1–G4 ([PERFORMANCE.md §2.3](PERFORMANCE.md)) |
| Benchmark noise mistaken for improvement | High without controls | Wrong decisions | Quiet gate, A/A floor, non-overlap rule |
| Client refactored against a moving API | Medium | Rework | Phase 6 stays late |
| Single-instance assumptions break when scaled | Medium | Incorrect daily limit, lost rate limits | DB unique constraint (Phase 3); shared rate-limit store before scaling |
| Access token in `localStorage` | Present today | Session theft via XSS | Phase 4 |

---

## Document history

| Date | Change |
|---|---|
| 2026-09-21 | Version 1: consolidated from the improvement plan, the expanded feature list and the performance roadmap |
