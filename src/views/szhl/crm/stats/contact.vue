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
      <!-- 网格筛选：与客户归属列表同一套行政区划树弹窗，编码写入 gridArea -->
      <template #gridRegion>
        <CustomerGridSelect v-model="queryParams.gridArea" placeholder="请选择客户网格" />
      </template>
      <template #actions-left>
        <el-button type="primary" plain icon="DataAnalysis" @click="openSummary" v-hasPermi="['crm:stats:contact']">汇总统计</el-button>
        <el-button plain icon="Download" @click="handleExport" v-hasPermi="['crm:stats:contact']">导出</el-button>
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
      <template #seq="{ $index }">{{ (queryParams.pageNum - 1) * queryParams.pageSize + $index + 1 }}</template>
      <template #customerLevel="{ row }">{{ selectDictLabel(levelOptions, row.customerLevel) || '-' }}</template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #portraitTags="{ row }">{{ formatPortraitTags(row.portraitTagList) }}</template>
      <template #address="{ row }">{{ formatGridStreet(row.gridCode) }}</template>
      <template #gridCode="{ row }">{{ formatGridCommunity(row.gridCode) }}</template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #attributionManager="{ row }">{{ formatUser(row.attributionManager) }}</template>
      <template #lastContactResult="{ row }">{{ row.lastContactResult || '-' }}</template>
      <template #lastContactDate="{ row }">{{ parseTime(row.lastContactDate, '{y}-{m}-{d}') || '-' }}</template>
    </common-table>

    <el-dialog v-model="summaryOpen" title="客户触达统计 - 汇总统计" width="920px" append-to-body class="stats-summary-dialog">
      <div v-if="summaryLevel === 'manager'" class="summary-drill-header">
        <el-button link type="primary" icon="Back" @click="backToOrgSummary">返回机构汇总</el-button>
        <span>当前机构：{{ orgDisplay(drillOrg) }}</span>
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
        <template #reachRate="{ row }">{{ reachRate(row) }}</template>
        <template #lastContactTime="{ row }">{{ parseTime(row.lastContactTime, '{y}-{m}-{d}') || '-' }}</template>
      </common-table>
      <template #footer>
        <el-button @click="summaryOpen = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StatsContact">
import { computed, getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { listContactStats, contactSummaryOrg, contactSummaryManager } from '@/api/szhl/crm/stats'
import { selectGroupList } from '@/api/szhl/crm/group'
import { getGridTree } from '@/api/szhl/crm/attribution'
import SearchForm from '@/components/SearchForm'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'
import CustomerGridSelect from '@/views/szhl/crm/components/CustomerGridSelect'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'

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
const selectedGroupIds = ref([])
const summaryOpen = ref(false)
const summaryLoading = ref(false)
const summaryLevel = ref('org')
const summaryRows = ref([])
const drillOrg = ref(undefined)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupIds: [],
    customerType: undefined,
    customerLevel: undefined,
    customerName: undefined,
    queryOrg: undefined,
    managerId: undefined,
    gridArea: undefined,
    periodRange: []
  }
})

const { queryParams } = toRefs(data)

const gridNodeMap = computed(() => {
  const map = {}
  gridNodes.value.forEach(item => {
    if (item.gridCode) map[item.gridCode] = item
  })
  return map
})

const tableColumns = [
  { key: 'seq', label: '序号', width: 64, align: 'center', fixed: 'left', slot: 'seq' },
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
  { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { key: 'customerLevel', label: '客户层级', prop: 'customerLevel', width: 100, align: 'center', slot: 'customerLevel' },
  { key: 'groupName', label: '客群名称', prop: 'groupName', width: 160, showOverflowTooltip: true },
  { key: 'portraitTags', label: '画像标签', prop: 'portraitTagNames', width: 150, showOverflowTooltip: true, slot: 'portraitTags' },
  { key: 'groupCount', label: '客群数', prop: 'groupCount', width: 90, align: 'right' },
  { key: 'address', label: '地址', prop: 'address', width: 140, showOverflowTooltip: true, slot: 'address' },
  { key: 'gridCode', label: '常驻网格', prop: 'gridCode', width: 140, showOverflowTooltip: true, slot: 'gridCode' },
  { key: 'attributionOrg', label: '机构号', prop: 'attributionOrg', width: 110, align: 'center', slot: 'attributionOrg' },
  { key: 'attributionManager', label: '管户经理', prop: 'attributionManager', width: 110, align: 'center', slot: 'attributionManager' },
  { key: 'contactCount', label: '触达次数', prop: 'contactCount', width: 100, align: 'right', sortable: true },
  { key: 'lastContactResult', label: '触达结果', prop: 'lastContactResult', width: 110, align: 'center', slot: 'lastContactResult' },
  { key: 'lastContactDate', label: '最后触达日期', prop: 'lastContactDate', width: 140, align: 'center', slot: 'lastContactDate' }
]

const summaryColumns = computed(() => [
  { key: 'dimKey', label: summaryLevel.value === 'org' ? '机构号/机构名称' : '管户经理', prop: 'dimKey', minWidth: 180, slot: 'dimKey' },
  { key: 'customerCount', label: '客户数', prop: 'customerCount', width: 130, align: 'right' },
  { key: 'contactedCount', label: '触达数', prop: 'contactedCount', width: 110, align: 'right' },
  { key: 'reachRate', label: '触达比例', width: 100, align: 'right', slot: 'reachRate' },
  { key: 'contactTimes', label: '触达次数', prop: 'contactTimes', width: 110, align: 'right' },
  { key: 'lastContactTime', label: '最后触达时间', width: 160, align: 'center', slot: 'lastContactTime' }
])

const searchFields = computed(() => [
  {
    label: '客群名称',
    prop: 'groupIds',
    type: 'select',
    placeholder: '请选择客群（必选）',
    filterable: true,
    multiple: true,
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
    // 网格筛选由 CustomerGridSelect 弹窗选用，选中编码写进 gridArea（grid_code）；
    // prop 就是 gridArea，SearchForm 重置时才能把内部副本一起清掉
    label: '客户网格',
    prop: 'gridArea',
    type: 'slot',
    slotName: 'gridRegion'
  },
  { label: '基期/末期 *', prop: 'periodRange', type: 'daterange', startPlaceholder: '基期', endPlaceholder: '末期' }
])

function handleGroupChange (value) {
  selectedGroupIds.value = value || []
}

function validateQuery () {
  if (!queryParams.value.groupIds || queryParams.value.groupIds.length === 0) {
    proxy.$modal.msgWarning('请先选择客群')
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
  if (Array.isArray(params.groupIds)) params.groupIds = params.groupIds.join(',')
  params.beginDate = periodRange[0]
  params.endDate = periodRange[1]
  return params
}

function getList () {
  if (!validateQuery()) return
  loading.value = true
  listContactStats(buildParams(true)).then(res => {
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
    groupIds: [...selectedGroupIds.value],
    customerType: undefined,
    customerLevel: undefined,
    customerName: undefined,
    queryOrg: undefined,
    managerId: undefined,
    gridArea: undefined,
    periodRange: []
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
  contactSummaryOrg(buildParams(false)).then(res => {
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
  contactSummaryManager(params).then(res => {
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

function handleExport () {
  if (!validateQuery()) return
  const params = buildParams(false)
  proxy.download('/crm/stats/contact/export', params, '客户触达统计.xlsx', { appCode: 'crm' })
}

function reachRate (row) {
  const count = Number(row.customerCount || 0)
  if (!count) return '0%'
  return Math.round(Number(row.contactedCount || 0) / count * 100) + '%'
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

function resolveGridLocation (gridCode) {
  if (!gridCode) return { street: '-', community: '-' }
  let current = gridNodeMap.value[gridCode]
  if (!current) return { street: '-', community: gridCode }
  const chain = {}
  while (current) {
    chain[current.level] = current
    current = current.parentCode ? gridNodeMap.value[current.parentCode] : undefined
  }
  return {
    street: chain[1]?.gridName || '-',
    community: chain[2]?.gridName || '-'
  }
}

function formatGridStreet (gridCode) {
  return resolveGridLocation(gridCode).street
}

function formatGridCommunity (gridCode) {
  return resolveGridLocation(gridCode).community
}

function init () {
  getGridTree().then(res => {
    gridNodes.value = res.data || []
  })
  selectGroupList().then(res => {
    groupOptions.value = res.data || []
    if (groupOptions.value.length > 0) {
      const firstId = groupOptions.value[0].id
      queryParams.value.groupIds = [firstId]
      selectedGroupIds.value = [firstId]
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
</style>
