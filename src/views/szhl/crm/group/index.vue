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
      <template #actions-left>
        <el-button type="primary" plain icon="Plus" @click="openCreate" v-hasPermi="['crm:group:create']">创建客群</el-button>
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
      :columns="groupTableColumns"
      :total="total"
      height="560"
      @pagination="getList"
    >
      <template #customerCount="{ row }">
        <el-button link type="primary" class="count-link" @click="openGroupCustomerDetail(row)">
          {{ row.customerCount || 0 }}
        </el-button>
      </template>
      <template #reachProgress="{ row }">
        <div class="reach-cell" :title="reachBarTitle(row)">
          <div class="reach-bar">
            <span
              v-for="item in activeReachSegments(row)"
              :key="item.key"
              class="reach-bar__seg"
              :class="item.className"
              :style="{ flexBasis: reachSeg(row, item.key) }"
            />
          </div>
          <span class="reach-cell__percent">{{ reachPercent(row) }}%</span>
        </div>
      </template>
      <template #expireDate="{ row }">{{ parseTime(row.expireDate, '{y}-{m}-{d}') || '-' }}</template>
      <template #validRange="{ row }">{{ formatValidRange(row) }}</template>
      <template #distributeWay="{ row }">{{ distributeWayLabel(row.distributeWay) }}</template>
      <template #distributeDate="{ row }">{{ parseTime(row.distributeDate, '{y}-{m}-{d}') || '-' }}</template>
      <template #status="{ row }">
        <el-tag :type="row.status === '有效' ? 'success' : 'info'">{{ row.status }}</el-tag>
      </template>
      <template #actions="{ row }">
        <div class="row-actions">
          <el-button link type="primary" @click="openImport(row)" v-hasPermi="['crm:group:import']">导入客群</el-button>
          <el-dropdown class="row-actions-more" trigger="click">
            <el-button link type="primary">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openEdit(row)" v-hasPermi="['crm:group:update']">修改</el-dropdown-item>
                <el-dropdown-item
                  v-if="(row.customerCount || 0) > 0"
                  @click="handleWithdraw(row)"
                  v-hasPermi="['crm:group:withdraw']"
                >撤回</el-dropdown-item>
                <el-dropdown-item
                  divided
                  style="color: var(--el-color-danger)"
                  @click="handleDelete(row)"
                  v-hasPermi="['crm:group:remove']"
                >删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </common-table>

    <el-dialog :title="formTitle" v-model="formOpen" width="680px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-form-item label="客群名称">
          <el-input v-model="form.groupName" placeholder="请输入客群名称" />
        </el-form-item>
        <el-form-item label="目标业务">
          <el-input v-model="form.targetBusiness" placeholder="请输入目标业务，如 ETC、存款" />
        </el-form-item>
        <el-form-item label="任务目标">
          <el-input v-model="form.taskGoal" placeholder="请输入任务目标，如 新增ETC 200户" />
        </el-form-item>
        <el-form-item label="营销指引">
          <el-input v-model="form.marketingGuide" type="textarea" :rows="3" placeholder="请输入营销指引" />
        </el-form-item>
        <el-form-item label="客群失效日期">
          <el-date-picker v-model="form.expireDate" type="date" value-format="YYYY-MM-DD" :shortcuts="expireDateShortcuts" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="formOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importOpen" width="860px" append-to-body class="group-import-dialog">
      <template #header>
        <div class="import-dialog-header">
          <span class="import-dialog-header__title">导入客群</span>
          <span v-if="importGroup.groupName" class="import-dialog-header__name">{{ importGroup.groupName }}</span>
        </div>
      </template>
      <el-steps :active="importStep" finish-status="success" align-center class="import-steps">
        <el-step title="上传" />
        <el-step title="校验结果" />
        <el-step title="分发模式" />
      </el-steps>

      <div v-if="importStep === 0" class="import-step-panel">
        <div class="import-step-title">上传客群客户</div>
        <div class="import-step-desc">请先下载模板并按列填写客户信息，上传后系统会自动校验导入数据。</div>
        <div class="import-toolbar">
          <span class="import-toolbar__tip">模板列：客户号、客户名称、归属机构、归属人。</span>
          <el-button type="primary" plain icon="Download" @click="downloadImportTemplate">下载导入模板</el-button>
        </div>
        <el-upload
          ref="importUploadRef"
          :limit="1"
          accept=".xls,.xlsx"
          :action="importUrl"
          :headers="uploadHeaders"
          :data="{ groupId: importGroup.id }"
          :disabled="importing || verifying"
          :auto-upload="false"
          :on-progress="() => (importing = true)"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          :on-change="handleImportFileChange"
          :on-remove="handleImportFileChange"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或 <em>点击选择文件</em></div>
          <template #tip>
            <div class="el-upload__tip">仅允许导入 xls、xlsx 格式文件。</div>
          </template>
        </el-upload>
      </div>

      <div v-else-if="importStep === 1" class="import-step-panel">
        <div class="import-step-title">查看校验结果</div>
        <div class="import-step-desc">只有校验全部通过后才能进入分发模式；如存在不通过数据，请查看明细处理后返回上一步重新上传。</div>
        <div v-loading="verifying" element-loading-text="正在校验导入数据…" class="import-verify-result">
          <el-alert
            v-if="!verifying && verifyAlert"
            :type="verifyAlert.type"
            :title="verifyAlert.text"
            :closable="false"
            show-icon
            class="import-verify-alert"
          />
          <div v-if="!verifying && verifyStats" class="import-summary-grid">
            <div class="import-summary-card">
              <div class="import-summary-card__num">{{ verifyStats.total != null ? verifyStats.total : '-' }}</div>
              <div class="import-summary-card__lbl">数据总条数</div>
            </div>
            <div class="import-summary-card is-ok">
              <div class="import-summary-card__num">{{ verifyStats.pass != null ? verifyStats.pass : '-' }}</div>
              <div class="import-summary-card__lbl">校验通过</div>
            </div>
            <div class="import-summary-card is-err">
              <div class="import-summary-card__num">{{ verifyStats.fail != null ? verifyStats.fail : '-' }}</div>
              <div class="import-summary-card__lbl">不通过</div>
            </div>
          </div>
          <div v-if="!verifying && !verifyAlert && !verifyStats" class="import-verify-placeholder">
            导入文件后将自动校验，并在此显示校验结果。
          </div>
        </div>
      </div>

      <div v-else class="import-step-panel">
        <div class="import-step-title">选择分发模式</div>
        <div class="import-step-desc">配置客群任务的分发方式和营销有效期，确认后将生成对应触达任务。</div>
        <div class="import-dist-options">
          <div
            v-for="opt in SELECTABLE_DISTRIBUTE_WAYS"
            :key="opt.value"
            class="import-dist-option"
            :class="{ 'is-selected': distributeForm.way === opt.value }"
            @click="distributeForm.way = opt.value"
          >
            <span class="import-dist-option__radio"></span>
            <div class="import-dist-option__text">
              <div class="import-dist-option__title">{{ opt.label }}</div>
              <div class="import-dist-option__desc">{{ opt.desc }}</div>
            </div>
          </div>
        </div>
        <el-form :model="distributeForm" label-width="110px" class="import-distribute-form">
          <el-form-item v-if="distributeForm.way === 'ASSIGN'" label="分发机构">
            <el-select v-model="distributeForm.assignOrg" placeholder="请选择机构" filterable style="width: 100%">
              <el-option v-for="item in orgOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="营销有效期">
            <el-date-picker v-model="distributeForm.validRange" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="结果反馈">
            <el-input v-model="distributeForm.result" type="textarea" :rows="3" placeholder="请输入结果反馈" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <template v-if="importStep === 0">
          <el-button @click="importOpen = false">关闭</el-button>
          <el-button type="primary" :loading="importing" :disabled="verifying" @click="submitImport">上传并校验</el-button>
        </template>
        <template v-else-if="importStep === 1">
          <el-button :disabled="importing || verifying" @click="goImportStep(0)">上一步</el-button>
          <el-button :loading="detailLoading" :disabled="importing || verifying || verifyStatus === 'idle'" @click="openImportDetail">查看明细</el-button>
          <el-button :disabled="verifying || verifyStatus === 'idle'" @click="downloadVerifyResult">校验结果下载</el-button>
          <el-button type="primary" :disabled="!canEnterDistributeStep" :title="canEnterDistributeStep ? '' : '存在不通过数据或尚未完成校验，不能进入下一步'" @click="goImportStep(2)">下一步</el-button>
        </template>
        <template v-else>
          <el-button @click="goImportStep(1)">上一步</el-button>
          <el-button @click="importOpen = false">关闭</el-button>
          <el-button type="primary" @click="submitDistribute">确认分发</el-button>
        </template>
      </template>
    </el-dialog>

    <el-dialog :title="detailTitle" v-model="detailOpen" width="1080px" top="6vh" append-to-body>
      <div class="detail-title">
        <span class="detail-title__name">{{ detailGroup.groupName || '-' }}</span>
        <span class="detail-title__count">共 {{ importDetailTotal }} 条</span>
      </div>
      <SearchForm
        v-model="detailQuery"
        :fields="detailSearchFields"
        label-width="78px"
        class="detail-search-form"
        :reset-fields-on-reset="false"
        @search="handleDetailQuery"
        @reset="resetDetailQuery"
      />
      <common-table
        v-model:page="detailQuery.pageNum"
        v-model:limit="detailQuery.pageSize"
        :loading="detailLoading"
        :data="importDetailList"
        :columns="detailTableColumns"
        :total="importDetailTotal"
        height="420"
        class="detail-common-table"
        @pagination="loadImportDetailList"
      >
        <template #customerNo="{ row }">
          <CustomerLink :row="row" mode="no" />
        </template>
        <template #customerName="{ row }">
          <CustomerLink :row="row" mode="name" />
        </template>
        <template #targetCustomerId="{ row }">{{ row.targetCustomerId || row.customerId || '-' }}</template>
        <template #attributionOrg="{ row }">
          <dict-tag v-if="row.attributionOrg" :options="orgOptions" :value="row.attributionOrg" />
          <span v-else>-</span>
        </template>
        <template #attributionManager="{ row }">{{ formatUser(row.attributionManager) }}</template>
        <template #contactPhone="{ row }">{{ row.contactPhone || '-' }}</template>
        <template #verifyResult="{ row }">
          <el-tag size="small" :type="verifyResultTagType(row.verifyResult)" effect="plain">
            {{ row.verifyResult || '未校验' }}
          </el-tag>
        </template>
        <template #verifyType="{ row }">{{ selectDictLabel(crmVerifyTypeOptions, row.verifyType) || '-' }}</template>
      </common-table>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Group">
import { computed, getCurrentInstance, nextTick, reactive, ref, toRefs } from 'vue'
import * as XLSX from 'xlsx'
import { ElMessageBox } from 'element-plus'
import { getToken } from '@/utils/auth'
import { listGroup, createGroup, updateGroup, delGroup, verifyGroup, listImportTemp, listGroupCustomerDetail, distributeGroup, withdrawGroup } from '@/api/szhl/crm/group'
import SearchForm from '@/components/SearchForm'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import {selectDictLabel} from "../../../../utils/ruoyi";

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const {
  crm_customer_level: crmCustomerLevelOptions,
  crm_verify_type: crmVerifyTypeOptions
} = proxy.useDict('crm_customer_level', 'crm_verify_type')

const DISTRIBUTE_WAY_OPTIONS = [
  { value: 'ATTRIBUTION', label: '客户归属', desc: '按客户当前归属机构与归属人分发' },
  { value: 'TEMPLATE', label: '模板机构', desc: '按导入模板中填写的归属机构分发' },
  { value: 'ASSIGN', label: '设定机构', desc: '统一分发到下方指定的机构' }
]
// 当前仅开放「客户归属」分发，其余方式暂时隐藏（保留定义以便表格回显历史数据与后续放开）
const ENABLED_DISTRIBUTE_WAYS = ['ATTRIBUTION']
const SELECTABLE_DISTRIBUTE_WAYS = DISTRIBUTE_WAY_OPTIONS.filter(item => ENABLED_DISTRIBUTE_WAYS.includes(item.value))
const DISTRIBUTE_WAY_LABELS = DISTRIBUTE_WAY_OPTIONS.reduce((map, item) => {
  map[item.value] = item.label
  return map
}, {})
const reachStatusSegments = [
  { key: 'reachedCount', label: '已触达', className: 'reach-bar__seg--reached' },
  { key: 'pendingCount', label: '待触达', className: 'reach-bar__seg--pending' },
  { key: 'deferredCount', label: '暂缓', className: 'reach-bar__seg--deferred' }
]
const expireDateShortcuts = [
  {
    text: '年底',
    value: () => {
      const now = new Date()
      return new Date(now.getFullYear(), 11, 31)
    }
  },
  {
    text: '当季末',
    value: () => {
      const now = new Date()
      const quarterEndMonth = Math.floor(now.getMonth() / 3) * 3 + 2
      return new Date(now.getFullYear(), quarterEndMonth + 1, 0)
    }
  }
]

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)

function formatUser (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

const formOpen = ref(false)
const formTitle = ref('创建客群')
const importOpen = ref(false)
const importGroup = ref({})
const importStep = ref(0)
const importing = ref(false)
const verifying = ref(false)
const importFileSelected = ref(false)
const verifyStatus = ref('idle')
const verifyMessage = ref('')
const importUploadRef = ref()
const detailOpen = ref(false)
const detailMode = ref('import')
const detailGroup = ref({})
const detailLoading = ref(false)
const importDetailList = ref([])
const importDetailTotal = ref(0)
const detailQuery = ref({
  pageNum: 1,
  pageSize: 10,
  customerName: undefined,
  customerNo: undefined,
  queryOrg: undefined,
  managerId: undefined,
  verifyResult: undefined
})
const importUrl = import.meta.env.VITE_APP_BASE_API + "-crm/" + '/crm/group/import'
const uploadHeaders = { Authorization: 'Bearer ' + getToken() }
const verifyStats = computed(() => parseVerifyCounts(verifyMessage.value))
const verifyAlert = computed(() => {
  const stats = verifyStats.value
  if (verifyStatus.value === 'success') {
    const text = stats && stats.total != null
      ? `全部 ${stats.total} 条数据校验通过，可进入下一步分发。`
      : (verifyMessage.value || '校验通过，可进入下一步分发。')
    return { type: 'success', text }
  }
  if (verifyStatus.value === 'error') {
    return { type: 'error', text: verifyMessage.value || '导入或校验失败，请检查文件后重试。' }
  }
  if (verifyStatus.value === 'warning') {
    if (stats && stats.fail) {
      const total = stats.total != null ? stats.total : '-'
      return { type: 'warning', text: `共 ${total} 条，其中 ${stats.fail} 条未通过，请查看明细处理后返回上一步重新上传。` }
    }
    return { type: 'warning', text: verifyMessage.value || '存在需要处理的校验项，请查看明细。' }
  }
  return null
})
const canEnterDistributeStep = computed(() => verifyStatus.value === 'success' && !importing.value && !verifying.value)
const detailTitle = computed(() => detailMode.value === 'group' ? '客群客户明细' : '导入客户明细')

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupName: undefined,
    queryCreateBy: undefined,
    status: undefined
  },
  form: {},
  distributeForm: {}
})

const { queryParams, form, distributeForm } = toRefs(data)

const groupTableColumns = computed(() => [
  { key: 'groupName', label: '客群名称', prop: 'groupName', width: 180, fixed: 'left', showOverflowTooltip: true },
  { key: 'targetBusiness', label: '目标业务', prop: 'targetBusiness', width: 140, showOverflowTooltip: true },
  { key: 'taskGoal', label: '任务目标', prop: 'taskGoal', width: 190, showOverflowTooltip: true },
  { key: 'marketingGuide', label: '营销指引', prop: 'marketingGuide', minWidth: 220, showOverflowTooltip: true },
  { key: 'customerCount', label: '客户数', prop: 'customerCount', width: 100, align: 'right', sortable: true, slot: 'customerCount' },
  { key: 'reachProgress', label: '触达进度', width: 200, slot: 'reachProgress' },
  { key: 'expireDate', label: '客群失效日期', prop: 'expireDate', width: 125, align: 'center', slot: 'expireDate' },
  { key: 'validRange', label: '营销有效期', width: 200, align: 'center', slot: 'validRange' },
  { key: 'distributeWay', label: '分发方式', prop: 'distributeWay', width: 110, align: 'center', slot: 'distributeWay' },
  { key: 'distributeDate', label: '分发日期', prop: 'distributeDate', width: 120, align: 'center', slot: 'distributeDate' },
  { key: 'status', label: '状态', prop: 'status', width: 90, align: 'center', slot: 'status' },
  { key: 'actions', label: '操作', width: 140, align: 'center', fixed: 'right', className: 'small-padding fixed-width', slot: 'actions' }
])

const searchFields = computed(() => [
  {
    label: '客群名称',
    prop: 'groupName',
    type: 'input',
    placeholder: '请输入客群名称'
  },
  {
    label: '创建人',
    prop: 'queryCreateBy',
    type: 'userSelect',
    placeholder: '请选择创建人',
    filterable: true
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '有效', value: '有效' },
      { label: '作废', value: '作废' }
    ]
  }
])

const detailSearchFields = computed(() => {
  const fields = [
    { label: '客户名称', prop: 'customerName', type: 'input', placeholder: '请输入客户名称' },
    { label: '客户号', prop: 'customerNo', type: 'input', placeholder: '请输入客户号' },
    { label: '归属机构', prop: 'queryOrg', type: 'select', placeholder: '请选择机构', filterable: true, options: orgOptions.value || [] },
    { label: '归属人', prop: 'managerId', type: 'userSelect', placeholder: '请选择归属人', filterable: true }
  ]
  if (detailMode.value !== 'group') {
    fields.push({
      label: '校验结果',
      prop: 'verifyResult',
      type: 'select',
      placeholder: '请选择校验结果',
      options: [
        { label: '通过', value: '通过' },
        { label: '不通过', value: '不通过' }
      ]
    })
  }
  return fields
})

const detailTableColumns = computed(() => {
  const columns = [
    { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, fixed: 'left', showOverflowTooltip: true, slot: 'customerNo' },
    { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
    { key: 'targetCustomerId', label: '客户内码', width: 150, showOverflowTooltip: true, slot: 'targetCustomerId' }
  ]
  if (detailMode.value === 'group') {
    columns.push(
      { key: 'attributionOrg', label: '归属机构', prop: 'attributionOrg', width: 150, showOverflowTooltip: true, slot: 'attributionOrg' },
      { key: 'attributionManager', label: '归属人', prop: 'attributionManager', width: 130, showOverflowTooltip: true, slot: 'attributionManager' },
      { key: 'contactPhone', label: '联系电话', prop: 'contactPhone', width: 130, showOverflowTooltip: true, slot: 'contactPhone' }
    )
  } else {
    columns.push(
      { key: 'attributionOrg', label: '归属机构', prop: 'attributionOrg', width: 150, showOverflowTooltip: true, slot: 'attributionOrg' },
      { key: 'attributionManager', label: '归属人', prop: 'attributionManager', width: 130, showOverflowTooltip: true, slot: 'attributionManager' },
      { key: 'verifyResult', label: '校验结果', prop: 'verifyResult', width: 110, align: 'center', slot: 'verifyResult' },
      { key: 'verifyType', label: '校验类型', prop: 'verifyType', minWidth: 140, showOverflowTooltip: true, slot: 'verifyType' }
    )
  }
  return columns
})

function getList () {
  loading.value = true
  listGroup(queryParams.value).then(res => {
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
    groupName: undefined,
    queryCreateBy: undefined,
    status: undefined
  })
  getList()
}

function distributeWayLabel (way) {
  return DISTRIBUTE_WAY_LABELS[way] || way || '-'
}

function formatValidRange (row) {
  const start = proxy.parseTime(row.validStart, '{y}-{m}-{d}')
  const end = proxy.parseTime(row.validEnd, '{y}-{m}-{d}')
  return start || end ? `${start || '-'} 至 ${end || '-'}` : '-'
}

function reachTotal (row) {
  return (row.reachedCount || 0) + (row.pendingCount || 0) + (row.deferredCount || 0)
}

function activeReachSegments (row) {
  return reachStatusSegments.filter(item => (row[item.key] || 0) > 0)
}

function reachSeg (row, key) {
  const total = reachTotal(row)
  return total ? `${(row[key] || 0) / total * 100}%` : '0%'
}

function reachPercent (row) {
  const total = reachTotal(row)
  return total ? Math.round((row.reachedCount || 0) / total * 100) : 0
}

function reachBarTitle (row) {
  const segments = activeReachSegments(row)
  return segments.length > 0 ? segments.map(item => `${item.label}${row[item.key] || 0}`).join('，') : '暂无触达进度'
}

function openCreate () {
  formTitle.value = '创建客群'
  form.value = {
    id: undefined,
    groupName: '',
    targetBusiness: '',
    taskGoal: '',
    marketingGuide: '',
    expireDate: undefined
  }
  formOpen.value = true
}

function openEdit (row) {
  formTitle.value = '修改客群'
  form.value = {
    id: row.id,
    groupName: row.groupName,
    targetBusiness: row.targetBusiness,
    taskGoal: row.taskGoal,
    marketingGuide: row.marketingGuide,
    expireDate: proxy.parseTime(row.expireDate, '{y}-{m}-{d}')
  }
  formOpen.value = true
}

function submitForm () {
  if (!form.value.groupName) {
    proxy.$modal.msgWarning('请输入客群名称')
    return
  }
  const api = form.value.id ? updateGroup : createGroup
  api(form.value).then(() => {
    formOpen.value = false
    proxy.$modal.msgSuccess('客群信息已保存')
    getList()
  })
}

function handleDelete (row) {
  proxy.$modal.confirm(`是否确认删除客群"${row.groupName}"？`).then(() => {
    return delGroup(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

function openImport (row) {
  importGroup.value = row
  importOpen.value = true
  resetImportState()
  resetDistributeForm(row)
  nextTick(() => {
    importUploadRef.value?.clearFiles()
  })
}

function goImportStep (step) {
  importStep.value = step
}

function submitImport () {
  if (!importFileSelected.value) {
    proxy.$modal.msgWarning('请选择要导入的文件')
    return
  }
  importing.value = true
  verifyStatus.value = 'uploading'
  verifyMessage.value = '文件正在导入，完成后将自动校验。'
  importUploadRef.value.submit()
}

function handleImportSuccess (response) {
  importing.value = false
  importFileSelected.value = false
  importUploadRef.value?.clearFiles()
  if (response.code && response.code !== 200) {
    verifyStatus.value = 'error'
    verifyMessage.value = formatVerifyMessage(response.msg) || '导入失败，请检查文件内容后重试。'
    importStep.value = 1
    return
  }
  verifyStatus.value = 'checking'
  verifyMessage.value = formatVerifyMessage(response.data || response.msg) || '文件已导入，正在校验导入数据。'
  importStep.value = 1
  handleVerify(true)
  if (detailOpen.value && detailMode.value === 'import' && detailGroup.value.id === importGroup.value.id) {
    loadImportDetailList()
  }
  getList()
}

function handleImportError () {
  importing.value = false
  importStep.value = 1
  verifyStatus.value = 'error'
  verifyMessage.value = '导入失败，请检查文件格式或稍后重试。'
  proxy.$modal.msgError('导入失败，请检查文件格式')
}

function handleImportFileChange (file, fileList) {
  importFileSelected.value = fileList.length > 0
  if (importing.value || verifying.value) return
  if (fileList.length === 0 && verifyStatus.value !== 'idle') return
  verifyStatus.value = 'idle'
  verifyMessage.value = ''
}

function handleVerify (auto = false) {
  if (!importGroup.value.id) return
  verifying.value = true
  verifyStatus.value = 'checking'
  verifyMessage.value = auto ? '文件已导入，正在校验导入数据。' : '正在重新校验导入数据。'
  verifyGroup(importGroup.value.id).then(res => {
    verifyMessage.value = formatVerifyMessage(res.data || res.msg) || '校验完成，未返回明细信息。'
    verifyStatus.value = getVerifyStatus(verifyMessage.value)
  }).catch(error => {
    verifyStatus.value = 'error'
    verifyMessage.value = formatVerifyMessage(error?.message) || '校验失败，请稍后重试。'
  }).finally(() => {
    verifying.value = false
  })
}

function openImportDetail () {
  if (!importGroup.value.id) return
  openCustomerDetail(importGroup.value, 'import')
}

function openGroupCustomerDetail (row) {
  openCustomerDetail(row, row.distributeDate ? 'group' : 'import')
}

function openCustomerDetail (row, mode) {
  detailGroup.value = row
  detailMode.value = mode
  detailOpen.value = true
  resetDetailQuery(false)
  loadImportDetailList()
}

function handleDetailQuery () {
  detailQuery.value.pageNum = 1
  loadImportDetailList()
}

function resetDetailQuery (load = true) {
  Object.assign(detailQuery.value, {
    pageNum: 1,
    customerName: undefined,
    customerNo: undefined,
    queryOrg: undefined,
    managerId: undefined,
    verifyResult: undefined
  })
  if (load) loadImportDetailList()
}

function buildDetailQueryParams () {
  const params = {
    groupId: detailGroup.value.id,
    pageNum: detailQuery.value.pageNum,
    pageSize: detailQuery.value.pageSize,
    customerName: detailQuery.value.customerName,
    customerNo: detailQuery.value.customerNo
  }
  if (detailMode.value === 'group') {
    params.queryOrg = detailQuery.value.queryOrg
    params.managerId = detailQuery.value.managerId
  } else {
    params.attributionOrg = detailQuery.value.queryOrg
    params.attributionManager = detailQuery.value.managerId
    params.verifyResult = detailQuery.value.verifyResult
  }
  return params
}

function loadImportDetailList () {
  if (!detailGroup.value.id) return
  detailLoading.value = true
  const api = detailMode.value === 'group' ? listGroupCustomerDetail : listImportTemp
  api(buildDetailQueryParams()).then(res => {
    importDetailList.value = res.rows || []
    importDetailTotal.value = res.total || 0
  }).finally(() => {
    detailLoading.value = false
  })
}

function verifyResultTagType (result) {
  if (result === '通过') return 'success'
  if (result === '不通过') return 'danger'
  return 'info'
}

function downloadVerifyResult () {
  proxy.download('/crm/group/import/verify/result', { groupId: importGroup.value.id }, '校验结果.xlsx')
}

function downloadImportTemplate () {
  ElMessageBox.alert('当前版本仅支持“按客户归属”分发，模板中的“归属机构”和“归属人”字段仅作信息保留，不作为分发依据；实际将按系统中的客户当前归属执行。', '导入提示', {
    confirmButtonText: '我知道了',
    type: 'warning'
  }).then(() => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['客户号', '客户名称', '归属机构', '归属人']
    ])
    worksheet['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 14 }]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '客户导入模板')
    XLSX.writeFile(workbook, `客群客户导入模板_${new Date().getTime()}.xlsx`)
  }).catch(() => {})
}

function resetImportState () {
  importStep.value = 0
  importing.value = false
  verifying.value = false
  importFileSelected.value = false
  detailOpen.value = false
  detailMode.value = 'import'
  detailGroup.value = {}
  importDetailList.value = []
  importDetailTotal.value = 0
  detailQuery.value.pageNum = 1
  verifyStatus.value = 'idle'
  verifyMessage.value = ''
}

function parseVerifyCounts (message) {
  const text = String(message || '')
  const totalMatch = text.match(/共\s*(\d+)\s*条/)
  const failMatch = text.match(/不通过\s*(\d+)\s*条/)
  const passMatch = text.replace(/不通过\s*\d+\s*条/, '').match(/通过\s*(\d+)\s*条/)
  if (!totalMatch && !failMatch && !passMatch) return null
  const pass = passMatch ? Number(passMatch[1]) : null
  const fail = failMatch ? Number(failMatch[1]) : null
  let total = totalMatch ? Number(totalMatch[1]) : null
  if (total === null && pass !== null && fail !== null) total = pass + fail
  return { total, pass, fail }
}

function getVerifyStatus (message) {
  const counts = parseVerifyCounts(message)
  if (!counts) return 'warning'
  return counts.fail === 0 ? 'success' : 'warning'
}

function formatVerifyMessage (message) {
  return String(message || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function openDistribute (row) {
  resetDistributeForm(row)
}

function resetDistributeForm (row = importGroup.value) {
  distributeForm.value = {
    groupId: row.id,
    groupName: row.groupName,
    way: 'ATTRIBUTION',
    assignOrg: undefined,
    validRange: [],
    result: ''
  }
}

function submitDistribute () {
  if (distributeForm.value.way === 'ASSIGN' && !distributeForm.value.assignOrg) {
    proxy.$modal.msgWarning('请选择分发机构')
    return
  }
  ElMessageBox.alert('当前版本仅支持“按客户归属”分发，导入模板中的“归属机构”和“归属人”字段仅作信息保留，不作为分发依据；实际将按系统中的客户当前归属执行。', '分发提示', {
    confirmButtonText: '我知道了',
    type: 'warning'
  }).then(() => {
    const range = distributeForm.value.validRange || []
    return distributeGroup({
      groupId: distributeForm.value.groupId,
      way: distributeForm.value.way,
      assignOrg: distributeForm.value.assignOrg,
      validStart: range[0],
      validEnd: range[1],
      result: distributeForm.value.result
    })
  }).then(() => {
    importOpen.value = false
    proxy.$modal.msgSuccess('客群任务已分发')
    getList()
  }).catch(() => {})
}

function handleWithdraw (row) {
  proxy.$modal.confirm(`是否确认撤回客群"${row.groupName}"？撤回后客群客户回写导入临时表。`).then(() => {
    return withdrawGroup(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('客群已撤回')
    getList()
  }).catch(() => {})
}

getList()
</script>

<style scoped>
.count-link {
  min-width: 24px;
  justify-content: flex-end;
  padding: 0;
  font-weight: 600;
}

.reach-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.reach-bar {
  display: flex;
  flex: 1;
  min-width: 0;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: #edf0f5;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.reach-bar__seg {
  height: 100%;
  min-width: 0;
  transition: flex-basis 0.2s ease;
}

.reach-bar__seg--reached {
  background: linear-gradient(90deg, #7bd957, #52c41a);
}

.reach-bar__seg--pending {
  background: #c0c4cc;
}

.reach-bar__seg--deferred {
  background: linear-gradient(90deg, #f3c969, #e6a23c);
}

.reach-cell__percent {
  flex: 0 0 36px;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-align: right;
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

.group-import-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
}

.import-dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.import-dialog-header__title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.import-dialog-header__name {
  max-width: 380px;
  padding: 2px 10px;
  overflow: hidden;
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #eff4ff;
  border-radius: 4px;
}

.import-steps {
  margin: 6px 0 24px;
  padding: 0 12px;
}

.import-steps :deep(.el-step__icon) {
  width: 30px;
  height: 30px;
  font-size: 14px;
  font-weight: 600;
  border-width: 1.5px;
  transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.import-steps :deep(.el-step__head.is-wait .el-step__icon) {
  color: #9ca3af;
  background: #fff;
  border-color: #d8dce5;
}

.import-steps :deep(.el-step__head.is-process) {
  color: #2563eb;
  border-color: #2563eb;
}

.import-steps :deep(.el-step__head.is-process .el-step__icon) {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.import-steps :deep(.el-step__head.is-success) {
  color: #2563eb;
  border-color: #2563eb;
}

.import-steps :deep(.el-step__head.is-success .el-step__icon) {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}

.import-steps :deep(.el-step__line) {
  height: 1px;
  background-color: #e5e7eb;
}

.import-steps :deep(.el-step__line-inner) {
  border-color: #2563eb;
}

.import-steps :deep(.el-step__title) {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  line-height: 22px;
}

.import-steps :deep(.el-step__title.is-wait) {
  color: #9ca3af;
}

.import-steps :deep(.el-step__title.is-process) {
  color: #1f2937;
  font-weight: 600;
}

.import-steps :deep(.el-step__title.is-success) {
  color: #2563eb;
}

.import-step-panel {
  min-height: 300px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
}

.import-step-title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.import-step-desc {
  margin-top: 4px;
  margin-bottom: 14px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
}

.import-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.import-toolbar__tip {
  color: #606266;
  font-size: 13px;
}

.import-verify-result {
  min-height: 96px;
}

.import-verify-alert {
  margin-bottom: 14px;
  border-radius: 6px;
}

.import-verify-alert :deep(.el-alert__title) {
  font-size: 13px;
  line-height: 1.6;
}

.import-verify-placeholder {
  padding: 28px 0;
  color: #909399;
  font-size: 13px;
  text-align: center;
}

.import-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.import-summary-card {
  padding: 14px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
}

.import-summary-card__num {
  color: #1f2329;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.import-summary-card__lbl {
  margin-top: 2px;
  color: #909399;
  font-size: 13px;
}

.import-summary-card.is-ok .import-summary-card__num {
  color: #16a34a;
}

.import-summary-card.is-err .import-summary-card__num {
  color: #f56c6c;
}

.import-dist-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.import-dist-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.import-dist-option:hover {
  border-color: #2563eb;
}

.import-dist-option.is-selected {
  border-color: #2563eb;
  background: #eff4ff;
}

.import-dist-option__radio {
  position: relative;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border: 2px solid #c0c4cc;
  border-radius: 50%;
  transition: border-color 0.15s ease;
}

.import-dist-option.is-selected .import-dist-option__radio {
  border-color: #2563eb;
}

.import-dist-option.is-selected .import-dist-option__radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.import-dist-option__title {
  color: #1f2329;
  font-size: 14px;
  font-weight: 600;
}

.import-dist-option__desc {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}

.group-import-dialog :deep(.el-upload-dragger) {
  padding: 36px 24px;
  border: 1px dashed #d8dce5;
  border-radius: 6px;
  background: #fafbfd;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.group-import-dialog :deep(.el-upload-dragger:hover) {
  border-color: #2563eb;
  background: #eff4ff;
}

.group-import-dialog :deep(.el-upload-dragger .el-icon--upload) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  color: #2563eb;
  font-size: 24px;
  background: #eff4ff;
  border-radius: 50%;
}

.group-import-dialog :deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
}

.group-import-dialog :deep(.el-upload__text em) {
  color: #2563eb;
  font-style: normal;
  font-weight: 600;
}

.group-import-dialog :deep(.el-upload-list__item) {
  margin-top: 12px;
  padding: 10px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.group-import-dialog :deep(.el-upload-list__item:hover) {
  background: #f8fafc;
}

.group-import-dialog :deep(.el-upload-list__item-name) {
  color: #1f2329;
  font-size: 14px;
  font-weight: 500;
}

.import-distribute-form {
  max-width: 620px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 13px;
}

.detail-title__name {
  color: #303133;
  font-weight: 600;
}

.detail-title__count {
  color: #909399;
}

.detail-search-form {
  margin-bottom: 10px;
  padding: 12px 12px 0;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.detail-common-table {
  margin-top: 0;
}
</style>
