<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1440px"
    top="5vh"
    append-to-body
    class="loan-detail-dialog"
  >
    <el-form :inline="true" class="loan-detail-filter" @submit.prevent="loadLoanDetail">
      <el-form-item label="数据日期">
        <el-date-picker
          v-model="loanDetailQuery.reportDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择"
          :disabled-date="loanDateDisabled"
          :clearable="false"
          @change="handleLoanDateChange"
        />
      </el-form-item>
      <el-form-item label="合同号">
        <el-input v-model="loanDetailQuery.contractNo" clearable placeholder="请输入合同号" @keyup.enter="loadLoanDetail" />
      </el-form-item>
      <el-form-item label="担保方式">
        <el-select v-model="loanDetailQuery.guaranteeType" clearable placeholder="全部">
          <el-option label="信用" value="信用" />
          <el-option label="保证" value="保证" />
          <el-option label="抵押" value="抵押" />
          <el-option label="质押" value="质押" />
          <el-option label="组合" value="组合" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联并表">
        <el-switch v-model="loanDetailQuery.consolidated" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="loadLoanDetail">查询</el-button>
        <el-button icon="Refresh" @click="resetLoanDetailQuery">重置</el-button>
        <el-button icon="Download" :loading="loanDetailExporting" @click="exportLoanDetailRows">导出</el-button>
        <el-popover placement="bottom-start" :width="360" trigger="click">
          <template #reference><el-button icon="Operation">显示列</el-button></template>
          <div class="loan-column-popover">
            <div class="loan-column-toolbar">
              <el-button link type="primary" @click="setLoanColumns(true)">全选</el-button>
              <el-button link @click="setLoanColumns(false)">不选</el-button>
            </div>
            <el-checkbox-group v-model="loanDetailVisibleColumns" :max="30">
              <el-checkbox v-for="column in loanDetailColumns" :key="column.key" :label="column.key">{{ column.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-popover>
      </el-form-item>
    </el-form>
    <div class="loan-detail-meta">
      <span>共 {{ loanDetailSummary.total || 0 }} 条</span>
      <span>合同总额：{{ formatLoanWan(loanDetailSummary.contractTotal) }} 万元</span>
      <span>发放总额：{{ formatLoanWan(loanDetailSummary.issueTotal) }} 万元</span>
      <span>贷款总额：{{ formatLoanWan(loanDetailSummary.balanceTotal) }} 万元</span>
      <span>加权利率：{{ formatLoanRate(loanDetailSummary.weightedRate) }}%</span>
    </div>
    <el-table v-loading="loanDetailLoading" :data="loanDetailRows" border stripe height="560" empty-text="暂无贷款明细">
      <el-table-column
        v-for="column in visibleLoanDetailColumns"
        :key="column.key"
        :label="column.label"
        :prop="column.key"
        :min-width="column.width || 120"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span>{{ formatLoanCell(scope.row, column) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="loan-detail-pagination">
      <common-pagination
        :total="Number(loanDetailSummary.total) || 0"
        :page="loanDetailQuery.pageNum"
        :limit="loanDetailQuery.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @update:page="loanDetailQuery.pageNum = $event"
        @update:limit="loanDetailQuery.pageSize = $event"
        @pagination="loadLoanDetail"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { queryAttributionLoanDetail, exportAttributionLoanDetail } from '@/api/szhl/crm/attribution'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const visible = ref(false)
const loanDetailLoading = ref(false)
const loanDetailExporting = ref(false)
const loanDetailCustomer = ref({})
const loanDetailRows = ref([])
const loanDetailSummary = ref({ total: 0, contractTotal: 0, issueTotal: 0, balanceTotal: 0, weightedRate: 0 })
const loanDetailQuery = reactive({ customerId: '', reportDate: '', contractNo: '', guaranteeType: '', consolidated: false, pageNum: 1, pageSize: 10 })
const loanDetailColumns = [
  { key: 'reportDate', label: '数据日期', width: 110 },
  { key: 'orgNo', label: '机构号', width: 100 },
  { key: 'custNo', label: '客户号', width: 150 },
  { key: 'custName', label: '客户名称', width: 150 },
  { key: 'contractNo', label: '借款合同', width: 160 },
  { key: 'iouNum', label: '借据序号', width: 90 },
  { key: 'loanAcct', label: '贷款账号', width: 160 },
  { key: 'staidate', label: '发放日期', width: 110 },
  { key: 'stacdate', label: '到期日期', width: 110 },
  { key: 'loanUse', label: '贷款用途', width: 140 },
  { key: 'guaType', label: '担保方式', width: 110 },
  { key: 'staerate', label: '贷款利率', width: 100 },
  { key: 'repayment', label: '还款方式', width: 120 },
  { key: 'interestCycle', label: '结息周期', width: 100 },
  { key: 'rateAdjust', label: '利率调整方式', width: 130 },
  { key: 'repayAcct', label: '还款账号', width: 160 },
  { key: 'dyzrxdy', label: '第一责任人', width: 110 },
  { key: 'custType', label: '贷款对象', width: 110 },
  { key: 'loanAmt', label: '合同金额(元)', width: 120 },
  { key: 'grantAmt', label: '发放金额(元)', width: 120 },
  { key: 'loanBalance', label: '贷款余额(元)', width: 120 },
  { key: 'bnqxye', label: '表内欠息(元)', width: 120 },
  { key: 'bwqxye', label: '表外欠息(元)', width: 120 },
  { key: 'yjjx', label: '预结利息(元)', width: 120 },
  { key: 'stadcls4', label: '四级形态', width: 100 },
  { key: 'stafcls5', label: '五级形态', width: 100 },
  { key: 'staecls10', label: '十级形态', width: 100 },
  { key: 'loanCapname', label: '贷款科目名称', width: 150 },
  { key: 'loanCapno', label: '贷款科目号', width: 110 },
  { key: 'firstCla', label: '分类一级名称', width: 130 },
  { key: 'firstInv', label: '行业投向一级名称', width: 150 },
  { key: 'invest', label: '行业投向二级名称', width: 150 },
  { key: 'loanCha', label: '放款渠道', width: 100 },
  { key: 'useName', label: '贷款用途名称', width: 140 },
  { key: 'productCode', label: '贷款产品代码', width: 120 },
  { key: 'productName', label: '贷款产品名称', width: 140 }
]
const loanDetailVisibleColumns = ref(loanDetailColumns.slice(0, 25).map(column => column.key))
const visibleLoanDetailColumns = computed(() => loanDetailColumns.filter(column => loanDetailVisibleColumns.value.includes(column.key)))
const dialogTitle = computed(() => loanDetailCustomer.value.customerName ? `${loanDetailCustomer.value.customerName} - 贷款明细查询` : '贷款明细查询')

function open (row) {
  if (!row || !row.customerId) {
    proxy.$modal.msgWarning('缺少客户内码，无法查询贷款明细')
    return
  }
  loanDetailCustomer.value = row
  loanDetailQuery.customerId = row.customerId
  loanDetailQuery.reportDate = yesterdayDateText()
  loanDetailQuery.contractNo = ''
  loanDetailQuery.guaranteeType = ''
  loanDetailQuery.consolidated = false
  loanDetailQuery.pageNum = 1
  loanDetailQuery.pageSize = 10
  visible.value = true
  loadLoanDetail()
}

function yesterdayDateText () {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatDate (value) {
  return proxy.parseTime(value, '{y}-{m}-{d}') || ''
}

function loanDateDisabled (date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() >= today.getTime()
}

function handleLoanDateChange (value) {
  if (!value) {
    loanDetailQuery.reportDate = yesterdayDateText()
    return
  }
  loanDetailQuery.pageNum = 1
  loadLoanDetail()
}

function resetLoanDetailQuery () {
  loanDetailQuery.reportDate = yesterdayDateText()
  loanDetailQuery.contractNo = ''
  loanDetailQuery.guaranteeType = ''
  loanDetailQuery.consolidated = false
  loanDetailQuery.pageNum = 1
  loadLoanDetail()
}

function setLoanColumns (selectAll) {
  loanDetailVisibleColumns.value = selectAll ? loanDetailColumns.slice(0, 30).map(column => column.key) : []
}

function formatLoanWan (value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? formatMoney(amount / 10000, 2) : '0.00'
}

function formatLoanRate (value) {
  const rate = Number(value)
  return Number.isFinite(rate) ? rate.toFixed(4) : '0.0000'
}

function formatLoanCell (row, column) {
  const value = row && row[column.key]
  if (value === null || value === undefined || value === '') return '-'
  if (['loanAmt', 'grantAmt', 'loanBalance', 'bnqxye', 'bwqxye', 'yjjx'].includes(column.key)) {
    return formatMoney(Number(value), 2)
  }
  if (column.key === 'staerate') return formatLoanRate(value) + '%'
  if (['reportDate', 'staidate', 'stacdate', 'staldate', 'lastClatime', 'lsredate', 'nxredate'].includes(column.key)) {
    return formatDate(value) || '-'
  }
  return value
}

async function loadLoanDetail () {
  if (!loanDetailQuery.customerId || !loanDetailQuery.reportDate) return
  loanDetailLoading.value = true
  try {
    const response = await queryAttributionLoanDetail({ ...loanDetailQuery })
    const page = response.data || {}
    loanDetailRows.value = page.rows || []
    loanDetailSummary.value = page.summary || { total: 0, contractTotal: 0, issueTotal: 0, balanceTotal: 0, weightedRate: 0 }
    if (!loanDetailRows.value.length) {
      proxy.$modal.msgWarning('该数据日期暂无贷款明细')
    }
  } catch (error) {
    loanDetailRows.value = []
    loanDetailSummary.value = { total: 0, contractTotal: 0, issueTotal: 0, balanceTotal: 0, weightedRate: 0 }
  } finally {
    loanDetailLoading.value = false
  }
}

async function exportLoanDetailRows () {
  if (!loanDetailQuery.customerId || !loanDetailQuery.reportDate) return
  loanDetailExporting.value = true
  try {
    const response = await exportAttributionLoanDetail({ ...loanDetailQuery })
    const rows = response.data || []
    if (!rows.length) {
      proxy.$modal.msgWarning('当前筛选条件暂无可导出的贷款明细')
      return
    }
    const headers = visibleLoanDetailColumns.value.map(column => column.label)
    const values = rows.map(row => visibleLoanDetailColumns.value.map(column => formatLoanCell(row, column)))
    const XLSX = await import('xlsx')
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...values])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, '贷款明细')
    XLSX.writeFile(workbook, `贷款明细_${loanDetailCustomer.value.customerName || '客户'}_${loanDetailQuery.reportDate}.xlsx`)
  } finally {
    loanDetailExporting.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.loan-detail-dialog {
  max-width: calc(100vw - 32px);
}

.loan-detail-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
}

.loan-detail-filter {
  padding: 12px 14px 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.loan-detail-filter :deep(.el-form-item) {
  margin-right: 14px;
  margin-bottom: 12px;
}

.loan-detail-filter :deep(.el-date-editor),
.loan-detail-filter :deep(.el-input),
.loan-detail-filter :deep(.el-select) {
  width: 170px;
}

.loan-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 24px;
  min-height: 42px;
  padding: 8px 2px;
  color: var(--el-text-color-regular);
  font-variant-numeric: tabular-nums;
}

.loan-detail-meta span:first-child {
  color: var(--el-text-color-secondary);
}

.loan-detail-dialog :deep(.el-table .cell) {
  white-space: nowrap;
}

.loan-detail-pagination {
  padding-top: 8px;
}

/* 分页器自带左右内边距，此处去掉以对齐上方表格 */
.loan-detail-pagination :deep(.common-pagination) {
  min-height: auto;
  padding: 0;
}

.loan-column-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.loan-column-popover :deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-height: 360px;
  overflow-y: auto;
}

.loan-column-popover :deep(.el-checkbox) {
  min-width: 0;
  margin-right: 8px;
}
</style>
