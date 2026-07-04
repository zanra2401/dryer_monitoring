

export default defineEventHandler(async (event) => {
    try {
        const area_id = parseInt(getQuery(event).area_id as string);
        const result = await prisma.dryerArea.findUnique({
            where: { areaId: area_id },
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        console.log(result);
        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
