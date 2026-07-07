// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui'
  ],
  css: ['~/assets/css/main.css'],
  icon: {
    clientBundle: {
      icons: [
        'lucide:arrow-left',
        'lucide:chevron-down',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:chevrons-up-down',
        'lucide:circle-alert',
        'lucide:circle-check',
        'lucide:download',
        'lucide:ellipsis-vertical',
        'lucide:file-spreadsheet',
        'lucide:filter',
        'lucide:inbox',
        'lucide:log-out',
        'lucide:moon',
        'lucide:panel-left',
        'lucide:pencil',
        'lucide:printer',
        'lucide:rotate-ccw',
        'lucide:save',
        'lucide:search',
        'lucide:sun',
        'lucide:sun-moon',
        'lucide:trash-2',
        'lucide:user-plus',
        'lucide:users',
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'zod',
      ],
    },
  },
})
