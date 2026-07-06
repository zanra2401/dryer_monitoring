<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <AppSidebar :menu-items="menuItems" />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h1>
          
          <div class="flex items-center gap-3">
            <UColorModeSwitch />
            <UAvatar size="sm" alt="User" />
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Simple menu items
const menuItems = [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/dashboard'
  },
  {
    label: 'Dryer Configuration',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/dryercfg'
  },
  {
    label: 'Monitoring',
    icon: 'i-heroicons-chart-bar-square',
    to: '/monitoring'
  },
  {
    label: 'Users',
    icon: 'i-heroicons-users',
    to: '/users'
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-8-tooth',
    to: '/settings'
  }
]

// Dynamic page title
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dryercfg': 'Dryer Configuration',
    '/dashboard': 'Dashboard',
    '/monitoring': 'Monitoring',
    '/users': 'Users',
    '/settings': 'Settings'
  }
  
  // Check for exact match or partial match
  for (const [path, title] of Object.entries(titles)) {
    if (route.path === path || route.path.startsWith(path + '/')) {
      return title
    }
  }
  
  return 'Dryer Monitor'
})
</script>