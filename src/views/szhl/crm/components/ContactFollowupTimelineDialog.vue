<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1180px"
    append-to-body
    class="contact-followup-dialog"
    @closed="reset"
  >
    <template #header>
      <div class="cf-header">
        <div class="cf-header__main">
          <span class="cf-header__name">{{ customer.customerName || '触达记录' }}</span>
          <span class="cf-header__meta">
            <span>客户号：{{ customer.customerNo || '-' }}</span>
            <span>客户ID：{{ customer.customerId || customer.targetCustomerId || '-' }}</span>
            <span v-if="customer.attributionManager">管户经理：{{ userText(customer.attributionManager) }}</span>
          </span>
        </div>
        <div class="cf-header__stats">
          <span class="cf-stat">触达 <b>{{ rows.length }}</b></span>
          <span class="cf-stat">跟踪 <b>{{ followupTotal }}</b></span>
          <span class="cf-stat cf-stat--pending">待跟进 <b>{{ pendingFollowupCount }}</b></span>
        </div>
      </div>
    </template>
    <div class="cf-dialog">
      <el-table
        v-loading="loading"
        :data="rows"
        :row-key="rowKey"
        :row-class-name="rowClassName"
        max-height="520"
        class="cf-table"
        empty-text="暂无触达记录"
      >
        <el-table-column type="expand" width="42">
          <template #default="{ row }">
            <div v-if="hasFollowup(row)" class="cf-sub">
              <el-table :data="row.followupRecords" size="small" class="cf-sub-table">
                <el-table-column label="跟踪" min-width="200">
                  <template #default="{ $index }">
                    <span class="cf-sub__name">跟踪（第{{ $index + 1 }}次）</span>
                  </template>
                </el-table-column>
                <el-table-column label="时间" width="170" align="center">
                  <template #default="{ row: item }">{{ parseTime(item.followupDate, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}</template>
                </el-table-column>
                <el-table-column label="方式" width="110" align="center">
                  <template #default="{ row: item }">{{ dictText(contactWayOptions, item.followupWay) }}</template>
                </el-table-column>
                <el-table-column label="状态" width="110" align="center">
                  <template #default="{ row: item }">
                    <el-tag size="small" :type="item.followupStatus === '1' ? 'success' : 'warning'">
                      {{ item.followupStatus === '1' ? '已完成' : '待跟进' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="跟踪人" width="110" align="center" show-overflow-tooltip>
                  <template #default="{ row: item }">{{ userText(item.followupBy) }}</template>
                </el-table-column>
                <el-table-column label="跟踪结果" min-width="200" show-overflow-tooltip>
                  <template #default="{ row: item }">{{ item.followupResult || item.followupNote || '-' }}</template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="cf-sub cf-sub--empty">{{ canFollowup(row) ? '暂无跟踪记录' : '该来源不支持跟踪登记' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="触达/跟踪" min-width="260" fixed="left">
          <template #default="{ row }">
            <div class="cf-touch-cell">
              <div class="cf-touch-cell__icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="cf-touch-cell__body">
                <div class="cf-touch-cell__title">
                  <span>{{ subjectText(row) }}</span>
                  <el-tag size="small" effect="plain" :type="sourceTagType(row)">{{ sourceLabel(row) }}</el-tag>
                </div>
                <div class="cf-touch-cell__desc">{{ row.followupItem || row.supplement || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170" align="center">
          <template #default="{ row }">{{ parseTime(row.contactDate, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}</template>
        </el-table-column>
        <el-table-column label="触达方式" width="110" align="center">
          <template #default="{ row }">{{ wayText(row) }}</template>
        </el-table-column>
        <el-table-column label="触达结果" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="contactResultTag(row)">
              {{ resultText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户态度" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="canFollowup(row) && row.customerAttitude" size="small" :type="attitudeTag(row.customerAttitude)" effect="plain">
              {{ attitudeText(row) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="客户意向" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="intentText(row) !== '-'" size="small" type="danger" effect="plain">
              {{ intentText(row) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="跟进人" width="110" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ userText(row.contactBy) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>

    <el-drawer
      v-model="detailOpen"
      title="触达详情"
      size="520px"
      append-to-body
      class="contact-detail-drawer"
    >
      <div v-if="current" class="cf-detail">
        <div class="cf-detail__header">
          <div class="cf-detail__title-row">
            <span class="cf-detail__name">{{ subjectText(current) }}</span>
            <el-tag size="small" :type="sourceTagType(current)" effect="dark" round>{{ sourceLabel(current) }}</el-tag>
          </div>
          <div class="cf-detail__sub">{{ current.followupItem || current.supplement || '-' }}</div>
        </div>

        <div class="cf-section">
          <div class="cf-section__title">触达</div>
          <div class="cf-info-grid">
            <div class="cf-info">
              <span class="cf-info__label">时间</span>
              <span class="cf-info__value">{{ parseTime(current.contactDate, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}</span>
            </div>
            <div class="cf-info">
              <span class="cf-info__label">触达方式</span>
              <span class="cf-info__value">{{ wayText(current) }}</span>
            </div>
            <div class="cf-info">
              <span class="cf-info__label">跟进人</span>
              <span class="cf-info__value">{{ userText(current.contactBy) }}</span>
            </div>
            <div v-if="current.contactDuration" class="cf-info">
              <span class="cf-info__label">触达时长</span>
              <span class="cf-info__value">{{ durationText(current) }}</span>
            </div>
          </div>
        </div>

        <div class="cf-section">
          <div class="cf-section__head">
            <span class="cf-section__title">触达结果</span>
            <el-tag size="small" :type="contactResultTag(current)">
              {{ resultText(current) }}
            </el-tag>
          </div>
          <div class="cf-info-grid cf-info-grid--2">
            <div class="cf-info">
              <span class="cf-info__label">客户态度</span>
              <span class="cf-info__value">
                <el-tag v-if="canFollowup(current) && current.customerAttitude" size="small" :type="attitudeTag(current.customerAttitude)" effect="plain">
                  {{ attitudeText(current) }}
                </el-tag>
                <span v-else>-</span>
              </span>
            </div>
            <div class="cf-info">
              <span class="cf-info__label">客户意向</span>
              <span class="cf-info__value">
                <el-tag v-if="intentText(current) !== '-'" size="small" type="danger" effect="plain">
                  {{ intentText(current) }}
                </el-tag>
                <span v-else>-</span>
              </span>
            </div>
          </div>
          <div class="cf-summary">
            <div class="cf-info__label">沟通摘要</div>
            <p class="cf-summary__text">{{ current.supplement || current.followupItem || '-' }}</p>
          </div>
        </div>

        <div v-if="scopedProducts(current).length" class="cf-section">
          <div class="cf-section__title">涉及客群/产品</div>
          <div class="cf-products">
            <div v-for="item in scopedProducts(current)" :key="item.id || item.groupId || item.groupName" class="cf-product">
              <div class="cf-product__name">{{ item.groupName || '客户级触达' }}</div>
              <div class="cf-product__meta">
                <span>产品：{{ item.targetBusiness || '-' }}</span>
                <span>反馈：{{ item.productFeedback || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="cf-section cf-section--last">
          <div class="cf-section__title">跟踪记录（{{ current.followupRecords ? current.followupRecords.length : 0 }}）</div>
          <el-timeline v-if="hasFollowup(current)" class="cf-timeline">
            <el-timeline-item
              v-for="(item, index) in current.followupRecords"
              :key="item.id || index"
              hide-timestamp
              :hollow="item.followupStatus !== '1'"
              :type="item.followupStatus === '1' ? 'primary' : 'warning'"
            >
              <div class="cf-timeline__item">
                <div class="cf-timeline__head">
                  <span class="cf-timeline__name">跟踪（第{{ index + 1 }}次）</span>
                  <span class="cf-timeline__date">{{ parseTime(item.followupDate, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}</span>
                </div>
                <div class="cf-timeline__meta">
                  <el-tag size="small" effect="plain">{{ dictText(contactWayOptions, item.followupWay) }}</el-tag>
                  <el-tag size="small" :type="item.followupStatus === '1' ? 'success' : 'warning'">
                    {{ item.followupStatus === '1' ? '已完成' : '待跟进' }}
                  </el-tag>
                  <span class="cf-timeline__by">跟踪人：{{ userText(item.followupBy) }}</span>
                </div>
                <div class="cf-timeline__text">{{ item.followupResult || item.followupNote || '-' }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else :description="canFollowup(current) ? '暂无跟踪记录' : '该来源不支持跟踪登记'" :image-size="72" />
        </div>
      </div>
      <template #footer>
        <el-button v-if="current && canFollowup(current) && current.needFollowup === '1'" type="primary" plain @click="openProcess">
          新建跟踪
        </el-button>
        <el-button @click="detailOpen = false">关闭</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="processOpen" title="新建跟踪" width="640px" append-to-body>
      <el-form :model="processForm" label-width="96px">
        <el-form-item label="客户名称">
          <el-input :model-value="processForm.customerName || '-'" disabled />
        </el-form-item>
        <el-form-item label="跟踪客群">
          <div v-if="processGroupOptions.length > 1" class="cf-group-selector">
            <el-checkbox-group v-model="processForm.groupIds">
              <el-checkbox v-for="item in processGroupOptions" :key="item.groupId" :label="item.groupId">
                {{ item.groupName }}<span v-if="item.targetBusiness"> · {{ item.targetBusiness }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <el-input v-else :model-value="processScopeLabel" disabled />
        </el-form-item>
        <el-form-item label="跟踪时间">
          <el-date-picker
            v-model="processForm.followupDate"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="跟踪方式">
          <el-select v-model="processForm.followupWay" style="width: 100%">
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
        <el-button type="primary" :loading="processSaving" @click="submitProcess">保存</el-button>
        <el-button @click="processOpen = false">取消</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup name="ContactFollowupTimelineDialog">
import { computed, getCurrentInstance, ref } from 'vue'
import { Phone } from '@element-plus/icons-vue'
import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'
import { listContactRecord } from '@/api/szhl/crm/contactRecord'
import { getViewContacts } from '@/api/szhl/crm/view'
import { createFollowup } from '@/api/szhl/crm/followup'
import { parseTime, selectDictLabel } from '@/utils/ruoyi'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'

// 三源触达来源，与 /crm/view/*/contacts 返回的 sourceType 对齐：
// CRM=本系统触达登记(MySQL) / MARKET=智慧互联营销交互(DB2) / PAD=PAD走访
const SOURCE_CRM = 'CRM'
const SOURCE_MARKET = 'MARKET'
const SOURCE_PAD = 'PAD'
const SOURCE_LABELS = {
  [SOURCE_CRM]: '触达登记',
  [SOURCE_MARKET]: '智慧互联',
  [SOURCE_PAD]: 'PAD走访'
}

const { proxy } = getCurrentInstance()
const dictStore = useDictStore()

const visible = ref(false)
const loading = ref(false)
const rows = ref([])
const customer = ref({})
const detailOpen = ref(false)
const current = ref(null)
const processOpen = ref(false)
const processSaving = ref(false)
const contactWayOptions = ref([])
const contactResultOptions = ref([])
const attitudeOptions = ref([])
// 智慧互联(DB2)来源的方式/主题/结果另有一套字典，结果字典还需按触达主题分流
const marketContactWayOptions = ref([])
const marketContactSubjectOptions = ref([])
const marketContractResultOptions = ref([])
const marketLoanReduceResultOptions = ref([])
const marketOtherBankLoanResultOptions = ref([])
const marketReturnSwallowResultOptions = ref([])
const managerOptions = useUserOptions()
const processForm = ref({
  contactId: undefined,
  customerId: undefined,
  customerName: '',
  followupDate: '',
  followupWay: '1',
  followupStatus: '0',
  followupResult: '',
  followupNote: '',
  groupIds: []
})

const dialogTitle = computed(() => {
  return customer.value.customerName ? `${customer.value.customerName} - 触达记录` : '触达记录'
})

const followupTotal = computed(() => {
  return rows.value.reduce((total, row) => total + (Array.isArray(row.followupRecords) ? row.followupRecords.length : 0), 0)
})

const pendingFollowupCount = computed(() => {
  return rows.value.filter(row => row.needFollowup === '1' && !hasCompletedFollowup(row)).length
})

const processGroupOptions = computed(() => {
  return current.value ? scopedProducts(current.value).filter(item => item.groupId) : []
})

const processScopeLabel = computed(() => {
  if (!current.value) return '-'
  if (processGroupOptions.value.length === 1) {
    const item = processGroupOptions.value[0]
    return item.targetBusiness ? `${item.groupName} · ${item.targetBusiness}` : item.groupName
  }
  return '客户级触达'
})

function open (row) {
  const customerId = row.customerId || row.targetCustomerId
  if (!customerId) {
    proxy.$modal.msgWarning('未获取到客户信息')
    return
  }
  customer.value = row
  visible.value = true
  loading.value = true
  Promise.all([
    ensureDictOptions().catch(() => undefined),
    loadRecords(customerId, row.customerNo)
  ]).finally(() => {
    loading.value = false
  })
}

/**
 * 合并三源触达记录。
 * CRM 源仍走 /crm/contact/record/list：只有它装配了跟踪记录与客群产品，
 * /crm/view/{customerNo}/contacts 的 CRM 分支拿不到这两项，故只从三源接口取智慧互联与 PAD。
 * 缺客户号时退化为仅 CRM 源；三源接口失败只降级，不影响已取到的 CRM 记录。
 */
function loadRecords (customerId, customerNo) {
  const crmRequest = listContactRecord(customerId)
    .then(res => (res.data || []).map(item => ({ ...item, sourceType: SOURCE_CRM })))
  const externalRequest = customerNo
    ? getViewContacts(customerNo)
      .then(res => (res.data || []).filter(item => sourceOf(item) !== SOURCE_CRM))
      .catch(() => [])
    : Promise.resolve([])
  return Promise.all([crmRequest, externalRequest]).then(([crmRows, externalRows]) => {
    rows.value = crmRows.concat(externalRows).sort(byContactDateDesc)
  })
}

function sourceOf (row) {
  return String(row && row.sourceType ? row.sourceType : SOURCE_CRM).toUpperCase()
}

// contactDate 三源都按 yyyy-MM-dd HH:mm:ss 序列化，等宽字符串可直接比较
function byContactDateDesc (a, b) {
  return String(b.contactDate || '').localeCompare(String(a.contactDate || ''))
}

function reset () {
  rows.value = []
  customer.value = {}
  detailOpen.value = false
  current.value = null
  processOpen.value = false
  processSaving.value = false
  resetProcessForm()
}

function openDetail (row) {
  current.value = row
  detailOpen.value = true
}

function openProcess () {
  if (!current.value) {
    return
  }
  resetProcessForm()
  processForm.value = {
    contactId: current.value.id,
    customerId: current.value.customerId,
    customerName: current.value.customerName,
    followupDate: proxy.parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
    followupWay: '1',
    followupStatus: '0',
    followupResult: '',
    followupNote: '',
    groupIds: processGroupOptions.value.length === 1 ? [processGroupOptions.value[0].groupId] : []
  }
  processOpen.value = true
}

function resetProcessForm () {
  processForm.value = {
    contactId: undefined,
    customerId: undefined,
    customerName: '',
    followupDate: '',
    followupWay: '1',
    followupStatus: '0',
    followupResult: '',
    followupNote: '',
    groupIds: []
  }
}

function submitProcess () {
  if (!processForm.value.contactId) {
    proxy.$modal.msgWarning('缺少触达记录')
    return
  }
  if (!processForm.value.followupDate) {
    proxy.$modal.msgWarning('请选择跟踪时间')
    return
  }
  if (!processForm.value.followupWay) {
    proxy.$modal.msgWarning('请选择跟踪方式')
    return
  }
  if (processGroupOptions.value.length > 1 && (!processForm.value.groupIds || processForm.value.groupIds.length === 0)) {
    proxy.$modal.msgWarning('请选择本次跟踪覆盖的客群')
    return
  }
  processSaving.value = true
  createFollowup({
    contactId: processForm.value.contactId,
    customerId: processForm.value.customerId,
    customerName: processForm.value.customerName,
    followupDate: processForm.value.followupDate,
    followupWay: processForm.value.followupWay,
    followupResult: processForm.value.followupResult,
    followupNote: processForm.value.followupNote,
    followupStatus: processForm.value.followupStatus,
    groupIds: processGroupOptions.value.length > 1 ? processForm.value.groupIds : processForm.value.groupIds
  }).then(() => {
    proxy.$modal.msgSuccess('跟踪记录已保存')
    processOpen.value = false
    reloadRecords(processForm.value.contactId)
  }).finally(() => {
    processSaving.value = false
  })
}

function reloadRecords (contactId) {
  const customerId = customer.value.customerId || customer.value.targetCustomerId
  if (!customerId) {
    return
  }
  loading.value = true
  loadRecords(customerId, customer.value.customerNo).then(() => {
    if (contactId) {
      current.value = rows.value.find(item => item.id === contactId) || current.value
    }
  }).finally(() => {
    loading.value = false
  })
}

function ensureDictOptions () {
  return Promise.all([
    loadDictOption('crm_contact_way', contactWayOptions),
    loadDictOption('crm_contact_result', contactResultOptions),
    loadDictOption('crm_customer_attitude', attitudeOptions),
    loadDictOption('market_contract_interactive_type', marketContactWayOptions),
    loadDictOption('market_contract_interactive_subject', marketContactSubjectOptions),
    loadDictOption('market_contract_result', marketContractResultOptions),
    loadDictOption('loan_reduce_result', marketLoanReduceResultOptions),
    loadDictOption('other_bank_loan_marketing_result', marketOtherBankLoanResultOptions),
    loadDictOption('return_swallow_result', marketReturnSwallowResultOptions)
  ])
}

function loadDictOption (dictType, target) {
  const cached = dictStore.getDict(dictType)
  if (cached) {
    target.value = cached
    return Promise.resolve()
  }
  return getDicts(dictType).then(resp => {
    const rows = (resp.data || []).map(item => ({
      label: item.dictLabel,
      value: item.dictValue,
      elTagType: item.listClass,
      elTagClass: item.cssClass
    }))
    target.value = rows
    dictStore.setDict(dictType, rows)
  })
}

function dictText (options, value) {
  return value === undefined || value === null || value === '' ? '-' : (selectDictLabel(options.value || options, value) || value)
}

function sourceLabel (row) {
  return SOURCE_LABELS[sourceOf(row)] || SOURCE_LABELS[SOURCE_CRM]
}

function sourceTagType (row) {
  const source = sourceOf(row)
  if (source === SOURCE_PAD) return 'warning'
  return source === SOURCE_MARKET ? 'success' : 'primary'
}

// 三源字典口径不同：智慧互联走营销交互字典，PAD 落库即为文字，直接取原文
function wayText (row) {
  const source = sourceOf(row)
  if (source === SOURCE_PAD) return row.contactWay || '-'
  if (source === SOURCE_MARKET) return dictText(marketContactWayOptions, row.contactWay)
  return dictText(contactWayOptions, row.contactWay)
}

function subjectText (row) {
  const source = sourceOf(row)
  if (source === SOURCE_PAD) return row.contactTag || 'PAD走访'
  if (source === SOURCE_MARKET) return dictText(marketContactSubjectOptions, row.contactTag)
  return row.contactTag || '触达记录'
}

function resultText (row) {
  const source = sourceOf(row)
  if (source === SOURCE_PAD) return row.contactResult || '-'
  if (source === SOURCE_MARKET) return dictText(marketResultOptions(row.contactTag), row.contactResult)
  return dictText(contactResultOptions, row.contactResult)
}

// 智慧互联的结果字典按触达主题分流，与 market/contract 模块口径保持一致
function marketResultOptions (subject) {
  const optionsBySubject = {
    1: marketContractResultOptions,
    2: marketLoanReduceResultOptions,
    3: marketOtherBankLoanResultOptions,
    10: marketReturnSwallowResultOptions
  }
  return optionsBySubject[String(subject)] || marketContractResultOptions
}

// 客户态度仅 CRM 登记时采集
function attitudeText (row) {
  return sourceOf(row) === SOURCE_CRM ? dictText(attitudeOptions, row.customerAttitude) : '-'
}

// 跟踪记录挂在 crm_followup_record 的 contactId 上，只有 CRM 源能新建跟踪
function canFollowup (row) {
  return sourceOf(row) === SOURCE_CRM
}

function durationText (row) {
  const minutes = Number(row && row.contactDuration)
  if (!Number.isFinite(minutes) || minutes <= 0) return '-'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remain = minutes % 60
  return remain ? `${hours}小时${remain}分钟` : `${hours}小时`
}

function rowKey (row) {
  return `${sourceOf(row)}:${row.id || row.sourceRecordId || ''}`
}

function userText (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function hasFollowup (row) {
  return Array.isArray(row.followupRecords) && row.followupRecords.length > 0
}

function hasCompletedFollowup (row) {
  return hasFollowup(row) && row.followupRecords.some(item => item.followupStatus === '1')
}

function rowClassName ({ row }) {
  const classes = []
  if (!hasFollowup(row)) classes.push('cf-row-no-children')
  if (hasCompletedFollowup(row)) {
    classes.push('cf-row-completed')
  } else if (hasFollowup(row)) {
    classes.push('cf-row-following')
  } else {
    classes.push('cf-row-pending')
  }
  return classes.join(' ')
}

function contactProducts (row) {
  return Array.isArray(row.products) ? row.products : []
}

function scopedProducts (row) {
  return contactProducts(row).filter(item => item && (item.groupId || item.groupName || item.targetBusiness || item.productFeedback))
}

function isGroupTouch (row) {
  return scopedProducts(row).length > 0 || !!row.groupId
}

function intentText (row) {
  const feedback = scopedProducts(row).map(item => item.productFeedback).filter(Boolean)
  if (feedback.length) return Array.from(new Set(feedback)).join('、')
  // contactResult 的编码含义随来源而异，只有 CRM 源可按 crm_contact_result 推断意向
  if (!canFollowup(row)) return '-'
  if (String(row.contactResult) === '1') return '有意向'
  if (String(row.contactResult) === '2') return '无意向'
  return '-'
}

function contactResultTag (row) {
  if (canFollowup(row)) {
    const value = row.contactResult
    if (value === '1' || value === '已接通' || value === '已联系') return 'success'
    if (value === '3' || value === '未接通') return 'danger'
    if (value === '2' || value === '无意向') return 'warning'
    if (value === '4' || value === '已办理') return 'success'
    return 'info'
  }
  // 另两源的结果是业务文案而非 CRM 编码，只能按语义着色
  const text = resultText(row)
  if (/失败|拒绝|无人|未接|流失|投诉/.test(text)) return 'danger'
  if (/成功|已办|接通|已联系|达成|签约/.test(text)) return 'success'
  return 'info'
}

function attitudeTag (value) {
  if (value === '1' || value === '积极') return 'success'
  if (value === '3' || value === '消极') return 'danger'
  return 'warning'
}

defineExpose({ open })
</script>

<style scoped>
.cf-dialog {
  min-height: 420px;
}

.cf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 24px 14px 0;
  border-bottom: 1px solid #ebeef5;
}

.cf-header__main {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 16px;
  min-width: 0;
}

.cf-header__name {
  color: #1f2d3d;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.cf-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}

.cf-header__stats {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
  color: #606266;
  font-size: 13px;
}

.cf-stat b {
  margin-left: 4px;
  color: #303133;
  font-size: 15px;
  font-weight: 600;
}

.cf-stat--pending b {
  color: #e6a23c;
}

.cf-table {
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.cf-table :deep(.el-table__expanded-cell) {
  padding: 0;
  background: #fbfcff;
}

.cf-table :deep(.cf-row-no-children .el-table__expand-icon) {
  visibility: hidden;
  pointer-events: none;
}

.cf-touch-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.cf-touch-cell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.cf-touch-cell__body {
  min-width: 0;
}

.cf-touch-cell__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-weight: 600;
  line-height: 22px;
}

.cf-touch-cell__desc {
  overflow: hidden;
  margin-top: 2px;
  color: #606266;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cf-sub {
  padding: 8px 16px 12px 58px;
}

.cf-sub--empty {
  color: #909399;
  font-size: 13px;
}

.cf-sub-table {
  border: 1px solid #ebeef5;
}

.cf-sub-table :deep(.el-table__header-wrapper th) {
  background: #f5f7fa;
  color: #909399;
  font-weight: 500;
}

.cf-sub-table :deep(.el-table__row) {
  background: #fcfdff;
}

.cf-sub__name {
  color: #303133;
  font-weight: 500;
}

.cf-detail {
  padding: 0 4px 20px;
}

.cf-detail__header {
  padding-bottom: 18px;
  border-bottom: 1px solid #f0f2f5;
}

.cf-detail__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cf-detail__name {
  color: #1f2d3d;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.cf-detail__sub {
  margin-top: 8px;
  color: #606266;
  line-height: 20px;
}

.cf-section {
  padding: 18px 0;
  border-bottom: 1px solid #f0f2f5;
}

.cf-section--last {
  border-bottom: none;
}

.cf-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.cf-section__head .cf-section__title {
  margin-bottom: 0;
}

.cf-section__title {
  margin-bottom: 14px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.cf-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.cf-info-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.cf-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cf-info__label {
  color: #909399;
  font-size: 12px;
  line-height: 16px;
}

.cf-info__value {
  color: #303133;
  font-size: 13px;
  line-height: 20px;
}

.cf-summary {
  margin-top: 16px;
}

.cf-summary__text {
  margin: 8px 0 0;
  color: #303133;
  font-size: 13px;
  line-height: 22px;
  white-space: pre-wrap;
  word-break: break-word;
}

.cf-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cf-group-selector {
  width: 100%;
}

.cf-group-selector :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cf-group-selector :deep(.el-checkbox) {
  margin-right: 0;
  line-height: 20px;
}

.cf-product {
  padding: 9px 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.cf-product__name {
  color: #303133;
  font-weight: 600;
  line-height: 20px;
}

.cf-product__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 4px;
  color: #606266;
  font-size: 12px;
}

.cf-timeline {
  padding: 4px 0 0 4px;
}

.cf-timeline :deep(.el-timeline-item__node--normal) {
  width: 11px;
  height: 11px;
  left: 1px;
}

.cf-timeline :deep(.el-timeline-item__tail) {
  left: 5px;
}

.cf-timeline :deep(.el-timeline-item__wrapper) {
  padding-left: 22px;
}

.cf-timeline__item {
  padding-bottom: 6px;
}

.cf-timeline__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cf-timeline__name {
  color: #303133;
  font-size: 13px;
  font-weight: 600;
}

.cf-timeline__date {
  color: #909399;
  font-size: 12px;
}

.cf-timeline__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.cf-timeline__by {
  color: #909399;
  font-size: 12px;
}

.cf-timeline__text {
  margin-top: 8px;
  color: #303133;
  font-size: 13px;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
