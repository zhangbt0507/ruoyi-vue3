<template>
  <div class="app-container crm-page">
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      :show-search="showSearch"
      label-width="86px"
      show-actions-when-collapsed
      :reset-fields-on-reset="false"
      @search="handleQuery"
      @reset="resetQuery"
    >
      <template #queryOrg>
        <CrmOrgSelect v-model="queryParams.queryOrg" />
      </template>
      <template #actions-left>
        <el-button type="primary" plain icon="DataAnalysis" @click="openSummary" v-hasPermi="['crm:stats:group']">汇总统计</el-button>
        <el-button plain icon="Setting" @click="columnDialogOpen = true">列显示设定</el-button>
        <el-button plain icon="Download" :loading="exportPolling" @click="handleExport" v-hasPermi="['crm:stats:group']">
          {{ exportPolling ? '导出中...' : '导出' }}
        </el-button>
      </template>
    </SearchForm>

    <common-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      :data="tableList"
      :columns="tableColumns"
      :total="total"
      height="480"
      class="crm-stats-table"
      @pagination="getList"
    >
      <template #customerLevel="{ row }">{{ selectDictLabel(levelOptions, row.customerLevel) || '-' }}</template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #portraitTags="{ row }">{{ formatPortraitTags(row.portraitTagList) }}</template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #attributionManager="{ row }">{{ formatUser(row.attributionManager) }}</template>
      <!-- 触达结果由服务端按来源渲染：CRM 侧已转字典标签，PAD/DB2 给原文，此处不再查字典 -->
      <template #lastContactResult="{ row }">{{ row.lastContactResult || '-' }}</template>
      <template #lastContactDate="{ row }">{{ parseTime(row.lastContactDate, '{y}-{m}-{d}') || '-' }}</template>
    </common-table>

    <el-dialog v-model="summaryOpen" title="客群业绩统计 - 汇总统计" width="min(1180px, 94vw)" append-to-body class="stats-summary-dialog">
      <div class="summary-drill-header">
        <template v-if="summaryLevel === 'manager'">
          <el-button link type="primary" icon="Back" @click="backToOrgSummary">返回机构汇总</el-button>
          <span>当前机构：{{ orgDisplay(drillOrg) }}</span>
        </template>
        <el-checkbox v-model="hideZeroDelta" class="summary-hide-zero">无差异显示为 --</el-checkbox>
      </div>
      <common-table
        :loading="summaryLoading"
        :data="summaryRows"
        :columns="summaryColumns"
        :pagination="false"
        height="420"
      >
        <template #dimKey="{ row }">
          <el-button v-if="summaryLevel === 'org'" link type="primary" @click="openManagerSummary(row.dimKey)">
            {{ orgDisplay(row.dimKey) }}
          </el-button>
          <span v-else>{{ formatUser(row.dimKey) }}</span>
        </template>
        <template #contacted="{ row }">
          <el-tag :type="row.contacted ? 'success' : 'info'" effect="plain">{{ row.contacted ? '是' : '否' }}</el-tag>
        </template>
        <template #metric="{ row, column }">
          <span :class="metricClass(row, column.property)">{{ metricText(row, column.property) }}</span>
        </template>
      </common-table>
      <template #footer>
        <el-button @click="summaryOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <ColumnSettingsDialog
      v-model="columnDialogOpen"
      :columns="dialogColumns"
      :categories="dataTagCategories"
      :common-keys="defaultColumnKeys"
      :max-selected="MAX_DELTA_COLUMNS"
      tip="列设置同时影响列表、汇总和导出"
      @apply="applyColumns"
      @save="saveColumns"
    />
  </div>
</template>

<script setup name="StatsGroup">
import { computed, getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { listGroupStats, groupSummaryOrg, groupSummaryManager, submitGroupStatsExport } from '@/api/szhl/crm/stats'
import { selectGroupList } from '@/api/szhl/crm/group'
import { getGridTree } from '@/api/szhl/crm/attribution'
import SearchForm from '@/components/SearchForm'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import ColumnSettingsDialog from '@/views/szhl/crm/components/ColumnSettingsDialog'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import { formatYuanToWan, isYuanAmountField } from '@/utils/crmDataTag'
import { useStatsColumnSettings } from './composables/useStatsColumnSettings'
import { useStatsExportPolling } from './composables/useStatsExportPolling'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const {
  crm_customer_type: customerTypeOptions,
  crm_customer_level: levelOptions
} = proxy.useDict('crm_customer_type', 'crm_customer_level')

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const groupOptions = ref([])
const gridNodes = ref([])
const selectedGroupId = ref(undefined)
const defaultPeriodRange = ref([])
const summaryOpen = ref(false)
const summaryLoading = ref(false)
const summaryLevel = ref('org')
const summaryRows = ref([])
const hideZeroDelta = ref(false)
const drillOrg = ref(undefined)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupId: undefined,
    customerType: undefined,
    customerLevel: undefined,
    customerName: undefined,
    queryOrg: undefined,
    managerId: undefined,
    gridStreet: undefined,
    gridCommunity: undefined,
    gridArea: undefined,
    periodRange: []
  }
})

const { queryParams } = toRefs(data)

const {
  MAX_DELTA_COLUMNS,
  columnDialogOpen,
  deltaColumnDefs,
  dataTagCategories,
  visibleColumnKeys,
  visibleBaseColumnKeys,
  defaultColumnKeys,
  dialogColumns,
  applyColumns,
  saveColumns,
  loadColumnSettings
} = useStatsColumnSettings('stats-group', refreshAfterColumns)
const { exportPolling, submit: submitExport } = useStatsExportPolling(submitGroupStatsExport)

const streetNodes = computed(() => gridNodes.value.filter(item => item.level === 1))
const communityNodes = computed(() => {
  const street = streetNodes.value.find(item => item.gridName === queryParams.value.gridStreet)
  return street ? gridNodes.value.filter(item => item.parentCode === street.gridCode) : []
})
const gridAreaNodes = computed(() => {
  const community = communityNodes.value.find(item => item.gridName === queryParams.value.gridCommunity)
  return community ? gridNodes.value.filter(item => item.parentCode === community.gridCode) : []
})

const tableColumns = computed(() => {
  const head = [
    { key: 'customerLevel', label: '客户层级', prop: 'customerLevel', width: 100, align: 'center', fixed: 'left', slot: 'customerLevel' },
    { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
    { key: 'customerNo', label: '证件号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
    ...(visibleBaseColumnKeys.value.includes('customerId') ? [{ key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true }] : []),
    { key: 'groupName', label: '客群名称', prop: 'groupName', width: 160, showOverflowTooltip: true },
    { key: 'portraitTags', label: '画像标签', prop: 'portraitTagNames', width: 150, showOverflowTooltip: true, slot: 'portraitTags' },
    { key: 'gridCode', label: '常驻网格', prop: 'gridCode', width: 140, showOverflowTooltip: true },
    { key: 'attributionOrg', label: '机构号', prop: 'attributionOrg', width: 110, align: 'center', slot: 'attributionOrg' },
    { key: 'attributionManager', label: '管户经理', prop: 'attributionManager', width: 110, align: 'center', slot: 'attributionManager' },
    { key: 'contactCount', label: '触达次数', prop: 'contactCount', width: 100, align: 'right', sortable: true },
    { key: 'lastContactResult', label: '触达结果', prop: 'lastContactResult', width: 110, align: 'center', slot: 'lastContactResult' },
    { key: 'lastContactDate', label: '最后触达日期', prop: 'lastContactDate', width: 140, align: 'center', slot: 'lastContactDate' }
  ]
  return [...head, ...dynamicMetricColumns.value]
})

const dynamicMetricColumns = computed(() => {
  const definitions = {}
  deltaColumnDefs.value.forEach(item => { definitions[item.fieldName] = item })
  return visibleColumnKeys.value
    .filter(key => definitions[key])
    .map(key => ({
      key,
      label: definitions[key].labelName,
      prop: key,
      width: 140,
      align: 'right',
      // 元金额差值列表/汇总展示层转万元（接口仍返回元），与 CRM 其他页面口径一致
      ...(isYuanAmountField(definitions[key]) ? { formatter: row => formatYuanToWan(row[key]) } : {})
    }))
})

/** 触达列排序：布尔值，null/undefined 一律按「否」参与比较 */
const contactedSortMethod = (a, b) => (a.contacted ? 1 : 0) - (b.contacted ? 1 : 0)

const summaryColumns = computed(() => [
  { key: 'dimKey', label: summaryLevel.value === 'org' ? '机构号/机构名称' : '管户经理', prop: 'dimKey', minWidth: 180, fixed: 'left', slot: 'dimKey' },
  { key: 'contacted', label: '触达', prop: 'contacted', width: 90, align: 'center', slot: 'contacted', sortable: true, sortMethod: contactedSortMethod },
  // 汇总弹窗的指标列改走 metric 插槽自行渲染（正红负绿、无差异可显示 --），不用列表的 formatter
  ...dynamicMetricColumns.value.map(({ formatter, ...column }) => ({ ...column, slot: 'metric' }))
])

/** 指标列展示文本：沿用列表口径（元金额转万元），四舍五入后为 0 时按勾选显示 -- */
function metricText (row, key) {
  const text = formatMetric(row, key)
  if (text === '') return '-'
  if (hideZeroDelta.value && Number(String(text).replace(/,/g, '')) === 0) return '--'
  return text
}

/** 正值红、负值绿；无差异或非数值不着色 */
function metricClass (row, key) {
  const number = Number(String(formatMetric(row, key)).replace(/,/g, ''))
  if (!Number.isFinite(number) || number === 0) return ''
  return number > 0 ? 'metric-up' : 'metric-down'
}

function formatMetric (row, key) {
  const definition = deltaColumnDefs.value.find(item => item.fieldName === key)
  const value = row[key]
  if (value === null || value === undefined || value === '') return ''
  return definition && isYuanAmountField(definition) ? formatYuanToWan(value) : value
}

const searchFields = computed(() => [
  {
    label: '客群名称',
    prop: 'groupId',
    type: 'select',
    placeholder: '请选择客群（必选）',
    filterable: true,
    popperClass: 'group-select-dropdown-wide',
    options: groupOptions.value.map(item => ({ label: item.groupName, value: item.id })),
    change: handleGroupChange
  },
  { label: '客户类别', prop: 'customerType', type: 'select', placeholder: '请选择', options: customerTypeOptions.value || [] },
  { label: '客户层级', prop: 'customerLevel', type: 'select', placeholder: '请选择', options: levelOptions.value || [] },
  { label: '客户名称', prop: 'customerName', type: 'input', placeholder: '请输入客户名称' },
  { label: '管户机构', prop: 'queryOrg', type: 'slot', slotName: 'queryOrg' },
  { label: '管户经理', prop: 'managerId', type: 'userSelect', placeholder: '请选择管户经理', filterable: true },
  {
    label: '街道/乡镇',
    prop: 'gridStreet',
    type: 'select',
    placeholder: '请选择',
    options: streetNodes.value.map(item => ({ label: item.gridName, value: item.gridName })),
    change: handleStreetChange
  },
  {
    label: '社区/村庄',
    prop: 'gridCommunity',
    type: 'select',
    placeholder: '请选择',
    options: communityNodes.value.map(item => ({ label: item.gridName, value: item.gridName })),
    change: handleCommunityChange
  },
  {
    label: '网格区域',
    prop: 'gridArea',
    type: 'select',
    placeholder: '请选择',
    options: gridAreaNodes.value.map(item => ({ label: item.gridName, value: item.gridCode }))
  },
  { label: '基期/末期 *', prop: 'periodRange', type: 'daterange', startPlaceholder: '基期', endPlaceholder: '末期' }
])

function groupDistributeDate (groupId) {
  const group = groupOptions.value.find(item => item.id === groupId)
  return group && group.distributeDate ? proxy.parseTime(group.distributeDate, '{y}-{m}-{d}') : undefined
}

function latestTPlusOneDataDate () {
  const value = new Date()
  value.setDate(value.getDate() - 1)
  return proxy.parseTime(value, '{y}-{m}-{d}')
}

function groupPeriodRange (groupId) {
  const beginDate = groupDistributeDate(groupId)
  return beginDate ? [beginDate, latestTPlusOneDataDate()] : []
}

function handleGroupChange (value) {
  selectedGroupId.value = value
  defaultPeriodRange.value = groupPeriodRange(value)
  queryParams.value.periodRange = [...defaultPeriodRange.value]
  tableList.value = []
  total.value = 0
}

function handleStreetChange (value) {
  queryParams.value.gridStreet = value
  queryParams.value.gridCommunity = undefined
  queryParams.value.gridArea = undefined
}

function handleCommunityChange () {
  queryParams.value.gridArea = undefined
}

function hasValidPeriod () {
  const range = queryParams.value.periodRange
  return Array.isArray(range) && !!range[0] && !!range[1] && range[0] <= range[1]
}

function canQuery () {
  return queryParams.value.groupId != null && defaultPeriodRange.value.length === 2 && hasValidPeriod()
}

function validateQuery () {
  if (queryParams.value.groupId == null) {
    proxy.$modal.msgWarning('请先选择客群')
    return false
  }
  if (defaultPeriodRange.value.length !== 2) {
    proxy.$modal.msgWarning('所选客群暂无有效下发日期')
    return false
  }
  const range = queryParams.value.periodRange
  if (!Array.isArray(range) || !range[0] || !range[1]) {
    proxy.$modal.msgWarning('请选择基期和末期')
    return false
  }
  if (range[0] > range[1]) {
    proxy.$modal.msgWarning('基期不能晚于末期')
    return false
  }
  return true
}

function buildParams (withPage) {
  const { periodRange, ...params } = queryParams.value
  if (!withPage) {
    delete params.pageNum
    delete params.pageSize
  }
  params.beginDate = periodRange[0]
  params.endDate = periodRange[1]
  if (visibleColumnKeys.value.length > 0) params.visibleColumns = visibleColumnKeys.value.join(',')
  return params
}

function getList () {
  if (!validateQuery()) return
  loading.value = true
  listGroupStats(buildParams(true)).then(res => {
    tableList.value = res.rows || []
    total.value = res.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery () {
  if (!validateQuery()) return
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery () {
  Object.assign(queryParams.value, {
    pageNum: 1,
    groupId: selectedGroupId.value,
    customerType: undefined,
    customerLevel: undefined,
    customerName: undefined,
    queryOrg: undefined,
    managerId: undefined,
    gridStreet: undefined,
    gridCommunity: undefined,
    gridArea: undefined,
    periodRange: [...defaultPeriodRange.value]
  })
  tableList.value = []
  total.value = 0
}

function openSummary () {
  if (!validateQuery()) return
  summaryLevel.value = 'org'
  drillOrg.value = undefined
  summaryOpen.value = true
  loadOrgSummary()
}

function loadOrgSummary () {
  summaryLoading.value = true
  groupSummaryOrg(buildParams(false)).then(res => {
    summaryRows.value = res.data || []
  }).finally(() => {
    summaryLoading.value = false
  })
}

function openManagerSummary (org) {
  drillOrg.value = org
  summaryLevel.value = 'manager'
  summaryLoading.value = true
  const params = buildParams(false)
  params.queryOrg = org
  groupSummaryManager(params).then(res => {
    summaryRows.value = res.data || []
  }).finally(() => {
    summaryLoading.value = false
  })
}

function backToOrgSummary () {
  summaryLevel.value = 'org'
  drillOrg.value = undefined
  loadOrgSummary()
}

function refreshAfterColumns () {
  if (!canQuery()) return
  getList()
  if (summaryOpen.value) {
    if (summaryLevel.value === 'org') loadOrgSummary()
    else openManagerSummary(drillOrg.value)
  }
}

function handleExport () {
  if (!validateQuery()) return
  submitExport(buildParams(false))
}

function orgLabel (value) {
  return proxy.selectDictLabel(orgOptions.value || [], value) || value || '-'
}

function orgDisplay (value) {
  const label = orgLabel(value)
  return label === value ? label : `${value || '-'} ${label}`
}

function formatPortraitTags (value) {
  if (!Array.isArray(value)) return ''
  return value.map(tag => tag?.tagName).filter(Boolean).join('、')
}

function formatUser (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function init () {
  loadColumnSettings()
  getGridTree().then(res => {
    gridNodes.value = res.data || []
  })
  selectGroupList().then(res => {
    groupOptions.value = res.data || []
    if (groupOptions.value.length > 0) {
      const firstId = groupOptions.value[0].id
      queryParams.value.groupId = firstId
      handleGroupChange(firstId)
    }
  })
}

init()
</script>

<style scoped>
.crm-stats-table :deep(.el-table__header .cell) {
  white-space: nowrap;
  word-break: keep-all;
}

.summary-drill-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  color: #606266;
}

.stats-summary-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}

.summary-hide-zero {
  margin-left: auto;
}

.metric-up {
  color: #f56c6c;
}

.metric-down {
  color: #67c23a;
}
</style>
