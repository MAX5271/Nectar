import { GoogleGenerativeAI } from "@google/generative-ai";
import { Gender, PlanType, UnitSystem } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  generationConfig: {
    temperature: 0.3,
    responseMimeType: "application/json",
  }
});

interface DietPlanReq {
  weight: number;
  height: number;
  age: number;
  preferences: string;
  gender: Gender;
  planType: PlanType; 
  unitSystem: UnitSystem; 
}

class GeminiService {
  async generateAIPDietPlan({ weight, height, age, preferences, gender, planType, unitSystem }: DietPlanReq) {
    try {
      if (!weight || !height || !age || !gender || !planType || !unitSystem || !preferences) {
        throw new Error("All fields are required.");
      }

      // Calculation logic based on Mifflin-St Jeor
      const isMetric = unitSystem === 'METRIC';
      
      const BMR_CALC = {
        MALE: isMetric 
          ? (10 * weight + 6.25 * height - 5 * age + 5)
          : (4.536 * weight + 15.875 * height - 5 * age + 5),
        FEMALE: isMetric
          ? (10 * weight + 6.25 * height - 5 * age - 161)
          : (4.536 * weight + 15.875 * height - 5 * age - 161)
      };

      const GOAL_MODIFIER = {
        CUTTING: -500,
        BULKING: 300,
        RECOMP: 0
      };

      const baseBMR = BMR_CALC[gender];
      const activityMultiplier = 1.2;
      const targetCalories = Math.round(baseBMR * activityMultiplier + GOAL_MODIFIER[planType]);

      const creativeConstraints = [
        "Focus on high-volume, low-calorie-dense foods that keep you full.",
        "Requires minimal cooking equipment (microwave and kettle friendly recipes).",
        "Incorporate bold, savory spices like cumin, paprika, or chili.",
        "Make the meals quick to prepare, ideally under 10 minutes each.",
        "Incorporate a Mediterranean flavor profile with olive oil and herbs.",
        "Focus on purely no-cook or cold meals like wraps, salads, and overnight oats."
      ];
      
      const dailyConstraint = creativeConstraints[Math.floor(Math.random() * creativeConstraints.length)];

      const prompt = `
      You are an expert nutritionist AI for the app NECTAR.
      Generate a 1-day personalized diet plan.
      
      USER STATS:
      - Target: ${targetCalories} calories
      - Preferences/Allergies: ${preferences}
      
      CRITICAL INSTRUCTIONS:
      1. If the preferences mention 'Vegan', you MUST NOT include any animal products (No meat, dairy, eggs, honey, or fish).
      2. Strictly adhere to all dietary restrictions found in the preferences: "${preferences}".
      3. TODAY'S STYLE CONSTRAINT: ${dailyConstraint}
      4. Provide exactly 5 meals.
      
      JSON OUTPUT FORMAT:
      {
        "targetCalories": ${targetCalories},
        "totalProtein": number,
        "totalCarbs": number,
        "totalFats": number,
        "meals": [
          {
            "mealType": "Breakfast",
            "foodName": "string",
            "portion": "string",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        ]
      }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);

    } catch (e) {
      console.error("Error in geminiService layer:", e);
      throw e; 
    }
  }
}

export const geminiService = new GeminiService();