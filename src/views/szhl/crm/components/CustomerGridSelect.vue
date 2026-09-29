<template>
  <div class="cgs-trigger">
    <el-input
      :model-value="displayText"
      :placeholder="placeholder"
      readonly
      class="cgs-input"
      @click="openDialog"
    >
      <template #suffix>
        <el-tooltip v-if="hasValue" content="清空客户网格" placement="top">
          <el-icon class="cgs-clear" @click.stop="clearSelected"><CircleClose /></el-icon>
        </el-tooltip>
      </template>
    </el-input>

    <AttributionRegionGridDialog ref="dialogRef" mode="select" @confirm="handleConfirm" />
  </div>
</template>

<script setup name="CustomerGridSelect">
import { computed, ref, watch } from 'vue'
import { CircleClose } from '@element-plus/icons-vue'
import AttributionRegionGridDialog from './AttributionRegionGridDialog'
import { loadPath } from '@/views/szhl/crm/composables/useRegionTree'

const props = defineProps({
  // 选中的网格编码（查询用）
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: '点击选择客户网格'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const dialogRef = ref()
const gridName = ref('')

const hasValue = computed(() => props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '')
// 回显网格名（行政区划树有缓存）；父组件重置清空编码时同步清掉
const displayText = computed(() => (hasValue.value ? `${gridName.value || props.modelValue}（${props.modelValue}）` : ''))

watch(
  () => props.modelValue,
  async code => {
    if (code === undefined || code === null || code === '') {
      gridName.value = ''
      return
    }
    const node = await loadPath(String(code))
    // 编码在等待期间又变了，丢弃过期结果
    if (String(props.modelValue) !== String(code)) return
    gridName.value = node ? node.name : ''
  },
  { immediate: true }
)

function openDialog () {
  dialogRef.value?.open({ gridCode: hasValue.value ? props.modelValue : '' })
}

function handleConfirm (node) {
  emit('update:modelValue', node.code)
  emit('change', node.code)
}

function clearSelected () {
  emit('update:modelValue', '')
  emit('change', '')
}
</script>

<style scoped>
.cgs-trigger {
  width: 100%;
}

.cgs-input :deep(.el-input__wrapper) {
  cursor: pointer;
}

.cgs-clear {
  cursor: pointer;
  color: #909399;
}

.cgs-clear:hover {
  color: #409eff;
}
</style>
