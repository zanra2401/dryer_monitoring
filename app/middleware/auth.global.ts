export default defineNuxtRouteMiddleware(async (to) => {
    const { getDefaultRouteForRole, isAllowedRouteForRole, isRoleMappedRoute } = await import("~/utils/authRoute");
    const { loggedIn, user, fetch } = useUserSession();

    await fetch();

    if (to.path === "/login") {
        if (loggedIn.value) {
            return navigateTo(getDefaultRouteForRole(user.value?.role));
        }
        return;
    }

    if (!loggedIn.value) {
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
