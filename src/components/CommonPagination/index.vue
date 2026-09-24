<template>
  <div class="common-pagination">
    <div class="common-pagination__total">共 {{ total }} 条</div>
    <div class="common-pagination__right">
      <el-select
        class="common-pagination__page-size"
        :model-value="limit"
        @change="handleSizeChange"
      >
        <el-option
          v-for="size in pageSizes"
          :key="size"
          :label="`${size}条/页`"
          :value="size"
        />
      </el-select>
      <el-pagination
        :background="background"
        :current-page="page"
        :page-size="limit"
        :layout="layout"
        :pager-count="pagerCount"
        :total="total"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonPagination'
}
</script>

<script setup>
const props = defineProps({
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
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50, 100]
  },
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  layout: {
    type: String,
    default: 'prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

function emitPagination(page, limit) {
  emit('pagination', { page, limit })
}

function handleSizeChange(limit) {
  const page = props.page * limit > props.total ? 1 : props.page
  emit('update:limit', limit)
  if (page !== props.page) {
    emit('update:page', page)
  }
  emitPagination(page, limit)
}

function handleCurrentChange(page) {
  emit('update:page', page)
  emitPagination(page, props.limit)
}
</script>

<style scoped>
.common-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 16px 20px 0;
  background: #fff;
}

.common-pagination__total {
  flex: 0 0 auto;
  min-width: 92px;
  color: #303133;
  font-size: 14px;
  line-height: 32px;
}

.common-pagination :deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #303133;
  font-weight: 400;
}

.common-pagination :deep(.el-pager) {
  gap: 8px;
}

.common-pagination__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 40px;
}

.common-pagination__page-size {
  width: 84px;
}

.common-pagination__page-size :deep(.el-input__wrapper) {
  height: 32px;
  padding: 0 8px 0 10px;
  border-radius: 6px;
}

.common-pagination__page-size :deep(.el-input__inner) {
  font-size: 14px;
  height: 32px;
  line-height: 32px;
  text-align: left;
}

.common-pagination__page-size :deep(.el-input__suffix) {
  flex: 0 0 14px;
  width: 14px;
  margin-left: 2px;
}

.common-pagination__page-size :deep(.el-input__suffix-inner) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
}

.common-pagination__page-size :deep(.el-input__validateIcon) {
  display: none;
}

.common-pagination__page-size :deep(.el-input__suffix-inner > .el-icon:not(.el-select__caret)) {
  display: none;
}

.common-pagination__page-size :deep(.el-select__caret) {
  width: 14px;
  height: 14px;
  margin-left: 0;
  color: #909399;
  font-size: 14px;
}

.common-pagination :deep(.el-pagination .el-input__inner) {
  height: 32px;
  line-height: 32px;
  border-radius: 6px;
}

.common-pagination :deep(.el-pagination button),
.common-pagination :deep(.el-pager li) {
  min-width: 32px;
  height: 32px;
  margin: 0;
  border-radius: 6px;
  background: #f5f7fb;
  color: #606266;
  font-weight: 400;
  line-height: 32px;
}

.common-pagination :deep(.el-pagination button:hover),
.common-pagination :deep(.el-pager li:hover) {
  color: var(--el-color-primary);
}

.common-pagination :deep(.el-pager li.is-active) {
  background: var(--el-color-primary);
  color: #fff;
}

.common-pagination :deep(.el-pagination button:disabled) {
  background: #f5f7fb;
  color: #c0c4cc;
}

.common-pagination :deep(.el-pagination__jump) {
  margin: 0;
  color: #606266;
}

.common-pagination :deep(.el-pagination__jump .el-input) {
  width: 52px;
  margin: 0 8px;
}

@media (max-width: 768px) {
  .common-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .common-pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .common-pagination__right {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
