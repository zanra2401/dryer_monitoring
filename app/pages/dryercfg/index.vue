<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRouter } from "vue-router";
import AppSidebar from "~/components/AppSidebar.vue";
import { useBinOptions } from "~/composable/useBinOptions";
import { useDryerAreaOptions } from "~/composable/useDryerAreaOptions";
import { useLotCRUD } from "~/composable/useLotCRUD";
import {
  LOT_PAGE_SIZE_OPTIONS,
  LOT_STATUSES,
  type LotPageSize,
  type LotRow,
  type LotStatus,
  useLotList,
} from "~/composable/useLotList";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const ALL_AREA_FILTER_VALUE = "__ALL_AREA_FILTER__" as const;
const ALL_STATUS_FILTER_VALUE = "__ALL_STATUS_FILTER__" as const;
const ALL_BIN_FILTER_VALUE = "__ALL_BIN_FILTER__" as const;

const router = useRouter();
const toast = useToast();

const {
  current_data,
  loading: listLoading,
  error: listError,
  pagination_data,
  filter_data,
  fetch_lot_list,
  set_area_ids,
  set_bin_numbers,
  set_limit,
  set_search,
  set_statuses,
  next,
  prev,
  hasNext,
  hasPrev,
  page,
  total_page,
} = useLotList();

const {
  options: dryerAreas,
  loading: dryerAreasLoading,
  areaMap,
  fetch_dryer_area_options,
} = useDryerAreaOptions();

const {
  options: filterBinOptions,
  fetch_bin_options: fetchFilterBinOptions,
} = useBinOptions();

const {
  options: createBinOptions,
  loading: createBinsLoading,
  fetch_bin_options: fetchCreateBinOptions,
} = useBinOptions();

const {
  create_data,
  loading: crudLoading,
  create_lot,
  delete_lot,
  reset_create_data,
} = useLotCRUD(fetch_lot_list);

const statusLabels: Record<LotStatus, string> = {
  UPAIR: "Up Air",
  DOWNAIR: "Down Air",
  DRIED: "Dried",
};

const statusColors: Record<LotStatus, "warning" | "info" | "success"> = {
  UPAIR: "warning",
  DOWNAIR: "info",
  DRIED: "success",
};
const numberInputProps = {
  locale: "en-US",
  formatOptions: {
    maximumFractionDigits: 2,
  },
} as const;

const searchInput = ref("");
const selectedAreaIds = ref<number[]>([]);
const selectedStatuses = ref<LotStatus[]>([]);
const selectedBinNumbers = ref<number[]>([]);
const pageSize = ref<LotPageSize>(10);
const isCreateOpen = ref(false);
const isDeleteOpen = ref(false);
const isCreateConfirmOpen = ref(false);
const selectedLot = ref<LotRow | null>(null);

type AreaFilterValue = number | typeof ALL_AREA_FILTER_VALUE;
type StatusFilterValue = LotStatus | typeof ALL_STATUS_FILTER_VALUE;
type BinFilterValue = number | typeof ALL_BIN_FILTER_VALUE;

const areaFilterItems = computed(() => [
  { label: "ALL", value: ALL_AREA_FILTER_VALUE },
  ...dryerAreas.value,
]);

const statusFilterItems = [
  { label: "ALL", value: ALL_STATUS_FILTER_VALUE },
  ...LOT_STATUSES.map((status) => ({
    label: statusLabels[status],
    value: status,
  })),
];

const lotStatusItems = LOT_STATUSES.map((status) => ({
  label: statusLabels[status],
  value: status,
}));

const pageSizeItems = LOT_PAGE_SIZE_OPTIONS.map((size) => ({
  label: `${size}`,
  value: size,
}));

const binFilterItems = computed(() => [
  { label: "ALL", value: ALL_BIN_FILTER_VALUE },
  ...filterBinOptions.value.map((option) => ({
    label: option.label,
    value: option.value,
  })),
]);

const tableData = computed(() => current_data.value?.data ?? []);
const isInitialLoading = computed(() => listLoading.value && current_data.value === null);
const areaFilterModel = computed<AreaFilterValue[]>(() => {
  return selectedAreaIds.value.length === 0 ? [ALL_AREA_FILTER_VALUE] : selectedAreaIds.value;
});
const statusFilterModel = computed<StatusFilterValue[]>(() => {
  return selectedStatuses.value.length === 0 ? [ALL_STATUS_FILTER_VALUE] : selectedStatuses.value;
});
const binFilterModel = computed<BinFilterValue[]>(() => {
  return selectedBinNumbers.value.length === 0 ? [ALL_BIN_FILTER_VALUE] : selectedBinNumbers.value;
});

const areaFilterLabel = computed(() => {
  if (selectedAreaIds.value.length === 0) {
    return "All areas";
  }

  if (selectedAreaIds.value.length === 1) {
    return dryerAreas.value.find((item) => item.value === selectedAreaIds.value[0])?.label ?? `Area #${selectedAreaIds.value[0]}`;
  }

  return `${selectedAreaIds.value.length} areas`;
});

const statusFilterLabel = computed(() => {
  if (selectedStatuses.value.length === 0) {
    return "All statuses";
  }

  if (selectedStatuses.value.length === 1) {
    const status = selectedStatuses.value[0];
    return status ? statusLabels[status] : "All statuses";
  }

  return `${selectedStatuses.value.length} statuses`;
});

const binFilterLabel = computed(() => {
  if (selectedBinNumbers.value.length === 0) {
    return "All bins";
  }

  if (selectedBinNumbers.value.length === 1) {
    return filterBinOptions.value.find((item) => item.value === selectedBinNumbers.value[0])?.label ?? `Bin ${selectedBinNumbers.value[0]}`;
  }

  return `${selectedBinNumbers.value.length} bins`;
});

const createAreaIdModel = computed<number | undefined>({
  get: () => create_data.value.area_id ?? undefined,
  set: (value) => {
    create_data.value.area_id = value ?? null;
  },
});

const createBinNumberModel = computed<number | undefined>({
  get: () => create_data.value.bin_number ?? undefined,
  set: (value) => {
    create_data.value.bin_number = value ?? null;
  },
});

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      data?: { error?: string; message?: string };
      statusMessage?: string;
      message?: string;
    };

    return maybeError.data?.error || maybeError.data?.message || maybeError.statusMessage || maybeError.message || "Unknown error";
  }

  return "Unknown error";
};

const formatNumber = (value: LotRow["netToBin"]) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(parsed);
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getAreaName = (areaId: number) => areaMap.value.get(areaId)?.name ?? `Area #${areaId}`;

const normalizeAreaSelection = (areaIds: number[]) => [...new Set(areaIds)].sort((left, right) => left - right);
const normalizeStatusSelection = (statuses: LotStatus[]) => [...new Set(statuses)];
const normalizeNumberSelection = (numbers: number[]) => [...new Set(numbers)].sort((left, right) => left - right);
const normalizeModelArray = <T,>(value: unknown) => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value as T];
};

const resolveAllSelection = <T>(currentValues: T[], nextValues: Array<T | string>, allValue: string) => {
  if (nextValues.includes(allValue)) {
    return currentValues.length === 0
      ? nextValues.filter((item): item is T => item !== allValue)
      : [];
  }

  return nextValues as T[];
};

const resolveAreaIdsForBins = (areaIds: number[]) => {
  return areaIds.length > 0 ? areaIds : dryerAreas.value.map((area) => area.value);
};

const refreshFilterBins = async (areaIds: number[]) => {
  const resolvedAreaIds = resolveAreaIdsForBins(areaIds);

  if (resolvedAreaIds.length === 0) {
    filterBinOptions.value = [];
    selectedBinNumbers.value = [];
    filter_data.value.bin_numbers = [];
    return;
  }

  await fetchFilterBinOptions(resolvedAreaIds, true);

  const availableBinNumbers = new Set(filterBinOptions.value.map((option) => option.value));
  const nextSelectedBinNumbers = selectedBinNumbers.value.filter((value) => availableBinNumbers.has(value));

  if (nextSelectedBinNumbers.length !== selectedBinNumbers.value.length) {
    selectedBinNumbers.value = nextSelectedBinNumbers;
    filter_data.value.bin_numbers = [...nextSelectedBinNumbers];
  }
};

const applyAreaFilter = async () => {
  selectedAreaIds.value = normalizeAreaSelection(selectedAreaIds.value);

  try {
    await refreshFilterBins(selectedAreaIds.value);
    await set_area_ids(selectedAreaIds.value);
  } catch (error) {
    toast.add({
      title: "Failed to filter lots",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleAreaFilterChange = async (value: unknown) => {
  selectedAreaIds.value = normalizeAreaSelection(
    resolveAllSelection(selectedAreaIds.value, normalizeModelArray<AreaFilterValue>(value), ALL_AREA_FILTER_VALUE),
  );
  await applyAreaFilter();
};

const applySearch = async () => {
  try {
    await set_search(searchInput.value.trim());
  } catch (error) {
    toast.add({
      title: "Failed to search lots",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const applyStatusFilter = async () => {
  try {
    await set_statuses(selectedStatuses.value);
  } catch (error) {
    toast.add({
      title: "Failed to filter lots",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleStatusFilterChange = async (value: unknown) => {
  selectedStatuses.value = normalizeStatusSelection(
    resolveAllSelection(selectedStatuses.value, normalizeModelArray<StatusFilterValue>(value), ALL_STATUS_FILTER_VALUE),
  );
  await applyStatusFilter();
};

const applyBinFilter = async () => {
  selectedBinNumbers.value = normalizeNumberSelection(selectedBinNumbers.value);

  try {
    await set_bin_numbers(selectedBinNumbers.value);
  } catch (error) {
    toast.add({
      title: "Failed to filter bins",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleBinFilterChange = async (value: unknown) => {
  selectedBinNumbers.value = normalizeNumberSelection(
    resolveAllSelection(selectedBinNumbers.value, normalizeModelArray<BinFilterValue>(value), ALL_BIN_FILTER_VALUE),
  );
  await applyBinFilter();
};

const changePageSize = async (value: unknown) => {
  const parsedValue = Number(value);

  if (LOT_PAGE_SIZE_OPTIONS.includes(parsedValue as LotPageSize)) {
    pageSize.value = parsedValue as LotPageSize;
  }

  try {
    await set_limit(pageSize.value);
  } catch (error) {
    toast.add({
      title: "Failed to change page size",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const resetFilters = async () => {
  searchInput.value = "";
  selectedAreaIds.value = [];
  selectedStatuses.value = [];
  selectedBinNumbers.value = [];
  filter_data.value.search = "";
  filter_data.value.area_ids = [];
  filter_data.value.statuses = [];
  filter_data.value.bin_numbers = [];
  pagination_data.value.offset = 0;
  await refreshFilterBins([]);
  await fetch_lot_list();
};

const openCreateModal = async () => {
  reset_create_data();
  createBinOptions.value = [];
  isCreateConfirmOpen.value = false;

  const selectedAreaId = selectedAreaIds.value[0];
  if (selectedAreaIds.value.length === 1 && selectedAreaId !== undefined) {
    create_data.value.area_id = selectedAreaId;
    await fetchCreateBinOptions([selectedAreaId]);
  }

  isCreateOpen.value = true;
};

const openDeleteModal = (lot: LotRow) => {
  selectedLot.value = lot;
  isDeleteOpen.value = true;
};

const handleCreate = async () => {
  try {
    await create_lot();
    isCreateOpen.value = false;
    toast.add({
      title: "Lot created",
      description: "The lot data has been saved.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to create lot",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleDelete = async () => {
  if (!selectedLot.value) {
    return;
  }

  try {
    await delete_lot(selectedLot.value.lotId);
    isDeleteOpen.value = false;
    selectedLot.value = null;
    toast.add({
      title: "Lot deleted",
      description: "The lot and its related logs have been removed.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to delete lot",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const requestCreateConfirmation = () => {
  isCreateConfirmOpen.value = true;
};

const changePage = async (direction: "next" | "prev") => {
  try {
    if (direction === "next") {
      await next();
      return;
    }

    await prev();
  } catch (error) {
    toast.add({
      title: "Failed to change page",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

watch(
  () => create_data.value.area_id,
  async (areaId) => {
    if (!areaId) {
      create_data.value.bin_number = null;
      createBinOptions.value = [];
      return;
    }

    try {
      await fetchCreateBinOptions([areaId]);

      if (!createBinOptions.value.some((option) => option.value === create_data.value.bin_number)) {
        create_data.value.bin_number = null;
      }
    } catch (error) {
      toast.add({
        title: "Failed to load bins",
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-circle-alert",
      });
    }
  },
);

function getRowItems(row: Row<LotRow>) {
  const lot = row.original;

  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Detail",
      icon: "i-lucide-pencil",
      onSelect() {
        router.push(`/dryercfg/lot/${lot.lotId}`);
      },
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect() {
        openDeleteModal(lot);
      },
    },
  ];
}

const columns: TableColumn<LotRow>[] = [
  {
    id: "rowNumber",
    header: "No.",
    cell: ({ row }) => `${pagination_data.value.offset + row.index + 1}`,
  },
  {
    accessorKey: "lotNumber",
    header: "Lot Number",
    cell: ({ row }) => h("span", { class: "font-medium text-highlighted" }, row.original.lotNumber),
  },
  {
    accessorKey: "areaId",
    header: "Dry Area",
    cell: ({ row }) => getAreaName(row.original.areaId),
  },
  {
    accessorKey: "binNumber",
    header: "Bin",
    cell: ({ row }) => `Bin ${row.original.binNumber}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return h(UBadge, { color: statusColors[status], variant: "subtle" }, () => statusLabels[status]);
    },
  },
  {
    accessorKey: "hybrid",
    header: "Hybrid",
    cell: ({ row }) => row.original.hybrid || "-",
  },
  {
    accessorKey: "quality",
    header: "Quality",
    cell: ({ row }) => row.original.quality || "-",
  },
  {
    accessorKey: "netToBin",
    header: "Net To Bin",
    cell: ({ row }) => formatNumber(row.original.netToBin),
  },
  {
    accessorKey: "initialMc",
    header: "Initial MC",
    cell: ({ row }) => formatNumber(row.original.initialMc),
  },
  {
    accessorKey: "depth",
    header: "Depth",
    cell: ({ row }) => formatNumber(row.original.depth),
  },
  {
    accessorKey: "downAirAt",
    header: "Down Air At",
    cell: ({ row }) => formatDateTime(row.original.downAirAt),
  },
  {
    accessorKey: "downMC",
    header: "Down MC",
    cell: ({ row }) => formatNumber(row.original.downMC),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => formatDateTime(row.original.startTime),
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => formatDateTime(row.original.endTime),
  },
  {
    accessorKey: "endMC",
    header: "End MC",
    cell: ({ row }) => formatNumber(row.original.endMC),
  },
  {
    id: "actions",
    meta: {
      class: {
        th: "text-right",
        td: "text-right",
      },
    },
    cell: ({ row }) => h(
      UDropdownMenu,
      {
        content: { align: "end" },
        items: getRowItems(row),
        "aria-label": "Lot actions",
      },
      () => h(UButton, {
        icon: "i-lucide-ellipsis-vertical",
        color: "neutral",
        variant: "ghost",
        "aria-label": "Lot actions",
      }),
    ),
  },
];

onMounted(async () => {
  try {
    await fetch_dryer_area_options();
    await refreshFilterBins([]);
    await fetch_lot_list();
  } catch (error) {
    toast.add({
      title: "Failed to load lot management",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
});
</script>

<template>
  <AppSidebar :loading="isInitialLoading">
    <div class="min-w-0 w-full space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-highlighted">
            Lot Management
          </h1>
          <p class="text-sm text-muted">
            Manage lot records across dryer areas and open each lot for detailed log maintenance.
          </p>
        </div>

        <UButton
          icon="i-lucide-plus"
          label="Create Lot"
          color="primary"
          @click="openCreateModal"
        />
      </div>

      <div class="min-w-0 overflow-hidden rounded-lg border border-default bg-default">
        <div class="space-y-4 border-b border-default p-4">
          <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row">
              <UInput
                v-model="searchInput"
                icon="i-lucide-search"
                placeholder="Search lot number, hybrid, or quality"
                class="min-w-0 flex-1"
                @keyup.enter="applySearch"
              />

              <USelectMenu
                :model-value="areaFilterModel"
                :items="areaFilterItems"
                value-key="value"
                label-key="label"
                multiple
                placeholder="All areas"
                class="w-full xl:w-56"
                @update:model-value="handleAreaFilterChange"
              >
                <template #default>
                  <span class="truncate text-sm">
                    {{ areaFilterLabel }}
                  </span>
                </template>
              </USelectMenu>

              <USelectMenu
                :model-value="statusFilterModel"
                :items="statusFilterItems"
                value-key="value"
                label-key="label"
                multiple
                placeholder="All statuses"
                class="w-full xl:w-48"
                :search-input="false"
                @update:model-value="handleStatusFilterChange"
              >
                <template #default>
                  <span class="truncate text-sm">
                    {{ statusFilterLabel }}
                  </span>
                </template>
              </USelectMenu>

              <USelectMenu
                :model-value="binFilterModel"
                :items="binFilterItems"
                value-key="value"
                label-key="label"
                multiple
                placeholder="All bins"
                class="w-full xl:w-48"
                @update:model-value="handleBinFilterChange"
              >
                <template #default>
                  <span class="truncate text-sm">
                    {{ binFilterLabel }}
                  </span>
                </template>
              </USelectMenu>
            </div>

            <div class="flex gap-2">
              <UButton
                label="Search"
                icon="i-lucide-filter"
                color="neutral"
                variant="soft"
                :loading="listLoading"
                @click="applySearch"
              />
              <UButton
                icon="i-lucide-rotate-ccw"
                color="neutral"
                variant="ghost"
                aria-label="Reset filters"
                @click="resetFilters"
              />
            </div>
          </div>
        </div>

        <div class="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
          <div class="inline-block min-w-[108rem] align-top">
            <UTable
              :data="tableData"
              :columns="columns"
              :loading="listLoading"
              empty="No lots found"
              class="min-h-80"
            />
          </div>
        </div>

        <div class="border-t border-default p-4">
          <div class="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              label="Prev"
              color="neutral"
              variant="outline"
              :disabled="!hasPrev || listLoading"
              @click="changePage('prev')"
            />
            <span class="min-w-16 text-center text-sm text-muted">
              {{ page }} / {{ total_page || 1 }}
            </span>
            <USelect
              v-model="pageSize"
              :items="pageSizeItems"
              value-key="value"
              label-key="label"
              class="w-20"
              :disabled="listLoading"
              @update:model-value="changePageSize"
            />
            <UButton
              trailing-icon="i-lucide-chevron-right"
              label="Next"
              color="neutral"
              variant="outline"
              :disabled="!hasNext || listLoading"
              @click="changePage('next')"
            />
          </div>
        </div>
      </div>

      <p v-if="listError" class="text-sm text-error">
        {{ getErrorMessage(listError) }}
      </p>
    </div>

    <UModal
      v-model:open="isCreateOpen"
      title="Create Lot"
      description="Register a lot and place it into the correct dryer bin."
    >
      <template #body>
        <form id="create-lot-form" class="space-y-4" @submit.prevent="handleCreate">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Lot Number" required>
              <UInput v-model="create_data.lot_number" autocomplete="off" class="w-full" />
            </UFormField>

            <UFormField label="Status" required>
              <USelect
                v-model="create_data.status"
                :items="lotStatusItems"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Dryer Area" required>
              <USelect
                v-model="createAreaIdModel"
                :items="dryerAreas"
                value-key="value"
                label-key="label"
                placeholder="Select dryer area"
                class="w-full"
                :loading="dryerAreasLoading"
              />
            </UFormField>

            <UFormField label="Bin" required>
              <USelect
                v-model="createBinNumberModel"
                :items="createBinOptions"
                value-key="value"
                label-key="label"
                placeholder="Select bin"
                class="w-full"
                :loading="createBinsLoading"
                :disabled="!create_data.area_id"
              />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Hybrid">
              <UInput v-model="create_data.hybrid" autocomplete="off" class="w-full" />
            </UFormField>

            <UFormField label="Quality">
              <UInput v-model="create_data.quality" autocomplete="off" class="w-full" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <UFormField label="Net To Bin">
              <UInputNumber v-model="create_data.net_to_bin" v-bind="numberInputProps" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="Initial MC">
              <UInputNumber v-model="create_data.initial_mc" v-bind="numberInputProps" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="Depth (Meter)">
              <UInputNumber v-model="create_data.depth" v-bind="numberInputProps" :step="0.01" class="w-full" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <UFormField label="Down Air At">
              <UInput v-model="create_data.down_air_at" type="datetime-local" class="w-full" />
            </UFormField>

            <UFormField label="Down MC">
              <UInputNumber v-model="create_data.down_mc" v-bind="numberInputProps" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="End MC">
              <UInputNumber v-model="create_data.end_mc" v-bind="numberInputProps" :step="0.01" class="w-full" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Start Time" required>
              <UInput v-model="create_data.start_time" type="datetime-local" class="w-full" />
            </UFormField>

            <UFormField label="End Time">
              <UInput v-model="create_data.end_time" type="datetime-local" class="w-full" />
            </UFormField>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="crudLoading"
            @click="isCreateOpen = false"
          />
          <UButton
            label="Create Lot"
            icon="i-lucide-save"
            :loading="crudLoading"
            @click="requestCreateConfirmation"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isCreateConfirmOpen"
      title="Confirm Create Lot"
      description="Please confirm before creating this lot."
    >
      <template #body>
        <div class="space-y-3 text-sm">
          <p class="text-toned">
            Create lot
            <span class="font-medium text-highlighted">{{ create_data.lot_number || "-" }}</span>
            in area
            <span class="font-medium text-highlighted">{{ create_data.area_id || "-" }}</span>
            / bin
            <span class="font-medium text-highlighted">{{ create_data.bin_number || "-" }}</span>?
          </p>
          <p class="text-muted">
            The lot will be added to lot management and immediately available for detail log maintenance.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" :disabled="crudLoading" @click="isCreateConfirmOpen = false" />
          <UButton type="submit" form="create-lot-form" label="Confirm Create" icon="i-lucide-save" :loading="crudLoading" @click="isCreateConfirmOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteOpen"
      title="Delete Lot"
      description="This action cannot be undone."
    >
      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-toned">
            Delete
            <span class="font-medium text-highlighted">
              {{ selectedLot?.lotNumber }}
            </span>
            from lot management?
          </p>
          <p class="text-sm text-muted">
            Related log records will be deleted together with the selected lot.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="crudLoading"
            @click="isDeleteOpen = false"
          />
          <UButton
            label="Delete Lot"
            icon="i-lucide-trash-2"
            color="error"
            :loading="crudLoading"
            @click="handleDelete"
          />
        </div>
      </template>
    </UModal>
  </AppSidebar>
</template>
