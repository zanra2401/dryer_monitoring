<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Log } from './PanelLog.vue';
const props = defineProps<{
  modelValue: boolean
  selectedData: Log | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: Log): void
}>()

// 1. Arsitektur Presisi Two-Way Binding
// Ini adalah kunci agar mesin <UModal> dapat mengontrol state buka/tutup secara natif
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const inputMc = ref<number | null>(null)
const inputRemark = ref<string>('')

watch(() => props.selectedData, (newData) => {
  if (newData) {
    inputMc.value = newData.mc
    inputRemark.value = newData.remark || ''
  }
}, { immediate: true })

const handleClose = () => {
  isOpen.value = false // Memicu setter pada computed property
}

const handleSubmit = () => {
  if (!props.selectedData) return
  emit('save', {
    ...props.selectedData,
    mc: inputMc.value,
    remark: inputRemark.value
  })
  handleClose()
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #body>
      <div class="flex flex-col gap-5">
        <div v-if="selectedData" class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-none">
          Entri Waktu: <span class="font-bold text-gray-900 dark:text-white">{{ new Date(selectedData.time).toLocaleString('id-ID') }}</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Moisture Content (MC) % <span class="text-red-500">*</span>
          </label>
          <UInput 
            v-model.number="inputMc" 
            type="number" 
            step="0.1" 
            placeholder="Masukkan nilai MC" 
            class="rounded-none"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700">
            Remark / Catatan Tambahan
          </label>
          <UTextarea 
            v-model="inputRemark" 
            placeholder="Kondisi fisik, anomali, dll." 
            class="rounded-none"
  "
          />
        </div>
      </div>

    </template> 
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton 
          color="neutral" 
          variant="solid" 
          class="text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-none shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800" 
          @click="handleClose"
        >
          Batal
        </UButton>
        
        <UButton 
          color="primary" 
          class="rounded-none shadow-sm"
          @click="handleSubmit"
        >
          Simpan Data
        </UButton>
      </div>
    </template>
    
  </UModal>
</template>