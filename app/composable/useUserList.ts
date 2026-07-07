export const USER_ROLES = ["ADMIN", "MANAGER", "OPERATOR", "CLIENT"] as const;
export const USER_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserPageSize = (typeof USER_PAGE_SIZE_OPTIONS)[number];

export type UserAccess = {
    userId: number;
    areaId: number;
    dryer: {
        areaId: number;
        name: string;
    };
};

export type UserRow = {
    userId: number;
    username: string;
    fullName: string;
    role: UserRole;
    canAccess: UserAccess[];
};

type UserListResponse = {
    success: boolean;
    data: UserRow[];
    totalCount: number;
};

export const useUserList = () => {
    const current_data = ref<UserListResponse | null>(null);
    const error = ref<unknown>(null);
    const loading = ref(false);

    const pagination_data = ref({
        offset: 0,
        limit: 10,
    });

    const filter_data = ref<{
        search: string;
        roles: UserRole[];
    }>({
        search: "",
        roles: [],
    });

    const total_page = computed(() => {
        if (pagination_data.value.limit === 0 || !current_data.value?.totalCount) {
            return 0;
        }

        return Math.ceil(current_data.value.totalCount / pagination_data.value.limit);
    });

    const page = computed(() => Math.floor(pagination_data.value.offset / pagination_data.value.limit) + 1);

    const hasNext = computed(() => {
        return Boolean(
            current_data.value &&
            pagination_data.value.offset + pagination_data.value.limit < current_data.value.totalCount,
        );
    });

    const hasPrev = computed(() => pagination_data.value.offset - pagination_data.value.limit >= 0);

    const fetch_user_list = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<UserListResponse>("/api/user/users", {
                method: "GET",
                params: {
                    limit: pagination_data.value.limit,
                    offset: pagination_data.value.offset,
                    roles: filter_data.value.roles.length > 0 ? filter_data.value.roles : undefined,
                    search: filter_data.value.search || undefined,
                },
            });

            current_data.value = response;
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const reset_pagination = () => {
        pagination_data.value.offset = 0;
    };

    const next = async () => {
        if (!hasNext.value) {
            return;
        }

        pagination_data.value.offset += pagination_data.value.limit;
        await fetch_user_list();
    };

    const prev = async () => {
        if (!hasPrev.value) {
            return;
        }

        pagination_data.value.offset -= pagination_data.value.limit;
        await fetch_user_list();
    };

    const set_search = async (search: string) => {
        filter_data.value.search = search;
        reset_pagination();
        await fetch_user_list();
    };

    const set_roles = async (roles: UserRole[]) => {
        filter_data.value.roles = [...new Set(roles)];
        reset_pagination();
        await fetch_user_list();
    };

    const set_limit = async (limit: UserPageSize) => {
        pagination_data.value.limit = limit;
        reset_pagination();
        await fetch_user_list();
    };

    return {
        current_data,
        error,
        loading,
        pagination_data,
        filter_data,
        fetch_user_list,
        next,
        prev,
        hasNext,
        hasPrev,
        total_page,
        page,
        reset_pagination,
        set_search,
        set_roles,
        set_limit,
    };
};
