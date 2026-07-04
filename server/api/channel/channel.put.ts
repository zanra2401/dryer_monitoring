

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { api_key, channel_id, area_id } = body;

        const result = await prisma.channel.update({
            where: { 
                channelId: channel_id,
                areaId: area_id
            },
            data: {
                apiKey: api_key
            },
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Channel not found" };
        }

        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});