<script setup lang="ts">
import { ref, h, resolveComponent } from 'vue'
import OperatorEntryModal from '~/components/bin/OperatorEntry.vue'
import type { LotLog } from './Process.vue';
import type { TableRow } from '@nuxt/ui';
// 1. Resolusi Komponen Eksternal
// Dalam Virtual DOM TanStack, kita tidak dapat memanggil <UBadge> secara langsung. 
// Komponen harus di-resolve secara eksplisit agar dapat dikenali oleh mesin Vue.
// 1. Pastikan Anda tetap mengimpor fungsi 'h' dan 'resolveComponent' dari 'vue'
const UBadge = resolveComponent('UBadge')
const toast = useToast();

export interface  Log {
  logId: number,
  timestampThingspeak: string,
  tempTop: number,
  tempBottom: number,
  rhTop: number,
  rhBottom: number,
  mc: number | null,
  status: string,
  remark: string | null
}


const props = defineProps<{
  logs: Log[],
  countLog: number,
}>()

// 2. Definisi Matriks Kolom yang Dikompresi
const columns = [
  { 
    accessorKey: 'timestampThingspeak', 
    header: 'Waktu',
    cell: ({ row }: any) => {
      // Rekayasa pemformatan tanggal agar ringkas: "07/07 12:00"
      const rawDate = new Date(row.getValue('timestampThingspeak'))
      const shortDate = rawDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
      const shortTime = rawDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      
      return h('span', { class: 'text-sm font-medium text-gray-700' }, `${shortDate} ${shortTime}`)
    }
  },
  { 
    // Menggunakan 'id' kustom karena kolom ini mensintesis dua data (tempTop & tempBottom)
    id: 'tempCombined', 
    header: 'T (T/B) °C',
    cell: ({ row }: any) => {
      const top = Number(row.original.tempTop).toFixed(2)
      const bottom = Number(row.original.tempBottom).toFixed(2)
      // Penggunaan font-mono wajib dipertahankan untuk konsistensi pelurusan angka desimal
      return h('span', { class: 'font-mono text-sm' }, `${top}/${bottom}`)
    }
  },
  { 
    // Menggunakan 'id' kustom untuk (rhTop & rhBottom)
    id: 'rhCombined', 
    header: 'RH (T/B) %',
    cell: ({ row }: any) => {
      const top = Number(row.original.rhTop).toFixed(2)
      const bottom = Number(row.original.rhBottom).toFixed(2)
      return h('span', { class: 'font-mono text-sm' }, `${top}/${bottom}`)
    }
  },
  { 
    accessorKey: 'mc', 
    header: 'MC (%)',
    cell: ({ row }: any) => {
      const mc = Number(row.getValue('mc'))
      if (mc !== null && mc !== undefined) {
        return h('span', { class: 'font-mono text-sm font-bold text-gray-900' }, mc.toFixed(1))
      }
      return h('span', { class: 'text-xs text-gray-400 italic' }, 'Kosong')
    }
  },
  { 
    accessorKey: 'statusBin', 
    header: 'Status Bin',
    cell: ({ row }: any) => {
      const status = row.getValue('statusBin') as string
      
      let color = 'neutral'
      if (status === 'UPAIR') color = 'success'
      if (status === 'DOWNAIR') color = 'warning'
      if (status === 'DRIER') color = 'error'

      return h(UBadge, { 
        color: color,
        variant: 'subtle',
        class: 'rounded-none' 
      }, () => status)
    }
  }
]

const isModalOpen = ref(false)
const selectedRowData = ref<Log | null>(null)

// 3. Ekstraksi Data TanStack
// Dalam TanStack Table, 'row' yang diklik mengandung metadata kompleks.
// Anda HARUS menggunakan referensi `row.original` untuk mendapatkan entitas data aslinya.
const handleRowSelect = (e: Event, row: TableRow<Log>) => {
  console.log(row) // Debug: Pastikan data asli berhasil diekstraksi
  selectedRowData.value = { ...row.original } 
  isModalOpen.value = true
}

const saveOperatorData = (updatedLog: Log) => {
  const { data, error } = useFetch(`/api/dryarea/process/monitoring_mc`, {
    method: 'PUT',
    body: {
      log_id: updatedLog.logId,
      mc: updatedLog.mc,
      remark: updatedLog.remark
    }
  })

  if (error.value) {
    toast.add({
      title: 'Gagal Menyimpan Data Operator',
      color: 'error'
    })
    return;
  }

  toast.add({
    title: 'Berhasil Menyimpan Data Operator',
    color: 'success'
  })
  return;
}

const page = ref(1) // Placeholder untuk pagination, jika diperlukan di masa depan
const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()
</script>

<template>
  <UCard class="rounded-none">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Log Telemetri Sensor</h3>
        <span class="text-xs text-gray-500">Klik baris untuk mengisi MC</span>
      </div>
    </template>
    
    <UTable 
      :data="props.logs" 
      :columns="columns"
      class="cursor-pointer hover:bg-gray-50 transition-colors"
      @select="(e: Event, row: TableRow<Log>) => handleRowSelect(e, row)"
    />
  </UCard>

  <div class="w-full flex justify-center items-center mb-6">
    <UPagination @update:page="(p) => {
      emit('update:page', p)
    }" v-model:page="page" :total="countLog" :items-per-page="15" />
  </div>

  <OperatorEntryModal 
    v-model="isModalOpen"
    :selected-data="selectedRowData"
    @save="saveOperatorData"
  />
</template>