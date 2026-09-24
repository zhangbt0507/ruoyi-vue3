<template>
  <el-dialog
    v-model="visible"
    title="「磐石筑基强深耕」资源采集表"
    width="920px"
    append-to-body
    destroy-on-close
    class="village-report-dialog"
    @closed="onClosed"
  >
    <VillageReportContent v-if="report" :report="report" @navigate-journals="onNavigateJournals" />
    <template #footer>
      <el-button type="primary" @click="visible = false">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import VillageReportContent from './VillageReportContent.vue'

const router = useRouter()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  report: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function onClosed() {
  emit('update:modelValue', false)
}

function onNavigateJournals() {
  const r = props.report
  visible.value = false
  if (!r) return
  router.push({
    path: '/villageResource/villageWeeklyJournal',
    query: {
      townshipName: r.townshipName || '',
      villageName: r.villageName || ''
    }
  })
}
</script>

<style scoped>
.village-report-dialog :deep(.el-dialog__body) {
  padding: 16px 20px 20px;
  background: #f0f2f5;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
