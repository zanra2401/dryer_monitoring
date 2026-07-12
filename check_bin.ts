import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const bin = await prisma.bin.findUnique({
        where: {
            binNumber_areaId: {
                binNumber: 209,
                areaId: 1
            }
        },
        include: { channelTop: true, channelBottom: true }
    });
    console.log(JSON.stringify(bin, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
