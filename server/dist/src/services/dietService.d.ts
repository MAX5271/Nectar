declare class DietService {
    dietPlan(userId: string): Promise<{
        date: Date;
        totalCalories: any;
        totalProtein: any;
        totalFat: any;
        totalCarbs: any;
        userId: string;
        diets: {
            create: {
                type: string;
                meal: string;
                portion: string;
                calories: number;
                protein: number;
                carb: number;
                fat: number;
                date: Date;
            }[];
        };
    }>;
    getDietPlanById(planId: string): Promise<({
        diets: {
            id: string;
            portion: string;
            calories: number;
            protein: number;
            fat: number;
            date: Date;
            type: string;
            meal: string;
            carb: number;
            dietPlanId: string;
        }[];
    } & {
        id: string;
        userId: string;
        date: Date;
        totalCalories: number;
        totalProtein: number;
        totalFat: number;
        totalCarbs: number;
    }) | null>;
    dietResponse(userId: string): Promise<{
        id: string;
        userId: string;
        date: Date;
        totalCalories: number;
        totalProtein: number;
        totalFat: number;
        totalCarbs: number;
    }>;
    getLatestDietPlan(userId: string): Promise<({
        diets: {
            id: string;
            portion: string;
            calories: number;
            protein: number;
            fat: number;
            date: Date;
            type: string;
            meal: string;
            carb: number;
            dietPlanId: string;
        }[];
    } & {
        id: string;
        userId: string;
        date: Date;
        totalCalories: number;
        totalProtein: number;
        totalFat: number;
        totalCarbs: number;
    }) | null>;
    getDietPlanHistory(userId: string): Promise<({
        diets: {
            id: string;
            portion: string;
            calories: number;
            protein: number;
            fat: number;
            date: Date;
            type: string;
            meal: string;
            carb: number;
            dietPlanId: string;
        }[];
    } & {
        id: string;
        userId: string;
        date: Date;
        totalCalories: number;
        totalProtein: number;
        totalFat: number;
        totalCarbs: number;
    })[]>;
}
export declare const dietService: DietService;
export {};
//# sourceMappingURL=dietService.d.ts.map