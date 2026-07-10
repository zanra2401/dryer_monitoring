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
    console.log("[seed] checking if admin user exists...");
    const existingAdmin = await prisma.user.findUnique({
        where: {
            username: "admin",
        },
    });

    if (existingAdmin) {
        console.log("[seed] admin user already exists.");
        return;
    }

    console.log("[seed] hashing password...");
    const hashedPassword = await hashUserPassword("admin123");

    console.log("[seed] creating admin user...");
    const newAdmin = await prisma.user.create({
        data: {
            username: "admin",
            password: hashedPassword,
            fullName: "Administrator",
            role: "ADMIN",
        },
    });

    console.log(`[seed] successfully created initial admin user: ${newAdmin.username}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
