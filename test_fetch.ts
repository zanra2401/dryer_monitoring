import { PrismaClient } from './app/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching configuration for Bin 211...");
    const bin = await prisma.bin.findUnique({
        where: { binNumber_areaId: { binNumber: 211, areaId: 1 } },
        include: { channelTop: true, channelBottom: true }
    });

    if (!bin) {
        console.log("Bin 211 not found!");
        return;
    }

    console.log("Bin 211 Config:");
    console.log(`- Channel Top: ${bin.channelIdTop} (fields: Temp=${bin.fieldTempTop}, RH=${bin.fieldRhTop})`);
    console.log(`- Channel Bottom: ${bin.channelIdBottom} (fields: Temp=${bin.fieldTempBottom}, RH=${bin.fieldRhBottom})`);

    const now = new Date();
    const fetchStartMs = now.getTime() - (2 * 60 * 60 * 1000); // last 2 hours
    const startTimeFormatted = new Date(fetchStartMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
    const endTimeFormatted = new Date(now).toISOString().replace(/\.\d{3}Z$/, 'Z');

    console.log(`\nFetching data from ${startTimeFormatted} to ${endTimeFormatted}...`);

    const channelIdsToFetch = new Set<string>();
    if (bin.channelIdTop) channelIdsToFetch.add(bin.channelIdTop);
    if (bin.channelIdBottom) channelIdsToFetch.add(bin.channelIdBottom);

    for (const cid of channelIdsToFetch) {
        const channelObj = bin.channelTop?.channelId === cid ? bin.channelTop : bin.channelBottom;
        if (!channelObj) continue;

        console.log(`\n=> Requesting Channel ID: ${cid} API Key: ${channelObj.apiKey}`);
        
        try {
            const url = `https://api.thingspeak.com/channels/${cid}/feeds.json?api_key=${channelObj.apiKey}&start=${startTimeFormatted}&end=${endTimeFormatted}`;
            const res = await fetch(url);
            if (!res.ok) {
                console.log(`Failed! Status: ${res.status}`);
                continue;
            }
            const data = await res.json();

            console.log(`Received ${data?.feeds?.length || 0} feeds.`);
            if (data?.feeds?.length > 0) {
                console.log("Sample of first feed:");
                console.log(data.feeds[0]);
            }
        } catch (e: any) {
            console.error("Error fetching ThingSpeak:", e.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
