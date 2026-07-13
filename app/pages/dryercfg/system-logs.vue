<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
    layout: 'default'
})

const { data, refresh } = await useFetch('/api/system/fetch_errors')
const toast = useToast()

const markAsRead = async (errorId: number) => {
    try {
        await $fetch('/api/system/fetch_errors', {
            method: 'PUT',
            body: { errorId }
        })
        toast.add({ title: 'Notifikasi ditandai sudah dibaca', color: 'success' })
        refresh()
    } catch (e: any) {
        toast.add({ title: 'Gagal mengubah status', color: 'error' })
    }
}

// Convert data to accordion format based on Master data
const accordionItems = computed(() => {
    if (!data.value?.data) return []
    return data.value.data.map((err: any) => ({
        label: `Kegagalan Fetch pada ${new Date(err.createdAt).toLocaleString('id-ID')}`,
        icon: 'i-lucide-server-crash',
        content: err.details,
        errorId: err.errorId
    }))
})
</script>

<template>
    <AppSidebar :loading="data === null">
        <div>
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Log Sistem (ThingSpeak)</h1>
                    <p class="text-sm text-gray-500 mt-1">Daftar kegagalan mesin saat mengambil data telemetri otomatis.</p>
                </div>
                <UButton icon="i-lucide-refresh-cw" color="white" @click="refresh">Refresh</UButton>
            </div>
    
            <UCard v-if="accordionItems.length > 0" class="max-w-4xl">
                <template #header>
                    <div class="flex items-center gap-2 text-red-600 font-bold">
                        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 animate-pulse" />
                        Terdapat {{ accordionItems.length }} Log Kegagalan Belum Ditangani
                    </div>
                </template>
                
                <UAccordion 
                    :items="accordionItems"
                    variant="soft"
                    color="red"
                    size="md"
                >
                    <template #item="{ item }">
                        <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Rincian Bin yang Terpengaruh:
                            </div>
                            <UTable 
                                :rows="item.content" 
                                :columns="[
                                    { key: 'areaId', label: 'Area ID' },
                                    { key: 'binNumber', label: 'Bin' },
                                    { key: 'message', label: 'Pesan Kesalahan' }
                                ]"
                                class="mb-4 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800"
                            />
                            <div class="flex justify-end">
                                <UButton color="primary" icon="i-lucide-check-circle" @click="markAsRead(item.errorId)">
                                    Tandai Log Ini Selesai
                                </UButton>
                            </div>
                        </div>
                    </template>
                </UAccordion>
            </UCard>
            
            <div v-else class="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <UIcon name="i-lucide-check-circle-2" class="w-16 h-16 text-green-500 mb-4" />
                <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300">Sistem Berjalan Normal</h3>
                <p class="text-gray-500">Tidak ada kegagalan penarikan data yang tertunda.</p>
            </div>
        </div>
    </AppSidebar>
</template>
