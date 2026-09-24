<template>
  <div class="enterprise-360-page">
    <div class="enterprise-container">
      <!-- 页面头部 -->
      <header class="page-header" v-loading="isSectionLoading('bootstrap')">
        <h1>企业360视图</h1>
        <div class="header-content">
          <div class="customer-info">
            <div class="info-item">
              <label>客户名称：</label>
              <span>{{ customer.customerName }}</span>
            </div>
            <div class="info-item">
              <label>客户内码：</label>
              <span>{{ customer.customerInnerNo }}</span>
            </div>
            <div class="info-item">
              <label>客户号：</label>
              <span>{{ customer.customerNo }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="reminder-bar">
        <div class="reminder-title">⏰ 提醒事件：</div>
        <div class="reminder-item">
          <span class="reminder-label">近30日到期：</span>
          贷款到期 <span class="reminder-num">{{ dueReminder.loanDueCount }}</span> 笔，合同到期
          <span class="reminder-num">{{ dueReminder.contractDueCount }}</span> 笔
        </div>
      </div>

      <nav class="top-nav" aria-label="企业360导航">
        <button
          v-for="tab in topTabs"
          :key="tab.id"
          type="button"
          class="top-nav-item"
          :class="{ active: activeNav === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="main-layout">
        <div class="content-area">
          <!-- 基本信息 -->
          <section v-show="isSectionVisible('basic')" id="section-basic" class="content-section" v-loading="isSectionLoading('basic')">
            <div class="section-header">
              <div class="section-title">基本信息</div>
              <span class="section-note">取数口径：核心+工商表数据</span>
            </div>
            <div v-if="isSectionError('basic') || isSectionError('corporateProfile')" class="section-error">部分数据加载失败</div>
            <table class="info-table">
              <tbody>
                <tr v-for="(row, index) in basicInfoRows" :key="index">
                  <template v-if="row.full">
                    <th>{{ row.label }}</th>
                    <td colspan="3" :class="row.className" v-loading="row.type === 'tags' && isSectionLoading('portraitTags')">
                      <template v-if="row.type === 'tags'">
                        <span v-if="isSectionError('portraitTags')" class="section-inline-error">加载失败</span>
                        <span
                          v-for="tag in basicTags"
                          :key="tag.label"
                          :class="['tag-item', tag.type]"
                        >{{ tag.label }}</span>
                      </template>
                      <template v-else>{{ displayValue(row.value) }}</template>
                    </td>
                  </template>
                  <template v-else>
                    <th>{{ row[0].label }}</th>
                    <td :class="[row[0].className, cellNavClass(row[0])]" @click="handleCellNav(row[0])">
                      <SensitiveValue :label="row[0].label" :value="row[0].value" />
                    </td>
                    <th>{{ row[1].label }}</th>
                    <td :class="[row[1].className, cellNavClass(row[1])]" @click="handleCellNav(row[1])">
                      <SensitiveValue :label="row[1].label" :value="row[1].value" />
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- 股东信息 -->
          <section v-show="isSectionVisible('shareholder')" id="section-shareholder" class="content-section">
            <div class="section-header">
              <div class="section-title">股东信息</div>
              <span class="section-note">取数口径：大信贷平台股东数据</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>股东名称</th>
                    <th>证件号</th>
                    <th>认缴出资金额</th>
                    <th>占比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="shareholderRows.length === 0">
                    <td colspan="4" class="empty-cell">暂无数据</td>
                  </tr>
                  <!-- 股东证件号暂不绑定跳转：股东可能为自然人/法人，需待股东数据源接通后按证件类型区分个人/对公 -->
                  <tr v-for="(row, index) in shareholderRows" :key="index">
                    <td>{{ displayValue(row.name) }}</td>
                    <td><SensitiveValue label="证件号" :value="row.certNo" /></td>
                    <td>{{ displayValue(row.amount) }}</td>
                    <td>{{ displayValue(row.ratio) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 关联信息 -->
          <section v-show="isSectionVisible('relation')" id="section-relation" class="content-section" v-loading="isSectionLoading('relations')">
            <div class="section-header">
              <div class="section-title">关联信息</div>
              <span class="section-note">取数口径：客户归属关联数据</span>
            </div>
            <div v-if="isSectionError('relations')" class="section-error">加载失败</div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>主客</th>
                    <th>客户名称</th>
                    <th>客户内码</th>
                    <th>客户号</th>
                    <th>黑灰名单</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="basicRelationRows.length === 0">
                    <td colspan="5" class="empty-cell">暂无数据</td>
                  </tr>
                  <tr v-for="(row, index) in basicRelationRows" :key="index">
                    <td>{{ displayValue(row.mainFlag) }}</td>
                    <td>{{ displayValue(row.customerName) }}</td>
                    <td>{{ displayValue(row.customerInnerNo) }}</td>
                    <td :class="{ 'blue-text': isNavigableNo(row.customerNo) }" @click="openViewByNo(row.customerNo, undefined, row.customerName)">{{ displayValue(row.customerNo) }}</td>
                    <td>{{ displayValue(row.blackList) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 产品粘合度 -->
          <section v-show="isSectionVisible('product')" id="section-product" class="content-section" v-loading="isSectionLoading('productStatus')">
            <div class="section-header">
              <div class="section-title">产品粘合度</div>
              <div class="legend header-legend">
                <div class="legend-item">
                  <span class="legend-color legend-green"></span>
                  <span>已存在</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color legend-white"></span>
                  <span>未开通</span>
                </div>
              </div>
            </div>

            <div v-if="isSectionError('productStatus')" class="section-error">加载失败</div>
            <template v-else>
              <div class="stats-grid">
                <div v-for="item in productStats" :key="item.label" :class="['stat-card', item.type]">
                  <div class="stat-value">{{ item.value }}</div>
                  <div class="stat-label">{{ item.label }}</div>
                </div>
              </div>

              <div class="product-grid">
                <div
                  v-for="item in productItems"
                  :key="item.name"
                  :class="['product-item', item.state]"
                >
                  <div class="product-name">{{ item.name }}</div>
                </div>
              </div>
            </template>
          </section>

          <!-- 产品量化信息 -->
          <section v-show="isSectionVisible('product-quant')" id="section-product-quant" class="content-section" v-loading="isSectionLoading('productMetrics')">
            <div class="section-header">
              <div class="section-title">产品量化信息</div>
              <span class="section-note">统计口径：全行 ※ 单位：笔、万元</span>
            </div>
            <div v-if="isSectionError('productMetrics')" class="section-error">加载失败</div>
            <table v-else class="info-table">
              <tbody>
                <tr v-for="(row, index) in productMeasureRows" :key="index">
                  <th>{{ row[0].label }}</th>
                  <td :colspan="row.length === 1 ? 3 : 1">{{ displayValue(row[0].value) }}</td>
                  <template v-if="row[1]">
                    <th>{{ row[1].label }}</th>
                    <td>{{ displayValue(row[1].value) }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- 其余明细板块（数据驱动） -->
          <section
            v-for="section in detailSections"
            v-show="isSectionVisible(section.id)"
            :id="'section-' + section.id"
            :key="section.id"
            class="content-section"
            v-loading="isDetailSectionLoading(section)"
          >
            <div class="section-header">
              <div class="section-title">{{ section.title }}</div>
              <div class="section-header-right">
                <el-checkbox
                  v-if="section.onlyMainCustomer"
                  :model-value="Boolean(sectionOnlyMainCustomer[section.id])"
                  size="small"
                  @change="handleOnlyMainCustomerChange(section, $event)"
                >仅查看当前客户本身</el-checkbox>
                <span v-if="section.note" class="section-note">{{ section.note }}</span>
              </div>
            </div>
            <div v-if="isDetailSectionError(section)" class="section-error">加载失败</div>
            <div v-else-if="section.type === 'historyDebt'" class="history-debt-panel">
              <div :ref="setHistoryDebtChartRef" class="history-debt-chart"></div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th v-for="column in section.columns" :key="column">{{ column }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="section.rows.length === 0">
                      <td :colspan="section.columns.length" class="empty-cell">暂无数据</td>
                    </tr>
                    <tr
                      v-for="(row, rowIndex) in section.rows"
                      :key="rowIndex"
                      :class="{ 'row-abnormal': isFiveFormAbnormalRow(section, row) }"
                    >
                      <td v-for="(column, cellIndex) in section.columns" :key="column">
                        <span v-if="isStatusCell(row[cellIndex])" :class="['tag', row[cellIndex].className]">
                          {{ row[cellIndex].text }}
                        </span>
                        <SensitiveValue v-else :label="column" :value="row[cellIndex]" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <template v-if="section.type === 'yearlyArrears'">
                    <tr>
                      <th rowspan="2">客户名称</th>
                      <th v-for="year in historyArrearsYears" :key="year" colspan="3">{{ year }}年</th>
                    </tr>
                    <tr>
                      <template v-for="year in historyArrearsYears" :key="year">
                        <th>贷款余额</th>
                        <th>欠息总额</th>
                        <th>欠息总月数</th>
                      </template>
                    </tr>
                  </template>
                  <tr v-else>
                    <th
                      v-for="(column, columnIndex) in section.columns"
                      :key="column"
                      :class="{ sortable: isSortableColumn(section, columnIndex) }"
                      @click="handleSortClick(section, columnIndex)"
                    >
                      <span>{{ column }}</span>
                      <span v-if="isSortableColumn(section, columnIndex)" class="sort-icon">{{ getSortIcon(section, columnIndex) }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="getDisplayRows(section).length === 0">
                    <td :colspan="section.columns.length" class="empty-cell">暂无数据</td>
                  </tr>
                  <tr
                    v-for="(row, rowIndex) in getDisplayRows(section)"
                    :key="rowIndex"
                    :class="{ 'row-abnormal': isFiveFormAbnormalRow(section, row) }"
                  >
                    <template v-if="section.type === 'yearlyArrears'">
                      <td>{{ displayValue(row.customerName) }}</td>
                      <template v-for="year in historyArrearsYears" :key="year">
                        <td>{{ displayValue(getYearlyArrears(row, year, 'loanBalance')) }}</td>
                        <td>{{ displayValue(getYearlyArrears(row, year, 'overdueInterestTotal')) }}</td>
                        <td>{{ displayValue(getYearlyArrears(row, year, 'overdueMonths')) }}</td>
                      </template>
                    </template>
                    <template v-else>
                      <td v-for="(column, cellIndex) in section.columns" :key="column">
                        <span v-if="isStatusCell(row[cellIndex])" :class="['tag', row[cellIndex].className]">
                          {{ row[cellIndex].text }}
                        </span>
                        <span v-else-if="section.plainColumns?.includes(cellIndex)">{{ displayValue(row[cellIndex]) }}</span>
                        <SensitiveValue v-else :label="column" :value="row[cellIndex]" />
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
            <common-pagination
              v-if="section.id === 'loan' && corpLoanTotal > 0"
              :total="corpLoanTotal"
              v-model:page="corpLoanPage"
              v-model:limit="corpLoanSize"
              :page-sizes="[10, 20, 50, 100]"
              @pagination="handleCorpLoanPageChange"
            />
          </section>

          <!-- 历史触达时间线 -->
          <section v-show="isSectionVisible('timeline')" id="section-timeline" class="content-section" v-loading="isSectionLoading('touchTimeline')">
            <div class="section-header">
              <div class="section-title">历史触达时间线</div>
              <span class="section-note">取数口径：智慧互联+PAD ※ 最近3年数据</span>
            </div>
            <div v-if="isSectionError('touchTimeline')" class="section-error">加载失败</div>
            <ContactTimeline v-else :contacts="contacts" />
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="CrmEnterprise360">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import {
  getEnterprise360ArrearsHistory,
  getEnterprise360AttributionHistory,
  getEnterprise360BadLoans,
  getEnterprise360BankAccounts,
  getEnterprise360Basic,
  getEnterprise360Bootstrap,
  getEnterprise360ContactPoints,
  getEnterprise360CorporateCreditHistory,
  getEnterprise360CorporateProfile,
  getEnterprise360InternalContracts,
  getEnterprise360InternalGuarantees,
  getEnterprise360PortraitTags,
  getEnterprise360ProductMetrics,
  getEnterprise360ProductStatus,
  getEnterprise360Relations,
  getEnterprise360TouchTimeline,
  queryEnterprise360ExternalLoansByCustomer,
  queryEnterprise360InternalLoans
} from '@/api/szhl/crm/enterprise360'
import { useCustomer360Nav } from '@/views/szhl/crm/composables/useCustomer360Nav'
import ContactTimeline from '@/views/szhl/crm/components/ContactTimeline.vue'
import SensitiveValue from '@/views/szhl/crm/components/SensitiveValue.vue'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const route = useRoute()
const viewCustomerNo = getQueryValue(route.params.customerNo) || getQueryValue(route.query.customerNo)
const viewCustomerName = getQueryValue(route.query.customerName)
const { openViewByNo, openViewByCert } = useCustomer360Nav()
let loadToken = 0
let corpContractQueryToken = 0
let corpGuaranteeQueryToken = 0
let corpExternalLoanQueryToken = 0
const activeNav = ref('all')
const sectionStates = ref(createSectionStates())

const base = ref({})
const db2 = ref({})
const portraitTags = ref([])
const changes = ref([])
const contacts = ref([])
const relationRows = ref([])
const historyArrearsRows = ref([])
const corpLoanRows = ref([])
const corpLoanBalanceTotal = ref(0)
const corpLoanTotal = ref(0)
const corpLoanPage = ref(1)
const corpLoanSize = ref(10)
let corpLoanQueryToken = 0
const corpLoanSortFields = [
  null, 'contractNo', 'iouNum', 'loanAcct', 'staidate', 'stacdate', 'loanAmt',
  'loanBalance', 'stafcls5', 'staerate', 'loanCha', 'productName'
]
const corpContractRows = ref([])
const corpGuaranteeRows = ref([])
const corpGuaranteeContractTotal = ref({ amt: 0, bal: 0 })
const corpCreditSummaryRows = ref([])
const corpCreditRows = ref([])
const corpCreditBalanceTotal = ref('--')
const corpHistoryDebtRows = ref([])
const corpAccountRows = ref([])
const badLoanRows = ref([])
const corporateProducts = ref([])
const corporateProfile = ref({})
const historyDebtChartRef = ref(null)
let historyDebtChart = null
let historyDebtPendingRender = false
let historyDebtResizeObserver = null
// 股东信息待企业数据源口径接通后补充
const shareholderRows = ref([])

const topTabs = [
  { id: 'all', label: '全部' },
  { id: 'basic', label: '基本' },
  { id: 'relation', label: '关联' },
  { id: 'product', label: '产品' },
  { id: 'contact', label: '联系' },
  { id: 'account', label: '开户' },
  { id: 'internal', label: '行内' },
  { id: 'external', label: '行外' },
  { id: 'history', label: '历史' }
]

const tabSectionMap = {
  basic: ['basic', 'shareholder'],
  relation: ['relation'],
  product: ['product', 'product-quant'],
  contact: ['address', 'phone'],
  account: ['account'],
  internal: ['contract', 'loan', 'internal-guarantee'],
  external: ['credit', 'credit-detail'],
  history: ['history-debt', 'history-arrears', 'manager', 'bad', 'timeline']
}

const detailSectionStateMap = {
  account: 'bankAccounts',
  address: 'contactPoints',
  phone: 'contactPoints',
  contract: 'internalContracts',
  loan: 'internalLoans',
  'internal-guarantee': 'internalGuarantees',
  credit: 'externalLoans',
  'credit-detail': 'externalLoans',
  'history-debt': 'corporateCreditHistory',
  'history-arrears': 'arrearsHistory',
  manager: 'attributionHistory',
  bad: 'badLoans'
}

// 近5年：前4年为整年，当年为 T+1 报告期
const historyArrearsYears = (() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => String(current - 4 + i))
})()

const isBlacklist = computed(() => isFlag(db2.value && db2.value.isBlack))
const dueReminder = computed(() => ({
  loanDueCount: base.value.loanDueCount || base.value.dueLoanCount || 0,
  contractDueCount: base.value.contractDueCount || base.value.dueContractCount || 0
}))

const customer = computed(() => {
  const b = base.value || {}
  const d = db2.value || {}
  const p = corporateProfile.value || {}
  const customerNo = b.customerNo || viewCustomerNo
  return {
    ...b,
    customerName: b.customerName || d.custName || viewCustomerName || '--',
    customerInnerNo: b.customerId || d.custIsn || '--',
    customerNo: customerNo || '--',
    certType: p.certTypeNm || p.certType || d.idType || '--',
    certNo: p.certNo || d.idNo || '--',
    spouseName: p.legalNm || b.spouseName,
    legalPersonIdNo: p.legalIdNo || '',
    legalPersonSpouse: p.spouseName || '',
    spouseIdNo: p.spouseIdId || '',
    establishDate: p.issuDate || '--',
    enterpriseType: p.custTypeNm || '--',
    industry: p.industryNm || '--',
    registeredCapital: p.regCap ?? '--',
    paidCapital: p.actlCap ?? '--',
    // 工商登记四字段保持现有 V2 回填后的 Master/Bootstrap 最终口径。
    administrativeDivision: b.administrativeDivision,
    businessScope: b.businessScope,
    registrationAuthority: b.registrationAuthority,
    registrationStatus: b.registrationStatus,
    managerInfo: compactJoin([formatOrg(b.attributionOrg), b.managerName || formatUser(b.managerId)], '/')
  }
})

// 产品粘合度：标志位统一取归属宽表 crm_customer_data_tag；企业网银=qyhl、商业保险=bx（业务确认同源）；定活通暂无数据源留空
const PRODUCT_DEFS = [
  {
    name: '产品粘合度',
    products: [
      { name: '基本户', flag: 'basicAccount' },
      { name: '一般户', flag: 'generalAccount' },
      { name: '专用户', flag: 'specialAccount' },
      { name: '外汇户', flag: 'foreignExchangeAccount' },
      { name: '有效合同', flag: 'validContract' },
      { name: '有贷户', flag: 'loanCustomerFlag' },
      { name: '理财户', flag: 'wealthFlag' },
      { name: '法代合同', flag: 'legalContract' },
      { name: '电费代扣', flag: 'electricWithhold' },
      { name: '水费代扣', flag: 'waterWithhold' },
      { name: '税费代扣', flag: 'taxFlag' },
      { name: '贵金属', flag: 'preciousMetal' },
      { name: '保险', flag: 'insurance' },
      { name: '企业互联', flag: 'corpEbank' },
      { name: '云薪酬', flag: 'cloudSalary' },
      { name: '云报销', flag: 'cloudExpense' },
      { name: '云财务', flag: 'cloudAccount' },
      { name: '财资宝', flag: 'caizibao' },
      { name: '票据宝', flag: 'piaojubao' },
      { name: '收付宝', flag: 'shoufubao' },
      { name: 'POS商户', flag: 'posFlag' },
      { name: '一码通', flag: 'yimatong' },
      { name: '定期户', flag: 'timeDeposit' },
      { name: '定活通' },
      { name: '大额存单', flag: 'largeDepositCert' },
      { name: '企业网银', flag: 'corpEbank' },
      { name: '商业保险', flag: 'insurance' },
      { name: '数字人民币', flag: 'digitalRmbFlag' },
      { name: '代发工资', flag: 'salaryAgentFlag' }
    ]
  }
]

const productCategories = computed(() => {
  const b = base.value || {}
  return PRODUCT_DEFS.map(category => ({
    name: category.name,
    products: category.products.map(item => {
      if (item.kind === 'blacklist') {
        return { name: item.name, kind: 'blacklist', state: isBlacklist.value ? 'blacklist' : '' }
      }
      return { name: item.name, state: isFlag(b[item.flag]) ? 'has-data' : 'no-data' }
    })
  }))
})

const productItems = computed(() => productCategories.value.flatMap(category => category.products).filter(item => item.kind !== 'blacklist'))
const productCount = computed(() => productItems.value.filter(item => item.state === 'has-data').length)
const totalProducts = computed(() => productItems.value.length)
const coverageRate = computed(() => totalProducts.value ? `${Math.round((productCount.value / totalProducts.value) * 100)}%` : '0%')

const productStats = computed(() => [
  { value: productCount.value, label: '已开通产品数', type: '' },
  { value: totalProducts.value - productCount.value, label: '待开通产品', type: 'warning' },
  { value: coverageRate.value, label: '产品覆盖率', type: '' }
])

const basicInfoRows = computed(() => {
  const row = customer.value
  return [
    [
      { label: '客户名称', value: row.customerName },
      { label: '客户内码', value: row.customerInnerNo }
    ],
    [
      { label: '证件类型', value: row.certType },
      { label: '证件号', value: row.certNo }
    ],
    [
      { label: '成立日期', value: row.establishDate },
      { label: '行政区划', value: row.administrativeDivision }
    ],
    [
      { label: '注册资本', value: formatCapital(row.registeredCapital) },
      { label: '实缴资本', value: formatCapital(row.paidCapital) }
    ],
    [
      { label: '企业类型', value: row.enterpriseType },
      { label: '所属行业', value: row.industry }
    ],
    [
      { label: '登记机关', value: row.registrationAuthority },
      { label: '登记状态', value: row.registrationStatus }
    ],
    [
      { label: '法定代表人', value: row.spouseName },
      { label: '身份证号', value: row.legalPersonIdNo, nav: { cert: row.legalPersonIdNo, type: 'person', name: row.spouseName } }
    ],
    [
      { label: '法代人配偶', value: row.legalPersonSpouse },
      { label: '身份证号', value: row.spouseIdNo, nav: { cert: row.spouseIdNo, type: 'person', name: row.legalPersonSpouse } }
    ],
    { label: '经营范围', value: row.businessScope, full: true, className: 'long-cell' },
    { label: '特征画像标签', type: 'tags', full: true, className: 'tag-cell' },
    [
      { label: '更新日期', value: basicUpdateTime.value },
      { label: '管户机构/人', value: row.managerInfo }
    ]
  ]
})

const basicUpdateTime = computed(() => proxy.parseTime(customer.value.updateTime, '{y}-{m}-{d} {h}:{i}') || '--')

const basicTags = computed(() => {
  return sortPortraitTags(portraitTags.value)
    .map(tag => ({ label: tag.name, type: portraitNatureType(tag.nature) }))
    .filter(tag => tag.label)
})

const basicRelationRows = computed(() => {
  if (isSectionError('relations')) {
    return []
  }
  if (relationRows.value.length) {
    return relationRows.value.map(item => ({
      mainFlag: item.mainCustomerFlag === '1' ? '是' : '',
      customerName: item.customerName,
      customerInnerNo: item.customerId,
      customerNo: item.customerNo,
      blackList: ''
    }))
  }
  return buildCurrentRelationRows()
})

// jsl_usd、POS 和一码通交易金额源单位为万元，直接展示；其余金额沿用页面既有换算。
// 产品量化指标按 V2 返回的全部企业产品行汇总，避免同一客户多条产品记录丢失。
const productMeasureRows = computed(() => {
  const rows = corporateProducts.value || []
  const sum = key => sumPresentValues(...rows.map(row => row[key]))
  return [
    [{ label: '贷款年日均', value: sum('dkrj') }, { label: '当年代发笔数', value: sum('dfgzbs') }],
    [{ label: '贷款余额', value: sum('dkye') }, { label: '当年代发总额', value: sum('dfgzje') }],
    [
      { label: '收单结算笔数', value: sumPresentValues(sum('posjybs'), sum('ymtjybs')) },
      { label: '收单结算金额', value: toWan(sumPresentValues(sum('posjyje'), sum('ymtjyje'))) }
    ],
    [{ label: '当年电费总额', value: toWan(sum('dfje')) }, { label: '当年水费总额', value: toWan(sum('sfje')) }],
    [{ label: '当年税费总额', value: '暂缺' }, { label: '外汇结算量（万美元）', value: sum('jslUsd') }],
    [{ label: '存款年日均', value: sum('ckrj') }, { label: '数币年交易笔数', value: sum('sbjybs') }],
    [{ label: '存款余额', value: sum('ckye') }, { label: '数币年交易金额', value: toWan(sum('sbjyje')) }]
  ]
})

const detailSections = computed(() => {
  const b = base.value || {}

  return [
    {
      id: 'account',
      title: '开户信息',
      columns: ['开户银行名称', '账号', '账户性质', '数据来源'],
      rows: corpAccountRows.value
    },
    {
      id: 'address',
      title: '地址信息',
      columns: ['地址类型', '属主', '地址信息', '更新日期', '更新人', '数据来源'],
      rows: [
        ['户籍地址', '', b.householdAddress, '', '', 'Hive客户联系表'],
        ['联系地址', '', b.contactAddress, '', '', '征信等']
      ].filter(row => row[2])
    },
    {
      id: 'phone',
      title: '电话信息',
      columns: ['电话类型', '属主', '电话号码', '更新日期', '更新人', '数据来源'],
      rows: b.contactPhone ? [['联系电话', b.customerName, b.contactPhone, '', '', '']] : []
    },
    {
      id: 'contract',
      title: '行内有效合同',
      onlyMainCustomer: true,
      note: `取数口径：关联客户组 ※ 合同总额/用信余额：${toWan(corpGuaranteeContractTotal.value.amt) || '--'}/${toWan(corpGuaranteeContractTotal.value.bal) || '--'}万元`,
      columns: ['客户名称', '合同号', '担保方式', '合同日期', '到期日期', '合同金额', '用信笔数', '用信余额', '机构号', '责任人'],
      rows: corpContractRows.value
    },
    {
      id: 'loan',
      title: '行内贷款明细',
      onlyMainCustomer: true,
      note: `取数口径：关联客户组 ※ 借款余额：${toWan(corpLoanBalanceTotal.value) || '--'}万元`,
      sortable: true,
      defaultSortPriority: [5, 4, 1],
      // 借据号无需脱敏，直接显示明文（前面插入了"客户名称"列，原索引 +1）
      plainColumns: [2],
      columns: ['客户名称', '合同号', '借据号', '贷款账号', '借款日期', '到期日期', '借款金额(万元)', '借款余额(万元)', '五级形态', '借款利率', '借款渠道', '产品名称'],
      rows: corpLoanRows.value
    },
    {
      id: 'internal-guarantee',
      title: '行内对外担保',
      onlyMainCustomer: true,
      note: '取数口径：关联客户组内成员作为担保人对外提供的担保',
      columns: ['客户名称', '被担保人', '被担保客户号', '合同号', '担保方式', '借款日期', '到期日期', '合同金额', '借款余额', '五级形态', '机构号', '责任人'],
      rows: corpGuaranteeRows.value
    },
    {
      id: 'credit',
      title: '所有银行负债汇总',
      note: '取数口径：当前客户及关联客户组 ※ 报告日期：--',
      columns: ['总机构数', '总授信额度', '正常账户数', '正常金额', '关注账户数', '关注金额', '不良账户数', '不良金额'],
      rows: corpCreditSummaryRows.value
    },
    {
      id: 'credit-detail',
      title: '所有银行负债明细',
      onlyMainCustomer: true,
      note: `取数口径：当前客户及关联客户组 ※ 贷款余额：${displayValue(corpCreditBalanceTotal.value)}万元`,
      columns: ['客户名称', '授信机构', '业务种类', '账户编号', '借款日期', '到期日期', '借款金额', '担保', '借款余额', '五级分类', '应还款额(元)', '逾期总额(元)', '还款金额(元)', '还款方式', '利率预测', '信息日期'],
      rows: corpCreditRows.value
    },
    {
      id: 'history-debt',
      title: '历史负债展示',
      note: '取数口径：企业征信报告负债历史，金额单位：万元',
      type: 'historyDebt',
      columns: ['报告日期', '全部账户数', '全部余额', '关注账户数', '关注余额', '不良账户数', '不良余额', '逾期户数', '逾期总额', '状态'],
      rows: corpHistoryDebtRows.value
    },
    {
      id: 'history-arrears',
      title: '历史欠息',
      note: '取数口径：近5年行内数据；欠息贷款余额、欠息总额取年末值，欠息总月数为当年累计',
      type: 'yearlyArrears',
      columns: ['客户名称', ...historyArrearsYears.flatMap(year => [`${year}年贷款余额`, `${year}年欠息总额`, `${year}年欠息总月数`])],
      rows: historyArrearsRows.value
    },
    {
      id: 'manager',
      title: '历史管户变更',
      note: '取数口径：最近5年数据',
      columns: ['变更日期', '原管户机构', '原管户经理', '新管户机构', '新管户经理', '变更原因', '更新人'],
      rows: changes.value.map(item => [
        proxy.parseTime(item.changeDate, '{y}-{m}-{d}'),
        formatOrg(item.oldOrg),
        formatUser(item.oldManager),
        formatOrg(item.newOrg),
        formatUser(item.newManager),
        item.changeReason,
        item.changeSource
      ])
    },
    {
      id: 'bad',
      title: '不良建档',
      note: '取数口径：不良贷款建档数据',
      columns: ['建档日期', '类型', '合同号', '合同日期', '到期日期', '建档金额', '当前余额', '管贷机构', '管贷人'],
      rows: badLoanRows.value.map(item => [
        item.filingDate,
        item.badLoanNature,
        item.contractNo,
        item.contractStartDate,
        item.contractEndDate,
        formatAmount(item.filingAmount),
        formatAmount(item.currentBalance),
        item.managementInstitution,
        item.managementPerson
      ])
    }
  ]
})

function createSectionStates() {
  return {
    bootstrap: 'idle',
    basic: 'idle',
    contactPoints: 'idle',
    portraitTags: 'idle',
    corporateProfile: 'idle',
    productStatus: 'idle',
    productMetrics: 'idle',
    bankAccounts: 'idle',
    internalContracts: 'idle',
    internalLoans: 'idle',
    internalGuarantees: 'idle',
    relations: 'idle',
    externalLoans: 'idle',
    corporateCreditHistory: 'idle',
    badLoans: 'idle',
    attributionHistory: 'idle',
    arrearsHistory: 'idle',
    touchTimeline: 'idle'
  }
}

function setSectionState(name, state) {
  sectionStates.value[name] = state
}

function isSectionLoading(name) {
  return sectionStates.value[name] === 'loading'
}

function isSectionError(name) {
  return sectionStates.value[name] === 'error'
}

function isDetailSectionLoading(section) {
  return isSectionLoading(detailSectionStateMap[section.id])
}

function isDetailSectionError(section) {
  return isSectionError(detailSectionStateMap[section.id])
}

function markSectionsState(names, state) {
  names.forEach(name => setSectionState(name, state))
}

function markDependentSectionsState(state) {
  markSectionsState(Object.keys(sectionStates.value).filter(name => name !== 'bootstrap'), state)
}

function isEmptyList(data) {
  return !Array.isArray(data) || data.length === 0
}

async function loadSection(name, token, requestFn, applyFn, emptyFn = isEmptyList) {
  setSectionState(name, 'loading')
  try {
    const response = await requestFn()
    if (token !== loadToken) {
      return { ok: false, stale: true }
    }
    const data = response ? response.data : undefined
    await applyFn(data)
    if (token !== loadToken) {
      return { ok: false, stale: true }
    }
    setSectionState(name, emptyFn(data) ? 'empty' : 'ready')
    return { ok: true, data }
  } catch (error) {
    if (token === loadToken) {
      setSectionState(name, 'error')
    }
    return { ok: false, error }
  }
}

async function loadView() {
  const token = ++loadToken
  resetView()
  const customerNo = viewCustomerNo
  if (!customerNo) {
    setSectionState('bootstrap', 'empty')
    markDependentSectionsState('empty')
    return
  }

  setSectionState('bootstrap', 'loading')
  let bootstrap
  try {
    const response = await getEnterprise360Bootstrap(customerNo)
    if (token !== loadToken) return
    bootstrap = response.data || {}
    if (!bootstrap.customerId) {
      setSectionState('bootstrap', 'error')
      markDependentSectionsState('error')
      return
    }
    base.value = bootstrap
    setSectionState('bootstrap', 'ready')
  } catch (error) {
    if (token === loadToken) {
      setSectionState('bootstrap', 'error')
      markDependentSectionsState('error')
    }
    return
  }

  const customerId = bootstrap.customerId
  const pending = []
  const basicPromise = loadSection(
    'basic',
    token,
    () => getEnterprise360Basic(customerId),
    data => applyBasicInfo(data),
    data => !data || !data.customerId
  )
  pending.push(basicPromise)
  pending.push(loadSection('contactPoints', token,
    () => getEnterprise360ContactPoints(customerId),
    data => applyContactInfo(data || [])))
  pending.push(loadSection('portraitTags', token,
    () => getEnterprise360PortraitTags(customerId),
    data => { portraitTags.value = normalizePortraitTags(data || []) }))
  pending.push(loadSection('corporateProfile', token,
    () => getEnterprise360CorporateProfile(customerNo, customerId),
    data => { corporateProfile.value = data || {} },
    data => !data))
  pending.push(loadSection('productStatus', token,
    () => getEnterprise360ProductStatus(customerId),
    data => { base.value = { ...base.value, ...(data || {}) } },
    () => false))
  pending.push(loadSection('productMetrics', token,
    () => getEnterprise360ProductMetrics(customerNo),
    data => { corporateProducts.value = Array.isArray(data) ? data : [] }))
  pending.push(loadSection('bankAccounts', token,
    () => getEnterprise360BankAccounts(customerId),
    data => applyCorpAccountRows(data || [])))
  pending.push(loadCorpContracts(token))
  pending.push(loadCorpLoanPage(token))
  pending.push(loadCorpGuarantees(token))
  // 行外负债按关联客户组取数，只依赖 customerId，与 basic 并行加载
  pending.push(loadCorpExternalLoans(token))
  pending.push(loadSection('relations', token,
    () => getEnterprise360Relations(customerId),
    data => { relationRows.value = data || [] }))
  pending.push(loadSection('corporateCreditHistory', token,
    () => getEnterprise360CorporateCreditHistory(customerNo),
    async data => {
      corpHistoryDebtRows.value = buildCorpHistoryDebtRows((data && data.historyDebts) || [])
      await nextTick()
      if (token === loadToken) renderHistoryDebtChart()
    },
    data => !data || !(data.historyDebts || []).length))
  pending.push(loadSection('badLoans', token,
    () => getEnterprise360BadLoans(customerNo),
    data => { badLoanRows.value = data || [] }))
  pending.push(loadSection('attributionHistory', token,
    () => getEnterprise360AttributionHistory(customerNo),
    data => { changes.value = data || [] }))
  pending.push(loadSection('arrearsHistory', token,
    () => getEnterprise360ArrearsHistory(customerNo),
    data => { historyArrearsRows.value = buildHistoryArrearsRows(data || []) }))
  pending.push(loadSection('touchTimeline', token,
    () => getEnterprise360TouchTimeline(customerNo),
    data => { contacts.value = data || [] }))

  await Promise.allSettled(pending)
}

function resetView() {
  sectionStates.value = createSectionStates()
  base.value = {}
  db2.value = {}
  portraitTags.value = []
  changes.value = []
  contacts.value = []
  relationRows.value = []
  historyArrearsRows.value = []
  corpLoanRows.value = []
  corpLoanBalanceTotal.value = 0
  corpLoanTotal.value = 0
  corpLoanPage.value = 1
  corpLoanQueryToken++
  corpContractQueryToken++
  corpGuaranteeQueryToken++
  corpContractRows.value = []
  corpGuaranteeRows.value = []
  corpGuaranteeContractTotal.value = { amt: 0, bal: 0 }
  corpCreditSummaryRows.value = []
  corpCreditRows.value = []
  corpCreditBalanceTotal.value = '--'
  corpHistoryDebtRows.value = []
  corpAccountRows.value = []
  badLoanRows.value = []
  corporateProducts.value = []
  corporateProfile.value = {}
  shareholderRows.value = []
  sectionOnlyMainCustomer.value = { contract: false, loan: false, 'internal-guarantee': false, 'credit-detail': false }
  corpExternalLoanQueryToken++
  disposeHistoryDebtChart()
}

function normalizePortraitTags(tags) {
  if (!Array.isArray(tags)) {
    return []
  }
  return tags.map(tag => ({
    id: String(tag.tagId || tag.id || ''),
    name: tag.name || tag.tagName || tag.label || '',
    nature: tag.nature || 'neutral'
  }))
}

function sortPortraitTags(tags) {
  const order = { negative: 0, positive: 1, neutral: 2 }
  return [...tags].sort((a, b) => (order[a.nature] ?? order.neutral) - (order[b.nature] ?? order.neutral))
}

function portraitNatureType(nature) {
  if (nature === 'negative') {
    return 'reverse'
  }
  if (nature === 'neutral') {
    return 'neutral'
  }
  return 'positive'
}

function applyBasicInfo(info) {
  const data = info || {}
  db2.value = {
    ...data,
    custIsn: data.customerId,
    custName: data.customerName,
    custType: data.customerType
  }
}

function applyContactInfo(rows) {
  const phone = rows.find(row => String(row.contactType) === '1')
  const address = rows.find(row => String(row.contactType) !== '1')
  base.value = {
    ...base.value,
    contactPhone: base.value.contactPhone || (phone && phone.contactDesc),
    contactAddress: base.value.contactAddress || (address && address.contactDesc)
  }
}

function applyCreditRows(info) {
  let balanceTotal = 0
  const rows = info.custLoans || []
  corpCreditSummaryRows.value = [[
    info.orgNum,
    info.lineOfCreditBal,
    info.normalNUm,
    info.normalBal,
    info.overdueNUm,
    info.overdueBal,
    info.debtsNUm,
    info.debtsBal
  ]]
  corpCreditRows.value = rows.map(row => {
    balanceTotal += Number(row.balance) || 0
    return [
      row.ownerName,
      row.brName,
      row.busType,
      row.acctNo,
      row.startDt,
      row.endDt,
      row.loanAmount,
      row.guaranType,
      row.balance,
      row.fiveAdjust,
      row.lastRepayAmount,
      row.overdueAmount,
      row.lastRepaidAmount,
      row.lastRepaidMethod,
      '',
      row.infoDate || row.reportDate
    ]
  })
  corpCreditBalanceTotal.value = rows.length ? Number(balanceTotal.toFixed(2)) : '--'
}

function applyCorpAccountRows(rows) {
  corpAccountRows.value = (rows || []).map(row => [
    row.bankName,
    row.accountNo,
    row.accountType,
    '核心系统'
  ])
}

// 元转万元（保留两位），空值返回空串
function toWan(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : Number((number / 10000).toFixed(2))
}

function formatCapital(value) {
  const amount = toWan(value)
  return amount === '' || amount === '--' ? '--' : `${amount}万元`
}

function sumPresentValues(...values) {
  const presentValues = values.filter(value => value !== null && value !== undefined && value !== '')
  return presentValues.length
    ? presentValues.reduce((total, value) => total + Number(value), 0)
    : ''
}

// 利率保留两位小数并带百分号
function formatRate(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : `${number.toFixed(2)}%`
}

// 行内贷款明细（JZFY.CUST_LOAN_DETAIL，来自 enterprise360/internal-loans）
// 取数口径：关联客户组；后端金额单位为元，此处 toWan 统一 /10000 转万元展示
// row 数组第一列为客户名称，对应表格 columns 中的"客户名称"
function applyCorpLoanRows(rows) {
  corpLoanRows.value = (rows || []).map(row => {
    return [
      row.custName,
      row.contractNo,
      row.iouNum,
      row.loanAcct,
      proxy.parseTime(row.staidate, '{y}-{m}-{d}'),
      proxy.parseTime(row.stacdate, '{y}-{m}-{d}'),
      toWan(row.loanAmt),
      toWan(row.loanBalance),
      row.stafcls5,
      formatRate(row.staerate),
      row.loanCha,
      row.productName
    ]
  })
}

// 行内贷款独立分页请求；查询 token 防止快速翻页、排序和筛选时旧响应覆盖新页。
async function loadCorpLoanPage(viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++corpLoanQueryToken
  const sortState = sectionSortState.value.loan
  setSectionState('internalLoans', 'loading')
  try {
    const response = await queryEnterprise360InternalLoans({
      customerId,
      onlyMainCustomer: Boolean(sectionOnlyMainCustomer.value.loan),
      pageNum: corpLoanPage.value,
      pageSize: corpLoanSize.value,
      sortField: sortState ? corpLoanSortFields[sortState.columnIndex] : undefined,
      sortDirection: sortState && sortState.direction
    })
    if (token !== corpLoanQueryToken || viewToken !== loadToken) return
    const page = response.data || {}
    applyCorpLoanRows(page.rows || [])
    corpLoanTotal.value = Number(page.total) || 0
    corpLoanBalanceTotal.value = Number(page.balanceTotal) || 0
    setSectionState('internalLoans', page.rows && page.rows.length ? 'ready' : 'empty')
  } catch {
    if (token === corpLoanQueryToken && viewToken === loadToken) {
      corpLoanRows.value = []
      corpLoanTotal.value = 0
      corpLoanBalanceTotal.value = 0
      setSectionState('internalLoans', 'error')
    }
  }
}

// 行内有效合同（enterprise360/internal-contracts）
function applyCorpContractRows(rows) {
  corpGuaranteeContractTotal.value = { amt: 0, bal: 0 }
  corpContractRows.value = (rows || []).map(row => {
    corpGuaranteeContractTotal.value.amt += Number(row.contractAmt) || 0
    corpGuaranteeContractTotal.value.bal += Number(row.loanBalance) || 0
    return [
      row.custName,
      row.contractNo,
      row.securityType,
      proxy.parseTime(row.startDate, '{y}-{m}-{d}'),
      proxy.parseTime(row.endDate, '{y}-{m}-{d}'),
      toWan(row.contractAmt),
      row.loanCount,
      toWan(row.loanBalance),
      row.orgNo,
      formatUser(row.dutyPerson)
    ]
  })
}

// 行内对外担保（enterprise360/internal-guarantees）
// row 数组第一列为担保人客户名称，对应表格 columns 中的"客户名称"
function applyCorpGuaranteeRows(rows) {
  corpGuaranteeRows.value = (rows || []).map(row => [
    row.guarantorName,
    row.borrowerName,
    row.borrowerNo,
    row.contractNo,
    row.securityType,
    proxy.parseTime(row.startDate, '{y}-{m}-{d}'),
    proxy.parseTime(row.endDate, '{y}-{m}-{d}'),
    toWan(row.contractAmt),
    toWan(row.loanBalance),
    row.fiveForm,
    row.orgNo,
    formatUser(row.dutyPerson)
  ])
}

// 行外负债：关联客户组口径（customerId+onlyMainCustomer），归属名称由后端返回；
// 汇总与明细共享一次查询。独立 token 防止开关快速切换时旧响应覆盖新结果。
async function loadCorpExternalLoans(viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++corpExternalLoanQueryToken
  setSectionState('externalLoans', 'loading')
  try {
    const response = await queryEnterprise360ExternalLoansByCustomer(
      customerId, Boolean(sectionOnlyMainCustomer.value['credit-detail']))
    if (token !== corpExternalLoanQueryToken || viewToken !== loadToken) return
    const data = (response && response.data) || {}
    applyCreditRows(data)
    setSectionState('externalLoans', (data.custLoans || []).length ? 'ready' : 'empty')
  } catch (error) {
    if (token === corpExternalLoanQueryToken && viewToken === loadToken) {
      setSectionState('externalLoans', 'error')
    }
  }
}

async function loadCorpContracts(viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) return
  const token = ++corpContractQueryToken
  setSectionState('internalContracts', 'loading')
  try {
    const response = await getEnterprise360InternalContracts(
      customerId, Boolean(sectionOnlyMainCustomer.value.contract))
    if (token !== corpContractQueryToken || viewToken !== loadToken) return
    const rows = response.data || []
    applyCorpContractRows(rows)
    setSectionState('internalContracts', rows.length ? 'ready' : 'empty')
  } catch {
    if (token === corpContractQueryToken && viewToken === loadToken) {
      setSectionState('internalContracts', 'error')
    }
  }
}

async function loadCorpGuarantees(viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) return
  const token = ++corpGuaranteeQueryToken
  setSectionState('internalGuarantees', 'loading')
  try {
    const response = await getEnterprise360InternalGuarantees(
      customerId, Boolean(sectionOnlyMainCustomer.value['internal-guarantee']))
    if (token !== corpGuaranteeQueryToken || viewToken !== loadToken) return
    const rows = response.data || []
    applyCorpGuaranteeRows(rows)
    setSectionState('internalGuarantees', rows.length ? 'ready' : 'empty')
  } catch {
    if (token === corpGuaranteeQueryToken && viewToken === loadToken) {
      setSectionState('internalGuarantees', 'error')
    }
  }
}

function buildCurrentRelationRows() {
  const b = base.value || {}
  if (!b.customerId && !b.customerName && !b.customerNo) {
    return []
  }
  return [{
    mainFlag: b.mainCustomerFlag === '1' ? '是' : '',
    customerName: b.customerName,
    customerInnerNo: b.customerId,
    customerNo: b.customerNo,
    blackList: isBlacklist.value ? '是' : ''
  }]
}

function setHistoryDebtChartRef(el) {
  historyDebtChartRef.value = el
}

function setActiveTab(tabId) {
  activeNav.value = tabId
  nextTick(() => {
    requestAnimationFrame(() => renderHistoryDebtChart())
  })
}

function isSectionVisible(sectionId) {
  if (activeNav.value === 'all') {
    return true
  }
  return (tabSectionMap[activeNav.value] || []).includes(sectionId)
}

function isStatusCell(cell) {
  return cell && typeof cell === 'object' && cell.text
}

function displayValue(value) {
  if (value === 0) {
    return 0
  }
  return value || '--'
}

// 五级形态为「正常/未激活/关注」时不标红；其余异常状态整行标红；空值不标
function isFiveFormAbnormal(value) {
  if (value === undefined || value === null || value === '' || value === '--') {
    return false
  }
  return !['正常', '未激活', '关注'].includes(String(value).trim())
}

// 数据驱动表格：按五级形态/分类列判断该行是否异常
function isFiveFormAbnormalRow(section, row) {
  if (!section || !Array.isArray(section.columns) || !Array.isArray(row)) {
    return false
  }
  const idx = section.columns.findIndex(column => column === '五级形态' || column === '五级分类')
  if (idx < 0) {
    return false
  }
  return isFiveFormAbnormal(row[idx])
}

function isEmptyNav(value) {
  return value === undefined || value === null || value === '' || value === '--'
}

// 关联客户号是否可跳（有值才呈现手型）
function isNavigableNo(value) {
  return !isEmptyNav(value)
}

// 基本信息 cell 跳转：nav.no 直接按客户号跳，nav.cert+type 拼前缀跳；值为空则不可点
function cellNavigable(cell) {
  if (!cell || !cell.nav) return false
  const key = cell.nav.no !== undefined ? cell.nav.no : cell.nav.cert
  return !isEmptyNav(key)
}

function cellNavClass(cell) {
  return cellNavigable(cell) ? 'blue-text' : ''
}

function handleCellNav(cell) {
  if (!cellNavigable(cell)) return
  const name = cell.nav.name
  if (cell.nav.no !== undefined) {
    openViewByNo(cell.nav.no, undefined, name)
  } else {
    openViewByCert(cell.nav.cert, cell.nav.type, name)
  }
}

function buildCorpHistoryDebtRows(rows) {
  return rows.map(row => [
    row.rptDate,
    row.deptAcctNum,
    formatAmount(row.deptBal),
    row.attAcctNum,
    formatAmount(row.attBal),
    row.badAcctNum,
    formatAmount(row.badBal),
    row.dueAcctNum,
    formatAmount(row.dueAmt),
    buildDebtStatus(row)
  ])
}

function buildDebtStatus(row) {
  if (Number(row.badAcctNum) > 0 || Number(row.badBal) > 0) {
    return { text: '不良', className: 'tag-error' }
  }
  if (Number(row.dueAcctNum) > 0 || Number(row.dueAmt) > 0) {
    return { text: '逾期', className: 'tag-warning' }
  }
  if (Number(row.attAcctNum) > 0 || Number(row.attBal) > 0) {
    return { text: '关注', className: 'tag-warning' }
  }
  return { text: '正常', className: 'tag-success' }
}

function formatAmount(value) {
  if (value === 0 || value === '0') {
    return '0.00'
  }
  if (!value) {
    return ''
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : number.toFixed(2)
}

function renderHistoryDebtChart() {
  const el = historyDebtChartRef.value
  if (!el) return
  const w = el.offsetWidth
  const h = el.offsetHeight
  if (w === 0 || h === 0) {
    historyDebtPendingRender = true
    if (!historyDebtResizeObserver && window.ResizeObserver) {
      historyDebtResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0 && historyDebtPendingRender) {
            renderHistoryDebtChart()
            break
          }
        }
      })
      historyDebtResizeObserver.observe(el)
    }
    return
  }
  historyDebtPendingRender = false
  if (!corpHistoryDebtRows.value.length) {
    disposeHistoryDebtChart()
    return
  }
  if (!historyDebtChart) {
    historyDebtChart = echarts.init(el)
  }
  const rows = [...corpHistoryDebtRows.value].sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  historyDebtChart.setOption({
    animation: false,
    grid: { top: 36, right: 28, bottom: 30, left: 48 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: rows.map(row => row[0]),
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      splitLine: { lineStyle: { color: '#edf0f5' } }
    },
    series: [{
      name: '全部余额',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      data: rows.map(row => Number(row[2]) || 0),
      lineStyle: { width: 3, color: '#1677ff' },
      itemStyle: { color: '#1677ff' },
      areaStyle: { color: 'rgba(22, 119, 255, 0.10)' }
    }]
  })
  historyDebtChart.resize()
}

function disposeHistoryDebtChart() {
  if (historyDebtChart) {
    historyDebtChart.dispose()
    historyDebtChart = null
  }
}

function getYearlyArrears(row, year, key) {
  return row && row.yearly && row.yearly[year] ? row.yearly[year][key] : ''
}

// 历史欠息：后端按报告期返回近5年数据，前端按年份转换为表格结构
function buildHistoryArrearsRows(rows) {
  const yearly = {}
  ;(rows || []).forEach(row => {
    const year = String(row.reportDate || '').slice(0, 4)
    if (!year) {
      return
    }
    yearly[year] = {
      loanBalance: row.loanBalance,
      overdueInterestTotal: row.overdueInterestTotal,
      overdueMonths: row.overdueMonths
    }
  })
  if (Object.keys(yearly).length === 0) {
    return []
  }
  return [{
    customerName: base.value.customerName || db2.value.custName || '--',
    yearly
  }]
}

function isFlag(value) {
  return value === '是' || value === '1' || value === 'Y'
}

function formatOrg(value) {
  return proxy.selectDictLabel(orgOptions.value, value) || value || ''
}

function formatUser(value) {
  return formatUserDisplayName(managerOptions.value, value, '')
}

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

function compactJoin(values, separator) {
  return values.filter(Boolean).join(separator)
}

// 表格列排序：仅对 section.sortable 的板块启用；支持到期日期等字符串值的本地化比较
const sectionSortState = ref({})
// 「仅查看当前客户本身」勾选状态：按 section.id 记录，仅配置了 onlyMainCustomer 的板块展示复选框
const sectionOnlyMainCustomer = ref({ contract: false, loan: false, 'internal-guarantee': false, 'credit-detail': false })

function isSortableColumn(section, columnIndex) {
  if (section.id === 'loan' && !corpLoanSortFields[columnIndex]) {
    return false
  }
  return section.sortable && isSortableDataColumn(section, columnIndex)
}

// 排序仅对数据列生效：跳过两面三刀的状态/标签列，仅按列的展示文本排序
function isSortableDataColumn(section, columnIndex) {
  if (!section || !Array.isArray(section.rows) || section.rows.length === 0) {
    return false
  }
  const value = section.rows[0][columnIndex]
  return value === undefined || value === null || typeof value !== 'object'
}

function getSortIcon(section, columnIndex) {
  const state = sectionSortState.value[section.id]
  if (!state || state.columnIndex !== columnIndex || !state.direction) {
    return '⇅'
  }
  return state.direction === 'asc' ? '↑' : '↓'
}

function handleSortClick(section, columnIndex) {
  if (!isSortableColumn(section, columnIndex)) {
    return
  }
  const current = sectionSortState.value[section.id]
  let next = null
  if (!current || current.columnIndex !== columnIndex) {
    next = { columnIndex, direction: 'asc' }
  } else if (current.direction === 'asc') {
    next = { columnIndex, direction: 'desc' }
  }
  sectionSortState.value = { ...sectionSortState.value, [section.id]: next }
  if (section.id === 'loan') {
    corpLoanPage.value = 1
    loadCorpLoanPage()
  }
}

function handleOnlyMainCustomerChange(section, checked) {
  sectionOnlyMainCustomer.value = {
    ...sectionOnlyMainCustomer.value,
    [section.id]: Boolean(checked)
  }
  if (section.id === 'contract') {
    loadCorpContracts()
  } else if (section.id === 'loan') {
    corpLoanPage.value = 1
    loadCorpLoanPage()
  } else if (section.id === 'internal-guarantee') {
    loadCorpGuarantees()
  } else if (section.id === 'credit-detail') {
    loadCorpExternalLoans()
  }
}

function handleCorpLoanPageChange({ page, limit } = {}) {
  if (page !== undefined) {
    corpLoanPage.value = page
  }
  if (limit !== undefined) {
    corpLoanSize.value = limit
  }
  loadCorpLoanPage()
}

function getDisplayRows(section) {
  let rows = section.rows
  if (section.id === 'loan') {
    return rows
  }
  const state = section.sortable ? sectionSortState.value[section.id] : null
  if (!state || !state.direction) {
    return rows
  }
  const priority = section.defaultSortPriority || []
  const sorted = [...rows]
  sorted.sort((a, b) => compareRow(a, b, state, priority))
  return sorted
}

function compareRow(a, b, state, priority) {
  const result = compareCell(a[state.columnIndex], b[state.columnIndex])
  if (result !== 0) {
    return state.direction === 'asc' ? result : -result
  }
  // 主排序键相同：按板块默认优先级依次比较（通常为到期/借款/借据号，保持稳定输出）
  for (const index of priority) {
    if (index === state.columnIndex) {
      continue
    }
    const fallback = compareCell(a[index], b[index])
    if (fallback !== 0) {
      return fallback
    }
  }
  return 0
}

// 字符串本地化比较：兼容日期"YYYY-MM-DD"、编号、金额文本
function compareCell(left, right) {
  const a = left === undefined || left === null ? '' : String(left)
  const b = right === undefined || right === null ? '' : String(right)
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b, 'zh-CN', { numeric: true })
}

onMounted(loadView)

onBeforeUnmount(() => {
  loadToken++
  corpLoanQueryToken++
  corpContractQueryToken++
  corpGuaranteeQueryToken++
  disposeHistoryDebtChart()
  if (historyDebtResizeObserver) {
    historyDebtResizeObserver.disconnect()
    historyDebtResizeObserver = null
  }
})
</script>

<style scoped>
.enterprise-360-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  overflow-y: auto;
  background: #f0f2f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.enterprise-360-page * {
  box-sizing: border-box;
}

.enterprise-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  max-width: 1400px;
  min-height: 0;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  flex-shrink: 0;
  position: relative;
  margin-bottom: 0;
  padding: 20px 92px 20px 20px;
  color: #fff;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-header h1 {
  margin: 0 0 15px;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.customer-info {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item label {
  min-width: 80px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.info-item span {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.reminder-bar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 0;
  padding: 10px 24px;
  color: #8c6d1f;
  font-size: 13px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 0;
}

.reminder-title {
  color: #d48806;
  font-weight: 600;
  white-space: nowrap;
}

.reminder-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.reminder-label {
  color: #8c6d1f;
  font-weight: 600;
}

.reminder-num {
  color: #d48806;
  font-weight: 600;
}

.reminder-item.risk,
.reminder-item.risk .reminder-label {
  color: #cf1322;
}

/* 主体布局 */
.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.top-nav {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 2px;
  padding: 0 20px;
  overflow-x: auto;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-nav-item {
  min-width: 0;
  height: auto;
  padding: 10px 20px;
  color: #1890ff;
  font-size: 14px;
  white-space: nowrap;
  background: transparent;
  border: 0;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.top-nav-item:hover {
  color: #40a9ff;
  background: #f5f7fa;
}

.top-nav-item.active {
  color: #1890ff;
  font-weight: 500;
  background: transparent;
  border-bottom-color: #1890ff;
}

/* 内容区域 */
.content-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
}

.content-section {
  margin-bottom: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 0;
}

.subsection-header {
  margin-top: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

.section-title::before {
  width: 4px;
  height: 20px;
  background: #1890ff;
  border-radius: 2px;
  content: '';
}

.section-note {
  color: #666;
  font-size: 12px;
  font-weight: 400;
}

/* 板块标题右侧工具区：过滤复选框 + 取数口径说明 */
.section-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-table {
  width: 100%;
  table-layout: fixed;
  font-size: 12px;
  border-collapse: collapse;
}

.info-table th,
.info-table td {
  height: 30px;
  padding: 6px 8px;
  text-align: center;
  border: 1px solid #e8e8e8;
}

.info-table th {
  width: 180px;
  color: #333;
  font-weight: 600;
  background: #fafafa;
}

.info-table td {
  word-break: break-word;
  background: #fff;
}

.info-table .long-cell {
  height: 50px;
  text-align: left;
  line-height: 1.6;
}

.info-table .tag-cell {
  height: 50px;
  text-align: left;
}

.tag-item {
  display: inline-block;
  margin: 6px 4px;
  padding: 4px 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, #c21313c7 0%, #f0cd08 100%);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(194, 147, 19, 0.637);
  cursor: default;
  transition: all 0.3s;
}

.tag-item.neutral {
  background: linear-gradient(135deg, #9a93d656 0%, #1b7bbb 100%);
  box-shadow: 0 2px 4px rgba(27, 123, 187, 0.4);
}

.tag-item.positive {
  background: linear-gradient(135deg, #c21313c7 0%, #f05108 100%);
  box-shadow: 0 2px 4px rgba(194, 19, 19, 0.4);
}

.tag-item.reverse {
  background: linear-gradient(135deg, #03db76c7 0%, #4ebb23 100%);
  box-shadow: 0 2px 4px rgba(78, 187, 35, 0.4);
}

.tag-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

/* 信息卡片网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.info-card {
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  transition: all 0.2s;
}

.info-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.12);
}

.info-card.empty {
  background: #fff;
  border: 1px dashed #d9d9d9;
}

.info-card.full-row {
  grid-column: 1 / -1;
}

.info-card label {
  display: block;
  margin-bottom: 4px;
  color: #999;
  font-size: 11px;
  font-weight: 500;
}

.info-card .value {
  display: block;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  word-break: break-word;
}

.info-card .value.highlight {
  color: #1890ff;
  font-weight: 600;
}

.info-card .value.placeholder {
  color: #bbb;
  font-size: 12px;
  font-style: italic;
}

.data-freshness {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #999;
  font-size: 11px;
}

/* 数据表格 */
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  height: 30px;
  padding: 6px 8px;
  text-align: center;
  border: 1px solid #e8e8e8;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 10;
  color: #333;
  font-weight: 600;
  background: #fafafa;
}

.data-table tbody tr {
  transition: all 0.2s;
}

.data-table tbody tr:hover {
  background: #f5f7fa;
}

.data-table tbody tr.row-abnormal td {
  color: #cf1322;
}

.table-wrap {
  padding-bottom: 1px;
}

.data-table tbody tr:last-child td,
.info-table tbody tr:last-child th,
.info-table tbody tr:last-child td {
  border-bottom: 1px solid #e8e8e8;
}

.blue-text {
  color: #1890ff;
  cursor: pointer;
}

.empty-cell {
  color: #909399;
  text-align: center !important;
}

.section-error {
  padding: 24px 12px;
  color: #909399;
  text-align: center;
}

.section-inline-error {
  color: #909399;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.stat-card {
  padding: 12px 15px;
  text-align: center;
  background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(82, 196, 26, 0.15);
}

.stat-card.warning {
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
  border-color: #ffe58f;
}

.stat-card.warning:hover {
  box-shadow: 0 3px 8px rgba(250, 173, 20, 0.15);
}

.stat-value {
  margin-bottom: 4px;
  color: #52c41a;
  font-size: 22px;
  font-weight: bold;
}

.stat-card.warning .stat-value {
  color: #faad14;
}

.stat-label {
  color: #666;
  font-size: 11px;
  font-weight: 500;
}

/* 产品粘合度 */
.product-section {
  margin-bottom: 12px;
}

.product-category {
  margin-bottom: 16px;
}

.category-header {
  margin-bottom: 8px;
  padding-left: 8px;
  color: #666;
  font-size: 13px;
  font-weight: 600;
  border-left: 3px solid #1890ff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 1px;
  margin-bottom: 15px;
  overflow: hidden;
  background: #e8e8e8;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.product-item {
  position: relative;
  padding: 12px 8px;
  text-align: center;
  background: #fff;
  border: 0;
  border-radius: 0;
  transition: all 0.3s;
}

.product-item:hover {
  opacity: 0.85;
}

.product-item.has-data {
  color: #fff;
  background-color: #52c41a;
}

.product-item.no-data {
  color: #666;
  background-color: #fff;
}

.product-item.blacklist {
  color: #fff;
  background-color: #ff4d4f;
}

.product-name {
  color: #666;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.product-item.has-data .product-name {
  color: #fff;
}

.product-item.blacklist .product-name {
  color: #fff;
}

/* 图例 */
.legend {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 12px;
}

.header-legend {
  margin: 0;
  padding: 0;
  background: transparent;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.legend-green {
  background: #52c41a;
}

.legend-white {
  background: #fff;
}

.legend-red {
  background: #ff4d4f;
}

.history-debt-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-debt-chart {
  width: 100%;
  height: 260px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
}

/* 标签 */
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-success {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.tag-error {
  color: #ff4d4f;
  background: #fff2f0;
  border: 1px solid #ffa39e;
}

.tag-warning {
  color: #faad14;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.btn {
  padding: 2px 12px;
  font-size: 11px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* 滚动条 */
.enterprise-360-page ::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.enterprise-360-page ::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 4px;
}

.enterprise-360-page ::-webkit-scrollbar-thumb:hover {
  background: #337ecc;
}

.enterprise-360-page ::-webkit-scrollbar-track {
  background: transparent;
}

/* 响应式 */
@media (max-width: 768px) {
  .enterprise-360-page {
    height: calc(100vh - 84px);
  }

  .enterprise-container {
    padding: 20px;
  }

  .top-nav {
    padding: 0 10px;
  }

  .top-nav-item {
    padding: 12px;
    font-size: 13px;
  }

  .customer-info {
    grid-template-columns: 1fr;
  }

  .main-layout {
    flex-direction: column;
    min-height: 0;
  }

  .content-area {
    overflow-y: visible;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* 表头列排序 */
.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  color: #1890ff;
}

.data-table th .sort-icon {
  display: inline-block;
  margin-left: 4px;
  color: #909399;
  font-size: 11px;
}

.data-table th.sortable:hover .sort-icon {
  color: #1890ff;
}
</style>
