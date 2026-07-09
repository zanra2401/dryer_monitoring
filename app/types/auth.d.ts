import type { Role } from "~~/server/utils/rbac";

declare module "#auth-utils" {
    interface User {
        userId: number;
        username: string;
        fullName: string;
        role: Role;
        areaIds: number[];
    }

    interface UserSession {
        loggedInAt?: number;
    }
}

export {};
