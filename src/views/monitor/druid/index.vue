<template>
   <div>
      <i-frame v-model:src="url"></i-frame>
   </div>
</template>

<script setup>
import iFrame from '@/components/iFrame'
import gatewayUrl from '@/utils/gatewayUrl'

import { ref } from 'vue';

const url = ref(gatewayUrl('/druid/login.html'));
</script>
