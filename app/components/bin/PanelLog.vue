<script setup lang="ts">
import { ref, h, resolveComponent, computed } from 'vue'
import OperatorEntryModal from '~/components/bin/OperatorEntry.vue'
import type { LotLog } from './Process.vue';
import type { TableRow } from '@nuxt/ui';
// 1. Resolusi Komponen Eksternal
// Dalam Virtual DOM TanStack, kita tidak dapat memanggil <UBadge> secara langsung. 
// Komponen harus di-resolve secara eksplisit agar dapat dikenali oleh mesin Vue.
// 1. Pastikan Anda tetap mengimpor fungsi 'h' dan 'resolveComponent' dari 'vue'
const UBadge = resolveComponent('UBadge')
const toast = useToast();

export interface Log {
  // logId dihapus karena data ini adalah hasil komputasi interval 30-menit, bukan baris tabel mentah
  time: string,
  tempTop: number | null,
  tempBottom: number | null,
  rhTop: number | null,
  rhBottom: number | null,
  mc: number | null,
  statusBin: string,
  remark?: string | null
}


const props = defineProps<{
  logs: Log[],
  countLog: number,
  lotId: number,
  lotNumber: string
}>()

// 2. Definisi Matriks Kolom yang Dikompresi
const columns = [
  { 
    accessorKey: 'time', 
    header: 'Waktu',
    cell: ({ row }: any) => {
      // Rekayasa pemformatan tanggal agar ringkas: "07/07 12:00"
      const rawDate = new Date(row.getValue('time'))
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
      if (mc !== null && mc !== undefined && !isNaN(mc)) {
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
      }, () => status || 'UNKNOWN')
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

const saveOperatorData = async (updatedLog: Log) => {
  try {
    // Jika baris sudah memiliki MC (bukan null/undefined/NaN), gunakan PUT untuk update
    // Jika MC masih kosong, gunakan POST untuk membuat data baru
    const isUpdate = updatedLog.mc !== null && updatedLog.mc !== undefined && !isNaN(Number(updatedLog.mc))
    const method = isUpdate ? 'PUT' : 'POST'

    await $fetch(`/api/dryarea/process/monitoring_mc`, {
      method: method,
      body: {
        lot_id: props.lotId,
        target_time: updatedLog.time || new Date().toISOString(),
        mc: Number(updatedLog.mc),
        remark: updatedLog.remark || ''
      }
    })

    await refreshNuxtData(`lot-${props.lotNumber}`)
    await refreshNuxtData(`report-${props.lotNumber}`)

    toast.add({
      title: isUpdate ? 'Berhasil Memperbarui MC' : 'Berhasil Menyimpan MC Baru',
      color: 'success'
    })
  } catch (error) {
    console.error('Terjadi kegagalan transmisi data:', error)
    toast.add({
      title: 'Gagal Menyimpan Data Operator',
      color: 'error'
    })
  }
}

const page = ref(1) 
const itemsPerPage = 15

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.logs.slice(start, end);
})

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
      :data="paginatedLogs" 
      :columns="columns"
      class="cursor-pointer hover:bg-gray-50 transition-colors"
      @select="(e: Event, row: TableRow<Log>) => handleRowSelect(e, row)"
    />
  </UCard>

  <div class="w-full flex justify-center items-center mb-6">
    <UPagination v-model="page" :total="props.logs.length" :items-per-page="itemsPerPage" />
  </div>

  <OperatorEntryModal 
    v-model="isModalOpen" 
    :selected-data="selectedRowData"
    @save="saveOperatorData"
  />
</template>