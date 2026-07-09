<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import PanelProcess from './PanelProcess.vue'
import PanelLog from './PanelLog.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Koreksi 1: Pendefinisian Interface presisi untuk menghindari 'any'
interface ReportData {
  time: string
  tempTop: number | null
  rhTop: number | null
  tempBottom: number | null
  rhBottom: number | null
  mc: number | null
  statusBin: string
  dataPoints: number
}

export interface LotLog {
    lotId: number,
    lotNumber: string,
    hybrid: string,
    quality: string,
    netToBin: number,
    initialMc: number,
    areaId: number, 
    binNumber: string,
    startTime: string,
    endTime: string | null,
    endMC: number | null,
    downMC: number | null,
    downAirAt: string | null,
    status: string,
    depth: number | null,
}

const props = defineProps<{
  areaId: number
  binNumber: string
  lotNumber: string
  reportData: ReportData[],
  lot: LotLog,
  countLog: number
}>()

// Membalik array khusus untuk grafik agar sumbu X berjalan dari kiri (lama) ke kanan (baru)
const chronologicalData = computed(() => [...(props.reportData ?? [])].reverse())

const labels = computed(() =>
  chronologicalData.value.map((d: ReportData) => {
    const date = new Date(d.time)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })
)

const router = useRouter();

const createChartData = (
  data1: number[] = [],
  data2: number[] = [],
  title1: string,
  title2: string,
  color1: string,
  color2: string
): ChartData<'line'> => ({
  labels: labels.value,
  datasets: [
    {
      label: title1,
      data: data1,
      borderColor: color1,
      backgroundColor: color1 + '33',
      yAxisID: 'y',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2
    },
    {
      label: title2,
      data: data2,
      borderColor: color2,
      backgroundColor: color2 + '33',
      yAxisID: 'y',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2
    }
  ]
})

const baseOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: { position: 'top' }
  }
}

const tempOptions: ChartOptions<'line'> = {
  ...baseOptions,
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: 'Temperature (°C)' }
    }
  }
}

const rhOptions: ChartOptions<'line'> = {
  ...baseOptions,
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: 'Humidity (%)' }
    }
  }
}

const charts = computed(() => [
  {
    title: 'Temperature (Top vs Bottom)',
    data: createChartData(
      chronologicalData.value.map(d => d.tempTop ?? 0),
      chronologicalData.value.map(d => d.tempBottom ?? 0),
      'Temp Top',
      'Temp Bottom',
      '#ef4444', 
      '#f97316'  
    ),
    options: tempOptions
  },
  {
    title: 'Humidity (Top vs Bottom)',
    data: createChartData(
      chronologicalData.value.map(d => d.rhTop ?? 0),
      chronologicalData.value.map(d => d.rhBottom ?? 0),
      'RH Top',
      'RH Bottom',
      '#3b82f6', 
      '#0ea5e9'  
    ),
    options: rhOptions
  }
])

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Panel Utama -->
    <PanelProcess :binNumber="props.binNumber" :lotNumber="props.lotNumber" :lot="lot" />
    <!-- Grafik Data Lanjutan -->
    <div class="flex flex-col gap-6 w-full">
      <UCard v-for="item in charts" :key="item.title" class="w-full rounded-none shadow-sm">
        <template #header>
          <div class="text-lg font-semibold">
            {{ item.title }}
          </div>
        </template>

        <div class="h-80">
          <Line :data="item.data" :options="item.options" />
        </div>
      </UCard>
    </div>
    <PanelLog :logs="reportData" :countLog="countLog" :lotId="props.lot.lotId" :lotNumber="props.lotNumber" :startTime="props.lot.startTime" />
  </div>
</template>