<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()


</script>

<template>
  <UHeader :toggle="false">
    <template #title>
      <div class="h-full flex items-center">
        <img src="~/assets/logo.png" class="h-12 w-auto object-contain" alt="Logo Aplikasi Dryer Monitoring">
      </div>
    </template>

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>
