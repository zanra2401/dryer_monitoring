<script setup lang="ts">
import { ref } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import * as z from 'zod';
import { useRouter, useRoute } from 'vue-router';

const colorMode = useColorMode();

const route = useRoute();
const router = useRouter();

// 1. Definisi Antarmuka Props yang Ketat
const props = defineProps<{
    areaId: number
    binNumber: string
}>();

const toast = useToast();

// 2. Definisi Struktur Tipe Payload untuk Keamanan Tipe (Type-Safety)
interface LotInitializationPayload {
    lot_number: string | undefined;
    hybrid: string | undefined;
    quality: string | undefined;
    net_to_bin: number | undefined;
    initial_mc: number | undefined;
    depth: number | undefined;
    start_time: Date | undefined;
}

const isSubmitting = ref(false);

const schemaInitialization = z.object({
    lot_number: z.string().min(1, "Lot Number tidak boleh kosong"),
    hybrid: z.string().min(1, "Spesifikasi Hybrid tidak boleh kosong"),
    quality: z.string().min(1, "Metrik Kualitas tidak boleh kosong"),
    net_to_bin: z.number().positive("Net to Bin harus lebih besar dari 0"),
    initial_mc: z.number().nonnegative("Initial MC harus bernilai positif atau nol"),
    depth: z.number().positive("Depth harus lebih besar dari 0"),
    start_time: z.date().refine(date => date !== null, { message: "Waktu Inisialisasi tidak boleh kosong" })
});

// 3. Inisialisasi State dengan tipe eksplisit
const lot_data = ref<LotInitializationPayload>({
    lot_number: undefined,
    hybrid: undefined,
    quality: undefined,
    net_to_bin: undefined,
    initial_mc: undefined,
    depth: undefined,
    start_time: undefined
});

const startDrying = async () => {
    // Validasi pencegahan transmisi dengan waktu kosong
    if (!lot_data.value.start_time) {
        toast.add({
            title: 'Validasi Gagal',
            description: 'Parameter Waktu Inisialisasi tidak boleh dibiarkan kosong.',
            color: 'warning',
            icon: 'i-heroicons-exclamation-triangle'
        });
        return;
    }

    isSubmitting.value = true;
    
    try {
        // Konversi objek Date ke format absolut ISO 8601 UTC
        const normalizedStartTime = lot_data.value.start_time.toISOString();
        schemaInitialization.parse({
            ...lot_data.value,
            start_time: lot_data.value.start_time
        });

        const payload = {
            ...lot_data.value,
            area_id: props.areaId,
            bin_number: parseInt(props.binNumber, 10),
            start_time: normalizedStartTime,
        };

        // KOREKSI FATAL: Penggunaan $fetch natif untuk interaksi sisi klien (Client-Side Interactivity)
        const response = await $fetch('/api/dryarea/process/start', {
            method: 'POST',
            body: payload
        });

        toast.add({
            title: 'Operasi Tervalidasi',
            description: 'Proses pengeringan telah berhasil didaftarkan ke dalam sistem.',
            color: 'success',
            icon: 'i-heroicons-check-circle'
        });

        // Redirect ke halaman Lot yang baru dibuat
        await navigateTo(`/dryer/${props.areaId}/bin/${props.binNumber}/${lot_data.value.lot_number}`);
        
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            // Penanganan galat validasi Zod
            const errorMessages = err.issues.map(issue => issue.message).join(", ");
            toast.add({
                title: 'Validasi Gagal',
                description: errorMessages,
                color: 'error',
                icon: 'i-heroicons-x-circle'
            });
        }
        console.error('Kesalahan eksekusi API/Klien:', err);
        
        // Ekstraksi pesan galat dari backend jika tersedia
        const errorMessage = err.data?.message || err.message || 'Terjadi anomali saat inisialisasi pengeringan.';
        
        toast.add({
            title: 'Kegagalan Transmisi',
            color: 'error',
            icon: 'i-heroicons-x-circle'
        });
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="flex justify-center">
        <UCard  class="max-w-md rounded-none shadow-sm border border-gray-200">
            
            <template #header>
    
                <div class="items-center flex">
                    <UButton class="rounded-none p-1" variant="ghost" color="primary" @click="router.back()">
                        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
                    </UButton>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            Inisialisasi Parameter Lot
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Konfigurasi data awal untuk proses pengeringan</p>
                    </div>
                </div>
            </template>
    
            <div class="flex flex-col gap-5">
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Lot Number</label>
                    <UInput v-model="lot_data.lot_number" placeholder="Masukkan Lot Number" class="rounded-none" />
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Spesifikasi Hybrid</label>
                    <UInput v-model="lot_data.hybrid" placeholder="Masukkan Spesifikasi Hybrid" class="rounded-none" />
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Metrik Kualitas</label>
                    <UInput v-model="lot_data.quality" placeholder="Masukkan Metrik Kualitas" class="rounded-none" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Net to Bin (kg)</label>
                        <UInput v-model.number="lot_data.net_to_bin" type="number" placeholder="Kuantitas Net" class="rounded-none" />
                    </div>
                    
                    <div class="flex flex-col gap-1.5">
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Depth (meter)</label>
                        <UInput v-model.number="lot_data.depth" type="number" placeholder="Kedalaman" class="rounded-none" />
                    </div>
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Initial Moisture Content (MC) %</label>
                    <UInput v-model.number="lot_data.initial_mc" type="number" step="0.1" placeholder="Nilai Initial MC" class="rounded-none" />
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Waktu Inisialisasi <span class="text-red-500">*</span>
                    </label>
                    <VueDatePicker
                        v-model="lot_data.start_time"
                        :teleport="true"
                        :is-24="true"
                        :dark="colorMode.value === 'dark'"
                        class="w-full shadow-sm"
                        format="dd/MM/yyyy HH:mm"
                        placeholder="Tentukan Waktu Aktual"
                        auto-apply
                    />
                </div>
    
            </div>
    
            <template #footer>
                <div class="flex justify-end">
                    <UButton 
                        :loading="isSubmitting" 
                        @click="startDrying" 
                        color="primary" 
                        class="rounded-none shadow-sm font-bold w-full justify-center"
                    >
                        Inisialisasi Proses
                    </UButton>
                </div>
            </template>
            
        </UCard>
    </div>
</template>