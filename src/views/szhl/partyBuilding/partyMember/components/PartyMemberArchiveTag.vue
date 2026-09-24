<template>
  <span v-if="displayClass" :class="displayClass">{{ label }}</span>
  <span v-else>{{ label }}</span>
</template>

<script setup>
/** 党建管理 - 档案字段带框展示（组织关系、党员状态、处分） */
defineProps({
  label: { type: String, default: '—' },
  displayClass: { type: String, default: '' }
})
</script>

<style scoped>
.archive-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
}
.archive-tag-green {
  color: #67c23a;
  border: 1px solid #67c23a;
  background-color: #f0f9eb;
}
.archive-tag-red {
  color: #c8161d;
  border: 1px solid #c8161d;
  background-color: #fdecee;
}
.archive-tag-gray {
  color: #909399;
  border: 1px solid #909399;
  background-color: #f4f4f5;
}
</style>
