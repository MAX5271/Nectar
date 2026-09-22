import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import prisma from "../../src/utils/db.js";
import { REFRESH_COOKIE } from "../../src/utils/cookie.js";

const extractCookie = (res: any, name: string): string | undefined => {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return undefined;
  const cookieArr = Array.isArray(cookies) ? cookies : [cookies];
  for (const c of cookieArr) {
    const match = c.match(new RegExp(`^${name}=([^;]+)`));
    if (match) return match[1];
  }
  return undefined;
};

describe("Complete End-to-End User Flow Test", () => {
  const testUser = {
    email: `flow-${Date.now()}@nectar.health`,
    username: "FlowOperative",
    password: "StrongSecurePassword123!",
    age: 26,
    gender: "MALE" as const,
    height: 182,
    weight: 84,
    planType: "CUTTING" as const,
    unitSystem: "METRIC" as const,
    activityLevel: "MODERATE" as const,
    preferences: "High protein, no peanuts",
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  let planId: string;
  let firstMealId: string;
  let sessionId: string;

  const cleanupUser = async (email?: string, id?: string) => {
    try {
      const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
      const targetId = id || user?.id;
      if (targetId) {
        await prisma.mealLog.deleteMany({ where: { userId: targetId } });
        await prisma.weightEntry.deleteMany({ where: { userId: targetId } });
        await prisma.session.deleteMany({ where: { userId: targetId } });
        await prisma.diet.deleteMany({ where: { dietPlan: { userId: targetId } } });
        await prisma.dietPlan.deleteMany({ where: { userId: targetId } });
        await prisma.dietaryConstraint.deleteMany({ where: { userId: targetId } });
        await prisma.user.deleteMany({ where: { id: targetId } });
      }
    } catch {
      // ignore cleanup errors on missing tables/records
    }
  };

  beforeAll(async () => {
    await cleanupUser(testUser.email);
  });

  afterAll(async () => {
    await cleanupUser(undefined, userId);
  });

  it("Step 1: User signs up with biometrics and dietary constraints", async () => {
    const res = await request(app)
      .post("/api/user/signup")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    userId = res.body.data.id;
    refreshToken = extractCookie(res, REFRESH_COOKIE)!;

    expect(refreshToken).toBeDefined();
  });

  it("Step 2: User logs in and receives access token and secure HttpOnly cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = extractCookie(res, REFRESH_COOKIE)!;
    expect(refreshToken).toBeDefined();
  });

  it("Step 3: User retrieves their profile with populated dietary constraints", async () => {
    const res = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.constraint).toBeDefined();
    expect(res.body.data.constraint.weight).toBe(84);
    expect(res.body.data.constraint.activityLevel).toBe("MODERATE");
  });

  it("Step 4: User updates profile biometrics and activity level (PATCH /user/profile)", async () => {
    const res = await request(app)
      .patch("/api/user/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        weight: 83.5,
        activityLevel: "VERY_ACTIVE",
        preferences: "High protein, no peanuts, gluten-free",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.constraint.weight).toBe(83.5);
    expect(res.body.data.constraint.activityLevel).toBe("VERY_ACTIVE");
  });

  it("Step 5: User explains metabolic calculations (GET /diet/explain)", async () => {
    const res = await request(app)
      .get("/api/diet/explain")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bmr).toBeGreaterThan(1500);
    expect(res.body.data.activityMultiplier).toBe(1.725); // VERY_ACTIVE
    expect(res.body.data.macroSplit).toBeDefined();
    expect(res.body.data.macroSplit.proteinPct).toBe(30);
  });

  it("Step 6: User generates a daily diet protocol (POST /diet/plan)", async () => {
    const res = await request(app)
      .post("/api/diet/plan")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.diets).toBeDefined();
    expect(res.body.data.diets.length).toBe(5);

    planId = res.body.data.id;
    firstMealId = res.body.data.diets[0].id;
  });

  it("Step 7: Daily lock prevents duplicate plan generation on the same day (Idempotency 409)", async () => {
    const res = await request(app)
      .post("/api/diet/plan")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already generated a plan today/i);
  });

  it("Step 8: User fetches latest plan and verifies protocol details (GET /diet/latest)", async () => {
    const res = await request(app)
      .get("/api/diet/latest")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(planId);
  });

  it("Step 9: User swaps a single meal with a dietary reason (POST /diet/swap)", async () => {
    const res = await request(app)
      .post("/api/diet/swap")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        dietId: firstMealId,
        reason: "Prefer a lighter vegetarian meal",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan.id).toBe(planId);
    expect(res.body.data.meal).toBeDefined();
    expect(res.body.data.meal.meal).toMatch(/Mediterranean Stir-fry|Stir-fry|Salad|Wrap/i);
  });

  it("Step 10: User logs bodyweight and verifies profile sync (POST /tracking/weight)", async () => {
    const res = await request(app)
      .post("/api/tracking/weight")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        weight: 83.2,
        note: "Fast weigh-in after morning cardio",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.weight).toBe(83.2);

    // Verify profile constraint was synced
    const profileRes = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(profileRes.body.data.constraint.weight).toBe(83.2);
  });

  it("Step 11: User inspects 7-day moving average weight trend (GET /tracking/weight/trend)", async () => {
    const res = await request(app)
      .get("/api/tracking/weight/trend")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.history.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.currentWeight).toBe(83.2);
  });

  it("Step 12: User logs meal adherence (POST /tracking/meals)", async () => {
    const res = await request(app)
      .post("/api/tracking/meals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Mediterranean Stir-fry",
        mealType: "BREAKFAST",
        calories: 450,
        protein: 35,
        carbs: 45,
        fat: 12,
        adhered: true,
        dietPlanId: planId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.adhered).toBe(true);
  });

  it("Step 13: User checks daily adherence summary (GET /tracking/meals)", async () => {
    const res = await request(app)
      .get("/api/tracking/meals")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalLoggedMeals).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totals.calories).toBeGreaterThanOrEqual(450);
  });

  it("Step 14: User inspects active multi-device sessions (GET /auth/sessions)", async () => {
    const res = await request(app)
      .get("/api/auth/sessions")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    sessionId = res.body.data[0].id;
  });

  it("Step 15: User rotates token via silent refresh (POST /auth/refresh with anti-CSRF header)", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE}=${refreshToken}`)
      .set("X-Requested-With", "XMLHttpRequest");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();

    accessToken = res.body.accessToken;
    refreshToken = extractCookie(res, REFRESH_COOKIE)!;
    expect(refreshToken).toBeDefined();
  });

  it("Step 16: User logs out and session is terminated (POST /auth/logout)", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${REFRESH_COOKIE}=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Refreshing with logged-out cookie must be rejected (401)
    const refreshAfterLogout = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE}=${refreshToken}`)
      .set("X-Requested-With", "XMLHttpRequest");

    expect(refreshAfterLogout.status).toBe(401);
  });
});
