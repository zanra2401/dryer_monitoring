<script setup lang="ts">
import { useDryerAuth } from "~/composable/useDryerAuth";
import { resolveRoleRedirect } from "~/utils/authRoute";

definePageMeta({
  layout: false,
});

const route = useRoute();
const toast = useToast();
const config = useRuntimeConfig();
const { login, loggedIn, fetch, user } = useDryerAuth();

const form = reactive({
  username: "",
  password: "",
});
const loading = ref(false);
const showPassword = ref(false);

const requestedRedirect = computed(() => {
  const redirect = route.query.redirect;

  return typeof redirect === "string" && redirect.startsWith("/") ? redirect : null;
});

onMounted(async () => {
  await fetch();

  if (loggedIn.value) {
    await navigateTo(resolveRoleRedirect(user.value?.role, requestedRedirect.value));
  }
});

const submitLogin = async () => {
  loading.value = true;

  try {
    const authUser = await login(form);
    toast.add({
      title: "Login successful",
      color: "success",
      icon: "i-lucide-shield-check",
    });
    await navigateTo(resolveRoleRedirect(authUser.role, requestedRedirect.value));
  } catch (error) {
    toast.add({
      title: "Login failed",
      description: "Username atau password tidak sesuai.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div class="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section class="hidden border-r border-gray-200 bg-white px-12 py-10 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-md bg-primary text-white">
              <UIcon name="i-lucide-package-search" class="size-5" />
            </div>
            <div>
              <p class="text-sm font-semibold">Dryer Monitoring</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Prasad Seeds</p>
            </div>
          </div>

          <div class="mt-auto max-w-xl pb-8">
            <div class="mb-5 inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
              <UIcon name="i-lucide-shield-check" class="size-4 text-primary" />
              Secure session
            </div>
            <h1 class="text-4xl font-semibold tracking-normal text-gray-950 dark:text-white">
              Dryer Monitoring Access
            </h1>
            <p class="mt-4 max-w-lg text-sm leading-6 text-gray-600 dark:text-gray-300">
              Dashboard operasional untuk monitoring dryer area, konfigurasi lot, dan kontrol akses pengguna.
            </p>
          </div>
        </section>

        <section class="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div class="w-full max-w-md">
            <div class="mb-8 lg:hidden">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-md bg-primary text-white">
                  <UIcon name="i-lucide-package-search" class="size-5" />
                </div>
                <div>
                  <p class="text-sm font-semibold">Dryer Monitoring</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Prasad Seeds</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div class="mb-6">
                <h2 class="text-xl font-semibold">Login</h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Masuk dengan akun yang sudah terdaftar.</p>
              </div>

              <form class="space-y-4" @submit.prevent="submitLogin">
                <UFormField label="Username" required>
                  <UInput
                    v-model="form.username"
                    icon="i-lucide-users"
                    autocomplete="username"
                    placeholder="username"
                    size="lg"
                    class="w-full"
                    :disabled="loading"
                  />
                </UFormField>

                <UFormField label="Password" required>
                  <UInput
                    v-model="form.password"
                    icon="i-lucide-lock-keyhole"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="password"
                    size="lg"
                    class="w-full"
                    :disabled="loading"
                  >
                    <template #trailing>
                      <UButton
                        :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        square
                        :aria-label="showPassword ? 'Hide password' : 'Show password'"
                        :disabled="loading"
                        @click="() => { showPassword = !showPassword }"
                      />
                    </template>
                  </UInput>
                </UFormField>

                <UButton
                  type="submit"
                  icon="i-lucide-shield-check"
                  size="lg"
                  block
                  :loading="loading"
                  :disabled="!form.username || !form.password"
                >
                  Login
                </UButton>
              </form>
            </div>
          </div>
        </section>
      </div>
  </main>
</template>
