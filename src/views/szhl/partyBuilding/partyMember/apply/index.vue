<template>
  <PartyMemberPanel member-status="1" :can-add="true" :require-application="true" column-preset="apply" />
</template>

<script setup>
/** 党建管理 - 申请入党列表（复用党员列表面板，member-status=1） */
import PartyMemberPanel from '../components/PartyMemberPanel.vue'
</script>
