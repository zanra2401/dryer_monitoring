<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "~/components/AppSidebar.vue";
import { useBinOptions } from "~/composable/useBinOptions";
import { useDryerAreaOptions } from "~/composable/useDryerAreaOptions";
import { useLogCRUD } from "~/composable/useLogCRUD";
import { useLotReportExport } from "~/composable/useLotReportExport";
import {
  LOG_PAGE_SIZE_OPTIONS,
  type LogPageSize,
  type LogRow,
  useLogList,
} from "~/composable/useLogList";
import { LOT_STATUSES, type LotRow, type LotStatus } from "~/composable/useLotList";
import { useLotCRUD } from "~/composable/useLotCRUD";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { export_excel, export_pdf } = useLotReportExport();

const lotId = computed(() => Number(route.params.lotId));

const {
  options: dryerAreas,
  loading: dryerAreasLoading,
  areaMap,
  fetch_dryer_area_options,
} = useDryerAreaOptions();

const {
  options: detailBinOptions,
  loading: detailBinsLoading,
  fetch_bin_options: fetchDetailBinOptions,
} = useBinOptions();

const {
  update_data,
  loading: lotCrudLoading,
  fetch_lot_detail,
  prepare_update_lot,
  update_lot,
  delete_lot,
} = useLotCRUD();

const {
  current_data: logCurrentData,
  loading: logListLoading,
  error: logListError,
  pagination_data: logPagination,
  fetch_log_list,
  next: nextLogPage,
  prev: prevLogPage,
  hasNext: hasNextLogPage,
  hasPrev: hasPrevLogPage,
  page: logPage,
  total_page: totalLogPage,
  set_limit: setLogLimit,
} = useLogList();

async function refreshLogs() {
  if (!Number.isInteger(lotId.value) || lotId.value <= 0) {
    throw new Error("Invalid lot id");
  }

  return fetch_log_list(lotId.value);
}

const {
  create_data: createLogData,
  update_data: updateLogData,
  loading: logCrudLoading,
  create_log,
  update_log,
  delete_log,
  prepare_update_log,
  reset_create_data,
} = useLogCRUD(refreshLogs);

const lot = ref<LotRow | null>(null);
const detailError = ref<string | null>(null);
const initialLoading = ref(true);
const isDeleteLotOpen = ref(false);
const isCreateLogOpen = ref(false);
const isEditLogOpen = ref(false);
const isDeleteLogOpen = ref(false);
const isUpdateLotConfirmOpen = ref(false);
const isCreateLogConfirmOpen = ref(false);
const isEditLogConfirmOpen = ref(false);
const selectedLog = ref<LogRow | null>(null);
const logPageSize = ref<LogPageSize>(10);

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

const lotStatusItems = LOT_STATUSES.map((status) => ({
  label: statusLabels[status],
  value: status,
}));

const logPageSizeItems = LOG_PAGE_SIZE_OPTIONS.map((size) => ({
  label: `${size}`,
  value: size,
}));

const logTableData = computed(() => logCurrentData.value?.data ?? []);
const logTotalCount = computed(() => logCurrentData.value?.totalCount ?? 0);

const isInitialLoading = computed(() => initialLoading.value && lot.value === null);

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

const formatNumber = (value: number | string | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
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

const toDateTimeLocalInput = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getAreaName = (areaId: number) => areaMap.value.get(areaId)?.name ?? `Area #${areaId}`;

async function refreshLotDetail() {
  if (!Number.isInteger(lotId.value) || lotId.value <= 0) {
    throw new Error("Invalid lot id");
  }

  detailError.value = null;

  try {
    const result = await fetch_lot_detail(lotId.value);
    lot.value = result;
    prepare_update_lot(result);
    return result;
  } catch (error) {
    detailError.value = getErrorMessage(error);
    throw error;
  }
}

const handleUpdateLot = async () => {
  try {
    await update_lot();
    await refreshLotDetail();
    toast.add({
      title: "Lot updated",
      description: "The lot information has been saved.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to update lot",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleDeleteLot = async () => {
  if (!lot.value) {
    return;
  }

  try {
    await delete_lot(lot.value.lotId);
    toast.add({
      title: "Lot deleted",
      description: "The lot and its related logs have been removed.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
    router.push("/dryercfg");
  } catch (error) {
    toast.add({
      title: "Failed to delete lot",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const requestLotUpdateConfirmation = () => {
  isUpdateLotConfirmOpen.value = true;
};

const openCreateLogModal = () => {
  reset_create_data(lotId.value);
  createLogData.value.timestamp_thingspeak = toDateTimeLocalInput(new Date());
  createLogData.value.status_bin = lot.value?.status ?? "UPAIR";
  isCreateLogConfirmOpen.value = false;
  isCreateLogOpen.value = true;
};

const openEditLogModal = (log: LogRow) => {
  selectedLog.value = log;
  prepare_update_log(log);
  isEditLogConfirmOpen.value = false;
  isEditLogOpen.value = true;
};

const openDeleteLogModal = (log: LogRow) => {
  selectedLog.value = log;
  isDeleteLogOpen.value = true;
};

const handleCreateLog = async () => {
  try {
    await create_log();
    isCreateLogOpen.value = false;
    toast.add({
      title: "Log created",
      description: "The log entry has been saved.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to create log",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleUpdateLog = async () => {
  try {
    await update_log();
    isEditLogOpen.value = false;
    selectedLog.value = null;
    toast.add({
      title: "Log updated",
      description: "The log entry has been saved.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to update log",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleDeleteLog = async () => {
  if (!selectedLog.value) {
    return;
  }

  try {
    await delete_log(selectedLog.value.logId);
    isDeleteLogOpen.value = false;
    selectedLog.value = null;
    toast.add({
      title: "Log deleted",
      description: "The log entry has been removed.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to delete log",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const requestCreateLogConfirmation = () => {
  isCreateLogConfirmOpen.value = true;
};

const requestEditLogConfirmation = () => {
  isEditLogConfirmOpen.value = true;
};

const changeLogPage = async (direction: "next" | "prev") => {
  try {
    if (direction === "next") {
      await nextLogPage();
      return;
    }

    await prevLogPage();
  } catch (error) {
    toast.add({
      title: "Failed to change page",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const changeLogPageSize = async () => {
  try {
    await setLogLimit(logPageSize.value);
  } catch (error) {
    toast.add({
      title: "Failed to change page size",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleExportExcel = () => {
  if (!lot.value) {
    return;
  }

  export_excel(lot.value.lotId);
};

const handleExportPdf = () => {
  if (!lot.value) {
    return;
  }

  export_pdf(lot.value.lotId);
};

watch(
  () => update_data.value.area_id,
  async (areaId) => {
    if (!areaId) {
      detailBinOptions.value = [];
      update_data.value.bin_number = null;
      return;
    }

    try {
      await fetchDetailBinOptions([areaId]);

      if (!detailBinOptions.value.some((option) => option.value === update_data.value.bin_number)) {
        update_data.value.bin_number = null;
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

function getLogRowItems(row: Row<LogRow>) {
  const log = row.original;

  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect() {
        openEditLogModal(log);
      },
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect() {
        openDeleteLogModal(log);
      },
    },
  ];
}

const logColumns: TableColumn<LogRow>[] = [
  {
    id: "rowNumber",
    header: "No.",
    cell: ({ row }) => `${logPagination.value.offset + row.index + 1}`,
  },
  {
    accessorKey: "timestampThingspeak",
    header: "Timestamp",
    cell: ({ row }) => formatDateTime(row.original.timestampThingspeak),
  },
  {
    accessorKey: "statusBin",
    header: "Status Bin",
    cell: ({ row }) => row.original.statusBin,
  },
  {
    accessorKey: "tempTop",
    header: "Temp Top",
    cell: ({ row }) => formatNumber(row.original.tempTop),
  },
  {
    accessorKey: "rhTop",
    header: "RH Top",
    cell: ({ row }) => formatNumber(row.original.rhTop),
  },
  {
    accessorKey: "tempBottom",
    header: "Temp Bottom",
    cell: ({ row }) => formatNumber(row.original.tempBottom),
  },
  {
    accessorKey: "rhBottom",
    header: "RH Bottom",
    cell: ({ row }) => formatNumber(row.original.rhBottom),
  },
  {
    accessorKey: "mc",
    header: "MC",
    cell: ({ row }) => formatNumber(row.original.mc),
  },
  {
    accessorKey: "checkerName",
    header: "Checker Name",
    cell: ({ row }) => row.original.checkerName || "-",
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
        items: getLogRowItems(row),
        "aria-label": "Log actions",
      },
      () => h(UButton, {
        icon: "i-lucide-ellipsis-vertical",
        color: "neutral",
        variant: "ghost",
        "aria-label": "Log actions",
      }),
    ),
  },
];

onMounted(async () => {
  initialLoading.value = true;

  try {
    if (!Number.isInteger(lotId.value) || lotId.value <= 0) {
      throw new Error("Invalid lot id");
    }

    await fetch_dryer_area_options();
    await Promise.all([
      refreshLotDetail(),
      refreshLogs(),
    ]);
  } catch (error) {
    toast.add({
      title: "Failed to load lot detail",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    initialLoading.value = false;
  }
});
</script>

<template>
  <AppSidebar :loading="isInitialLoading">
    <div class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <UButton
            icon="i-lucide-arrow-left"
            label="Back to Lots"
            color="neutral"
            variant="ghost"
            @click="router.push('/dryercfg')"
          />

          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-semibold text-highlighted">
                {{ lot ? `Lot ${lot.lotNumber}` : "Lot Detail" }}
              </h1>

              <UBadge
                v-if="lot"
                :color="statusColors[lot.status]"
                variant="subtle"
              >
                {{ statusLabels[lot.status] }}
              </UBadge>
            </div>

            <p class="text-sm text-muted">
              Edit lot information and maintain the full history of monitoring logs for this lot.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            label="Export Excel"
            icon="i-lucide-file-spreadsheet"
            color="neutral"
            variant="outline"
            :disabled="!lot"
            @click="handleExportExcel"
          />
          <UButton
            label="Export PDF"
            icon="i-lucide-printer"
            color="neutral"
            variant="outline"
            :disabled="!lot"
            @click="handleExportPdf"
          />
          <UButton
            label="Delete Lot"
            icon="i-lucide-trash-2"
            color="error"
            variant="soft"
            :disabled="!lot"
            @click="isDeleteLotOpen = true"
          />
          <UButton
            label="Save Changes"
            icon="i-lucide-save"
            :loading="lotCrudLoading"
            :disabled="!lot"
            @click="requestLotUpdateConfirmation"
          />
        </div>
      </div>

      <div v-if="detailError" class="rounded-lg border border-error/50 bg-error/10 p-4 text-sm text-error">
        {{ detailError }}
      </div>

      <div v-if="lot" class="space-y-4">
        <section class="rounded-lg border border-default bg-default">
          <div class="grid gap-3 border-b border-default p-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-lg border border-default p-3">
              <p class="text-xs uppercase tracking-wide text-muted">
                Dryer Area
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                {{ getAreaName(lot.areaId) }}
              </p>
            </div>

            <div class="rounded-lg border border-default p-3">
              <p class="text-xs uppercase tracking-wide text-muted">
                Bin
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                Bin {{ lot.binNumber }}
              </p>
            </div>

            <div class="rounded-lg border border-default p-3">
              <p class="text-xs uppercase tracking-wide text-muted">
                Created By
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                {{ lot.createdBy ? `User #${lot.createdBy}` : "-" }}
              </p>
            </div>

            <div class="rounded-lg border border-default p-3">
              <p class="text-xs uppercase tracking-wide text-muted">
                Logs
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                {{ logTotalCount }}
              </p>
            </div>
          </div>

          <div class="space-y-4 p-4">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <UFormField label="Lot Number" required>
                <UInput v-model="update_data.lot_number" class="w-full" />
              </UFormField>

              <UFormField label="Status" required>
                <USelect
                  v-model="update_data.status"
                  :items="lotStatusItems"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Dryer Area" required>
                <USelect
                  v-model="update_data.area_id"
                  :items="dryerAreas"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                  :loading="dryerAreasLoading"
                />
              </UFormField>

              <UFormField label="Bin" required>
                <USelect
                  v-model="update_data.bin_number"
                  :items="detailBinOptions"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                  :loading="detailBinsLoading"
                  :disabled="!update_data.area_id"
                />
              </UFormField>

              <UFormField label="Hybrid">
                <UInput v-model="update_data.hybrid" class="w-full" />
              </UFormField>

              <UFormField label="Quality">
                <UInput v-model="update_data.quality" class="w-full" />
              </UFormField>

              <UFormField label="Net To Bin">
                <UInputNumber v-model="update_data.net_to_bin" :step="0.01" class="w-full" />
              </UFormField>

              <UFormField label="Initial MC">
                <UInputNumber v-model="update_data.initial_mc" :step="0.01" class="w-full" />
              </UFormField>

              <UFormField label="Start Time" required>
                <UInput v-model="update_data.start_time" type="datetime-local" class="w-full" />
              </UFormField>

              <UFormField label="End Time">
                <UInput v-model="update_data.end_time" type="datetime-local" class="w-full" />
              </UFormField>
            </div>

          </div>
        </section>

        <section class="rounded-lg border border-default bg-default">
          <div class="flex flex-col gap-3 border-b border-default p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-highlighted">
                Lot Logs
              </h2>
              <p class="text-sm text-muted">
                Create and maintain the monitoring log records related to this lot.
              </p>
            </div>

            <UButton
              label="Create Log"
              icon="i-lucide-plus"
              @click="openCreateLogModal"
            />
          </div>

          <div class="overflow-x-auto">
            <UTable
              :data="logTableData"
              :columns="logColumns"
              :loading="logListLoading"
              empty="No logs found"
              class="min-h-80 min-w-[78rem]"
            />
          </div>

          <div class="border-t border-default p-4">
            <div class="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
              <UButton
                icon="i-lucide-chevron-left"
                label="Prev"
                color="neutral"
                variant="outline"
                :disabled="!hasPrevLogPage || logListLoading"
                @click="changeLogPage('prev')"
              />
              <span class="min-w-16 text-center text-sm text-muted">
                {{ logPage }} / {{ totalLogPage || 1 }}
              </span>
              <USelect
                v-model="logPageSize"
                :items="logPageSizeItems"
                value-key="value"
                label-key="label"
                class="w-20"
                :disabled="logListLoading"
                @change="changeLogPageSize"
              />
              <UButton
                trailing-icon="i-lucide-chevron-right"
                label="Next"
                color="neutral"
                variant="outline"
                :disabled="!hasNextLogPage || logListLoading"
                @click="changeLogPage('next')"
              />
            </div>
          </div>
        </section>

        <p v-if="logListError" class="text-sm text-error">
          {{ getErrorMessage(logListError) }}
        </p>
      </div>
    </div>

    <UModal
      v-model:open="isCreateLogOpen"
      title="Create Log"
      description="Add a monitoring log entry for this lot."
    >
      <template #body>
        <form id="create-log-form" class="space-y-4" @submit.prevent="handleCreateLog">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Timestamp" required>
              <UInput v-model="createLogData.timestamp_thingspeak" type="datetime-local" class="w-full" />
            </UFormField>

            <UFormField label="Status Bin" required>
              <UInput v-model="createLogData.status_bin" class="w-full" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Temp Top">
              <UInputNumber v-model="createLogData.temp_top" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="RH Top">
              <UInputNumber v-model="createLogData.rh_top" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="Temp Bottom">
              <UInputNumber v-model="createLogData.temp_bottom" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="RH Bottom">
              <UInputNumber v-model="createLogData.rh_bottom" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="MC">
              <UInputNumber v-model="createLogData.mc" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="Checker Name">
              <UInput v-model="createLogData.checker_name" class="w-full" />
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
            :disabled="logCrudLoading"
            @click="isCreateLogOpen = false"
          />
          <UButton
            label="Create Log"
            icon="i-lucide-save"
            :loading="logCrudLoading"
            @click="requestCreateLogConfirmation"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isCreateLogConfirmOpen"
      title="Confirm Create Log"
      description="Please confirm before creating this log entry."
    >
      <template #body>
        <div class="space-y-3 text-sm">
          <p class="text-toned">
            Create a new log for
            <span class="font-medium text-highlighted">{{ lot?.lotNumber || "-" }}</span>
            at
            <span class="font-medium text-highlighted">{{ createLogData.timestamp_thingspeak || "-" }}</span>?
          </p>
          <p class="text-muted">
            The sensor values in this form will be stored in the lot history.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" :disabled="logCrudLoading" @click="isCreateLogConfirmOpen = false" />
          <UButton type="submit" form="create-log-form" label="Confirm Create" icon="i-lucide-save" :loading="logCrudLoading" @click="isCreateLogConfirmOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isEditLogOpen"
      title="Edit Log"
      description="Update the selected monitoring log entry."
    >
      <template #body>
        <form id="edit-log-form" class="space-y-4" @submit.prevent="handleUpdateLog">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Timestamp" required>
              <UInput v-model="updateLogData.timestamp_thingspeak" type="datetime-local" class="w-full" />
            </UFormField>

            <UFormField label="Status Bin" required>
              <UInput v-model="updateLogData.status_bin" class="w-full" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Temp Top">
              <UInputNumber v-model="updateLogData.temp_top" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="RH Top">
              <UInputNumber v-model="updateLogData.rh_top" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="Temp Bottom">
              <UInputNumber v-model="updateLogData.temp_bottom" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="RH Bottom">
              <UInputNumber v-model="updateLogData.rh_bottom" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="MC">
              <UInputNumber v-model="updateLogData.mc" :step="0.01" class="w-full" />
            </UFormField>

            <UFormField label="Checker Name">
              <UInput v-model="updateLogData.checker_name" class="w-full" />
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
            :disabled="logCrudLoading"
            @click="isEditLogOpen = false"
          />
          <UButton
            label="Save Changes"
            icon="i-lucide-save"
            :loading="logCrudLoading"
            @click="requestEditLogConfirmation"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isEditLogConfirmOpen"
      title="Confirm Update Log"
      description="Please confirm before saving this log entry."
    >
      <template #body>
        <div class="space-y-3 text-sm">
          <p class="text-toned">
            Save changes for
            <span class="font-medium text-highlighted">log #{{ updateLogData.log_id || "-" }}</span>
            at
            <span class="font-medium text-highlighted">{{ updateLogData.timestamp_thingspeak || "-" }}</span>?
          </p>
          <p class="text-muted">
            The edited sensor values will replace the current log record.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" :disabled="logCrudLoading" @click="isEditLogConfirmOpen = false" />
          <UButton type="submit" form="edit-log-form" label="Confirm Save" icon="i-lucide-save" :loading="logCrudLoading" @click="isEditLogConfirmOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteLogOpen"
      title="Delete Log"
      description="This action cannot be undone."
    >
      <template #body>
        <p class="text-sm text-toned">
          Delete
          <span class="font-medium text-highlighted">
            log #{{ selectedLog?.logId }}
          </span>
          from this lot?
        </p>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="logCrudLoading"
            @click="isDeleteLogOpen = false"
          />
          <UButton
            label="Delete Log"
            icon="i-lucide-trash-2"
            color="error"
            :loading="logCrudLoading"
            @click="handleDeleteLog"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteLotOpen"
      title="Delete Lot"
      description="This action cannot be undone."
    >
      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-toned">
            Delete
            <span class="font-medium text-highlighted">
              {{ lot?.lotNumber }}
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
            :disabled="lotCrudLoading"
            @click="isDeleteLotOpen = false"
          />
          <UButton
            label="Delete Lot"
            icon="i-lucide-trash-2"
            color="error"
            :loading="lotCrudLoading"
            @click="handleDeleteLot"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isUpdateLotConfirmOpen"
      title="Confirm Update Lot"
      description="Please confirm before saving lot changes."
    >
      <template #body>
        <div class="space-y-3 text-sm">
          <p class="text-toned">
            Save changes for
            <span class="font-medium text-highlighted">{{ update_data.lot_number || lot?.lotNumber || "-" }}</span>
            in area
            <span class="font-medium text-highlighted">{{ update_data.area_id || "-" }}</span>
            / bin
            <span class="font-medium text-highlighted">{{ update_data.bin_number || "-" }}</span>?
          </p>
          <p class="text-muted">
            The lot record will be updated and reflected in lot management immediately.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" :disabled="lotCrudLoading" @click="isUpdateLotConfirmOpen = false" />
          <UButton label="Confirm Save" icon="i-lucide-save" :loading="lotCrudLoading" @click="isUpdateLotConfirmOpen = false; handleUpdateLot()" />
        </div>
      </template>
    </UModal>
  </AppSidebar>
</template>
