<script setup lang="ts">
    import { useCRUDChannel } from '~/composable/dryer_page/useCRUDChannel';
    import { useDryerAuth } from '~/composable/useDryerAuth';

    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });

    const toast = useToast()
    const { user: sessionUser } = useDryerAuth();

    const { api_keys, post_channels, channels, change_create_state, create_state } = useCRUDChannel();
    const handleAdd = async () => {
        const result = await post_channels(parseInt(props.areaId), toast);
        if (result) {
            change_create_state(false);
            window.location.reload();
        }
    };
</script>

<template>
    <b>
        Channels
    </b>
    <UButton v-if="sessionUser?.role === 'ADMIN'" color="neutral"  @click="() => {change_create_state(true)}" class="cursor-pointer" >Add Channel</UButton>
    <UModal v-model:open="create_state" title="Add Channel" @close="(false)" >
        <template #body>
            <div>
                <UFormField label="Channel ID, contoh : 1,2,3">
                    <UInput v-model="channels" class="flex"/>
                </UFormField>
                <UFormField label="API Key, contoh : 1,2,3">
                    <UInput v-model="api_keys" class="flex" />
                </UFormField>
            </div>
        </template>
        <template #footer>
            <UButton color="primary" @click="handleAdd">Add</UButton>
        </template>
    </UModal>
</template>