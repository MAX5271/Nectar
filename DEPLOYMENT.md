# 🚀 Nectar — Deployment & Cloud Configuration Guide

This guide provides the complete, production-ready configuration for deploying Nectar's monorepo across **Vercel** (Frontend), **Render** (Backend API), and **Google Cloud Console** (OAuth 2.0).

---

## 📑 Table of Contents
1. [Monorepo Architecture Context](#1-monorepo-architecture-context)
2. [Google Cloud Console (OAuth 2.0 Setup)](#2-google-cloud-console-oauth-20-setup)
3. [Frontend Deployment (Vercel)](#3-frontend-deployment-vercel)
4. [Backend Deployment (Render)](#4-backend-deployment-render)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Pre-Flight Verification Checklist](#6-pre-flight-verification-checklist)

---

## 1. Monorepo Architecture Context

NECTAR is structured as an **npm workspaces** monorepo:
* `packages/types`: Shared TypeScript definitions (`@nectar/types`).
* `client`: Vite + React 19 frontend application.
* `server`: Express 5 + Prisma + PostgreSQL backend API.

Because both `client` and `server` depend on `@nectar/types`:
- Build steps must step out to the monorepo root (`cd ..`) so npm workspaces can link dependencies.
- `@nectar/types` must be built (`npm run build:types`) before either frontend or backend compiles.

---

## 2. Google Cloud Console (OAuth 2.0 Setup)

### Step A: Configure the OAuth Consent Screen
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in:
   - **App name**: `Nectar`
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
4. Click **Save and Continue**.
5. **Scopes**: Add the standard identity scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. **Test Users** *(Crucial while app publishing status is "Testing")*:
   - Click **Add Users** and enter any Gmail accounts you will use for testing.

### Step B: Create Web OAuth Client Credentials
1. Go to **APIs & Services** → **Credentials**.
2. Click **+ Create Credentials** → select **OAuth client ID**.
3. **Application type**: `Web application`.
4. **Name**: `Nectar Web Client`.
5. **Authorized JavaScript origins**:
   ```text
   http://localhost:5173
   https://nectar-tau.vercel.app
   ```
6. **Authorized redirect URIs**:
   ```text
   http://localhost:5173
   http://localhost:5173/auth/callback
   https://nectar-tau.vercel.app
   https://nectar-tau.vercel.app/auth/callback
   ```
7. Click **Create** and copy your **Client ID** (`<id>.apps.googleusercontent.com`) and **Client Secret**.

---

## 3. Frontend Deployment (Vercel)

### Root Directory
* **Root Directory**: `client`
* **Include files outside the root directory in the Build Step**: **Enabled (ON)**  
  *(Essential: allows Vercel to access `packages/types` and root workspace configuration)*
* **Skip deployments...**: `Disabled`

### Framework & Build Settings
* **Framework Preset**: `Vite`
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

### SPA Client Routing
Ensure [`client/vercel.json`](file:///home/max/Study/Programs/Projects/Nectar/client/vercel.json) contains the route rewrite so client-side routing works on refresh:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### Environment Variables (Vercel Project Settings)
Add these in **Settings** → **Environment Variables**:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Deployed backend API endpoint | `https://your-backend-app.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxxx.apps.googleusercontent.com` |

---

## 4. Backend Deployment (Render)

Create a new **Web Service** on Render connected to your repository (`MAX5271/Nectar`):

### Service Settings
* **Branch**: `main`
* **Root Directory**: `server`
* **Runtime**: `Node`
* **Build Command**:
  ```bash
  cd .. && npm install && npm run build:types && cd server && npx prisma generate && npm run build
  ```
* **Start Command**:
  ```bash
  npm start
  ```
  *(Or `npx prisma migrate deploy && npm start` to automatically run migrations on boot)*

### Build Filters (Auto-Deploy)
Under **Build Filters** → **Included Paths**, add:
* `server/**`
* `packages/**`

*(This guarantees that modifications to server logic OR shared types automatically trigger a redeploy).*

### Environment Variables (Render Dashboard)
Add these in the **Environment** tab:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (enables secure cookies and trust proxy) | `production` |
| `PORT` | Listening port (Render sets this dynamically or defaults to 5000) | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/nectar` |
| `CLIENT_URL` | **Frontend URL for CORS & Cookie authentication** | `https://nectar-tau.vercel.app` |
| `ACCESS_TOKEN_SECRET` | Cryptographic secret for access tokens ($\ge 32$ chars) | `(random 32+ character string)` |
| `REFRESH_TOKEN_SECRET` | Cryptographic secret for refresh tokens ($\ge 32$ chars) | `(random 32+ character string)` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for token validation | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret (optional) | `GOCSPX-...` |

---

## 5. Environment Variables Reference

### Clean Local Environment Setup

#### `client/.env`
```env
VITE_API_URL="http://localhost:5000/api"
VITE_GOOGLE_CLIENT_ID="<your-google-client-id>.apps.googleusercontent.com"
```

#### `server/.env`
```env
# Runtime
NODE_ENV="development"
PORT=5000
CLIENT_URL="http://localhost:5173"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nectar"

# Google Gemini AI
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GEMINI_MODE="live"

# JWT Authentication Secrets
ACCESS_TOKEN_SECRET="at-least-32-character-random-secret-key"
REFRESH_TOKEN_SECRET="at-least-32-character-random-secret-key"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="<your-google-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Rate Limiting
RATE_LIMIT_DISABLED=false
SWAP_LIMIT_PER_HOUR=20
REFRESH_LIMIT_PER_15M=60
```

> [!IMPORTANT]
> **Supabase variables are no longer used.** You can safely delete `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from all local and deployed `.env` files.

---

## 6. Pre-Flight Verification Checklist

Run these commands locally from the repository root to verify that your build, types, and tests pass before triggering cloud deployments:

```bash
# 1. Typecheck the entire monorepo
npm run typecheck

# 2. Run client unit and component tests
npm --workspace=Nectar test

# 3. Run server unit and integration tests
npm --workspace=server run test tests/unit/ tests/integration/googleAuthIntegration.test.ts

# 4. Verify complete client production build
npm run build:types && npm run build:client
```
