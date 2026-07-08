<script setup lang="ts">
import LotReportTemplate from "~/components/lot-report/LotReportTemplate.vue";
import { useLotReport } from "~/composable/useLotReport";

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const toast = useToast();

const lotId = computed(() => Number(route.params.lotId));
const shouldAutoPrint = computed(() => route.query.print === "1");

const {
  current_data,
  loading,
  error,
  fetch_lot_report,
} = useLotReport();

const getErrorMessage = (value: unknown) => {
  if (typeof value === "object" && value !== null) {
    const maybeError = value as {
      data?: { error?: string; message?: string };
      statusMessage?: string;
      message?: string;
    };

    return maybeError.data?.error || maybeError.data?.message || maybeError.statusMessage || maybeError.message || "Unknown error";
  }

  return "Unknown error";
};

const printPage = () => {
  if (!import.meta.client) {
    return;
  }

  window.print();
};

onMounted(async () => {
  if (!Number.isInteger(lotId.value) || lotId.value <= 0) {
    return;
  }

  try {
    await fetch_lot_report(lotId.value);

    if (shouldAutoPrint.value && import.meta.client) {
      window.setTimeout(() => {
        printPage();
      }, 300);
    }
  } catch (fetchError) {
    toast.add({
      title: "Failed to load report",
      description: getErrorMessage(fetchError),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
});
</script>

<template>
  <div class="min-h-screen bg-neutral-100 px-4 py-6 text-default print:bg-white print:px-0 print:py-0">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 print:max-w-none print:gap-0">
      <div class="flex items-center justify-between rounded-lg border border-default bg-default p-4 print:hidden">
        <div>
          <h1 class="text-lg font-semibold text-highlighted">
            Lot Report Template
          </h1>
          <p class="text-sm text-muted">
            Report export preview based on the Excel template.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            icon="i-lucide-arrow-left"
            label="Back to Detail"
            color="neutral"
            variant="ghost"
            @click="() => { void router.push(`/dryercfg/lot/${lotId}`) }"
          />
          <UButton
            icon="i-lucide-printer"
            label="Print / Save PDF"
            @click="printPage"
          />
        </div>
      </div>

      <div v-if="loading && !current_data" class="rounded-lg border border-default bg-default p-10 text-center text-sm text-muted print:hidden">
        Loading report...
      </div>

      <div v-else-if="error && !current_data" class="rounded-lg border border-error/50 bg-error/10 p-4 text-sm text-error print:hidden">
        {{ getErrorMessage(error) }}
      </div>

      <div v-else-if="current_data" class="rounded-lg border border-default bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <LotReportTemplate :report="current_data" />
      </div>
    </div>
  </div>
</template>
