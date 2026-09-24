<template>
  <el-select-v2
    class="user-select"
    :model-value="modelValue"
    :options="userOptions"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :disabled="disabled"
    :loading="loading"
    :height="height"
    :item-height="itemHeight"
    :no-match-text="noMatchText"
    :no-data-text="noDataText"
    style="width: 100%"
    @visible-change="handleVisibleChange"
    @update:model-value="handleUpdate"
    @change="handleChange"
  />
</template>

<script setup name="UserSelect">
import { onMounted, ref } from 'vue'
import { USER_OPTION_SCOPE, getUserOptionsByScope, isUserOptionsLoadedByScope, useUserOptionsByScope } from '@/utils/userEnum'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择员工'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  filterable: {
    type: Boolean,
    default: true
  },
  multiple: {
    type: Boolean,
    default: false
  },
  collapseTags: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  scope: {
    type: String,
    default: USER_OPTION_SCOPE.ALL
  },
  height: {
    type: Number,
    default: 260
  },
  itemHeight: {
    type: Number,
    default: 34
  },
  noMatchText: {
    type: String,
    default: '无匹配员工'
  },
  noDataText: {
    type: String,
    default: '暂无员工数据'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const userOptions = useUserOptionsByScope(props.scope)
const loading = ref(!isUserOptionsLoadedByScope(props.scope))

function loadOptions() {
  loading.value = !isUserOptionsLoadedByScope(props.scope)
  getUserOptionsByScope(props.scope)
    .catch(() => {
      // 失败时保持空列表，由请求拦截器统一提示。
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(loadOptions)

function handleVisibleChange(visible) {
  if (visible && !isUserOptionsLoadedByScope(props.scope)) {
    loadOptions()
  }
}

function handleUpdate(value) {
  emit('update:modelValue', value)
}

function handleChange(value) {
  emit('change', value)
}
</script>
