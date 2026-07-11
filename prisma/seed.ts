import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// Hapus ekstensi .ts untuk menghindari error resolusi modul
import { PrismaClient } from '../app/generated/prisma/client';
import { BinStatus, LotStatus } from '../app/generated/prisma/enums';
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
    // Gunakan 'prisma' alih-alih 'tx'
    const createdUser = await prisma.user.create({
        data: {
            username: "admin",
            password: await hashUserPassword("admin123"),
            // Gunakan nilai statis karena ini adalah proses seeding awal
            fullName: "Administrator",
            role: "ADMIN", // Sesuaikan dengan enum role database Anda
        },
    });

    console.log(createdUser);   
    console.log("Seed berhasil. User dibuat:", createdUser.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });