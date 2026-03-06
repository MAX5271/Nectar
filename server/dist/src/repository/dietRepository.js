import prisma from "../utils/db.js";
import { dietService } from "../services/dietService.js";
class DietRepository {
    async dietPlan(id) {
        const response = await dietService.dietPlan(id);
        const newPlanWithMeal = await prisma.dietPlan.create({
            data: response
        });
        return newPlanWithMeal;
    }
    async getLatestDietPlan(userId) {
        return await prisma.dietPlan.findFirst({
            where: { userId },
            orderBy: { date: 'desc' },
            include: { diets: true }
        });
    }
    async getDietPlanById(planId) {
        return await prisma.dietPlan.findUnique({
            where: { id: planId },
            include: { diets: true }
        });
    }
    async getDietPlanHistory(userId) {
        return await prisma.dietPlan.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 7,
            include: { diets: true }
        });
    }
}
export const dietRepository = new DietRepository();
//# sourceMappingURL=dietRepository.js.map