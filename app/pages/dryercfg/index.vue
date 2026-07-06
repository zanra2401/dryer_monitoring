<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { computedWithControl, useClipboard } from '@vueuse/core'
import { useDryerList } from '~/composable/useDryerList'
import GridLoader from '~/components/GridLoader.vue'
import { useRouter } from 'vue-router'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')


const toast = useToast()
const { copy } = useClipboard()
const router = useRouter()

const { current_data, fetch_dryer_list, hasNext, hasPrev, error, pagination_data, next, prev, total_page } = useDryerList();

fetch_dryer_list();

type Dryer = {
  areaId: string
  name: string
}

const columns: TableColumn<Dryer>[] = [
  {
    accessorKey: 'areaId',
    header: 'Area ID',
    cell: ({ row }) => {
      return row.getValue('areaId');
    }
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return row.getValue('name');
    }
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },
          items: getRowItems(row),
          'aria-label': 'Actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            'aria-label': 'Actions dropdown'
          })
      )
    }
  }
]

function    getRowItems(row: Row<Dryer>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'View',
      onSelect() {
        router.push(`/dryercfg/dryer/${row.getValue('areaId')}`);
      }
    },
    {
      label: "Edit",
      meta: {
        class: {
          th: 'text-right',
          td: 'text-right font-medium'
        }
      },
      onSelect() {
        toast.add({
          title: "data",
          color: 'success',
          icon: 'i-lucide-circle-check'
        })
      }
    },
    {
      label: 'Delete'
    },
  ]
}

const loading = computed(() => current_data === null);
</script>

<template>

  <AppSidebar :loading="current_data === null">
    <UTable :data="current_data.data" :columns="columns" class="flex-1" />
  </AppSidebar>
</template>

