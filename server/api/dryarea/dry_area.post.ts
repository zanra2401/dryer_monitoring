import * as z from "zod";
import { Prisma } from "~/generated/prisma/client"; 
import { prisma } from "~~/server/utils/prisma";
import sqliteUtils from "~~/server/utils/sqlite";
import { FlagType } from "~/generated/sqlite/client";

const schema = z.object({
    name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
    try {
        const body = schema.parse(await readBody(event));

        const dryArea = await prisma.dryerArea.create({
            data: {
                name: body.name,
            },
        });

        const currentFlag = await sqliteUtils.getSystemFlag("dryCount");

        const dryCount = currentFlag
            ? Number(currentFlag) + 1
            : 1;

        await sqliteUtils.setSystemFlag(
            "dryCount",
            dryCount.toString(),
            FlagType.NUMBER
        );

        setResponseStatus(event, 201);

        return dryArea;
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: err.issues
                    .map(issue => issue.message)
                    .join(", "),
            });
        }

        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            throw createError({
                statusCode: 409,
                statusMessage: "Dry area already exists or Duplicate Name",
            });
        }

        throw err;
    }
});