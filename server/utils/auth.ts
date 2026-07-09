import type { H3Event } from "h3";
import { getRoleAccessAreaIds, isRole, type Role } from "~~/server/utils/rbac";

export type AuthUser = {
    userId: number;
    username: string;
    fullName: string;
    role: Role;
    areaIds: number[];
    bypass?: boolean;
};

const bypassUser: AuthUser = {
    userId: 0,
    username: "bypass-admin",
    fullName: "Bypass Admin",
    role: "ADMIN",
    areaIds: [],
    bypass: true,
};

export const isAuthBypassEnabled = (event: H3Event) => {
    const config = useRuntimeConfig(event);

    return config.authBypass;
};

export const toAuthUser = (user: {
    userId: number;
    username: string;
    fullName: string;
    role: string;
    canAccess?: Array<{ areaId: number }>;
}): AuthUser => {
    if (!isRole(user.role)) {
        throw createError({
            statusCode: 403,
            statusMessage: "Invalid user role",
        });
    }

    return {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        areaIds: getRoleAccessAreaIds(user.role, user.canAccess?.map((access) => access.areaId) ?? []),
    };
};

export const getCurrentAuthUser = async (event: H3Event) => {
    const session = await getUserSession(event);

    if (session.user) {
        return session.user as AuthUser;
    }

    if (isAuthBypassEnabled(event)) {
        return bypassUser;
    }

    return null;
};

export const requireAuthUser = async (event: H3Event) => {
    const user = await getCurrentAuthUser(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Authentication required",
        });
    }

    return user;
};

export const requireAuthRole = async (event: H3Event, roles: Role[]) => {
    const user = await requireAuthUser(event);

    if (!roles.includes(user.role)) {
        throw createError({
            statusCode: 403,
            statusMessage: "Insufficient permission",
        });
    }

    return user;
};
