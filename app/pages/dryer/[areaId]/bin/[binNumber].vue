<script setup lang="ts">
    import { useSingleBin } from '~/composable/dryer_page/useSingleBin';
    import { BinStatus } from '~/generated/prisma/enums';
    import Init from '~/components/bin/Init.vue';
    import Process from '~/components/bin/Process.vue';
    const route = useRoute();
    const binNumber = parseInt(route.params.binNumber as string);
    const areaId = parseInt(route.params.areaId as string);

    const { bin, fetch_bin } = useSingleBin();
    fetch_bin(areaId, binNumber);
</script>

<template>
    <div>
        Bin Number: {{ binNumber }}
    </div>

    <div v-if="bin == null">
        LOADING
    </div>
    <div v-else>
        <Init v-if="bin.data.binStatus == 'EMPTY'" :areaId="areaId" :binNumber="binNumber" />
        <Process v-else/>
    </div>
</template>