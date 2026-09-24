<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
import Readme from '@/assets/helpfile/Readme.pdf'
const url = ref('http://doc.ruoyi.vip/ruoyi-vue');

function goto() {
  window.open(Readme);
}
</script>