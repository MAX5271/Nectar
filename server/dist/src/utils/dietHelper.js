class DietHelper {
    dietFormater({ mealType, foodName, portion, calories, protein, carbs, fat, }) {
        const result = {
            type: mealType,
            meal: foodName,
            portion,
            calories: Math.round(calories),
            protein: Math.round(protein),
            carb: Math.round(carbs),
            fat: Math.round(fat),
            date: this.dateFormatPrisma(this.dateFormat(new Date())),
        };
        return result;
    }
    dateFormat(date) {
        const formattedDate = date.toLocaleDateString("en-GB");
        return formattedDate;
    }
    dateFormatPrisma(date) {
        const [d, m, y] = date.split("/");
        const prismaReadyDate = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
        return prismaReadyDate;
    }
}
export const dietHelper = new DietHelper();
//# sourceMappingURL=dietHelper.js.map