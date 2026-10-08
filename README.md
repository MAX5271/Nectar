# 🍯 NECTAR — AI-Powered Metabolic Nutrition Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.2-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-indigo.svg)](https://www.prisma.io/)
[![Google OAuth](https://img.shields.io/badge/Google%20OAuth-Identity%20Services-4285F4.svg)](https://developers.google.com/identity)
[![Vitest](https://img.shields.io/badge/Tests-Client%20&%20Server%20Passing-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-ISC-black.svg)](#license)

**NECTAR** is a production-grade, medically guardrailed metabolic nutrition system and daily dietary command center. It bridges clinical nutrition algorithms (Mifflin-St Jeor BMR, dynamic activity scaling, eating-disorder guardrails, and deterministic 9-category allergen scanning) with Google's **Gemini 2.5 Flash** generative model to deliver structured, macro-precise daily diet protocols.

The frontend is an **identity-first personal nutrition cockpit**:
> **Editorial food journal × precision nutrition cockpit × calm personal software**  
> *"The user's food plan is the main character. Everything else is instrumentation."*

---

## 📑 Table of Contents

- [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
- [The Nectar Identity & Design System](#-the-nectar-identity--design-system)
- [Application Shell & Canonical Routing](#-application-shell--canonical-routing)
- [Workspace Surfaces](#-workspace-surfaces)
- [Authentication Architecture (Google OAuth & Native JWT Sessions)](#-authentication-architecture-google-oauth--native-jwt-sessions)
- [Prerequisites](#-prerequisites)
- [Local Setup & Getting Started](#-local-setup--getting-started)
  - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Database Setup](#3-database-setup)
  - [4. Launch the Development Environment](#4-launch-the-development-environment)
- [Deployment & Cloud Hosting (Vercel & Render)](#-deployment--cloud-hosting-vercel--render)
  - [1. Frontend Deployment on Vercel](#1-frontend-deployment-on-vercel)
  - [2. Backend Deployment on Render](#2-backend-deployment-on-render)
  - [3. Google Cloud OAuth Console Setup](#3-google-cloud-oauth-console-setup)
- [Complete API Reference](#-complete-api-reference)
  - [Response Envelope Format](#response-envelope-format)
  - [1. System & Health](#1-system--health)
  - [2. Authentication & Sessions](#2-authentication--sessions)
  - [3. User & Biometric Profile](#3-user--biometric-profile)
  - [4. Diet Protocol & Meal Swapping](#4-diet-protocol--meal-swapping)
  - [5. Tracking & Analytics](#5-tracking--analytics)
- [Security & Clinical Safety Guardrails](#-security--clinical-safety-guardrails)
- [Verification & Quality Commands](#-verification--quality-commands)
- [Performance Benchmarks](#-performance-benchmarks)

---

## 🏗️ Architecture & Monorepo Structure

NECTAR is structured as an **npm workspaces monorepo**:

```text
Nectar/
├── packages/
│   └── types/               # Shared TypeScript DTOs, enums, and API response contracts (@nectar/types)
├── server/                  # Node.js + Express 5 + TypeScript + Prisma API
│   ├── prisma/              # PostgreSQL schema definitions, client migrations
│   ├── src/
│   │   ├── config.ts        # Centralized, Zod-validated configuration singleton
│   │   ├── app.ts           # Express setup, security headers, CORS, middlewares
│   │   ├── index.ts         # Server lifecycle & graceful SIGTERM/SIGINT shutdown
│   │   ├── controller/      # Controllers (Auth, User, Diet, Tracking)
│   │   ├── middleware/      # Rate limiters, JWT verification, logging, error handling
│   │   ├── repository/      # Prisma database access layer
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (Gemini AI, Supabase Admin, Mifflin-St Jeor math, allergen scanning)
│   │   └── utils/           # Guardrails, Supabase helpers, cookie helpers, status codes, validations
│   └── tests/               # Vitest suite (Unit, Contract, Guest Auth, User Flow Integration)
├── client/                  # React 19 + TypeScript + Vite + Tailwind CSS v4 + Redux Toolkit
│   ├── src/
│   │   ├── components/
│   │   │   ├── nectar/      # NectarDroplet, NectarLine, NectarMark, NectarGenerationModal
│   │   │   ├── layout/      # AppSidebar, AppTopBar, MobileBottomNav, AuthenticatedLayout, PublicLayout
│   │   │   ├── dashboard/   # DashboardHero, MealTimeline, MealCard, DailyBalance, WeightSnapshot, GuestClaim
│   │   │   ├── progress/    # TrajectoryChart, AdherenceCalendar, NutritionConsistency
│   │   │   ├── ui/          # NectarBadge, NectarProgress, NectarStat, NectarButton, Dialogs
│   │   │   └── charts/      # Recharts historical trend visualizations
│   │   ├── pages/
│   │   │   ├── auth/        # LoginPage, Register, ForgotPassword, GuestOnboarding, AuthCallback
│   │   │   └── ui/          # HomePage (Landing), Dashboard (Today), Progress, Meals, Profile, Security, About
│   │   ├── services/        # Axios client, auth flow helpers, Supabase client
│   │   └── store/           # Redux Toolkit store (authSlice, dietSlice)
│   └── dist/                # Production Vite client bundle
└── performance/             # Automated k6 load-testing and regression benchmark harness
```

---

## 🎨 The Nectar Identity & Design System

Nectar's design language passes the **Screenshot Recognition Test**: *strip away logos and navigation labels, and the product is still immediately identifiable.*

### The Six Identity Pillars

1. **The Nectar Droplet**:
   - Atomic SVG teardrop glyph with semantic states:
     - `hollow`: Pending meal, upcoming milestone, or open input.
     - `filled`: Completed meal, reached macro goal, or verified status.
     - `active`: Accent glow, subtle pulse, or generative state.
2. **The Nectar Line**:
   - The physical visual rail connecting `Goal → Plan → Meal → Adherence → Trajectory`.
   - In `MealTimeline`, the Nectar Line links meals chronologically from breakfast to dinner.
   - In `Progress`, the line traces weight trajectories and 7-day moving averages.
3. **Three-Tier Typography Stack**:
   - **Display**: *Fraunces* — Warm, high-contrast serif for page statements, greetings, and meal titles.
   - **Interface**: *DM Sans* — Clean, geometric sans-serif for controls, navigation, and dialogs.
   - **Data Layer**: *IBM Plex Mono* — Crisp monospaced tabular numerals for macros (`P 32g  C 54g  F 18g`), calories, timestamps, and chart axes.
4. **Nutrition Data Language**:
   - Quantitative data follows strict instrumentation:
     - `[UPPERCASE LABEL: 11px Mono/Sans, 60% opacity]`
     - `[LARGE NUMERICAL VALUE: 24-32px Mono, ink] [UNIT: 14px Mono]`
     - `[CONTEXTUAL DELTA: 12px Mono, herb/beet/turmeric]`
5. **Food Editorial Language**:
   - High-quality, close-crop culinary photography with natural textures, warm directional lighting, and authentic plating.
6. **Calm Motion (Framer Motion)**:
   - Motion is focused on moments of intent: plan synthesis droplet journey, 1-click meal adherence toggle pulse, and smooth page reveals. Full support for `prefers-reduced-motion`.

### Restrained Color Palette

| Token | Hex | Role | Usage |
|:---|:---|:---|:---|
| `--color-bone` | `#F4EFE5` | Parchment Base | 85–90% of screen surface area |
| `--color-bone-light` | `#FAF7F0` | Elevated Surface | Card panels, modals, popovers |
| `--color-ink` | `#20231E` | Deep Organic Ink | Primary text, high-contrast controls |
| `--color-line` | `#DED2B8` | Subtle Divider | Nectar Line rail, subtle card borders |
| `--color-beet` | `#6E3040` | Protein & Focus | Protein macro pills, primary CTAs, active highlights |
| `--color-turmeric` | `#D49A32` | Carbs & Energy | Carbohydrate pills, partial states, guest tags |
| `--color-herb` | `#52684F` | Fats & Completion | Fat macro pills, completed meal droplets, success |
| `--color-honey` | `#B87532` | Calories & Streaks | Calorie centerpiece, streak badges, Nectar brand mark |

---

## 🧭 Application Shell & Canonical Routing

```text
                              BROWSER ENTRY (/)
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
            [UNAUTHENTICATED]                    [AUTHENTICATED]
                    │                                   │
                    ▼                                   ▼
         Public Experience (/)                Today Cockpit (/dashboard)
         • PublicLayout                       • Pinned Left AppSidebar (248px/72px)
         • Minimal editorial header           • Top Context Bar (Streak, Calories)
         • Nectar Line visual journey         • 12-Column Responsive Layout
         • Macro balance plate preview        • 8 Cols: Meal Timeline (Protagonist)
         • 1-Click Guest Trial                • 4 Cols: Daily Balance & Snapshot
         • /about, /login, /register          • /progress, /meals, /profile, /security
```

### Routing Invariants
1. **Canonical `/` Invariant**:
   - Visiting `/` when **unauthenticated** renders the public editorial landing page (`HomePage.tsx`).
   - Visiting `/` when **authenticated** triggers a zero-flash client redirect straight into `/dashboard` (*"Today"*).
2. **Product Vocabulary**:
   - The primary route URL remains `/dashboard` for test and API compatibility, while user-facing UI labels and navigation strictly refer to it as **"Today"**.
3. **Workspace Shell Components**:
   - `AppSidebar`: Pinned on desktop (expanded 248px or collapsed 72px rail stored in `localStorage`) + slide-over drawer on mobile.
   - `AppTopBar`: Sticky context bar with formatted date, streak droplet indicator, calorie target snapshot, and quick profile link.
   - `MobileBottomNav`: Pinned bottom navigation for small viewports (*Today, Progress, Meals, Profile*).

---

## 🖥️ Workspace Surfaces

### 1. Today Cockpit (`/dashboard`)
The dietary command center organized in a 12-column responsive layout:
- **8 Columns (Main Protagonist)**:
  - `DashboardHero`: Time-aware greeting (*"Good morning, Alex"*), daily focus directive, and baseline summary capsule.
  - `MealTimeline`: Chronologically sequenced meals (*08:00 AM Breakfast → 01:00 PM Lunch → 04:30 PM Snack → 07:45 PM Dinner*) connected by the physical Nectar Line.
  - `MealCard`: Macro breakdown pills, portion sizing, 1-click adherence toggle (*"Mark eaten"* / *"Eaten"*), and culinary swap trigger.
- **4 Columns (Instrumentation Panels)**:
  - `DailyBalance`: Calorie centerpiece (consumed vs target, remaining kcal ticker), horizontal macro balance bars (Protein, Carbs, Fat), and plan generation trigger.
  - `WeightSnapshot`: Latest weight, 7-day delta, mini SVG sparkline, and inline logging form.
  - `GuestClaim`: Non-intrusive prompt for anonymous guest sessions to save credentials.

### 2. Trajectory & Consistency (`/progress`)
- `TrajectoryChart`: Interactive weight trend with `7D`, `30D`, and `90D` horizon filters and 7-day Simple Moving Average (SMA).
- `AdherenceCalendar`: 28-day (4-week) cadence matrix with Nectar Droplets marking daily completion.
- `NutritionConsistency`: Precision ratings for protein consistency, calorie targets, and fiber intake.
- `Past Protocols Archive`: Historical expandable daily plans.

### 3. Meals & Culinary Formulations (`/meals`)
- Recipe exploration library with authentic culinary photography.
- Filter pills: *All, High Protein, Balanced, Low Carb, Quick Prep*.
- Ingredient specifications, preparation times, and instant swap recommendation actions.

### 4. Your System (`/profile`)
- Progressive baseline configuration:
  - **Body & Biometrics**: Height, current weight, age, activity level, unit system (Metric vs Imperial).
  - **Metabolic Direction**: Cutting (Deficit), Maintenance, Bulking (Surplus).
  - **Dietary Boundaries**: Allergies, restrictions, and culinary flavor preferences.

### 5. Security & Devices (`/security`)
- Active multi-device sessions audit table with browser/OS parsing, IP address, and last active timestamp.
- Remote session revocation and account credential protection.

---

## 🔐 Authentication Architecture (Google OAuth & Native JWT Sessions)

NECTAR implements a secure, identity-first authentication model:

1. **In-Memory Access Tokens**:
   - Bearer access tokens reside **strictly in volatile Redux memory**. They are never saved to `localStorage` or `sessionStorage`, eliminating XSS token exfiltration risks.
2. **HttpOnly Secure Refresh Cookies**:
   - Rotating refresh tokens are stored in `HttpOnly`, `Secure` cookies with `SameSite=Lax` (development) or `SameSite=None` (cross-site production).
   - Replay & reuse detection: If an old or rotated token is used, all active sessions for that user are immediately revoked.
3. **Google OAuth 2.0 Integration (Google Identity Services)**:
   - One-click sign-in via official Google Identity Services (`gsi/client`) popup flow.
   - Verified server-side via Google's token verification endpoints (`tokeninfo` & `userinfo`) to validate audience (`GOOGLE_CLIENT_ID`), issuer, expiry, and email verification.
   - First-time Google users are automatically provisioned in PostgreSQL and smartly guided to biometric onboarding (`/welcome`).
4. **Multi-Device Session Tracking**:
   - Every active session is tracked in the `Session` table in PostgreSQL with user agent parsing, IP address, and remote revocation capability from `/security`.

---

## ⚙️ Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **PostgreSQL**: Local PostgreSQL, Docker instance, or cloud PostgreSQL (Neon, Render, Supabase Postgres)
- **Google AI Studio API Key**: For Gemini diet generation ([Get Key](https://aistudio.google.com/))
- **Google Cloud OAuth 2.0 Client**: For Google Sign-In ([Google Cloud Console](https://console.cloud.google.com/))

---

## 🚀 Local Setup & Getting Started

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/MAX5271/Nectar.git
cd Nectar
npm install
```

### 2. Configure Environment Variables

#### Server Environment (`server/.env`)

Create `server/.env` based on `server/.env.example`:

```env
# Server Runtime
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nectar"

# Google Gemini AI
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GEMINI_MODE=live                  # Set to "stub" for local offline testing without calling Gemini

# JWT Secrets (Minimum 32 characters)
ACCESS_TOKEN_SECRET="super-secret-access-token-key-must-be-at-least-32-chars-long"
REFRESH_TOKEN_SECRET="super-secret-refresh-token-key-must-be-at-least-32-chars-long"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"  # Optional

# Rate Limiting (Optional overrides)
RATE_LIMIT_DISABLED=false
SWAP_LIMIT_PER_HOUR=20
REFRESH_LIMIT_PER_15M=60
```

#### Client Environment (`client/.env`)

Create `client/.env` based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

### 3. Database Setup

#### Option A: Using Local Docker PostgreSQL

```bash
docker run -d --name nectar-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nectar \
  -p 5432:5432 postgres:17
```

#### Apply Migrations & Generate Prisma Client

```bash
# Push schema to database
npm --workspace=server run prisma:push

# Generate typed Prisma client
npm --workspace=server run prisma:generate
```

### 4. Launch the Development Environment

Start server and client concurrently or in separate terminals:

```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
npm --workspace=server run dev

# Terminal 2: Client UI (runs on http://localhost:5173)
npm --workspace=Nectar run dev
```

---

## 🚀 Deployment & Cloud Hosting (Vercel & Render)

> 📖 **Full Cloud Deployment Guide**: Detailed step-by-step instructions, build overrides, and dashboard parameters are documented in [**`DEPLOYMENT.md`**](DEPLOYMENT.md).

NECTAR is configured for seamless monorepo deployment with the frontend on **Vercel** and the backend API on **Render**.

### 1. Frontend Deployment on Vercel

In your Vercel Project Settings:

#### Framework & Root Settings
* **Framework Preset**: `Vite`
* **Root Directory**: `client`
* **Include files outside the root directory in the Build Step**: **Enabled** *(Must be ON so Vercel can access `@nectar/types` and workspace root)*
* **Skip deployments...**: Disabled

#### Build & Development Settings (Overrides)
* **Build Command**: Toggle Override **ON**  
  ```bash
  cd .. && npm run build:types && npm run build:client
  ```
* **Output Directory**: Leave Override **OFF** (default: `dist`)
* **Install Command**: Toggle Override **ON**  
  ```bash
  cd .. && npm install
  ```
* **Development Command**: Leave Override **OFF** (default: `vite`)

#### Environment Variables (Vercel)
* `VITE_API_URL`: `https://your-backend-domain.onrender.com/api`
* `VITE_GOOGLE_CLIENT_ID`: `<your-client-id>.apps.googleusercontent.com`

---

### 2. Backend Deployment on Render

In your Render Dashboard, create a **Web Service** connected to your repo:

#### Web Service Configuration
* **Branch**: `main`
* **Root Directory**: `server`
* **Build Command**:
  ```bash
  cd .. && npm install && npm run build:types && cd server && npx prisma generate && npm run build
  ```
* **Start Command**:
  ```bash
  npm start
  ```
  *(or `npx prisma migrate deploy && npm start` to automatically run database migrations on boot)*

#### Build Filters (Auto-Deploy)
Under **Build Filters** → **Included Paths**, add:
* `server/**`
* `packages/**`

#### Environment Variables (Render)
* `NODE_ENV`: `production` *(enables trust proxy for secure HTTPS cookies)*
* `PORT`: `5000` *(or leave default Render port)*
* `DATABASE_URL`: `postgresql://user:password@host:5432/dbname`
* `CLIENT_URL`: `https://nectar-tau.vercel.app` *(Crucial: allows credentials and cookies from frontend)*
* `ACCESS_TOKEN_SECRET`: `(at least 32 characters)`
* `REFRESH_TOKEN_SECRET`: `(at least 32 characters)`
* `GEMINI_API_KEY`: `AIzaSy...`
* `GOOGLE_CLIENT_ID`: `<your-client-id>.apps.googleusercontent.com`
* `GOOGLE_CLIENT_SECRET`: `your-google-client-secret` *(optional)*

---

### 3. Google Cloud OAuth Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services**.
2. **OAuth Consent Screen**:
   * App name: `Nectar`
   * Support & developer emails: Your email
   * Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   * Test users: Add test Gmail addresses if in Testing mode.
3. **Credentials** → **Create Credentials** → **OAuth client ID** (`Web application`):
   * **Authorized JavaScript origins**:
     * `http://localhost:5173` *(Local Vite dev server)*
     * `https://nectar-tau.vercel.app` *(Vercel production URL)*
   * **Authorized redirect URIs**:
     * `http://localhost:5173`
     * `http://localhost:5173/auth/callback`
     * `https://nectar-tau.vercel.app`
     * `https://nectar-tau.vercel.app/auth/callback`

---

## 📡 Complete API Reference

All requests and responses use JSON. Cross-site requests require `credentials: include` (for the secure `jwt` refresh cookie).

### Response Envelope Format

Standard API responses return a unified response envelope (`ApiResponse<T>`):

```json
{
  "success": true,
  "message": "Human-readable description (optional)",
  "data": { ... }
}
```

Error responses return:

```json
{
  "success": false,
  "message": "Specific error explanation"
}
```

---

### 1. System & Health

#### `GET /health`
Liveness probe and database connection verification.

- **Authentication**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "uptimeSeconds": 142.8,
    "timestamp": "2026-09-23T16:30:00.000Z"
  }
  ```

---

### 2. Authentication & Sessions

#### `POST /api/user/signup`
Creates a new account, initializes dietary constraints, and issues tokens.

- **Authentication**: None (Public)
- **Rate Limit**: 30 requests / 15 min (`authLimiter`)
- **Request Body**:
  ```json
  {
    "email": "operative@nectar.health",
    "username": "Neo",
    "password": "Password123!",
    "age": 28,
    "gender": "MALE",
    "height": 180,
    "weight": 80,
    "planType": "CUTTING",
    "unitSystem": "METRIC",
    "activityLevel": "MODERATE",
    "preferences": "High protein, no peanuts"
  }
  ```
- **Response `201 Created`**:
  - **Set-Cookie**: `jwt=<refreshToken>; HttpOnly; Secure; SameSite=Lax/None; Max-Age=7d`
  - **Body**: `{ "success": true, "data": { "id": "...", "username": "Neo", "email": "...", "accessToken": "..." } }`

#### `POST /api/auth/login`
Authenticates user credentials, registers a session record, and sets the `HttpOnly` refresh cookie.

- **Authentication**: None (Public)
- **Response `200 OK`**: Sets cookie and returns access token + user details.

#### `POST /api/auth/google`
Authenticates via Google Identity Services token (ID token or access token), establishes or links the user account, registers a session record, and sets the `HttpOnly` refresh cookie.

- **Authentication**: None (Public)
- **Rate Limit**: 30 requests / 15 min (`authLimiter`)
- **Request Body**:
  ```json
  {
    "idToken": "<google-id-token-or-access-token>",
    "profile": { ...optional biometrics for instant setup... }
  }
  ```
- **Response `200 OK`**:
  - **Set-Cookie**: `jwt=<refreshToken>; HttpOnly; Secure; SameSite=Lax/None; Max-Age=7d`
  - **Body**: `{ "success": true, "data": { "id": "...", "username": "Alex", "email": "alex@gmail.com", "accessToken": "..." } }`

#### `POST /api/auth/refresh`
Rotates the session refresh token and issues a fresh short-lived Bearer access token.

- **Authentication**: HttpOnly Cookie (`jwt=<refreshToken>`)
- **Headers**: `X-Requested-With: XMLHttpRequest` (anti-CSRF header)
- **Response `200 OK`**: Sets new rotated cookie and returns `{ "success": true, "accessToken": "..." }`.

#### `POST /api/auth/logout`
Terminates the user's active session in the database and clears the refresh cookie.

- **Authentication**: HttpOnly Cookie (`jwt`)
- **Response `200 OK`**: Sets `jwt=; Max-Age=0`.

#### `GET /api/auth/sessions`
Retrieves all active devices/sessions associated with the user.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Array of active sessions with `userAgent`, `ipAddress`, `isCurrent`, and timestamps.

#### `DELETE /api/auth/sessions/:id`
Remotely revokes a specific device session.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: `{ "success": true, "message": "Session successfully revoked" }`

---

### 3. User & Biometric Profile

#### `GET /api/user/profile`
Fetches user profile along with active dietary constraints.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns user profile with populated biometrics.

#### `PATCH /api/user/profile`
Updates biometrics, activity scaling, or dietary restrictions. Automatically re-evaluates clinical guardrails.

- **Authentication**: `Bearer <accessToken>`
- **Request Body** (optional fields): `weight`, `height`, `age`, `activityLevel`, `planType`, `preferences`.
- **Response `200 OK`**: Returns updated user record.

---

### 4. Diet Protocol & Meal Swapping

#### `POST /api/diet/plan`
Generates a complete personalized daily nutrition protocol using Gemini AI.

- **Authentication**: `Bearer <accessToken>`
- **Rate Limit**: 10 requests / 1 hour (`generateLimiter`)
- **Idempotency**: Strict daily lock (`@@unique([userId, date])`). Only 1 plan can be generated per calendar day (UTC midnight boundary).
- **Clinical Math**: Computes Mifflin-St Jeor BMR, applies Activity Multiplier (1.2–1.9), applies Goal Adjustment (-500 for CUTTING, +300 for BULKING), clamps to minimum 1200 kcal floor (1600 for teens), verifies against 9-category allergen taxonomy.
- **Response `201 Created`**: Returns generated `DietPlan` with embedded meals and macro totals.

#### `GET /api/diet/latest`
Returns the user's most recent daily protocol.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns latest `DietPlan` object.

#### `GET /api/diet/history`
Returns historical diet protocols ordered by date descending.

- **Authentication**: `Bearer <accessToken>`
- **Query Params**: `days` (integer, default `30`)
- **Response `200 OK`**: Array of historical `DietPlan` records.

#### `GET /api/diet/:id`
Retrieves a specific diet plan by UUID with owner authorization (prevents IDOR).

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns matching `DietPlan` object.

#### `GET /api/diet/explain`
Returns a transparent breakdown of the exact metabolic formulas used to calculate the user's protocol.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns BMR, TDEE, goal adjustment, macro split percentages, and formula metadata.

#### `POST /api/diet/swap`
Swaps an individual meal suggestion without discarding or re-generating the entire day's plan.

- **Authentication**: `Bearer <accessToken>`
- **Rate Limit**: 20 requests / 1 hour (`swapLimiter`)
- **Request Body**: `{ "dietId": "uuid", "reason": "Prefer a vegetarian alternative" }`
- **Behavior**: Prompts Gemini to generate a single culinary replacement targeted to the exact calories of the swapped meal ($\pm 10\%$), runs allergen scan, updates meal in-place, and recalculates parent plan macro totals.
- **Response `200 OK`**: Returns updated meal and parent `DietPlan`.

---

### 5. Tracking & Analytics

#### `POST /api/tracking/weight`
Logs a bodyweight entry and automatically syncs the user's active constraint profile.

- **Authentication**: `Bearer <accessToken>`
- **Request Body**: `{ "weight": 78.2, "date": "...", "note": "Morning fasted" }`
- **Response `201 Created`**: Returns created `WeightEntry`.

#### `GET /api/tracking/weight/trend`
Computes 7-day Simple Moving Average (SMA) and rate of weekly weight change.

- **Authentication**: `Bearer <accessToken>`
- **Query Params**: `days` (default `60` or `90`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "currentWeight": 78.2,
      "latestMovingAverage": 78.6,
      "weeklyChangeKg": -0.4,
      "direction": "LOSING",
      "history": [ ... ]
    }
  }
  ```

#### `POST /api/tracking/meals`
Logs meal adherence (eaten as prescribed vs off-plan).

- **Authentication**: `Bearer <accessToken>`
- **Request Body**: `{ "name": "...", "mealType": "BREAKFAST", "calories": 450, "protein": 35, "carbs": 55, "fat": 10, "adhered": true, "dietPlanId": "..." }`
- **Response `201 Created`**: Returns logged `MealLog` entry.

#### `GET /api/tracking/meals`
Returns logged meals and aggregated macronutrient adherence totals for a specified date.

- **Authentication**: `Bearer <accessToken>`
- **Query Params**: `date` (`YYYY-MM-DD`, defaults to today UTC)
- **Response `200 OK`**: Aggregated calories, macros, adherence percentage, and raw logs.

---

## 🛡️ Security & Clinical Safety Guardrails

### 1. In-Memory Token Architecture
- **Bearer Access Tokens** are stored **strictly in volatile Redux memory** on the client. Tokens are never written to `localStorage`, `sessionStorage`, or JavaScript-accessible storage, eliminating XSS token theft vectors.
- **Refresh Tokens** are transmitted in `HttpOnly`, `Secure` cookies with `SameSite=Lax` (development) or `SameSite=None` (production).
- On application reloads, the client issues a silent `POST /api/auth/refresh` request to re-hydrate the in-memory token.

### 2. Refresh Token Rotation & Breach Detection
- Every refresh operation invalidates the existing token and generates a new cryptographic token hash.
- **Reuse Detection**: If an old/rotated refresh token is presented, the system detects a token replay attack and immediately revokes all sessions across all devices for that user.

### 3. Deterministic Post-Generation Allergen Scanner
- AI outputs are never trusted blindly. NECTAR runs a deterministic post-generation scanner using an extensive culinary synonym taxonomy across 9 major allergen categories:
  - **Peanut**, **Tree Nut**, **Dairy**, **Egg**, **Fish**, **Shellfish**, **Wheat / Gluten**, **Soy**, **Sesame**.
- If a generated meal contains any forbidden ingredient (or culinary synonym such as `ghee`, `whey`, `casein`, `pesto`, `marzipan`), the generation attempt is rejected and retried.

### 4. Eating Disorder & Physiological Guardrails
- **BMI Floor Check**: Caloric restriction is prohibited if BMI is below 16.0 (severe underweight) or below 18.5 with a `CUTTING` goal.
- **Absolute Caloric Floors**: Plans are hard-clamped to a minimum of 1200 kcal/day for adults and 1600 kcal/day for adolescents.
- **Deficit Cap**: Caloric deficits are capped at a maximum of 1000 kcal below estimated TDEE.
- **COPPA Compliance**: Age is validated $\ge 13$ years old on registration and profile updates.

### 5. Rate Limiting Matrix

| Limiter | Window | Limit | Target Endpoints |
|---|:---:|:---:|---|
| `authLimiter` | 15 min | 30 req | `POST /api/auth/login`, `POST /api/user/signup`, `POST /api/auth/google` |
| `refreshLimiter` | 15 min | 60 req | `POST /api/auth/refresh`, `GET /api/auth/refresh` |
| `generateLimiter` | 60 min | 10 req | `POST /api/diet/plan` |
| `swapLimiter` | 60 min | 20 req | `POST /api/diet/swap` |

---

## 🧪 Verification & Quality Commands

All verification commands can be run from the repository root:

```bash
# Run client unit and component tests (32 tests across 7 suites)
npm --workspace=Nectar test

# Run server unit and integration tests (38 tests across 8 suites)
npm --workspace=server run test tests/unit/ tests/integration/googleAuthIntegration.test.ts

# Run complete TypeScript build and bundle checks (client + server)
npm run build

# Run ESLint across client and server
npm run lint
```

---

## 📈 Performance Benchmarks

NECTAR maintains a strict performance regression harness located in `performance/`. The harness measures end-to-end throughput and latency percentiles under load using k6.

Baseline performance measurements on `GET /api/diet/latest` (Scenario S4, 320 RPS sustained):
- **p50 Latency**: `1.1 ms`
- **p95 Latency**: `1.9 ms`
- **p99 Latency**: `3.8 ms`
- **HTTP Error Rate**: `0.00%`

---

## 📄 License

ISC License © 2026 NECTAR Health Systems.
