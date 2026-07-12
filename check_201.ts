import { PrismaClient } from './app/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Bin 201 Config...");
    const bin = await prisma.bin.findUnique({
        where: { binNumber_areaId: { binNumber: 201, areaId: 1 } }
    });
    console.log(bin);
}
main().finally(() => prisma.$disconnect());
