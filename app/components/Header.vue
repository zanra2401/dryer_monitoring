<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import { useDryerAuth } from '~/composable/useDryerAuth';

const colorMode = useColorMode();
const { user: sessionUser, logout, loggedIn } = useDryerAuth();

const mobileMenuOpen = ref(false);

const userName = computed(() => sessionUser.value?.fullName || sessionUser.value?.username || 'Guest');

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
          onUpdateChecked(checked: boolean) { if (checked) colorMode.preference = 'light'; },
          onSelect(e: Event) { e.preventDefault(); }
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) { if (checked) colorMode.preference = 'dark'; },
          onSelect(e: Event) { e.preventDefault(); }
        }
      ]
    }
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: async () => { await logout(); }
    }
  ]
]);

const navItems = computed(() => {
  if (!loggedIn.value) return [];
  const role = sessionUser.value?.role;

  if (role === 'OPERATOR') {
    return [
      { label: 'Dryers', icon: 'i-lucide-factory', to: '/dryer' },
    ];
  }

  if (role === 'CLIENT') {
    return [
      { label: 'Dryers', icon: 'i-lucide-factory', to: '/dryer' },
      { label: 'Lots', icon: 'i-lucide-package-search', to: '/dryer/lots' },
    ];
  }

  if (role === 'MANAGER') {
    return [
      { label: 'Lots Config', icon: 'i-lucide-package-search', to: '/dryercfg' },
      { label: 'Dry Area', icon: 'i-lucide-inbox', to: '/dryercfg/dry-areas' },
      { label: 'Dryers Monitor', icon: 'i-lucide-factory', to: '/dryer' },
    ];
  }

  return [
    { label: 'Lots Config', icon: 'i-lucide-package-search', to: '/dryercfg' },
    { label: 'Dry Area', icon: 'i-lucide-inbox', to: '/dryercfg/dry-areas' },
    { label: 'Users', icon: 'i-lucide-users', to: '/dryercfg/users' },
    { label: 'Dryers Monitor', icon: 'i-lucide-factory', to: '/dryer' },
  ];
});
</script>

<template>
  <!-- Top header bar -->
  <header class="sticky top-0 z-50 w-full border-b border-default bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">

      <!-- Left: Logo + Hamburger (mobile) + Desktop nav -->
      <div class="flex items-center gap-1 min-w-0">
        <!-- Hamburger button – mobile only -->
        <UButton
          v-if="loggedIn && navItems.length > 0"
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          size="sm"
          class="flex-shrink-0 sm:hidden"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        />

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0">
          <img src="~/assets/logo.png" class="h-8 sm:h-9 w-auto object-contain" alt="Logo" />
        </NuxtLink>

        <!-- Desktop navigation -->
        <nav v-if="loggedIn && navItems.length > 0" class="hidden sm:flex items-center gap-1 ml-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:bg-elevated hover:text-highlighted transition-colors"
            active-class="bg-elevated text-highlighted"
          >
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Right: color mode toggle + user avatar -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <UColorModeButton size="sm" />

        <UDropdownMenu
          v-if="loggedIn"
          :items="userItems"
          :content="{ align: 'end', collisionPadding: 12 }"
          :ui="{ content: 'w-48' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="max-w-[130px] sm:max-w-[160px]"
          >
            <UIcon name="i-lucide-user-circle" class="w-4 h-4 flex-shrink-0" />
            <span class="truncate hidden xs:inline text-xs sm:text-sm">{{ userName }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-3 h-3 flex-shrink-0 text-muted ml-0.5" />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Mobile nav drawer – slides down below the header -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-if="mobileMenuOpen && loggedIn && navItems.length > 0"
        class="sm:hidden border-t border-default bg-background px-3 pb-3 pt-2 flex flex-col gap-1"
      >
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-elevated hover:text-highlighted transition-colors"
          active-class="bg-elevated text-highlighted"
          @click="mobileMenuOpen = false"
        >
          <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>
