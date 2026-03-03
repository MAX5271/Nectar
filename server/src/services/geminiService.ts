import {GoogleGenerativeAI} from "@google/generative-ai";
import { Gender,PlanType,UnitSystem } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY||"");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface DietPlanReq {
  weight: number
  height: number
  age: number
  preferences: string[]
  gender: Gender
  planType: PlanType
  unitSystem: UnitSystem
}

export const generateAIPDietPlan = async ({weight,height,age,preferences,gender,planType,unitSystem}:DietPlanReq) => {

    const prefsString = preferences && preferences.length > 0? preferences.join(","):"None";

    //Mifflin-St Jeor equation
    const BMR = {
        MALE: {
            METRIC: 10*weight + 6.25*height - 5*age +5,
            IMPERIAL: 4.536*weight + 15.875*height - 5*age +5
        },
        FEMALE: {
          METRIC: 10*weight + 6.25*height - 5*age - 161,
            IMPERIAL: 4.536*weight + 15.875*height - 5*age - 161
        }
    } 

    const GOAL_MODIFIER = {
      CUTTING: -500,
      BULKING: 300,
      RECOMP: 0
    }

    const baseBMR = BMR[gender][unitSystem];
    const activityMultiplier = 1.2;
    const planAdjustments = GOAL_MODIFIER[planType];

    const targetCalories = baseBMR*activityMultiplier + planAdjustments;

    console.log(targetCalories);

    const prompt = `
        You are an expert nutritionist AI for the app NECTAR.
        Generate a 1-day personalized diet plan for today.

        USER PROFILE:
        - Goal: ${targetCalories} calories
        - Gender: ${gender}
        - Weight: ${weight} ${unitSystem}
        - Height: ${height} ${unitSystem === 'METRIC' ? 'cm' : 'in'}
        - Preferences/Allergies: ${prefsString}

        REQUIREMENTS:
        1. Calculate approximate daily calorie needs.
        2. Provide exactly 5 meals: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner.
        3. You MUST respond ONLY with raw, valid JSON. Do not include markdown formatting like \`\`\`json. Do not include any conversational text.

        EXPECTED JSON SCHEMA:
        {
          "targetCalories": 2500,
          "meals": [
            {
              "mealType": "Breakfast",
              "foodName": "Oatmeal with Berries",
              "portion": "1 cup",
              "calories": 350,
              "protein": 15g,
              "carbs": 20g,
              "fat": 20g
            }
          ]
        }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonResponse = await JSON.parse(response.text());

    return jsonResponse;
}

