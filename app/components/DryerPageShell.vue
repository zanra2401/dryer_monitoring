<script setup lang="ts">
import AppSidebar from "~/components/AppSidebar.vue";
import GridLoader from "~/components/GridLoader.vue";
import Header from "~/components/Header.vue";
import { useDryerAuth } from "~/composable/useDryerAuth";

const props = withDefaults(defineProps<{
  loading?: boolean
}>(), {
  loading: false,
});

const { user: sessionUser } = useDryerAuth();
const isManager = computed(() => sessionUser.value?.role === "MANAGER");
</script>

<template>
  <AppSidebar v-if="isManager" :loading="props.loading">
    <slot v-if="!props.loading" />
  </AppSidebar>

  <div v-else class="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 dark:bg-gray-950">
    <Header />
    <div v-if="props.loading" class="w-full h-screen flex justify-center items-center">
      <GridLoader />
    </div>
    <slot v-else />
  </div>
</template>
