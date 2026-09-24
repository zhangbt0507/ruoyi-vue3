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
      <template #portraitTag>
        <PortraitTagQuerySelect
          v-model="queryParams.portraitTagIds"
          v-model:matchMode="queryParams.portraitTagMatchMode"
          :tags="featureTags"
        />
      </template>
      <template #actions-left>
        <el-button type="primary" plain icon="Phone" :disabled="single" @click="openContact()" v-hasPermi="['crm:contact:record']">触达登记</el-button>
        <el-button type="success" plain icon="User" :disabled="multiple" @click="openAssign" v-hasPermi="['crm:contact:assign']">分解管户</el-button>
        <el-button type="primary" plain icon="Rank" :disabled="multiple" @click="openLevel" v-hasPermi="['crm:contact:level']">客户分层</el-button>
        <el-button plain icon="CollectionTag" @click="columnDialogOpen = true">列显示设定</el-button>
        <el-button plain icon="Download" @click="handleExport" v-hasPermi="['crm:contact:export']">导出</el-button>
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
      :columns="contactTableColumns"
      :total="total"
      height="560"
      class="crm-contact-table"
      @selection-change="handleSelectionChange"
      @pagination="getList"
    >
      <template #customerLevel="{ row }">
        <span>{{ selectDictLabel(levelOptions, row.customerLevel) || '-' }}</span>
        <el-tooltip v-if="hasLevelChange(row)" :content="formatLeaderLevelTip(row)" placement="top">
          <span :class="['level-change-flag', row.levelChangeFlag === '↑' ? 'level-up' : 'level-down']">
            {{ row.levelChangeFlag }}
          </span>
        </el-tooltip>
      </template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #portraitTags="{ row }">{{ formatPortraitTags(row.portraitTagList) }}</template>
      <template #customerMarketingStatus="{ row }">
        <span v-if="isEffectiveDefer(row)" class="defer-end-date">{{ formatValidDeferDate(row) }}</span>
        <span v-else></span>
      </template>
      <template #grid="{ row }">{{ [row.gridStreet, row.gridCommunity].filter(Boolean).join('/') || '-' }}</template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #attributionManager="{ row }">{{ formatUser(row.attributionManager) }}</template>
      <template #actions="{ row }">
        <el-button link type="primary" @click="openContact(row)" v-hasPermi="['crm:contact:record']">登记</el-button>
        <el-button link type="primary" @click="openCustomerDetail(row)">营销建议</el-button>
      </template>
    </common-table>

    <ContactRecordDialog ref="contactDialogRef" @success="getList" />

    <MarketingDetailDialog ref="marketingDetailRef" :feature-tags="featureTags" />

    <el-dialog title="分解管户" v-model="assignOpen" width="560px" append-to-body>
      <el-form :model="assignForm" label-width="110px">
        <el-form-item label="选择记录">
          <el-input :model-value="selection.length + ' 条'" disabled />
        </el-form-item>
        <el-form-item label="管户经理">
          <UserSelect v-model="assignForm.managerId" scope="crmAssignable" placeholder="请选择可分配管户经理" />
        </el-form-item>
        <el-form-item label="分解原因">
          <el-input v-model="assignForm.reason" type="textarea" :rows="3" placeholder="请输入分解原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAssign">保存</el-button>
        <el-button @click="assignOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="客户分层" v-model="levelOpen" width="560px" append-to-body>
      <el-form :model="levelForm" label-width="110px">
        <el-form-item label="选择记录">
          <el-input :model-value="selection.length + ' 条'" disabled />
        </el-form-item>
        <el-form-item label="分层维度">
          <el-radio-group v-model="levelForm.dimension">
            <el-radio
              v-for="item in levelDimensionOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="客户层级">
          <el-select v-model="levelForm.level" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="分层说明">
          <el-input v-model="levelForm.note" type="textarea" :rows="3" placeholder="请输入分层说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitLevel">保存</el-button>
        <el-button @click="levelOpen = false">关闭</el-button>
      </template>
    </el-dialog>

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

<script setup name="Contact">
import { computed, getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { listGroupCustomer, assignGroupCustomer, setCustomerLevel } from '@/api/szhl/crm/groupContact'
import ContactRecordDialog from '@/views/szhl/crm/components/ContactRecordDialog'
import MarketingDetailDialog from '@/views/szhl/crm/components/MarketingDetailDialog'
import PortraitTagQuerySelect from '@/views/szhl/crm/components/PortraitTagQuerySelect'
import ColumnSettingsDialog from '@/views/szhl/crm/components/ColumnSettingsDialog'
import { selectGroupList } from '@/api/szhl/crm/group'
import { getGridTree, listFeatureTagTree } from '@/api/szhl/crm/attribution'
import { getColumnConfig, saveColumnConfig } from '@/api/szhl/crm/column'
import { listDataTag } from '@/api/szhl/crm/dataTag'
import { listAdvancedQueryConditions } from '@/api/szhl/crm/advancedQuery'
import SearchForm from '@/components/SearchForm'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import useUserStore from '@/store/modules/user'
import { formatMoney } from '@/utils/ruoyi'
import { formatDataTagLabel, formatDataTagBoolean, formatYuanToWan, isYuanAmountField } from '@/utils/crmDataTag'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import UserSelect from '@/components/UserSelect'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const {
  crm_customer_level: levelOptions
} = proxy.useDict('crm_customer_level')

const PAGE_KEY = 'contact-list'
const LEADER_LEVEL_ROLES = ['admin', 'crm_header', 'crm_manager']
const DEFAULT_VISIBLE_DATA_KEYS = ['mobileBank', 'validContract', 'loanCustomerFlag', 'wealthFlag', 'depositAvg', 'loanBalance']
const COMMON_COLUMN_KEYS = [
  'portraitTags', 'customerMarketingStatus', 'last3mContactDate', 'contactPhone',
  'contactAddress', 'grid', 'attributionOrg', 'attributionManager'
]

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const selection = ref([])
const contactDialogRef = ref()
const marketingDetailRef = ref()
const assignOpen = ref(false)
const levelOpen = ref(false)
const columnDialogOpen = ref(false)
const groupOptions = ref([])
const featureTags = ref([])
const gridNodes = ref([])
// 数据标签自定义分类（/crm/dataTag/list 的 categories），供列显示设定弹窗分组
const dataTagCategories = ref([])
const advancedQueryOptions = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupIds: [],
    customerLevel: undefined,
    customerName: undefined,
    customerNo: undefined,
    queryOrg: undefined,
    managerId: undefined,
    gridStreet: undefined,
    gridCommunity: undefined,
    portraitTagIds: [],
    portraitTagMatchMode: 'ANY',
    advancedQuery: undefined
  },
  assignForm: {},
  levelForm: {}
})

const { queryParams, assignForm, levelForm } = toRefs(data)
const single = computed(() => selection.value.length !== 1)
const multiple = computed(() => selection.value.length === 0)
const columns = ref([
  { key: 'customerId', label: '客户内码', visible: false },
  { key: 'portraitTags', label: '画像标签', visible: true },
  { key: 'customerMarketingStatus', label: '暂缓触达状态', visible: true },
  { key: 'last3mContactDate', label: '近三个月最近触达时间', visible: true },
  { key: 'contactPhone', label: '联系电话', visible: true },
  { key: 'contactAddress', label: '联系地址', visible: true },
  { key: 'grid', label: '常驻网格', visible: true },
  { key: 'attributionOrg', label: '机构', visible: true },
  { key: 'attributionManager', label: '管户经理', visible: true }
])
const colVisible = computed(() => {
  const map = {}
  columns.value.forEach(item => { map[item.key] = item.visible })
  return map
})
const visibleDataColumns = computed(() => columns.value.filter(item => item.dataField && item.visible))
const canSelectLeaderLevel = computed(() => userStore.roles.some(role => LEADER_LEVEL_ROLES.includes(role)))
const levelDimensionOptions = computed(() => {
  const options = [
    { label: '管户经理分层', value: 'MANAGER' }
  ]
  if (canSelectLeaderLevel.value) {
    options.push({ label: '负责人分层', value: 'LEADER' })
  }
  return options
})
const contactTableColumns = computed(() => {
  const baseColumns = [
    { type: 'selection', width: 50, align: 'center', fixed: 'left' },
    { key: 'customerLevel', label: '客户层级', prop: 'customerLevel', width: 110, align: 'center', fixed: 'left', slot: 'customerLevel' },
    { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
    { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
    { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true, visible: colVisible.value.customerId },
    { key: 'groupName', label: '客群', prop: 'groupName', width: 240, showOverflowTooltip: true },
    { key: 'portraitTags', label: '画像标签', prop: 'portraitTagNames', width: 160, showOverflowTooltip: true, visible: colVisible.value.portraitTags, slot: 'portraitTags' },
    { key: 'customerMarketingStatus', label: '暂缓触达状态', prop: 'deferEndDate', width: 140, align: 'center', visible: colVisible.value.customerMarketingStatus, slot: 'customerMarketingStatus' },
    {
      key: 'last3mContactDate',
      label: '近三个月最近触达时间',
      prop: 'last3mContactDate',
      width: 180,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.last3mContactDate,
      formatter: row => proxy.parseTime(row.last3mContactDate, '{y}-{m}-{d} {h}:{i}:{s}') || ''
    },
    { key: 'contactPhone', label: '联系电话', prop: 'contactPhone', width: 130, visible: colVisible.value.contactPhone },
    { key: 'contactAddress', label: '联系地址', prop: 'contactAddress', width: 220, showOverflowTooltip: true, visible: colVisible.value.contactAddress },
    { key: 'grid', label: '常驻网格', width: 170, showOverflowTooltip: true, visible: colVisible.value.grid, slot: 'grid' },
    { key: 'attributionOrg', label: '机构', prop: 'attributionOrg', width: 120, align: 'center', visible: colVisible.value.attributionOrg, slot: 'attributionOrg' },
    { key: 'attributionManager', label: '管户经理', prop: 'attributionManager', width: 120, align: 'center', visible: colVisible.value.attributionManager, slot: 'attributionManager' }
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
  return baseColumns.concat(dataColumns, [
    { key: 'actions', label: '操作', width: 160, align: 'center', fixed: 'right', slot: 'actions' }
  ])
})
const streetNodes = computed(() => {
  const parentCodes = new Set(gridNodes.value.map(item => item.parentCode).filter(Boolean))
  return gridNodes.value.filter(item => parentCodes.has(item.gridCode))
})
const communityNodes = computed(() => {
  const street = streetNodes.value.find(item => item.gridName === queryParams.value.gridStreet)
  return street ? gridNodes.value.filter(item => item.parentCode === street.gridCode) : []
})
const searchFields = computed(() => [
  {
    label: '客群名称',
    prop: 'groupIds',
    type: 'select',
    placeholder: '请选择客群（必选）',
    filterable: true,
    multiple: true,
    popperClass: 'group-select-dropdown-wide',
    options: groupOptions.value.map(item => ({
      label: isGroupExpired(item) ? `${item.groupName}（已过期）` : item.groupName,
      value: item.id
    })),
    change: handleGroupChange
  },
  {
    label: '客户层级',
    prop: 'customerLevel',
    type: 'select',
    placeholder: '请选择',
    options: levelOptions.value || []
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
    label: '管户机构',
    prop: 'queryOrg',
    type: 'slot',
    slotName: 'queryOrg'
  },
  {
    label: '管户经理',
    prop: 'managerId',
    type: 'userSelect',
    placeholder: '请选择管户经理',
    filterable: true
  },
  {
    label: '街道/乡镇',
    prop: 'gridStreet',
    type: 'select',
    placeholder: '请选择',
    options: streetNodes.value.map(item => ({
      label: item.gridName,
      value: item.gridName
    })),
    change: handleStreetChange
  },
  {
    label: '社区/村庄',
    prop: 'gridCommunity',
    type: 'select',
    placeholder: '请选择',
    options: communityNodes.value.map(item => ({
      label: item.gridName,
      value: item.gridName
    }))
  },
  {
    label: '画像标签',
    prop: 'portraitTagIds',
    type: 'slot',
    slotName: 'portraitTag'
  },
  {
    label: '高级查询',
    prop: 'advancedQuery',
    type: 'select',
    placeholder: '请选择',
    options: advancedQueryOptions.value || []
  }
])

function handleGroupChange (value) {
  queryParams.value.groupIds = value || []
  handleQuery()
}

function getDefaultActiveGroupIds () {
  return groupOptions.value
    .filter(item => !isGroupExpired(item))
    .map(item => item.id)
}

function handleStreetChange (value) {
  queryParams.value.gridStreet = value
  queryParams.value.gridCommunity = undefined
}

// 普通列表只查询当前可见动态列（后端按启用定义与 Registry 白名单取交集）。
// 全部隐藏时传哨兵值 NONE：空串会被 tansParams 丢参，导致后端误判为旧客户端而回落默认列。
function visibleDataFields () {
  return columns.value.filter(item => item.dataField && item.visible).map(item => item.key).join(',') || 'NONE'
}

function getList () {
  if (!queryParams.value.groupIds || queryParams.value.groupIds.length === 0) {
    proxy.$modal.msgWarning('请先选择客群')
    return
  }
  loading.value = true
  listGroupCustomer({ ...queryParams.value, dataFields: visibleDataFields() }).then(res => {
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
  const defaultGroupIds = getDefaultActiveGroupIds()
  Object.assign(queryParams.value, {
    pageNum: 1,
    groupIds: defaultGroupIds,
    customerLevel: undefined,
    customerName: undefined,
    customerNo: undefined,
    queryOrg: undefined,
    managerId: undefined,
    gridStreet: undefined,
    gridCommunity: undefined,
    portraitTagIds: [],
    portraitTagMatchMode: 'ANY',
    advancedQuery: undefined
  })
  if (defaultGroupIds.length > 0) {
    getList()
  } else {
    tableList.value = []
    total.value = 0
  }
}

function handleSelectionChange (rows) {
  selection.value = rows
}

function formatPortraitTags (value) {
  if (!Array.isArray(value)) return ''
  return value.map(tag => tag?.tagName).filter(Boolean).join('、')
}

function formatLevelLabel (value) {
  return proxy.selectDictLabel(levelOptions.value || [], value) || value || '-'
}

function formatUser (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function hasLevelChange (row) {
  return row && row.levelChangeFlag && row.levelChangeFlag !== '-'
}

function formatLeaderLevelTip (row) {
  return `负责人评级：${formatLevelLabel(row?.leaderLevel)}`
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

function formatValidDeferDate (row) {
  return proxy.parseTime(row.deferEndDate, '{y}-{m}-{d}') || ''
}

function isGroupExpired (row) {
  if (!row || !row.validEnd) return false
  return parseDateEndValue(row.validEnd) < Date.now()
}

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

function applyColumnKeys (keys) {
  columns.value.forEach(item => {
    item.visible = keys.includes(item.key)
  })
}

function refreshAfterColumnsChange () {
  // 新勾选列后端此前未查询，应用列设置后立即重查；未选客群时不弹提示
  if (queryParams.value.groupIds && queryParams.value.groupIds.length > 0) {
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

function parseIdList (value, fallback) {
  const source = value || fallback
  if (Array.isArray(source)) return source.filter(item => item !== undefined && item !== null && item !== '')
  if (source === undefined || source === null || source === '') return []
  return String(source).split(',').map(item => item.trim()).filter(Boolean)
}

function toId (value) {
  const id = Number(value)
  return Number.isNaN(id) ? value : id
}

function getRowGroupCustomerIds (row) {
  return parseIdList(row.groupCustomerIds, row.id).map(toId)
}

function getSelectedGroupCustomerIds () {
  return [...new Set(selection.value.flatMap(row => getRowGroupCustomerIds(row)))]
}

function openContact (row) {
  const target = row && row.customerNo ? row : selection.value[0]
  if (!target) return
  contactDialogRef.value.open({
    customerId: target.customerId,
    customerName: target.customerName,
    contactPhone: target.contactPhone,
    groupIds: parseIdList(target.groupIds, target.groupId).map(toId)
  })
}

function openCustomerDetail (row) {
  marketingDetailRef.value.open(row)
}

function openAssign () {
  assignForm.value = {
    managerId: undefined,
    reason: ''
  }
  assignOpen.value = true
}

function submitAssign () {
  if (!assignForm.value.managerId) {
    proxy.$modal.msgWarning('请选择管户经理')
    return
  }
  const ids = getSelectedGroupCustomerIds()
  if (ids.length === 0) {
    proxy.$modal.msgWarning('未找到可分解的客群客户记录')
    return
  }
  proxy.$modal.confirm(`本次将分解选中的 ${ids.length} 条记录，并同步更新对应客户的归属表管户人及其在其他客群中的管户人，是否继续？`).then(() => {
    return assignGroupCustomer({
      ids,
      managerId: assignForm.value.managerId,
      reason: assignForm.value.reason,
      confirmCascade: true
    })
  }).then(() => {
    assignOpen.value = false
    proxy.$modal.msgSuccess('分解管户已保存')
    getList()
  }).catch(() => {})
}

function openLevel () {
  levelForm.value = {
    dimension: 'MANAGER',
    level: undefined,
    note: ''
  }
  levelOpen.value = true
}

function submitLevel () {
  if (!levelForm.value.level) {
    proxy.$modal.msgWarning('请选择客户层级')
    return
  }
  const ids = getSelectedGroupCustomerIds()
  if (ids.length === 0) {
    proxy.$modal.msgWarning('未找到可分层的客群客户记录')
    return
  }
  setCustomerLevel({
    ids,
    level: levelForm.value.level,
    dimension: canSelectLeaderLevel.value ? levelForm.value.dimension : 'MANAGER',
    note: levelForm.value.note
  }).then(() => {
    levelOpen.value = false
    proxy.$modal.msgSuccess('客户分层已保存')
    getList()
  })
}

function handleExport () {
  if (!queryParams.value.groupIds || queryParams.value.groupIds.length === 0) {
    proxy.$modal.msgWarning('请先选择客群')
    return
  }
  const params = { ...queryParams.value }
  delete params.pageNum
  delete params.pageSize
  if (Array.isArray(params.groupIds)) {
    params.groupIds = params.groupIds.join(',')
  }
  if (Array.isArray(params.portraitTagIds)) {
    params.portraitTagIds = params.portraitTagIds.join(',')
  }
  params.exportFields = columns.value.filter(item => item.visible).map(item => item.key).join(',')
  proxy.download('/crm/contact/export', params, '分解分层触达.xlsx')
}

function init () {
  listAdvancedQueryConditions('CONTACT').then(res => {
    advancedQueryOptions.value = (res.data || []).map(item => ({
      label: item.label,
      value: item.code
    }))
  })
  listFeatureTagTree({}).then(res => {
    featureTags.value = res.data || []
  })
  getGridTree().then(res => {
    gridNodes.value = res.data || []
  })
  // 先加载字段元数据与用户列配置，再加载客群并发出首个列表请求；加载失败时按默认列查询
  loadDataTagMeta().then(() => loadColumnConfig()).catch(() => {}).finally(() => {
    selectGroupList().then(res => {
      groupOptions.value = res.data || []
      if ((!queryParams.value.groupIds || queryParams.value.groupIds.length === 0) && groupOptions.value.length > 0) {
        const defaultGroupIds = getDefaultActiveGroupIds()
        queryParams.value.groupIds = defaultGroupIds
        if (defaultGroupIds.length > 0) {
          getList()
        }
      }
    })
  })
}

init()
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

.crm-contact-table :deep(.el-table__header .cell) {
  white-space: nowrap;
  word-break: keep-all;
}

/* 金额/计数列：等宽数字，千分位后各行数位纵向对齐 */
.crm-contact-table :deep(.amount-cell) {
  font-variant-numeric: tabular-nums;
}

.defer-end-date {
  color: #f56c6c;
  font-weight: 500;
}

.level-change-flag {
  margin-left: 4px;
  cursor: help;
}

.level-up {
  color: #f56c6c;
  font-weight: 600;
}

.level-down {
  color: #67c23a;
  font-weight: 600;
}
</style>
