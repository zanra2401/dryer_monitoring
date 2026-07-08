import { getCurrentAuthUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
    const user = await getCurrentAuthUser(event);

    if (!user) {
        setResponseStatus(event, 401);
        return { error: "Authentication required" };
    }

    return { success: true, data: user };
});
