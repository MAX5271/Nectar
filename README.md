# 🍯 NECTAR — AI-Powered Metabolic Nutrition Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-indigo.svg)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Tests-56%20Passed-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-ISC-black.svg)](#license)

**NECTAR** is a production-grade, medically guardrailed metabolic nutrition system and daily dietary command center. It combines server-side clinical nutrition algorithms (Mifflin-St Jeor BMR, dynamic activity scaling, eating-disorder guardrails, and deterministic allergy scanning) with Google's **Gemini 2.5 Flash** generative model to deliver structured, macro-precise daily diet protocols.

---

## 📑 Table of Contents

- [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
- [Prerequisites](#-prerequisites)
- [Local Setup & Getting Started](#-local-setup--getting-started)
  - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Database Setup](#3-database-setup)
  - [4. Launch the Development Environment](#4-launch-the-development-environment)
- [Complete API Reference](#-complete-api-reference)
  - [Response Envelope Format](#response-envelope-format)
  - [System & Health](#1-system--health)
  - [Authentication & Sessions](#2-authentication--sessions)
  - [User & Biometric Profile](#3-user--biometric-profile)
  - [Diet Protocol & Meal Swapping](#4-diet-protocol--meal-swapping)
  - [Tracking & Analytics](#5-tracking--analytics)
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
│   ├── prisma/              # PostgreSQL schema definitions and migrations
│   ├── src/
│   │   ├── config.ts        # Centralized, Zod-validated configuration singleton
│   │   ├── app.ts           # Express application setup, security headers, CORS, middlewares
│   │   ├── index.ts         # Server lifecycle & graceful SIGTERM/SIGINT shutdown
│   │   ├── controller/      # Route controllers (Auth, User, Diet, Tracking)
│   │   ├── middleware/      # Rate limiters, JWT verification, request logging, error handling
│   │   ├── repository/      # Prisma database access layer
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (Gemini AI, Mifflin-St Jeor math, allergy scanning)
│   │   └── utils/           # Guardrails, cookie helpers, status codes, validations
│   └── tests/               # Vitest test suite (Unit, Contract, Integration)
├── client/                  # React 19 + TypeScript + Vite + Tailwind CSS v4 + Redux Toolkit
│   ├── src/
│   │   ├── components/      # Common primitives, Error Boundaries, Dashboard widgets
│   │   ├── pages/           # Route views (Dashboard, History, Login, Register)
│   │   ├── services/        # Axios API client, silent refresh interceptor, auth flows
│   │   └── store/           # Redux Toolkit store and state slices (authSlice, dietSlice)
│   └── dist/                # Production Vite client bundle
└── performance/             # Automated k6 load-testing and regression benchmark harness
```

---

## ⚙️ Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **PostgreSQL**: Local PostgreSQL or containerized Docker instance (or Supabase Postgres)
- **Google AI Studio API Key**: For Gemini generation ([Get Key](https://aistudio.google.com/))
- **Docker & Docker Compose** *(Optional, recommended for testing & isolated local DB)*

---

## 🚀 Local Setup & Getting Started

### 1. Clone and Install Dependencies

Install all root, client, server, and shared package dependencies with a single command from the project root:

```bash
git clone https://github.com/MAX5271/Nectar.git
cd Nectar
npm install
```

### 2. Configure Environment Variables

#### Server Environment (`server/.env`)

Create `server/.env` with the following configuration:

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

# Rate Limiting (Optional overrides)
RATE_LIMIT_DISABLED=false
SWAP_LIMIT_PER_HOUR=20
REFRESH_LIMIT_PER_15M=60
```

#### Client Environment (`client/.env`)

Create `client/.env` (optional; defaults to `http://localhost:5000/api`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

#### Option A: Using Local Docker PostgreSQL (Recommended for Tests & Dev)

Start the local benchmark & test database:

```bash
docker run -d --name nectar-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nectar \
  -p 5432:5432 postgres:17
```

#### Option B: Remote / Supabase Database

Paste your connection string into `DATABASE_URL` in `server/.env`.

#### Apply Migrations & Generate Prisma Client

```bash
# Push schema to database
npm --workspace=server run prisma:push

# Generate typed Prisma client
npm --workspace=server run prisma:generate
```

### 4. Launch the Development Environment

You can start server and client independently:

```bash
# Terminal 1: Start Backend API (runs on http://localhost:5000)
npm --workspace=server run dev

# Terminal 2: Start Client UI (runs on http://localhost:5173)
npm --workspace=Nectar run dev
```

---

## 📡 Complete API Reference

All requests and responses use JSON. Cross-site requests require `credentials: include` (for the secure `jwt` refresh cookie).

### Response Envelope Format

All standard API endpoints return a unified response schema (`ApiResponse<T>`):

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
Liveness probe and database connection verification. Mounted before rate limiters and auth guards.

- **Authentication**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "uptimeSeconds": 142.8,
    "timestamp": "2026-09-21T16:30:00.000Z"
  }
  ```

---

### 2. Authentication & Sessions

#### `POST /api/user/signup`
Creates a new operative account, initializes dietary constraints, and issues tokens.

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
- **Validation**:
  - `age`: $\ge 13$ (COPPA compliance)
  - `activityLevel`: `SEDENTARY`, `LIGHT`, `MODERATE`, `VERY_ACTIVE`, `EXTRA_ACTIVE`
  - `planType`: `CUTTING`, `BULKING`, `RECOMP`
  - `gender`: `MALE`, `FEMALE`
  - `unitSystem`: `METRIC`, `IMPERIAL`
- **Response `201 Created`**:
  - **Set-Cookie**: `jwt=<refreshToken>; HttpOnly; Secure; SameSite=Lax/None; Max-Age=7d`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "User created successfully",
      "data": {
        "id": "uuid",
        "username": "Neo",
        "email": "operative@nectar.health",
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```

#### `POST /api/auth/login`
Authenticates user credentials, registers a session record, and sets the `HttpOnly` refresh cookie.

- **Authentication**: None (Public)
- **Rate Limit**: 30 requests / 15 min (`authLimiter`)
- **Request Body**:
  ```json
  {
    "email": "operative@nectar.health",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  - **Set-Cookie**: `jwt=<refreshToken>; HttpOnly; Secure; Max-Age=7d`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "User logged in successfully",
      "data": {
        "id": "uuid",
        "username": "Neo",
        "email": "operative@nectar.health",
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```

#### `POST /api/auth/refresh`
Rotates the session refresh token and issues a fresh short-lived Bearer access token.

- **Authentication**: HttpOnly Cookie (`jwt=<refreshToken>`)
- **Rate Limit**: 60 requests / 15 min (`refreshLimiter`)
- **Headers**: `X-Requested-With: XMLHttpRequest` (anti-CSRF header)
- **Behavior**:
  - Automatically invalidates the presented refresh token and replaces it with a new cryptographic hash in the database.
  - **Replay & Reuse Detection**: If an old or rotated token is presented, the server revokes **ALL** active sessions for that user to mitigate stolen token attacks.
- **Response `200 OK`**:
  - **Set-Cookie**: `jwt=<newRotatedRefreshToken>; HttpOnly; Secure`
  - **Body**:
    ```json
    {
      "success": true,
      "username": "Neo",
      "accessToken": "eyJhbGciOi..."
    }
    ```
- **Note**: `GET /api/auth/refresh` remains supported for backward compatibility.

#### `POST /api/auth/logout`
Terminates the user's active session in the database and clears the refresh cookie.

- **Authentication**: HttpOnly Cookie (`jwt`)
- **Response `200 OK`**:
  - **Set-Cookie**: `jwt=; Max-Age=0`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "User successfully logged out"
    }
    ```

#### `GET /api/auth/sessions`
Retrieves all active devices/sessions associated with the user.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "session-uuid",
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "127.0.0.1",
        "createdAt": "2026-09-21T10:00:00.000Z",
        "expiresAt": "2026-09-28T10:00:00.000Z"
      }
    ]
  }
  ```

#### `DELETE /api/auth/sessions/:id`
Remotely revokes a specific device session.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Session successfully revoked"
  }
  ```

---

### 3. User & Biometric Profile

#### `GET /api/user/profile`
Fetches the operative's profile along with active dietary constraints.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "user-uuid",
      "username": "Neo",
      "email": "operative@nectar.health",
      "constraint": {
        "id": "constraint-uuid",
        "planType": "CUTTING",
        "gender": "MALE",
        "unitSystem": "METRIC",
        "activityLevel": "MODERATE",
        "height": 180,
        "weight": 80,
        "age": 28,
        "preferences": "High protein, no peanuts"
      }
    }
  }
  ```

#### `PATCH /api/user/profile`
Updates biometrics, activity scaling, or dietary restrictions. Automatically re-evaluates clinical guardrails.

- **Authentication**: `Bearer <accessToken>`
- **Request Body** (all fields optional):
  ```json
  {
    "weight": 78.5,
    "height": 180,
    "age": 29,
    "activityLevel": "VERY_ACTIVE",
    "planType": "RECOMP",
    "preferences": "Vegetarian, high iron"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { ...updatedUserRecord... }
  }
  ```

---

### 4. Diet Protocol & Meal Swapping

#### `POST /api/diet/plan`
Generates a complete 5-meal personalized daily nutrition protocol using Gemini AI.

- **Authentication**: `Bearer <accessToken>`
- **Rate Limit**: 10 requests / 1 hour (`generateLimiter`)
- **Idempotency**: Strict daily lock (`@@unique([userId, date])`). Only 1 plan can be generated per calendar day (UTC midnight boundary).
- **Clinical Math**: Computes Mifflin-St Jeor BMR, applies Activity Multiplier (1.2–1.9), applies Goal Adjustment (-500 for CUTTING, +300 for BULKING), clamps to minimum 1200 kcal floor (1600 for teens), verifies against 9-category allergen taxonomy.
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "plan-uuid",
      "date": "2026-09-21T00:00:00.000Z",
      "totalCalories": 2150,
      "totalProtein": 160,
      "totalCarbs": 215,
      "totalFat": 72,
      "diets": [
        {
          "id": "meal-uuid-1",
          "mealType": "BREAKFAST",
          "meal": "Steel-Cut Oats with Berries & Whey",
          "portion": "1 bowl (250g)",
          "calories": 450,
          "protein": 35,
          "carb": 55,
          "fat": 10
        },
        ...
      ]
    }
  }
  ```

#### `GET /api/diet/latest`
Returns the user's most recent daily protocol.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns latest `DietPlan` object with embedded meals.

#### `GET /api/diet/history`
Returns historical diet protocols ordered by date descending.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns array of `DietPlan` objects.

#### `GET /api/diet/:id`
Retrieves a specific diet plan by UUID. Enforces owner authorization (prevents IDOR).

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**: Returns matching `DietPlan` object.

#### `GET /api/diet/explain`
Returns a transparent breakdown of the exact metabolic formulas used to calculate the user's protocol.

- **Authentication**: `Bearer <accessToken>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "bmr": 1780,
      "activityLevel": "MODERATE",
      "activityMultiplier": 1.55,
      "tdee": 2759,
      "goal": "CUTTING",
      "goalAdjustment": -500,
      "targetCalories": 2259,
      "macros": {
        "protein": { "grams": 170, "calories": 678, "percentage": 30 },
        "carbs": { "grams": 226, "calories": 904, "percentage": 40 },
        "fat": { "grams": 75, "calories": 678, "percentage": 30 }
      },
      "formula": "Mifflin-St Jeor"
    }
  }
  ```

#### `POST /api/diet/swap`
Swaps an individual meal suggestion without discarding or re-generating the entire day's plan.

- **Authentication**: `Bearer <accessToken>`
- **Rate Limit**: 20 requests / 1 hour (`swapLimiter`)
- **Request Body**:
  ```json
  {
    "dietId": "meal-uuid-1",
    "reason": "Missing ingredients / prefer a vegetarian alternative"
  }
  ```
- **Behavior**:
  - Prompts Gemini to generate a single culinary replacement targeted to the exact calories of the swapped meal ($\pm 10\%$).
  - Evaluates deterministic allergy scanner against the replacement.
  - Updates the meal record in-place.
  - Automatically recalculates parent `DietPlan` totals (`totalCalories`, `totalProtein`, `totalCarbs`, `totalFat`).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Meal successfully swapped",
    "data": { ...updatedDietPlan... }
  }
  ```

---

### 5. Tracking & Analytics

#### `POST /api/tracking/weight`
Logs a bodyweight weigh-in and automatically syncs the user's active constraint profile.

- **Authentication**: `Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "weight": 78.2,
    "date": "2026-09-21T07:30:00.000Z",
    "note": "Morning weigh-in, fasted"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Weight logged successfully",
    "data": {
      "id": "weight-entry-uuid",
      "weight": 78.2,
      "date": "2026-09-21T07:30:00.000Z",
      "note": "Morning weigh-in, fasted",
      "userId": "user-uuid"
    }
  }
  ```

#### `GET /api/tracking/weight/trend`
Computes 7-day Simple Moving Average (SMA) and rate of weekly weight change to filter out water weight noise.

- **Authentication**: `Bearer <accessToken>`
- **Query Params**: `days` (integer, default `60`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "currentWeight": 78.2,
      "latestMovingAverage": 78.6,
      "weeklyChangeKg": -0.4,
      "direction": "LOSING",
      "history": [
        {
          "id": "entry-1",
          "date": "2026-09-15T00:00:00.000Z",
          "weight": 79.1,
          "movingAverage7Day": 79.2,
          "note": null
        },
        ...
      ]
    }
  }
  ```
  `direction` is one of: `LOSING` ($< -0.2$ kg/wk), `GAINING` ($> +0.2$ kg/wk), `MAINTAINING`, or `INSUFFICIENT_DATA`.

#### `POST /api/tracking/meals`
Logs meal adherence (whether the user ate the prescribed meal or an off-plan alternative).

- **Authentication**: `Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "name": "Steel-Cut Oats with Berries & Whey",
    "mealType": "BREAKFAST",
    "calories": 450,
    "protein": 35,
    "carbs": 55,
    "fat": 10,
    "adhered": true,
    "dietPlanId": "plan-uuid"
  }
  ```
- **Response `201 Created`**: Returns logged `MealLog` entry.

#### `GET /api/tracking/meals`
Returns logged meals and aggregated macronutrient adherence totals for a specified date.

- **Authentication**: `Bearer <accessToken>`
- **Query Params**: `date` (ISO date string `YYYY-MM-DD`, defaults to today UTC)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-09-21",
      "totalCalories": 1850,
      "totalProtein": 140,
      "totalCarbs": 190,
      "totalFat": 62,
      "mealsLogged": 4,
      "adherenceRate": 100,
      "logs": [ ... ]
    }
  }
  ```

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
| `authLimiter` | 15 min | 30 req | `POST /api/auth/login`, `POST /api/user/signup` |
| `refreshLimiter` | 15 min | 60 req | `POST /api/auth/refresh`, `GET /api/auth/refresh` |
| `generateLimiter` | 60 min | 10 req | `POST /api/diet/plan` |
| `swapLimiter` | 60 min | 20 req | `POST /api/diet/swap` |

---

## 🧪 Verification & Quality Commands

All verification commands can be run from the repository root:

```bash
# Run complete test suite (56 tests across 12 suites in ~1.2s)
npm test

# Run TypeScript typechecks across all workspaces
npm run typecheck

# Run ESLint across client and server
npm run lint

# Build all packages (@nectar/types, server, client)
npm run build
```

---

## 📈 Performance Benchmarks

NECTAR maintains a strict performance regression harness located in `performance/`. The harness measures end-to-end throughput and latency percentiles under load using k6.

Baseline performance measurements on `GET /api/diet/latest` (Scenario S4, 320 RPS sustained):
- **p50 Latency**: `1.1 ms`
- **p95 Latency**: `1.9 ms`
- **p99 Latency**: `3.8 ms`
- **HTTP Error Rate**: `0.00%`

To learn more, inspect [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md) and [`docs/DEVELOPMENT_PLAN.md`](./docs/DEVELOPMENT_PLAN.md).

---

## 📄 License

ISC License © 2026 NECTAR Health Systems.
