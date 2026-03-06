import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from the environment variables!");
}
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
export default new PrismaClient({ adapter });
//# sourceMappingURL=db.js.map