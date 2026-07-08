<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()


</script>

<template>
  <UHeader :toggle="false">
    <template #title>
      <div class="h-full" >
        <img src="~/assets/logo.png" class="h-[100px]" alt="">
      </div>
    </template>

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>
