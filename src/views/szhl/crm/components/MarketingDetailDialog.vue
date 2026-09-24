<template>
  <el-dialog
    title="客户营销任务详情"
    v-model="visible"
    width="1000px"
    append-to-body
    :close-on-click-modal="false"
    @closed="reset"
  >
    <div class="dialog-body" >
      <div class="mkt-header">
        <div class="mkt-header__left">
          <div class="mkt-avatar"><el-icon><User /></el-icon></div>
          <div class="mkt-header__info">
            <div class="mkt-header__name-row">
              <span class="mkt-header__name">{{ customer.customerName || '-' }}</span>
              <el-tag v-if="customer.customerLevel" size="small" effect="light" type="warning">
                {{ selectDictLabel(levelOptions, customer.customerLevel) || customer.customerLevel }}
              </el-tag>
            </div>
            <div class="mkt-header__contact">
              <span class="mkt-header__cell"><el-icon><Cellphone /></el-icon>{{ customer.phone || '未留电话' }}</span>
              <span class="mkt-header__cell"><el-icon><Postcard /></el-icon>客户号 {{ customer.customerNo || '-' }}</span>
            </div>
            <div v-if="portraitTags.length" class="mkt-header__tags">
              <el-tag v-for="t in portraitTags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
            </div>
          </div>
        </div>
        <div class="mkt-header__right">
          <div class="mkt-header__meta">
            <span class="mkt-header__meta-label">管户经理</span>
            <span>{{ formatUser(customer.attributionManager) }}</span>
          </div>
          <div class="mkt-header__meta">
            <span class="mkt-header__meta-label">所属机构</span>
            <dict-tag :options="orgOptions" :value="customer.attributionOrg" />
          </div>
        </div>
      </div>

      <div class="mkt-section">
        <span class="mkt-section__title">营销任务</span>
        <span class="mkt-section__count">共 {{ rows.length }} 项</span>
        <el-checkbox v-if="hasExpiredGroup" v-model="showExpired" size="small" class="mkt-section__toggle">显示已过期</el-checkbox>
      </div>

      <div v-loading="loading">
        <el-empty
            v-if="!loading && rows.length === 0"
            :description="hasExpiredGroup ? '暂无有效营销任务，可勾选「显示已过期」查看' : '该客户暂无有效客群'"
        />
        <el-table v-else :data="rows" class="mkt-table" :max-height="440">
          <el-table-column label="产品" min-width="130">
            <template #default="{ row }">
              <span class="mkt-product__name">{{ row.targetBusiness || row.groupName || '综合营销' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="营销建议" min-width="300">
            <template #default="{ row }">
              <div class="mkt-advice">
                <el-tooltip placement="top" effect="light" :disabled="!row.marketingGuide">
                  <template #content>
                    <div class="mkt-pop">{{ row.marketingGuide }}</div>
                  </template>
                  <span class="mkt-clamp">{{ row.marketingGuide || '-' }}</span>
                </el-tooltip>
                <el-link
                    v-if="row.marketingGuide"
                    :underline="false"
                    type="primary"
                    icon="DocumentCopy"
                    class="mkt-advice__copy"
                    v-copyText="row.marketingGuide"
                    v-copyText:callback="copyTextSuccess"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="最新意向" min-width="110">
            <template #default="{ row }">
              <dict-tag v-if="row.latestFeedback" :options="productFeedbackOptions" :value="row.latestFeedback" />
              <span v-else class="mkt-subtext">暂无</span>
            </template>
          </el-table-column>
          <el-table-column label="最新意向更新时间" min-width="150">
            <template #default="{ row }">{{ row.feedbackDate ? parseTime(row.feedbackDate, '{y}-{m}-{d}') : '-' }}</template>
          </el-table-column>
          <el-table-column label="客群名称" min-width="150">
            <template #default="{ row }">{{ row.groupName || '-' }}</template>
          </el-table-column>
          <el-table-column label="客群有效期截止日" min-width="140">
            <template #default="{ row }">{{ row.validEnd ? parseTime(row.validEnd, '{y}-{m}-{d}') : '长期' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="MarketingDetailDialog">
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { customerGroups } from '@/api/szhl/crm/contactRecord'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'

defineProps({
  // 兼容父组件已有传参，详情展示直接使用行数据中的 portraitTagList。
  featureTags: {
    type: Array,
    default: () => []
  }
})

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const { crm_customer_level: levelOptions, crm_product_feedback: productFeedbackOptions } = proxy.useDict('crm_customer_level', 'crm_product_feedback')

const visible = ref(false)
const loading = ref(false)
const groups = ref([])
const showExpired = ref(false)
const customer = reactive({
  customerName: '',
  customerNo: '',
  customerLevel: '',
  phone: '',
  attributionManager: '',
  attributionOrg: '',
  portraitTagList: []
})

const portraitTags = computed(() => {
  return Array.isArray(customer.portraitTagList)
    ? customer.portraitTagList.map(tag => tag?.tagName).filter(Boolean)
    : []
})
const hasExpiredGroup = computed(() => groups.value.some(group => isGroupExpired(group)))
// 营销任务行：一产品一客群一行；默认隐藏已过期，有效在前、再按产品名排序
const rows = computed(() => {
  return groups.value
    .filter(group => showExpired.value || !isGroupExpired(group))
    .slice()
    .sort((a, b) => {
      const ea = isGroupExpired(a)
      const eb = isGroupExpired(b)
      if (ea !== eb) return ea ? 1 : -1
      return String(a.targetBusiness || a.groupName || '').localeCompare(String(b.targetBusiness || b.groupName || ''), 'zh')
    })
})

function formatUser(value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function parseDateEndValue(value) {
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

function isGroupExpired(row) {
  if (!row || !row.validEnd) return false
  return parseDateEndValue(row.validEnd) < Date.now()
}

function copyTextSuccess() {
  proxy.$modal.msgSuccess('已复制营销建议')
}

function reset() {
  loading.value = false
  groups.value = []
  showExpired.value = false
  Object.assign(customer, {
    customerName: '',
    customerNo: '',
    customerLevel: '',
    phone: '',
    attributionManager: '',
    attributionOrg: '',
    portraitTagList: []
  })
}

function open(row) {
  if (!row || !row.customerId) return
  reset()
  Object.assign(customer, {
    customerName: row.customerName || '',
    customerNo: row.customerNo || '',
    customerLevel: row.customerLevel || '',
    phone: row.contactPhone || '',
    attributionManager: row.attributionManager || '',
    attributionOrg: row.attributionOrg || '',
    portraitTagList: row.portraitTagList || []
  })
  loading.value = true
  visible.value = true
  customerGroups(row.customerId).then(res => {
    groups.value = res.data || []
  }).finally(() => {
    loading.value = false
  })
}

defineExpose({ open })
</script>

<style scoped>
.mkt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  padding: 8px 4px 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.mkt-header__left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.mkt-avatar {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 26px;
}

.mkt-header__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mkt-header__name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.mkt-header__contact {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
}

.mkt-header__cell {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #606266;
}

.mkt-header__right {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 2px;
}

.mkt-header__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.mkt-header__meta-label {
  flex: 0 0 auto;
  color: #909399;
}

.mkt-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.mkt-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.mkt-section__title {
  position: relative;
  padding-left: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.mkt-section__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

.mkt-section__count {
  color: #909399;
  font-size: 13px;
}

.mkt-section__toggle {
  margin-left: auto;
}

.mkt-table {
  width: 100%;
}

.mkt-product__name {
  font-weight: 600;
  color: #303133;
}

.mkt-subtext {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
}

.mkt-advice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.mkt-advice__copy {
  flex: 0 0 auto;
  margin-top: 1px;
}

.mkt-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  color: #303133;
  cursor: pointer;
  word-break: break-word;
}

.mkt-pop {
  max-width: 360px;
  max-height: 320px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>
