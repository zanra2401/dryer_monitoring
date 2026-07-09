import * as z from "zod";
import { USER_ROLES, type UserRole, type UserRow } from "~/composable/useUserList";

type UserFormData = {
    user_id?: number | null;
    username: string;
    password: string;
    full_name: string;
    role: UserRole;
    area_ids: number[];
};

const limitedAreaRoles: UserRole[] = ["OPERATOR", "CLIENT"];

const userFormSchema = z.object({
    username: z.string().trim().min(1, "Username is required"),
    password: z.string().trim().optional(),
    full_name: z.string().trim().min(1, "Full name is required"),
    role: z.enum(USER_ROLES),
    area_ids: z.array(z.number().int().positive()),
});

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

const areaIdsFromForm = (form: UserFormData) => {
    return limitedAreaRoles.includes(form.role) ? [...new Set(form.area_ids)] : [];
};

const validateRoleAccess = (form: UserFormData, requirePassword: boolean) => {
    const parsed = userFormSchema.parse(form);

    if (requirePassword && !parsed.password?.trim()) {
        throw new Error("Password is required");
    }

    if (limitedAreaRoles.includes(parsed.role) && parsed.area_ids.length < 1) {
        throw new Error(`${parsed.role} must have at least one dryer area`);
    }

    return parsed;
};

const makeEmptyForm = (): UserFormData => ({
    user_id: null,
    username: "",
    password: "",
    full_name: "",
    role: "OPERATOR",
    area_ids: [],
});

export const useUserCRUD = (refreshUserList: () => Promise<unknown>) => {
    const create_data = ref<UserFormData>(makeEmptyForm());
    const update_data = ref<UserFormData>(makeEmptyForm());
    const error = ref<unknown>(null);
    const loading = ref(false);

    const reset_create_data = () => {
        create_data.value = makeEmptyForm();
    };

    const reset_update_data = () => {
        update_data.value = makeEmptyForm();
    };

    const prepare_update_user = (user: UserRow) => {
        update_data.value = {
            user_id: user.userId,
            username: user.username,
            password: "",
            full_name: user.fullName,
            role: user.role,
            area_ids: user.canAccess.map((access) => access.areaId),
        };
    };

    const create_user = async () => {
        loading.value = true;
        error.value = null;

        try {
            const parsed = validateRoleAccess(create_data.value, true);
            const password = parsed.password?.trim();

            if (!password) {
                throw new Error("Password is required");
            }

            const result = await $fetch("/api/user/user", {
                method: "POST",
                body: {
                    username: parsed.username,
                    password,
                    full_name: parsed.full_name,
                    role: parsed.role,
                    area_ids: areaIdsFromForm(create_data.value),
                },
            });

            reset_create_data();
            await refreshUserList();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const update_user = async () => {
        loading.value = true;
        error.value = null;

        try {
            const parsed = validateRoleAccess(update_data.value, false);
            const userId = update_data.value.user_id;

            if (!userId) {
                throw new Error("User ID is required");
            }

            const body: Record<string, unknown> = {
                user_id: userId,
                username: parsed.username,
                full_name: parsed.full_name,
                role: parsed.role,
                area_ids: areaIdsFromForm(update_data.value),
            };

            if (parsed.password?.trim()) {
                body.password = parsed.password;
            }

            const result = await $fetch("/api/user/user", {
                method: "PUT",
                body,
            });

            reset_update_data();
            await refreshUserList();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const delete_user = async (userId: number) => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch("/api/user/user", {
                method: "DELETE",
                body: {
                    user_id: userId,
                },
            });

            await refreshUserList();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    return {
        create_data,
        update_data,
        error,
        loading,
        create_user,
        update_user,
        delete_user,
        prepare_update_user,
        reset_create_data,
        reset_update_data,
    };
};
