<template>
  <div class="customer-360-page">
    <div class="customer-container">
      <header class="page-header" v-loading="isSectionLoading('bootstrap')">
        <h1>个人360视图</h1>
        <div class="header-content">
          <div class="customer-info">
            <div class="info-item">
              <label>客户名称：</label>
              <span>{{ customer.customerName }}</span>
            </div>
            <div class="info-item">
              <label>客户内码：</label>
              <span>{{ customer.customerId }}</span>
            </div>
            <div class="info-item">
              <label>客户号：</label>
              <span>{{ customer.customerNo }}</span>
            </div>
            <div class="info-item">
              <label>客户信贷准入：</label>
              <el-tooltip
                :disabled="!customerCreditAccess.reason"
                effect="dark"
                placement="bottom"
                popper-class="credit-access-tooltip"
              >
                <span :class="['status-badge', customerCreditAccess.className]">{{ customerCreditAccess.label }}</span>
                <template #content>
                  <div class="credit-access-tooltip-content">禁入原因：{{ customerCreditAccess.reason }}</div>
                </template>
              </el-tooltip>
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

      <nav class="top-nav" aria-label="客户360导航">
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
          <section v-show="isSectionVisible('basic')" id="section-basic" class="content-section" v-loading="isSectionLoading('basic')">
            <div class="section-header">
              <div class="section-title">客户基础信息</div>
              <span class="section-note">取数：核心+大信贷+客户归属数据</span>
            </div>

            <div v-if="isSectionError('basic')" class="section-error">加载失败</div>
            <table v-else class="info-table">
              <tbody>
                <tr v-for="(row, index) in basicInfoRows" :key="index">
                  <template v-if="row.full">
                    <th>{{ row.label }}</th>
                    <td colspan="3" class="tag-cell" v-loading="isSectionLoading('portraitTags')">
                      <span v-if="isSectionError('portraitTags')" class="section-inline-error">加载失败</span>
                      <template v-else>
                        <span
                          v-for="tag in basicTags"
                          :key="tag.label"
                          :class="['tag-item', tag.type]"
                        >{{ tag.label }}</span>
                      </template>
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

          <section v-show="isSectionVisible('extended')" id="section-extended" class="content-section" v-loading="isSectionLoading('basic')">
            <div class="section-header">
              <div class="section-title">客户基础扩展信息</div>
              <span class="section-note">取数：大信贷</span>
            </div>

            <div v-if="isSectionError('basic')" class="section-error">加载失败</div>
            <table v-else class="info-table">
              <tbody>
                <tr v-for="(row, index) in extensionInfoRows" :key="index">
                  <template v-if="row.type === 'identity'">
                    <th>客户标识</th>
                    <td colspan="3">
                      <div class="checkbox-group">
                        <label
                          v-for="item in identityOptions"
                          :key="item"
                          class="checkbox-item"
                          :class="{ checked: checkedIdentity.includes(item) }"
                        >
                          <input type="checkbox" :checked="checkedIdentity.includes(item)" disabled>
                          {{ item }}
                        </label>
                      </div>
                    </td>
                  </template>
                  <template v-else>
                    <th>{{ row[0].label }}</th>
                    <td>{{ displayValue(row[0].value) }}</td>
                    <th>{{ row[1].label }}</th>
                    <td>{{ displayValue(row[1].value) }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </section>

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
                  v-for="item in productGridItems"
                  :key="item.label"
                  :class="['product-item', item.state]"
                >
                  <div class="product-name">{{ item.label }}</div>
                </div>
              </div>
            </template>
          </section>

          <section v-show="isSectionVisible('product-grid')" id="section-product-grid" class="content-section" v-loading="isSectionLoading('productMetrics')">
            <div class="section-header">
              <div class="section-title">产品量化信息</div>
              <span class="section-note">统计口径：全行 ※ 单位：笔、万元</span>
            </div>
            <div v-if="isSectionError('productMetrics')" class="section-error">加载失败</div>
            <table v-else class="info-table">
              <tbody>
                <tr v-for="(row, index) in productMeasureRows" :key="index">
                  <th>{{ row[0].label }}</th>
                  <td>{{ displayValue(row[0].value) }}</td>
                  <th>{{ row[1].label }}</th>
                  <td>{{ displayValue(row[1].value) }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-show="isSectionVisible('address')" id="section-address" class="content-section" v-loading="isSectionLoading('contactPoints')">
            <div class="section-header">
              <div class="section-title">地址信息</div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>地址类型</th>
                    <th>客户名称</th>
                    <th>地址信息</th>
                    <th>更新日期</th>
                    <th>更新人</th>
                    <th>数据来源</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="addressRows.length === 0">
                    <td colspan="6" class="empty-cell">{{ sectionEmptyText('contactPoints') }}</td>
                  </tr>
                  <tr v-for="(item, index) in addressRows" :key="index">
                    <td>{{ item.type }}</td>
                    <td>{{ displayValue(item.owner) }}</td>
                    <td>{{ displayValue(item.address) }}</td>
                    <td>{{ displayValue(item.updateTime) }}</td>
                    <td>{{ formatUser(item.updateBy, '--') }}</td>
                    <td>{{ displayValue(item.source) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('phone')" id="section-phone" class="content-section" v-loading="isSectionLoading('contactPoints')">
            <div class="section-header">
              <div class="section-title">电话信息</div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>电话类型</th>
                    <th>客户名称</th>
                    <th>电话号码</th>
                    <th>更新日期</th>
                    <th>更新人</th>
                    <th>数据来源</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="phoneRows.length === 0">
                    <td colspan="6" class="empty-cell">{{ sectionEmptyText('contactPoints') }}</td>
                  </tr>
                  <tr v-for="(item, index) in phoneRows" :key="index">
                    <td>{{ item.type }}</td>
                    <td>{{ displayValue(item.owner) }}</td>
                    <td><SensitiveValue label="电话号码" :value="item.phone" /></td>
                    <td>{{ displayValue(item.updateTime) }}</td>
                    <td>{{ formatUser(item.updateBy, '--') }}</td>
                    <td>{{ displayValue(item.source) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('internal-manage')" id="section-internal-manage" class="content-section" v-loading="isSectionLoading('internalContracts')">
            <div class="section-header">
              <div class="section-title">行内有效合同</div>
              <div class="section-header-right">
                <el-checkbox
                  :model-value="contractOnlyMainCustomer"
                  size="small"
                  @change="handleContractOnlyMainCustomerChange"
                >仅查看当前客户本身</el-checkbox>
                <span class="section-note">取数口径：关联客户组（含本人） ※ 合同总额/用信余额：{{ displayValue(bankContractTotal) }}/{{ displayValue(bankContractBalanceTotal) }}万元 ※ 金额单位：万元</span>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>合同号</th>
                    <th>担保方式</th>
                    <th>合同日期</th>
                    <th>到期日期</th>
                    <th>合同金额(万元)</th>
                    <th>用信余额(万元)</th>
                    <th>用信笔数</th>
                    <th>机构号</th>
                    <th>责任人</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="bankContractRows.length === 0">
                    <td colspan="10" class="empty-cell">{{ sectionEmptyText('internalContracts') }}</td>
                  </tr>
                  <tr v-for="(item, index) in bankContractRows" :key="item.contractNo || index">
                    <td>{{ displayValue(item.custName) }}</td>
                    <td><SensitiveValue label="合同号" :value="item.contractNo" /></td>
                    <td>{{ displayValue(item.securityType) }}</td>
                    <td>{{ displayValue(item.startDate) }}</td>
                    <td>{{ displayValue(item.endDate) }}</td>
                    <td>{{ displayValue(item.contractAmt) }}</td>
                    <td>{{ displayValue(item.loanBalance) }}</td>
                    <td>{{ displayValue(item.loanCount) }}</td>
                    <td>{{ displayValue(item.orgNo) }}</td>
                    <td>{{ formatUser(item.dutyPerson, '--') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('internal-detail')" id="section-internal-detail" class="content-section" v-loading="isSectionLoading('internalLoans')">
            <div class="section-header">
              <div class="section-title">行内贷款明细</div>
              <div class="section-header-right">
                <el-checkbox
                  :model-value="bankLoanOnlyMainCustomer"
                  size="small"
                  @change="handleBankLoanOnlyMainCustomerChange"
                >仅查看当前客户本身</el-checkbox>
                <span class="section-note">取数口径：关联客户组（含本人） ※ 共 {{ displayValue(bankLoanTotal) }} 笔</span>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>合同号</th>
                    <th>借据号</th>
                    <th>贷款账号</th>
                    <th>借款日期</th>
                    <th class="sortable" @click="toggleBankLoanSort">
                      <span>到期日期</span>
                      <span class="sort-icon">{{ bankLoanSortIcon }}</span>
                    </th>
                    <th>借款金额(万元)</th>
                    <th>借款余额(万元)</th>
                    <th>五级形态</th>
                    <th>借款利率</th>
                    <th>借款渠道</th>
                    <th>产品名称</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="displayBankLoanRows.length === 0">
                    <td colspan="12" class="empty-cell">{{ sectionEmptyText('internalLoans') }}</td>
                  </tr>
                  <tr
                    v-for="(item, index) in displayBankLoanRows"
                    :key="item.contractNo ? item.contractNo + '-' + item.iouNum : index"
                    :class="{ 'row-abnormal': isFiveFormAbnormal(item.fiveForm) }"
                  >
                    <td>{{ displayValue(item.custName) }}</td>
                    <td><SensitiveValue label="合同号" :value="item.contractNo" /></td>
                    <td>
                      {{ displayValue(item.iouNum) }}
                    </td>
                    <td><SensitiveValue label="贷款账号" :value="item.loanAcct" /></td>
                    <td>{{ displayValue(item.startDate) }}</td>
                    <td>{{ displayValue(item.endDate) }}</td>
                    <td>{{ displayValue(item.loanAmt) }}</td>
                    <td>{{ displayValue(item.loanBalance) }}</td>
                    <td>{{ displayValue(item.fiveForm) }}</td>
                    <td>{{ displayValue(item.rate) }}</td>
                    <td>{{ displayValue(item.loanCha) }}</td>
                    <td>{{ displayValue(item.productName) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <common-pagination
              v-show="displayBankLoanTotal > 0"
              :total="displayBankLoanTotal"
              v-model:page="bankLoanPage"
              v-model:limit="bankLoanSize"
              :page-sizes="[10, 20, 50, 100]"
              @pagination="handleBankLoanPageChange"
            />
          </section>

          <section v-show="isSectionVisible('internal-guarantee')" id="section-internal-guarantee" class="content-section" v-loading="isSectionLoading('internalGuarantees')">
            <div class="section-header">
              <div class="section-title">行内对外担保</div>
              <div class="section-header-right">
                <el-checkbox
                  :model-value="guaranteeOnlyMainCustomer"
                  size="small"
                  @change="handleGuaranteeOnlyMainCustomerChange"
                >仅查看当前客户本身</el-checkbox>
                <span class="section-note">取数口径：关联客户组内成员作为担保人对外提供的担保 ※ 合同总额/余额：{{ displayValue(bankGuaranteeAmtTotal) }}/{{ displayValue(bankGuaranteeBalanceTotal) }}万元 ※ 金额单位：万元</span>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>被担保人</th>
                    <th>被担保客户号</th>
                    <th>合同号</th>
                    <th>担保方式</th>
                    <th>借款日期</th>
                    <th>到期日期</th>
                    <th>合同金额(万元)</th>
                    <th>借款余额(万元)</th>
                    <th>五级形态</th>
                    <th>机构号</th>
                    <th>责任人</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="bankGuaranteeRows.length === 0">
                    <td colspan="12" class="empty-cell">{{ sectionEmptyText('internalGuarantees') }}</td>
                  </tr>
                  <tr
                    v-for="(item, index) in bankGuaranteeRows"
                    :key="item.contractNo ? item.contractNo + '-' + index : index"
                    :class="{ 'row-abnormal': isFiveFormAbnormal(item.fiveForm) }"
                  >
                    <td>{{ displayValue(item.guarantorName) }}</td>
                    <td>{{ displayValue(item.borrowerName) }}</td>
                    <td>{{ displayValue(item.borrowerNo) }}</td>
                    <td><SensitiveValue label="合同号" :value="item.contractNo" /></td>
                    <td>{{ displayValue(item.securityType) }}</td>
                    <td>{{ displayValue(item.startDate) }}</td>
                    <td>{{ displayValue(item.endDate) }}</td>
                    <td>{{ displayValue(item.contractAmt) }}</td>
                    <td>{{ displayValue(item.loanBalance) }}</td>
                    <td>{{ displayValue(item.fiveForm) }}</td>
                    <td>{{ displayValue(item.orgNo) }}</td>
                    <td>{{ formatUser(item.dutyPerson, '--') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('external')" id="section-external" class="content-section" v-loading="isSectionLoading('externalLoans')">
            <div class="section-header">
              <div class="section-title">所有银行负债汇总</div>
              <span class="section-note">取数口径：当前客户及关联客户组 ※ 报告日期：-- ※ 金额单位：万元</span>
            </div>

            <div class="table-wrap">
              <table class="data-table summary-table">
                <thead>
                  <tr>
                    <th rowspan="2">总机构数</th>
                    <th rowspan="2">总授信额度(万元)</th>
                    <th colspan="2">正常</th>
                    <th colspan="2">关注</th>
                    <th colspan="2">可疑</th>
                  </tr>
                  <tr>
                    <th>笔数</th>
                    <th>金额(万元)</th>
                    <th>笔数</th>
                    <th>金额(万元)</th>
                    <th>笔数</th>
                    <th>金额(万元)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isSectionError('externalLoans')">
                    <td colspan="8" class="empty-cell">加载失败</td>
                  </tr>
                  <tr v-else>
                    <td>{{ loanSummary.orgNum }}</td>
                    <td>{{ loanSummary.creditAmount }}</td>
                    <td>{{ loanSummary.normalNum }}</td>
                    <td>{{ loanSummary.normalBal }}</td>
                    <td>{{ loanSummary.overdueNum }}</td>
                    <td>{{ loanSummary.overdueBal }}</td>
                    <td>{{ loanSummary.doubtNum }}</td>
                    <td>{{ loanSummary.doubtBal }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('external-detail')" id="section-external-detail" class="content-section" v-loading="isSectionLoading('externalLoans')">
            <div class="section-header">
              <div class="section-title">所有银行贷款明细</div>
              <div class="section-header-right">
                <el-checkbox
                  :model-value="externalLoanOnlyMainCustomer"
                  size="small"
                  @change="handleExternalLoanOnlyMainCustomerChange"
                >仅查看当前客户本身</el-checkbox>
                <el-checkbox v-model="loanPositiveBalanceOnly" size="small">仅显示余额大于0</el-checkbox>
                <span class="section-note">取数口径：当前客户及关联客户组 ※ 贷款余额：{{ displayValue(loanBalanceTotal) }}万元 ※ 金额单位：万元</span>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>银行</th>
                    <th>业务种类</th>
                    <th>贷款金额(万元)</th>
                    <th>贷款余额(万元)</th>
                    <th>借款日期</th>
                    <th>到期日期</th>
                    <th>担保方式</th>
                    <th>五级分类</th>
                    <th>循环标志</th>
                    <th>利率预测</th>
                    <th>数据日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="displayLoanRows.length === 0">
                    <td colspan="12" class="empty-cell">{{ sectionEmptyText('externalLoans') }}</td>
                  </tr>
                  <tr
                    v-for="(item, index) in displayLoanRows"
                    :key="item.id || index"
                    :class="{ 'row-abnormal': isFiveFormAbnormal(item.fiveAdjust) }"
                  >
                    <td>{{ displayValue(item.owner) }}</td>
                    <td>{{ displayValue(item.bankName) }}</td>
                    <td>{{ displayValue(item.busType) }}</td>
                    <td>{{ displayValue(item.loanAmount) }}</td>
                    <td>{{ displayValue(item.balance) }}</td>
                    <td>{{ displayValue(item.startDate) }}</td>
                    <td>{{ displayValue(item.endDate) }}</td>
                    <td>{{ displayValue(item.guaranType) }}</td>
                    <td>{{ displayValue(item.fiveAdjust) }}</td>
                    <td>{{ displayValue(item.loanType) }}</td>
                    <td>{{ displayValue(item.rate) }}</td>
                    <td>{{ displayValue(item.reportDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('external-credit')" id="section-external-credit" class="content-section" v-loading="isSectionLoading('creditCards')">
            <div class="section-header">
              <div class="section-title">所有银行信用卡</div>
              <div class="section-header-right">
                <el-checkbox
                  :model-value="creditCardOnlyMainCustomer"
                  size="small"
                  @change="handleCreditCardOnlyMainCustomerChange"
                >仅查看当前客户本身</el-checkbox>
                <el-checkbox v-model="creditCardPositiveBalanceOnly" size="small">仅显示余额大于0</el-checkbox>
                <span class="section-note">取数口径：当前客户及关联客户组 ※ 授信/余额：{{ creditCardTotal.creditAmount }}/{{ creditCardTotal.balanceUsed }}万元 ※ 金额单位：万元</span>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>银行</th>
                    <th>授信额度(万元)</th>
                    <th>已用额度(万元)</th>
                    <th>当前逾期期数</th>
                    <th>当前逾期总额(万元)</th>
                    <th>账户状态</th>
                    <th>最近一次还款日期</th>
                    <th>近6月平均使用额(万元)</th>
                    <th>数据日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="displayCreditCardRows.length === 0">
                    <td colspan="10" class="empty-cell">{{ sectionEmptyText('creditCards') }}</td>
                  </tr>
                  <tr v-for="(item, index) in displayCreditCardRows" :key="index"
                      :class="{ 'row-abnormal': isFiveFormAbnormal(item.accountStatus) }"
                  >
                    <td>{{ displayValue(item.owner) }}</td>
                    <td>{{ displayValue(item.bankName) }}</td>
                    <td>{{ displayValue(item.creditAmount) }}</td>
                    <td>{{ displayValue(item.balanceUsed) }}</td>
                    <td>{{ displayValue(item.overdueTimes) }}</td>
                    <td>{{ displayValue(item.overdueAmount) }}</td>
                    <td>{{ displayValue(item.accountStatus) }}</td>
                    <td>{{ displayValue(item.lastRepayDate) }}</td>
                    <td>{{ displayValue(item.avg6mLimit) }}</td>
                    <td>{{ displayValue(item.reportDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('external-loan')" id="section-external-loan" class="content-section" v-loading="isSectionLoading('repaymentResponsibilities')">
            <div class="section-header">
              <div class="section-title">所有银行还款责任/对外担保</div>
              <span class="section-note">取数口径：本人+配偶 ※ 金额单位：万元</span>
            </div>
            <div class="table-wrap">
              <table class="data-table summary-table">
                <thead>
                  <tr>
                    <th>总机构数</th>
                    <th>责任总金额(万元)</th>
                    <th>责任总余额(万元)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isSectionError('repaymentResponsibilities')">
                    <td colspan="3" class="empty-cell">加载失败</td>
                  </tr>
                  <tr v-else>
                    <td>{{ otherLoanSummary.orgNum }}</td>
                    <td>{{ otherLoanSummary.creditAmount }}</td>
                    <td>{{ otherLoanSummary.balance }}</td>
                  </tr>
                </tbody>
              </table>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>银行</th>
                    <th>责任对象</th>
                    <th>责任类型</th>
                    <th>责任金额(万元)</th>
                    <th>责任余额(万元)</th>
                    <th>借款日期</th>
                    <th>到期日期</th>
                    <th>五级分类</th>
                    <th>数据日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="otherLoanRows.length === 0">
                    <td colspan="10" class="empty-cell">{{ sectionEmptyText('repaymentResponsibilities') }}</td>
                  </tr>
                  <tr v-for="(item, index) in otherLoanRows" :key="index">
                    <td>{{ displayValue(item.owner) }}</td>
                    <td>{{ displayValue(item.bankName) }}</td>
                    <td>{{ displayValue(item.loanType) }}</td>
                    <td>{{ displayValue(item.loanerType) }}</td>
                    <td>{{ displayValue(item.loanAmount) }}</td>
                    <td>{{ displayValue(item.balance) }}</td>
                    <td>{{ displayValue(item.startDate) }}</td>
                    <td>{{ displayValue(item.endDate) }}</td>
                    <td>{{ displayValue(item.fiveAdjust) }}</td>
                    <td>{{ displayValue(item.reportDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('asset')" id="section-asset" class="content-section" v-loading="isSectionLoading('assets')">
            <div class="section-header">
              <div class="section-title">资产信息</div>
              <span class="section-note">取数口径：大信贷平台资产明细数据 ※ 资产估值:{{ assetTotalValue }}万元 ※ 金额单位：万元</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>资产类型</th>
                    <th>资产描述</th>
                    <th>评估时间</th>
                    <th>估值(万元)</th>
                    <th>修改柜员</th>
                    <th>修改机构</th>
                    <th>修改日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="assetRows.length === 0">
                    <td colspan="7" class="empty-cell">{{ sectionEmptyText('assets') }}</td>
                  </tr>
                  <tr v-for="item in assetRows" :key="item.assetType">
                    <td>{{ displayValue(item.assetType) }}</td>
                    <td>{{ displayValue(item.assetDesc) }}</td>
                    <td>{{ displayValue(item.evaluationDate) }}</td>
                    <td>{{ displayValue(item.evaluationValue) }}</td>
                    <td>{{ displayValue(item.updateBy) }}</td>
                    <td>{{ displayValue(item.updateOrg) }}</td>
                    <td>{{ displayValue(item.updateTime) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('relation-manage')" id="section-relation-manage" class="content-section" v-loading="isSectionLoading('relations')">
            <div class="section-header">
              <div class="section-title">关联信息</div>
              <span class="section-note">取数口径：客户归属关联数据</span>
            </div>
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
                    <td colspan="5" class="empty-cell">{{ sectionEmptyText('relations') }}</td>
                  </tr>
                  <tr v-for="(item, index) in basicRelationRows" :key="item.customerId || index">
                    <td>{{ displayValue(item.mainFlag) }}</td>
                    <td>{{ displayValue(item.customerName) }}</td>
                    <td>{{ displayValue(item.customerId) }}</td>
                    <td :class="{ 'blue-text': !isEmptyValue(item.customerNo) }" @click="openViewByNo(item.customerNo, undefined, item.customerName)">{{ displayValue(item.customerNo) }}</td>
                    <td>{{ displayValue(item.blackList) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('register')" id="section-register" class="content-section" v-loading="isSectionLoading('householdMembers')">
            <div class="section-header">
              <div class="section-title">户籍信息</div>
              <span class="section-note">取数口径：户籍表，本人+配偶相同户主的数据</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>户号</th>
                    <th>姓名</th>
                    <th>民族</th>
                    <th>证件号码</th>
                    <th>关系</th>
                    <th>户籍地址</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="householdRows.length === 0">
                    <td colspan="6" class="empty-cell">{{ sectionEmptyText('householdMembers') }}</td>
                  </tr>
                  <tr v-for="(item, index) in householdRows" :key="item.idNo || index">
                    <td>{{ displayValue(item.householdNo) }}</td>
                    <td>{{ displayValue(item.name) }}</td>
                    <td>{{ displayValue(item.nation) }}</td>
                    <td :class="{ 'blue-text': !isEmptyValue(item.idNo) }" @click="openViewByCert(item.idNo, 'person', item.name)"><SensitiveValue label="证件号码" :value="item.idNo" /></td>
                    <td>{{ displayValue(item.relation) }}</td>
                    <td>{{ displayValue(item.address) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('business')" id="section-business" class="content-section" v-loading="isSectionLoading('businessSubjects')">
            <div class="section-header">
              <div class="section-title">经营主体信息</div>
              <span class="section-note">取数口径：工商表，本人+配偶为法定代表人 ※ 金额单位：万元</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>企业名称</th>
                    <th>统信码</th>
                    <th>法定代表人</th>
                    <th>贷款总额(万元)</th>
                    <th>我行信用(万元)</th>
                    <th>我行保证(万元)</th>
                    <th>我行抵押(万元)</th>
                    <th>他行信用(万元)</th>
                    <th>他行保证(万元)</th>
                    <th>他行抵押(万元)</th>
                    <th>企业报告</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="businessSubjectRows.length === 0">
                    <td colspan="11" class="empty-cell">{{ sectionEmptyText('businessSubjects') }}</td>
                  </tr>
                  <tr v-for="(item, index) in businessSubjectRows" :key="item.creditCode || index">
                    <td>{{ displayValue(item.enterpriseName) }}</td>
                    <td :class="{ 'blue-text': !isEmptyValue(item.creditCode) }" @click="openViewByCert(item.creditCode, 'corp', item.enterpriseName)"><SensitiveValue label="统信码" :value="item.creditCode" /></td>
                    <td>{{ displayValue(item.legalPerson) }}</td>
                    <td>{{ displayValue(item.loanTotal) }}</td>
                    <td>{{ displayValue(item.ourCredit) }}</td>
                    <td>{{ displayValue(item.ourGuarantee) }}</td>
                    <td>{{ displayValue(item.ourMortgage) }}</td>
                    <td>{{ displayValue(item.otherCredit) }}</td>
                    <td>{{ displayValue(item.otherGuarantee) }}</td>
                    <td>{{ displayValue(item.otherMortgage) }}</td>
                    <td :class="{ 'blue-text': item.fileNm }">{{ item.fileNm ? '查看报告' : '--' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('history-debt')" id="section-history-debt" class="content-section" v-loading="isSectionLoading('externalLoans')">
            <div class="section-header">
              <div class="section-title">历史负债展示</div>
              <span class="section-note">取数口径：本人+配偶 最近5年按年取数 ※ 金额单位：万元</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>报告日期</th>
                    <th>客户名称</th>
                    <th>贷款总额(万元)</th>
                    <th>我行信用(万元)</th>
                    <th>我行保证(万元)</th>
                    <th>我行抵押(万元)</th>
                    <th>他行信用(万元)</th>
                    <th>他行保证(万元)</th>
                    <th>他行抵押(万元)</th>
                    <th>是否不良</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="historyDebtRows.length === 0">
                    <td colspan="10" class="empty-cell">{{ sectionEmptyText('externalLoans') }}</td>
                  </tr>
                  <tr v-for="(item, index) in historyDebtRows" :key="(item.rptDate || '') + (item.customerName || '') + index">
                    <td>{{ displayValue(item.rptDate) }}</td>
                    <td>{{ displayValue(item.customerName) }}</td>
                    <td>{{ displayValue(item.loanTotal) }}</td>
                    <td>{{ displayValue(item.ourCredit) }}</td>
                    <td>{{ displayValue(item.ourGuarantee) }}</td>
                    <td>{{ displayValue(item.ourMortgage) }}</td>
                    <td>{{ displayValue(item.otherCredit) }}</td>
                    <td>{{ displayValue(item.otherGuarantee) }}</td>
                    <td>{{ displayValue(item.otherMortgage) }}</td>
                    <td>{{ displayValue(item.isBad) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div ref="historyDebtChartRef" class="history-debt-chart"></div>
          </section>

          <section v-show="isSectionVisible('history-arrears')" id="section-history-arrears" class="content-section" v-loading="isSectionLoading('arrearsHistory')">
            <div class="section-header">
              <div class="section-title">历史欠息</div>
              <span class="section-note">取数口径：近5年行内数据；欠息贷款余额、欠息总额取年末值，欠息总月数为当年累计 ※ 金额单位：万元</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th rowspan="2">客户名称</th>
                    <th v-for="year in historyArrearsYears" :key="year" colspan="3">{{ year }}年</th>
                  </tr>
                  <tr>
                    <template v-for="year in historyArrearsYears" :key="year">
                      <th>贷款余额(万元)</th>
                      <th>欠息总额(万元)</th>
                      <th>欠息总月数</th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="historyArrearsRows.length === 0">
                    <td :colspan="1 + historyArrearsYears.length * 3" class="empty-cell">{{ sectionEmptyText('arrearsHistory') }}</td>
                  </tr>
                  <tr v-for="(row, index) in historyArrearsRows" :key="row.customerName || index">
                    <td>{{ displayValue(row.customerName) }}</td>
                    <template v-for="year in historyArrearsYears" :key="year">
                      <td>{{ displayValue(getYearlyArrears(row, year, 'loanBalance')) }}</td>
                      <td>{{ displayValue(getYearlyArrears(row, year, 'overdueInterestTotal')) }}</td>
                      <td>{{ displayValue(getYearlyArrears(row, year, 'overdueMonths')) }}</td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('history-manage')" id="section-history-manage" class="content-section" v-loading="isSectionLoading('attributionHistory')">
            <div class="section-header">
              <div class="section-title">历史管户变更</div>
              <span class="section-note">取数口径：最近5年数据</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>变更日期</th>
                    <th>原管户机构</th>
                    <th>原管户经理</th>
                    <th>新管户机构</th>
                    <th>新管户经理</th>
                    <th>变更原因</th>
                    <th>更新人</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="managerChangeRows.length === 0">
                    <td colspan="7" class="empty-cell">{{ sectionEmptyText('attributionHistory') }}</td>
                  </tr>
                  <tr v-for="(item, index) in managerChangeRows" :key="index">
                    <td>{{ displayValue(item.changeDate) }}</td>
                    <td>{{ displayValue(item.oldOrg) }}</td>
                    <td>{{ displayValue(item.oldManager) }}</td>
                    <td>{{ displayValue(item.newOrg) }}</td>
                    <td>{{ displayValue(item.newManager) }}</td>
                    <td>{{ displayValue(item.changeReason) }}</td>
                    <td>{{ displayValue(item.updateBy) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('history-bad')" id="section-history-bad" class="content-section" v-loading="isSectionLoading('badLoans')">
            <div class="section-header">
              <div class="section-title">不良建档</div>
              <span class="section-note">取数口径：不良贷款建档数据 ※ 金额单位：万元</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>建档日期</th>
                    <th>类型</th>
                    <th>合同号</th>
                    <th>合同日期</th>
                    <th>到期日期</th>
                    <th>建档金额(万元)</th>
                    <th>当前余额(万元)</th>
                    <th>管贷机构</th>
                    <th>管贷人</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="badLoanRows.length === 0">
                    <td colspan="9" class="empty-cell">{{ sectionEmptyText('badLoans') }}</td>
                  </tr>
                  <tr v-for="item in badLoanRows" :key="item.contractNo">
                    <td>{{ displayValue(item.filingDate) }}</td>
                    <td>{{ displayValue(item.badLoanNature) }}</td>
                    <td><SensitiveValue label="合同号" :value="item.contractNo" /></td>
                    <td>{{ displayValue(item.contractStartDate) }}</td>
                    <td>{{ displayValue(item.contractEndDate) }}</td>
                    <td>{{ displayValue(toWan(item.filingAmount)) }}</td>
                    <td>{{ displayValue(toWan(item.currentBalance)) }}</td>
                    <td>{{ displayValue(item.managementInstitution) }}</td>
                    <td>{{ displayValue(item.managementPerson) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-show="isSectionVisible('history-timeline')" id="section-history-timeline" class="content-section" v-loading="isSectionLoading('touchTimeline')">
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

<script setup name="CrmCustomer360">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import {
  getCustomer360ArrearsHistory,
  getCustomer360Assets,
  getCustomer360AttributionHistory,
  getCustomer360BadLoans,
  getCustomer360Basic,
  getCustomer360Bootstrap,
  getCustomer360ContactPoints,
  getCustomer360InternalContracts,
  getCustomer360InternalGuarantees,
  getCustomer360PortraitTags,
  getCustomer360ProductMetrics,
  getCustomer360ProductStatus,
  getCustomer360Relations,
  getCustomer360TouchTimeline,
  queryCustomer360BusinessSubjects,
  queryCustomer360CreditCardsByCustomer,
  queryCustomer360ExternalLoansByCustomer,
  queryCustomer360HouseholdMembers,
  queryCustomer360InternalLoans,
  queryCustomer360RepaymentResponsibilities
} from '@/api/szhl/crm/customer360'
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
let contractQueryToken = 0
let guaranteeQueryToken = 0
let externalLoanQueryToken = 0
let creditCardQueryToken = 0

const activeNav = ref('all')
const sectionStates = ref(createSectionStates())
const base = ref({})
const db2 = ref({})
const spouseIsBlack = ref('')
const portraitTags = ref([])

const addressRows = ref([])
const phoneRows = ref([])
const assetRows = ref([])
const loanRows = ref([])
const bankLoanRows = ref([])
const bankLoanTotal = ref(0)
const bankLoanPage = ref(1)
const bankLoanSize = ref(10)
// 行内贷款明细排序状态，由新接口在数据库侧执行。
const bankLoanSortDirection = ref(null)
let bankLoanQueryToken = 0
// 三块「仅查看当前客户本身」复选框：状态独立，不联动
const contractOnlyMainCustomer = ref(false)
const bankLoanOnlyMainCustomer = ref(false)
const guaranteeOnlyMainCustomer = ref(false)
// 行外贷款/信用卡「仅查看当前客户本身」复选框：状态独立，不联动
const externalLoanOnlyMainCustomer = ref(false)
const creditCardOnlyMainCustomer = ref(false)
// 三个板块「仅显示余额大于0」复选框
const loanPositiveBalanceOnly = ref(false)
const creditCardPositiveBalanceOnly = ref(false)
const bankContractRows = ref([])
const bankGuaranteeRows = ref([])
const creditCardRows = ref([])
const otherLoanRows = ref([])
const householdRows = ref([])
const businessSubjectRows = ref([])
const historyDebtRows = ref([])
const badLoanRows = ref([])
const historyDebtChartRef = ref(null)
const personalProduct = ref({})
const relationRows = ref([])
const changes = ref([])
const contacts = ref([])
const loanSummary = ref({
  orgNum: '--',
  creditAmount: '--',
  normalNum: '--',
  normalBal: '--',
  overdueNum: '--',
  overdueBal: '--',
  doubtNum: '--',
  doubtBal: '--'
})
const otherLoanSummary = ref({
  orgNum: '--',
  creditAmount: '--',
  balance: '--'
})
let historyDebtChart = null
let historyDebtPendingRender = false
let historyDebtResizeObserver = null

const topTabs = [
  { id: 'all', label: '全部' },
  { id: 'basic', label: '基本' },
  { id: 'extended', label: '扩展' },
  { id: 'product', label: '产品' },
  { id: 'contact', label: '联系' },
  { id: 'internal', label: '行内' },
  { id: 'external', label: '行外' },
  { id: 'asset', label: '资产' },
  { id: 'relation', label: '关联' },
  { id: 'history', label: '历史' }
]

const tabSectionMap = {
  basic: ['basic'],
  extended: ['extended'],
  product: ['product', 'product-grid'],
  contact: ['address', 'phone'],
  internal: ['internal-manage', 'internal-detail', 'internal-guarantee'],
  external: ['external', 'external-detail', 'external-credit', 'external-loan'],
  asset: ['asset'],
  relation: ['relation-manage', 'register', 'business'],
  history: ['history-debt', 'history-arrears', 'history-manage', 'history-bad', 'history-timeline']
}

// 近5年：前4年为整年，当年为 T+1 报告期
const historyArrearsYears = (() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => String(current - 4 + i))
})()
const identityOptions = ['本行股东', '本行关系人', '小微企业主', '个体工商户', '本行员工', '新型农业经营主体']
const productStatusDefs = [
  { label: '有效合同', key: 'contractFlag' },
  { label: '有贷户', key: 'loanFlag' },
  { label: '信用卡', key: 'creditCardFlag' },
  { label: '理财户', key: 'wealthFlag' },
  { label: '贵金属', key: 'preciousMetalFlag' },
  { label: '三方支付', key: 'thirdPayFlag' },
  { label: '丰收互联', key: 'mobileBank' },
  { label: 'ETC', key: 'etcSign' },
  { label: '两费签约', key: 'loanInstallmentFlag' },
  { label: '三代社保', key: 'thirdSocialFlag' },
  { label: '养老金', key: 'pensionFlag' },
  { label: '电费代扣', key: 'electSign' },
  { label: '水费代扣', key: 'waterSign' },
  { label: '一码通', key: 'qrCodeMerchant' },
  { label: '定期户', key: 'timeDepositFlag' },
  { label: '大额存单', key: 'largeDepositFlag' },
  { label: '代发工资', key: 'payrollFlag' },
  { label: '商业保险', key: 'commercialInsuranceFlag' },
  { label: '数字人民币', key: 'digitalRmbFlag' }
]

const isBlacklist = computed(() => isFlag((db2.value || {}).isBlack))
const bankContractTotal = computed(() => sumRows(bankContractRows.value, 'contractAmt'))
const bankContractBalanceTotal = computed(() => sumRows(bankContractRows.value, 'loanBalance'))
const bankGuaranteeAmtTotal = computed(() => sumRows(bankGuaranteeRows.value, 'contractAmt'))
const bankGuaranteeBalanceTotal = computed(() => sumRows(bankGuaranteeRows.value, 'loanBalance'))
// 「仅显示余额大于0」展示行：所有银行贷款明细按贷款余额、信用卡按已用额度过滤
const displayLoanRows = computed(() =>
  loanPositiveBalanceOnly.value ? loanRows.value.filter(item => isPositiveBalance(item.balance)) : loanRows.value
)
const displayCreditCardRows = computed(() =>
  creditCardPositiveBalanceOnly.value ? creditCardRows.value.filter(item => isPositiveBalance(item.balanceUsed)) : creditCardRows.value
)
const loanBalanceTotal = computed(() => sumRows(loanRows.value, 'balance'))
const dueReminder = computed(() => ({
  loanDueCount: base.value.loanDueCount || base.value.dueLoanCount || 0,
  contractDueCount: base.value.contractDueCount || base.value.dueContractCount || 0
}))
const historyArrearsRows = ref([])

const customer = computed(() => {
  const b = base.value || {}
  const d = db2.value || {}
  return {
    customerName: b.customerName || d.custName || viewCustomerName || '--',
    customerId: b.customerId || d.custIsn || '--',
    customerNo: b.customerNo || viewCustomerNo || '--',
    idType: d.idType || '--',
    idNo: d.idNo || '--',
    gender: d.gender || inferGender(d.idNo),
    birthDate: proxy.parseTime(d.birth || d.birthday || inferBirthDate(d.idNo), '{y}-{m}-{d}') || '--',
    idEffDt: proxy.parseTime(d.idEffDt, '{y}-{m}-{d}') || '--',
    idEndDt: proxy.parseTime(d.idEndDt, '{y}-{m}-{d}') || '--',
    customerType: d.custType || '--',
    marriage: d.mrg || '--',
    job: d.job || '--',
    jobDesc: d.jobDesc || '--',
    spouseName: b.spouseName || d.spouseName,
    spouseCustomerNo: b.spouseCustomerNo || d.spouseCustIns,
    isBlack: d.isBlack || '--',
    spouseIsBlack: spouseIsBlack.value,
    phone: b.contactPhone || d.tel || '--',
    modifyStaff: d.modifyStaff,
    modifyDate: proxy.parseTime(d.modifyDate, '{y}-{m}-{d}') || '--',
    attributionOrg: b.attributionOrg,
    managerName: b.managerName || b.managerId || '--',
    mainFlag: b.mainCustomerFlag === '1' ? '主客' : (b.mainCustomerFlag === '0' ? '非主客' : '--'),
    marketingStatus: b.marketingStatus || '--',
    grid: [b.gridStreet, b.gridCommunity, b.gridCode].filter(Boolean).join('/') || '--',
    mobileBank: b.mobileBank || d.fshlFlag || '--',
    lastLoginDate: proxy.parseTime(d.fshlLastLoginDt, '{y}-{m}-{d}') || '--',
    contractFlag: b.validContract || d.effLoanContract || '--',
    loanFlag: b.loanCustomerFlag || d.effLoanBalance || '--',
    wealthFlag: b.wealthFlag || d.effInvrstBalance || '--',
    depositAvg: b.depositAvg ?? '--',
    loanBalance: b.loanBalance ?? '--',
    depositBalance: b.depositBalance ?? '--',
    wealthProduct: b.wealthBalance ?? b.wealthFlag ?? '--',
    openDate: proxy.parseTime(d.openDate || d.createDate || d.establishDate, '{y}-{m}-{d}') || '--',
    recentContactDate: proxy.parseTime(b.last3mContactDate, '{y}-{m}-{d}') || '--',
    electSign: b.electricWithhold || d.electSign || '--',
    waterSign: b.waterWithhold || d.waterSign || '--',
    etcSign: b.etcFlag || d.etcSign || '--',
    loanInstallmentFlag: b.loanInstallmentFlag || '--',
    posMerchant: b.posFlag || d.posMerchant || '--',
    qrCodeMerchant: b.yimatong || d.qrCodeMerchant || '--',
    creditCardFlag: b.creditCard || '--',
    preciousMetalFlag: b.preciousMetal || '--',
    thirdPayFlag: b.socialSecurityPaymentFlag || '--',
    thirdSocialFlag: b.socialCardGen3 || '--',
    pensionFlag: b.pension || '--',
    timeDepositFlag: b.timeDeposit || '--',
    largeDepositFlag: b.largeDepositCert || '--',
    payrollFlag: b.salaryAgentFlag || '--',
    payrollNum: d.payrollNum ?? '--',
    payrollAmt: d.payrollAmt ?? '--',
    commercialInsuranceFlag: b.insurance || '--',
    digitalRmbFlag: b.digitalRmbFlag || '--',
    householdAddress: b.householdAddress,
    contactAddress: b.contactAddress,
    updateTime: proxy.parseTime(b.updateTime || d.modifyDate, '{y}-{m}-{d}') || '--',
    updateBy: b.updateBy || d.modifyStaff
  }
})

const customerCreditAccess = computed(() => {
  const b = base.value || {}
  const d = db2.value || {}
  const access = [
    b.creditAccess,
    b.creditAdmission,
    b.customerCreditAccess,
    b.creditAdmitStatus,
    d.creditAccess,
    d.creditAdmission,
    d.customerCreditAccess,
    d.creditAdmitStatus
  ].find(item => !isEmptyValue(item))

  if (access) {
    const text = String(access)
    const isBanned = /禁入|不准入|拒绝|受限|黑|灰/.test(text)
    // 后端格式为「禁入(原因)」，徽标只显示「禁入」，完整原因放 tooltip
    const reasonMatch = text.match(/禁入[(（]([^)）]*)[)）]/)
    return {
      label: isBanned ? '禁入' : text,
      reason: isBanned && reasonMatch ? reasonMatch[1].trim() : '',
      className: isBanned ? 'status-blacklist' : 'status-normal'
    }
  }
  if (isBlacklist.value) {
    return { label: '禁入', reason: '', className: 'status-blacklist' }
  }
  return { label: '--', reason: '', className: 'status-neutral' }
})

const customerStatus = computed(() => isBlacklist.value
  ? { label: '黑灰名单', className: 'status-blacklist' }
  : { label: '正常', className: 'status-normal' }
)

const basicInfoRows = computed(() => {
  const row = customer.value
  return [
    [{ label: '客户名称', value: row.customerName }, { label: '客户内码', value: row.customerId }],
    [{ label: '证件类型', value: row.idType }, { label: '证件号', value: row.idNo, nav: { cert: row.idNo, type: 'person', name: row.customerName } }],
    [{ label: '签发日期', value: row.idEffDt }, { label: '到期日期', value: row.idEndDt }],
    [{ label: '客户类型', value: row.customerType }, { label: '婚姻状况', value: row.marriage }],
    [{ label: '职业类别', value: row.job }, { label: '职业描述', value: row.jobDesc }],
    [{ label: '配偶姓名', value: row.spouseName }, { label: '配偶证件号', value: row.spouseCustomerNo, nav: { no: row.spouseCustomerNo, name: row.spouseName } }],
    [{ label: '配偶黑灰名单', value: row.spouseIsBlack }, { label: '管户机构/人', value: compactJoin([formatOrg(row.attributionOrg), row.managerName], '/') }],
    { label: '特征画像标签', full: true },
    [{ label: '更新柜员', value: formatUser(row.modifyStaff, '--') }, { label: '更新日期', value: row.modifyDate }]
  ]
})

const basicTags = computed(() => {
  return sortPortraitTags(portraitTags.value)
    .map(tag => ({ label: tag.name, type: portraitNatureType(tag.nature) }))
    .filter(tag => tag.label)
})

const extensionInfoRows = computed(() => {
  const d = db2.value || {}
  return [
    [{ label: '民族', value: d.nation }, { label: '政治面貌', value: d.politicalStatus }],
    [{ label: '最高学历', value: d.education }, { label: '毕业院校', value: d.graduateSchool }],
    [{ label: '工作单位', value: d.workUnit || customer.value.jobDesc }, { label: '职务', value: d.position }],
    [{ label: '年收入(万元)', value: toWan(d.annualIncome) }, { label: '居住状况', value: d.livingStatus }],
    [{ label: '家庭人数', value: d.familyNum }, { label: '子女人数', value: d.childrenNum }],
    [{ label: '更新柜员', value: formatUser(customer.value.modifyStaff, '--') }, { label: '更新日期', value: customer.value.modifyDate }],
    { type: 'identity' }
  ]
})

const productGridItems = computed(() => productStatusDefs.map(item => {
  const value = customer.value[item.key]
  return {
    ...item,
    state: isFlag(value) ? 'has-data' : 'no-data'
  }
}))

const productCount = computed(() => productGridItems.value.filter(item => item.state === 'has-data').length)
const totalProducts = computed(() => productGridItems.value.length)
const coverageRate = computed(() => totalProducts.value ? `${Math.round((productCount.value / totalProducts.value) * 100)}%` : '0%')

// 金额展示统一：万元、两位小数。源单位为元的字段用 toWan，源单位已是万元的用 formatWan。
// 产品量化信息取自专用 product-metrics 接口（取首行，与原个人 360 口径一致）
const productMeasureRows = computed(() => {
  const p = personalProduct.value || {}
  return [
    [{ label: '当年代发笔数', value: p.dfgzbs ?? '' }, { label: '当年代发总额', value: toWan(p.dfgzje) }],
    [{ label: '收单结算笔数', value: p.ymtjybs ?? '' }, { label: '收单结算金额', value: toWan(p.ymtjyje) }],
    [{ label: '当年电费总额', value: toWan(p.dfje) }, { label: '当年水费总额', value: toWan(p.sfje) }],
    [{ label: '数币年交易笔数', value: p.sbjybs ?? '' }, { label: '数币年交易金额', value: toWan(p.sbjyje) }],
    [{ label: '贷款年日均', value: p.dkrj }, { label: '贷款时点', value: p.dkye }],
    [{ label: '存款年日均', value: p.ckrj }, { label: '存款时点', value: p.ckye }]
  ]
})

const assetTotalValue = computed(() => {
  if (!assetRows.value.length) return '--'
  const sum = assetRows.value.reduce((total, row) => total + (Number(row.evaluationValue) || 0), 0)
  return sum.toFixed(2)
})

const creditCardTotal = computed(() => ({
  creditAmount: sumRows(creditCardRows.value, 'creditAmount'),
  balanceUsed: sumRows(creditCardRows.value, 'balanceUsed')
}))

const basicRelationRows = computed(() => {
  if (isSectionError('relations')) {
    return []
  }
  if (relationRows.value.length) {
    return relationRows.value.map(item => ({
      mainFlag: item.mainCustomerFlag === '1' ? '是' : '',
      customerName: item.customerName,
      customerId: item.customerId,
      customerNo: item.customerNo,
      blackList: item.isBlack || item.blackList || ''
    }))
  }
  return buildCurrentRelationRows()
})

const managerChangeRows = computed(() => changes.value.map(item => ({
  changeDate: proxy.parseTime(item.changeDate, '{y}-{m}-{d}'),
  oldOrg: formatOrg(item.oldOrg),
  oldManager: formatUser(item.oldManager),
  newOrg: formatOrg(item.newOrg),
  newManager: formatUser(item.newManager),
  changeReason: item.changeReason,
  updateBy: item.changeSource || item.updateBy
})))

const basicInfoCards = computed(() => {
  const row = customer.value
  return [
    { label: '客户名称', value: row.customerName },
    { label: '客户内码', value: row.customerId, highlight: true },
    { label: '客户类型', value: row.customerType },
    { label: '证件类型', value: row.idType },
    { label: '证件号', value: row.idNo },
    { label: '性别', value: row.gender },
    { label: '出生日期', value: row.birthDate },
    { label: '手机号码', value: row.phone },
    { label: '联系地址', value: row.contactAddress, full: true },
    { label: '归属机构', value: row.attributionOrg, dictOptions: orgOptions.value },
    { label: '签发日期', value: row.idEffDt },
    { label: '到期日期', value: row.idEndDt },
    { label: '婚姻状况', value: row.marriage },
    { label: '职业类别', value: row.job },
    { label: '职业描述', value: row.jobDesc },
    { label: '配偶/法代姓名', value: row.spouseName },
    { label: '配偶/法代客户号', value: row.spouseCustomerNo },
    { label: '黑灰名单', value: row.isBlack },
    { label: '更新柜员', value: formatUser(row.modifyStaff, '--') },
    { label: '更新日期', value: row.modifyDate }
  ]
})

const extensionInfoCards = computed(() => {
  const row = customer.value
  return [
    { label: '归属机构', value: row.attributionOrg, dictOptions: orgOptions.value },
    { label: '管户经理', value: row.managerName },
    { label: '主客标识', value: row.mainFlag },
    { label: '暂缓触达状态', value: row.marketingStatus },
    { label: '常驻网格', value: row.grid, full: true }
  ]
})

const accountInfoCards = computed(() => {
  const row = customer.value
  return [
    { label: '存款余额', value: row.depositBalance },
    { label: '贷款余额', value: row.loanBalance },
    { label: '理财产品', value: row.wealthProduct },
    { label: '开户日期', value: row.openDate }
  ]
})

const checkedIdentity = computed(() => {
  const d = db2.value || {}
  const values = []
  if (isFlag(d.obankShrl)) values.push('本行股东')
  if (isFlag(d.obankRelsh)) values.push('本行关系人')
  if (isFlag(d.smeow)) values.push('小微企业主')
  if (isFlag(d.indBiz)) values.push('个体工商户')
  if (isFlag(d.obankStf)) values.push('本行员工')
  if (isFlag(d.agrMngMnsbj)) values.push('新型农业经营主体')
  return values
})

const productStats = computed(() => [
  { value: productCount.value, label: '已开通产品数', type: '' },
  { value: totalProducts.value - productCount.value, label: '待开通产品', type: 'warning' },
  { value: coverageRate.value, label: '产品覆盖率', type: '' }
])

const productStatusCards = computed(() => productStatusDefs.map(item => {
  const value = customer.value[item.key]
  return {
    ...item,
    value,
    state: isFlag(value) ? 'has-data' : 'no-data'
  }
}))

const productDetailCards = computed(() => {
  const row = customer.value
  return [
    { label: '丰收互联最后登录时间', value: row.lastLoginDate },
    { label: '存款年日均', value: row.depositAvg },
    { label: '贷款余额', value: row.loanBalance },
    { label: '近三月触达日期', value: row.recentContactDate }
  ]
})

function isFlag (value) {
  return value === '是' || value === '1' || value === 'Y'
}

function isEmptyValue (value) {
  return value === undefined || value === null || value === '' || value === '--'
}

function isPositiveBalance (value) {
  const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0
}

// 五级形态为「正常/未激活/关注」时不标红；其余异常状态整行标红；空值不标
function isFiveFormAbnormal (value) {
  if (isEmptyValue(value)) {
    return false
  }
  return !['正常', '未激活', '关注'].includes(String(value).trim())
}

// 基础信息 cell 跳转：nav.no 直接按客户号跳，nav.cert+type 拼前缀跳；值为空则不可点
function cellNavigable (cell) {
  if (!cell || !cell.nav) return false
  const key = cell.nav.no !== undefined ? cell.nav.no : cell.nav.cert
  return !isEmptyValue(key)
}

function cellNavClass (cell) {
  return cellNavigable(cell) ? 'blue-text' : ''
}

function handleCellNav (cell) {
  if (!cellNavigable(cell)) return
  const name = cell.nav.name
  if (cell.nav.no !== undefined) {
    openViewByNo(cell.nav.no, undefined, name)
  } else {
    openViewByCert(cell.nav.cert, cell.nav.type, name)
  }
}

function displayValue (value) {
  if (value === 0) {
    return 0
  }
  return isEmptyValue(value) ? '--' : value
}

function sumRows (rows, key) {
  if (!rows.length) return '--'
  const sum = rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
  return sum.toFixed(2)
}

function getYearlyArrears (row, year, key) {
  return row && row.yearly && row.yearly[year] ? row.yearly[year][key] : ''
}

// 历史欠息：后端按报告期返回近5年数据，前端按年份转换为表格结构
function buildHistoryArrearsRows (rows) {
  const yearly = {}
  ;(rows || []).forEach(row => {
    const year = String(row.reportDate || '').slice(0, 4)
    if (!year) {
      return
    }
    yearly[year] = {
      loanBalance: toWan(row.loanBalance),
      overdueInterestTotal: toWan(row.overdueInterestTotal),
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

function formatUser (value, emptyText = '--') {
  return formatUserDisplayName(managerOptions.value, value, emptyText)
}

function formatOrg (value) {
  return proxy.selectDictLabel(orgOptions.value, value) || value || ''
}

function compactJoin (values, separator) {
  return values.filter(item => !isEmptyValue(item)).join(separator)
}

function inferBirthDate (idNo) {
  const text = String(idNo || '')
  if (/^\d{17}[\dXx]$/.test(text)) {
    return `${text.slice(6, 10)}-${text.slice(10, 12)}-${text.slice(12, 14)}`
  }
  if (/^\d{15}$/.test(text)) {
    return `19${text.slice(6, 8)}-${text.slice(8, 10)}-${text.slice(10, 12)}`
  }
  return ''
}

function inferGender (idNo) {
  const text = String(idNo || '')
  const genderCode = text.length === 18 ? text.charAt(16) : (text.length === 15 ? text.charAt(14) : '')
  if (!/^\d$/.test(genderCode)) {
    return ''
  }
  return Number(genderCode) % 2 === 1 ? '男' : '女'
}

function getQueryValue (value) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

function createSectionStates () {
  return {
    bootstrap: 'idle',
    basic: 'idle',
    portraitTags: 'idle',
    productStatus: 'idle',
    productMetrics: 'idle',
    contactPoints: 'idle',
    assets: 'idle',
    internalContracts: 'idle',
    internalLoans: 'idle',
    internalGuarantees: 'idle',
    externalLoans: 'idle',
    creditCards: 'idle',
    repaymentResponsibilities: 'idle',
    householdMembers: 'idle',
    businessSubjects: 'idle',
    relations: 'idle',
    attributionHistory: 'idle',
    arrearsHistory: 'idle',
    touchTimeline: 'idle',
    badLoans: 'idle'
  }
}

function setSectionState (name, state) {
  sectionStates.value[name] = state
}

function isSectionLoading (name) {
  return sectionStates.value[name] === 'loading'
}

function isSectionError (name) {
  return sectionStates.value[name] === 'error'
}

function sectionEmptyText (name) {
  return isSectionError(name) ? '加载失败' : '暂无数据'
}

function isEmptyList (data) {
  return !Array.isArray(data) || data.length === 0
}

function markSectionsState (names, state) {
  names.forEach(name => setSectionState(name, state))
}

function markDependentSectionsState (state) {
  markSectionsState(Object.keys(sectionStates.value).filter(name => name !== 'bootstrap'), state)
}

async function loadSection (name, token, requestFn, applyFn, emptyFn = isEmptyList) {
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

function applyBasicInfo (info) {
  const data = info || {}
  db2.value = {
    ...data,
    custIsn: data.customerId,
    custName: data.customerName,
    custType: data.customerType,
    spouseCustIns: data.spouseCustomerId,
    spouseIdId: data.spouseIdNo,
    childNo: data.childrenNum,
    obankShrl: data.shareholderFlag,
    obankRelsh: data.relatedPersonFlag,
    indBiz: data.individualBusinessFlag,
    smeow: data.smeOwnerFlag,
    obankStf: data.employeeFlag,
    agrMngMnsbj: data.agriculturalOperatorFlag,
    mrg: data.marriageStatus,
    politcStat: data.politicalStatus,
    talstEdubg: data.education,
    graduationSchool: data.graduateSchool,
    workCo: data.workUnit,
    duty: data.position,
    anIcmAmt: data.annualIncome,
    liveStu: data.livingStatus,
    famCnt: data.familyNum
  }
  spouseIsBlack.value = data.spouseIsBlack || ''
}

async function loadView () {
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
    const bootstrapResponse = await getCustomer360Bootstrap(customerNo)
    if (token !== loadToken) return
    bootstrap = bootstrapResponse.data || {}
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
    () => getCustomer360Basic(customerId),
    data => applyBasicInfo(data),
    () => false
  )
  pending.push(basicPromise)

  pending.push(loadSection('portraitTags', token,
    () => getCustomer360PortraitTags(customerId),
    data => { portraitTags.value = normalizePortraitTags(data || []) }))
  pending.push(loadSection('productStatus', token,
    () => getCustomer360ProductStatus(customerId),
    data => { base.value = { ...base.value, ...(data || {}) } },
    () => false))
  pending.push(loadSection('productMetrics', token,
    () => getCustomer360ProductMetrics(customerNo),
    data => { personalProduct.value = Array.isArray(data) && data.length ? data[0] : {} }))
  pending.push(loadSection('contactPoints', token,
    () => getCustomer360ContactPoints(customerId),
    data => applyContactRows(data || [])))
  pending.push(loadSection('assets', token,
    () => getCustomer360Assets(customerId),
    data => applyAssetRows(data || [])))
  pending.push(loadInternalContracts(token))
  pending.push(loadBankLoanPage(token))
  pending.push(loadInternalGuarantees(token))
  // 行外贷款/信用卡按关联客户组取数，只依赖 customerId，与 basic 并行加载
  pending.push(loadExternalLoans(token))
  pending.push(loadCreditCards(token))
  pending.push(loadSection('relations', token,
    () => getCustomer360Relations(customerId),
    data => { relationRows.value = data || [] }))
  pending.push(loadSection('attributionHistory', token,
    () => getCustomer360AttributionHistory(customerNo),
    data => { changes.value = data || [] }))
  pending.push(loadSection('arrearsHistory', token,
    () => getCustomer360ArrearsHistory(customerNo),
    data => { historyArrearsRows.value = buildHistoryArrearsRows(data || []) }))
  pending.push(loadSection('touchTimeline', token,
    () => getCustomer360TouchTimeline(customerNo),
    data => { contacts.value = data || [] }))
  pending.push(loadSection('badLoans', token,
    () => getCustomer360BadLoans(customerNo),
    data => { badLoanRows.value = data || [] }))

  const basicResult = await basicPromise
  if (token !== loadToken) return

  if (!basicResult.ok) {
    markSectionsState([
      'repaymentResponsibilities',
      'householdMembers',
      'businessSubjects'
    ], 'error')
  } else {
    const basicInfo = basicResult.data || {}
    const idNos = buildIdNos(basicInfo)
    const ownerMap = buildOwnerMap(basicInfo)
    if (!idNos.length) {
      markSectionsState([
        'repaymentResponsibilities',
        'householdMembers',
        'businessSubjects'
      ], 'empty')
    } else {
      pending.push(loadSection('repaymentResponsibilities', token,
        () => queryCustomer360RepaymentResponsibilities(idNos),
        data => applyOtherLoanInfo(data || {}, ownerMap),
        data => !data || !(data.custOtherLoans || []).length))
      pending.push(loadSection('householdMembers', token,
        () => queryCustomer360HouseholdMembers(idNos),
        data => applyHouseholdRows(data || [])))
      pending.push(loadSection('businessSubjects', token,
        () => queryCustomer360BusinessSubjects(idNos),
        data => applyBusinessRows(data || [])))
    }
  }

  await Promise.allSettled(pending)
}

function resetView () {
  sectionStates.value = createSectionStates()
  base.value = {}
  db2.value = {}
  spouseIsBlack.value = ''
  portraitTags.value = []
  addressRows.value = []
  phoneRows.value = []
  assetRows.value = []
  loanRows.value = []
  bankLoanRows.value = []
  bankLoanTotal.value = 0
  bankLoanPage.value = 1
  bankLoanSortDirection.value = null
  bankLoanQueryToken++
  contractQueryToken++
  guaranteeQueryToken++
  contractOnlyMainCustomer.value = false
  bankLoanOnlyMainCustomer.value = false
  guaranteeOnlyMainCustomer.value = false
  externalLoanOnlyMainCustomer.value = false
  creditCardOnlyMainCustomer.value = false
  externalLoanQueryToken++
  creditCardQueryToken++
  loanPositiveBalanceOnly.value = false
  creditCardPositiveBalanceOnly.value = false
  bankContractRows.value = []
  bankGuaranteeRows.value = []
  creditCardRows.value = []
  otherLoanRows.value = []
  householdRows.value = []
  businessSubjectRows.value = []
  historyDebtRows.value = []
  badLoanRows.value = []
  personalProduct.value = {}
  relationRows.value = []
  changes.value = []
  contacts.value = []
  historyArrearsRows.value = []
  loanSummary.value = {
    orgNum: '--',
    creditAmount: '--',
    normalNum: '--',
    normalBal: '--',
    overdueNum: '--',
    overdueBal: '--',
    doubtNum: '--',
    doubtBal: '--'
  }
  otherLoanSummary.value = {
    orgNum: '--',
    creditAmount: '--',
    balance: '--'
  }
  disposeHistoryDebtChart()
}

function buildIdNos (info) {
  return [info.idNo, info.spouseIdNo || info.spouseIdId].filter(Boolean)
}

function buildOwnerMap (info) {
  const map = new Map()
  if (info.idNo) map.set(String(info.idNo).trim(), info.customerName || info.custName || '本人')
  const spouseIdNo = info.spouseIdNo || info.spouseIdId
  if (spouseIdNo) map.set(String(spouseIdNo).trim(), info.spouseName || '配偶')
  return map
}

function normalizePortraitTags (tags) {
  if (!Array.isArray(tags)) {
    return []
  }
  return tags.map(tag => ({
    id: String(tag.tagId || tag.id || ''),
    name: tag.name || tag.tagName || tag.label || '',
    nature: tag.nature || 'neutral'
  }))
}

function sortPortraitTags (tags) {
  const order = { negative: 0, positive: 1, neutral: 2 }
  return [...tags].sort((a, b) => (order[a.nature] ?? order.neutral) - (order[b.nature] ?? order.neutral))
}

function portraitNatureType (nature) {
  if (nature === 'negative') {
    return 'reverse'
  }
  if (nature === 'neutral') {
    return 'neutral'
  }
  return 'positive'
}

function applyContactRows (rows) {
  const mapped = rows.map(row => ({
    type: row.contactWay,
    owner: base.value.customerName || db2.value.custName,
    address: row.contactDesc,
    phone: row.contactDesc,
    updateTime: row.modifyDate,
    updateBy: row.modifyStaff,
    contactType: String(row.contactType)
  }))
  addressRows.value = mapped.filter(row => row.contactType !== '1')
  phoneRows.value = mapped.filter(row => row.contactType === '1')

  const latestAddress = addressRows.value[0]
  const latestPhone = phoneRows.value[0]
  base.value = {
    ...base.value,
    contactAddress: base.value.contactAddress || (latestAddress && latestAddress.address),
    contactPhone: base.value.contactPhone || (latestPhone && latestPhone.phone)
  }
}

function applyAssetRows (rows) {
  assetRows.value = rows.map(row => ({
    assetType: row.assetType,
    assetDesc: row.assetDesc,
    evaluationDate: row.evaluationDate,
    // 大信贷资产估值源单位为万元
    evaluationValue: formatWan(row.evaluationValue),
    updateBy: row.modifyStaff,
    updateOrg: row.modifyOrg,
    updateTime: row.modifyDate
  }))
}

function applyHouseholdRows (rows) {
  householdRows.value = rows.map(row => ({
    householdNo: row.householdNo || row.hh,
    name: row.name || row.xm,
    nation: row.nation || row.mz,
    idNo: row.idNo || row.zjh,
    relation: row.relation || row.yhzgx,
    address: row.address || row.dz
  }))
}

function applyLoanInfo (info) {
  // 征信负债汇总/明细源单位为万元
  loanSummary.value = {
    orgNum: info.orgNum ?? '--',
    creditAmount: formatWan(info.lineOfCreditBal) || '--',
    normalNum: info.normalNUm ?? '--',
    normalBal: formatWan(info.normalBal) || '--',
    overdueNum: info.overdueNUm ?? '--',
    overdueBal: formatWan(info.overdueBal) || '--',
    doubtNum: info.debtsNUm ?? '--',
    doubtBal: formatWan(info.debtsBal) || '--'
  }
  loanRows.value = (info.custLoans || []).map(row => ({
    owner: row.ownerName,
    bankName: row.brName,
    busType: row.busType,
    loanAmount: formatWan(row.loanAmount),
    balance: formatWan(row.balance),
    startDate: row.startDt,
    endDate: row.endDt,
    guaranType: row.guaranType,
    fiveAdjust: row.fiveAdjust,
    loanType: row.loanType,
    rate: row.rate,
    reportDate: row.reportDate
  }))
}

// 行内贷款明细（JZFY.CUST_LOAN_DETAIL，来自 customer360/internal-loans）
// 后端金额单位为元，此处 /10000 转为万元展示；利率保留两位小数带 %。
// 分页、到期日期排序和余额过滤均由新接口在数据库侧完成。
function applyBankLoanRows (rows) {
  const mapped = (rows || [])
    .map(row => ({
      custName: row.custName,
      contractNo: row.contractNo,
      iouNum: row.iouNum,
      loanAcct: row.loanAcct,
      startDate: proxy.parseTime(row.staidate, '{y}-{m}-{d}'),
      endDate: proxy.parseTime(row.stacdate, '{y}-{m}-{d}'),
      loanAmt: toWan(row.loanAmt),
      loanBalance: toWan(row.loanBalance),
      fiveForm: row.stafcls5,
      rate: formatRate(row.staerate),
      loanCha: row.loanCha,
      productName: row.productName
    }))
  bankLoanRows.value = mapped
}

// 行内贷款明细翻页：只请求 internal-loans 当前页，不整页重载
// 独立 token 防止快速翻页时旧响应覆盖新页；resetView 递增该 token 亦可作废切客户前的在途请求
async function loadBankLoanPage (viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++bankLoanQueryToken
  setSectionState('internalLoans', 'loading')
  try {
    const response = await queryCustomer360InternalLoans({
      customerId,
      onlyMainCustomer: bankLoanOnlyMainCustomer.value,
      pageNum: bankLoanPage.value,
      pageSize: bankLoanSize.value,
      sortDirection: bankLoanSortDirection.value
    })
    if (token !== bankLoanQueryToken || viewToken !== loadToken) return
    const page = response.data || {}
    applyBankLoanRows(page.rows || [])
    bankLoanTotal.value = Number(page.total) || 0
    setSectionState('internalLoans', page.rows && page.rows.length ? 'ready' : 'empty')
  } catch (error) {
    if (token === bankLoanQueryToken && viewToken === loadToken) {
      bankLoanRows.value = []
      bankLoanTotal.value = 0
      setSectionState('internalLoans', 'error')
    }
  }
}

// 行内有效合同独立请求 token，防止快速切换筛选条件时旧响应覆盖新结果。
async function loadInternalContracts (viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++contractQueryToken
  setSectionState('internalContracts', 'loading')
  try {
    const response = await getCustomer360InternalContracts(customerId, contractOnlyMainCustomer.value)
    if (token !== contractQueryToken || viewToken !== loadToken) return { ok: false, stale: true }
    const data = response ? response.data : undefined
    applyBankContractRows(data || [])
    setSectionState('internalContracts', isEmptyList(data) ? 'empty' : 'ready')
    return { ok: true, data }
  } catch (error) {
    if (token === contractQueryToken && viewToken === loadToken) {
      setSectionState('internalContracts', 'error')
    }
    return { ok: false, error }
  }
}

// 行内有效合同（customer360/internal-contracts，取数 CORE_BLFMCONF 本人+配偶）
// 金额单位元，/10000 转万元展示
function applyBankContractRows (rows) {
  bankContractRows.value = (rows || []).map(row => ({
    custName: row.custName,
    contractNo: row.contractNo,
    securityType: row.securityType,
    startDate: proxy.parseTime(row.startDate, '{y}-{m}-{d}'),
    endDate: proxy.parseTime(row.endDate, '{y}-{m}-{d}'),
    contractAmt: toWan(row.contractAmt),
    loanBalance: toWan(row.loanBalance),
    loanCount: row.loanCount,
    orgNo: row.orgNo,
    dutyPerson: row.dutyPerson
  }))
}

// 行内对外担保独立请求 token，防止快速切换筛选条件时旧响应覆盖新结果。
async function loadInternalGuarantees (viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++guaranteeQueryToken
  setSectionState('internalGuarantees', 'loading')
  try {
    const response = await getCustomer360InternalGuarantees(customerId, guaranteeOnlyMainCustomer.value)
    if (token !== guaranteeQueryToken || viewToken !== loadToken) return { ok: false, stale: true }
    const data = response ? response.data : undefined
    applyBankGuaranteeRows(data || [])
    setSectionState('internalGuarantees', isEmptyList(data) ? 'empty' : 'ready')
    return { ok: true, data }
  } catch (error) {
    if (token === guaranteeQueryToken && viewToken === loadToken) {
      setSectionState('internalGuarantees', 'error')
    }
    return { ok: false, error }
  }
}

// 行内对外担保（customer360/internal-guarantees，本人+配偶作担保人）
function applyBankGuaranteeRows (rows) {
  bankGuaranteeRows.value = (rows || []).map(row => ({
    guarantorName: row.guarantorName,
    borrowerName: row.borrowerName,
    borrowerNo: row.borrowerNo,
    contractNo: row.contractNo,
    securityType: row.securityType,
    startDate: proxy.parseTime(row.startDate, '{y}-{m}-{d}'),
    endDate: proxy.parseTime(row.endDate, '{y}-{m}-{d}'),
    contractAmt: toWan(row.contractAmt),
    loanBalance: toWan(row.loanBalance),
    fiveForm: row.fiveForm,
    orgNo: row.orgNo,
    dutyPerson: row.dutyPerson
  }))
}

function applyOtherLoanInfo (info, ownerMap) {
  // 征信还款责任/对外担保源单位为万元
  otherLoanSummary.value = {
    orgNum: info.orgNum ?? '--',
    creditAmount: formatWan(info.lineOfCreditBal) || '--',
    balance: formatWan(info.bal) || '--'
  }
  otherLoanRows.value = (info.custOtherLoans || []).map(row => ({
    owner: ownerMap.get(String(row.idNo || '').trim()),
    bankName: row.brName,
    loanType: row.loanType,
    loanerType: row.loanerType,
    loanAmount: formatWan(row.loanAmt),
    balance: formatWan(row.balance),
    startDate: row.startDt,
    endDate: row.endDt,
    fiveAdjust: row.fiveAdjust,
    reportDate: String(row.reportDate || '').substring(0, 10)
  }))
}

function applyCreditCardInfo (info) {
  // 征信信用卡额度/余额源单位为万元
  creditCardRows.value = (info.custCreditCards || []).map(row => ({
    owner: row.ownerName,
    bankName: row.brName === '浙江磐安农村商业银行股份有限公司' ? '本机构' : row.brName,
    creditAmount: formatWan(row.creditAmount),
    balanceUsed: formatWan(row.balanceUsed),
    overdueTimes: row.odTimes,
    overdueAmount: formatWan(row.odAmount),
    accountStatus: row.acctStatus,
    lastRepayDate: row.returnRecent,
    avg6mLimit: formatWan(row.avg6mlimit),
    reportDate: row.reportDate
  }))
}

function applyBusinessRows (rows) {
  // 经营主体贷款分项源单位为万元
  businessSubjectRows.value = rows.map(row => ({
    enterpriseName: row.enterpriseName,
    creditCode: row.unifiedSocialCreditCode,
    legalPerson: row.legalRepresentative,
    loanTotal: formatWan(row.dkze),
    ourCredit: formatWan(row.bhxyye),
    ourGuarantee: formatWan(row.bhbzye),
    ourMortgage: formatWan(row.bhdyye),
    otherCredit: formatWan(row.thxyye),
    otherGuarantee: formatWan(row.thbzye),
    otherMortgage: formatWan(row.thdyye),
    fileNm: row.fileNm
  }))
}

// 个人历史负债：按本人+配偶、报告日期聚合贷款明细（与原型列一致）
async function loadHistoryDebtRows (token = loadToken) {
  historyDebtRows.value = buildHistoryDebtRowsFromLoans(loanRows.value)
  await nextTick()
  if (token !== loadToken) return
  renderHistoryDebtChart()
}

function resolveHistoryDebtOwnerLabel (owner) {
  const text = String(owner || '').trim()
  if (!text || text === '本人') return '本人'
  if (text === '配偶') return '配偶'
  const spouseName = String(db2.value.spouseName || '').trim()
  if (spouseName && text === spouseName) return '配偶'
  return '本人'
}

function buildHistoryDebtRowsFromLoans (rows) {
  const grouped = new Map()
  const fiveYearAgo = new Date()
  fiveYearAgo.setFullYear(fiveYearAgo.getFullYear() - 5)

  for (const row of rows || []) {
    const rptDate = normalizeReportDate(row.reportDate)
    if (!rptDate) continue
    const dateObj = new Date(rptDate)
    if (!Number.isNaN(dateObj.getTime()) && dateObj < fiveYearAgo) continue

    const customerName = resolveHistoryDebtOwnerLabel(row.owner)
    const key = `${rptDate}|${customerName}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        rptDate,
        customerName,
        loanTotal: 0,
        ourCredit: 0,
        ourGuarantee: 0,
        ourMortgage: 0,
        otherCredit: 0,
        otherGuarantee: 0,
        otherMortgage: 0,
        isBad: ''
      })
    }
    const item = grouped.get(key)
    const balance = Number(row.balance) || 0
    item.loanTotal += balance
    const bucket = resolveGuaranteeBucket(row.guaranType)
    const ourBank = isOurBankName(row.bankName)
    if (ourBank && bucket === 'credit') item.ourCredit += balance
    else if (ourBank && bucket === 'guarantee') item.ourGuarantee += balance
    else if (ourBank) item.ourMortgage += balance
    else if (bucket === 'credit') item.otherCredit += balance
    else if (bucket === 'guarantee') item.otherGuarantee += balance
    else item.otherMortgage += balance
    if (!item.isBad && isBadFiveForm(row.fiveAdjust)) {
      item.isBad = '是'
    }
  }

  return Array.from(grouped.values())
    .map(item => ({
      ...item,
      loanTotal: formatWan(item.loanTotal),
      ourCredit: formatWan(item.ourCredit),
      ourGuarantee: formatWan(item.ourGuarantee),
      ourMortgage: formatWan(item.ourMortgage),
      otherCredit: formatWan(item.otherCredit),
      otherGuarantee: formatWan(item.otherGuarantee),
      otherMortgage: formatWan(item.otherMortgage)
    }))
    .sort((a, b) => {
      const dateCompare = String(b.rptDate).localeCompare(String(a.rptDate))
      if (dateCompare !== 0) return dateCompare
      return a.customerName === '本人' ? -1 : 1
    })
}

function normalizeReportDate (value) {
  if (value === null || value === undefined || value === '') return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const text = String(value).trim().replace(/\//g, '-')
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.substring(0, 10)
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
  return text.substring(0, 10)
}

function isOurBankName (bankName) {
  const name = String(bankName || '')
  return name === '本机构' || name.includes('磐安农村商业银行')
}

function resolveGuaranteeBucket (guaranType) {
  const text = String(guaranType || '')
  if (text.includes('信用') || text.includes('免担保')) return 'credit'
  if (text.includes('保证')) return 'guarantee'
  return 'mortgage'
}

function isBadFiveForm (fiveAdjust) {
  return /次级|可疑|损失|不良/.test(String(fiveAdjust || ''))
}

// 已是万元：固定两位小数字符串；空值返回空串以便 displayValue 显示占位
function formatWan (value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  if (value === 0 || value === '0') {
    return '0.00'
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : number.toFixed(2)
}

// 元转万元（保留两位小数），空值返回空串以便 displayValue 显示占位
function toWan (value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  if (value === 0 || value === '0') {
    return '0.00'
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : (number / 10000).toFixed(2)
}

// 利率保留两位小数并带百分号
function formatRate (value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  const number = Number(value)
  return Number.isNaN(number) ? value : `${number.toFixed(2)}%`
}

function renderHistoryDebtChart () {
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
  if (historyDebtPendingRender && historyDebtChart) {
    historyDebtChart.dispose()
    historyDebtChart = null
    historyDebtPendingRender = false
  }
  if (!historyDebtChart) {
    historyDebtChart = echarts.init(el)
  }

  // 与原型一致：按季度聚合本人/配偶贷款总额
  const dataMap = {}
  for (const row of historyDebtRows.value) {
    const dateStr = String(row.rptDate || '').trim()
    const name = String(row.customerName || '').trim()
    const amount = Number(row.loanTotal) || 0
    if (!dateStr || !name) continue
    const parts = dateStr.split('-')
    if (parts.length < 2) continue
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    if (Number.isNaN(year) || Number.isNaN(month)) continue
    const quarter = Math.ceil(month / 3)
    const period = `${year}年${quarter}季`
    if (!dataMap[period]) dataMap[period] = { 本人: 0, 配偶: 0 }
    dataMap[period][name] = (dataMap[period][name] || 0) + amount
  }

  const periods = Object.keys(dataMap).sort((a, b) => {
    const ya = parseInt(a.split('年')[0], 10)
    const yb = parseInt(b.split('年')[0], 10)
    if (ya !== yb) return ya - yb
    const qa = parseInt(a.split('年')[1], 10)
    const qb = parseInt(b.split('年')[1], 10)
    return qa - qb
  })

  if (!periods.length) {
    historyDebtChart.clear()
    historyDebtChart.setOption({
      title: { text: '暂无历史负债数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } }
    })
    historyDebtChart.resize()
    return
  }

  historyDebtChart.setOption({
    animation: false,
    title: {
      text: '历史负债趋势',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter (params) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach(p => {
          const amount = Number(p.value)
          const text = Number.isNaN(amount) ? p.value : amount.toFixed(2)
          result += `${p.marker}${p.seriesName}: ${text} 万元<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['本人', '配偶'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: periods,
      axisLabel: { rotate: 45, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '贷款总额（万元）',
      axisLabel: { fontSize: 11 },
      splitLine: { lineStyle: { color: '#edf0f5' } }
    },
    series: [
      {
        name: '本人',
        type: 'line',
        data: periods.map(p => dataMap[p]['本人'] || 0),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 2, color: '#5470c6' },
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '配偶',
        type: 'line',
        data: periods.map(p => dataMap[p]['配偶'] || 0),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 2, color: '#91cc75' },
        itemStyle: { color: '#91cc75' }
      }
    ]
  }, true)
  historyDebtChart.resize()
}

function disposeHistoryDebtChart () {
  if (historyDebtChart) {
    historyDebtChart.dispose()
    historyDebtChart = null
  }
}

function buildCurrentRelationRows () {
  const b = base.value || {}
  if (!b.customerId && !b.customerName && !b.customerNo) {
    return []
  }
  return [{
    mainFlag: b.mainCustomerFlag === '1' ? '是' : '',
    customerName: b.customerName,
    customerId: b.customerId,
    customerNo: b.customerNo,
    blackList: isBlacklist.value ? '是' : ''
  }]
}

function setActiveTab (tabId) {
  activeNav.value = tabId
  nextTick(() => {
    requestAnimationFrame(() => renderHistoryDebtChart())
  })
}

function isSectionVisible (sectionId) {
  if (activeNav.value === 'all') {
    return true
  }
  return (tabSectionMap[activeNav.value] || []).includes(sectionId)
}

onMounted(loadView)

// 行内贷款明细排序：null -> asc -> desc -> null，每次由后端重新分页查询。
const bankLoanSortIcon = computed(() => {
  if (!bankLoanSortDirection.value) return '⇅'
  return bankLoanSortDirection.value === 'asc' ? '↑' : '↓'
})

const displayBankLoanTotal = computed(() => bankLoanTotal.value)
const displayBankLoanRows = computed(() => bankLoanRows.value)

async function toggleBankLoanSort () {
  const next = !bankLoanSortDirection.value ? 'asc' : (bankLoanSortDirection.value === 'asc' ? 'desc' : null)
  bankLoanSortDirection.value = next
  bankLoanPage.value = 1
  await loadBankLoanPage()
}

// 行外贷款：关联客户组口径（customerId+onlyMainCustomer），归属名称由后端返回；
// 历史负债展示继续由贷款明细派生。独立 token 防止开关快速切换时旧响应覆盖新结果。
async function loadExternalLoans (viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++externalLoanQueryToken
  setSectionState('externalLoans', 'loading')
  try {
    const response = await queryCustomer360ExternalLoansByCustomer(
      customerId, externalLoanOnlyMainCustomer.value)
    if (token !== externalLoanQueryToken || viewToken !== loadToken) return
    const data = (response && response.data) || {}
    applyLoanInfo(data)
    await loadHistoryDebtRows(viewToken)
    if (token !== externalLoanQueryToken || viewToken !== loadToken) return
    setSectionState('externalLoans', (data.custLoans || []).length ? 'ready' : 'empty')
  } catch (error) {
    if (token === externalLoanQueryToken && viewToken === loadToken) {
      setSectionState('externalLoans', 'error')
    }
  }
}

// 行外信用卡：关联客户组口径，归属名称由后端返回。
async function loadCreditCards (viewToken = loadToken) {
  const customerId = base.value && base.value.customerId
  if (!customerId) {
    return
  }
  const token = ++creditCardQueryToken
  setSectionState('creditCards', 'loading')
  try {
    const response = await queryCustomer360CreditCardsByCustomer(
      customerId, creditCardOnlyMainCustomer.value)
    if (token !== creditCardQueryToken || viewToken !== loadToken) return
    const data = (response && response.data) || {}
    applyCreditCardInfo(data)
    setSectionState('creditCards', (data.custCreditCards || []).length ? 'ready' : 'empty')
  } catch (error) {
    if (token === creditCardQueryToken && viewToken === loadToken) {
      setSectionState('creditCards', 'error')
    }
  }
}

// 「仅查看当前客户本身」切换后重新请求对应区块；三块独立，互不联动
async function handleContractOnlyMainCustomerChange (checked) {
  contractOnlyMainCustomer.value = Boolean(checked)
  await loadInternalContracts()
}

async function handleBankLoanOnlyMainCustomerChange (checked) {
  bankLoanOnlyMainCustomer.value = Boolean(checked)
  bankLoanPage.value = 1
  await loadBankLoanPage()
}

async function handleGuaranteeOnlyMainCustomerChange (checked) {
  guaranteeOnlyMainCustomer.value = Boolean(checked)
  await loadInternalGuarantees()
}

async function handleExternalLoanOnlyMainCustomerChange (checked) {
  externalLoanOnlyMainCustomer.value = Boolean(checked)
  await loadExternalLoans()
}

async function handleCreditCardOnlyMainCustomerChange (checked) {
  creditCardOnlyMainCustomer.value = Boolean(checked)
  await loadCreditCards()
}

// 翻页和页大小变化均直接请求新分页接口。
function handleBankLoanPageChange ({ page, limit } = {}) {
  if (page !== undefined) {
    bankLoanPage.value = page
  }
  if (limit !== undefined) {
    bankLoanSize.value = limit
  }
  loadBankLoanPage()
}

onBeforeUnmount(() => {
  loadToken++
  bankLoanQueryToken++
  contractQueryToken++
  guaranteeQueryToken++
  disposeHistoryDebtChart()
  if (historyDebtResizeObserver) {
    historyDebtResizeObserver.disconnect()
    historyDebtResizeObserver = null
  }
})
</script>

<style scoped>
.customer-360-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  overflow-y: auto;
  background: #f0f2f5;
  color: #333;
  font-size: 13px;
  line-height: 1.4;
}

.customer-360-page * {
  box-sizing: border-box;
}

.customer-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  max-width: none;
  min-height: 0;
  margin: 0 auto;
  padding: 12px;
}

.page-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
  gap: 24px;
  min-width: 0;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.customer-brief {
  display: flex;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
  gap: 16px;
  min-width: 0;
}

.brief-item {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
}

.brief-item label {
  flex-shrink: 0;
  color: #999;
}

.brief-item .value {
  min-width: 0;
  max-width: 260px;
  overflow: hidden;
  color: #333;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brief-item .value.highlight {
  color: #1890ff;
  font-weight: 600;
}

.brief-divider {
  width: 1px;
  height: 14px;
  background: #e8e8e8;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

.status-normal {
  color: #fff;
  background: #52c41a;
}

.status-blacklist {
  color: #fff;
  background: #ff4d4f;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-kpis {
  display: flex;
  align-items: center;
  gap: 18px;
}

.kpi-compact {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.kpi-compact .value {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.kpi-compact .value.good {
  color: #52c41a;
}

.kpi-compact .value.warning {
  color: #faad14;
}

.kpi-compact .label {
  color: #999;
  font-size: 11px;
}

.kpi-divider {
  width: 1px;
  height: 16px;
  background: #e8e8e8;
}

.unit-note {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.reminder-bar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 16px;
  color: #333;
  font-size: 13px;
  background: #fff;
  border: 1px solid #ffe58f;
  border-left: 4px solid #faad14;
  border-radius: 4px;
}

.reminder-title {
  color: #333;
  font-weight: 600;
}

.reminder-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.reminder-label {
  color: #666;
  font-weight: 600;
}

.reminder-num {
  color: #fa8c16;
  font-weight: 700;
}

.reminder-item.risk,
.reminder-item.risk .reminder-label {
  color: #cf1322;
}

.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.top-nav {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0;
  margin-bottom: 12px;
  overflow-x: auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.top-nav-item {
  min-width: 76px;
  height: 42px;
  padding: 0 18px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.top-nav-item:hover {
  color: #1890ff;
  background: #f5f7fa;
}

.top-nav-item.active {
  color: #1890ff;
  font-weight: 600;
  background: #e6f7ff;
  border-bottom-color: #1890ff;
}

.content-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
}

.content-section {
  margin-bottom: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.history-debt-chart {
  width: 100%;
  height: 350px;
  margin-top: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.subsection-header {
  margin-top: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.section-title::before {
  width: 3px;
  height: 16px;
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

.section-block {
  margin-top: 16px;
}

.block-title {
  margin-bottom: 8px;
  padding-left: 8px;
  color: #666;
  font-size: 13px;
  font-weight: 600;
  border-left: 3px solid #1890ff;
}

.tag-list,
.identity-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.portrait-tag,
.identity-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 10px;
  color: #666;
  font-size: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.identity-tag.active,
.portrait-tag {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #91d5ff;
}

.empty-panel {
  padding: 12px;
  color: #909399;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

/* 行内明细分页：common-pagination 默认尺寸偏大，这里整体缩小以匹配本页 12px 紧凑表格 */
.content-section :deep(.common-pagination) {
  min-height: auto;
  padding: 10px 0 0;
  background: transparent;
}

.content-section :deep(.common-pagination__total) {
  min-width: auto;
  font-size: 12px;
  line-height: 24px;
}

.content-section :deep(.common-pagination__right) {
  gap: 16px;
}

.content-section :deep(.common-pagination__page-size) {
  width: 76px;
}

.content-section :deep(.common-pagination__page-size .el-input__wrapper) {
  height: 24px;
  padding: 0 6px 0 8px;
}

.content-section :deep(.common-pagination__page-size .el-input__inner) {
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}

.content-section :deep(.common-pagination .el-pagination button),
.content-section :deep(.common-pagination .el-pager li) {
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}

.content-section :deep(.common-pagination .el-pagination .el-input__inner) {
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}

.content-section :deep(.common-pagination .el-pagination__jump) {
  font-size: 12px;
}

.data-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 8px 10px;
  text-align: left;
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  color: #666;
  font-weight: 600;
  background: #fafafa;
  border-bottom: 2px solid #e8e8e8;
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

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.summary-table th,
.summary-table td {
  text-align: center;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.stat-card {
  padding: 12px 10px;
  text-align: center;
  background: linear-gradient(135deg, #f0f5ff 0%, #fff 100%);
  border: 1px solid #adc6ff;
  border-radius: 6px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(24, 144, 255, 0.12);
}

.stat-card.success {
  background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
  border-color: #d9f7be;
}

.stat-card.warning {
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
  border-color: #ffe58f;
}

.stat-value {
  margin-bottom: 4px;
  color: #1890ff;
  font-size: 24px;
  font-weight: bold;
}

.stat-card.success .stat-value {
  color: #52c41a;
}

.stat-card.warning .stat-value {
  color: #faad14;
}

.stat-label {
  color: #666;
  font-size: 11px;
  font-weight: 500;
}

.product-section {
  margin-bottom: 12px;
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.product-item {
  position: relative;
  min-height: 62px;
  padding: 10px 28px 10px 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  transition: all 0.2s;
}

.product-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.product-item.has-data {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.product-item.has-data::before {
  position: absolute;
  top: 4px;
  right: 6px;
  color: #52c41a;
  font-size: 14px;
  font-weight: bold;
  content: '✓';
}

.product-item.no-data {
  background: #fafafa;
  border-color: #e8e8e8;
}

.product-item.no-data::before {
  position: absolute;
  top: 4px;
  right: 6px;
  color: #bbb;
  font-size: 14px;
  font-weight: bold;
  content: '-';
}

.product-name {
  color: #333;
  font-size: 13px;
  font-weight: 500;
}

.product-state {
  margin-top: 6px;
  color: #666;
  font-size: 12px;
}

.product-item.has-data .product-state {
  color: #389e0d;
}

.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 11px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-radius: 3px;
}

.legend-green {
  background: #52c41a;
}

.legend-white {
  background: #fff;
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

.customer-360-page {
  min-height: 0;
  height: calc(100vh - 84px);
  overflow-y: auto;
  background: #f0f2f5;
  color: #333;
  font-size: 13px;
  line-height: 1.4;
}

.customer-container {
  max-width: 1400px;
  padding: 20px;
}

.page-header {
  position: relative;
  display: block;
  margin-bottom: 0;
  padding: 20px;
  color: #fff;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-header h1 {
  margin: 0 0 15px;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
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
  min-width: 0;
}

.info-item label {
  flex-shrink: 0;
  min-width: 80px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.info-item span {
  min-width: 0;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-neutral {
  color: #fff;
  background: rgba(255, 255, 255, 0.28);
}

.reminder-bar {
  margin-bottom: 12px;
  padding: 12px 20px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-top: 0;
  border-left: 4px solid #faad14;
  border-radius: 0;
}

.top-nav {
  margin-bottom: 20px;
  padding: 0 10px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-nav-item {
  min-width: auto;
  height: auto;
  padding: 10px 20px;
  color: #1890ff;
  font-size: 14px;
  border-bottom: 3px solid transparent;
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

.main-layout {
  display: block;
}

.content-area {
  flex: 1;
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
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 0;
  border-bottom: 0;
}

.section-title {
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.section-title::before {
  width: 4px;
  height: 20px;
}

.info-table {
  width: 100%;
  table-layout: fixed;
  font-size: 12px;
  border-collapse: collapse;
}

.data-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
}

.info-table th,
.info-table td,
.data-table th,
.data-table td {
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
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 10;
  color: #333;
  font-weight: 600;
  background: #fafafa;
}

.data-table tbody tr:hover {
  background: #f5f7fa;
}

.summary-table + .data-table {
  margin-top: 10px;
}

.table-wrap {
  padding-bottom: 1px;
}

.data-table tbody tr:last-child td,
.info-table tbody tr:last-child th,
.info-table tbody tr:last-child td {
  border-bottom: 1px solid #e8e8e8;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.checkbox-item input[type='checkbox'] {
  width: 14px;
  height: 14px;
}

.checkbox-item.checked {
  color: #1890ff;
  font-weight: 500;
}

.tag-cell {
  text-align: left !important;
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
  box-shadow: 0 2px 4px rgba(194, 147, 19, 0.36);
}

.tag-item.neutral {
  background: linear-gradient(135deg, #9a93d656 0%, #1b7bbb 100%);
  box-shadow: 0 2px 4px rgba(27, 123, 187, 0.25);
}

.tag-item.positive {
  background: linear-gradient(135deg, #c21313c7 0%, #f05108 100%);
  box-shadow: 0 2px 4px rgba(194, 19, 19, 0.25);
}

.tag-item.reverse {
  background: linear-gradient(135deg, #03db76c7 0%, #4ebb23 100%);
  box-shadow: 0 2px 4px rgba(78, 187, 35, 0.25);
}

.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.stat-card {
  padding: 12px 15px;
  background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  transform: none;
}

.stat-card:hover {
  transform: none;
  box-shadow: none;
}

.stat-card.warning {
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
  border-color: #ffe58f;
}

.stat-value {
  margin-bottom: 3px;
  color: #52c41a;
  font-size: 22px;
}

.stat-card.warning .stat-value {
  color: #faad14;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 1px;
  max-height: 220px;
  margin-bottom: 15px;
  overflow: hidden;
  background: #e8e8e8;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.product-item {
  min-height: auto;
  padding: 12px 8px;
  color: #666;
  text-align: center;
  background: #fff;
  border: 0;
  border-radius: 0;
}

.product-item:hover {
  opacity: 0.85;
  transform: none;
  box-shadow: none;
}

.product-item.has-data {
  color: #fff;
  background: #52c41a;
  border: 0;
}

.product-item.no-data {
  color: #666;
  background: #fff;
  border: 0;
}

.product-item.has-data::before,
.product-item.no-data::before {
  content: none;
}

.product-name {
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.legend {
  gap: 20px;
  padding: 0;
  background: transparent;
  font-size: 12px;
}

.legend-color {
  width: 20px;
  height: 20px;
}

.customer-360-page ::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.customer-360-page ::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 4px;
}

.customer-360-page ::-webkit-scrollbar-thumb:hover {
  background: #337ecc;
}

.customer-360-page ::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 768px) {
  .customer-360-page {
    height: calc(100vh - 84px);
  }

  .customer-container {
    padding: 12px;
  }

  .main-layout {
    display: block;
  }

  .content-area {
    overflow-y: auto;
  }

  .customer-info,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(6, 1fr);
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    max-height: 400px;
  }

  .info-table th,
  .info-table td,
  .data-table th,
  .data-table td {
    padding: 4px 6px;
    font-size: 11px;
  }

  .tag-item {
    margin: 4px 2px;
    padding: 2px 8px;
    font-size: 10px;
  }
}

/* 行内贷款明细表头列排序 */
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

<style lang="scss">
/* 信贷准入禁入原因 tooltip：挂在 body 上，scoped 够不到，用 popper-class 限定（同 CrmOrgSelect 做法） */
.credit-access-tooltip {
  max-width: 400px;

  .credit-access-tooltip-content {
    max-height: 200px;
    overflow-y: auto;
    white-space: normal;
    word-break: break-all;
    line-height: 1.5;
  }
}
</style>
