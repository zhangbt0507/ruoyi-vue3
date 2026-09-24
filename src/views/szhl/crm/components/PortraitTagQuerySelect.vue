<template>
  <div class="ptqs-trigger">
    <el-input
      :model-value="displayText"
      :placeholder="placeholder"
      readonly
      class="ptqs-input"
      @click="openDialog"
    >
      <template #suffix>
        <el-tooltip v-if="selectedIds.length > 0" content="清空画像标签" placement="top">
          <el-icon class="ptqs-clear" @click.stop="clearSelected"><CircleClose /></el-icon>
        </el-tooltip>
      </template>
    </el-input>

    <PortraitTagDialog
      ref="dialogRef"
      mode="select"
      :show-import="false"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup name="PortraitTagQuerySelect">
import { computed, ref } from 'vue'
import PortraitTagDialog from './PortraitTagDialog'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  matchMode: {
    type: String,
    default: 'ANY'
  },
  tags: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '点击选择画像标签'
  }
})

const emit = defineEmits(['update:modelValue', 'update:matchMode', 'change'])

const dialogRef = ref()

const selectedIds = computed(() => normalizeIds(props.modelValue))
const selectedMatchMode = computed(() => normalizeMatchMode(props.matchMode))

const tagMap = computed(() => {
  const map = {}
  props.tags.forEach(item => { map[String(item.id)] = item })
  return map
})

const selectedLeafNames = computed(() => selectedIds.value
  .map(id => tagMap.value[id]?.tagName)
  .filter(Boolean))

const displayText = computed(() => {
  if (selectedLeafNames.value.length === 0) return ''
  if (selectedLeafNames.value.length <= 3) return selectedLeafNames.value.join('、')
  return `已选 ${selectedLeafNames.value.length} 个画像标签`
})

function openDialog() {
  dialogRef.value?.open([], {
    selectedIds: selectedIds.value,
    matchMode: selectedMatchMode.value
  })
}

function handleConfirm(ids, matchMode) {
  emit('update:modelValue', ids)
  emit('update:matchMode', matchMode || 'ANY')
  emit('change', ids)
}

function clearSelected() {
  emit('update:modelValue', [])
  emit('update:matchMode', 'ANY')
  emit('change', [])
}

function normalizeIds(value) {
  return (Array.isArray(value) ? value : [])
    .filter(item => item !== undefined && item !== null && item !== '')
    .map(item => String(item))
}

function normalizeMatchMode(value) {
  return String(value).toUpperCase() === 'ALL' ? 'ALL' : 'ANY'
}
</script>

<style scoped>
.ptqs-trigger {
  width: 100%;
}

.ptqs-input :deep(.el-input__wrapper) {
  cursor: pointer;
}

.ptqs-clear {
  cursor: pointer;
  color: #909399;
}

.ptqs-clear:hover {
  color: #409eff;
}
</style>
