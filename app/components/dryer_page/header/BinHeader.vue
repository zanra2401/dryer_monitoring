<script setup lang="ts">
    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });
</script>

<template>
    <div>
        Area ID: {{ props.areaId }}
    </div>
</template>