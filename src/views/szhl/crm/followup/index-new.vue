<template>
  <div class="app-container crm-page">
    <!-- 使用新的 SearchForm 组件 -->
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      :show-search="showSearch"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Edit" :disabled="single" @click="openProcess()" v-hasPermi="['crm:followup:create']">处理跟踪</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Check" :disabled="single" @click="openProcess(undefined, '1')" v-hasPermi="['crm:followup:create']">完成</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['crm:followup:export']">导出数据</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <common-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      :data="tableList"
      :columns="followupTableColumns"
      :total="total"
      height="560"
      @selection-change="handleSelectionChange"
      @pagination="getList"
    >
      <template #loadDate="{ row }">{{ parseTime(row.loadDate, '{y}-{m}-{d}') }}</template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #groupName="{ row }">{{ row.groupName || '-' }}</template>
      <template #followupStage="{ row }">
        <el-tag :type="row.followupStage === '跟踪中' ? 'warning' : 'info'">
          {{ row.followupStage || '待跟踪' }}
        </el-tag>
      </template>
      <template #lastContactDate="{ row }">{{ parseTime(row.lastContactDate, '{y}-{m}-{d}') || '-' }}</template>
      <template #lastContactResult="{ row }">{{ selectDictLabel(contactResultOptions, row.lastContactResult) || '-' }}</template>
      <template #lastFollowupDate="{ row }">{{ parseTime(row.lastFollowupDate, '{y}-{m}-{d}') || '-' }}</template>
      <template #lastFollowupStatus="{ row }">
        <el-tag v-if="row.lastFollowupStatus" :type="row.lastFollowupStatus === '1' ? 'success' : 'warning'">
          {{ row.lastFollowupStatus === '1' ? '完成' : '未完' }}
        </el-tag>
        <span v-else>-</span>
      </template>
      <template #lastFollowupResult="{ row }">{{ row.lastFollowupResult || '-' }}</template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #attributionManager="{ row }">{{ formatUser(row.attributionManager) }}</template>
      <template #actions="{ row }">
        <el-button link type="primary" @click="openProcess(row)" v-hasPermi="['crm:followup:create']">处理</el-button>
        <el-button link type="primary" @click="openHistory(row)">历史</el-button>
        <el-button link type="primary" @click="openCustomer360(row)">详情</el-button>
      </template>
    </common-table>

    <el-dialog title="后续跟踪处理" v-model="processOpen" width="680px" append-to-body>
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="processForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="客户号">
          <el-input v-model="processForm.customerNo" disabled />
        </el-form-item>
        <el-form-item label="跟踪客群">
          <el-input :model-value="processForm.groupName || '客户级触达'" disabled />
        </el-form-item>
        <el-form-item label="跟踪事项">
          <el-input v-model="processForm.followupItem" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="跟踪日期">
          <el-date-picker v-model="processForm.followupDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="跟踪方式">
          <el-select v-model="processForm.followupWay" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in contactWayOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟踪状态">
          <el-radio-group v-model="processForm.followupStatus">
            <el-radio label="0">未完</el-radio>
            <el-radio label="1">完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跟踪结果">
          <el-input v-model="processForm.followupResult" placeholder="请输入跟踪结果" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="processForm.followupNote" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitProcess">保存</el-button>
        <el-button @click="processOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="跟踪历史" v-model="historyOpen" width="920px" append-to-body>
      <div class="followup-history-header">
        <span>客户名称：{{ historyCustomer.customerName || '-' }}</span>
        <span>客户号：{{ historyCustomer.customerNo || '-' }}</span>
        <span>跟踪客群：{{ historyCustomer.groupName || '客户级触达' }}</span>
        <span class="followup-history-item">跟踪事项：{{ historyCustomer.followupItem || '-' }}</span>
      </div>
      <el-table v-loading="historyLoading" :data="historyRows" border max-height="420" empty-text="暂无跟踪历史">
        <el-table-column label="跟踪日期" width="110" align="center">
          <template #default="{ row }">{{ parseTime(row.followupDate, '{y}-{m}-{d}') || '-' }}</template>
        </el-table-column>
        <el-table-column label="跟踪方式" width="110" align="center">
          <template #default="{ row }">{{ selectDictLabel(contactWayOptions, row.followupWay) || '-' }}</template>
        </el-table-column>
        <el-table-column label="跟踪状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.followupStatus === '1' ? 'success' : 'warning'">
              {{ row.followupStatus === '1' ? '完成' : '未完' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="覆盖客群" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.groupNames || '客户级触达' }}</template>
        </el-table-column>
        <el-table-column label="跟踪结果" min-width="240">
          <template #default="{ row }">
            <span class="followup-history-text">{{ row.followupResult || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="240">
          <template #default="{ row }">
            <span class="followup-history-text">{{ row.followupNote || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="跟踪人" prop="followupBy" width="110" align="center" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="historyOpen = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CrmFollowup">
import { computed, getCurrentInstance, reactive, ref, toRefs } from 'vue'
import SearchForm from '@/components/SearchForm'
import { listFollowup, listFollowupHistory, createFollowup } from '@/api/szhl/crm/followup'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import { useCustomer360Nav } from '@/views/szhl/crm/composables/useCustomer360Nav'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const { crm_contact_way: contactWayOptions, crm_contact_result: contactResultOptions } = proxy.useDict('crm_contact_way', 'crm_contact_result')
const { openViewByNo } = useCustomer360Nav()

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const selection = ref([])
const processOpen = ref(false)
const historyOpen = ref(false)
const historyLoading = ref(false)
const historyRows = ref([])
const historyCustomer = ref({})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    customerNo: undefined,
    queryOrg: undefined,
    managerId: undefined
  },
  processForm: {}
})

const { queryParams, processForm } = toRefs(data)
const single = computed(() => selection.value.length !== 1)
const followupTableColumns = computed(() => [
  { type: 'selection', width: 50, align: 'center', fixed: 'left' },
  { key: 'loadDate', label: '载入日期', prop: 'loadDate', width: 120, align: 'center', fixed: 'left', slot: 'loadDate' },
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
  { key: 'groupName', label: '客群', prop: 'groupName', width: 160, showOverflowTooltip: true, slot: 'groupName' },
  { key: 'followupStage', label: '流程状态', prop: 'followupStage', width: 100, align: 'center', slot: 'followupStage' },
  { key: 'followupItem', label: '跟踪事项', prop: 'followupItem', minWidth: 260, showOverflowTooltip: true },
  { key: 'lastContactDate', label: '上次触达日期', prop: 'lastContactDate', width: 130, align: 'center', slot: 'lastContactDate' },
  { key: 'lastContactResult', label: '上次触达情况', prop: 'lastContactResult', width: 160, showOverflowTooltip: true, slot: 'lastContactResult' },
  { key: 'followupCount', label: '跟踪次数', prop: 'followupCount', width: 100, align: 'right' },
  { key: 'lastFollowupDate', label: '最近跟踪日期', prop: 'lastFollowupDate', width: 130, align: 'center', slot: 'lastFollowupDate' },
  { key: 'lastFollowupStatus', label: '最近跟踪状态', prop: 'lastFollowupStatus', width: 120, align: 'center', slot: 'lastFollowupStatus' },
  { key: 'lastFollowupResult', label: '最近跟踪结果', prop: 'lastFollowupResult', width: 180, showOverflowTooltip: true, slot: 'lastFollowupResult' },
  { key: 'attributionOrg', label: '机构号', prop: 'attributionOrg', width: 120, align: 'center', slot: 'attributionOrg' },
  { key: 'attributionManager', label: '管户经理', prop: 'attributionManager', width: 110, align: 'center', slot: 'attributionManager' },
  { key: 'actions', label: '操作', width: 150, align: 'center', fixed: 'right', slot: 'actions' }
])

// 搜索字段配置
const searchFields = [
  {
    label: '客户名称',
    prop: 'customerName',
    type: 'input',
    placeholder: '请输入客户名称',
    clearable: true
  },
  {
    label: '客户号',
    prop: 'customerNo',
    type: 'input',
    placeholder: '请输入客户号',
    clearable: true
  },
  {
    label: '机构号',
    prop: 'queryOrg',
    type: 'select',
    placeholder: '请选择机构',
    filterable: true,
    clearable: true,
    options: orgOptions
  },
  {
    label: '管户经理',
    prop: 'managerId',
    type: 'userSelect',
    placeholder: '请选择管户经理',
    filterable: true,
    clearable: true
  }
]

function getList() {
  loading.value = true
  listFollowup(queryParams.value).then(res => {
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
  getList()
}

function formatUser(value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function handleSelectionChange(rows) {
  selection.value = rows
}

function openHistory(row) {
  if (!row.contactId) {
    proxy.$modal.msgWarning('缺少触达记录，无法查看跟踪历史')
    return
  }
  historyCustomer.value = {
    customerName: row.customerName,
    customerNo: row.customerNo,
    groupName: row.groupName,
    followupItem: row.followupItem
  }
  historyRows.value = []
  historyOpen.value = true
  historyLoading.value = true
  listFollowupHistory(row.contactId).then(res => {
    historyRows.value = res.data || []
  }).finally(() => {
    historyLoading.value = false
  })
}

function openProcess(row, presetStatus) {
  const target = row && row.customerNo ? row : selection.value[0]
  processForm.value = {
    contactId: target.contactId,
    customerId: target.customerId,
    customerName: target.customerName,
    customerNo: target.customerNo,
    groupId: target.groupId,
    groupName: target.groupName,
    followupItem: target.followupItem,
    followupDate: proxy.parseTime(new Date(), '{y}-{m}-{d}'),
    followupWay: '1',
    followupStatus: presetStatus || '0',
    followupResult: '',
    followupNote: ''
  }
  processOpen.value = true
}

function submitProcess() {
  const form = processForm.value
  createFollowup({
    contactId: form.contactId,
    customerId: form.customerId,
    customerName: form.customerName,
    followupDate: form.followupDate,
    followupWay: form.followupWay,
    followupResult: form.followupResult,
    followupNote: form.followupNote,
    followupStatus: form.followupStatus,
    groupIds: form.groupId ? [form.groupId] : []
  }).then(() => {
    processOpen.value = false
    proxy.$modal.msgSuccess('后续跟踪处理已保存')
    getList()
  })
}

function handleExport() {
  const params = { ...queryParams.value }
  delete params.pageNum
  delete params.pageSize
  proxy.download('/crm/followup/export', params, '后续跟踪.xlsx', { appCode: 'crm' })
}

function openCustomer360(row) {
  openViewByNo(row.customerNo, row.publicPrivateType, row.customerName)
}

getList()
</script>

<style scoped>
.followup-history-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin-bottom: 12px;
  color: #606266;
  line-height: 22px;
}

.followup-history-item {
  flex-basis: 100%;
}

.followup-history-text {
  display: inline-block;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 20px;
}
</style>
