import {GoogleGenerativeAI} from "@google/generative-ai";
import { Gender,PlanType,UnitSystem } from "@prisma/client";


// const tempResponse = {
//   targetCalories: 1840,
//   totalProtein: 144,
//   totalCarbs: 129,
//   totalFats: 80,
//   meals: [
//     {
//       mealType: 'Breakfast',
//       foodName: 'Scrambled Eggs with Whole-Wheat Toast and Avocado',
//       portion: '3 large scrambled eggs, 1 slice whole-wheat toast, 1/4 medium avocado',
//       calories: 400,
//       protein: 23,
//       carbs: 21,
//       fat: 26
//     },
//     {
//       mealType: 'Morning Snack',
//       foodName: 'Apple with Peanut Butter',
//       portion: '1 medium apple, 1 tbsp natural peanut butter',
//       calories: 190,
//       protein: 4,
//       carbs: 28,
//       fat: 8
//     },
//     {
//       mealType: 'Lunch',
//       foodName: 'Large Chicken and Quinoa Salad',
//       portion: '150g grilled chicken breast, 1 cup mixed greens, 1/2 cup assorted chopped vegetables, 1/2 cup cooked quinoa, 3 tbsp light vinaigrette',
//       calories: 490,
//       protein: 52,
//       carbs: 36,
//       fat: 14
//     },
//     {
//       mealType: 'Afternoon Snack',
//       foodName: 'Low-Fat Cottage Cheese with Cucumber',
//       portion: '1 cup low-fat cottage cheese, 1/2 medium cucumber (sliced)',
//       calories: 170,
//       protein: 28,
//       carbs: 8,
//       fat: 2
//     },
//     {
//       mealType: 'Dinner',
//       foodName: 'Baked Salmon with Roasted Sweet Potato and Asparagus',
//       portion: '140g baked salmon fillet, 1 medium roasted sweet potato, 1 cup roasted asparagus, 1 tbsp olive oil',
//       calories: 570,
//       protein: 37,
//       carbs: 36,
//       fat: 30
//     }
//   ]
// };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY||"");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.85,
    responseMimeType: "application/json",
  }
});

interface DietPlanReq {
  weight: number;
  height: number;
  age: number;
  preferences: string[];
  gender: Gender
  planType: PlanType; 
  unitSystem: UnitSystem; 
}

class GeminiService {
  async generateAIPDietPlan({ weight, height, age, preferences, gender, planType, unitSystem }: DietPlanReq) {
    try {
      if (!weight || !height || !age || !gender || !planType || !unitSystem || !preferences) {
        throw new Error("All fields are required.");
      }

      // Mifflin-St Jeor equation
      const BMR= {
        MALE: {
          METRIC: 10 * weight + 6.25 * height - 5 * age + 5,
          IMPERIAL: 4.536 * weight + 15.875 * height - 5 * age + 5
        },
        FEMALE: {
          METRIC: 10 * weight + 6.25 * height - 5 * age - 161,
          IMPERIAL: 4.536 * weight + 15.875 * height - 5 * age - 161
        }
      };

      const GOAL_MODIFIER = {
        CUTTING: -500,
        BULKING: 300,
        RECOMP: 0
      };

      const baseBMR = BMR[gender][unitSystem];
      const activityMultiplier = 1.2;
      const planAdjustments = GOAL_MODIFIER[planType];

      const targetCalories = Math.round(baseBMR * activityMultiplier + planAdjustments);

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
      Generate a 1-day personalized diet plan for today.
      
      USER PROFILE:
      - Goal: ${targetCalories} calories
      - Gender: ${gender}
      - Weight: ${weight} ${unitSystem}
      - Height: ${height} ${unitSystem === 'METRIC' ? 'cm' : 'in'}
      - Preferences/Allergies: ${preferences}
      
      REQUIREMENTS:
      1. Provide exactly 5 meals: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner.
      2. TODAY'S CREATIVE CONSTRAINT: ${dailyConstraint}
      
      EXPECTED JSON SCHEMA:
      {
        "targetCalories": 2500,
        "totalProtein": 120,
        "totalCarbs": 150,
        "totalFats": 80,
        "meals": [
          {
            "mealType": "Breakfast",
            "foodName": "Oatmeal with Berries",
            "portion": "1 cup",
            "calories": 350,
            "protein": 15,
            "carbs": 20,
            "fat": 20
          }
        ]
      }
      `;

      const result = await model.generateContent(prompt);
      if (!result) throw new Error("Error while getting response from Gemini AI.");
      
      const response = result.response;
      
      const jsonResponse = JSON.parse(response.text());

      return jsonResponse;
    } catch (e) {
      console.log("Error in geminiService layer ", e);
      throw e; 
    }
  }
}

export const geminiService = new GeminiService();