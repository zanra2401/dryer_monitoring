<script setup lang="ts">
    import { useBin } from '~/composable/dryer_page/useBin';
    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });

    const { bins, fetch_bins } = useBin();   
    fetch_bins(parseInt(props.areaId));
</script>

<template>
    <div v-if="bins == null">
        LOADING
    </div>  
    <div v-else>
        {{ bins.data }}
        <div v-for="bin in bins.data" :key="bin.id">
            {{ bin.binNumber }}
            </br>
            {{ bin.channelId }}
            </br>
            {{ bin.fieldTempTop }}
            </br>
            {{ bin.fieldTempBottom }}
            </br>
            {{ bin.fieldRhTop }}
            </br>
            {{ bin.fieldRhBottom }}
            </br>
            {{ bin.binStatus }}
            </br>
            {{ bin.occupiedBy ? bin.occupiedBy : 'Not Occupied' }}
        </div>
    </div>
</template>

