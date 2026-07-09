<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { ColumnPinningState } from "@tanstack/vue-table";
import { useRouter } from "vue-router";
import Header from "~/components/Header.vue";
import GridLoader from "~/components/GridLoader.vue";
import { useDryerAuth } from "~/composable/useDryerAuth";
import { useDryerAreaOptions } from "~/composable/useDryerAreaOptions";
import { useBinOptions } from "~/composable/useBinOptions";
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
const { user: sessionUser } = useDryerAuth();
const lotTableColumnPinning = ref<ColumnPinningState>({
  right: ["actions"],
});

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
  options: dryerAreasRaw,
  loading: dryerAreasLoading,
  areaMap,
  fetch_dryer_area_options,
} = useDryerAreaOptions();

const {
  options: filterBinOptions,
  fetch_bin_options: fetchFilterBinOptions,
} = useBinOptions();

// Filter areas berdasarkan hak akses user
const dryerAreas = computed(() => {
  const allAreas = dryerAreasRaw.value || [];
  const isLimited = sessionUser.value?.role === "OPERATOR" || sessionUser.value?.role === "CLIENT";
  if (isLimited && sessionUser.value?.areaIds) {
    const allowed = sessionUser.value.areaIds;
    return allAreas.filter(area => allowed.includes(area.value));
  }
  return allAreas;
});

const isInitialLoading = ref(true);

const searchInput = ref("");

// Area Filter Selection
const areaFilterModel = ref<Array<{ value: number; label: string }>>([]);
const areaFilterItems = computed(() => {
  return [
    { value: ALL_AREA_FILTER_VALUE, label: "All Areas" },
    ...dryerAreas.value.map(area => ({ value: area.value, label: area.label })),
  ];
});
const areaFilterLabel = computed(() => {
  if (areaFilterModel.value.length === 0) return "All areas";
  if (areaFilterModel.value.length === dryerAreas.value.length) return "All areas";
  if (areaFilterModel.value.length === 1) return areaFilterModel.value[0].label;
  return `${areaFilterModel.value.length} areas`;
});

// Status Filter Selection
const statusFilterModel = ref<Array<{ value: LotStatus; label: string }>>([]);
const statusFilterItems = computed(() => {
  return [
    { value: ALL_STATUS_FILTER_VALUE, label: "All Statuses" },
    { value: "UPAIR" as const, label: "Up Air" },
    { value: "DOWNAIR" as const, label: "Down Air" },
    { value: "DRIED" as const, label: "Dried" },
  ];
});
const statusFilterLabel = computed(() => {
  if (statusFilterModel.value.length === 0) return "All statuses";
  if (statusFilterModel.value.length === LOT_STATUSES.length) return "All statuses";
  if (statusFilterModel.value.length === 1) return statusFilterModel.value[0].label;
  return `${statusFilterModel.value.length} statuses`;
});

// Bin Filter Selection
const binFilterModel = ref<Array<{ value: number; label: string }>>([]);
const binFilterItems = computed(() => {
  return [
    { value: ALL_BIN_FILTER_VALUE, label: "All Bins" },
    ...filterBinOptions.value.map((bin) => ({ value: bin.value, label: bin.label })),
  ];
});
const binFilterLabel = computed(() => {
  if (binFilterModel.value.length === 0) return "All bins";
  if (binFilterModel.value.length === filterBinOptions.value.length) return "All bins";
  if (binFilterModel.value.length === 1) return binFilterModel.value[0].label;
  return `${binFilterModel.value.length} bins`;
});

// Watch Area Filters to reload Bin Options
const activeAreaFilterIds = computed(() => {
  if (areaFilterModel.value.length === 0) {
    return dryerAreas.value.map((area) => area.value);
  }
  return areaFilterModel.value.map((area) => area.value);
});

async function refreshFilterBins(areaIds: number[]) {
  try {
    await fetchFilterBinOptions(areaIds.length > 0 ? areaIds : [0]);
    binFilterModel.value = binFilterModel.value.filter((model) =>
      filterBinOptions.value.some((bin) => bin.value === model.value)
    );
  } catch (error) {
    toast.add({
      title: "Failed to reload bins filter",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
}

watch(activeAreaFilterIds, async (newVal) => {
  await refreshFilterBins(newVal);
});

// Apply Search
async function applySearch() {
  await set_search(searchInput.value);
}

// Reset Filters
async function resetFilters() {
  searchInput.value = "";
  areaFilterModel.value = [];
  statusFilterModel.value = [];
  binFilterModel.value = [];
  
  const isLimited = sessionUser.value?.role === "OPERATOR" || sessionUser.value?.role === "CLIENT";
  const initialAreaIds = isLimited && sessionUser.value?.areaIds ? sessionUser.value.areaIds : [];
  
  filter_data.value.area_ids = initialAreaIds;
  filter_data.value.statuses = [];
  filter_data.value.bin_numbers = [];
  filter_data.value.search = "";
  
  pagination_data.value.offset = 0;
  await fetch_lot_list();
}

// Handle Filters Change
async function handleAreaFilterChange(val: any[]) {
  if (val.some((item) => item.value === ALL_AREA_FILTER_VALUE)) {
    areaFilterModel.value = [];
    const isLimited = sessionUser.value?.role === "OPERATOR" || sessionUser.value?.role === "CLIENT";
    const initialAreaIds = isLimited && sessionUser.value?.areaIds ? sessionUser.value.areaIds : [];
    await set_area_ids(initialAreaIds);
    return;
  }
  areaFilterModel.value = val;
  await set_area_ids(val.map((item) => item.value));
}

async function handleStatusFilterChange(val: any[]) {
  if (val.some((item) => item.value === ALL_STATUS_FILTER_VALUE)) {
    statusFilterModel.value = [];
    await set_statuses([]);
    return;
  }
  statusFilterModel.value = val;
  await set_statuses(val.map((item) => item.value));
}

async function handleBinFilterChange(val: any[]) {
  if (val.some((item) => item.value === ALL_BIN_FILTER_VALUE)) {
    binFilterModel.value = [];
    await set_bin_numbers([]);
    return;
  }
  binFilterModel.value = val;
  await set_bin_numbers(val.map((item) => item.value));
}

// Pagination Page Size
const pageSize = computed({
  get() {
    return String(pagination_data.value.limit);
  },
  set(val: string) {
    set_limit(Number(val) as LotPageSize);
  },
});
const pageSizeItems = LOT_PAGE_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: `${size} rows`,
}));

async function changePage(dir: "next" | "prev") {
  if (dir === "next") {
    await next();
  } else {
    await prev();
  }
}

// Helpers
const getAreaName = (areaId: number) => areaMap.value.get(areaId)?.name ?? `Area #${areaId}`;

const formatNumber = (val: any) => {
  if (val === null || val === undefined) return "-";
  const num = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(num) ? "-" : num.toLocaleString();
};

const formatDateTime = (isoString?: string | null) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusColors = {
  UPAIR: "success",
  DOWNAIR: "warning",
  DRIED: "neutral",
} as const;

const statusLabels = {
  UPAIR: "Up Air",
  DOWNAIR: "Down Air",
  DRIED: "Dried",
} as const;

const tableData = computed(() => current_data.value?.data || []);

function getRowItems(row: any) {
  const lot = row.original;
  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Lihat",
      icon: "i-lucide-eye",
      onSelect() {
        router.push(`/dryercfg/lot/${lot.lotId}`);
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
        th: "sticky right-0 z-20 w-12 min-w-12 bg-white dark:bg-gray-800 text-right shadow-[-12px_0_16px_-16px_rgba(15,23,42,0.45)]",
        td: "sticky right-0 z-20 w-12 min-w-12 bg-white dark:bg-gray-800 text-right shadow-[-12px_0_16px_-16px_rgba(15,23,42,0.45)]",
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
    
    // Set filter default agar terbatas areaIds jika limited role
    const isLimited = sessionUser.value?.role === "OPERATOR" || sessionUser.value?.role === "CLIENT";
    const initialAreaIds = isLimited && sessionUser.value?.areaIds ? sessionUser.value.areaIds : [];
    
    filter_data.value.area_ids = initialAreaIds;
    
    await refreshFilterBins(initialAreaIds);
    await fetch_lot_list();
  } catch (error) {
    toast.add({
      title: "Failed to load lot monitoring",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isInitialLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
    <Header />
    
    <main class="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div v-if="isInitialLoading" class="flex h-80 items-center justify-center">
        <GridLoader />
      </div>

      <div v-else class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Lot Monitoring & History
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Monitoring riwayat lot pengeringan pada area yang dapat diakses.
          </p>
        </div>

        <div class="rounded-lg border border-default bg-white dark:bg-gray-800 shadow-sm overflow-hidden w-full">
          <!-- Filters -->
          <div class="p-4 border-b border-default space-y-4">
            <div class="flex flex-col gap-3 md:flex-row">
              <UInput
                v-model="searchInput"
                icon="i-lucide-search"
                placeholder="Cari nomor lot, varietas hybrid, kualitas..."
                class="flex-1"
                @keyup.enter="applySearch"
              />

              <USelectMenu
                :model-value="areaFilterModel"
                :items="areaFilterItems"
                value-key="value"
                label-key="label"
                multiple
                placeholder="Semua Area"
                class="w-full md:w-56"
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
                placeholder="Semua Status"
                class="w-full md:w-48"
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
                placeholder="Semua Bin"
                class="w-full md:w-48"
                @update:model-value="handleBinFilterChange"
              >
                <template #default>
                  <span class="truncate text-sm">
                    {{ binFilterLabel }}
                  </span>
                </template>
              </USelectMenu>

              <div class="flex gap-2">
                <UButton
                  label="Cari"
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

          <!-- Table -->
          <UTable
            v-model:column-pinning="lotTableColumnPinning"
            :data="tableData"
            :columns="columns"
            :loading="listLoading"
            empty="Tidak ada lot ditemukan"
            class="min-h-80"
            :ui="{ base: 'min-w-[100rem]' }"
          />

          <!-- Pagination -->
          <div class="border-t border-default p-4 flex items-center justify-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              label="Prev"
              color="neutral"
              variant="outline"
              :disabled="!hasPrev || listLoading"
              @click="changePage('prev')"
            />
            <span class="min-w-16 text-center text-sm text-gray-500">
              {{ page }} / {{ total_page || 1 }}
            </span>
            <USelect
              v-model="pageSize"
              :items="pageSizeItems"
              value-key="value"
              label-key="label"
              class="w-24"
              :disabled="listLoading"
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

        <p v-if="listError" class="text-sm text-error">
          Gagal mengambil data lot. Silakan muat ulang halaman.
        </p>
      </div>
    </main>
  </div>
</template>
