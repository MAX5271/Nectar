interface dietFormat {
    mealType: string;
    foodName: string;
    portion: string;
    calories: Number;
    protein: Number;
    carbs: Number;
    fat: Number;
}
declare class DietHelper {
    dietFormater({ mealType, foodName, portion, calories, protein, carbs, fat, }: dietFormat): {
        type: string;
        meal: string;
        portion: string;
        calories: number;
        protein: number;
        carb: number;
        fat: number;
        date: Date;
    };
    dateFormat(date: Date): string;
    dateFormatPrisma(date: string): Date;
}
export declare const dietHelper: DietHelper;
export {};
//# sourceMappingURL=dietHelper.d.ts.map