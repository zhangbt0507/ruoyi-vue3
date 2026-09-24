<template>
  <div class="app-container crm-page">
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      :show-search="showSearch"
      label-width="86px"
      show-actions-when-collapsed
      @search="handleQuery"
      @reset="resetQuery"
    >
      <template #queryOrg>
        <CrmOrgSelect v-model="queryParams.queryOrg" />
      </template>
      <template #actions-right>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </template>
    </SearchForm>

    <common-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      :data="tableList"
      :columns="deferTableColumns"
      :total="total"
      height="560"
      @pagination="getList"
    >
      <template #actions="{ row }">
        <el-button v-if="row.status !== '审批完成'" link type="primary" @click="openApprove(row)" v-hasPermi="['crm:defer:approve']">审批</el-button>
      </template>
      <template #reportDate="{ row }">{{ parseTime(row.reportDate, '{y}-{m}-{d}') }}</template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #deferRange="{ row }">{{ formatDeferRange(row) }}</template>
      <template #reportOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.reportOrg" />
      </template>
      <template #reportBy="{ row }">{{ formatUser(row.reportBy) }}</template>
      <template #status="{ row }">
        <el-tag :type="row.status === '审批完成' ? 'success' : 'warning'">{{ row.status }}</el-tag>
      </template>
      <template #approveOrg="{ row }">
        <dict-tag v-if="row.approveOrg" :options="orgOptions" :value="row.approveOrg" />
        <span v-else>-</span>
      </template>
      <template #approveBy="{ row }">{{ formatUser(row.approveBy) }}</template>
      <template #approveDate="{ row }">{{ parseTime(row.approveDate, '{y}-{m}-{d}') || '-' }}</template>
      <template #approveComment="{ row }">{{ row.approveComment || '-' }}</template>
    </common-table>

    <el-dialog title="暂缓触达审批" v-model="approveOpen" width="620px" append-to-body>
      <el-form :model="approveForm" label-width="100px" class="dialog-form-grid">
        <el-form-item label="客户名称">
          <el-input v-model="approveForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="客户号">
          <el-input v-model="approveForm.customerNo" disabled />
        </el-form-item>
        <el-form-item label="上报机构">
          <dict-tag :options="orgOptions" :value="approveForm.reportOrg" />
        </el-form-item>
        <el-form-item label="上报人">
          <span>{{ formatUser(approveForm.reportBy) }}</span>
        </el-form-item>
        <el-form-item label="上报日期">
          <el-input :model-value="parseTime(approveForm.reportDate, '{y}-{m}-{d}')" disabled />
        </el-form-item>
        <el-form-item label="暂缓期限">
          <el-input :model-value="formatDeferRange(approveForm)" disabled />
        </el-form-item>
        <el-form-item label="申请理由" class="dialog-form-full">
          <el-input v-model="approveForm.reason" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="审批意见" class="dialog-form-full">
          <el-input v-model="approveForm.approveComment" type="textarea" :rows="3" placeholder="请输入审批意见" />
        </el-form-item>
        <el-form-item label="审批结果">
          <el-select v-model="approveForm.approveResult" placeholder="请选择" style="width: 100%">
            <el-option label="同意暂缓" value="approve" />
            <el-option label="不同意暂缓" value="reject" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitApprove">提交审批</el-button>
        <el-button @click="approveOpen = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Defer">
import { computed, getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { listDefer, approveDefer } from '@/api/szhl/crm/defer'
import SearchForm from '@/components/SearchForm'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()

const deferStatusOptions = ['未审批', '审批完成']

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const approveOpen = ref(false)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    customerNo: undefined,
    queryOrg: undefined,
    status: undefined
  },
  approveForm: {}
})

const { queryParams, approveForm } = toRefs(data)

const deferTableColumns = computed(() => [
  { key: 'actions', label: '操作', width: 90, align: 'center', fixed: 'right', slot: 'actions' },
  { key: 'reportDate', label: '上报日期', prop: 'reportDate', width: 120, align: 'center', slot: 'reportDate' },
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
  { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
  { key: 'deferRange', label: '暂缓期限', width: 210, align: 'center', slot: 'deferRange' },
  { key: 'reason', label: '申请理由', prop: 'reason', minWidth: 220, showOverflowTooltip: true },
  { key: 'reportOrg', label: '上报机构', prop: 'reportOrg', width: 120, align: 'center', slot: 'reportOrg' },
  { key: 'reportBy', label: '上报人', prop: 'reportBy', width: 100, align: 'center', slot: 'reportBy' },
  { key: 'status', label: '处理状态', prop: 'status', width: 110, align: 'center', slot: 'status' },
  { key: 'approveOrg', label: '审批机构', prop: 'approveOrg', width: 120, align: 'center', slot: 'approveOrg' },
  { key: 'approveBy', label: '审批人', prop: 'approveBy', width: 100, align: 'center', slot: 'approveBy' },
  { key: 'approveDate', label: '审批日期', prop: 'approveDate', width: 120, align: 'center', slot: 'approveDate' },
  { key: 'approveComment', label: '审批意见', prop: 'approveComment', minWidth: 180, showOverflowTooltip: true, slot: 'approveComment' }
])

const searchFields = computed(() => [
  {
    label: '客户名称',
    prop: 'customerName',
    type: 'input',
    placeholder: '请输入客户名称'
  },
  {
    label: '客户号',
    prop: 'customerNo',
    type: 'input',
    placeholder: '请输入客户号'
  },
  {
    label: '机构号',
    prop: 'queryOrg',
    type: 'slot',
    slotName: 'queryOrg'
  },
  {
    label: '处理状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择',
    options: deferStatusOptions.map(item => ({ label: item, value: item }))
  }
])

function getList() {
  loading.value = true
  listDefer(queryParams.value).then(res => {
    tableList.value = res.rows
    total.value = res.total
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  Object.assign(queryParams.value, {
    pageNum: 1,
    customerName: undefined,
    customerNo: undefined,
    queryOrg: undefined,
    status: undefined
  })
  getList()
}

function formatUser(value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function formatDeferRange(row) {
  const start = proxy.parseTime(row.deferStart, '{y}-{m}-{d}')
  const end = proxy.parseTime(row.deferEnd, '{y}-{m}-{d}')
  return start || end ? `${start || '-'} 至 ${end || '-'}` : '-'
}

function openApprove(row) {
  approveForm.value = {
    ...row,
    approveComment: '',
    approveResult: 'approve'
  }
  approveOpen.value = true
}

function submitApprove() {
  approveDefer({
    id: approveForm.value.id,
    approved: approveForm.value.approveResult === 'approve',
    comment: approveForm.value.approveComment
  }).then(() => {
    approveOpen.value = false
    proxy.$modal.msgSuccess('审批已提交')
    getList()
  })
}

getList()
</script>

<style scoped>
.dialog-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
}

.dialog-form-grid :deep(.el-form-item) {
  margin-bottom: 12px;
}

.dialog-form-full {
  grid-column: 1 / 3;
}
</style>
