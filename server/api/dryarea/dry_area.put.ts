

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { name, area_id } = body;

        const result = await prisma.dryerArea.update({
            where: { areaId: area_id },
            data: body,
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        return { success: true, data: result };

    } catch (error) {
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});