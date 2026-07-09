export default defineNuxtRouteMiddleware(async (to) => {
    const config = useRuntimeConfig();
    const authBypass = config.public.authBypass;
    const { getDefaultRouteForRole, isAllowedRouteForRole, isRoleMappedRoute } = await import("~/utils/authRoute");
    const { loggedIn, user, fetch } = useUserSession();

    await fetch();

    if (to.path === "/login") {
        if (loggedIn.value) {
            return navigateTo(getDefaultRouteForRole(user.value?.role));
        }

        if (authBypass) {
            return;
        }

        return;
    }

    if (!loggedIn.value) {
        if (authBypass) {
            return;
        }

        return navigateTo({
            path: "/login",
            query: {
                redirect: to.fullPath,
            },
        });
    }

    if (isRoleMappedRoute(to.path) && !isAllowedRouteForRole(user.value?.role, to.path)) {
        return navigateTo(getDefaultRouteForRole(user.value?.role));
    }
});
