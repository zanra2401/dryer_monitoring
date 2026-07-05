<script setup lang="ts">
    import { useDryerList } from "~/composable/useDryerList";
    import { useRoute } from "vue-router";
    import { useDryerCRUD } from "~/composable/useDryerCRUD";

    const route = useRoute();
    const { fetch_dryer_list, current_data, pagination_data, next, prev, hasNext, hasPrev, total_page } = useDryerList();
    const { create_data, update_data, error, create_dryer, update_dryer, edit_state, update_edit_state, delete_dryer } = useDryerCRUD(fetch_dryer_list);
    fetch_dryer_list();
</script>

<template>
    <div v-if="current_data == null">
        LOADING
    </div>
    
    <div :style="{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        marginTop: '20px'
    }" v-else>
        <input v-model="create_data.name" placeholder="Enter dryer name" v-on:keyup="() => { console.log(create_data.name) }" />
        <button :style="{
            marginLeft: '10px'
        }" @click="create_dryer()">Create Dryer</button>
        <br/>
        <input v-if="edit_state" v-model="update_data.name" placeholder="Enter dryer name" v-on:keyup="() => { console.log(update_data.name) }" />
        <button v-if="edit_state" @click="update_dryer()">Update Dryer</button>
        <div v-for="dryer in current_data.data" :key="dryer.id"  :style="{
            marginBottom: '10px',
            marginTop: '10px',
        }">
            <NuxtLink :to="`/dryercfg/dryer/${dryer.areaId}`">
                {{ dryer.name }}
            </NuxtLink>


            <button :style="{
                marginLeft: '100px',
            }" @click="update_edit_state(dryer.areaId)">
                {{ edit_state && update_data.area_id == dryer.areaId ? 'Cancel' : 'Edit' }}
            </button>
            <button :style="{
                marginLeft: '10px',
            }" @click="delete_dryer(dryer.areaId)">
                DELETE
            </button>

        </div>
        <div>
            <button v-if="hasPrev" @click="prev()">Prev</button>
            <span v-for="page in total_page" :key="page">
                {{ page }}  
            </span>
            <button v-if="hasNext" @click="next()">
                Next
            </button>
        </div>
    </div>
</template>

