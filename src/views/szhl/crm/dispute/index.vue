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
      <template #actions-left>
        <el-divider direction="vertical" />
        <el-button plain icon="Download" @click="handleExport" v-hasPermi="['crm:dispute:export']">导出</el-button>
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
      :columns="disputeTableColumns"
      :total="total"
      height="560"
      class="dispute-table"
      @pagination="getList"
    >
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #createTime="{ row }">{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</template>
      <template #originalOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.originalOrg" />
      </template>
      <template #newOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.newOrg" />
      </template>
      <template #initiator="{ row }">{{ formatUser(row.initiator) }}</template>
      <template #pendingParty="{ row }">
        <dict-tag v-if="row.status === '2' && row.reviewOrg" :options="orgOptions" :value="row.reviewOrg" />
        <el-tag v-else-if="row.status === '3'" effect="plain">总行裁定</el-tag>
        <span v-else>{{ pendingPartyText(row) }}</span>
      </template>
      <template #waitingDays="{ row }">{{ waitingDaysText(row) }}</template>
      <template #status="{ row }">
        <el-tag :type="statusTagType(row.status)">{{ selectDictLabel(disputeStatusOptions, row.status) }}</el-tag>
      </template>
      <template #actions="{ row }">
        <div class="row-actions">
          <el-button v-if="canProcess(row)" link type="primary" @click.stop="openProcess(row)">{{ processActionLabel(row) }}</el-button>
          <el-button link type="primary" @click.stop="openDetail(row)">查看</el-button>
        </div>
      </template>
    </common-table>

    <el-dialog :title="detailTitle" v-model="detailOpen" width="860px" top="6vh" append-to-body>
      <div class="dispute-detail">
        <div class="detail-header">
          <div>
            <div class="detail-title">{{ detailRow.customerName || '-' }}</div>
            <div class="detail-subtitle">客户号：{{ detailRow.customerNo || '-' }}</div>
          </div>
          <el-tag :type="statusTagType(detailRow.status)">{{ selectDictLabel(disputeStatusOptions, detailRow.status) || '-' }}</el-tag>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">
            <div>
              <div class="detail-section__title">申请复议信息</div>
              <div class="detail-section__desc">发起人提交的调整申请内容</div>
            </div>
            <el-tag effect="plain">{{ detailRow.disputeType || '-' }}</el-tag>
          </div>
          <div class="org-change-panel">
            <div class="org-change-side">
              <div class="org-change-label">原归属机构</div>
              <div class="org-change-value">
                <dict-tag v-if="detailRow.originalOrg" :options="orgOptions" :value="detailRow.originalOrg" />
                <span v-else>-</span>
              </div>
            </div>
            <el-icon class="org-change-arrow"><Right /></el-icon>
            <div class="org-change-side">
              <div class="org-change-label">申请归属机构</div>
              <div class="org-change-value">
                <dict-tag v-if="detailRow.newOrg" :options="orgOptions" :value="detailRow.newOrg" />
                <span v-else>-</span>
              </div>
            </div>
          </div>
          <el-descriptions :column="2" border size="small" class="detail-descriptions">
            <el-descriptions-item label="调整日期">{{ parseTime(detailRow.createTime, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="待处理方">{{ pendingPartyText(detailRow) }}</el-descriptions-item>
            <el-descriptions-item label="发起人">
              {{ formatUser(detailRow.initiator) }}
            </el-descriptions-item>
            <el-descriptions-item label="调整状态">
              <el-tag :type="statusTagType(detailRow.status)" effect="plain">{{ selectDictLabel(disputeStatusOptions, detailRow.status) || '-' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="调整理由" :span="2">
              <span class="detail-long-text">{{ detailRow.reason || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">
            <div>
              <div class="detail-section__title">复议处理信息</div>
              <div class="detail-section__desc">复议机构和复议人的处理记录</div>
            </div>
            <el-tag :type="reviewTagType(detailRow)" effect="plain">{{ reviewStatusText(detailRow) }}</el-tag>
          </div>
          <el-descriptions :column="2" border size="small" class="detail-descriptions">
            <el-descriptions-item label="复议机构">
              <dict-tag v-if="detailRow.reviewOrg" :options="orgOptions" :value="detailRow.reviewOrg" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="复议人">
              {{ formatUser(detailRow.reviewer) }}
            </el-descriptions-item>
            <el-descriptions-item label="复议日期">{{ parseTime(detailRow.reviewDate, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="处理方式">{{ detailRow.processType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="复议意见" :span="2">
              <span class="detail-long-text">{{ detailRow.reviewerOpinion || reviewEmptyText(detailRow) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">
            <div>
              <div class="detail-section__title">裁定处理信息</div>
              <div class="detail-section__desc">总行裁定人和最终归属结果</div>
            </div>
            <el-tag :type="adjudicateTagType(detailRow)" effect="plain">{{ adjudicateStatusText(detailRow) }}</el-tag>
          </div>
          <el-descriptions :column="2" border size="small" class="detail-descriptions">
            <el-descriptions-item label="裁定人">
              {{ formatUser(detailRow.adjudicator) }}
            </el-descriptions-item>
            <el-descriptions-item label="裁定日期">{{ parseTime(detailRow.adjudicateDate, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最终归属机构" :span="2">
              <dict-tag v-if="detailRow.finalOrg" :options="orgOptions" :value="detailRow.finalOrg" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="裁定意见" :span="2">
              <span class="detail-long-text">{{ detailRow.adjudicatorOpinion || adjudicateEmptyText(detailRow) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="processDialogTitle" v-model="processOpen" width="760px" append-to-body>
      <div class="process-summary">
        <div>
          <div class="process-title">{{ processForm.customerName || '-' }}</div>
          <div class="process-subtitle">客户号：{{ processForm.customerNo || '-' }}</div>
        </div>
        <el-tag :type="statusTagType(processForm.status)">{{ selectDictLabel(disputeStatusOptions, processForm.status) }}</el-tag>
      </div>

      <div class="org-change-panel">
        <div class="org-change-side">
          <div class="org-change-label">原归属机构</div>
          <div class="org-change-value">
            <dict-tag v-if="processForm.originalOrg" :options="orgOptions" :value="processForm.originalOrg" />
            <span v-else>-</span>
          </div>
        </div>
        <el-icon class="org-change-arrow"><Right /></el-icon>
        <div class="org-change-side">
          <div class="org-change-label">申请归属机构</div>
          <div class="org-change-value">
            <dict-tag v-if="processForm.newOrg" :options="orgOptions" :value="processForm.newOrg" />
            <span v-else>-</span>
          </div>
        </div>
      </div>

      <el-descriptions :column="2" border size="small" class="process-descriptions">
        <el-descriptions-item label="调整类型">{{ processForm.disputeType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="调整发起人">
          {{ formatUser(processForm.initiator) }}
        </el-descriptions-item>
        <el-descriptions-item label="复议机构">
          <dict-tag v-if="processForm.reviewOrg" :options="orgOptions" :value="processForm.reviewOrg" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="已等待">{{ waitingDaysText(processForm) }}</el-descriptions-item>
      </el-descriptions>

      <el-form :model="processForm" label-width="110px" class="process-form">
        <el-form-item label="调整理由">
          <el-input v-model="processForm.reason" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input v-model="processForm.opinion" type="textarea" :rows="3" placeholder="请输入处理意见" />
        </el-form-item>
        <el-form-item v-if="processForm.status !== '3'" label="复议结论">
          <el-radio-group v-model="processForm.action" class="decision-radio-group">
            <el-radio label="AGREE">同意调整至申请机构</el-radio>
            <el-radio label="REJECT">不同意，提交总行裁定</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-else>
          <el-form-item label="裁定结论">
            <el-radio-group v-model="processForm.adjudicateDecision" class="decision-radio-group" @change="handleAdjudicateDecisionChange">
              <el-radio label="NEW">同意调整至申请机构</el-radio>
              <el-radio label="ORIGINAL">维持原归属机构</el-radio>
              <el-radio label="OTHER">指定其他机构</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="processForm.adjudicateDecision === 'OTHER'" label="最终归属机构">
            <el-select v-model="processForm.finalOrg" placeholder="请选择最终归属机构" filterable style="width: 100%">
              <el-option v-for="item in orgOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitProcess">{{ processSubmitText }}</el-button>
        <el-button @click="processOpen = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dispute">
import { computed, getCurrentInstance, onDeactivated, reactive, ref, toRefs, watch } from 'vue'
import { listDispute, processDispute } from '@/api/szhl/crm/dispute'
import useUserStore from '@/store/modules/user'
import SearchForm from '@/components/SearchForm'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { selectDictLabel } from '@/utils/ruoyi'
import { checkPermi, checkRole } from '@/utils/permission'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const { crm_dispute_status: disputeStatusOptions } = proxy.useDict('crm_dispute_status')
const userStore = useUserStore()

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const processOpen = ref(false)
const detailOpen = ref(false)
const detailRow = ref({})
const quickStatus = ref('ALL')
const orgProcessRoles = ['crm_manager', 'president', 'assistant', 'commander']

const statusQuickOptions = [
  { label: '全部', value: 'ALL' },
  { label: '发起', value: '1' },
  { label: '待复议', value: '2' },
  { label: '待裁定', value: '3' },
  { label: '已完成', value: '4' }
]

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    customerNo: undefined,
    disputeType: undefined,
    queryOrg: undefined,
    status: undefined
  },
  processForm: {}
})

const { queryParams, processForm } = toRefs(data)

const detailTitle = computed(() => {
  return detailRow.value.customerName ? `调整详情 - ${detailRow.value.customerName}` : '调整详情'
})

const processDialogTitle = computed(() => {
  return processForm.value.status === '3' ? '总行裁定' : '调整复议'
})

const processSubmitText = computed(() => {
  return processForm.value.status === '3' ? '提交裁定' : '提交复议'
})
const isHeadOffice = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('crm_header')
})

const canUseProcess = computed(() => {
  return checkPermi(['crm:dispute:process']) || checkRole(['crm_header', ...orgProcessRoles])
})
const disputeTableColumns = computed(() => [
  { key: 'actions', label: '操作', width: 120, align: 'center', fixed: 'left', className: 'small-padding fixed-width', slot: 'actions' },
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
  { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
  { key: 'createTime', label: '调整日期', prop: 'createTime', width: 120, align: 'center', slot: 'createTime' },
  { key: 'disputeType', label: '调整类型', prop: 'disputeType', width: 90, align: 'center' },
  { key: 'originalOrg', label: '原归属机构', prop: 'originalOrg', width: 140, align: 'center', showOverflowTooltip: true, slot: 'originalOrg' },
  { key: 'newOrg', label: '申请归属机构', prop: 'newOrg', width: 140, align: 'center', showOverflowTooltip: true, slot: 'newOrg' },
  { key: 'reason', label: '调整理由', prop: 'reason', width: 220, showOverflowTooltip: true },
  { key: 'initiator', label: '发起人', prop: 'initiator', width: 110, align: 'center', showOverflowTooltip: true, slot: 'initiator' },
  { key: 'pendingParty', label: '待处理方', width: 150, align: 'center', showOverflowTooltip: true, slot: 'pendingParty' },
  { key: 'waitingDays', label: '已等待', width: 90, align: 'center', slot: 'waitingDays' },
  { key: 'status', label: '调整状态', prop: 'status', width: 80, align: 'center', slot: 'status' }
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
    label: '调整类型',
    prop: 'disputeType',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '调入', value: '调入' },
      { label: '调出', value: '调出' }
    ]
  },
  {
    label: '相关机构',
    prop: 'queryOrg',
    type: 'slot',
    slotName: 'queryOrg'
  },
  {
    label: '调整状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择',
    options: disputeStatusOptions.value || []
  }
])

watch(
  () => queryParams.value.status,
  (status) => {
    quickStatus.value = status || 'ALL'
  }
)

function getList() {
  loading.value = true
  listDispute(queryParams.value).then(res => {
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
    disputeType: undefined,
    queryOrg: undefined,
    status: undefined
  })
  getList()
}

function handleQuickStatusChange(status) {
  queryParams.value.status = status === 'ALL' ? undefined : status
  handleQuery()
}

function canProcess(row) {
  if (!row) return false
  if (!canUseProcess.value) return false
  if (row.status === '2') {
    return !isHeadOffice.value && row.initiator !== userStore.name
  }
  if (row.status === '3') {
    return isHeadOffice.value
  }
  return false
}

function processActionLabel(row) {
  if (row.status === '3') return '裁定'
  if (row.status === '2') return '复议'
  return '处理'
}

function pendingPartyText(row) {
  if (!row) return '-'
  if (row.status === '2') {
    return selectDictLabel(orgOptions.value || [], row.reviewOrg) || '-'
  }
  if (row.status === '3') return '总行裁定'
  if (row.status === '4') return '已完成'
  if (row.status === '1') return '待复议'
  return '-'
}

function formatUser(value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function reviewStatusText(row) {
  if (!row) return '-'
  if (row.reviewer) return '已复议'
  if (row.status === '2') return '待复议'
  return '未复议'
}

function reviewTagType(row) {
  if (row && row.reviewer) return 'success'
  if (row && row.status === '2') return 'warning'
  return 'info'
}

function reviewEmptyText(row) {
  return row && row.status === '2' ? '待复议人填写' : '-'
}

function adjudicateStatusText(row) {
  if (!row) return '-'
  if (row.adjudicator) return '已裁定'
  if (row.status === '3') return '待裁定'
  return '无需裁定'
}

function adjudicateTagType(row) {
  if (row && row.adjudicator) return 'success'
  if (row && row.status === '3') return 'warning'
  return 'info'
}

function adjudicateEmptyText(row) {
  return row && row.status === '3' ? '待裁定人填写' : '-'
}

function parseDateValue(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(String(value).replace(/-/g, '/'))
  return Number.isNaN(date.getTime()) ? null : date
}

function waitingDaysText(row) {
  if (!row || (row.status !== '2' && row.status !== '3')) return '-'
  const createDate = parseDateValue(row.createTime)
  if (!createDate) return '-'
  const days = Math.max(0, Math.floor((Date.now() - createDate.getTime()) / 86400000))
  return days > 0 ? `${days}天` : '当天'
}

function handleAdjudicateDecisionChange(decision) {
  if (decision === 'NEW') {
    processForm.value.finalOrg = processForm.value.newOrg
  } else if (decision === 'ORIGINAL') {
    processForm.value.finalOrg = processForm.value.originalOrg
  } else {
    processForm.value.finalOrg = undefined
  }
}

function openDetail(row) {
  detailRow.value = { ...row }
  detailOpen.value = true
}

function openProcess(row) {
  if (!canProcess(row)) {
    proxy.$modal.msgWarning(processDisabledText(row))
    return
  }
  processForm.value = {
    ...row,
    opinion: '',
    action: row.status === '3' ? 'ADJUDICATE' : undefined,
    adjudicateDecision: undefined,
    finalOrg: undefined
  }
  processOpen.value = true
}

function processDisabledText(row) {
  if (!row) return '当前记录不可处理'
  if (row.status === '2' && row.initiator === userStore.name) return '调整发起人不能复议本人发起的调整申请'
  if (row.status === '2' && isHeadOffice.value) return '复议需由待复议机构处理，总行仅处理裁定环节'
  if (row.status === '3' && !isHeadOffice.value) return '仅总行可执行裁定'
  return '当前状态不可处理'
}

// 调整状态：4完成/3裁定中/2复议中/1发起
function statusTagType(status) {
  if (status === '4') return 'success'
  if (status === '2') return 'warning'
  if (status === '3') return ''
  return 'info'
}

function submitProcess() {
  if (!canProcess(processForm.value)) {
    proxy.$modal.msgWarning(processDisabledText(processForm.value))
    return
  }
  if (!processForm.value.action) {
    proxy.$modal.msgWarning('请选择处理结论')
    return
  }
  if (processForm.value.action === 'ADJUDICATE') {
    if (!processForm.value.adjudicateDecision) {
      proxy.$modal.msgWarning('请选择裁定结论')
      return
    }
    if (!processForm.value.finalOrg) {
      proxy.$modal.msgWarning('请选择最终归属机构')
      return
    }
  }
  processDispute({
    id: processForm.value.id,
    action: processForm.value.action,
    opinion: processForm.value.opinion,
    finalOrg: processForm.value.finalOrg
  }).then(() => {
    processOpen.value = false
    proxy.$modal.msgSuccess('调整处理已提交')
    getList()
  })
}

function handleExport() {
  const params = { ...queryParams.value }
  delete params.pageNum
  delete params.pageSize
  proxy.download('/crm/dispute/export', params, '归属变动审批.xlsx')
}

onDeactivated(() => {
  detailOpen.value = false
  processOpen.value = false
})

getList()
</script>

<style scoped>
.status-quick-filter {
  vertical-align: middle;
}

.dispute-table :deep(.cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dispute-table :deep(.el-link),
.dispute-table :deep(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.row-actions .el-button {
  margin-left: 0;
}

.detail-header,
.process-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-title,
.process-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.detail-subtitle,
.process-subtitle {
  margin-top: 2px;
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}

.detail-section {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.detail-section__title {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.detail-section__desc {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.org-change-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.org-change-side {
  min-width: 0;
}

.org-change-label {
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.org-change-value {
  min-height: 24px;
  color: #303133;
  font-size: 14px;
  line-height: 24px;
}

.org-change-arrow {
  justify-self: center;
  color: #909399;
}

.detail-descriptions,
.process-descriptions {
  margin-bottom: 12px;
}

.detail-section .detail-descriptions {
  margin-bottom: 0;
}

.detail-long-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 20px;
}

.process-form {
  margin-top: 12px;
}

.process-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.decision-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
</style>
