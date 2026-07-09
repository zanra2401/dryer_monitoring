<script setup>
useFetch('/api/diagnostik').then((res) => {
     
}).catch((err) => {
    console.error('Error fetching diagnostic data:', err);
});
</script>

<template>

</template>