<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import { useDryerPage } from '~/composable/dryer_page/useDryerPage';
import { useRoute, useRouter } from 'vue-router'
import Channel from '~/components/dryer_page/Channel.vue';
import Bins from '~/components/dryer_page/Bins.vue';
import type { TabsItem } from '@nuxt/ui'
import AccessHeader from '~/components/dryer_page/header/AccessHeader.vue';
import ChannelHeader from '~/components/dryer_page/header/ChannelHeader.vue';
import BinsHeader from '~/components/dryer_page/header/BinHeader.vue';


const route = useRoute();
const router = useRouter();

const areaId = route.params.areaId as string;

const { current_header, current_page, set_page, page, set_loading_false, set_loading_true, loading } = useDryerPage();

const items: TabsItem[] = [
{
    label: 'Channel',
    icon: 'i-lucide-rss',
    slot: 'channel',
},
{
    label: 'Bins',
    icon: 'i-lucide-box',
    slot: 'bins',
},
{
    label: 'Access',
    icon: 'i-lucide-user-round-cog',
    slot: 'user',
},
]


</script>

<template>
  <AppSidebar :loading="false">
    <NuxtLink :to="`/dryercfg`">
      <UButton icon="i-lucide-move-left" variant="solid" size="md" color="neutral" class="cursor-pointer">Back</UButton>
    </NuxtLink>
      <div class="flex justify-between items-center mb-2">
          <ChannelHeader :areaId="areaId" v-if="page == 0" />  
          <BinsHeader :areaId="areaId" v-else-if="page == 1" />
          <AccessHeader :areaId="areaId" v-else-if="page == 2" />
      </div>
      <UTabs
        :items="items"
        :content="true"
        @update:model-value="(value: number | string ): any => { set_page(value as number); }"
        :ui="{
          list: 'justify-around w-full',
          trigger: 'grow  gap-1 py-1',
          label: 'text-[10px]/3'
        }"
        class="w-full"
        variant="link"
        color="secondary"
    >
        <template #user>
          <User :areaId="areaId"  />
        </template>
        <template #channel>
          <Channel :areaId="areaId"  />
        </template>
        <template #bins>
          <Bins :areaId="areaId"  />
        </template>
    </UTabs>
  </AppSidebar>
</template>