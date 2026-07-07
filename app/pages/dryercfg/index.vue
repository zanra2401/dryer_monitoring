<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { computedWithControl, useClipboard } from '@vueuse/core'
import { useDryerList } from '~/composable/useDryerList'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useDryerCRUD } from '~/composable/useDryerCRUD'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')


const toast = useToast()
const { copy } = useClipboard()
const router = useRouter()
const route = useRoute()

const { current_data, fetch_dryer_list, hasNext, hasPrev, error, pagination_data, next, prev, total_page } = useDryerList();

const { create_data, delete_dryer, edit_state, create_dryer, update_data, update_dryer, update_edit_state, create_state } = useDryerCRUD(fetch_dryer_list);

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
        update_edit_state(row.getValue('areaId'), row.getValue('name'));
      }
    },
    {
      label: 'Delete',
      onSelect() {
        delete_dryer(row.getValue('areaId'), toast);
      }
    },
  ]
}

</script>

<template>

  <AppSidebar :loading="current_data === null">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-lg font-medium">Dryer List</h1>
      <UButton class="dark:text-white light:text-black dark:bg-green-800 light:bg-yellow-50 cursor-pointer" @click="create_state = true" color="primary">Create Dryer</UButton>
    </div>
    <UTable :data="current_data.data" :columns="columns" class="flex-1" />
  </AppSidebar>

  <UModal v-model:open="edit_state">
    <template #content>
      <div class="p-3">
        <UFormField label="Area ID">
          <UInput v-model="update_data.area_id" class="flex" disabled/>
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="update_data.name" class="flex" />
        </UFormField>
      </div>
      <div class="flex justify-end gap-2 p-2">
        <UButton color="neutral" variant="ghost" @click="update_edit_state()">Cancel</UButton>
        <UButton color="primary" @click="update_dryer(toast)">Save</UButton>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="create_state">
    <template #content>
      <div class="p-3">
        <UFormField label="Name">
          <UInput v-model="create_data.name" class="flex" />
        </UFormField>
      </div>
      <div class="flex justify-end gap-2 p-2">
        <UButton color="neutral" variant="ghost" @click="() =>  { create_state = false}">Cancel</UButton>
        <UButton color="primary" @click="create_dryer(toast)">Save</UButton>
      </div>
    </template>
  </UModal>
  <Toast/>
</template>

