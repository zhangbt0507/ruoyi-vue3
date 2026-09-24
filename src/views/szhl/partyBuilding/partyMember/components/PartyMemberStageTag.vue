<template>
  <span class="stage-cell">
    <span v-if="displayClass" :class="displayClass">{{ stageLabel(hj) }}</span>
    <el-tag v-else-if="hj === MEMBER_STAGE.APPLY_TALK_OVERDUE" type="danger" size="small">
      {{ stageLabel(hj) }}
    </el-tag>
    <span v-else>{{ stageLabel(hj) }}</span>
    <el-tag v-if="showTransferRemind && isTransferRemindDue(row)" type="warning" size="small" class="ml4">
      转正提醒
    </el-tag>
  </span>
</template>

<script setup>
/** 党建管理 - 环节列展示（待定/待审核蓝色、确定绿色） */
import { computed } from 'vue'
import {
  MEMBER_STAGE,
  stageLabel,
  stageDisplayClass,
  isTransferRemindDue
} from '@/api/szhl/partyBuilding/partyMember'

const props = defineProps({
  hj: { type: String, default: '' },
  row: { type: Object, default: () => ({}) },
  showTransferRemind: { type: Boolean, default: false }
})

const displayClass = computed(() => stageDisplayClass(props.hj))
</script>

<style scoped>
.stage-cell {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}
.stage-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
}
.stage-tag-blue {
  color: #409eff;
  border: 1px solid #409eff;
  background-color: #ecf5ff;
}
.stage-tag-green {
  color: #67c23a;
  border: 1px solid #67c23a;
  background-color: #f0f9eb;
}
.ml4 {
  margin-left: 4px;
}
</style>
