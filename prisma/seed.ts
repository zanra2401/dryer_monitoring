import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from '../app/generated/prisma/client.ts';
import { BinStatus, LotStatus } from '../app/generated/prisma/enums.ts';
import { hashUserPassword } from "../server/utils/password";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const createdUser = await tx.user.create({
        data: {
            username: "admin",
            password: await hashUserPassword("admin123"),
            fullName: body.full_name,
            role: body.role,
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
