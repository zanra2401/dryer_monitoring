import type { Role } from "~~/server/utils/rbac";

const ADMIN_ROUTES = ["/dryercfg"];
const OPERATOR_ROUTES = ["/dryer"];

const isPathWithin = (path: string, prefix: string) => {
    return path === prefix || path.startsWith(`${prefix}/`);
};

export const getDefaultRouteForRole = (role?: Role | null) => {
    if (role === "ADMIN" || role === "MANAGER") {
        return "/dryercfg";
    }

    if (role === "OPERATOR" || role === "CLIENT") {
        return "/dryer";
    }

    return "/login";
};

export const isAllowedRouteForRole = (role: Role | null | undefined, path: string) => {
    if (!role) {
        return false;
    }

    if (role === "ADMIN" || role === "MANAGER") {
        // MANAGER cannot access user management
        if (role === "MANAGER" && isPathWithin(path, "/dryercfg/users")) {
            return false;
        }
        return ADMIN_ROUTES.some((prefix) => isPathWithin(path, prefix));
    }

    if (role === "OPERATOR") {
        if (isPathWithin(path, "/dryer/lots")) {
            return false;
        }
        return OPERATOR_ROUTES.some((prefix) => isPathWithin(path, prefix));
    }

    if (role === "CLIENT") {
        if (isPathWithin(path, "/dryercfg/lot")) {
            return true;
        }
        return OPERATOR_ROUTES.some((prefix) => isPathWithin(path, prefix));
    }

    return false;
};

export const resolveRoleRedirect = (role: Role | null | undefined, redirect?: string | null) => {
    if (redirect && redirect.startsWith("/") && isAllowedRouteForRole(role, redirect)) {
        return redirect;
    }

    return getDefaultRouteForRole(role);
};

export const isRoleMappedRoute = (path: string) => {
    return ADMIN_ROUTES.some((prefix) => isPathWithin(path, prefix))
        || OPERATOR_ROUTES.some((prefix) => isPathWithin(path, prefix));
};
