// If you don't have dotenv installed, run: npm install dotenv
import 'dotenv/config'; 
import { geminiService } from './services/geminiService.js';
import { Gender, UnitSystem, PlanType } from '@prisma/client';

const dummyUser = {
    planType: PlanType.CUTTING,
    gender: Gender.MALE,
    weight: 85,
    height: 180,
    unitSystem: UnitSystem.METRIC,
    // FIX: Converted the array into a single descriptive string
    preferences: "High Protein, No Dairy", 
    age: 22
};

const runTest = async () => {
    console.log("Sending order to Chef Gemini... 👨‍🍳");
    
    try {
        const finalPlan = await geminiService.generateAIPDietPlan(dummyUser);
        
        console.log("\n--- FINAL PARSED JSON OBJECT ---");
        // We use JSON.stringify to print the object nicely in the terminal
        console.log(JSON.stringify(finalPlan, null, 2)); 
        
    } catch (error) {
        console.error("Test failed:", error);
    }
};

// Execute the function
runTest();