# Nectar — Product & UX Review

A candid assessment of the current build (after the two UI/UX overhaul passes): what's missing as a *product*, what's rough in the current *UI/UX*, and where to invest next. Grounded in the actual code and a couple of verification passes (server test suite, dependency graph, schema) rather than guesswork — where I'm speculating rather than stating a confirmed fact, I've said so.

For context: the server ships with a real, currently-passing test suite (72 tests across 13 files — `server/tests/`). The client has none at all. That asymmetry shows up in a few places below.

---

## 1. Missing features

### Core diet/nutrition
- **No custom calorie/macro target.** The only levers are the three plan types (Cutting/Bulking/Recomp); there's no way to set a specific calorie or macro goal independent of those presets.
- **No manual meal editing.** Plans are fully AI-generated; there's no way to swap in your own meal, edit a portion, or add something outside the 5-meal structure.
- **No recipe detail.** Meals show a name, portion, and macros — never how to actually make the thing.
- **No grocery list.** A natural output of "here are your 5 meals for the day" that doesn't exist.
- **No multi-day / weekly view.** The whole product is "today." There's no way to look ahead or plan a week.
- **Body measurements are unused.** `Measurement` (chest/waist/hips/arms/thighs) exists in the Prisma schema with a `User` relation, but has **zero** route/service/controller/client code. Weight is the only body metric tracked.
- **Food preference learning is unused.** `MealFeedback` (per-food rating + block flag, unique per user+food) exists in the schema but nothing reads or writes it. Today "preferences" is one free-text field sent straight to Gemini each time — there's no structured "never suggest this again" or "I liked that" loop, even though the model for it is already there.
- **No exercise/activity logging.** `activityLevel` is a static profile field (Sedentary → Extra Active); there's no day-to-day logging of workouts or calories burned that would let the plan actually adapt.
- **No water tracking.**
- **Meal history has no manual-entry path.** "Mark eaten" only confirms/denies what the AI planned — there's no way to log something you ate that wasn't on the plan.

### Account & platform
- **No password reset / forgot-password flow**, anywhere in the UI or (as far as I can find) the API.
- **No email verification** on signup.
- **No real OAuth**, despite `authProvider: 'google' | 'local'` existing in the shared type — it's a modeled-but-unimplemented field, not a working login path.
- **Session management is built but not exposed.** `GET /auth/sessions` and `DELETE /auth/sessions/:id` exist server-side and are **never called from the client** — there's no "sign out other devices" UI at all.
- **No account deletion or data export.**
- **No notifications/reminders** (e.g. "you haven't built today's plan yet").

### Technical / platform
- **Client has zero automated tests.** No test runner is even configured (`client/package.json` has no `test` script). Contrast with the server's 72 passing tests.
- **No error/crash monitoring** (Sentry or equivalent) on either side — a production failure is only visible in server logs, never surfaced anywhere you'd actually see it.
- **No PWA support** — no manifest, no offline handling, not installable. A daily habit-tracking app is a strong candidate for this.
- **No dark mode.** The current identity is intentionally light-only; that was a deliberate choice in the redesign, but it's worth naming as a gap since many users expect the option.
- **No i18n** — all copy is hardcoded English; dates/numbers rely on browser defaults with no locale awareness.
- **Growing bundle, no code-splitting.** The client JS bundle is now ~1MB (~325KB gzipped) after adding Recharts/Motion/Radix, all loaded on every route including the marketing home page. `vite build` already warns about this.

---

## 2. UI/UX flaws in the current build

Roughly ordered by how much they'd actually bite a real user.

1. **Chart fetch failures are invisible.** `WeightTrendChart`, `AdherenceTrendChart`, and Progress's `/diet/history` fetch all catch errors with `console.error` only — no toast, no retry, no distinct error state. If the request fails, the chart just renders its **empty** state ("No weigh-ins yet" etc.), which is indistinguishable from "you genuinely have no data." A user with real data and a flaky connection has no idea their chart is lying to them.
2. **No password-reset entry point on the login page.** Whether or not the backend supports it, there's no "forgot password?" link — a locked-out user has no visible way forward.
3. **No confirm-password field at signup** (`Step1Credentials.tsx`). A typo in the password field isn't caught until the user tries to log in later.
4. **No client-side password strength feedback** — the 8-character minimum is enforced only server-side; the form gives no guidance while typing.
5. **7-day charts labeled as trends.** `GET /diet/history` is hardcoded to the last 7 plans (`dietRepository.ts`, `take: 7`), but the Progress page presents "Calories" and "Macro mix" as general trend charts. They can never show more than a week of history no matter how long someone's used the app — the UI implies a longer view than the API can deliver.
6. **Adherence toggle can flash on load.** `MealCard`'s "eaten" state starts `false` and is corrected once Dashboard's async fetch of today's logs resolves — on a slow connection you can briefly see a meal marked "not eaten" that actually is.
7. **Weight unit changes don't touch historical data.** Switching unit system in the profile-edit modal changes how *future* numbers are labeled, but previously logged weights aren't converted — worth a deliberate check (I haven't reproduced this end-to-end, but the code path doesn't do any conversion, so it's a real risk, not just theoretical).
8. **No logout confirmation.** One click and the session ends — low-stakes, but worth a beat given it's a deliberate, not-easily-undone action from the user's perspective.
9. **Footer feels thin post-cleanup.** Dropping the (non-functional) newsletter form was the right call, but the footer is now just two columns and could use one more substantive one (support/contact, or social links) rather than reading as visibly cut down.
10. **Accessibility basics unverified.** No skip-to-content link, and the chart/legend/donut interactions (hover, focus, touch on mobile) have only been checked for absence of console errors this session — not actually eyeballed in a browser at real widths, or run through a screen reader. Recommend a manual pass before calling Round 2 done.
11. **No retry affordance anywhere.** Every failure path — mutation or fetch — asks the user to redo the action from scratch (re-click a button) rather than offering a "try again" in the toast/empty state itself.

---

## 3. Suggested improvements, roughly prioritized

**Quick wins** (small, contained, clear value):
- Add a confirm-password field to signup.
- Add a "forgot password?" link on Login — even a placeholder pointing at support until a real reset flow exists is better than nothing.
- Give chart fetches a real error state (reuse the existing `EmptyState`/toast patterns) instead of silently degrading to "no data."
- Drop the `/diet/history` `take: 7` hardcode to an actual `days`/`limit` query param (flagged as an easy follow-up back in the Round 2 plan) — makes the Progress charts honest about what "trend" means.
- Build the session-management UI against the already-existing `GET/DELETE /auth/sessions` endpoints — this is backend work that's already done and just isn't surfaced.

**Medium investment, high value:**
- Client test setup (Vitest + React Testing Library at minimum for the primitive components and critical flows — auth, plan generation, meal logging).
- Body measurements tracking — the schema and even the `User` relation already exist; this is "just" a repository/service/route/UI slice, same shape as weight tracking.
- Structured food feedback (like/dislike/block) using the existing `MealFeedback` model, feeding into the Gemini prompt so preferences actually compound over time instead of resetting to a free-text field each generation.
- A real "grocery list" view generated from the day's plan — likely the single highest-leverage feature for a diet planner that doesn't exist yet.
- Code-splitting the client bundle (route-based `import()` at minimum for Progress's chart-heavy page) now that it's crossed 1MB.

**Bigger / strategic bets:**
- Multi-day/weekly planning instead of "today only."
- Custom calorie/macro targets, independent of the three fixed plan types.
- Real OAuth (the type already models it).
- PWA + reminder notifications — strong fit for a daily-habit product.
- Error monitoring (Sentry or similar) on both client and server — right now a production bug is invisible until a user reports it.
- Dark mode, if user research says it matters enough to invest in properly (not just inverting the existing palette).

---

*This is a review, not an implementation plan — happy to turn any section above into an actual plan (and go through the same plan-mode process as the last two rounds) once you've picked what's worth doing next.*
