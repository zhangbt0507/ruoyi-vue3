<template>
  <div class="common-table" :class="rootClass" :style="rootStyle">
    <el-table
      ref="tableRef"
      v-loading="loading"
      v-bind="tableAttrs"
      :data="data"
      :height="tableHeight"
      class="common-table__body"
      :class="{ 'is-selectable': hasSelectionColumn }"
      @row-click="handleRowClick"
    >
      <template v-for="column in normalizedColumns" :key="column.key || column.prop || column.type">
        <el-table-column v-bind="column.attrs">
          <template v-if="column.slot && $slots[column.slot]" #default="scope">
            <slot :name="column.slot" v-bind="scope" />
          </template>
        </el-table-column>
      </template>

      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </el-table>

    <common-pagination
      v-if="pagination && total > 0"
      :total="total"
      :page="page"
      :limit="limit"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :layout="paginationLayout"
      :background="paginationBackground"
      @update:page="emit('update:page', $event)"
      @update:limit="emit('update:limit', $event)"
      @pagination="emit('pagination', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'CommonTable',
  inheritAttrs: false
}
</script>

<script setup>
import { computed, ref, useAttrs } from 'vue'
import CommonPagination from '@/components/CommonPagination'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  // 操作列（key 为 actions 的列）固定位置：'left' / 'right'，默认固定在左侧
  actionFixed: {
    type: String,
    default: 'left'
  },
  loading: {
    type: Boolean,
    default: false
  },
  height: {
    type: [String, Number],
    default: undefined
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  pagination: {
    type: Boolean,
    default: true
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50, 100]
  },
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  paginationLayout: {
    type: String,
    default: 'prev, pager, next, jumper'
  },
  paginationBackground: {
    type: Boolean,
    default: true
  },
  emptyString: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])
const attrs = useAttrs()
const columnExtraKeys = ['key', 'slot', 'visible']
const tableRef = ref()

const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style)
const tableHeight = computed(() => props.height)
const tableAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  delete rest.style
  delete rest.height
  // 数据为空时的提示文案（优先级高于透传的 empty-text）
  if (props.emptyString !== undefined) {
    rest['empty-text'] = props.emptyString
  }
  return rest
})

const normalizedColumns = computed(() => {
  const list = props.columns
    .filter(column => column && column.visible !== false)
    .map(column => {
      const attrs = { ...column }
      columnExtraKeys.forEach(key => delete attrs[key])
      if (props.actionFixed && column.key === 'actions') {
        attrs.fixed = props.actionFixed
      }
      return {
        key: column.key,
        prop: column.prop,
        type: column.type,
        slot: column.slot,
        attrs
      }
    })
  // 操作列排位随 actionFixed 统一调整：left 排在勾选列之后，right 排到最后
  if (props.actionFixed) {
    const actionIndex = list.findIndex(column => column.key === 'actions')
    if (actionIndex >= 0) {
      const [actionColumn] = list.splice(actionIndex, 1)
      if (props.actionFixed === 'right') {
        list.push(actionColumn)
      } else {
        let insertAt = 0
        while (insertAt < list.length && list[insertAt].type === 'selection') {
          insertAt++
        }
        list.splice(insertAt, 0, actionColumn)
      }
    }
  }
  return list
})

const hasSelectionColumn = computed(() =>
  props.columns.some(column => column && column.visible !== false && column.type === 'selection')
)

// 点击行内交互控件（按钮、链接、输入框等）时不触发行选中，避免误操作
const interactiveSelector = 'a, button, input, textarea, label, .el-link, .el-checkbox, .el-switch, .el-radio, .el-select'

function handleRowClick(row, column, event) {
  if (!hasSelectionColumn.value) return
  // 勾选列自身的点击已由 checkbox 处理，再切换会抵消
  if (column && column.type === 'selection') return
  if (event.target.closest && event.target.closest(interactiveSelector)) return
  tableRef.value?.toggleRowSelection(row)
}
</script>

<style scoped>
.common-table {
  width: 100%;
}

.common-table__body :deep(.cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.common-table__body :deep(.el-table__header th) {
  height: 48px;
}

.common-table__body :deep(.el-table__body td) {
  padding: 8px 0;
}

.common-table__body.is-selectable :deep(.el-table__body .el-table__row) {
  cursor: pointer;
}

.common-table__body :deep(.el-link),
.common-table__body :deep(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.common-table__body :deep(.el-link__inner) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
