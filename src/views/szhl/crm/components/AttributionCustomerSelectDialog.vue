<template>
  <el-dialog
    title="客户信息选择引用"
    v-model="visible"
    width="900px"
    append-to-body
    class="customer-select-dialog"
  >
    <SearchForm
      v-model="query"
      :fields="searchFields"
      label-width="74px"
      :reset-fields-on-reset="false"
      class="customer-select-search"
      @keydown.enter.prevent
      @search="handleSearch"
      @reset="resetQuery"
    />
    <common-table
      :data="rows"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      height="360"
      class="customer-select-table"
    >
      <template #customerSelectOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #customerSelectManager="{ row }">
        {{ formatManagerName(row) }}
      </template>
      <template #customerSelectActions="{ row }">
        <el-button link type="primary" icon="Link" class="customer-select-action" @click="quoteCustomer(row)">引用</el-button>
      </template>
    </common-table>
  </el-dialog>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import SearchForm from '@/components/SearchForm'
import { addRelation } from '@/api/szhl/crm/attribution'
import { searchCustomer } from '@/api/szhl/crm/customer'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'

defineProps({
  orgOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['added'])
const { proxy } = getCurrentInstance()
const managerOptions = useUserOptions()

const visible = ref(false)
const loading = ref(false)
const rows = ref([])
const query = ref({ keyword: '' })
const customerId = ref('')
const searchFields = [
  {
    label: '关键字',
    prop: 'keyword',
    type: 'input',
    placeholder: '请输入客户名称或客户号'
  }
]
const columns = [
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, showOverflowTooltip: true },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true },
  { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { key: 'attributionOrg', label: '归属机构', prop: 'attributionOrg', width: 120, align: 'center', slot: 'customerSelectOrg' },
  { key: 'managerName', label: '管户经理', prop: 'managerName', width: 110, align: 'center', slot: 'customerSelectManager' },
  { key: 'actions', label: '操作', width: 100, align: 'center', fixed: 'right', slot: 'customerSelectActions' }
]

function formatManagerName (row) {
  const manager = row.managerName || row.managerId
  return formatUserDisplayName(managerOptions.value, manager, '')
}

function open (relationCustomerId) {
  customerId.value = relationCustomerId
  resetQuery()
  visible.value = true
}

function resetQuery () {
  query.value.keyword = ''
  rows.value = []
}

function handleSearch () {
  if (!query.value.keyword) {
    proxy.$modal.msgWarning('请输入客户名称或客户号')
    return
  }
  loading.value = true
  searchCustomer(query.value.keyword).then(res => {
    rows.value = res.data || []
  }).finally(() => {
    loading.value = false
  })
}

function quoteCustomer (row) {
  addRelation({ customerId: customerId.value, relationCustomerId: row.customerId }).then(() => {
    visible.value = false
    proxy.$modal.msgSuccess('新增关联成功')
    emit('added')
  })
}

defineExpose({ open })
</script>

<style scoped>
.customer-select-dialog {
  max-width: calc(100vw - 32px);
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 14%);
}

.customer-select-dialog :deep(.el-dialog__header) {
  box-sizing: border-box;
  height: 58px;
  margin-right: 0;
  padding: 18px 52px 16px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.customer-select-dialog :deep(.el-dialog__title) {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.customer-select-dialog :deep(.el-dialog__headerbtn) {
  top: 13px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.customer-select-dialog :deep(.el-dialog__headerbtn:hover) {
  background: var(--el-fill-color-light);
}

.customer-select-dialog :deep(.el-dialog__close) {
  color: var(--el-text-color-secondary);
  font-size: 18px;
}

.customer-select-dialog :deep(.el-dialog__body) {
  padding: 18px 20px 20px;
  color: var(--el-text-color-regular);
}

.customer-select-search {
  box-sizing: border-box;
  margin-bottom: 16px;
  padding: 14px 16px 2px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.customer-select-search :deep(.el-row) {
  flex-wrap: nowrap;
  align-items: flex-start;
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.customer-select-search :deep(.el-row > .el-col) {
  padding-right: 0 !important;
  padding-left: 0 !important;
}

.customer-select-search :deep(.el-row > .el-col:first-child) {
  flex: 1 1 520px;
  width: auto;
  max-width: 520px;
}

.customer-select-search :deep(.el-row > .el-col:last-child) {
  flex: 0 0 auto;
  width: auto;
  max-width: none;
  margin-left: 12px;
}

.customer-select-search :deep(.el-form-item),
.customer-select-search :deep(.search-form-actions) {
  margin-bottom: 12px;
}

.customer-select-search :deep(.el-form-item__label) {
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.customer-select-search :deep(.el-input__wrapper) {
  background: var(--el-bg-color);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

.customer-select-search :deep(.el-button) {
  min-width: 76px;
  margin-left: 0;
}

.customer-select-table {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.customer-select-table :deep(.el-table__header-wrapper th.el-table__cell),
.customer-select-table :deep(.el-table__fixed-header-wrapper th.el-table__cell) {
  height: 44px !important;
  padding: 0;
  border-bottom-color: var(--el-border-color-light);
  background: var(--el-fill-color-light) !important;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.customer-select-table :deep(.el-table__body td.el-table__cell) {
  height: 46px;
  padding: 0;
  border-bottom-color: var(--el-border-color-lighter);
}

.customer-select-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--el-color-primary-light-9);
}

.customer-select-table :deep(.el-table__empty-block) {
  background: var(--el-bg-color);
}

.customer-select-table :deep(.el-table__empty-text) {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.customer-select-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.customer-select-action {
  padding: 4px 8px;
  font-weight: 500;
}

@media (max-width: 767px) {
  .customer-select-dialog :deep(.el-dialog__header) {
    padding-left: 18px;
  }

  .customer-select-dialog :deep(.el-dialog__body) {
    padding: 14px;
  }

  .customer-select-search {
    padding: 12px 12px 0;
  }

  .customer-select-search :deep(.el-row) {
    flex-wrap: wrap;
  }

  .customer-select-search :deep(.el-row > .el-col:first-child) {
    flex-basis: 100%;
    width: 100%;
    max-width: 100%;
  }

  .customer-select-search :deep(.el-row > .el-col:last-child) {
    width: calc(100% - 74px);
    margin-left: 74px;
  }
}
</style>
