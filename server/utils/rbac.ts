export const ROLES = ["ADMIN", "MANAGER", "OPERATOR", "CLIENT"] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (role: string): role is Role => {
    return ROLES.includes(role as Role);
};

export const isGlobalRole = (role: Role) => {
    return role === "ADMIN" || role === "MANAGER";
};

export const isLimitedAreaRole = (role: Role) => {
    return role === "OPERATOR" || role === "CLIENT";
};

export const normalizeAreaIds = (areaIds: number[] = []) => {
    return [...new Set(areaIds)];
};

export const validateRoleAreaAccess = (role: Role, areaIds: number[]) => {
    const normalizedAreaIds = normalizeAreaIds(areaIds);

    if (isLimitedAreaRole(role) && normalizedAreaIds.length < 1) {
        return `${role} must have at least one dryer area`;
    }

    return null;
};

export const getRoleAccessAreaIds = (role: Role, areaIds: number[] = []) => {
    if (isGlobalRole(role)) {
        return [];
    }

    return normalizeAreaIds(areaIds);
};
