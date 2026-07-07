<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps<{
  modelValue: boolean
  actionType: 'down' | 'stop' | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: { action: 'down' | 'stop', timestamp: string }): void
}>()

// Arsitektur Presisi Two-Way Binding
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// State untuk menyimpan waktu eksekusi
const inputTimestamp = ref<string>('')

// Mesin adaptasi UI: Mengubah teks dan warna berdasarkan tipe aksi
const config = computed(() => {
  if (props.actionType === 'stop') {
    return {
      title: 'Konfirmasi Operasi: Set Stop',
      description: 'Peringatan: Anda akan menghentikan total proses pengeringan pada Bin ini. Aksi ini tidak dapat undone. Pastikan Anda telah memverifikasi kondisi Bin sebelum melanjutkan.',
      btnColor: 'error',
      btnText: 'Eksekusi Stop'
    }
  }
  return {
    title: 'Konfirmasi Operasi: Set Down',
    description: 'Set DownAir.',
    btnColor: 'warning',
    btnText: 'Eksekusi Set Down'
  }
})

const handleClose = () => {
  isOpen.value = false
  inputTimestamp.value = '' // Reset state untuk mencegah kebocoran memori (memory leak) antar-sesi
}

const handleSubmit = () => {
  if (!props.actionType || !inputTimestamp.value) return
  
  emit('confirm', {
    action: props.actionType,
    timestamp: inputTimestamp.value
  })
  handleClose()
}
</script>

<template>
  <UModal v-model:open="isOpen" class="rounded-none overflow-visible translate-y-[-70px]" :dismissible="false">
      <template #header>
        <div class="flex items-center justify-between w-full">
        <div>
            <h3 class="text-base font-bold text-gray-800">{{ config.title }}</h3>
        </div>
          <UButton 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            class="text-gray-500 hover:bg-gray-100 rounded-none -my-1" 
            @click="handleClose" 
          />
        </div>
      </template>
      <template #body>
          <div class="flex flex-col gap-4">
            <p class="text-sm font-medium text-gray-600">
              {{ config.description }}
            </p>
    
            <div class="flex flex-col gap-1.5 mt-2">
              <label class="text-sm font-semibold text-gray-700">
                Waktu Aktual Eksekusi <span class="text-red-500">*</span>
              </label>
              <VueDatePicker  
                v-model="inputTimestamp"
                type="datetime-local" 
                class="w-full border border-gray-300 p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none rounded-none"
                format="24hs"
                :is-24="true"
                placeholder="Tentukan Waktu Aktual"
                auto-apply
                input-class-name="w-full border border-gray-300 p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none rounded-none"
              ></VueDatePicker>
            </div>
          </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton 
            color="neutral" 
            variant="solid" 
            class="border border-gray-300 rounded-none shadow-sm hover:bg-gray-50" 
            
            @click="handleClose"
          >
            Batal
          </UButton>
          
          <UButton 
            color="primary" 
            class="rounded-none shadow-sm font-bold text-white"
            :disabled="!inputTimestamp"
            @click="handleSubmit"
          >
            {{ config.btnText }}
          </UButton>
        </div>
      </template>
  </UModal>
</template>