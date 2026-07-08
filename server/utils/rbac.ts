export const ROLES = ["ADMIN", "MANAGER", "OPERATOR", "CLIENT"] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (role: string): role is Role => {
    return ROLES.includes(role as Role);
};

export const isGlobalRole = (role: Role) => {
    return role === "ADMIN" || role === "MANAGER";
};

export const isSingleAreaRole = (role: Role) => {
    return role === "OPERATOR" || role === "CLIENT";
};

export const normalizeAreaIds = (areaIds: number[] = []) => {
    return [...new Set(areaIds)];
};

export const validateRoleAreaAccess = (role: Role, areaIds: number[]) => {
    const normalizedAreaIds = normalizeAreaIds(areaIds);

    if (isSingleAreaRole(role) && normalizedAreaIds.length !== 1) {
        return `${role} must have exactly one dryer area`;
    }

    return null;
};

export const getRoleAccessAreaIds = (role: Role, areaIds: number[] = []) => {
    if (isGlobalRole(role)) {
        return [];
    }

    return normalizeAreaIds(areaIds);
};
