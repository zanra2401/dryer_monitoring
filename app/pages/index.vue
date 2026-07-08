<script setup>
useFetch('/api/diagnostik').then((res) => {
    console.log('Diagnostic data:', res);
}).catch((err) => {
    console.error('Error fetching diagnostic data:', err);
});
</script>

<template>

</template>