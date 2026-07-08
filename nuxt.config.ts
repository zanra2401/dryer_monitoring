// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    'nuxt-auth-utils',
  ],
  runtimeConfig: {
    authBypass: process.env.NUXT_AUTH_BYPASS !== 'false',
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'dryer-monitoring-dev-session-secret-minimum-32-chars',
    },
    public: {
      authBypass: (process.env.NUXT_PUBLIC_AUTH_BYPASS ?? process.env.NUXT_AUTH_BYPASS) !== 'false',
    },
  },
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
        'lucide:lock-keyhole',
        'lucide:log-out',
        'lucide:moon',
        'lucide:package-search',
        'lucide:panel-left',
        'lucide:pencil',
        'lucide:plus',
        'lucide:printer',
        'lucide:rotate-ccw',
        'lucide:save',
        'lucide:search',
        'lucide:shield-check',
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
        'html2canvas',
        'jspdf',
        'zod',
      ],
    },
  },
})
