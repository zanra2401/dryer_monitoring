

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { name, area_id } = body;

        const sameNameArea = await prisma.dryerArea.findFirst({
            where: {
                name: name,
                NOT: {
                    areaId: area_id
                }
            }
        });

        if (sameNameArea) {
            setResponseStatus(event, 409);
            return { error: "Nama Dryer Area sudah ada" };
        }

        const result = await prisma.dryerArea.update({
            where: { areaId: area_id },
            data: {
                name: name
            },
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Dryer Area Tidak ditemukan" };
        }

        return { success: true, data: result };

    } catch (error) {
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});