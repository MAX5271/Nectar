import { Gender, PlanType, UnitSystem } from "@prisma/client";
interface DietPlanReq {
    weight: number;
    height: number;
    age: number;
    preferences: string[];
    gender: Gender;
    planType: PlanType;
    unitSystem: UnitSystem;
}
declare class GeminiService {
    generateAIPDietPlan({ weight, height, age, preferences, gender, planType, unitSystem }: DietPlanReq): Promise<any>;
}
export declare const geminiService: GeminiService;
export {};
//# sourceMappingURL=geminiService.d.ts.map