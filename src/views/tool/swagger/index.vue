<template>
   <i-frame v-model:src="url"></i-frame>
</template>

<script setup>
import iFrame from '@/components/iFrame'
import gatewayUrl from '@/utils/gatewayUrl'

const url = ref(gatewayUrl("/swagger-ui/index.html"))
</script>
