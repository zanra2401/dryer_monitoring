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
interface SensorData {
  data?: any
  time?: string[]
  tempTop?: number[]
  rhTop?: number[]
  tempBottom?: number[]
  rhBottom?: number[]
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
  data: SensorData,
  lot: LotLog
}>()

const labels = computed(() =>
  (props.data?.time ?? []).map((time: string) => {
    const date = new Date(time)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })
)

// Koreksi 2: Anotasi tipe yang jelas pada fungsi pabrikan metrik
const createChartData = (
  temp: number[] = [],
  rh: number[] = [],
  titleTemp: string,
  titleRh: string
): ChartData<'line'> => ({
  labels: labels.value,
  datasets: [
    {
      label: titleTemp,
      data: temp,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.15)',
      yAxisID: 'temp',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2
    },
    {
      label: titleRh,
      data: rh,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.15)',
      yAxisID: 'rh',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2
    }
  ]
})

// Koreksi 3: Pendeklarasian 'chartData' untuk memperbaiki ReferenceError pada templat utama
// Analisis fungsional: Mengasumsikan grafik utama menampilkan data 'Top' sebagai data sekilas.
const chartData = computed(() =>
  createChartData(
    props.data?.tempTop ?? [],
    props.data?.rhTop ?? [],
    'Temperature Overview',
    'Humidity Overview'
  )
)

const topChart = computed(() =>
  createChartData(
    props.data?.tempTop ?? [],
    props.data?.rhTop ?? [],
    'Temperature Top',
    'Humidity Top'
  )
)

const bottomChart = computed(() =>
  createChartData(
    props.data?.tempBottom ?? [],
    props.data?.rhBottom ?? [],
    'Temperature Bottom',
    'Humidity Bottom'
  )
)

// Koreksi 4: Penambahan anotasi tipe untuk objek konfigurasi Chart
const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    temp: {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: 'Temperature (°C)'
      }
    },
    rh: {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: 'Humidity (%)'
      }
    }
  }
}

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Panel Utama -->
    <PanelProcess :binNumber="props.binNumber" :lotNumber="props.lotNumber" :lot="lot" />
    <!-- Korsel Data Lanjutan (Top & Bottom) -->
    <UCarousel
      :items="[topChart, bottomChart]"
      arrows
      indicators
      class="w-full"
    >
      <template #default="{ item, index }">
        <UCard class="w-full rounded-none">
          <template #header>
            <div class="text-lg font-semibold">
              {{ index === 0 ? 'Temperature & Humidity (Top)' : 'Temperature & Humidity (Bottom)' }}
            </div>
          </template>

          <div class="h-80">
            <Line :data="item" :options="options" />
          </div>
        </UCard>
      </template>
    </UCarousel>

    <PanelLog :logs="data?.data" />
  </div>
</template>