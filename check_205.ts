import { PrismaClient } from './app/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Bin 205...");
    const bin = await prisma.bin.findUnique({
        where: { binNumber_areaId: { binNumber: 205, areaId: 1 } }
    });
    console.log("Bin 205 Configuration:", bin);

    console.log("\nLast 5 BinLogs for Bin 205:");
    const logs = await prisma.binLog.findMany({
        where: { binNumber: 205, areaId: 1 },
        orderBy: { timestampThingspeak: 'desc' },
        take: 5
    });
    console.table(logs.map(l => ({
        time: l.timestampThingspeak,
        tTop: l.tempTop,
        rTop: l.rhTop,
        tBot: l.tempBottom,
        rBot: l.rhBottom
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
