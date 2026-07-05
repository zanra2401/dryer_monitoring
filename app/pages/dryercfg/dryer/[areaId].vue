<script setup lang="ts">
    import { useDryerPage } from '~/composable/dryer_page/useDryerPage';
    const route = useRoute();
    const areaId = route.params.areaId;

    const { current_page, set_page, page, current_header } = useDryerPage();
    
</script>
<template>
    <div>
        <component :is="current_header()" :areaId="areaId as string" />
    </div>
    <div :style="{
        marginTop: '20px',
        marginBottom: '20px'
    }">
        <button :style="{
            marginRight: '10px'
        }" @click="set_page(0)">Channel</button>
        <button :style="{
            marginRight: '10px'
        }" @click="set_page(1)">Bins</button>
        <button :style="{
            marginRight: '10px'
        }" @click="set_page(2)">Can Access By</button>
    </div>
    <div>
        <component :is="current_page()" :areaId="areaId" />
    </div>
</template>