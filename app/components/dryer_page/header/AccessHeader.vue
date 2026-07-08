<script setup lang="ts">
defineProps({
    areaId: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <div>
        <h2 class="text-lg font-semibold text-highlighted">
            Dryer Access
        </h2>
        <p class="text-sm text-muted">
            Manage operator and client access for dryer area #{{ areaId }}.
        </p>
    </div>
</template>
