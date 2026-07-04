import sqliteUtils from "~~/server/utils/sqlite";
import { FlagType } from "~/generated/sqlite/client";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { area_id } = body;    

        const channel = await prisma.channel.findFirst({
            where: { areaId: area_id },
        });

        if (channel) {
            setResponseStatus(event, 400);
            return { error: "Tidak bisa hapus dryer area dengan channel" };
        }

        const result = await prisma.dryerArea.delete({
            where: { areaId: area_id },
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        const dryCount = (await sqliteUtils.getSystemFlag("dryCount")) ? parseInt(await sqliteUtils.getSystemFlag("dryCount") as string) - 1 : 0;
        await sqliteUtils.setSystemFlag("dryCount", dryCount.toString(), FlagType.NUMBER);

        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});