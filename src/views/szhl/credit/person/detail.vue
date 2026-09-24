<template>
  <div class="my-container">
    <el-button
      class="backbtn"
      size="small"
      @click="close"
    >返回</el-button>
    <el-button
      icon="download"
      type="primary"
      plain
      size="small"
      class="download"
      @click="donwloadReport"
    >PDF下载</el-button>
    <div
      ref="report"
      v-loading="loading"
      class="report"
      element-loading-text="拼命加载中"
    >
      <h1 align="center" style="font-size: 25px;">客户信息报告</h1>
      <span class="text-right">单位: 万元</span>
      <div class="report-header">
        <span>报告编号: {{ reportData.reportNo || '-' }}</span>
        <span>报告查询时间: {{ reportData.queryTime || formatDateTime(new Date()) }}</span>
      </div>

      <!-- 基本信息 -->
      <div class="report-body">
        <div class="report-body-item-title" style="margin-top: -15px;">基本信息</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td class="tdFont">客户姓名</td>
              <td class="tdFont">身份证号</td>
              <td class="tdFont">信用评分</td>
              <td class="tdFont">数字解读说明</td>
            </tr>
            <tr>
              <td>{{ reportData.custName || '-' }}</td>
              <td>{{ reportData.idNo || '-' }}</td>
              <td>{{ reportData.creditScore || '0' }}</td>
              <td>{{ reportData.digitalInterpretation || '0' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 风险准入评分 -->
        <!-- <div class="report-body-item-title">风险准入评分</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td class="tdFont">风险提示</td><td>{{ reportData.riskAlert || '-' }}</td>
              <td class="tdFont">分数</td><td>{{ reportData.riskScore || '-' }}</td>
              <td class="tdFont">等级划分</td><td>{{ reportData.gradeClassification || '-' }}</td>
            </tr>
          </tbody>
        </table> -->

        <!-- 负债情况 -->
        <div class="report-body-item-title">负债情况</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td class="tdFont">账户类型</td>
              <td class="tdFont">管理机构数</td>
              <td class="tdFont">账户数</td>
              <td class="tdFont">授信总额</td>
              <td class="tdFont">余额/已用额度</td>
              <td class="tdFont">最近6个月平均应还款/平均使用额度</td>
            </tr>
            <tr v-for="(item, index) in (liabilitySummary.length > 0 ? liabilitySummary : [{ accountType: '-', institutionCount: '-', accountCount: '-', totalCredit: '-', balance: '-', avgRepayment: '-' }])" :key="index">
              <td>{{ item.accountType }}</td>
              <td>{{ item.institutionCount }}</td>
              <td>{{ item.accountCount }}</td>
              <td>{{ formatAmount(item.totalCredit) }}</td>
              <td>{{ formatAmount(item.balance) }}</td>
              <td>{{ formatAmount(item.avgRepayment) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 未结清贷款汇总及明细 -->
        <div class="report-body-item-title">未结清贷款汇总及明细</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td rowspan="2">总机构数</td>
              <td rowspan="2">总授信额度</td>
              <td colspan="2">正常</td>
              <td colspan="2">逾期</td>
              <td colspan="2">呆账</td>
            </tr>
            <tr>
              <td>笔数</td>
              <td>金额</td>
              <td>笔数</td>
              <td>金额</td>
              <td>笔数</td>
              <td>金额</td>
            </tr>
            <tr v-if="reportData">
              <td>{{ reportData.loanOrgNum || '-' }}</td>
              <td>{{ formatAmount(parseIntAndDivided10000(reportData.loanAmt)) }}</td>
              <td>{{ formatCount(safeAdd(reportData.normalCount0, reportData.normalCount1)) }}</td>
              <td>{{ formatAmount(safeAddAndConvertToWan(reportData.normalBal0, reportData.normalBal1)) }}</td>
              <td :class="{ 'color-red': isPositive(safeAdd(reportData.overdueCount0, reportData.overdueCount1)) }">
                {{ formatCount(safeAdd(reportData.overdueCount0, reportData.overdueCount1)) }}
              </td>
              <td :class="{ 'color-red': isPositive(safeAdd(reportData.overdueBal0, reportData.overdueBal1)) }">
                {{ formatAmount(safeAddAndConvertToWan(reportData.overdueBal0, reportData.overdueBal1)) }}
              </td>
              <td :class="{ 'color-red': isPositive(safeAdd(reportData.debtCount0, reportData.debtCount1)) }">
                {{ formatCount(safeAdd(reportData.debtCount0, reportData.debtCount1)) }}</td>
              <td :class="{ 'color-red': isPositive(safeAdd(reportData.debtBal0, reportData.debtBal1)) }">
                {{ formatAmount(safeAddAndConvertToWan(reportData.debtBal0, reportData.debtBal1)) }}</td>
            </tr>
            <tr v-else>
              <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
            </tr>
          </tbody>
        </table>

        <!-- 未结清贷款明细 -->
        <div class="report-body-item-tab">
          <label style="width: 60%;margin-left: 10px;">贷款</label>
          <div class="report-body-lable">
            <label>机构：</label><label>{{ loanInstitutionCount || '-' }}</label><label> 个， </label>
            <label>借款余额：</label><label>{{ loanBalance == null ? '-' : loanBalance }}</label><label> 万元</label>
          </div>
        </div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td>机构名称</td>
              <td>业务种类</td>
              <td>贷款余额</td>
              <td>担保方式</td>
              <td>借款日期</td>
              <td>到期日期</td>
              <td>账户状态</td>
              <td>五级</td>
              <!-- <td>催收标志</td> -->
              <td>当月应还款额(元)</td>
              <td>测算利率(%)</td>
            </tr>
            <tr
              v-for="(item, index) in (reportData.loanDetails && reportData.loanDetails.length > 0 ? reportData.loanDetails : [{}])"
              :key="index"
              :class="{ 'color-red': isAbnormalStatus(item.acctStatus) || isAbnormalFive(item.fiveAdjust) }"
            >
              <!-- <td>{{ item.brName || '-' }}</td> -->
              <td style="color: blue;">
                  <a @click="openOrgDialog(item, index, 'loan')">
                    {{ item.orgName || item.brName || '-' }}
                  </a>
                </td>
              <td>{{ item.busType || '-' }}</td>
              <td>{{ formatAmount(parseIntAndDivided10000(item.balance)) }}</td>
              <td>{{ item.guaranType || '-' }}</td>
              <td>{{ item.startDt || '-' }}</td>
              <td>{{ item.endDt || '-' }}</td>
              <td>{{ item.acctStatus || '-' }}</td>
              <td>{{ item.fiveAdjust || '-' }}</td>
              <!-- <td>{{ item.odTimes ? (item.odTimes > 0 ? '是' : '否') : '-' }}</td> -->
              <td>{{ formatAmount((item.needRepay)) }}</td>
              <td>{{ item.rateMeasure || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 客户信用卡用信汇总及明细 -->
        <div class="report-body-item-title" style="border-bottom: 1px solid #000;">客户信用卡用信汇总及明细</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td>机构数</td>
              <td>账户数</td>
              <td>授信总额</td>
              <td>已用总额</td>
              <td>逾期总账户数</td>
              <td>逾期最大月份数</td>
              <td>最长逾期月数</td>
              <td>逾期总额</td>
            </tr>
            <tr v-if="reportData.creditCardSummary">
              <td>{{ reportData.creditCardSummary.creditOrgNum || '-' }}</td>
              <td>{{ reportData.creditCardSummary.creditAcc || '-' }}</td>
              <td>{{ formatAmount(parseIntAndDivided10000(reportData.creditCardSummary.creditAmt)) }}</td>
              <td>{{ formatAmount(parseIntAndDivided10000(reportData.creditCardSummary.creditUsed)) }}</td>
              <td :class="{ 'color-red': isPositive(reportData.creditCardSummary.creditDetAcc) }">
                {{ reportData.creditCardSummary.creditDetAcc || '-' }}
              </td>
              <td :class="{ 'color-red': isPositive(reportData.creditCardSummary.dcreditMaxMon) }">
                {{ reportData.creditCardSummary.dcreditMaxMon || '-' }}
              </td>
              <td :class="{ 'color-red': isPositive(reportData.creditCardSummary.dcreditMaxMmth) }">
                {{ reportData.creditCardSummary.dcreditMaxMmth || '-' }}
              </td>
              <td :class="{ 'color-red': isPositive(reportData.creditCardSummary.odAmount) }">
                {{ formatAmount(parseIntAndDivided10000(reportData.creditCardSummary.odAmount)) }}
              </td>
            </tr>
            <tr v-else>
              <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
            </tr>
          </tbody>
        </table>

        <!-- 信用卡明细 -->
        <div class="report-body-item-tab">
          <label style="width: 60%;margin-left: 10px;">信用卡明细</label>
        </div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td>发卡机构</td>
              <td>开卡日期</td>
              <td>授信额度</td>
              <td>已用额度</td>
              <td>逾期期数</td>
              <td>逾期总额</td>
              <td>账户状态</td>
              <td>最近一次还款日期</td>
            </tr>
            <template v-for="(item, index) in (reportData.creditCardDetails && reportData.creditCardDetails.length > 0 ? reportData.creditCardDetails : [{}])" :key="index">
              <tr
                v-if="item && (Number(item.creditAmount || 0) > 0 || Number(item.balance || 0) > 0)"
                :class="{ 'color-red': isAbnormalStatus(item.acctStatus) }"
              >
                <td style="color: blue;">
                  <a @click="openOrgDialog(item, index, 'credit')">
                    {{ item.orgName || item.brName || '-' }}
                  </a>
                </td>
                <td>{{ item.startDt || '-' }}</td>
                <td>{{ formatAmount(parseIntAndDivided10000(item.creditAmount)) }}</td>
                <td>{{ formatAmount(parseIntAndDivided10000(item.balance)) }}</td>
                <td>{{ item.odTimes || '-' }}</td>
                <td>{{ formatAmount(parseIntAndDivided10000(item.odAmount)) }}</td>
                <td>{{ item.acctStatus || '-' }}</td>
                <td>{{ item.returnRecent || '-' }}</td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 机构名称编辑弹窗 -->
        <el-dialog v-model="orgDialogVisible" title="修改机构名称" width="400px" :close-on-click-modal="false">
          <el-form label-width="90px">
            <el-form-item label="机构名称">
              <el-input v-model="orgDialogForm.orgName" placeholder="请输入机构名称" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="orgDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="confirmOrgName">确 定</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 相关还款责任汇总及明细 -->
        <div class="report-body-item-title" style="border-bottom: 1px solid #000;">相关还款责任汇总及明细</div>
        <!-- 汇总表 -->
        <table class="report-body-item-table" style="margin-bottom: 10px;">
          <tbody>
            <tr>
              <td class="tdFont">责任类型</td>
              <td class="tdFont">账户数</td>
              <td class="tdFont">金额</td>
              <td class="tdFont">余额</td>
            </tr>
            <tr v-if="Number(reportData.perGuaranAcc || 0) > 0 || Number(reportData.busGuaranAcc || 0) > 0">
              <td>担保责任</td>
              <td>{{ formatCount(safeAdd(reportData.perGuaranAcc, reportData.busGuaranAcc)) }}</td>
              <td>{{ formatAmount(safeAddAndConvertToWan(reportData.perGuaranAmt, reportData.busGuaranAmt)) }}</td>
              <td>{{ formatAmount(safeAddAndConvertToWan(reportData.perGuaranBal, reportData.busGuaranBal)) }}</td>
            </tr>
            <tr v-if="Number(reportData.busOtherAcc || 0) > 0 || Number(reportData.perOtherAcc || 0) > 0">
              <td>还款责任</td>
              <td>{{ formatCount(safeAdd(reportData.busOtherAcc, reportData.perOtherAcc)) }}</td>
              <td>{{ formatAmount(safeAddAndConvertToWan(reportData.busOtherAmt, reportData.perOtherAmt)) }}</td>
              <td>{{ formatAmount(safeAddAndConvertToWan(reportData.busOtherBal, reportData.perOtherBal)) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 相关还款责任明细 -->
        <div class="report-body-item-tab">
          <label style="width: 60%;margin-left: 10px;">明细</label>
          <div class="report-body-lable">
            <label>机构：</label><label>{{ responsibilityInstitutionCount || '-' }}</label><label> 个， </label>
            <label>责任余额：</label><label>{{ responsibilityBalance == null ? '-' : responsibilityBalance }}</label><label> 万元</label>
          </div>
        </div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td>机构名称</td>
              <td>责任对象</td>
              <td>业务种类</td>
              <td>责任类型</td>
              <td>责任余额</td>
              <td>借款日期</td>
              <td>到期日期</td>
              <td>五级分类</td>
              <td>还款状态</td>
            </tr>
            <tr
              v-for="(item, index) in (reportData.responsibilityDetails && reportData.responsibilityDetails.length > 0 ? reportData.responsibilityDetails : [{}])"
              :key="index"
              :class="{ 'color-red': isAbnormalFive(item.fiveAdjust) }"
            >
              <td style="color: blue;">
                <a @click="openOrgDialog(item, index, 'responsibility')">
                  {{ item.orgName || item.brName || '-' }}
                </a>
              </td>
              <td>{{ item.loanerTyep || '-' }}</td>
              <td>{{ item.busType || '-' }}</td>
              <td>{{ item.loanType || '-' }}</td>
              <td>{{ formatAmount(parseIntAndDivided10000(item.balance)) }}</td>
              <td>{{ item.startDt || '-' }}</td>
              <td>{{ item.endDt || '-' }}</td>
              <td>{{ item.fiveAdjust || '-' }}</td>
              <td>{{ item.returnStatus || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 信用报告被查询记录 -->
        <div class="report-body-item-title" style="border-bottom: 1px solid #000;">信用报告被查询记录</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td class="tdFont" rowspan="2">查询类型</td>
              <td class="tdFont" colspan="2">最近1个月内的查询机构数</td>
              <td class="tdFont" colspan="4">最近1个月内的查询次数</td>
              <td class="tdFont" colspan="2">最近2年内的查询次数</td>
            </tr>
            <tr>
              <td class="tdFont">贷款审批</td>
              <td class="tdFont">信用卡审批</td>
              <td class="tdFont">贷款审批</td>
              <td class="tdFont">信用卡审批</td>
              <td class="tdFont">本人查询</td>
              <td class="tdFont">贷后管理</td>
              <td class="tdFont">担保资格审查</td>
              <td class="tdFont">特约商户实名审查</td>
            </tr>
            <tr>
              <td>查询记录</td>
              <td>{{ reportData.orgsQloan1month || '-' }}</td>
              <td>{{ reportData.orgsQcard1month || '-' }}</td>
              <td>{{ reportData.numsQloan1month || '-' }}</td>
              <td>{{ reportData.numsQcard1month || '-' }}</td>
              <td>{{ reportData.numsOwner1month || '-' }}</td>
              <td>{{ reportData.numsAftloan2year || '-' }}</td>
              <td>{{ reportData.numsGuarantee2year || '-' }}</td>
              <td>{{ reportData.numsSbuscheck2year || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 信贷交易违约情况 -->
        <div class="report-body-item-title" style="border-bottom: 1px solid #000;">信贷交易违约情况</div>
        <!-- 违约种类 -->
        <table class="report-body-item-table" style="margin-bottom: 10px;">
          <tbody>
            <tr>
              <td class="tdFont">违约种类</td>
              <td class="tdFont">类型</td>
              <td class="tdFont">账户数</td>
              <td class="tdFont">余额</td>
            </tr>
            <tr
              v-for="(item, index) in (defaultTypeList.length > 0 ? defaultTypeList : [{ defaultType: '-', type: '-', accountCount: '-', balance: null }])"
              :key="index"
              :class="{ 'color-red': item.defaultType !== '-' }"
            >
              <td>{{ item.defaultType }}</td>
              <td>{{ item.type }}</td>
              <td>{{ formatCount(item.accountCount) }}</td>
              <td>{{ formatAmount(item.balance) }}</td>
            </tr>
          </tbody>
        </table>
        

        <!-- 非信贷交易违约情况 -->
        <div class="report-body-item-title" style="border-bottom: 1px solid #000;">非信贷交易违约情况</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td class="tdFont">交易类型</td>
              <td class="tdFont">账户数/记录数</td>
              <td class="tdFont">欠费金额</td>
            </tr>
            <tr
              v-for="(item, index) in (nonCreditDefaultList.length > 0 ? nonCreditDefaultList : [{ transactionType: '-', accountCount: '-', arrearsAmount: null }])"
              :key="index"
              :class="{ 'color-red': item.transactionType !== '-' }"
            >
              <td>{{ item.transactionType }}</td>
              <td>{{ formatCount(item.accountCount) }}</td>
              <td>{{ formatAmount(item.arrearsAmount) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 历史数据分析 -->
        <div class="report-body-item-title" style="border-bottom: 1px solid #000;">历史数据分析</div>
        <table class="report-body-item-table">
          <tbody>
            <tr>
              <td>日期</td>
              <td>机构数</td>
              <td>贷款余额</td>
              <td>卡机构数</td>
              <td>信用卡透支余额</td>
              <td>相关还款责任</td>
              <td>逾期金额</td>
              <td>呆账金额</td>
            </tr>
            <tr v-for="(item, index) in (historicalDataList.length > 0 ? historicalDataList : [{ date: '-', institutionCount: null, loanBalance: null, cardInstitutionCount: null, creditCardOverdraftBalance: null, relatedRepaymentResponsibility: null, overdueAmount: null, badDebtAmount: null }])" :key="index">
              <td>{{ item.date || '-' }}</td>
              <td>{{ item.institutionCount !== null && item.institutionCount !== undefined ? item.institutionCount : '-' }}</td>
              <td>{{ formatAmount(item.loanBalance) }}</td>
              <td>{{ item.cardInstitutionCount !== null && item.cardInstitutionCount !== undefined ? item.cardInstitutionCount : '-' }}</td>
              <td>{{ formatAmount(item.creditCardOverdraftBalance) }}</td>
              <td>{{ formatAmount(item.relatedRepaymentResponsibility) }}</td>
              <td :class="{ 'color-red': isPositive(item.overdueAmount) }">{{ formatAmount(item.overdueAmount) }}</td>
              <td>{{ formatAmount(item.badDebtAmount) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 历史数据分析折线图 -->
        <table class="report-body-item-table chart-block-no-pdf" style="background:#fff; margin-top: 20px;">
          <div id="historyChart" class="report-body-canav" v-show="showChart" ref="chartContainer"></div>
        </table>
      </div>

      <div class="report-footer">
        <span>打印日期: {{ currentDate }}</span>
        <span>打印人: {{ printer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup name="PersonReportDetail">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { queryBaseInfo, queryLoanInfos, getBcrCreditcardInfos, getBcrCreditCardSummary, getBcrOtherLoanInfos, getReportHistory } from '@/api/szhl/credit/person/details';
import { editOrgName } from '@/api/szhl/credit/person/report';
import { parseTime } from '@/utils/ruoyi';
import { operateLog } from "@/api/system/log";

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const report = ref(null);
const reportData = ref({});
const currentDate = ref(dayjs().format('YYYY-MM-DD'));
const printer = ref(localStorage.getItem('userName') || '');
const chartContainer = ref(null);
const showChart = ref(false);
let myChart = null;
const orgDialogVisible = ref(false);
const orgDialogForm = reactive({
  orgName: '',
  brName: '',
  targetIndex: -1,
  targetType: '' // 'loan' | 'credit'
});

// 计算属性：贷款相关统计
const loanInstitutionCount = computed(() => {
  if (!reportData.value.loanDetails || reportData.value.loanDetails.length === 0) return '-';
  const institutions = new Set(reportData.value.loanDetails.map(item => item.brName).filter(Boolean));
  return institutions.size;
});

const loanBalance = computed(() => {
  if (!reportData.value.loanDetails || reportData.value.loanDetails.length === 0) return null;
  const total = reportData.value.loanDetails.reduce((sum, item) => {
    const balance = parseFloat(item.balance) || 0;
    return sum + (balance / 10000); // 转换为万元
  }, 0);
  return total > 0 ? total.toFixed(2) : null;
});

const responsibilityInstitutionCount = computed(() => {
  if (!reportData.value.responsibilityDetails || reportData.value.responsibilityDetails.length === 0) return '-';
  const institutions = new Set(reportData.value.responsibilityDetails.map(item => item.brName).filter(Boolean));
  return institutions.size;
});

const responsibilityBalance = computed(() => {
  if (!reportData.value.responsibilityDetails || reportData.value.responsibilityDetails.length === 0) return null;
  const total = reportData.value.responsibilityDetails.reduce((sum, item) => {
    const balance = parseFloat(item.balance) || 0;
    return sum + (balance / 10000); // 转换为万元
  }, 0);
  return total > 0 ? total.toFixed(2) : null;
});

// 历史数据分析列表
const historicalDataList = computed(() => reportData.value.historicalData || []);

// 将金额转换为万元（除以10000）
function parseIntAndDivided10000(value) {
  if (value === null || value === undefined || value === '' || value === '--') {
    return null;
  }
  const num = parseInt(value);
  if (isNaN(num)) {
    return null;
  }
  return num / 10000;
}

// 安全地相加两个数字并转换为万元（处理 null/undefined/字符串）
function safeAddAndConvertToWan(value1, value2) {
  const num1 = value1 === null || value1 === undefined || value1 === '' ? 0 : parseFloat(value1) || 0;
  const num2 = value2 === null || value2 === undefined || value2 === '' ? 0 : parseFloat(value2) || 0;
  const sum = num1 + num2;
  if (isNaN(sum) || sum === 0) {
    return null;
  }
  return sum / 10000;
}

// 安全相加两个“万元”金额（用于历史数据分析汇总展示）
function safeAddAmounts(value1, value2) {
  const num1 = value1 === null || value1 === undefined || value1 === '' ? 0 : parseFloat(value1) || 0;
  const num2 = value2 === null || value2 === undefined || value2 === '' ? 0 : parseFloat(value2) || 0;
  const sum = num1 + num2;
  if (isNaN(sum) || sum === 0) {
    return null;
  }
  return parseFloat(sum.toFixed(2));
}

// 判断数值是否大于0
function isPositive(val) {
  const num = parseFloat(val);
  return !isNaN(num) && num > 0;
}

// 判断账户状态是否为异常（非“正常”、关注）
function isAbnormalStatus(status) {
  if (!status) return false;
  return status !== '正常' && status !== '关注';
}

// 判断五级分类是否为异常（非“正常”或类似标识）
function isAbnormalFive(five) {
  if (!five) return false;
  return five !== '正常' && five !== '关注';
}

// 计算属性：负债情况汇总（根据后端逻辑构建）
const liabilitySummary = computed(() => {
  if (!reportData.value || Object.keys(reportData.value).length === 0) {
    return [];
  }

  const data = reportData.value;
  const summary = [];

  // 1. 非循环贷账户
  if(data.noncycleAcc > 0){
    summary.push({
      accountType: '非循环贷账户',
      institutionCount: data.noncycleOrgNum || '0',
      accountCount: data.noncycleAcc || '0',
      totalCredit: parseIntAndDivided10000(data.noncycleAmt),
      balance: parseIntAndDivided10000(data.noncycleBal),
      avgRepayment: parseIntAndDivided10000(data.noncycle6mavg)
    });
  }
  

  // 2. 循环贷账户
  if(data.cycleAcc > 0){
    summary.push({
      accountType: '循环贷账户',
      institutionCount: data.cycleOrgNum || '0',
      accountCount: data.cycleAcc || '0',
      totalCredit: parseIntAndDivided10000(data.cycleAmt),
      balance: parseIntAndDivided10000(data.cycleBal),
      avgRepayment: parseIntAndDivided10000(data.cycle6mavg)
    });
  }

  // 3. 循环额度账户
  if(data.cyclelmtAcc > 0){
    summary.push({
      accountType: '循环额度账户',
      institutionCount: data.cyclelmtOrgNum || '0',
      accountCount: data.cyclelmtAcc || '0',
      totalCredit: parseIntAndDivided10000(data.cyclelmtAmt),
      balance: parseIntAndDivided10000(data.cyclelmtBal),
      avgRepayment: parseIntAndDivided10000(data.cyclelmt6mavg)
    });
  }

  // 4. 贷记卡账户
  if(data.creditAcc > 0){
    summary.push({
      accountType: '贷记卡账户',
      institutionCount: data.creditOrgNum || '0',
      accountCount: data.creditAcc || '0',
      totalCredit: parseIntAndDivided10000(data.creditAmt),
      balance: parseIntAndDivided10000(data.creditUsed),
      avgRepayment: parseIntAndDivided10000(data.credit6mavg)
    });
  }
  

  // 5. 准贷记卡账户
  if(data.screditAcc > 0){
    summary.push({
      accountType: '准贷记卡账户',
      institutionCount: data.screditOrgNum || '0',
      accountCount: data.screditAcc || '0',
      totalCredit: parseIntAndDivided10000(data.screditAmt),
      balance: parseIntAndDivided10000(data.screditUsed),
      avgRepayment: parseIntAndDivided10000(data.scredit6mavg)
    });
  }
  

  // 6. 总计（计算所有账户类型的总和）
  let orgTotal = 0;
  let accTotal = 0;
  let amtTotal = 0;
  let balTotal = 0;
  let mavgTotal = 0;

  summary.forEach(item => {
    const orgNum = parseInt(item.institutionCount) || 0;
    const accNum = parseInt(item.accountCount) || 0;
    const amt = item.totalCredit || 0;
    const bal = item.balance || 0;
    const mavg = item.avgRepayment || 0;

    // 对于机构数，需要去重计算（这里简化处理，直接累加）
    orgTotal += orgNum;
    accTotal += accNum;
    amtTotal += amt;
    balTotal += bal;
    mavgTotal += mavg;
  });

  summary.push({
    accountType: '总计',
    institutionCount: orgTotal > 0 ? orgTotal.toString() : '0',
    accountCount: accTotal > 0 ? accTotal.toString() : '0',
    totalCredit: amtTotal > 0 ? amtTotal : null,
    balance: balTotal > 0 ? balTotal : null,
    avgRepayment: mavgTotal > 0 ? mavgTotal : null
  });

  return summary;
});

// 计算属性：信贷交易违约情况（根据后端逻辑构建）
const defaultTypeList = computed(() => {
  if (!reportData.value || Object.keys(reportData.value).length === 0) {
    return [];
  }

  const data = reportData.value;
  const defaultList = [];

  // 1. 被追偿 - 资产处置业务
  defaultList.push({
    defaultType: '被追偿',
    type: '资产处置业务',
    accountCount: data.assetDisposalAcc || '0',
    balance: parseIntAndDivided10000(data.assetDisposalBal)
  });

  // 2. 被追偿 - 垫款业务
  defaultList.push({
    defaultType: '被追偿',
    type: '垫款业务',
    accountCount: data.disbursementAcc || '0',
    balance: parseIntAndDivided10000(data.disbursementBal)
  });

  // 3. 呆账 - 呆账
  defaultList.push({
    defaultType: '呆账',
    type: '呆账',
    accountCount: data.debtsAcc || '0',
    balance: parseIntAndDivided10000(data.debtsBal)
  });

  // 4. 逾期汇总 - 非循环贷账户
  defaultList.push({
    defaultType: '逾期汇总',
    type: '非循环贷账户',
    accountCount: data.noncycleDetAcc || '0',
    balance: parseIntAndDivided10000(data.noncycleDetMamt)
  });

  // 5. 逾期汇总 - 循环贷账户
  defaultList.push({
    defaultType: '逾期汇总',
    type: '循环贷账户',
    accountCount: data.cycleDetAcc || '0',
    balance: parseIntAndDivided10000(data.cycleDetMamt)
  });

  // 6. 逾期汇总 - 循环额度下账户
  defaultList.push({
    defaultType: '逾期汇总',
    type: '循环额度下账户',
    accountCount: data.cyclelmtDetAcc || '0',
    balance: parseIntAndDivided10000(data.cyclelmtDetMamt)
  });

  // 7. 逾期汇总 - 贷记卡账户
  defaultList.push({
    defaultType: '逾期汇总',
    type: '贷记卡账户',
    accountCount: data.creditDetAcc || '0',
    balance: parseIntAndDivided10000(data.creditDetMamt)
  });

  // 8. 逾期汇总 - 准贷记卡账户
  defaultList.push({
    defaultType: '逾期汇总',
    type: '准贷记卡账户',
    accountCount: data.screditDetAcc || '0',
    balance: parseIntAndDivided10000(data.screditDetMamt)
  });

  // 过滤掉账户数为0的项
  return defaultList.filter(item => {
    const accountCount = parseInt(item.accountCount) || 0;
    return accountCount > 0;
  });
});

// 计算属性：非信贷交易违约情况（根据后端逻辑构建）
const nonCreditDefaultList = computed(() => {
  if (!reportData.value || Object.keys(reportData.value).length === 0) {
    return [];
  }

  const data = reportData.value;
  const defaultList = [];

  // 1. 电信业务
  defaultList.push({
    transactionType: '电信业务',
    accountCount: data.busTelecomAcc || '0',
    arrearsAmount: parseIntAndDivided10000(data.busTelecomAmt)
  });

  // 2. 自来水业务
  defaultList.push({
    transactionType: '自来水业务',
    accountCount: data.busWaterAcc || '0',
    arrearsAmount: parseIntAndDivided10000(data.busWaterAmt)
  });

  // 3. 欠税信息
  defaultList.push({
    transactionType: '欠税信息',
    accountCount: data.owetaxNum || '0',
    arrearsAmount: parseIntAndDivided10000(data.owetaxAmt)
  });

  // 4. 民事判决信息
  defaultList.push({
    transactionType: '民事判决信息',
    accountCount: data.civilNum || '0',
    arrearsAmount: parseIntAndDivided10000(data.civilAmt)
  });

  // 5. 强制执行信息
  defaultList.push({
    transactionType: '强制执行信息',
    accountCount: data.enforceNum || '0',
    arrearsAmount: parseIntAndDivided10000(data.enforceAmt)
  });

  // 6. 行政处罚信息
  defaultList.push({
    transactionType: '行政处罚信息',
    accountCount: data.penaltyNum || '0',
    arrearsAmount: parseIntAndDivided10000(data.penaltyAmt)
  });

  // 过滤掉账户数为0的项
  return defaultList.filter(item => {
    const accountCount = parseInt(item.accountCount) || 0;
    return accountCount > 0;
  });
});

// 安全地相加两个数字（处理 null/undefined/字符串）
function safeAdd(value1, value2) {
  const num1 = value1 === null || value1 === undefined || value1 === '' ? 0 : parseFloat(value1) || 0;
  const num2 = value2 === null || value2 === undefined || value2 === '' ? 0 : parseFloat(value2) || 0;
  const sum = num1 + num2;
  return isNaN(sum) ? 0 : sum;
}

// 格式化数量（处理 0 的情况）
function formatCount(value) {
  if (value === null || value === undefined || value === '' || value === 0) {
    return '-';
  }
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) {
    return '-';
  }
  return num.toString();
}

// 格式化金额（万元）
function formatAmount(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return '-';
  }
  if (num === 0) {
    return '0.00';
  }
  return num.toFixed(2);
}

// 格式化日期时间
function formatDateTime(date) {
  if (!date) return '';
  return parseTime(date, '{y}-{m}-{d} {h}:{i}:{s}');
}

// 规范机构名称字段，优先使用 orgName，其次 brName
function normalizeOrgNameList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const orgName = item.orgName || item.brName || '';
    return {
      ...item,
      orgName,
      brName: orgName || item.brName || ''
    };
  });
}

// 获取报告详情
function getReportDetailData() {
  const reportNo = route.query.reportNo || route.params.reportNo;
  if (!reportNo) {
    ElMessage.error('缺少报告编号参数');
    router.back();
    return;
  }

  loading.value = true;
  
  // 并行获取基本信息、贷款明细、信用卡明细、信用卡汇总和相关还款责任明细
  Promise.all([
    queryBaseInfo(reportNo),
    queryLoanInfos(reportNo),
    getBcrCreditcardInfos(reportNo),
    getBcrCreditCardSummary(reportNo),
    getBcrOtherLoanInfos(reportNo)
  ]).then(async ([baseInfoResponse, loanInfoResponse, creditcardInfoResponse, creditCardSummaryResponse, otherLoanInfoResponse]) => {
    // 处理基本信息
    if (baseInfoResponse.code === 200 && baseInfoResponse.data) {
      const baseInfo = baseInfoResponse.data;
      // 合并所有后端返回的数据，同时映射特殊字段
      reportData.value = {
        ...baseInfo, // 先合并所有原始数据
        // 然后覆盖/映射特殊字段
        reportNo: baseInfo.reportNo || reportNo,
        queryTime: baseInfo.reportDate || '',
        custName: baseInfo.name || '',
        idNo: baseInfo.idNo || '',
        creditScore: baseInfo.personScore || '0',
        digitalInterpretation: baseInfo.personScore || '0', // 数字解读说明，暂时使用信用评分
        riskAlert: baseInfo.riskWarning || '',
        riskScore: baseInfo.personScore || '',
        gradeClassification: '' // 等级划分需要根据分数计算或从其他地方获取
      };

      let formData1 = new FormData();
      formData1.append("module","个人信用")
      formData1.append("operContent","查看分析报告")
      formData1.append("idNo",reportData.value.idNo)
      formData1.append("custName",reportData.value.custName)
      formData1.append("remark1", reportData.value.custName+"-"+reportData.value.idNo+"-"+reportData.value.reportNo)
      operateLog(formData1)

      // 获取历史数据分析（近三年每季度最后一次报告）
      try {
        const historyRes = await getReportHistory(baseInfo.idNo || '', baseInfo.reportDate || '');
        if (historyRes && historyRes.code === 200 && Array.isArray(historyRes.data)) {
          // 将后端返回的 BcrSta 列表转换为历史数据分析表需要的结构（单位：万元）
          reportData.value.historicalData = historyRes.data.map((sta) => {
            const normalBalWan = safeAddAndConvertToWan(sta.normalBal0, sta.normalBal1);
            const creditUsedWan = parseIntAndDivided10000(sta.creditUsed);
            const relatedWan = safeAddAmounts(
              safeAddAndConvertToWan(sta.busGuaranBal, sta.perGuaranBal),
              safeAddAndConvertToWan(sta.busOtherBal, sta.perOtherBal)
            );
            const overdueWan = parseIntAndDivided10000(
              safeAdd(sta.overdueAmount, safeAdd(sta.overdueBal0, sta.overdueBal1))
            );
            const badDebtWan = parseIntAndDivided10000(sta.debtsBal);

            return {
              date: sta.reportDate || '-',
              institutionCount: sta.loanOrgNum || '-',
              loanBalance: normalBalWan,
              cardInstitutionCount: sta.creditOrgNum || '-',
              creditCardOverdraftBalance: creditUsedWan,
              relatedRepaymentResponsibility: relatedWan,
              overdueAmount: overdueWan,
              badDebtAmount: badDebtWan
            };
          });
        } else {
          reportData.value.historicalData = [];
        }
      } catch (e) {
        console.warn('获取历史数据分析失败:', e);
        reportData.value.historicalData = [];
      }
    } else {
      ElMessage.error(baseInfoResponse.msg || '获取基本信息失败');
    }

    // 处理贷款明细信息
    if (loanInfoResponse.code === 200 && loanInfoResponse.data) {
      // 如果返回的是数组，直接赋值；如果是对象，可能需要处理
      if (Array.isArray(loanInfoResponse.data)) {
        reportData.value.loanDetails = normalizeOrgNameList(loanInfoResponse.data);
      } else if (loanInfoResponse.data.list) {
        reportData.value.loanDetails = normalizeOrgNameList(loanInfoResponse.data.list);
      } else if (loanInfoResponse.data.loanDetails) {
        reportData.value.loanDetails = normalizeOrgNameList(loanInfoResponse.data.loanDetails);
      } else {
        // 如果返回的是单个对象，包装成数组
        reportData.value.loanDetails = normalizeOrgNameList([loanInfoResponse.data]);
      }
    } else {
      console.warn('获取贷款明细失败:', loanInfoResponse.msg || '未知错误');
      reportData.value.loanDetails = [];
    }

    // 处理信用卡明细信息
    if (creditcardInfoResponse.code === 200 && creditcardInfoResponse.data) {
      // 如果返回的是数组，直接赋值；如果是对象，可能需要处理
      if (Array.isArray(creditcardInfoResponse.data)) {
        reportData.value.creditCardDetails = normalizeOrgNameList(creditcardInfoResponse.data);
      } else if (creditcardInfoResponse.data.list) {
        reportData.value.creditCardDetails = normalizeOrgNameList(creditcardInfoResponse.data.list);
      } else if (creditcardInfoResponse.data.creditCardDetails) {
        reportData.value.creditCardDetails = normalizeOrgNameList(creditcardInfoResponse.data.creditCardDetails);
      } else {
        // 如果返回的是单个对象，包装成数组
        reportData.value.creditCardDetails = normalizeOrgNameList([creditcardInfoResponse.data]);
      }
    } else {
      console.warn('获取信用卡明细失败:', creditcardInfoResponse.msg || '未知错误');
      reportData.value.creditCardDetails = [];
    }

    // 处理信用卡汇总信息
    if (creditCardSummaryResponse.code === 200 && creditCardSummaryResponse.data) {
      reportData.value.creditCardSummary = creditCardSummaryResponse.data;
    } else {
      console.warn('获取信用卡汇总失败:', creditCardSummaryResponse.msg || '未知错误');
      reportData.value.creditCardSummary = null;
    }

    // 处理相关还款责任明细信息
    if (otherLoanInfoResponse.code === 200 && otherLoanInfoResponse.data) {
      // 如果返回的是数组，直接赋值；如果是对象，可能需要处理
      if (Array.isArray(otherLoanInfoResponse.data)) {
        reportData.value.responsibilityDetails = otherLoanInfoResponse.data;
      } else if (otherLoanInfoResponse.data.list) {
        reportData.value.responsibilityDetails = otherLoanInfoResponse.data.list;
      } else if (otherLoanInfoResponse.data.responsibilityDetails) {
        reportData.value.responsibilityDetails = otherLoanInfoResponse.data.responsibilityDetails;
      } else {
        // 如果返回的是单个对象，包装成数组
        reportData.value.responsibilityDetails = [otherLoanInfoResponse.data];
      }
    } else {
      console.warn('获取相关还款责任明细失败:', otherLoanInfoResponse.msg || '未知错误');
      reportData.value.responsibilityDetails = [];
    }

    loading.value = false;
    
    // 数据加载完成后更新图表
    nextTick(() => {
      updateChart();
    });
  }).catch(error => {
    console.error('获取报告详情失败:', error);
    ElMessage.error('获取报告详情失败，请稍后重试');
    loading.value = false;
  });
}

// PDF下载
function donwloadReport() {
  const element = report.value;
  if (!element) {
    ElMessage.error('报告内容未加载');
    return;
  }

  //打印 pdf 时掩藏折线图
  const chartBlock = element.querySelector('.chart-block-no-pdf');
  const chartBlockDisplay = chartBlock ? chartBlock.style.display : '';
  if(chartBlock){
    chartBlock.style.display = 'none';
  }
  
  const opt = {
    margin: 0,
    filename: (reportData.value.custName || '客户信息报告') + (reportData.value.reportNo || '') + '.pdf',
    image: { type: 'jpeg', quality: 0.8 },
    html2canvas: {
      scale: 2,
    },
    pagebreak: { mode: 'avoid-all', before: '#pageBreak' },
    jsPDF: {
      orientation: 'p',
      unit: 'mm',
      format: 'A4',
      putOnlyUsedFonts: true,
      floatPrecision: 1,
    },
    pagebreak: { mode: 'avoid-all' }
  };
  
  html2pdf().set(opt).from(element).save().then(() => {
    if(chartBlock){
      chartBlock.style.display = chartBlockDisplay;
    }
  })
  .catch(() => {
    if(chartBlock){
      chartBlock.style.display = chartBlockDisplay;
    }
  })
}

// 返回
function close() {
  const obj = { path: "/credit/xy/person" };
  proxy.$tab.closeOpenPage(obj);
}

// 打开机构名称编辑弹窗
function openOrgDialog(item, index, type) {
  orgDialogForm.orgName = item.orgName || item.brName || '';
  orgDialogForm.brName = item.brName || '';
  orgDialogForm.nos = item.nos;
  orgDialogForm.targetType = type;
  orgDialogVisible.value = true;
}

// 确认修改机构名称（前端展示）
function confirmOrgName() {
  editOrgName(orgDialogForm.targetType, reportData.value.reportNo, orgDialogForm.nos, orgDialogForm.orgName).then(res => {
    if (res.code === 200) {
      ElMessage.success('修改机构名称成功');
      orgDialogVisible.value = false;
      if(orgDialogForm.targetType == 'loan'){
        queryLoanInfos(reportData.value.reportNo).then(res => {
          if (res.code === 200) {
            reportData.value.loanDetails = res.data;
          }
        });
      }
      if(orgDialogForm.targetType == 'credit'){
        getBcrCreditcardInfos(reportData.value.reportNo).then(res => {
          if (res.code === 200) {
            reportData.value.creditCardDetails = res.data;
          }
        });
      }
      if(orgDialogForm.targetType == 'responsibility'){
        getBcrOtherLoanInfos(reportData.value.reportNo).then(res => {
          if (res.code === 200) {
            reportData.value.responsibilityDetails = res.data;
          }
        });
      }
    } else {
      ElMessage.error(res.msg || '修改机构名称失败');
    }
  });
  
}

// 初始化图表
function initChart() {
  if (!chartContainer.value) return;
  
  // 如果已存在图表实例，先销毁
  if (myChart) {
    myChart.dispose();
  }
  
  myChart = echarts.init(document.getElementById('historyChart'));
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (myChart) {
      myChart.resize();
    }
  });
}

// 更新图表数据
function updateChart() {
  if (!historicalDataList.value || historicalDataList.value.length === 0) {
    showChart.value = false;
    return;
  }

  showChart.value = true;
  
  nextTick(() => {
    if (!myChart) {
      initChart();
    }
    
    if (!myChart) return;

    // 准备图表数据
    const xData = [];
    const loanBalanceData = [];
    const creditCardBalanceData = [];
    const relatedResponsibilityData = [];
    const overdueAmountData = [];
    const badDebtAmountData = [];

    historicalDataList.value.forEach(item => {
      xData.push(item.date || '');
      loanBalanceData.push(item.loanBalance || 0);
      creditCardBalanceData.push(item.creditCardOverdraftBalance || 0);
      relatedResponsibilityData.push(item.relatedRepaymentResponsibility || 0);
      overdueAmountData.push(item.overdueAmount || 0);
      badDebtAmountData.push(item.badDebtAmount || 0);
    });

    const option = {
      title: {
        text: '历史数据趋势图（万元）',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['贷款余额', '信用卡透支余额', '相关还款责任', '逾期金额', '呆账金额'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
        name: '时间'
      },
      yAxis: {
        type: 'value',
        name: '金额（万元）'
      },
      series: [
        {
          name: '贷款余额',
          type: 'line',
          data: loanBalanceData,
          showSymbol: true
        },
        {
          name: '信用卡透支余额',
          type: 'line',
          data: creditCardBalanceData,
          showSymbol: true
        },
        {
          name: '相关还款责任',
          type: 'line',
          data: relatedResponsibilityData,
          showSymbol: true
        },
        {
          name: '逾期金额',
          type: 'line',
          data: overdueAmountData,
          showSymbol: true,
          itemStyle: {
            color: '#ff0000'
          }
        },
        {
          name: '呆账金额',
          type: 'line',
          data: badDebtAmountData,
          showSymbol: true,
          itemStyle: {
            color: '#ff6600'
          }
        }
      ]
    };

    myChart.setOption(option);
  });
}

// 监听路由参数变化，重新加载数据
// watch(
//   () => route.query.reportNo || route.params.reportNo,
//   (newReportNo, oldReportNo) => {
//     if (newReportNo && newReportNo !== oldReportNo) {
//       // 清空旧数据
//       reportData.value = {};
//       // 重新加载数据
//       getReportDetailData();
//     }
//   }
// );

onMounted(() => {
  getReportDetailData();
});

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  // 移除窗口大小监听
  window.removeEventListener('resize', () => {
    if (myChart) {
      myChart.resize();
    }
  });
});
</script>

<style lang="scss" scoped>  
.my-container {
  position: relative;
  box-sizing: border-box;
  padding: 0 12%;
  background-color: #FFF;
  
  .backbtn {
    position: absolute;
    top: 80px;
    right: 40px;
  }
  
  .download {
    position: absolute;
    right: 38px;
    top: 20px;
    font-size: 16px;
  }
}

.tdFont {
  font-weight: 600;
}

.report {
  position: relative;
  margin: 0 auto 50px;
  display: flex;
  flex-direction: column;
  width: 96%;
  font-size: 12px;
  
  .text-right {
    text-align: right;
  }
  
  .report-header, .report-footer {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    span:nth-child(n-1) {
      width: 50%;
    }
    span:nth-child(2),
    span:nth-child(5) {
      text-align: right;
    }
    span:nth-child(n + 3) {
      width: 31%;
    }
  }
  
  .report-body {
    margin-top: 26px;
    
    .report-body-item-title {
      width: 100%;
      margin-top: 15px;
      font-size: 18px;
      font-weight: 600;
      padding: 10px;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-top: 1px solid #000;
      background-color: #e1ebff;
      text-align: center;
    }
    
    .report-body-lable {
      width: 40%;
      text-align: right;
      margin-right: 10px;
    }
    
    .report-body-item-tab {
      flex-direction: row;
      display: flex;
      font-size: 16px;
      height: 30px;
      align-items: center;
      background: rgb(178, 182, 184);
    }
    
    .report-body-item-table {
      width: 100%;
      border-spacing: 1px;
      border-collapse: separate;
      background: #000;
      
      td {
        height: 30px;
        background-color: #fff;
        text-align: center;
        padding: 5px;
      }
    }
    
    .color-red {
      color: red;
    }
    
    .border-bottom {
      border-bottom: 1px solid #000;
    }
    
    .report-body-canav {
      height: 400px;
      width: 100%;
      background: #fff;
      margin-top: 10px;
    }
  }
  
  .report-footer {
    padding: 20px 0;
  }
}

.text-center {
  text-align: center;
}
</style>
