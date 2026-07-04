<script setup lang="ts">
  const { data, error } = await useFetch('/api/channel/channel', {
    method: 'POST',
    body: {
      channels: ["3419796"],
      apikeys: ["BIDYXDPUHB6RTMJM"],
      area_id: 1
    }
  });
</script>

<template>
  <div>
    {{  data }}
    {{  error }}
  </div>
</template>
