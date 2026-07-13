<script setup lang="ts">
import { computed } from 'vue';
import type { TabsItem } from '@nuxt/ui';
import { useRoute, useRouter } from 'vue-router';
import AppSidebar from '~/components/AppSidebar.vue';
import Channel from '~/components/dryer_page/Channel.vue';
import Bins from '~/components/dryer_page/Bins.vue';
import Users from '~/components/dryer_page/Users.vue';
import AccessHeader from '~/components/dryer_page/header/AccessHeader.vue';
import ChannelHeader from '~/components/dryer_page/header/ChannelHeader.vue';
import BinsHeader from '~/components/dryer_page/header/BinHeader.vue';
import { useDryerPage } from '~/composable/dryer_page/useDryerPage';
import { useDryerAuth } from '~/composable/useDryerAuth';

const route = useRoute();
const router = useRouter();
const { user: sessionUser } = useDryerAuth();

const areaId = route.params.areaId as string;

const { current_header, current_page, set_page, page, set_loading_false, set_loading_true, loading } = useDryerPage();

const items = computed(() => {
  const baseItems: TabsItem[] = [
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
  ];

  if (sessionUser.value?.role === 'ADMIN') {
    baseItems.push({
      label: 'Access',
      icon: 'i-lucide-user-round-cog',
      slot: 'user',
    });
  }

  return baseItems;
});
</script>

<template>
  <AppSidebar :loading="false">
    <NuxtLink :to="`/dryercfg/dry-areas`">
      <UButton icon="i-lucide-move-left" variant="solid" size="md" color="neutral" class="cursor-pointer">Back</UButton>
    </NuxtLink>
    <div class="flex justify-between items-center mb-2 mt-4">
      <ChannelHeader :areaId="areaId" v-if="page == 0" />  
      <BinsHeader :areaId="areaId" v-else-if="page == 1" />
      <AccessHeader :areaId="areaId" v-slot="{}" v-else-if="page == 2 && sessionUser?.role === 'ADMIN'" />
    </div>
    <UTabs
      :items="items"
      :content="true"
      @update:model-value="(value: number | string ): any => { set_page(value as number); }"
      :ui="{
        list: 'justify-around w-full',
        trigger: 'grow gap-1 py-1',
        label: 'text-[10px]/3'
      }"
      class="w-full"
      variant="link"
      color="secondary"
    >
      <template #user>
        <Users :areaId="areaId" v-if="sessionUser?.role === 'ADMIN'" />
      </template>
      <template #channel>
        <Channel :areaId="areaId" />
      </template>
      <template #bins>
        <Bins :areaId="areaId" />
      </template>
    </UTabs>
  </AppSidebar>
</template>
