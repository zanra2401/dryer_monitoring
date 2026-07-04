<script setup>
    const { data } = await useFetch("/api/dryarea/dry_area", {
        method: "POST",
        body: {
            name: "D2"
        }
    });
</script>
<template>
    "test"
</template>