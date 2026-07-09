type LoginPayload = {
    username: string;
    password: string;
};

export const useDryerAuth = () => {
    const session = useUserSession();

    const login = async (payload: LoginPayload) => {
        const response = await $fetch<{ success: boolean; data: NonNullable<typeof session.user.value> }>("/api/auth/login", {
            method: "POST",
            body: payload,
        });

        await session.fetch();

        return response.data;
    };

    const logout = async () => {
        await $fetch("/api/auth/logout", {
            method: "POST",
        });
        await session.clear();
        await navigateTo("/login");
    };

    return {
        ...session,
        login,
        logout,
    };
};
