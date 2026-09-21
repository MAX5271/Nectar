# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

NECTAR is an AI-driven diet planner. Monorepo with two independent npm projects (no root package.json):

- `server/` — Express 5 + TypeScript (ESM) API, Prisma 7 + PostgreSQL (Supabase), Gemini (`gemini-2.5-flash`) for meal plans.
- `client/` — React 19 + Vite + Tailwind 4, Redux Toolkit, react-router-dom 7, axios.

## Commands

Server (`cd server`):
- `npm install`, then `npx prisma migrate dev` and `npx prisma generate` (the client is generated into `@prisma/client`; regenerate after schema changes).
- `npm run dev` (tsx watch), `npm run build` (tsc → `dist/`), `npm start`, `npm run typecheck`. No test suite.
- `npm run test:gemini` — ad-hoc script exercising BMR calc + Gemini generation, bypassing HTTP.
- Required `server/.env`: `DATABASE_URL`, `GEMINI_API_KEY`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`; optional `CLIENT_URL` (CORS allowlist, alongside `http://localhost:5173`), `PORT` (default 5000). Set `NODE_ENV=production` when deployed (enables `SameSite=None` refresh cookie and `trust proxy`). See `.env.example`.

Client (`cd client`):
- `npm run dev` (Vite, port 5173), `npm run build` (`tsc -b && vite build`), `npm run lint`. No tests.
- `VITE_API_URL` sets the API base URL (defaults to `http://localhost:5000/api`).
- `vercel.json` rewrites all paths to `/` for SPA routing.

## Architecture

**Server** is layered: `routes/` → `controller/` → `services/` → `repository/` (Prisma via `utils/db.ts`, which uses the `@prisma/adapter-pg` driver adapter). Controllers have no try/catch: Express 5 forwards async rejections to `middleware/errorHandler.ts`, which maps `HttpError`, zod errors and Prisma P2002 to responses. Request bodies are validated with zod in `utils/validation.ts`. Routes mount at `/api/auth`, `/api/user`, `/api/diet`; protected routes use `middleware/verifyJWT.ts` (Bearer access token → `req.id`; returns 401 on invalid/expired so the client refreshes).

**Auth**: access token (30m) in the `Authorization` header; refresh token (7d) in an HttpOnly cookie, stored **hashed** on the `User` row. `/auth/refresh` and `/auth/logout` authenticate via the cookie only (not the access token). Signup and login both set the cookie.

**Diet generation**: `POST /diet/plan` → `dietService.generateDailyPlan` loads the user's `DietaryConstraint`, enforces one plan per UTC day, then `geminiService` computes target calories (Mifflin-St Jeor × 1.2 + goal modifier, 1200 floor), sanitises `preferences` into the prompt, validates Gemini's JSON with zod (exactly 5 meals, calories within 10% of target, retried once) and computes totals from the meals. Plan dates are UTC midnight everywhere.

Data model (`server/prisma/schema.prisma`): `User` ↔ `DietaryConstraint` (biometrics/preferences/plan type), `User` → `DietPlan` → `Diet` (individual meals with macros).

**Client**: `App.tsx` defines the router; `ProtectedRoute` guards `/dashboard` and `/diet-history`. Auth/diet state lives in Redux slices (`store/slices`); the token is persisted in localStorage. `services/api.ts` is the axios instance: a request interceptor attaches the token (the store is injected via `injectStore` to avoid a circular import), and a 401 response interceptor makes a single shared refresh call and replays requests, logging out if it fails. `services/authFlow.ts` holds the shared login/register completion and logout (which also revokes the server session). Registration is a 3-step flow in `components/onboarding/`.
