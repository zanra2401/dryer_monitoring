<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'
import { useDryerAuth } from "~/composable/useDryerAuth";
import Header from "~/components/Header.vue";

const open = ref(true)

const colorMode = useColorMode()
const { user: sessionUser, logout } = useDryerAuth()
const isClient = computed(() => sessionUser.value?.role === 'CLIENT')

function getItems(state: 'collapsed' | 'expanded') {
  const role = sessionUser.value?.role

  if (role === 'OPERATOR' || role === 'CLIENT') {
    return [
      {
        label: 'Dryers',
        icon: 'i-lucide-factory',
        to: '/dryer',
      },
    ] satisfies NavigationMenuItem[]
  }

  const baseItems = [
    {
      label: 'Lots',
      icon: 'i-lucide-package-search',
      to: '/dryercfg',
    },
    {
      label: 'Dry Area',
      icon: 'i-lucide-inbox',
      to: '/dryercfg/dry-areas',
    },
  ]

  if (role !== 'MANAGER') {
    baseItems.push({
      label: 'Users',
      icon: 'i-lucide-users',
      to: '/dryercfg/users',
    })
  }

  return baseItems satisfies NavigationMenuItem[]
}

const user = computed(() => {
  const name = sessionUser.value?.fullName || sessionUser.value?.username || "Bypass Admin"

  return {
    label: name,
    avatar: {
      alt: name,
    }
  }
})

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = 'light'
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = 'dark'
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        }
      ]
    }
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await logout()
      }
    }
  ]
])

const props = withDefaults(defineProps<{
  loading?: boolean
}>(), {
  loading: false
})
</script>

<template>
  <div v-if="isClient" class="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <div v-if="props.loading" class="flex flex-1 items-center justify-center min-h-[60vh]">
      <GridLoader />
    </div>
    <div v-else class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
        <slot />
      </div>
    </div>
  </div>

  <div v-else class="flex min-h-screen min-w-0 flex-1">
    <USidebar
      v-model:open="open"
      collapsible="icon"
      rail
      :ui="{
        container: 'h-full',
        inner: 'bg-elevated/25 divide-transparent',
        body: 'py-0'
      }"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <UIcon name="i-logos-nuxt-icon" class="size-8" />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="md:hidden"
            aria-label="Close sidebar"
            @click="open = false"
          />
        </div>
      </template>

      <template #default="{ state }">
        <UNavigationMenu
          :key="state"
          :items="getItems(state)"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </template>

      <template #footer>
        <UDropdownMenu
          :items="userItems"
          :content="{ align: 'center', collisionPadding: 12 }"
          :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
        >
          <UButton
            v-bind="user"
            trailing-icon="i-lucide-chevrons-up-down"
            color="neutral"
            variant="ghost"
            square
            class="w-full data-[state=open]:bg-elevated overflow-hidden"
            :ui="{
              trailingIcon: 'text-dimmed ms-auto'
            }"
          />
        </UDropdownMenu>
      </template>
    </USidebar>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="() => {open = !open}"
        />
      </div>

      <div v-if="props.loading" class="flex flex-1 items-center justify-center">
        <GridLoader />
      </div>

      <div v-else class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
