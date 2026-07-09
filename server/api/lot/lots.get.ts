import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

const normalizeNumberArray = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const values = Array.isArray(value) ? value : [value];

    return values
        .flatMap((item) => typeof item === "string" ? item.split(",") : [item])
        .filter((item) => item !== "");
};

const normalizeStringArray = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const values = Array.isArray(value) ? value : [value];

    return values
        .flatMap((item) => typeof item === "string" ? item.split(",") : [item])
        .filter((item): item is string => typeof item === "string" && item.length > 0);
};

const querySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    area_id: z.coerce.number().int().positive().optional(),
    area_ids: z.preprocess(
        normalizeNumberArray,
        z.array(z.coerce.number().int().positive()).optional(),
    ),
    bin_number: z.coerce.number().int().positive().optional(),
    bin_numbers: z.preprocess(
        normalizeNumberArray,
        z.array(z.coerce.number().int().positive()).optional(),
    ),
    status: z.enum(["UPAIR", "DOWNAIR", "COMPLETED"]).optional(),
    statuses: z.preprocess(
        normalizeStringArray,
        z.array(z.enum(["UPAIR", "DOWNAIR", "COMPLETED"])).optional(),
    ),
    search: z.string().trim().min(1).optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const query = querySchema.parse(getQuery(event));

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;

        let areaIds: number[] | undefined = undefined;
        if (isLimitedAreaRole(user.role)) {
            const allowed = user.areaIds;
            if (query.area_ids && query.area_ids.length > 0) {
                areaIds = query.area_ids.filter((id) => allowed.includes(id));
                if (areaIds.length === 0) {
                    areaIds = [-1]; // Force empty result if user is querying areas they don't have access to
                }
            } else if (query.area_id) {
                if (allowed.includes(query.area_id)) {
                    areaIds = [query.area_id];
                } else {
                    areaIds = [-1];
                }
            } else {
                areaIds = allowed.length > 0 ? allowed : [-1];
            }
        } else {
            areaIds = query.area_ids && query.area_ids.length > 0
                ? [...new Set(query.area_ids)]
                : undefined;
        }

        const binNumbers = query.bin_numbers && query.bin_numbers.length > 0
            ? [...new Set(query.bin_numbers)]
            : undefined;
        const statuses = query.statuses && query.statuses.length > 0
            ? [...new Set(query.statuses)]
            : undefined;

        const where = {
            ...(areaIds
                ? {
                    areaId: {
                        in: areaIds,
                    },
                }
                : query.area_id
                    ? { areaId: query.area_id }
                    : {}),
            ...(binNumbers
                ? {
                    binNumber: {
                        in: binNumbers,
                    },
                }
                : query.bin_number
                    ? { binNumber: query.bin_number }
                    : {}),
            ...(statuses
                ? {
                    status: {
                        in: statuses,
                    },
                }
                : query.status
                    ? { status: query.status }
                    : {}),
            ...(query.search
                ? {
                    OR: [
                        { lotNumber: { contains: query.search } },
                        { hybrid: { contains: query.search } },
                        { quality: { contains: query.search } },
                    ],
                }
                : {}),
        };

        const [result, totalCount] = await Promise.all([
            prisma.lot.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: [
                    {
                        startTime: "desc",
                    },
                    {
                        lotId: "desc",
                    },
                ],
            }),
            prisma.lot.count({ where }),
        ]);

        return { success: true, data: result, totalCount };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
