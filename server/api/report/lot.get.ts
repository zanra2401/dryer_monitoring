import { z, ZodError } from "zod";
import { getLotReportData } from "~~/server/utils/lot-report";

const querySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));
        const data = await getLotReportData(query.lot_id);

        if (!data) {
            setResponseStatus(event, 404);
            return {
                error: "Lot not found",
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.log(error);

        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return {
                error: "Invalid query parameter",
            };
        }

        setResponseStatus(event, 500);
        return {
            error: "Internal Server Error",
        };
    }
});
