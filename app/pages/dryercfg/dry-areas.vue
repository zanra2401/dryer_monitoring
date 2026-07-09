<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRouter } from "vue-router";
import AppSidebar from "~/components/AppSidebar.vue";
import { useDryerList } from "~/composable/useDryerList";
import { useDryerCRUD } from "~/composable/useDryerCRUD";
import { useDryerAuth } from "~/composable/useDryerAuth";

type DryerRow = {
  areaId: string;
  name: string;
};

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UModal = resolveComponent("UModal");
const UCard = resolveComponent("UCard");
const UInput = resolveComponent("UInput");

const router = useRouter();
const toast = useToast();
const { user: sessionUser } = useDryerAuth();
const {
  current_data,
  fetch_dryer_list,
} = useDryerList();

const {
  create_data,
  update_data,
  update_dryer,
  create_dryer,
  edit_state,
  update_edit_state,
  delete_dryer,
  create_state
} = useDryerCRUD(fetch_dryer_list);

const columns: TableColumn<DryerRow>[] = [
  {
    accessorKey: "areaId",
    header: "Area ID",
    cell: ({ row }) => row.getValue("areaId"),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }) => h(
      UDropdownMenu,
      {
        content: {
          align: "end",
        },
        items: getRowItems(row),
        "aria-label": "Dry area actions",
      },
      () => h(UButton, {
        icon: "i-lucide-ellipsis-vertical",
        color: "neutral",
        variant: "ghost",
        "aria-label": "Dry area actions",
      }),
    ),
  },
];

function getRowItems(row: Row<DryerRow>) {
  const items = [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "View",
      icon: "i-lucide-arrow-right",
      onSelect() {
        router.push(`/dryercfg/dryer/${row.getValue("areaId")}`);
      },
    },
  ];

  if (sessionUser.value?.role === 'ADMIN') {
    items.push({
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect() {
        update_edit_state(Number(row.getValue("areaId")), String(row.getValue("name")));
      }
    });
    items.push({
      label: "Delete",
      icon: "i-lucide-trash",
      color: "error",
      onSelect() {
        if(confirm('Yakin menghapus area ini? Semua bin dan data terkait juga bisa terpengaruh!')) {
            delete_dryer(Number(row.getValue("areaId")), toast);
        }
      }
    });
  }

  return items;
}

onMounted(() => {
  fetch_dryer_list();
});

const openCreateModal = () => {
  create_state.value = true;
};
</script>

<template>
  <AppSidebar :loading="current_data === null">
    <div class="space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-highlighted">
            Dryer Areas
          </h1>
          <p class="text-sm text-muted">
            Review registered dryer areas and open each area workflow.
          </p>
        </div>
        
        <UButton
          v-if="sessionUser?.role === 'ADMIN'"
          icon="i-lucide-plus"
          label="Tambah Area Dryer"
          color="primary"
          @click="openCreateModal"
        />
      </div>

      <div class="rounded-lg border border-default bg-default">
        <UTable
          :data="current_data?.data ?? []"
          :columns="columns"
          empty="No dryer areas found"
          class="min-h-80"
        />
      </div>
    </div>

    <UModal 
      v-model:open="create_state" 
      title="Tambah Area Dryer"
      description="Masukkan nama area yang baru."
    >
      <template #body>
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-sm">Nama Area</label>
          <UInput v-model="create_data.name" placeholder="Contoh: Area A, Pabrik 1" />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="create_state = false">Batal</UButton>
          <UButton color="primary" @click="create_dryer(toast)">Simpan</UButton>
        </div>
      </template>
    </UModal>

    <UModal 
      v-model:open="edit_state"
      title="Edit Area Dryer"
      description="Ubah nama area dryer ini."
    >
      <template #body>
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-sm">Nama Area Baru</label>
          <UInput v-model="update_data.name" placeholder="Nama Baru" />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="update_edit_state(null, null)">Batal</UButton>
          <UButton color="primary" @click="update_dryer(toast)">Update Data</UButton>
        </div>
      </template>
    </UModal>
  </AppSidebar>
</template>
