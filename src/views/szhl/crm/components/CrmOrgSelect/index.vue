<template>
  <el-select
    :model-value="selectedId"
    filterable
    popper-class="crm-org-select-dropdown"
    :placeholder="placeholderText"
    no-match-text="无匹配机构"
    :no-data-text="emptyText"
    :clearable="clearable"
    :disabled="disabled || loading"
    :filter-method="filterMethod"
    style="width: 100%"
    @update:model-value="handleUpdate"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in visibleOptions"
      :key="item.code"
      :value="item.code"
      :label="item.name"
    >
      <span class="crm-org-option">
        <span class="crm-org-option__label">{{ item.name }}</span>
        <span class="crm-org-option__code">{{ item.code }}</span>
      </span>
    </el-option>
  </el-select>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCrmOrgOptions } from '@/views/szhl/crm/composables/useCrmOrgOptions'

const props = defineProps({
  // 对外是单个机构号字符串；历史调用可能传入数组或逗号分隔值，取首个兼容
  modelValue: {
    type: [String, Number, Array],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择机构'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const { orgOptions, loading, loadFailed } = useCrmOrgOptions()

const keyword = ref('')

// 前端模糊查询：机构名称或机构号任一命中即保留
const visibleOptions = computed(() => {
  const text = keyword.value.trim()
  if (!text) return orgOptions.value
  return orgOptions.value.filter(item => (item.name || '').includes(text) || item.code.includes(text))
})

// 兼容历史的数组 / 逗号分隔值，单选只取第一个
const selectedId = computed(() => {
  const value = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  return String(value).split(',')[0].trim() || undefined
})

const placeholderText = computed(() => {
  if (loading.value) return '机构加载中...'
  if (loadFailed.value) return '机构列表加载失败'
  return props.placeholder
})

const emptyText = computed(() => (loadFailed.value ? '机构列表加载失败' : '无可选机构'))

function filterMethod(value) {
  keyword.value = value || ''
}

function handleVisibleChange(visible) {
  if (!visible) keyword.value = ''
}

// 清空时收敛为 undefined，与页面重置行为一致
function handleUpdate(value) {
  const next = value === undefined || value === null || value === '' ? undefined : String(value)
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style>
/* 下拉挂在 body 上，scoped 样式够不到，统一用 popper-class 限定作用域 */
.crm-org-select-dropdown .crm-org-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
}

.crm-org-select-dropdown .crm-org-option__label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 目标环境含 safari13，不用 flex gap */
.crm-org-select-dropdown .crm-org-option__code {
  flex-shrink: 0;
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
