<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRouter } from "vue-router";
import AppSidebar from "~/components/AppSidebar.vue";
import { useDryerList } from "~/composable/useDryerList";

type DryerRow = {
  areaId: string;
  name: string;
};

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const router = useRouter();
const {
  current_data,
  fetch_dryer_list,
} = useDryerList();

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
  return [
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
}

onMounted(() => {
  fetch_dryer_list();
});
</script>

<template>
  <AppSidebar :loading="current_data === null">
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">
          Dryer Areas
        </h1>
        <p class="text-sm text-muted">
          Review registered dryer areas and open each area workflow.
        </p>
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
  </AppSidebar>
</template>
