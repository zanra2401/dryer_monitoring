

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { area_id } = body;    
        const result = await prisma.dryerArea.delete({
            where: { areaId: area_id },
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});