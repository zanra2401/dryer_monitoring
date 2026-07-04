import { prisma } from "~~/server/utils/prisma"; 
import * as z from "zod";
import sqliteUtils from "~~/server/utils/sqlite";
import { FlagType } from "~/generated/sqlite/client";

function validate(body: any, event: any) {
    const schema = z.object({
        name: z.string().min(1, "Name is required"),
    });
    const dryArea = schema.parse(body); 
    if (!dryArea) {
        throw new Error("Invalid request body");
    }
    return body;
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { name } = body;

        const dry_area = await prisma.dryerArea.findFirst({
            where: {
                name: name
            }
        });


        if (!dry_area) {                
            const newDryArea = await prisma.dryerArea.create({
                data: {
                    name: name
                }
            });
            const dryCount = (await sqliteUtils.getSystemFlag("dryCount")) ? parseInt(await sqliteUtils.getSystemFlag("dryCount") as string) + 1 : 0 + 1;
            await sqliteUtils.setSystemFlag("dryCount", dryCount.toString(), FlagType.NUMBER);
            setResponseStatus(event, 201);
            return newDryArea;
        } else {
            setResponseStatus(event, 409);  
            return { error: "Nama Dryer Area Sudah ada" };
        }
    } catch (error) {
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };  
    }
});