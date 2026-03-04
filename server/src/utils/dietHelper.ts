interface dietFormat {
  mealType: string;
  foodName: string;
  portion: string;
  calories: Number;
  protein: Number;
  carbs: Number;
  fat: Number;
}

class DietHelper {
  dietFormater({
    mealType,
    foodName,
    portion,
    calories,
    protein,
    carbs,
    fat,
  }: dietFormat) {
    const result = {
      type: mealType,
      meal: foodName,
      portion,
      calories: Math.round(calories as number),
      protein: Math.round(protein as number),
      carb: Math.round(carbs as number),
      fat: Math.round(fat as number),
      date: this.dateFormatPrisma(this.dateFormat(new Date())),
    };
    return result;
  }

  dateFormat(date: Date) {
    const formattedDate = date.toLocaleDateString("en-GB");
    return formattedDate;
  }

  dateFormatPrisma(date: string) {
    const [d, m, y] = date.split("/");
    const prismaReadyDate = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
    return prismaReadyDate;
  }
}

export const dietHelper = new DietHelper();
