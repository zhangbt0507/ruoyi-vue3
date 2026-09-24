<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    class="search-form"
    :label-width="labelWidth"
  >
    <el-row :gutter="gutter">
      <!-- 动态渲染字段 -->
      <el-col
        v-for="field in fields"
        :key="field.prop"
        v-bind="getColSpan(field)"
        v-show="showSearch"
      >
        <el-form-item :label="field.label" :prop="field.prop">
          <!-- input 输入框 -->
          <el-input
            v-if="field.type === 'input'"
            :model-value="formData[field.prop]"
            :placeholder="field.placeholder"
            :clearable="field.clearable !== false"
            @keyup.enter="handleSearch"
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          />

          <!-- textarea 文本域 -->
          <el-input
            v-else-if="field.type === 'textarea'"
            :model-value="formData[field.prop]"
            type="textarea"
            :placeholder="field.placeholder"
            :rows="field.rows || 3"
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          />

          <!-- select 下拉框 -->
          <el-select
            v-else-if="field.type === 'select'"
            :model-value="formData[field.prop]"
            :placeholder="field.placeholder || '请选择'"
            :clearable="field.clearable !== false"
            :filterable="field.filterable || false"
            :multiple="field.multiple || false"
            :popper-class="field.popperClass"
            collapse-tags
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          >
            <el-option
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <!-- userSelect 员工选择 -->
          <UserSelect
            v-else-if="field.type === 'userSelect'"
            :model-value="formData[field.prop]"
            :placeholder="field.placeholder || '请选择员工'"
            :clearable="field.clearable !== false"
            :filterable="field.filterable !== false"
            :multiple="field.multiple || false"
            :collapse-tags="field.collapseTags !== false"
            :disabled="field.disabled || false"
            :scope="field.scope || 'all'"
            :height="field.height || 260"
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          />

          <!-- radio 单选按钮组 -->
          <el-radio-group
            v-else-if="field.type === 'radio'"
            :model-value="formData[field.prop]"
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          >
            <el-radio
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>

          <!-- date 日期选择器 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            :model-value="formData[field.prop]"
            :type="field.dateType || 'date'"
            :placeholder="field.placeholder || '请选择日期'"
            :value-format="field.valueFormat || 'YYYY-MM-DD'"
            :clearable="field.clearable !== false"
            style="width: 100%"
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          />

          <!-- daterange 日期范围选择器 -->
          <el-date-picker
            v-else-if="field.type === 'daterange'"
            :model-value="formData[field.prop]"
            :type="field.dateType || 'daterange'"
            :value-format="field.valueFormat || 'YYYY-MM-DD'"
            :range-separator="field.rangeSeparator || '-'"
            :start-placeholder="field.startPlaceholder || '开始日期'"
            :end-placeholder="field.endPlaceholder || '结束日期'"
            :clearable="field.clearable !== false"
            style="width: 100%"
            @update:model-value="updateField(field, $event)"
            @change="handleFieldChange(field, $event)"
          />

          <!-- slot 自定义插槽 -->
          <slot
            v-else-if="field.type === 'slot'"
            :name="field.slotName"
            :field="field"
            :model="formData"
          />
        </el-form-item>
      </el-col>

      <!-- 操作按钮区域 -->
      <el-col v-show="showSearch || showActionsWhenCollapsed" :span="24">
        <el-form-item class="search-form-actions" label-width="0">
          <slot name="actions" :search="handleSearch" :reset="handleReset">
            <div class="search-form-actions__bar">
              <div class="search-form-actions__left">
                <!-- 搜索按钮 -->
                <el-button
                  v-if="searchButton"
                  :type="searchButton.type || 'primary'"
                  :icon="searchButton.icon || 'Search'"
                  @click="handleSearch"
                >
                  {{ searchButton.text || '搜索' }}
                </el-button>

                <!-- 重置按钮 -->
                <el-button
                  v-if="resetButton"
                  :icon="resetButton.icon || 'Refresh'"
                  @click="handleReset"
                >
                  {{ resetButton.text || '重置' }}
                </el-button>

                <!-- 额外按钮 -->
                <el-button
                  v-for="(btn, index) in extraButtons"
                  :key="index"
                  :type="btn.type"
                  :icon="btn.icon"
                  :plain="btn.plain"
                  :disabled="btn.disabled"
                  @click="btn.click"
                >
                  {{ btn.text }}
                </el-button>

                <slot name="actions-left" :search="handleSearch" :reset="handleReset" />
              </div>
              <div v-if="$slots['actions-right']" class="search-form-actions__right">
                <slot name="actions-right" :search="handleSearch" :reset="handleReset" />
              </div>
            </div>
          </slot>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup name="SearchForm">
import { nextTick, reactive, ref, watch } from 'vue'
import UserSelect from '@/components/UserSelect'

const props = defineProps({
  // 字段配置数组
  fields: {
    type: Array,
    required: true,
    default: () => []
  },

  // 表单数据对象（v-model）
  modelValue: {
    type: Object,
    required: true
  },

  // 表单校验规则
  rules: {
    type: Object,
    default: () => ({})
  },

  // label 宽度
  labelWidth: {
    type: String,
    default: '110px'
  },

  // 是否显示搜索区域
  showSearch: {
    type: Boolean,
    default: true
  },

  // 搜索区域收起时是否保留操作行（用于放置 right-toolbar 等常驻工具）
  showActionsWhenCollapsed: {
    type: Boolean,
    default: false
  },

  // 搜索按钮配置
  searchButton: {
    type: [Object, Boolean],
    default: () => ({
      text: '搜索',
      icon: 'Search',
      type: 'primary'
    })
  },

  // 重置按钮配置
  resetButton: {
    type: [Object, Boolean],
    default: () => ({
      text: '重置',
      icon: 'Refresh'
    })
  },

  // 额外按钮配置数组
  extraButtons: {
    type: Array,
    default: () => []
  },

  // 行间距
  gutter: {
    type: Number,
    default: 16
  }
})

const emit = defineEmits([
  'update:modelValue',
  'search',
  'reset',
  'field-change'
])

const formRef = ref(null)
const formData = reactive({})
let syncingFromParent = false
let updatingField = false

// 默认列宽配置（每行4列）
const defaultSpan = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
  xl: 6
}

// 获取列宽配置
const getColSpan = (field) => {
  return field.span || defaultSpan
}

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const getDefaultValue = (field) => {
  if (hasOwn(field, 'defaultValue')) {
    return field.defaultValue
  }
  return field.multiple || field.type === 'daterange' ? [] : undefined
}

const buildFormData = (model = {}) => {
  const next = { ...model }
  props.fields.forEach(field => {
    if (field.prop && !hasOwn(next, field.prop)) {
      next[field.prop] = getDefaultValue(field)
    }
  })
  return next
}

const syncFormData = (model = {}) => {
  syncingFromParent = true
  const next = buildFormData(model)

  Object.keys(formData).forEach(key => {
    if (!hasOwn(next, key)) {
      delete formData[key]
    }
  })

  Object.keys(next).forEach(key => {
    if (formData[key] !== next[key]) {
      formData[key] = next[key]
    }
  })

  nextTick(() => {
    syncingFromParent = false
  })
}

const emitModelValue = () => {
  emit('update:modelValue', { ...props.modelValue, ...formData })
}

// 文本类字段：无论手动输入还是复制粘贴，统一去掉前后空格
const TEXT_FIELD_TYPES = ['input', 'textarea']

const normalizeValue = (field, value) => {
  if (TEXT_FIELD_TYPES.includes(field.type) && typeof value === 'string') {
    return value.trim()
  }
  return value
}

const updateField = (field, value) => {
  if (!field.prop) return
  updatingField = true
  formData[field.prop] = normalizeValue(field, value)
  emitModelValue()
  nextTick(() => {
    updatingField = false
  })
}

// 父级原地 Object.assign 重置时，同步到内部稳定对象，避免替换引用。
watch(
  () => props.modelValue,
  (newVal) => {
    syncFormData(newVal)
  },
  { immediate: true, deep: true }
)

// fields 变化时补齐新增字段 key，保证动态字段一开始就是响应式的。
watch(
  () => props.fields,
  () => {
    syncFormData(props.modelValue)
  },
  { deep: true }
)

// 兼容插槽直接修改 model 的场景。
watch(
  formData,
  () => {
    if (!syncingFromParent && !updatingField) {
      emitModelValue()
    }
  },
  { deep: true }
)

// 字段变化处理
const handleFieldChange = (field, value) => {
  const nextValue = normalizeValue(field, value)

  // 触发字段自定义 change 回调
  if (field.change && typeof field.change === 'function') {
    field.change(nextValue)
  }

  // 触发统一的 field-change 事件
  emit('field-change', { prop: field.prop, value: nextValue })
}

// 搜索按钮点击
const handleSearch = async () => {
  // 如果有校验规则，先校验
  if (Object.keys(props.rules).length > 0) {
    try {
      await formRef.value.validate()
      emit('search')
    } catch (error) {
      // 校验失败，不触发搜索事件
      console.log('表单校验失败:', error)
    }
  } else {
    // 没有校验规则，直接触发搜索
    emit('search')
  }
}

// 重置按钮点击
const handleReset = () => {
  // 不依赖 el-form.resetFields()——它对多选数组等场景会因引用比较失效。
  // 改为：遍历 fields 配置，逐字段重置为 defaultValue（或类型对应的空值），
  // 确保所有内置组件类型（input/select 多选/daterange/userSelect/radio 等）都能彻底清空。
  props.fields.forEach(field => {
    if (!field.prop) return
    formData[field.prop] = getDefaultValue(field)
  })
  emitModelValue()
  // 清除校验状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
  emit('reset')
}

// 暴露表单实例方法，供父组件调用
defineExpose({
  validate: () => formRef.value.validate(),
  resetFields: () => formRef.value.resetFields(),
  clearValidate: () => formRef.value.clearValidate()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 4px;
}

.search-form :deep(.el-form-item) {
  display: flex;
  margin-bottom: 12px;
}

.search-form :deep(.el-form-item__label) {
  flex: 0 0 v-bind(labelWidth);
  color: #606266;
  font-weight: 400;
}

.search-form :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}

.search-form :deep(.el-input),
.search-form :deep(.el-select),
.search-form :deep(.el-select-v2) {
  width: 100%;
}

.search-form :deep(.el-input__inner) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-form-actions {
  margin-bottom: 8px;
}

.search-form-actions__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.search-form-actions__left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.search-form-actions__right {
  flex: 0 0 auto;
}

.search-form-actions__left :deep(.el-button),
.search-form-actions__left :deep(.el-dropdown),
.search-form-actions__left > .el-button {
  margin-left: 0;
}
</style>
