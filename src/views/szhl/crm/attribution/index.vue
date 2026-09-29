<template>
  <div class="app-container crm-page">
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      @search="handleQuery"
      @reset="resetQuery"
    >
      <template #attributionOrg>
        <CrmOrgSelect v-model="queryParams.attributionOrg" placeholder="可输入汉字或数字" />
      </template>
      <template #portraitTag>
        <PortraitTagQuerySelect
          v-model="queryParams.portraitTagIds"
          v-model:matchMode="queryParams.portraitTagMatchMode"
          :tags="featureTags"
        />
      </template>
      <!-- 网格筛选：点输入框弹窗选用（与网格维护同一套行政区划树），确认后回显所选网格并下发网格编码 -->
      <template #gridRegion>
        <CustomerGridSelect v-model="queryParams.gridArea" placeholder="请选择客户网格" />
      </template>
      <template #actions-left>
        <el-button type="primary" plain icon="Search" @click="handleExactSearch">客户号精准搜索</el-button>
        <el-divider direction="vertical" />
        <el-button type="primary" plain icon="User" :disabled="historyMode || multiple" @click="assignDialogRef?.open(selection)" v-hasPermi="['crm:attribution:assign']">分配管户</el-button>
        <el-button type="primary" plain icon="CollectionTag" :disabled="historyMode || multiple" @click="openPortraitTagDialog" v-hasPermi="['crm:attribution:tag']">特征画像</el-button>
        <el-button type="primary" plain icon="Upload" class="batch-modify-entry" :disabled="historyMode" @click="batchModifyDialogRef?.open()" v-hasPermi="['crm:attribution:batchModify']">批量修改归属</el-button>
        <el-button plain icon="CollectionTag" @click="columnDialogOpen = true">列显示设定</el-button>
        <el-button plain icon="Download" @click="handleExport" v-hasRole="['president', 'assistant', 'commander']">导出</el-button>
      </template>
      <template #actions-right>
        <!-- 数据日期是模式开关而非筛选条件，放在操作行右侧而不是搜索项里 -->
        <el-select
          v-model="queryParams.statDate"
          class="data-month-select"
          :class="{ 'is-history': historyMode }"
          :placeholder="currentMonthLabel"
          popper-class="data-month-dropdown"
          placement="bottom-end"
          @change="handleDataMonthChange"
        >
          <template #prefix>
            <el-icon><Calendar /></el-icon>
          </template>
          <el-option :label="currentMonthLabel" value="" />
          <el-option
            v-for="month in historyMonthOptions"
            :key="month"
            :label="month"
            :value="month"
          />
          <div class="data-month-note">
            <p>仅指标列按所选时点取值，归属、机构列恒为实时。</p>
            <p>历史月末只读，归属维护停用。</p>
          </div>
        </el-select>
      </template>
    </SearchForm>

    <common-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      :data="tableList"
      :columns="attributionTableColumns"
      :total="total"
      class="attribution-table"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @pagination="getList"
    >
      <template #mainCustomerFlag="{ row }">
        <el-tag
          v-if="String(row.mainCustomerFlag) === '1'"
          effect="plain"
          class="main-customer-tag"
          @click="handleMainTagClick(row)"
        >主客</el-tag>
        <span v-else></span>
      </template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #marketingStatus="{ row }">
        <span v-if="isEffectiveDefer(row)" class="defer-end-date">{{ formatDate(row.deferEndDate) }}</span>
        <span v-else></span>
      </template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #portraitTags="{ row }">
        <div class="portrait-tags-cell">
          <span
            v-for="tag in portraitTagList(row.portraitTagList)"
            :key="tag.tagId"
            class="portrait-tag"
            :class="'portrait-tag--' + tag.nature"
          >{{ tag.tagName }}</span>
        </div>
      </template>
      <template #updateBy="{ row }">{{ formatUser(row.updateBy) }}</template>
      <template #actions="{ row }">
        <div class="row-actions">
          <el-button link type="primary" icon="EditPen" :disabled="historyMode" @click="openContact(row)" v-hasPermi="['crm:contact:record']">触达登记</el-button>
          <el-dropdown class="row-actions-more" trigger="click">
            <el-button link type="primary" icon="ArrowDown" title="更多操作" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item icon="View" @click="openCustomer360(row)">360 视图</el-dropdown-item>
                <el-dropdown-item icon="Tickets" @click="loanDetailDialogRef?.open(row)">贷款明细</el-dropdown-item>
                <el-dropdown-item icon="Switch" :disabled="historyMode" @click="disputeDialogRef?.open(row)" v-hasPermi="['crm:dispute:create']">机构调整</el-dropdown-item>
                <el-dropdown-item icon="Connection" :disabled="historyMode" @click="relationDialogRef?.open(row)" v-hasPermi="['crm:attribution:relation']">关联维护</el-dropdown-item>
                <el-dropdown-item icon="Timer" :disabled="historyMode" @click="deferDialogRef?.open(row)" v-hasPermi="['crm:defer:create']">暂缓触达</el-dropdown-item>
                <el-dropdown-item icon="Grid" :disabled="historyMode" @click="regionGridDialogRef?.open(row)" v-hasPermi="['crm:attribution:grid']">网格维护</el-dropdown-item>
                <el-dropdown-item icon="Picture" @click="openImageManage(row)">影像管理</el-dropdown-item>
                <el-dropdown-item icon="Clock" @click="changeLogDrawerRef?.open(row)">变更历史</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </common-table>

    <el-dialog :title="touchHistoryTitle" v-model="touchHistoryOpen" width="1040px" append-to-body>
      <el-table
        v-loading="touchHistoryLoading"
        :data="touchHistoryRows"
        :row-class-name="touchHistoryRowClassName"
        row-key="id"
        class="touch-history-table"
        max-height="420"
        empty-text="暂无触达记录"
      >
        <el-table-column type="expand" width="44">
          <template #default="scope">
            <div v-if="hasFollowupRecords(scope.row)" class="touch-followup-wrap">
              <div class="touch-followup-title">跟踪记录（{{ scope.row.followupCount || scope.row.followupRecords.length }}）</div>
              <el-table :data="scope.row.followupRecords" size="small" border class="touch-followup-table" empty-text="暂无跟踪记录">
                <el-table-column label="跟踪日期" width="110" align="center">
                  <template #default="followupScope">{{ parseTime(followupScope.row.followupDate, '{y}-{m}-{d}') || '-' }}</template>
                </el-table-column>
                <el-table-column label="跟踪方式" width="100" align="center">
                  <template #default="followupScope">{{ selectDictLabel(contactWayOptions, followupScope.row.followupWay) || '-' }}</template>
                </el-table-column>
                <el-table-column label="跟踪状态" width="90" align="center">
                  <template #default="followupScope">
                    <el-tag :type="followupScope.row.followupStatus === '1' ? 'success' : 'warning'">
                      {{ followupScope.row.followupStatus === '1' ? '完成' : '未完' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="跟踪结果" min-width="220" show-overflow-tooltip>
                  <template #default="followupScope">{{ followupScope.row.followupResult || '-' }}</template>
                </el-table-column>
                <el-table-column label="备注" min-width="220" show-overflow-tooltip>
                  <template #default="followupScope">{{ followupScope.row.followupNote || '-' }}</template>
                </el-table-column>
                <el-table-column label="跟踪人" width="110" align="center" show-overflow-tooltip>
                  <template #default="followupScope">{{ followupScope.row.followupBy || '-' }}</template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="触达日期" prop="contactDate" width="110" align="center">
          <template #default="scope">{{ parseTime(scope.row.contactDate, '{y}-{m}-{d}') || '-' }}</template>
        </el-table-column>
        <el-table-column label="触达方式" prop="contactWay" width="100" align="center">
          <template #default="scope">
            <dict-tag v-if="scope.row.contactWay" :options="contactWayOptions" :value="scope.row.contactWay" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="触达结果" prop="contactResult" width="110" align="center">
          <template #default="scope">
            <dict-tag v-if="scope.row.contactResult" :options="contactResultOptions" :value="scope.row.contactResult" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="客户态度" prop="customerAttitude" width="100" align="center">
          <template #default="scope">{{ selectDictLabel(attitudeOptions, scope.row.customerAttitude) || '-' }}</template>
        </el-table-column>
        <el-table-column label="补充说明" prop="supplement" min-width="180" show-overflow-tooltip />
        <el-table-column label="是否跟踪" prop="needFollowup" width="90" align="center">
          <template #default="scope">{{ scope.row.needFollowup === '1' ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="跟踪事项" prop="followupItem" min-width="180" show-overflow-tooltip />
        <el-table-column label="触达人" prop="contactBy" width="100" align="center">
          <template #default="scope">{{ formatUser(scope.row.contactBy) }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="touchHistoryOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <ContactRecordDialog ref="contactDialogRef" @success="getList" />
    <PortraitTagDialog ref="portraitTagDialogRef" @success="getList" @batch-import="batchTagDialogRef?.open()" />
    <AttributionBatchModifyDialog ref="batchModifyDialogRef" @success="getList" />
    <AttributionLoanDetailDialog ref="loanDetailDialogRef" />
    <AttributionAssignDialog ref="assignDialogRef" @success="getList" />
    <AttributionDeferDialog ref="deferDialogRef" :org-options="orgOptions" />
    <AttributionDisputeDialog ref="disputeDialogRef" :org-options="orgOptions" @success="getList" />
    <AttributionBatchTagDialog ref="batchTagDialogRef" :feature-tags="featureTags" @success="getList" />
    <AttributionRelationDialog ref="relationDialogRef" :org-options="orgOptions" @success="getList" />
    <AttributionChangeLogDrawer ref="changeLogDrawerRef" :org-options="orgOptions" />

    <AttributionRegionGridDialog ref="regionGridDialogRef" @success="getList" />

    <ColumnSettingsDialog
      v-model="columnDialogOpen"
      :columns="columns"
      :categories="dataTagCategories"
      :common-keys="COMMON_COLUMN_KEYS"
      tip="应用或保存后将按所选可见列重新查询列表"
      @apply="handleColumnsApply"
      @save="handleColumnsSave"
    />

  </div>
</template>

<script setup name="Attribution">
import { computed, getCurrentInstance, onActivated, onDeactivated, onUnmounted, reactive, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import SearchForm from '@/components/SearchForm'
import {
  listAttribution,
  preciseSearch,
  listFeatureTagTree,
  listDataTagSnapshotMonths,
  getAttributionDataDate
} from '@/api/szhl/crm/attribution'
import { getColumnConfig, saveColumnConfig } from '@/api/szhl/crm/column'
import { listDataTag } from '@/api/szhl/crm/dataTag'
import { listContactRecord } from '@/api/szhl/crm/contactRecord'
import ContactRecordDialog from '@/views/szhl/crm/components/ContactRecordDialog'
import PortraitTagDialog from '@/views/szhl/crm/components/PortraitTagDialog'
import AttributionBatchModifyDialog from '@/views/szhl/crm/components/AttributionBatchModifyDialog'
import AttributionLoanDetailDialog from '@/views/szhl/crm/components/AttributionLoanDetailDialog'
import AttributionAssignDialog from '@/views/szhl/crm/components/AttributionAssignDialog'
import AttributionDeferDialog from '@/views/szhl/crm/components/AttributionDeferDialog'
import AttributionDisputeDialog from '@/views/szhl/crm/components/AttributionDisputeDialog'
import AttributionRegionGridDialog from '@/views/szhl/crm/components/AttributionRegionGridDialog'
import AttributionBatchTagDialog from '@/views/szhl/crm/components/AttributionBatchTagDialog'
import AttributionRelationDialog from '@/views/szhl/crm/components/AttributionRelationDialog'
import AttributionChangeLogDrawer from '@/views/szhl/crm/components/AttributionChangeLogDrawer'
import PortraitTagQuerySelect from '@/views/szhl/crm/components/PortraitTagQuerySelect'
import CustomerGridSelect from '@/views/szhl/crm/components/CustomerGridSelect'
import ColumnSettingsDialog from '@/views/szhl/crm/components/ColumnSettingsDialog'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { listAdvancedQueryConditions } from '@/api/szhl/crm/advancedQuery'
import { formatMoney } from '@/utils/ruoyi'
import {
  formatDataTagLabel,
  formatDataTagBoolean,
  formatYuanToWan,
  isYuanAmountField
} from '@/utils/crmDataTag'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import { checkPermi } from '@/utils/permission'
import { setHistoryMonth } from '@/utils/historyMonth'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'
import { useCustomer360Nav } from '@/views/szhl/crm/composables/useCustomer360Nav'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const {
  crm_public_private: publicPrivateOptions,
  crm_customer_type: customerTypeOptions,
  crm_contact_way: contactWayOptions,
  crm_contact_result: contactResultOptions,
  crm_customer_attitude: attitudeOptions
} = proxy.useDict(
  'crm_public_private',
  'crm_customer_type',
  'crm_contact_way',
  'crm_contact_result',
  'crm_customer_attitude'
)
const router = useRouter()
const { openViewByNo } = useCustomer360Nav()
const IMAGE_QUERY_PATH = '/crm/attributionMgr/image'
const marketingStatusOptions = ref([
  { label: '正常', value: '正常' },
  { label: '暂缓', value: '暂缓' }
])

const PAGE_KEY = 'attribution-list'
// 数据字段列默认勾选项（字段集本身由 /crm/dataTag/list 动态下发）
const DEFAULT_VISIBLE_DATA_KEYS = ['mobileBank', 'validContract', 'loanCustomerFlag', 'wealthFlag', 'depositAvg', 'loanBalance']

const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const selection = ref([])
const contactDialogRef = ref()
const portraitTagDialogRef = ref()
const batchModifyDialogRef = ref()
const loanDetailDialogRef = ref()
const assignDialogRef = ref()
const deferDialogRef = ref()
const disputeDialogRef = ref()
const regionGridDialogRef = ref()
const batchTagDialogRef = ref()
const relationDialogRef = ref()
const changeLogDrawerRef = ref()
const columnDialogOpen = ref(false)
const touchHistoryOpen = ref(false)
const touchHistoryLoading = ref(false)
const touchHistoryRows = ref([])
const touchHistoryCustomer = ref({})

const featureTags = ref([])
const advancedQueryOptions = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    publicPrivateType: undefined,
    customerType: undefined,
    customerName: undefined,
    customerNo: undefined,
    attributionOrg: undefined,
    managerId: undefined,
    gridArea: undefined,
    portraitTagIds: [],
    portraitTagMatchMode: 'ANY',
    marketingStatus: undefined,
    advancedQuery: undefined,
    orderByColumn: undefined,
    isAsc: undefined,
    // 数据月份：'' 为「当前」（指标查实时宽表），非空为月末快照日期（指标查该月快照）
    statDate: ''
  }
})

const { queryParams } = toRefs(data)

// 「数据月份」只换指标列的取值，不换行集——归属列与筛选条件、数据权限始终按实时归属表来。
const snapshotMonths = ref([])
const historyMode = computed(() => !!queryParams.value.statDate)

// 首项展示后端下发的数据日期（最近成功批次的产品分区），不做文案兜底
const latestDataDate = ref('')
const currentMonthLabel = computed(() => latestDataDate.value)
// 最新数据日期恰为月末时，同日快照与「最新」内容重复，只保留「最新」（可写）
const historyMonthOptions = computed(() => snapshotMonths.value.filter(month => month !== latestDataDate.value))

function loadSnapshotMonths () {
  listDataTagSnapshotMonths().then(res => {
    snapshotMonths.value = res.data || []
  }).catch(() => {})
}

function loadLatestDataDate () {
  getAttributionDataDate().then(res => {
    latestDataDate.value = res.data || ''
  }).catch(() => {})
}

function handleDataMonthChange (statDate) {
  setHistoryMonth(statDate)
  getList()
}

// 请求头必须跟着页面状态走：离开页面要清掉，否则会连带拦住其他页面共用 controller 的写操作
function syncHistoryMonthHeader () {
  setHistoryMonth(queryParams.value.statDate)
}
onActivated(syncHistoryMonthHeader)
onUnmounted(syncHistoryMonthHeader)
onDeactivated(() => setHistoryMonth(''))

const columns = ref([
  { key: 'customerId', label: '客户内码', visible: false },
  { key: 'spouseName', label: '法代/配偶', visible: true },
  { key: 'spouseCustomerNo', label: '法代/配偶客户号', visible: true },
  { key: 'marketingStatus', label: '暂缓触达状态', visible: true },
  { key: 'last3mContactDate', label: '近三月触达日期', visible: true },
  { key: 'contactPhone', label: '联系电话', visible: true },
  { key: 'contactAddress', label: '联系地址', visible: true },
  { key: 'attributionOrg', label: '归属机构', visible: true },
  { key: 'grid', label: '常驻网格', visible: true },
  { key: 'portraitTags', label: '客户画像标签', visible: true },
  { key: 'managerName', label: '管户经理', visible: true },
  { key: 'updateTime', label: '最后更新日期', visible: true },
  { key: 'updateBy', label: '最后更新人', visible: true }
])
// 数据标签自定义分类（/crm/dataTag/list 的 categories），供列显示设定弹窗分组
const dataTagCategories = ref([])
const COMMON_COLUMN_KEYS = [
  'spouseName', 'spouseCustomerNo', 'marketingStatus', 'last3mContactDate', 'contactPhone',
  'attributionOrg', 'grid', 'portraitTags', 'managerName', 'updateTime', 'updateBy'
]

const multiple = computed(() => selection.value.length === 0)
const currentRow = computed(() => selection.value[0] || {})
const colVisible = computed(() => {
  const map = {}
  columns.value.forEach(item => { map[item.key] = item.visible })
  return map
})
const visibleDataColumns = computed(() => columns.value.filter(item => item.dataField && item.visible))
const sortOrders = ['descending', 'ascending']
const attributionTableColumns = computed(() => {
  const baseColumns = [
    { type: 'selection', width: 50, align: 'center', fixed: 'left' },
    {
      key: 'actions',
      label: '操作',
      width: 140,
      align: 'center',
      fixed: 'left',
      className: 'small-padding fixed-width',
      slot: 'actions'
    },
    {
      key: 'customerName',
      label: '客户名称',
      prop: 'customerName',
      width: 160,
      align: 'left',
      fixed: 'left',
      sortable: 'custom',
      sortOrders,
      showOverflowTooltip: true,
      slot: 'customerName'
    },
    {
      key: 'mainCustomerFlag',
      label: '主客',
      columnKey: 'mainCustomerFlag',
      width: 90,
      align: 'center',
      sortable: 'custom',
      sortOrders,
      showOverflowTooltip: true,
      slot: 'mainCustomerFlag'
    },
    {
      key: 'customerNo',
      label: '客户号',
      prop: 'customerNo',
      width: 180,
      sortable: 'custom',
      sortOrders,
      showOverflowTooltip: true,
      slot: 'customerNo'
    },
    { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true, visible: colVisible.value.customerId },
    { key: 'spouseName', label: '法代/配偶', prop: 'spouseName', width: 150, showOverflowTooltip: true, visible: colVisible.value.spouseName },
    { key: 'spouseCustomerNo', label: '法代/配偶客户号', prop: 'spouseCustomerNo', width: 180, showOverflowTooltip: true, visible: colVisible.value.spouseCustomerNo },
    {
      key: 'marketingStatus',
      label: '暂缓触达状态',
      prop: 'marketingStatus',
      width: 140,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.marketingStatus,
      slot: 'marketingStatus'
    },
    {
      key: 'last3mContactDate',
      label: '近三月触达日期',
      prop: 'last3mContactDate',
      width: 160,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.last3mContactDate,
      formatter: row => proxy.parseTime(row.last3mContactDate, '{y}-{m}-{d}') || ''
    },
    { key: 'contactPhone', label: '联系电话', prop: 'contactPhone', width: 150, showOverflowTooltip: true, visible: colVisible.value.contactPhone },
    { key: 'contactAddress', label: '联系地址', prop: 'contactAddress', width: 280, showOverflowTooltip: true, visible: colVisible.value.contactAddress },
    {
      key: 'attributionOrg',
      label: '归属机构',
      prop: 'attributionOrg',
      width: 150,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.attributionOrg,
      slot: 'attributionOrg'
    },
    {
      key: 'grid',
      label: '常驻网格',
      prop: 'grid',
      width: 240,
      showOverflowTooltip: true,
      visible: colVisible.value.grid
    },
    {
      key: 'portraitTags',
      label: '客户画像标签',
      prop: 'portraitTagNames',
      width: 240,
      visible: colVisible.value.portraitTags,
      slot: 'portraitTags'
    },
    {
      key: 'managerName',
      label: '管户经理',
      prop: 'managerName',
      width: 130,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.managerName,
      formatter: row => formatManagerName(row)
    }
  ]
  // 审计列（最后更新日期、最后更新人等）始终排在最后，新增业务数据列插入其前
  const auditColumns = [
    {
      key: 'updateTime',
      label: '最后更新日期',
      prop: 'updateTime',
      width: 140,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.updateTime,
      formatter: row => proxy.parseTime(row.updateTime, '{y}-{m}-{d}')
    },
    {
      key: 'updateBy',
      label: '最后更新人',
      prop: 'updateBy',
      width: 130,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.updateBy,
      slot: 'updateBy'
    }
  ]
  const dataColumns = visibleDataColumns.value.map(col => {
    // 金额/计数列千分位：dataType 兼容物理类型（decimal/bigint）与标签定义值类型（DECIMAL/INTEGER）
    const dataType = String(col.dataType || '').toLowerCase()
    const isAmount = !col.tagColumn && ['decimal', 'numeric', 'double', 'float'].includes(dataType)
    const isCount = !col.tagColumn && dataType.includes('int')
    const isYuanAmount = isYuanAmountField(col)
    return {
      key: col.key,
      label: col.label,
      prop: col.key,
      width: col.tagColumn ? 140 : 160,
      align: col.tagColumn ? 'center' : 'right',
      showOverflowTooltip: true,
      ...(col.tagColumn
        ? {
            formatter: row => formatDataTagBoolean(row[col.key])
          }
        : {}),
      ...(isAmount || isCount
        ? {
            className: 'amount-cell',
            formatter: row => isYuanAmount
              ? formatYuanToWan(row[col.key])
              : formatMoney(row[col.key], isAmount ? 2 : 0)
          }
        : {})
    }
  })
  return baseColumns.concat(dataColumns, auditColumns)
})
const touchHistoryTitle = computed(() => touchHistoryCustomer.value.customerName ? `${touchHistoryCustomer.value.customerName} - 触达记录` : '触达记录')

// 网格筛选：由 CustomerGridSelect 弹窗选用（数据源与网格维护同为行政区划表 crm_region_code），
// 确认后把所选层级的编码写入 queryParams.gridArea（后端 grid_code 口径）。
const searchFields = computed(() => [
  {
    label: '公私类别',
    prop: 'publicPrivateType',
    type: 'select',
    placeholder: '请选择',
    options: publicPrivateOptions.value || []
  },
  {
    label: '客户类别',
    prop: 'customerType',
    type: 'select',
    placeholder: '请选择',
    options: customerTypeOptions.value || []
  },
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
    label: '归属机构',
    prop: 'attributionOrg',
    type: 'slot',
    slotName: 'attributionOrg'
  },
  {
    label: '管户经理',
    prop: 'managerId',
    type: 'userSelect',
    placeholder: '可输入姓名或工号'
  },
  {
    // 网格筛选由 CustomerGridSelect 弹窗选用，选中网格编码写进 gridArea（grid_code）。
    // prop 必须就是 gridArea：SearchForm 内部持有 model 副本，只重置 fields 里声明的 prop，
    // 若这里写成占位名 gridRegion，重置后 formData.gridArea 的旧值会被 deep watch 回写回父级，第一次点重置清不掉。
    label: '客户网格',
    prop: 'gridArea',
    type: 'slot',
    slotName: 'gridRegion'
  },
  {
    label: '画像标签',
    prop: 'portraitTagIds',
    type: 'slot',
    slotName: 'portraitTag'
  },
  {
    label: '暂缓触达',
    prop: 'marketingStatus',
    type: 'select',
    placeholder: '请选择',
    options: marketingStatusOptions.value || []
  },
  {
    label: '高级查询',
    prop: 'advancedQuery',
    type: 'select',
    placeholder: '请选择',
    options: advancedQueryOptions.value || []
  }
])
// 普通列表只查询当前可见动态列（后端按启用定义与 Registry 白名单取交集）。
// 全部隐藏时传哨兵值 NONE：空串会被 tansParams 丢参，导致后端误判为旧客户端而回落默认列。
function visibleDataFields () {
  return columns.value.filter(item => item.dataField && item.visible).map(item => item.key).join(',') || 'NONE'
}

// 精准搜索结果展示期间，列设置变更不触发普通列表重查，避免覆盖精准结果
const exactSearchActive = ref(false)

function getList () {
  exactSearchActive.value = false
  loading.value = true
  listAttribution({ ...queryParams.value, dataFields: visibleDataFields() }).then(res => {
    tableList.value = res.rows
    total.value = res.total
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery () {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery () {
  Object.assign(queryParams.value, {
    pageNum: 1,
    publicPrivateType: undefined,
    customerType: undefined,
    customerName: undefined,
    customerNo: undefined,
    attributionOrg: undefined,
    managerId: undefined,
    gridArea: undefined,
    portraitTagIds: [],
    portraitTagMatchMode: 'ANY',
    marketingStatus: undefined,
    advancedQuery: undefined,
    orderByColumn: undefined,
    isAsc: undefined
  })
  getList()
}

function handleSelectionChange (rows) {
  selection.value = rows
}

function handleSortChange (column) {
  queryParams.value.orderByColumn = column.order ? column.prop : undefined
  queryParams.value.isAsc = column.order || undefined
  getList()
}

function parseDateEndValue (value) {
  if (!value) return NaN
  if (typeof value === 'number') return String(value).length === 10 ? value * 1000 : value
  if (value instanceof Date) {
    const date = new Date(value.getTime())
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
      date.setHours(23, 59, 59, 999)
    }
    return date.getTime()
  }
  const text = String(value).trim()
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0))
    : new Date(text)
  if (Number.isNaN(date.getTime())) return NaN
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
    date.setHours(23, 59, 59, 999)
  }
  return date.getTime()
}

function isEffectiveDefer (row) {
  return parseDateEndValue(row?.deferEndDate) > Date.now()
}

function formatDate (value) {
  return proxy.parseTime(value, '{y}-{m}-{d}') || ''
}

function formatUser (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function formatManagerName (row) {
  const manager = row.managerName || row.managerId
  return formatUserDisplayName(managerOptions.value, manager, '')
}

function portraitTagList (value) {
  if (!Array.isArray(value)) return []
  return value
    .filter(tag => tag && tag.tagId !== undefined && tag.tagName)
    .map(tag => ({
      tagId: String(tag.tagId),
      tagName: tag.tagName,
      nature: tag.nature || 'neutral'
    }))
}

function loadFeatureTags () {
  listFeatureTagTree({}).then(res => {
    featureTags.value = res.data || []
  })
}

// 数据字段列从后端读取（crm_customer_data_tag 表结构元数据）
function loadDataTagMeta () {
  return listDataTag().then(res => {
    const fields = (res.data && res.data.fields) || []
    dataTagCategories.value = (res.data && res.data.categories) || []
    const dataColumns = []
    const sortedFields = [...fields].sort((a, b) => a.ordinalPosition - b.ordinalPosition)
    sortedFields.forEach(item => {
      const existing = columns.value.find(column => !column.dataField && column.key === item.fieldName)
      if (existing) {
        existing.subjectScope = item.subjectScope
        existing.categoryId = item.categoryId
        return
      }
      dataColumns.push({
        key: item.fieldName,
        label: formatDataTagLabel(item.labelName, item.unit),
        visible: item.defaultVisible == null
          ? DEFAULT_VISIBLE_DATA_KEYS.includes(item.fieldName)
          : item.defaultVisible === true,
        dataField: true,
        tagColumn: item.tagColumn,
        dataType: item.dataType,
        unit: item.unit,
        subjectScope: item.subjectScope,
        categoryId: item.categoryId
      })
    })
    columns.value = columns.value.filter(item => !item.dataField).concat(dataColumns)
  })
}

function loadColumnConfig () {
  return getColumnConfig(PAGE_KEY).then(res => {
    if (res.data && res.data.columns) {
      try {
        applyColumnKeys(JSON.parse(res.data.columns))
      } catch {
        // 配置格式异常时保持默认列
      }
    }
  })
}

// 点击「主客」标签直接打开关联维护
function handleMainTagClick (row) {
  if (historyMode.value) {
    proxy.$modal.msgWarning('历史月末数据下不支持写操作，请先切回最新数据日期')
    return
  }
  if (!checkPermi(['crm:attribution:relation'])) return
  relationDialogRef.value?.open(row)
}

function openContact (row = currentRow.value) {
  if (!row) return
  contactDialogRef.value.open({
    customerId: row.customerId,
    customerName: row.customerName,
    contactPhone: row.contactPhone
  })
}

function openPortraitTagDialog () {
  if (selection.value.length === 0) {
    proxy.$modal.msgWarning('请选择客户记录')
    return
  }
  portraitTagDialogRef.value?.open(selection.value)
}

function openImageManage (row) {
  const target = row && row.customerNo ? row : currentRow.value
  if (!target.customerNo) {
    proxy.$modal.msgWarning('请选择一条客户记录')
    return
  }
  router.push({
    path: IMAGE_QUERY_PATH,
    query: {
      customerName: target.userName || target.customerName,
      customerNo: target.customerNo
    }
  })
}

function openCustomer360 (row) {
  openViewByNo(row.customerNo, row.publicPrivateType, row.customerName)
}

function hasFollowupRecords (row) {
  return Array.isArray(row.followupRecords) && row.followupRecords.length > 0
}

function touchHistoryRowClassName ({ row }) {
  return hasFollowupRecords(row) ? '' : 'touch-history-row-no-followup'
}

function openCustomerTouchHistory (row) {
  if (!row.customerId) {
    proxy.$modal.msgWarning('未获取到客户信息')
    return
  }
  touchHistoryCustomer.value = row
  touchHistoryOpen.value = true
  touchHistoryLoading.value = true
  listContactRecord(row.customerId).then(res => {
    touchHistoryRows.value = res.data || []
  }).finally(() => {
    touchHistoryLoading.value = false
  })
}

function handleExactSearch () {
  if (!queryParams.value.customerNo) {
    proxy.$modal.msgWarning('请输入客户号')
    return
  }
  exactSearchActive.value = true
  loading.value = true
  preciseSearch(queryParams.value.customerNo).then(res => {
    tableList.value = res.data || []
    total.value = tableList.value.length
  }).finally(() => {
    loading.value = false
  })
}

function handleExport () {
  const params = { ...queryParams.value }
  delete params.pageNum
  delete params.pageSize
  params.exportFields = columns.value.filter(item => item.visible).map(item => item.key).join(',')
  if (Array.isArray(params.portraitTagIds)) {
    params.portraitTagIds = params.portraitTagIds.join(',')
  }
  proxy.download('/crm/attribution/export', params, '客户归属数据.xlsx', { appCode: 'crm' })
}

function applyColumnKeys (keys) {
  columns.value.forEach(item => {
    item.visible = keys.includes(item.key)
  })
}

// 新勾选列后端此前未查询，应用列设置后立即重查；精准结果视图下不重查（精准接口返回固定结构）
function refreshAfterColumnsChange () {
  if (!exactSearchActive.value) {
    getList()
  }
}

function handleColumnsApply (keys) {
  applyColumnKeys(keys)
  columnDialogOpen.value = false
  refreshAfterColumnsChange()
}

function handleColumnsSave (keys) {
  applyColumnKeys(keys)
  refreshAfterColumnsChange()
  saveColumnConfig({
    pageKey: PAGE_KEY,
    columns: JSON.stringify(keys)
  }).then(() => {
    columnDialogOpen.value = false
    proxy.$modal.msgSuccess('个性化列配置已保存')
  })
}

function loadAdvancedQueryOptions () {
  listAdvancedQueryConditions('ATTRIBUTION').then(res => {
    advancedQueryOptions.value = (res.data || []).map(item => ({
      label: item.label,
      value: item.code
    }))
  })
}

loadAdvancedQueryOptions()
loadFeatureTags()
loadSnapshotMonths()
loadLatestDataDate()
// 先加载字段元数据与用户列配置，再发首个列表请求；加载失败时按默认列查询
loadDataTagMeta().then(() => loadColumnConfig()).catch(() => {}).finally(() => getList())
</script>

<style scoped>
/* flex-basis 生效时 width 声明被忽略，无需与 SearchForm 的 width:100% 抢优先级 */
.data-month-select {
  flex: 0 0 140px;
}

/* 历史视图下写操作全部禁用，用警示色提醒当前不是最新数据 */
.data-month-select.is-history :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-warning) inset;
}

.data-month-select.is-history :deep(.el-input__prefix) {
  color: var(--el-color-warning);
}

.attribution-table :deep(.cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attribution-table :deep(.el-link),
.attribution-table :deep(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.attribution-table :deep(.el-link__inner) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 金额/计数列：等宽数字，千分位后各行数位纵向对齐 */
.attribution-table :deep(.amount-cell) {
  font-variant-numeric: tabular-nums;
}

.batch-modify-entry {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  font-weight: 600;
}

.batch-modify-entry:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
}

.main-customer-tag {
  cursor: pointer;
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

.row-actions-more {
  line-height: 1;
}

.touch-history-table :deep(.touch-history-row-no-followup .el-table__expand-column .cell) {
  visibility: hidden;
  pointer-events: none;
}

.touch-followup-wrap {
  padding: 8px 12px 12px 44px;
  background: #fafafa;
}

.touch-followup-title {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.touch-followup-table :deep(.cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.defer-end-date {
  color: #f56c6c;
  font-weight: 500;
}

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

/* 客户画像标签：按性质着色（正向红 / 中性蓝 / 负向绿，与画像标签弹窗一致） */
.portrait-tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.portrait-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
}

.portrait-tag--positive {
  background: #ec5b56;
}

.portrait-tag--neutral {
  background: #4f7cf7;
}

.portrait-tag--negative {
  background: #34b277;
}
</style>

<style>
/* 下拉挂在 body 上，scoped 样式够不到，用 popper-class 限定作用域（同 CrmOrgSelect 做法） */
.data-month-dropdown {
  width: 248px;
}

/* 圆角裁掉 footer 的直角，底部留白交给 footer 自己 */
.data-month-dropdown {
  overflow: hidden;
}

.data-month-dropdown .el-select-dropdown__list {
  margin-bottom: 0 !important;
}

/* 此版 el-select 无 footer 插槽，说明只能落在 scrollbar 的 ul 内，
   靠 sticky 贴住底部做成 footer 条，避免随选项滚走 */
.data-month-dropdown .data-month-note {
  position: sticky;
  bottom: 0;
  margin-top: 4px;
  padding: 8px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.data-month-dropdown .data-month-note p {
  margin: 0 0 4px;
}

.data-month-dropdown .data-month-note p:last-child {
  margin-bottom: 0;
}
</style>
