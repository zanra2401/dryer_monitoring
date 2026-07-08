<script setup lang="ts">
   
    import { useSingleBin } from '~/composable/dryer_page/useSingleBin';
    import { BinStatus } from '~/generated/prisma/enums';
    import Init from '~/components/bin/Init.vue';
    import Process from '~/components/bin/Process.vue';
    import { useLot } from '~/composable/useLot';
    import Header from '~/components/Header.vue';

    const toast = useToast();
    const route = useRoute();
    const lotNumber = route.params.lotNumber as string;
    const areaId = parseInt(route.params.areaId as string);
    const binNumber = route.params.binNumber as string;

    const { lot_log, fetch_lot_log, data } = useLot();
    const { bin, fetch_bin } = useSingleBin();
    let dataLog = ref<any | null>(null); 

    const init = async () => {
        await fetch_bin(areaId, binNumber);   
        await fetch_lot_log(lotNumber, toast);
        dataLog.value = data(lot_log.value?.data.log || []);
    }

    init();
</script>

<template>
    <div v-if="lot_log == null || bin == null">
        LOADING
    </div>
    <div v-else>
        <Header/>
        <Init v-if="bin.data.binStatus == 'EMPTY'" :areaId="areaId" :lotNumber="lotNumber" :binNumber="binNumber" />
        <div v-else>
            <div v-if="dataLog == null">Loading2</div>
            <ClientOnly v-else>
                <Process :areaId="areaId" :lotNumber="lotNumber" :binNumber="binNumber" :data="dataLog" :lot="lot_log.data.lot" />
            </ClientOnly>
        </div>
    </div>
</template>