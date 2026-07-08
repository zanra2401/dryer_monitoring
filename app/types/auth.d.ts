import type { Role } from "~~/server/utils/rbac";

declare module "#auth-utils" {
    interface User {
        userId: number;
        username: string;
        fullName: string;
        role: Role;
        areaIds: number[];
        bypass?: boolean;
    }

    interface UserSession {
        loggedInAt?: number;
    }
}

export {};
