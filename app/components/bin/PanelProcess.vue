<script setup lang="ts">
    import ActionControlModal from './ActionControlModal.vue';
    import type { LotLog } from './Process.vue';
    const toast = useToast();
    const props = defineProps<{
        binNumber: string;
        lotNumber: string;
        lot: LotLog;
    }>();
    const router = useRouter();
    // State untuk mengelola modal operasi kendali
    const isControlModalOpen = ref(false)
    const activeControlAction = ref<'down' | 'stop' | null>(null)

    // Fungsi pemicu saat tombol diklik
    const openControlModal = (action: 'down' | 'stop') => {
    activeControlAction.value = action
    isControlModalOpen.value = true
    }

    // Fungsi eksekutor saat modal dikonfirmasi
    const executeControlAction = async (payload: { action: 'down' | 'stop', timestamp: string }) => {
    
    // 1. Validasi String Kosong
    if (!payload.timestamp) {
        console.error('Cacat Logika: Timestamp tidak boleh kosong.')
        return
    }

    // 2. Normalisasi Zona Waktu (Resolusi Anomali UTC)
    // Membaca string lokal dan mengubahnya menjadi objek Date yang mengenali zona waktu sistem (WIB)
    const localDate = new Date(payload.timestamp)
    
    // Mengonversi ke standar ISO-8601 (otomatis dikonversi ke UTC absolut dengan huruf 'Z')
    // Ini adalah format yang wajib diterima oleh Prisma
    const safeIsoString = localDate.toISOString() 

    console.log(`[INTEGRITAS TERJAGA] Eksekusi ${payload.action} disiapkan:`, safeIsoString)

    try {
        if (payload.action == 'down') {
          const { data, error } = await useFetch(`/api/dryarea/process/down_air`, {
            method: 'PUT',
            body: {
              lot_id: props.lot.lotId,
              time: safeIsoString
            }
          })

          if (error.value) {
            toast.add({
              title: 'Gagal Set Down',
              color: 'error'
            })
          }

          toast.add({
            title: 'Berhasil Set Down',
            color: 'success'
          })

        } else {
          const { data, error } = await useFetch(`/api/dryarea/process/end`, {
            method: 'PUT',
            body: {
              lot_id: props.lot.lotId,
              time: safeIsoString
            }
          });

          if (error.value) {
            toast.add({
              title: 'Gagal Set Stop',
              color: 'error'
            })
          }
          toast.add({
              title: 'Berhasil Set Stop',
              color: 'success'
          })
        }

    } catch (error) {
        console.error('Terjadi kegagalan transmisi data:', error)
    }
    }
    const formatCompactDateTime = (isoString?: string | null | undefined) => {
        if (!isoString) return "-"
        
        const date = new Date(isoString)
        if (isNaN(date.getTime())) return "-" // Menghindari fatal error jika string tidak valid

        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2) // Hanya mengambil 2 digit terakhir tahun
        
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        return `${day}/${month}/${year} ${hours}:${minutes}`
    }

    // 1. Fungsi Total Drying
    // Menghitung selisih waktu dan mengonversinya ke satuan Jam (Hours)
    const calculateTotalDrying = (startTime?: string | null, stopTime?: string | null): number | null => {
    if (!startTime || !stopTime) return null;
    
    const start = new Date(startTime).getTime();
    const stop = new Date(stopTime).getTime();
    
    if (isNaN(start) || isNaN(stop)) return null;
    
    // Konversi milidetik ke jam: (ms / 1000 / 60 / 60)
    const diffHours = (stop - start) / 3600000;
    
    // Validasi absolut: Mencegah nilai negatif jika operator salah memasukkan tanggal
    return diffHours > 0 ? Math.round(diffHours) : null;
    };

    // 2. Fungsi Dry Down
    // Menghitung magnitudo penurunan kelembaban (Moisture Content)
    const calculateDryDown = (mcStart?: number | null, mcEnd?: number | null): number | null => {
    // Penggunaan operator '==' untuk mengecek null sekaligus undefined
    if (mcStart == null || mcEnd == null) return null;
    
    // Koreksi Cacat Logika: Menggunakan nilai absolut untuk memastikan hasil selalu positif
    return Math.abs(mcStart - mcEnd);
    };

    // 3. Fungsi Drying Rate
    // Menghitung rasio sesuai instruksi gambar (Waktu / Penurunan MC)
    const calculateDryingRate = (totalDryingHours?: number | null, dryDownValue?: number | null): number | null => {
    // Validasi pencegahan pembagian dengan nol (Division by Zero)
    if (totalDryingHours == null || dryDownValue == null || dryDownValue === 0) return null;
    
    return Number((totalDryingHours / dryDownValue).toFixed(2));
    };

    const undo_down_air = async () => {
        try {
            const { data, error } = await useFetch(`/api/dryarea/process/undo_downair`, {
                method: 'PUT',
                body: {
                    lot_id: props.lot.lotId
                }
            })

            if (error.value) {
                toast.add({
                    title: 'Gagal Undo Down',
                    color: 'error'
                })
                return;
            }

            toast.add({
                title: 'Berhasil Undo Down',
                color: 'success'
            })
        } catch (error) {
            console.error('Terjadi kegagalan transmisi data:', error)
        }
    }
</script>

<template>
    <UCard class="rounded-none">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <UButton
            variant="ghost"
            icon="i-heroicons-arrow-left"
            class="text-gray-500 hover:bg-gray-100 rounded-none -my-1"
            @click="router.back()"
          />
          <h2 class="text-xl font-bold">Bin {{ binNumber }}</h2>
          <p class="text-gray-500">Lot {{ lotNumber }}</p>
          <UBadge color="neutral" class="rounded">{{ lot.hybrid }}</UBadge>
          <UBadge color="neutral" class="rounded ml-2">{{ lot.quality }}</UBadge>
        </div>
        <UBadge :color="getColorClassNuxt(lot.status)">{{ lot.status }}</UBadge> 
      </div>
    </template>

    <div class="mb-5 flex gap-2">
      <UButton v-if="lot.downAirAt == null"
        color="warning" 
        class="rounded-none"
        @click="openControlModal('down')"
      >
        Set Down
      </UButton>
      <UButton  v-else-if="!lot.endTime"
        color="warning" 
        class="rounded-none"
        @click="undo_down_air()"
      >
        Undo Down
      </UButton>

      <UButton 
        v-if="!lot.endTime"
        color="error" 
        class="rounded-none"
        @click="openControlModal('stop')"
      >
        Set Stop
      </UButton>
    </div>

    <div class="flex flex-col gap-6">
      
      <div class="grid grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-gray-500">Net To Bin</div>
          <div class="font-medium">{{ lot.netToBin ?? "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Depth (meter)</div>
          <div class="font-medium">{{ lot.depth ?? "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Time Start</div>
          <div class="font-medium font-mono text-sm">{{ formatCompactDateTime(lot.startTime) }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Time Down</div>
          <div class="font-medium font-mono text-sm">{{ formatCompactDateTime(lot.downAirAt) }}</div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-gray-500">Time Stop</div>
          <div class="font-medium font-mono text-sm">{{ formatCompactDateTime(lot.endTime) }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">MC Start</div>
          <div class="font-medium">{{ lot.initialMc ?? "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">MC Down</div>
          <div class="font-medium">{{ lot.downMC ?? "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Mc End</div>
          <div class="font-medium">{{ lot.endMC ?? "-" }}</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-xs text-gray-500">Total Drying</div>
          <div class="font-medium">{{ calculateTotalDrying(lot.startTime, lot.endTime) ?? "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Dry down</div>
          <div class="font-medium">{{ calculateDryDown(lot.initialMc, lot.endMC) ?? "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Drying rate</div>
          <div class="font-medium">{{ calculateDryingRate(calculateTotalDrying(lot.startTime, lot.endTime), calculateDryDown(lot.initialMc, lot.endMC)) ?? "-" }}</div>
        </div>
      </div>

    </div>
  </UCard>
    <ActionControlModal 
        v-model="isControlModalOpen"
        :action-type="activeControlAction"
        @confirm="executeControlAction"
    />
</template>