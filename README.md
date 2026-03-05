# 🍯 NECTAR Backend

NECTAR is a personalized, AI-driven diet planner application. This repository houses the Node.js/TypeScript backend, which handles precise server-side metabolic calculations and interfaces with Google's Gemini AI to generate customized daily meal plans.

## 🚀 Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript
* **Database ORM:** Prisma
* **Database:** PostgreSQL (via Supabase)
* **AI Integration:** Google Generative AI (`gemini-2.5-flash`)

## ✨ Core Features Accomplished

* **Robust Data Modeling:** Strict database schemas using Prisma, including `User` and `DietaryConstraint` models with custom enums (`PlanType`, `Gender`, `UnitSystem`).
* **Scientifically Accurate Math:** Server-side implementation of the Mifflin-St Jeor BMR formula for both metric and imperial units.
* **O/C Principle Adherence:** Extensible dictionary objects for BMR calculations and Goal Modifiers (Cutting, Bulking, Recomp), completely avoiding brittle `if/else` chains.
* **AI Chef Integration:** A highly structured prompting system that commands the Gemini AI model to generate strictly formatted JSON diet plans containing precise macro (Protein, Carbs, Fats) and calorie targets.
* **Type Safety:** Strict TypeScript interfaces (e.g., `DietPlanReq`) ensuring predictable data flow from the database to the AI service.
* **Jwt Authentication:** Secure user authentication with JWTs, including refresh token management for seamless user sessions.

## 🛠️ Local Setup

### 1. Install Dependencies
```bash
npm install

```

### 2. Environment Variables

Create a `.env` file in the root of the `server` directory:

```env
DATABASE_URL="your_supabase_postgresql_connection_string"
GEMINI_API_KEY="your_google_ai_studio_api_key"
REFRESH_TOKEN_SECRET="your_secure_random_string_for_jwt_refresh_tokens"
ACCESS_TOKEN_SECRET="your_secure_random_string_for_jwt_access_tokens"

```

### 3. Database Sync

Apply the Prisma schema to your Supabase database and generate the strict TypeScript client:

```bash
npx prisma migrate dev
npx prisma generate

```

### 4. Running the Test Script

Test the AI generation and BMR calculations directly from the terminal, bypassing the API routes:

```bash
npx tsx --env-file=.env src/test.ts

```