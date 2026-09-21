import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import prisma from "../../src/utils/db.js";

describe("Tier 1 Product Features Integration Tests", () => {
  const testUser = {
    email: `tier1_${Date.now()}@example.com`,
    password: "Password123!",
    username: "ProductTester",
    age: 26,
    height: 180,
    weight: 80,
    gender: "MALE",
    planType: "CUTTING",
    unitSystem: "METRIC",
    preferences: "None",
  };

  let token: string;
  let userId: string;

  it("registers a user and logs in to get Bearer access token", async () => {
    const signupRes = await request(app)
      .post("/api/user/signup")
      .send(testUser);

    expect(signupRes.status).toBe(201);
    token = signupRes.body.data.accessToken;
    userId = signupRes.body.data.id;
    expect(token).toBeDefined();
  });

  it("updates user profile with PATCH /api/user/profile", async () => {
    const updateRes = await request(app)
      .patch("/api/user/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        weight: 78.5,
        activityLevel: "VERY_ACTIVE",
        preferences: "High protein, no shellfish",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.constraint.weight).toBe(78.5);
    expect(updateRes.body.data.constraint.activityLevel).toBe("VERY_ACTIVE");
    expect(updateRes.body.data.constraint.preferences).toMatch(/no shellfish/i);
  });

  it("provides plan explanation breakdown via GET /api/diet/explain", async () => {
    const explainRes = await request(app)
      .get("/api/diet/explain")
      .set("Authorization", `Bearer ${token}`);

    expect(explainRes.status).toBe(200);
    expect(explainRes.body.success).toBe(true);
    expect(explainRes.body.data.bmr).toBeGreaterThan(1000);
    expect(explainRes.body.data.activityMultiplier).toBe(1.725); // VERY_ACTIVE
    expect(explainRes.body.data.tdee).toBeGreaterThan(explainRes.body.data.bmr);
    expect(explainRes.body.data.macroSplit).toBeDefined();
  });

  it("logs bodyweight and computes moving average trend", async () => {
    // Log several weigh-ins
    await request(app)
      .post("/api/tracking/weight")
      .set("Authorization", `Bearer ${token}`)
      .send({ weight: 79.5, note: "Day 1" });

    await request(app)
      .post("/api/tracking/weight")
      .set("Authorization", `Bearer ${token}`)
      .send({ weight: 79.0, note: "Day 2" });

    const logRes = await request(app)
      .post("/api/tracking/weight")
      .set("Authorization", `Bearer ${token}`)
      .send({ weight: 78.5, note: "Day 3" });

    expect(logRes.status).toBe(201);
    expect(logRes.body.success).toBe(true);
    expect(logRes.body.data.weight).toBe(78.5);

    // Fetch trend
    const trendRes = await request(app)
      .get("/api/tracking/weight/trend")
      .set("Authorization", `Bearer ${token}`);

    expect(trendRes.status).toBe(200);
    expect(trendRes.body.success).toBe(true);
    expect(trendRes.body.data.history.length).toBeGreaterThanOrEqual(3);
    expect(trendRes.body.data.currentWeight).toBe(78.5);
    expect(trendRes.body.data.latestMovingAverage).toBeDefined();
  });

  it("logs meal adherence and computes daily totals", async () => {
    const mealRes = await request(app)
      .post("/api/tracking/meals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Grilled Chicken & Brown Rice",
        mealType: "LUNCH",
        calories: 550,
        protein: 45,
        carbs: 60,
        fat: 12,
        adhered: true,
      });

    expect(mealRes.status).toBe(201);
    expect(mealRes.body.success).toBe(true);
    expect(mealRes.body.data.name).toBe("Grilled Chicken & Brown Rice");

    const summaryRes = await request(app)
      .get("/api/tracking/meals")
      .set("Authorization", `Bearer ${token}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.success).toBe(true);
    expect(summaryRes.body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(summaryRes.body.data.totals.calories).toBeGreaterThanOrEqual(550);
    expect(summaryRes.body.data.summary.adherenceRatePercent).toBe(100);
  });

  it("swaps a single meal without discarding the daily plan", async () => {
    const plan = await prisma.dietPlan.create({
      data: {
        userId,
        date: new Date("2026-09-20T00:00:00.000Z"),
        totalCalories: 1500,
        totalProtein: 120,
        totalCarbs: 150,
        totalFat: 50,
        diets: {
          create: [
            {
              mealType: "LUNCH",
              meal: "Boring Boiled Chicken",
              portion: "200g",
              calories: 400,
              protein: 40,
              carb: 10,
              fat: 5,
            },
            {
              mealType: "DINNER",
              meal: "Salmon Salad",
              portion: "250g",
              calories: 500,
              protein: 35,
              carb: 20,
              fat: 15,
            },
          ],
        },
      },
      include: { diets: true },
    });

    const targetMeal = plan.diets[0];
    const swapRes = await request(app)
      .post("/api/diet/swap")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dietId: targetMeal.id,
        reason: "Don't like boiled chicken, want vegetarian",
      });

    expect(swapRes.status).toBe(200);
    expect(swapRes.body.success).toBe(true);
    expect(swapRes.body.data.meal.id).toBe(targetMeal.id);
    expect(swapRes.body.data.meal.meal).not.toBe("Boring Boiled Chicken");
    expect(swapRes.body.data.plan.diets.length).toBe(2);
  });
});

