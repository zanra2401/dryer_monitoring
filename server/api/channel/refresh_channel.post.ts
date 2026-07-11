import  { prisma } from "~~/server/utils/prisma";
import thinkspeaks from "~~/server/utils/thinkspeaks";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { channel_id, area_id } = body;
        
        const channel = await prisma.channel.findFirst({
            where: {
                channelId: channel_id,
                areaId: area_id
            }
        });

        if (!channel) {
            throw createError({
                statusCode: 404,
                statusMessage: "Channel not found",
            });
        }

        const fetchedChannel = await thinkspeaks.get_channel(channel_id, channel.apiKey);
        
        if (!fetchedChannel) {
            throw createError({
                statusCode: 404,
                statusMessage: "Channel not found in Thinkspeaks",
            });
        }

        let fetched_bins: Record<string, any> = {};
        thinkspeaks.parse_bin(fetched_bins, fetchedChannel, area_id, channel_id);
       
        const result = await prisma.$transaction(async (tx) => {
            // Bersihkan referensi channel ini dari semua bin
            await tx.bin.updateMany({
                where: { areaId: area_id, channelIdTop: channel_id },
                data: { channelIdTop: null, fieldTempTop: null, fieldRhTop: null }
            });

            await tx.bin.updateMany({
                where: { areaId: area_id, channelIdBottom: channel_id },
                data: { channelIdBottom: null, fieldTempBottom: null, fieldRhBottom: null }
            });

            // Hapus bin yang benar-benar yatim piatu (tidak memiliki Top maupun Bottom channel)
            await tx.bin.deleteMany({
                where: {
                    areaId: area_id,
                    channelIdTop: null,
                    channelIdBottom: null
                }
            });

            // Upsert berdasarkan data terbaru dari ThingSpeak
            let updatedCount = 0;
            for (const bin of Object.values(fetched_bins) as any[]) {
                await tx.bin.upsert({
                    where: {
                        binNumber_areaId: {
                            binNumber: bin.binNumber,
                            areaId: bin.areaId
                        }
                    },
                    update: {
                        ...(bin.channelIdTop ? { channelIdTop: bin.channelIdTop, fieldTempTop: bin.fieldTempTop, fieldRhTop: bin.fieldRhTop } : {}),
                        ...(bin.channelIdBottom ? { channelIdBottom: bin.channelIdBottom, fieldTempBottom: bin.fieldTempBottom, fieldRhBottom: bin.fieldRhBottom } : {}),
                    },
                    create: bin
                });
                updatedCount++;
            }

            await tx.channel.update({
                where: {
                    channelId: channel_id,
                },
                data: {
                    nummberOfBin: Object.keys(fetched_bins).length
                }
            });
            
            return updatedCount;
        });

        return { success: true, data: result };
    } catch (error: unknown) {
        return error;
    }
});