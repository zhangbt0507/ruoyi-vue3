<template>
  <div class="contact-timeline">
    <div class="timeline-filter">
      <el-radio-group v-model="typeFilter" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="field">智慧互联触达</el-radio-button>
        <el-radio-button label="pad">PAD触达</el-radio-button>
      </el-radio-group>
      <el-checkbox v-model="hideShortFeedback" size="small">隐藏触达反馈少于{{ FEEDBACK_MIN_LENGTH }}字的记录</el-checkbox>
    </div>
    <div class="timeline-wrap">
      <div v-if="visibleRows.length === 0" class="empty-timeline">{{ allRows.length ? '暂无符合条件的触达记录' : '暂无数据' }}</div>
      <div v-for="(row, index) in visibleRows" :key="index" :class="['timeline-item', row.theme]">
        <div class="timeline-dot"></div>
        <div class="timeline-head">
          <span class="timeline-date">{{ displayValue(row.date) }}</span>
          <span class="head-divider"></span>
          <span class="visit-type-tag">{{ displayValue(row.sourceLabel) }}</span>
          <span class="head-divider"></span>
          <span class="timeline-user"><span class="user-label">触达人：</span>{{ displayValue(row.user) }}</span>
        </div>
        <div class="timeline-card">
          <div class="card-fields">
            <div class="field-item">
              <span class="field-label">触达方式：</span>
              <span :class="['field-value', row.wayClass]">{{ displayValue(row.contactWay) }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">触达主题：</span>
              <span class="field-value">{{ displayValue(row.contactSubject) }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">触达结果：</span>
              <span :class="['field-value', row.resultClass]">{{ displayValue(row.contactResult) }}</span>
            </div>
            <div v-if="row.category === 'pad'" class="field-item">
              <span class="field-label">触达时长：</span>
              <span class="field-value">{{ row.durationText }}</span>
            </div>
            <div v-if="row.category !== 'pad'" class="field-item">
              <span class="field-label">客户态度：</span>
              <span :class="['field-value', row.attitudeClass]">{{ displayValue(row.customerAttitude) }}</span>
            </div>
            <div v-if="row.category !== 'pad'" class="field-item">
              <span class="field-label">是否跟踪：</span>
              <span :class="['field-value', row.followClass]">{{ displayValue(row.followupText) }}</span>
            </div>
          </div>
          <div v-if="row.supplement" class="supplement-row">
            <span class="field-label">补充说明：</span>
            <span class="field-value">{{ row.supplement }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ContactTimeline">
import { computed, getCurrentInstance, ref } from 'vue'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'

const props = defineProps({
  // 原始触达记录（/crm/view 的 contacts），字典翻译与展示映射由组件内部完成
  contacts: { type: Array, default: () => [] }
})

const { proxy } = getCurrentInstance()
const {
  crm_contact_way: contactWayOptions,
  crm_contact_result: contactResultOptions,
  crm_customer_attitude: attitudeOptions,
  market_contract_interactive_type: marketContactWayOptions,
  market_contract_interactive_subject: marketContactSubjectOptions,
  market_contract_result: marketContractResultOptions,
  loan_reduce_result: marketLoanReduceResultOptions,
  other_bank_loan_marketing_result: marketOtherBankLoanResultOptions,
  return_swallow_result: marketReturnSwallowResultOptions
} = proxy.useDict(
  'crm_contact_way',
  'crm_contact_result',
  'crm_customer_attitude',
  'market_contract_interactive_type',
  'market_contract_interactive_subject',
  'market_contract_result',
  'loan_reduce_result',
  'other_bank_loan_marketing_result',
  'return_swallow_result'
)
const managerOptions = useUserOptions()

const FEEDBACK_MIN_LENGTH = 10
const typeFilter = ref('all')
const hideShortFeedback = ref(false)

const allRows = computed(() => props.contacts.map(item => {
  const sourceType = String(item.sourceType || 'CRM').toUpperCase()
  const source = getSourceMeta(sourceType)
  const contactWayText = formatContactWay(item, sourceType)
  const contactResultText = formatContactResult(item, sourceType)
  const customerAttitudeText = sourceType === 'CRM'
    ? selectDictLabelStrict(attitudeOptions.value, item.customerAttitude)
    : ''
  const contactSubject = formatContactSubject(item, sourceType)
  const followupText = sourceType !== 'PAD' ? formatFollowupText(item) : ''
  const durationText = source.category === 'pad'
    ? formatDurationText(item.contactDuration)
    : ''
  return {
    date: proxy.parseTime(item.contactDate, '{y}-{m}-{d}'),
    sourceLabel: source.label,
    theme: getRowTheme(contactWayText),
    user: formatUser(item.contactBy),
    contactWay: contactWayText,
    contactSubject,
    contactResult: contactResultText,
    customerAttitude: customerAttitudeText,
    followupText,
    durationText,
    wayClass: contactWayText ? 'value-tag tag-theme' : '',
    resultClass: getResultClass(item, sourceType, contactResultText),
    attitudeClass: getAttitudeClass(sourceType, item.customerAttitude),
    followClass: followupText && followupText !== '否' ? 'value-tag tag-positive' : '',
    supplement: item.supplement || '',
    category: source.category,
    feedbackLength: String(item.supplement || '').length
  }
}))

function selectDictLabelStrict(options, value) {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  const option = (options || []).find(item =>
    String(item.value) === String(value) || String(item.label) === String(value)
  )
  return option?.label || ''
}

function formatContactWay(item, sourceType) {
  if (sourceType === 'MARKET') {
    return selectDictLabelStrict(marketContactWayOptions.value, item.contactWay) || '触达'
  }
  if (sourceType === 'PAD') {
    return item.contactWay || 'PAD走访'
  }
  return selectDictLabelStrict(contactWayOptions.value, item.contactWay) || '触达'
}

function getMarketResultOptions(subject) {
  const optionsBySubject = {
    1: marketContractResultOptions.value,
    2: marketLoanReduceResultOptions.value,
    3: marketOtherBankLoanResultOptions.value,
    10: marketReturnSwallowResultOptions.value
  }
  return optionsBySubject[String(subject)] || []
}

function formatContactResult(item, sourceType) {
  if (sourceType === 'MARKET') {
    return selectDictLabelStrict(getMarketResultOptions(item.contactTag), item.contactResult)
  }
  if (sourceType === 'PAD') {
    return item.contactResult || ''
  }
  return selectDictLabelStrict(contactResultOptions.value, item.contactResult)
}

function formatContactSubject(item, sourceType) {
  if (sourceType === 'MARKET') {
    return selectDictLabelStrict(marketContactSubjectOptions.value, item.contactTag) || '营销触达'
  }
  if (sourceType === 'PAD') {
    return item.contactTag || 'PAD走访'
  }
  return item.followupItem || item.contactTag || item.contactTitle || '客户触达'
}

function formatFollowupText(item) {
  const count = Number(item.followupCount) || (Array.isArray(item.followupRecords) ? item.followupRecords.length : 0)
  if (count > 0) {
    return `已跟踪${count}次`
  }
  return item.needFollowup === '1' ? '需跟踪' : '否'
}

function formatDurationText(minutes) {
  if (minutes === undefined || minutes === null || minutes === '') {
    return '--'
  }
  const m = Number(minutes)
  if (!m || m < 0) {
    return '--'
  }
  if (m < 60) {
    return `${m}分钟`
  }
  const h = Math.floor(m / 60)
  const remain = m % 60
  return remain ? `${h}小时${remain}分钟` : `${h}小时`
}

const visibleRows = computed(() => allRows.value.filter(row => {
  if (typeFilter.value !== 'all' && row.category !== typeFilter.value) {
    return false
  }
  if (hideShortFeedback.value && row.feedbackLength < FEEDBACK_MIN_LENGTH) {
    return false
  }
  return true
}))

// 触达来源映射：后端 sourceType 三源（CRM 手工登记 / MARKET 营销交互 / PAD 走访）
// 过滤归类按业务口径二分——PAD 走访归「PAD触达」，CRM + 营销交互归「智慧互联触达」
function getSourceMeta(sourceType) {
  const type = String(sourceType || '').toUpperCase()
  if (type === 'PAD') {
    return { label: 'PAD触达', className: 'source-pad', category: 'pad' }
  }
  if (type === 'MARKET') {
    return { label: '智慧互联触达', className: 'source-market', category: 'field' }
  }
  return { label: '智慧互联触达', className: 'source-crm', category: 'field' }
}

// 条目主题色与原型 html 色系一致：电话为蓝色，微信/短信为绿色，走访类及其他为青色
function getRowTheme(way) {
  const text = String(way || '')
  if (/电话/.test(text)) {
    return 'theme-blue'
  }
  if (/微信|短信/.test(text)) {
    return 'theme-green'
  }
  return 'theme-teal'
}

function getResultClass(item, sourceType, resultText) {
  const text = String(resultText || '')
  if (!text) {
    return ''
  }
  if (sourceType === 'CRM' && ['2', '3'].includes(String(item.contactResult))) {
    return 'value-tag tag-negative'
  }
  if (/失败|拒绝|无人|未接|偏慢|逾期|流失|投诉/.test(text)) {
    return 'value-tag tag-negative'
  }
  return 'value-tag tag-theme'
}

function getAttitudeClass(sourceType, value) {
  if (sourceType !== 'CRM') {
    return ''
  }
  const v = String(value ?? '')
  if (v === '1') return 'value-tag tag-positive'
  if (v === '3') return 'value-tag tag-negative'
  return v ? 'value-tag tag-neutral' : ''
}

function formatUser(value) {
  return formatUserDisplayName(managerOptions.value, value, '')
}

function displayValue(value) {
  if (value === 0) {
    return 0
  }
  return value || '--'
}
</script>

<style scoped>
.timeline-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.timeline-wrap {
  position: relative;
  padding-left: 24px;
}

.timeline-wrap::before {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 7px;
  width: 2px;
  background: #e8e8e8;
  content: '';
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 8px;
}

/* 原型样式：10px 实心彩色圆点 + 白边 + 浅色光晕，中心对齐竖线（wrap 内 x=8px） */
.timeline-dot {
  position: absolute;
  top: 4px;
  left: -21px;
  width: 10px;
  height: 10px;
  background: #13c2c2;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #b5f5ec;
}

.timeline-item.theme-blue .timeline-dot {
  background: #1890ff;
  box-shadow: 0 0 0 2px #d6e8ff;
}

.timeline-item.theme-green .timeline-dot {
  background: #52c41a;
  box-shadow: 0 0 0 2px #d9f7be;
}

.timeline-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.head-divider {
  width: 1px;
  height: 12px;
  background: #e5e6eb;
}

.timeline-date {
  color: #8c8c8c;
  font-size: 12px;
  white-space: nowrap;
}

.visit-type-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 3px;
  white-space: nowrap;
}

.theme-teal .visit-type-tag {
  color: #13c2c2;
  background: #e6fffb;
}

.theme-blue .visit-type-tag {
  color: #1890ff;
  background: #e6f7ff;
}

.theme-green .visit-type-tag {
  color: #52c41a;
  background: #f6ffed;
}

.timeline-user {
  color: #8c8c8c;
  font-size: 11px;
  white-space: nowrap;
}

.timeline-user .user-label {
  font-weight: 500;
}

.timeline-card {
  padding: 10px 14px;
  border-radius: 6px;
}

.theme-teal .timeline-card {
  background: #f6fffe;
  border: 1px solid #b5f5ec;
}

.theme-blue .timeline-card {
  background: #f0f7ff;
  border: 1px solid #d6e8ff;
}

.theme-green .timeline-card {
  background: #f6ffed;
  border: 1px solid #d9f7be;
}

.card-fields {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 20px;
}

.field-item {
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.6;
}

.field-label {
  color: #333;
  white-space: nowrap;
}

.field-value {
  color: #666;
  word-break: break-all;
}

.value-tag {
  display: inline-block;
  padding: 1px 8px;
  font-size: 11px;
  border-radius: 10px;
}

.theme-teal .value-tag.tag-theme {
  color: #13c2c2;
  background: #e6fffb;
}

.theme-blue .value-tag.tag-theme {
  color: #1890ff;
  background: #e6f7ff;
}

.theme-green .value-tag.tag-theme {
  color: #52c41a;
  background: #f6ffed;
}

.value-tag.tag-positive {
  color: #52c41a;
  background: #f6ffed;
}

.value-tag.tag-negative {
  color: #ff4d4f;
  background: #fff2f0;
}

.value-tag.tag-neutral {
  color: #1890ff;
  background: #e6f7ff;
}

.supplement-row {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
}

.empty-timeline {
  padding: 12px;
  color: #909399;
  font-size: 12px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}
</style>
