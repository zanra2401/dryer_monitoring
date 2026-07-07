export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { log_id, mc, remark } = body;

        const log = await prisma.log.update({  
            data: {
                mc: mc,
                remark: remark,
            },
            where: {
                logId: log_id,
            },
        });

        return { success: true, data: log };
    } catch (error) {
        return error;
    }
});