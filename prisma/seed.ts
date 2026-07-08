import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from '../app/generated/prisma/client.ts';
import { BinStatus, LotStatus } from '../app/generated/prisma/enums.ts';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Mulai melakukan seeding pangkalan data...');

    // 1. Buat atau ambil User
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: 'password123', // idealnya di-hash
            fullName: 'Administrator',
            role: 'ADMIN'
        }
    });
    console.log(`[SEED] User admin: ID ${adminUser.userId}`);

    // 2. Ambil Area yang sudah ada (sesuai pesan: "channel dan drier sudah ada")
    let area = await prisma.dryerArea.findFirst();
    if (!area) {
        area = await prisma.dryerArea.create({
            data: { name: 'Area 1 (Mock)' }
        });
        console.log(`[SEED] Membuat Dryer Area baru: ${area.name}`);
    } else {
        console.log(`[SEED] Menggunakan Dryer Area eksisting: ${area.name}`);
    }

    // 3. Ambil Channel yang sudah ada
    let channel = await prisma.channel.findFirst();
    if (!channel) {
        channel = await prisma.channel.create({
            data: {
                channelId: 'MOCK_CH_01',
                areaId: area.areaId,
                apiKey: 'mock_api_key',
                nummberOfBin: 2
            }
        });
        console.log(`[SEED] Membuat Channel baru: ${channel.channelId}`);
    } else {
        console.log(`[SEED] Menggunakan Channel eksisting: ${channel.channelId}`);
    }

    // 4. Pastikan setidaknya ada 1 Bin
    let bin = await prisma.bin.findFirst({
        where: { areaId: area.areaId, channelId: channel.channelId }
    });
    if (!bin) {
        bin = await prisma.bin.create({
            data: {
                binNumber: 1,
                areaId: area.areaId,
                channelId: channel.channelId,
                fieldTempTop: 'field1',
                fieldRhTop: 'field2',
                fieldTempBottom: 'field3',
                fieldRhBottom: 'field4',
                binStatus: BinStatus.UPAIR
            }
        });
        console.log(`[SEED] Membuat Bin baru: Bin ${bin.binNumber}`);
    } else {
        console.log(`[SEED] Menggunakan Bin eksisting: Bin ${bin.binNumber}`);
        // Set ke UPAIR agar bisa dites
        await prisma.bin.update({
            where: { binNumber_areaId: { binNumber: bin.binNumber, areaId: bin.areaId } },
            data: { binStatus: BinStatus.UPAIR }
        });
    }

    // 5. Buat Lot transaksi uji coba
    const lotNumber = `LOT-TEST-${Date.now().toString().slice(-4)}`;
    const lot = await prisma.lot.create({
        data: {
            lotNumber: lotNumber,
            hybrid: 'BISI-18',
            quality: 'A',
            netToBin: 5000,
            initialMc: 32.5,
            status: LotStatus.UPAIR,
            createdBy: adminUser.userId,
            binNumber: bin.binNumber,
            areaId: area.areaId,
            startTime: new Date()
        }
    });
    console.log(`[SEED] Membuat Lot uji coba: ${lot.lotNumber}`);

    // Update Bin agar terisi oleh Lot ini
    await prisma.bin.update({
        where: { binNumber_areaId: { binNumber: bin.binNumber, areaId: bin.areaId } },
        data: { occupiedBy: lot.lotNumber }
    });

    // 6. Buat Log MC Awal
    await prisma.lotMcLog.create({
        data: {
            lotId: lot.lotId,
            mc: 32.5,
            checkerName: 'Auto Seed',
            remark: 'Inisialisasi MC',
            createdAt: new Date()
        }
    });
    console.log(`[SEED] Membuat MC Log inisialisasi untuk Lot ${lot.lotNumber}`);

    // 7. Buat beberapa data log telemetri (BinLog) 2 jam ke belakang
    const logsData = [];
    const now = new Date().getTime();
    for (let i = 0; i < 12; i++) {
        // Setiap 10 menit
        const timestamp = new Date(now - (12 - i) * 10 * 60 * 1000);
        logsData.push({
            binNumber: bin.binNumber,
            areaId: area.areaId,
            timestampThingspeak: timestamp,
            statusBin: 'UPAIR',
            tempTop: 35.0 + Math.random() * 5,
            rhTop: 50.0 + Math.random() * 5,
            tempBottom: 38.0 + Math.random() * 5,
            rhBottom: 48.0 + Math.random() * 5,
            remark: 'Seeder Data'
        });
    }
    await prisma.binLog.createMany({
        data: logsData
    });
    console.log(`[SEED] Menyisipkan ${logsData.length} baris log telemetri pada Bin ${bin.binNumber}`);

    console.log('Seeding selesai!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
