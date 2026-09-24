<template>
  <div class="app-container crm-page reach-page">
    <section class="reach-query" aria-label="客户触达查询条件">
      <div class="reach-query__field reach-query__period">
        <span class="reach-query__label">统计时段：</span>
        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
        />
      </div>
      <div class="reach-query__field reach-query__org">
        <CrmOrgSelect v-model="queryParams.queryOrg" placeholder="全部支行" />
      </div>
      <div class="reach-query__field reach-query__manager">
        <el-select
          v-model="queryParams.managerId"
          filterable
          clearable
          :loading="managerLoading"
          placeholder="请选择管户人"
          :no-data-text="managerEmptyText"
        >
          <el-option v-for="item in managerOptions" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
      </div>
      <div class="reach-query__actions">
        <el-button type="primary" icon="Search" :loading="summaryLoading" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button icon="Download" :disabled="!hasDateRange" @click="handleExport">导出</el-button>
      </div>
    </section>

    <el-empty v-if="!queried" description="请选择统计周期后点击搜索" />

    <template v-else>
      <!-- 核心指标 -->
      <el-row :gutter="16" class="reach-kpi">
        <el-col v-for="kpi in kpiCards" :key="kpi.key" :xs="24" :sm="12" :lg="8">
          <el-card class="reach-kpi__card" shadow="never" :body-style="{ padding: '0' }" >
            <div class="kpi-card" :class="`kpi-card--${kpi.tone}`">
              <div class="kpi-icon">
                <el-icon><component :is="kpi.icon" /></el-icon>
              </div>
              <div class="kpi-info">
                <div class="kpi-label">
                  {{ kpi.label }}<span class="kpi-period">本期</span>
                </div>
                <div class="kpi-main">
                  <div class="kpi-value">
                    {{ kpi.value }}<span class="kpi-unit">{{ kpi.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <!-- 领奖台：总行展示机构前三，支行展示客户经理前三 -->
      <el-card class="reach-block reach-podium" shadow="never">
        <template #header>
          <div class="block-head">
            <div class="block-title">
              <el-icon class="podium-title__icon" aria-hidden="true"><Trophy /></el-icon>
              {{ podiumTitle }}
            </div>
            <div class="block-meta">按总触达次数排名</div>
          </div>
        </template>
        <div class="podium-list">
          <div
            v-for="item in podiumDisplayRows"
            :key="`${item.rank}-${item.key}`"
            class="podium-item"
            :class="`podium-item--${item.rank}`"
          >
            <div class="podium-item__badge">{{ item.rank }}</div>
            <div class="podium-item__name" :title="item.name">{{ item.name }}</div>
            <div class="podium-item__times">
              <strong>{{ formatNumber(item.touchTimes) }}</strong><span>次</span>
            </div>
            <div class="podium-item__sources">
              <span>智慧互联触达 {{ formatNumber(item.smartTimes) }}</span>
              <span>PAD触达 {{ formatNumber(item.padTimes) }}</span>
            </div>
            <div class="podium-stage"><span>{{ item.rank }}</span></div>
          </div>
        </div>
      </el-card>
      <!-- 机构 / 管户人汇总 -->
      <el-card class="reach-block" shadow="never">
        <template #header>
          <div class="block-head">
            <div>
              <div class="block-title">{{ tableTitle }}</div>
            </div>
            <div class="block-head__extra">
              <el-button type="text" v-if="drillOrg !== null" plain icon="Back" size="small" @click="drillUp">返回</el-button>
            </div>
          </div>
        </template>

        <common-table
          :loading="summaryLoading"
          :data="tableRows"
          :columns="tableColumns"
          :pagination="false"
          height="460"
          action-fixed="right"
          empty-string="当前条件下没有触达记录"
          class="reach-summary-table"
        >
          <template #rank="{ $index }">
            <span class="rank-num" :class="rankClass($index)">{{ $index + 1 }}</span>
          </template>
          <template #eventOrg="{ row }">
            <button type="button" class="org-link" @click="drillDown(row)">
              {{ orgLabel(row.eventOrg) }}
            </button>
          </template>
          <template #manager="{ row }">
            <span class="cell-strong">{{ managerLabel(row) }}</span>
          </template>
          <template #times="{ row }">
            <span class="cell-strong">{{ formatNumber(row.viewTimes) }}</span>
          </template>
          <template #customerCount="{ row }">
            {{ formatNumber(row.customerCount) }}
          </template>
          <template #customerCountSum="{ row }">
            {{ formatNumber(row.customerCountSum) }}
          </template>
          <template #avgPerCustomer="{ row }">
            {{ ratio(row.touchTimes, row.customerCount) }}
            <span class="cell-muted">次/户</span>
          </template>
          <template #avgPerManager="{ row }">
            {{ ratio(row.touchTimes, row.managerCount) }}
            <span class="cell-muted">次/人</span>
          </template>
          <template #padRate="{ row }">
            <span class="cell-accent">{{ percent(row.padTimes, row.touchTimes) }}%</span>
          </template>
          <template #share="{ row }">
            <div class="share-cell">
              <div class="share-track">
                <div class="share-fill" :style="{ width: `${percent(row.viewTimes, maxViewTimes)}%` }" />
              </div>
              <span class="cell-muted">{{ percent(row.viewTimes, totalViewTimes) }}%</span>
            </div>
          </template>
          <template #latestTouchTime="{ row }">
            {{ parseTime(row.latestTouchTime, '{y}-{m}-{d}') || '-' }}
          </template>
          <template #managerActions="{ row }">
            <el-button link type="primary" :disabled="!row.managerId" @click="openDetail(row)">查看明细</el-button>
          </template>
        </common-table>
      </el-card>
    </template>

    <el-drawer
      v-model="detailOpen"
      :title="detailTitle"
      size="min(1060px, 92vw)"
      append-to-body
      class="reach-detail-drawer"
      @closed="resetDetail"
    >
      <div class="detail-stats">
        <div v-for="stat in detailStats" :key="stat.label" class="detail-stat">
          <div class="detail-stat__label">{{ stat.label }}</div>
          <div class="detail-stat__value">{{ stat.value }}</div>
        </div>
      </div>

      <div class="detail-filters">
        <span class="detail-filters__label">触达来源</span>
        <el-radio-group
          v-model="detailSource"
          size="small"
          @change="setDetailSource"
        >
          <el-radio-button
            v-for="source in detailSourceOptions"
            :key="source.key"
            :label="source.key"
          >{{ source.name }}</el-radio-button>
        </el-radio-group>
        <el-checkbox
          v-model="detailQuery.onlyWithGroup"
          class="detail-filters__group-filter"
          @change="setOnlyWithGroup"
        >仅显示有客群归属</el-checkbox>
        <span class="detail-filters__meta">时间段 {{ dateRangeText }}</span>
      </div>

      <common-table
        v-model:page="detailQuery.pageNum"
        v-model:limit="detailQuery.pageSize"
        :loading="detailLoading"
        :data="detailRows"
        :columns="detailColumns"
        :total="detailTotal"
        height="calc(100vh - 300px)"
        action-fixed="right"
        empty-string="该来源在当前周期下没有触达记录"
        @pagination="getDetailList"
      >
        <template #customerName="{ row }"><CustomerLink :row="row" mode="name" /></template>
        <template #customerNo="{ row }"><CustomerLink :row="row" mode="no" /></template>
        <template #groupNames="{ row }">{{ row.groupNames || '-' }}</template>
        <template #eventTime="{ row }">{{ parseTime(row.eventTime, '{y}-{m}-{d}') || '-' }}</template>
        <template #touchWay="{ row }">{{ formatTouchWay(row) }}</template>
        <template #touchResult="{ row }">{{ formatTouchResult(row) }}</template>
        <template #touchSubject="{ row }">{{ formatTouchSubject(row) }}</template>
        <template #durationMinutes="{ row }">{{ row.durationMinutes === null || row.durationMinutes === undefined ? '-' : row.durationMinutes }}</template>
      </common-table>
    </el-drawer>
  </div>
</template>

<script setup name="CrmReach">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { getReachSummary, listReachDetail } from '@/api/szhl/crm/reach'
import { queryAllUser, selectUserBydept } from '@/api/system/user'
import { Trophy } from '@element-plus/icons-vue'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const {
  crm_contact_way: contactWayOptions,
  crm_contact_result: contactResultOptions,
  market_contract_interactive_type: marketContactWayOptions,
  market_contract_interactive_subject: marketContactSubjectOptions,
  market_contract_result: marketContractResultOptions,
  loan_reduce_result: marketLoanReduceResultOptions,
  other_bank_loan_marketing_result: marketOtherBankLoanResultOptions,
  return_swallow_result: marketReturnSwallowResultOptions
} = proxy.useDict(
  'crm_contact_way',
  'crm_contact_result',
  'market_contract_interactive_type',
  'market_contract_interactive_subject',
  'market_contract_result',
  'loan_reduce_result',
  'other_bank_loan_marketing_result',
  'return_swallow_result'
)

const queried = ref(false)
const summaryLoading = ref(false)
const detailLoading = ref(false)
const detailOpen = ref(false)
const summaryRows = ref([])
const detailRows = ref([])
const detailTotal = ref(0)
const metrics = ref({})
const podiumMode = ref('MANAGER')
const managerOptions = ref([])
const managerLoading = ref(false)
const managerLoadFailed = ref(false)
// 前端视图状态:activeSource 切换汇总口径,drillOrg 控制机构/管户人两级视角,均不触发后端重查
const activeSource = ref('all')
const drillOrg = ref(null)
const detailSource = ref('all')
const detailRow = ref(null)

// 展示口径将 MySQL、DB2 合并为智慧互联触达，底层 sourceType 仍保留三源编码。
const SOURCE_META = [
  { key: 'SMART', name: '智慧互联触达', sourceTypes: ['MYSQL', 'DB2'] },
  { key: 'PAD', name: 'PAD触达', sourceTypes: ['PAD'] }
]

// 默认统计时段：当天往前推 1 个月
function defaultDateRange () {
  const end = new Date()
  const start = new Date(end)
  start.setMonth(start.getMonth() - 1)
  return [formatDate(start), formatDate(end)]
}

function formatDate (date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const data = reactive({
  queryParams: {
    dateRange: defaultDateRange(),
    queryOrg: undefined,
    managerId: undefined
  },
  detailQuery: {
    pageNum: 1,
    pageSize: 20,
    managerId: undefined,
    onlyWithGroup: false
  }
})

const { queryParams, detailQuery } = toRefs(data)

const hasDateRange = computed(() => Array.isArray(queryParams.value.dateRange) &&
  queryParams.value.dateRange.length === 2 &&
  queryParams.value.dateRange[0] &&
  queryParams.value.dateRange[1])
const managerEmptyText = computed(() => managerLoadFailed.value ? '管户人加载失败' : '所选机构下暂无管户人')
const dateRangeText = computed(() => hasDateRange.value ? queryParams.value.dateRange.join(' 至 ') : '-')
const detailTitle = computed(() => detailRow.value
  ? `客户触达明细 - ${managerLabel(detailRow.value)}`
  : '客户触达明细')

const metricTouchTimes = computed(() => Number(metrics.value.touchTimes || 0))
const metricCustomerCount = computed(() => Number(metrics.value.customerCount || 0))

const metricDailyAverageTouchTimes = computed(() => metrics.value.dailyAverageTouchTimes)

const kpiCards = computed(() => [
  {
    key: 'touchTimes',
    label: '触达总次数',
    value: formatNumber(metricTouchTimes.value),
    unit: '次',
    icon: 'Phone',
    tone: 'primary'
  },
  {
    key: 'customerCount',
    label: '触达客户数',
    value: formatNumber(metricCustomerCount.value),
    unit: '户',
    icon: 'UserFilled',
    tone: 'success'
  },
  {
    key: 'dailyAverageTouchTimes',
    label: '日均触达',
    value: formatOptionalMetric(metricDailyAverageTouchTimes.value),
    unit: metricDailyAverageTouchTimes.value === null || metricDailyAverageTouchTimes.value === undefined ? '' : '次/日',
    icon: 'TrendCharts',
    tone: 'neutral'
  }
])

const activeSourceLabel = computed(() => activeSource.value === 'all'
  ? '全部来源'
  : (SOURCE_META.find(item => item.key === activeSource.value)?.name || activeSource.value))

const podiumTitle = computed(() => podiumMode.value === 'ORG' ? '机构触达排行榜 TOP3' : '管户触达排行榜 TOP3')

// 后端返回的是 事件机构 + 管户人 的平铺行，机构级视图在前端聚合得出
const orgRows = computed(() => {
  const map = new Map()
  summaryRows.value.forEach(row => {
    const org = row.eventOrg || ''
    if (!map.has(org)) {
      map.set(org, {
        eventOrg: org,
        managerSet: new Set(),
        touchTimes: 0,
        customerCountSum: 0,
        padTimes: 0,
        mysqlTimes: 0,
        db2Times: 0,
        latestTouchTime: null
      })
    }
    const item = map.get(org)
    if (row.managerId) item.managerSet.add(row.managerId)
    item.touchTimes += Number(row.touchTimes || 0)
    item.customerCountSum += Number(row.customerCount || 0)
    item.padTimes += Number(row.padTimes || 0)
    item.mysqlTimes += Number(row.mysqlTimes || 0)
    item.db2Times += Number(row.db2Times || 0)
    if (row.latestTouchTime && (!item.latestTouchTime || String(row.latestTouchTime) > String(item.latestTouchTime))) {
      item.latestTouchTime = row.latestTouchTime
    }
  })
  return Array.from(map.values()).map(item => {
    const { managerSet, ...rest } = item
    return { ...rest, managerCount: managerSet.size }
  })
})

// 支行领奖台按客户经理跨机构汇总，避免同一客户经理在多个网点产生重复排名。
const managerRows = computed(() => {
  const map = new Map()
  summaryRows.value.forEach(row => {
    const managerId = row.managerId || ''
    const key = managerId || row.managerName || ''
    if (!key) return
    if (!map.has(key)) {
      map.set(key, {
        key,
        managerId,
        managerName: row.managerName,
        touchTimes: 0,
        customerCount: 0,
        padTimes: 0,
        mysqlTimes: 0,
        db2Times: 0
      })
    }
    const item = map.get(key)
    item.touchTimes += Number(row.touchTimes || 0)
    item.customerCount += Number(row.customerCount || 0)
    item.padTimes += Number(row.padTimes || 0)
    item.mysqlTimes += Number(row.mysqlTimes || 0)
    item.db2Times += Number(row.db2Times || 0)
  })
  return Array.from(map.values())
    .map(item => ({ ...item, smartTimes: smartTouchTimes(item) }))
    .sort((a, b) => b.touchTimes - a.touchTimes || managerLabel(a).localeCompare(managerLabel(b), 'zh-CN'))
})

const podiumRows = computed(() => {
  const rows = podiumMode.value === 'ORG'
    ? orgRows.value.map(row => ({
      ...row,
      key: row.eventOrg,
      name: orgLabel(row.eventOrg),
      customerCount: row.customerCountSum,
      smartTimes: smartTouchTimes(row)
    }))
    : managerRows.value.map(row => ({ ...row, name: managerLabel(row) }))
  const ranked = rows
    .sort((a, b) => b.touchTimes - a.touchTimes || a.name.localeCompare(b.name, 'zh-CN'))
    .slice(0, 3)
    .map((row, index) => ({ ...row, rank: index + 1 }))
  // 领奖台固定三个台位，实际排名不足（含无数据）时补占位行
  for (let rank = ranked.length + 1; rank <= 3; rank++) {
    ranked.push({ key: `placeholder-${rank}`, rank, name: '-', touchTimes: 0, smartTimes: 0, padTimes: 0 })
  }
  return ranked
})

// 中间放冠军，两侧分别放亚军和季军，视觉上保持参考图的领奖台顺序。
const podiumDisplayRows = computed(() => podiumRows.value.slice().sort((a, b) => {
  const order = { 1: 2, 2: 1, 3: 3 }
  return order[a.rank] - order[b.rank]
}))

// 按当前选中来源取该行的统计次数，activeSource 为 all 时取总次数
function viewTimesOf (row) {
  if (activeSource.value === 'all') return Number(row.touchTimes || 0)
  if (activeSource.value === 'SMART') return smartTouchTimes(row)
  return activeSource.value === 'PAD' ? Number(row.padTimes || 0) : 0
}

const tableRows = computed(() => {
  const base = drillOrg.value === null
    ? orgRows.value
    : summaryRows.value.filter(row => (row.eventOrg || '') === drillOrg.value)
  return base
    .map(row => ({ ...row, smartTimes: smartTouchTimes(row), viewTimes: viewTimesOf(row) }))
    .sort((a, b) => b.viewTimes - a.viewTimes)
})

const maxViewTimes = computed(() => tableRows.value.reduce((max, row) => Math.max(max, row.viewTimes), 0))
const totalViewTimes = computed(() => tableRows.value.reduce((sum, row) => sum + row.viewTimes, 0))

const tableTitle = computed(() => drillOrg.value === null
  ? '机构触达汇总'
  : `${orgLabel(drillOrg.value)}触达汇总`)

// 来源筛选生效时，次数列表头带上来源名，避免与全量口径混淆
const timesColumnLabel = computed(() => activeSource.value === 'all'
  ? '触达次数'
  : `${activeSourceLabel.value}次数`)

const orgColumns = computed(() => [
  { key: 'rank', label: '排名', width: 70, align: 'center', slot: 'rank' },
  { key: 'eventOrg', label: '触达机构', prop: 'eventOrg', minWidth: 180, slot: 'eventOrg', showOverflowTooltip: true },
  { key: 'managerCount', label: '管户人数', prop: 'managerCount', width: 110, align: 'right' },
  { key: 'times', label: timesColumnLabel.value, width: 130, align: 'right', slot: 'times' },
  { key: 'customerCountSum', label: '触达客户数', width: 170, align: 'right', slot: 'customerCountSum' },
  { key: 'avgPerManager', label: '人均触达', width: 120, align: 'right', slot: 'avgPerManager' },
  { key: 'padRate', label: 'PAD 占比', width: 110, align: 'right', slot: 'padRate' },
  { key: 'share', label: '次数占比', minWidth: 170, slot: 'share' },
  { key: 'latestTouchTime', label: '最近触达时间', width: 170, align: 'center', slot: 'latestTouchTime' }
])

const managerColumns = computed(() => [
  { key: 'rank', label: '排名', width: 70, align: 'center', slot: 'rank' },
  { key: 'manager', label: '管户人', minWidth: 150, slot: 'manager', showOverflowTooltip: true },
  { key: 'times', label: timesColumnLabel.value, width: 130, align: 'right', slot: 'times' },
  { key: 'customerCount', label: '触达客户数', prop: 'customerCount', width: 120, align: 'right', slot: 'customerCount' },
  { key: 'avgPerCustomer', label: '户均触达', width: 120, align: 'right', slot: 'avgPerCustomer' },
  { key: 'smartTimes', label: '智慧互联触达', prop: 'smartTimes', width: 130, align: 'right' },
  { key: 'padTimes', label: 'PAD触达', prop: 'padTimes', width: 100, align: 'right' },
  { key: 'share', label: '次数占比', minWidth: 170, slot: 'share' },
  { key: 'latestTouchTime', label: '最近触达时间', width: 170, align: 'center', slot: 'latestTouchTime' },
  { key: 'actions', label: '操作', width: 110, align: 'center', slot: 'managerActions' }
])

const tableColumns = computed(() => drillOrg.value === null ? orgColumns.value : managerColumns.value)

const detailColumns = [
  { key: 'customerName', label: '客户名称', prop: 'customerName', minWidth: 150, slot: 'customerName', showOverflowTooltip: true },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', minWidth: 170, slot: 'customerNo', showOverflowTooltip: true },
  { key: 'groupNames', label: '所属客群', prop: 'groupNames', minWidth: 180, slot: 'groupNames', showOverflowTooltip: true },
  { key: 'eventTime', label: '触达时间', prop: 'eventTime', width: 170, align: 'center', slot: 'eventTime' },
  { key: 'customerId', label: '客户内码', prop: 'customerId', minWidth: 140, showOverflowTooltip: true },
  { key: 'eventOrg', label: '触达机构', prop: 'eventOrg', width: 120, showOverflowTooltip: true },
  { key: 'touchWay', label: '触达方式', prop: 'touchWay', width: 120, slot: 'touchWay', showOverflowTooltip: true },
  { key: 'touchResult', label: '触达结果', prop: 'touchResult', width: 120, slot: 'touchResult', showOverflowTooltip: true },
  { key: 'touchSubject', label: '触达主题', prop: 'touchSubject', minWidth: 150, slot: 'touchSubject', showOverflowTooltip: true },
  { key: 'durationMinutes', label: '时长（分钟）', prop: 'durationMinutes', width: 120, align: 'right', slot: 'durationMinutes' },
  { key: 'remark', label: '备注', prop: 'remark', minWidth: 180, showOverflowTooltip: true }
]

const detailSourceOptions = computed(() => [{ key: 'all', name: '全部' }, ...SOURCE_META])

const detailStats = computed(() => {
  const row = detailRow.value
  if (!row) return []
  return [
    { label: '触达次数', value: formatNumber(row.touchTimes || 0) },
    { label: '触达客户数', value: formatNumber(row.customerCount || 0) },
    { label: '户均触达', value: ratio(row.touchTimes, row.customerCount) },
    { label: '智慧互联触达', value: formatNumber(smartTouchTimes(row)) },
    { label: 'PAD触达', value: formatNumber(row.padTimes || 0) }
  ]
})

function buildParams (includePage = false) {
  const params = {
    beginDate: queryParams.value.dateRange[0],
    endDate: queryParams.value.dateRange[1],
    queryOrg: queryParams.value.queryOrg,
    managerId: queryParams.value.managerId
  }
  if (includePage) {
    params.pageNum = detailQuery.value.pageNum
    params.pageSize = detailQuery.value.pageSize
    params.onlyWithGroup = detailQuery.value.onlyWithGroup
  }
  return params
}

function loadManagers (org) {
  managerLoading.value = true
  managerLoadFailed.value = false
  managerOptions.value = []
  const request = org ? selectUserBydept({ deptId: org }) : queryAllUser()
  request.then(res => {
    const rows = res.data || []
    managerOptions.value = rows
      .filter(user => user && user.userName)
      .map(user => {
        const no = String(user.userName)
        const name = user.nickName || no
        return { value: no, label: name !== no ? `${name}(${no})` : no }
      })
  }).catch(() => {
    managerLoadFailed.value = true
  }).finally(() => {
    managerLoading.value = false
  })
}

// 机构变化时清空管户人并联动刷新可选清单
watch(() => queryParams.value.queryOrg, (org) => {
  queryParams.value.managerId = undefined
  if (org) {
    loadManagers(org)
  } else {
    loadManagers()
  }
})

function handleQuery () {
  if (!hasDateRange.value) {
    proxy.$modal.msgWarning('请选择开始日期和结束日期')
    return
  }
  summaryLoading.value = true
  getReachSummary(buildParams()).then(res => {
    metrics.value = res.data?.metrics || {}
    summaryRows.value = res.data?.rows || []
    podiumMode.value = res.data?.podiumMode || 'MANAGER'
    // 数据集已变，回到机构视角并恢复全部来源口径
    drillOrg.value = null
    activeSource.value = 'all'
    queried.value = true
  }).finally(() => {
    summaryLoading.value = false
  })
}

onMounted(() => {
  loadManagers()
  handleQuery()
})

function drillDown (row) {
  drillOrg.value = row.eventOrg || ''
}

function drillUp () {
  drillOrg.value = null
}

function openDetail (row) {
  detailRow.value = row
  detailSource.value = 'all'
  detailQuery.value.managerId = row.managerId
  // 明细按 管户人 + 该行所属机构 口径查询,避免调岗后跨机构汇总导致与汇总次数不一致
  detailQuery.value.eventOrg = row.eventOrg
  detailQuery.value.pageNum = 1
  detailQuery.value.pageSize = 20
  detailOpen.value = true
  getDetailList()
}

function setDetailSource (key) {
  detailSource.value = key
  detailQuery.value.pageNum = 1
  getDetailList()
}

function setOnlyWithGroup () {
  detailQuery.value.pageNum = 1
  getDetailList()
}

function getDetailList () {
  if (!detailQuery.value.managerId || !hasDateRange.value) return
  detailLoading.value = true
  const params = { ...buildParams(true), managerId: detailQuery.value.managerId }
  // 明细按该行所属机构查询,覆盖顶部机构筛选项
  if (detailQuery.value.eventOrg) {
    params.queryOrg = detailQuery.value.eventOrg
  }
  // 抽屉按两类展示口径筛选，其中智慧互联触达同时包含 MySQL 和 DB2。
  if (detailSource.value !== 'all') {
    params.sourceTypes = SOURCE_META.find(item => item.key === detailSource.value)?.sourceTypes || []
  }
  listReachDetail(params).then(res => {
    detailRows.value = res.rows || []
    detailTotal.value = res.total || 0
  }).finally(() => {
    detailLoading.value = false
  })
}

function resetDetail () {
  detailRows.value = []
  detailTotal.value = 0
  detailQuery.value.managerId = undefined
  detailQuery.value.eventOrg = undefined
  detailQuery.value.onlyWithGroup = false
  detailRow.value = null
  detailSource.value = 'all'
}

function resetQuery () {
  Object.assign(queryParams.value, {
    dateRange: defaultDateRange(),
    queryOrg: undefined,
    managerId: undefined
  })
  managerOptions.value = []
  managerLoadFailed.value = false
  metrics.value = {}
  podiumMode.value = 'MANAGER'
  summaryRows.value = []
  queried.value = false
  drillOrg.value = null
  activeSource.value = 'all'
}

function handleExport () {
  if (!hasDateRange.value) {
    proxy.$modal.msgWarning('请选择开始日期和结束日期')
    return
  }
  proxy.download('/crm/reach/export', buildParams(), '客户触达明细.xlsx')
}

function formatNumber (value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function formatOptionalMetric (value) {
  if (value === null || value === undefined || value === '') return '-'
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 1 })
}

// 比值保留两位小数，分母为 0 时返回 0.00，避免出现 NaN / Infinity
function ratio (numerator, denominator) {
  const bottom = Number(denominator || 0)
  if (!bottom) return '0.00'
  return (Number(numerator || 0) / bottom).toFixed(2)
}

function percent (numerator, denominator) {
  const bottom = Number(denominator || 0)
  if (!bottom) return '0.0'
  return (Number(numerator || 0) / bottom * 100).toFixed(1)
}

function smartTouchTimes (row) {
  return Number(row?.mysqlTimes || 0) + Number(row?.db2Times || 0)
}

function rankClass (index) {
  return index < 3 ? `rank-num--top${index + 1}` : ''
}

function orgLabel (value) {
  if (!value) return '-'
  const label = proxy.selectDictLabel(orgOptions.value || [], value)
  return label && label !== value ? `${label}` : value
}

function managerLabel (row) {
  if (!row.managerId) return '-'
  return row.managerName && row.managerName !== row.managerId
    ? `${row.managerName}（${row.managerId}）`
    : row.managerId
}

function dictLabel (options, value) {
  if (value === undefined || value === null || value === '') return '-'
  const rows = options?.value || options || []
  return proxy.selectDictLabel(rows, value) || value
}

function formatTouchWay (row) {
  const sourceType = String(row?.sourceType || '').toUpperCase()
  if (sourceType === 'PAD') return row.touchWay || '-'
  if (sourceType === 'DB2' || sourceType === 'MARKET') {
    return dictLabel(marketContactWayOptions, row.touchWay)
  }
  return dictLabel(contactWayOptions, row.touchWay)
}

function formatTouchResult (row) {
  const sourceType = String(row?.sourceType || '').toUpperCase()
  if (sourceType === 'PAD') return row.touchResult || '-'
  if (sourceType === 'DB2' || sourceType === 'MARKET') {
    const optionsBySubject = {
      1: marketContractResultOptions,
      2: marketLoanReduceResultOptions,
      3: marketOtherBankLoanResultOptions,
      10: marketReturnSwallowResultOptions
    }
    return dictLabel(optionsBySubject[String(row.touchSubject)] || marketContractResultOptions, row.touchResult)
  }
  return dictLabel(contactResultOptions, row.touchResult)
}

// 只有 DB2(cust_interactive_record.interactive_subject) 是代码需要转字典；
// MySQL 源取的 crm_contact_record.contact_tag 是自由文本，PAD 源取的 action_name 是活动名，均原样展示。
// 翻译只能落在展示层：formatTouchResult 还要用 row.touchSubject 的原始代码选结果字典。
function formatTouchSubject (row) {
  const sourceType = String(row?.sourceType || '').toUpperCase()
  if (sourceType === 'DB2' || sourceType === 'MARKET') {
    return dictLabel(marketContactSubjectOptions, row.touchSubject)
  }
  return row.touchSubject || '-'
}
</script>

<style scoped>

.reach-page{
  background: #f4f4f4;
}
/* ============ 查询栏 ============ */
.reach-query {
  display: flex;
  min-height: 58px;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 14px;
  border: none;
  border-radius: 3px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
}

.reach-query__view {
  display: inline-flex;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 13px;
}

.reach-query__field {
  display: flex;
  min-width: 0;
  align-items: center;
}

.reach-query__label {
  flex-shrink: 0;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.reach-query__period {
  width: 340px;
}

.reach-query__period :deep(.el-date-editor) {
  width: 260px;
}

.reach-query__org {
  width: 160px;
}

.reach-query__manager {
  width: 210px;
}

.reach-query__manager .el-select {
  width: 100%;
}

.reach-query__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: auto;
}

.reach-query__actions .el-button + .el-button {
  margin-left: 8px;
}

@media (max-width: 1280px) {
  .reach-query {
    flex-wrap: wrap;
  }

  .reach-query__actions {
    margin-left: 0;
  }
}

/* ============ 核心指标卡 ============ */
.reach-kpi {
  margin-bottom: 6px;
}

.reach-kpi .el-col {
  margin-bottom: 10px;
}

.reach-kpi__card {
  border: none;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
  transition: box-shadow 0.2s ease;
}

.reach-kpi__card:hover {
  box-shadow: 0 3px 10px rgb(31 45 61 / 7%);
}

.kpi-card {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}

.kpi-icon {
  display: flex;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 14px;
}

.kpi-card--success .kpi-icon {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.kpi-card--neutral .kpi-icon {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.kpi-info {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: baseline;
  gap: 8px;
}

.kpi-label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.kpi-period {
  margin-left: 5px;
  color: var(--el-text-color-placeholder);
  font-size: 11px;
}

.kpi-main {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 6px;
}

.kpi-value {
  flex-shrink: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.kpi-unit {
  margin-left: 2px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

/* ============ 领奖台 ============ */
.reach-podium {
  margin-bottom: 16px;
}

.reach-podium :deep(.el-card__body) {
  padding: 12px 20px 18px;
}

.podium-title__icon {
  margin-right: 6px;
  color: #c9952e;
  font-size: 16px;
}

.podium-list {
  display: grid;
  min-height: 204px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 12px;
  padding: 8px 10%;
  border-bottom: 3px solid var(--el-border-color);
}

.podium-item {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
}

.podium-item--1 {
  order: 2;
}

.podium-item--2 {
  order: 1;
}

.podium-item--3 {
  order: 3;
}

.podium-item__badge {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 15px;
  font-weight: 700;
}

.podium-item--1 .podium-item__badge {
  background: #fff5cf;
  color: #b78300;
}

.podium-item--2 .podium-item__badge {
  background: #edf1f5;
  color: #73808d;
}

.podium-item--3 .podium-item__badge {
  background: #f7eadf;
  color: #a87343;
}

.podium-item__name {
  width: 100%;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium-item__times {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.podium-item__times strong {
  color: var(--el-text-color-primary);
  font-size: 20px;
  line-height: 28px;
}

.podium-item--1 .podium-item__times strong {
  color: #b78300;
}

.podium-item__sources {
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 10px;
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 18px;
}

.podium-stage {
  display: flex;
  width: 100%;
  height: 54px;
  align-items: center;
  justify-content: center;
  margin-top: 7px;
  background: #d9dee5;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
}

.podium-item--1 .podium-stage {
  height: 88px;
  background: #e7b82f;
}

.podium-item--2 .podium-stage {
  height: 76px;
  background: #b9c1ca;
}

.podium-item--3 .podium-stage {
  height: 66px;
  background: #c9a27c;
}

/* ============ 区块卡片 ============ */
.reach-block {
  margin-bottom: 16px;
}

.reach-block :deep(.el-card__header) {
  border-bottom: none;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.reach-block :deep(.el-card__body) {
  padding: 16px 20px 20px;
}

.reach-block {
  border: none;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgb(0 21 41 / 4%);
}

.block-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.block-head__extra {
  display: flex;
  align-items: center;
  gap: 12px;
}

.block-title {
  display: flex;
  align-items: center;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.block-title::before {
  display: inline-block;
  width: 3px;
  height: 14px;
  margin-right: 8px;
  border-radius: 2px;
  background: var(--el-color-primary);
  content: "";
}

.block-sub,
.block-meta {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* ============ 下钻面包屑 ============ */
.drill-crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}

.drill-crumb__item {
  color: var(--el-text-color-secondary);
}

.drill-crumb__item.is-link {
  color: var(--el-color-primary);
  cursor: pointer;
}

.drill-crumb__item.is-current {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.drill-crumb__sep {
  color: var(--el-text-color-placeholder);
}

/* ============ 来源分布 ============ */
.segment-bar {
  display: flex;
  height: 30px;
  overflow: hidden;
  margin-bottom: 18px;
  border-radius: 4px;
}

.segment {
  cursor: pointer;
  transition: filter 0.15s, opacity 0.15s;
}

.segment + .segment {
  border-left: 2px solid #fff;
}

.segment:hover {
  filter: brightness(1.1);
}

.segment.is-dimmed {
  opacity: 0.25;
}

.source-legend {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.source-item {
  padding: 10px 12px;
  border: none;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}

.source-item:hover {
  background: var(--el-fill-color);
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
}

.source-item.is-active {
  background: var(--el-color-primary-light-9);
}

.source-item__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 3px;
}

.source-name {
  overflow: hidden;
  flex: 1;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-times {
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.source-track {
  height: 7px;
  overflow: hidden;
  margin-top: 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
}

.source-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.source-percent {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* ============ 汇总表单元格 ============ */
.rank-num {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 700;
}

.rank-num--top1 {
  background: #fef0f0;
  color: var(--el-color-danger);
}

.rank-num--top2 {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.rank-num--top3 {
  background: #f0f9eb;
  color: var(--el-color-success);
}

.org-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.org-link:hover {
  text-decoration: underline;
}

.cell-muted {
  color: var(--el-text-color-secondary);
}

/* 非可点击数值，避免与 .org-link 等可点击项共用主题色 */
.cell-accent {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.share-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-track {
  width: 100px;
  height: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 3px;
  background: var(--el-fill-color);
}

.share-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--el-color-primary);
  transition: width 0.3s;
}

.reach-summary-table :deep(.el-table__header .cell) {
  word-break: keep-all;
  white-space: nowrap;
}

/* ============ 明细抽屉 ============ */
.detail-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 8px;
}

.detail-stats__note {
  margin-bottom: 14px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.detail-stat {
  padding: 10px 12px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
}

.detail-stat__label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.detail-stat__value {
  margin-top: 2px;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
}

.detail-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.detail-filters__label {
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.detail-filters__meta {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.detail-filters__group-filter {
  margin-left: 6px;
}

.detail-source-tabs {
  flex-shrink: 0;
}

.detail-source-tabs :deep(.el-radio-button__inner) {
  min-width: 72px;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: var(--el-text-color-regular);
  font-weight: 400;
}

.detail-source-tabs :deep(.el-radio-button:first-child .el-radio-button__inner),
.detail-source-tabs :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0;
}

.detail-source-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  border-bottom-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: none;
  color: var(--el-color-primary);
  font-weight: 500;
}

@media (max-width: 900px) {
  .podium-list {
    gap: 8px;
    padding-right: 2%;
    padding-left: 2%;
  }

  .podium-item__sources {
    display: none;
  }

  .source-legend {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .block-head {
    flex-direction: column;
  }
}
</style>
