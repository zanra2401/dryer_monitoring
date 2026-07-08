import type { UserAccess, UserRole, UserRow } from "~/composable/useUserList";

export type DryerAccessRoleFilter = Extract<UserRole, "OPERATOR" | "CLIENT">;

type DryerAccessArea = {
    areaId: number;
    name: string;
};

type DryerAccessResponse = {
    success: boolean;
    data: {
        area: DryerAccessArea;
        assignedUsers: UserRow[];
        candidateUsers: UserRow[];
    };
};

const getApiErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
        const maybeError = error as {
            data?: { error?: string; message?: string };
            statusMessage?: string;
            message?: string;
        };

        return maybeError.data?.error || maybeError.data?.message || maybeError.statusMessage || maybeError.message || "Unknown error";
    }

    return "Unknown error";
};

export const useDryerAccess = (areaId: number) => {
    const area = ref<DryerAccessArea | null>(null);
    const assignedUsers = ref<UserRow[]>([]);
    const candidateUsers = ref<UserRow[]>([]);
    const loading = ref(false);
    const saving = ref(false);
    const error = ref<unknown>(null);
    const search = ref("");
    const role = ref<DryerAccessRoleFilter | undefined>(undefined);

    const fetch_access = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<DryerAccessResponse>("/api/dryarea/access/users", {
                method: "GET",
                params: {
                    area_id: areaId,
                    search: search.value.trim() || undefined,
                    role: role.value,
                },
            });

            area.value = response.data.area;
            assignedUsers.value = response.data.assignedUsers;
            candidateUsers.value = response.data.candidateUsers;
            return response;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const add_access = async (userId: number) => {
        saving.value = true;
        error.value = null;

        try {
            const response = await $fetch("/api/dryarea/access/user", {
                method: "POST",
                body: {
                    area_id: areaId,
                    user_id: userId,
                },
            });

            await fetch_access();
            return response;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            saving.value = false;
        }
    };

    const add_accesses = async (userIds: number[]) => {
        saving.value = true;
        error.value = null;

        try {
            const uniqueUserIds = [...new Set(userIds)];
            const responses = [];

            for (const userId of uniqueUserIds) {
                responses.push(await $fetch("/api/dryarea/access/user", {
                    method: "POST",
                    body: {
                        area_id: areaId,
                        user_id: userId,
                    },
                }));
            }

            await fetch_access();
            return responses;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            saving.value = false;
        }
    };

    const remove_access = async (userId: number) => {
        saving.value = true;
        error.value = null;

        try {
            const response = await $fetch("/api/dryarea/access/user", {
                method: "DELETE",
                body: {
                    area_id: areaId,
                    user_id: userId,
                },
            });

            await fetch_access();
            return response;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            saving.value = false;
        }
    };

    const accessNames = (accesses: UserAccess[]) => {
        return accesses.map((access) => access.dryer.name).join(", ") || "-";
    };

    return {
        area,
        assignedUsers,
        candidateUsers,
        loading,
        saving,
        error,
        search,
        role,
        fetch_access,
        add_access,
        add_accesses,
        remove_access,
        accessNames,
    };
};
