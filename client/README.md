# 🍯 Nectar Client — Identity-First Frontend

The frontend for **NECTAR** is a responsive React 19 application built with Vite, TypeScript, Tailwind CSS v4, Framer Motion, and Redux Toolkit.

It implements the **Nectar Design Language**:
> **Editorial food journal × precision nutrition cockpit × calm personal software**  
> *"The user's food plan is the main character. Everything else is instrumentation."*

---

## 🏛️ Directory Structure

```text
client/src/
├── components/
│   ├── nectar/              # Atomic Nectar Identity primitives
│   │   ├── NectarDroplet.tsx       # Teardrop glyph (hollow, filled, active, pulse)
│   │   ├── NectarLine.tsx          # Physical rail connecting timeline & trajectory
│   │   ├── NectarMark.tsx          # Signature brand mark with Fraunces logotype
│   │   └── NectarGenerationModal.tsx # Droplet synthesis generative motion sequence
│   ├── layout/              # Application shells & responsive navigation
│   │   ├── AppSidebar.tsx          # Desktop pinned rail (248px/72px) & mobile drawer
│   │   ├── AppTopBar.tsx           # Context bar (date, streak droplet, target calories)
│   │   ├── MobileBottomNav.tsx     # Pinned bottom navigation on mobile
│   │   ├── AuthenticatedLayout.tsx # 12-column responsive layout container
│   │   └── PublicLayout.tsx        # Lightweight editorial marketing shell
│   ├── dashboard/           # "Today" Cockpit components
│   │   ├── DashboardHero.tsx       # Time-aware greeting & baseline summary
│   │   ├── MealTimeline.tsx        # Chronological protocol with Nectar Line threading
│   │   ├── MealCard.tsx            # Protagonist meal card with macro pills & swap trigger
│   │   ├── DailyBalance.tsx        # Calorie centerpiece & horizontal macro balance bars
│   │   ├── WeightSnapshot.tsx      # Latest weight, 7-day delta, sparkline, and quick log
│   │   └── GuestClaim.tsx          # Prompt for anonymous guest travelers to save account
│   ├── progress/            # Trajectory & Cadence components
│   │   ├── TrajectoryChart.tsx     # Weight trajectory with 7D/30D/90D time horizon filters
│   │   ├── AdherenceCalendar.tsx   # 28-day cadence matrix with droplet completion states
│   │   └── NutritionConsistency.tsx# Precision macro compliance indicators
│   ├── ui/                  # Design system primitives (NectarBadge, NectarProgress, NectarStat, NectarButton)
│   └── charts/              # Recharts trend visualizations (CaloriesTrend, MacroMixTrend)
├── pages/
│   ├── auth/                # LoginPage, Register, ForgotPassword, GuestOnboarding, AuthCallback
│   └── ui/                  # HomePage, Dashboard (Today), Progress, Meals, Profile, Security, About
├── services/                # Axios client, auth flow helpers, Supabase client
└── store/                   # Redux Toolkit store (authSlice, dietSlice)
```

---

## 🎨 Three-Tier Typography Stack

| Tier | Typeface | Variable | Usage |
|:---|:---|:---|:---|
| **Display** | **Fraunces** | `--font-display` | Editorial statements, time-aware greetings, meal titles |
| **Interface** | **DM Sans** | `--font-sans` | Navigation labels, buttons, controls, dialogs |
| **Data Layer** | **IBM Plex Mono** | `--font-mono` | Macros (`P 32g  C 54g  F 18g`), calories, percentages, timestamps |

---

## 🧭 Canonical Routing Model

- **Canonical `/` Invariant**:
  - Visiting `/` when **unauthenticated** renders `HomePage` with the macro plate and 1-click guest trial.
  - Visiting `/` when **authenticated** triggers a zero-flash client redirect directly to `/dashboard` (*"Today"*).
- **Workspace Navigation**:
  - Primary screens: **Today** (`/dashboard`), **Progress** (`/progress`), **Meals** (`/meals`), **Your System** (`/profile`), **Security** (`/security`).

---

## 🧪 Testing & Verification

```bash
# Run unit & component tests with Vitest (30 tests)
npm test

# Run TypeScript typechecks & build Vite bundle
npm run build

# Run ESLint checks
npm run lint

# Start Vite dev server on http://localhost:5173
npm run dev
```
