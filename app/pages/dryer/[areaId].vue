<script setup lang="ts">
    import { useBin } from '~/composable/dryer_page/useBin';
    const route = useRoute();
    const areaId = parseInt(route.params.areaId as string);
    const { bins, fetch_bins } = useBin();  
    fetch_bins(areaId);
</script>
<template>
    <div v-if="bins == null">
        LOADING
    </div>  
    <div v-else>
        <div v-for="bin in bins.data" :key="bin.id">
            <NuxtLink :to="`/dryercfg/dryer/${areaId}/bin/${bin.binNumber}`">
                {{ bin.binNumber }}
                </br>
                </br>
                {{ bin.occupiedBy ? bin.occupiedBy : '' }}
            </NuxtLink> 
        </div>
    </div>
</template> 