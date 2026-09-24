<template>
  <div class="app-container">
    <el-card class="box-card" v-loading="loading">
      <!-- 标题和操作区 -->
      <div class="custom-header">
        <div class="header-title">{{ processData.bankName || '农商银行' }}贷款利率定价表</div>
        <div class="header-date-row">
          <span class="header-branch">网点：{{ processData.deptName }}</span>
          <span class="header-date">定价日期：{{ pricingData.priceDate }}</span>
          <span class="header-unit">单位：万元、BP</span>
        </div>
      </div>

      <!-- 客户信息区 -->
      <div class="customer-info">
        <table class="info-table">
          <tr>
            <td class="label">客户号</td>
            <td>{{ processData.customerNo }}</td>
            <td class="label">客户名称</td>
            <td colspan="2">{{ processData.customerName }}</td>
          </tr>
          <tr>
            <td class="label">申贷金额</td>
            <td class="label">原欠贷款</td>
            <td class="label">其中：信用</td>
            <td class="label">保证</td>
            <td class="label">抵（质）押</td>
          </tr>
          <tr>
            <td>{{ pricingData.applyAmount }}</td>
            <td>{{ pricingData.originalDebt }}</td>
            <td>{{ pricingData.credit }}</td>
            <td>{{ pricingData.guarantee }}</td>
            <td>{{ pricingData.collateral }}</td>
          </tr>
        </table>
      </div>

      <!-- 存款信息区 -->
      <div class="deposit-info">
        <h3 class="section-title">存款信息</h3>
        <table class="process-table">
          <thead>
            <tr>
              <th width="15%">存款人姓名</th>
              <th width="15%">关系类型</th>
              <th width="15%">客户号</th>
              <th width="15%">定期余额(万元)</th>
              <th width="15%">活期余额(万元)</th>
              <th width="25%">折算存款(万元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in depositList" :key="index">
              <td>{{ item.depositorName }}</td>
              <td>{{ typeMap[item.relationType] }}</td>
              <td>{{ item.customerNo }}</td>
              <td>{{ item.fixedDeposit || 0 }}</td>
              <td>{{ item.currentDeposit || 0 }}</td>
              <td>{{ item.totalDeposit || 0 }}</td>
            </tr>
            <tr v-if="!depositList.length">
              <td colspan="6" class="empty-text">暂无存款信息</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 定价计算过程 -->
      <div class="pricing-process">
        <h3 class="section-title">定价计算过程</h3>
        <table class="process-table">
          <thead>
            <tr>
              <th width="10%">项目号</th>
              <th width="20%">指标名称</th>
              <th width="50%">定价说明</th>
              <th width="20%">加减BP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pricingItems" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td v-html="item.description"></td>
              <td>{{ item.bp }}</td>
            </tr>
            <tr class="total-row">
              <td>合计</td>
              <td colspan="2">LPR利率：{{ pricingData.lprValue || 0 }}{{ '%' }}; 最低限值：{{ pricingData.minRate || 0 }}{{ '%' }}; 定价利率: {{ pricingData.finalRate || 0 }}{{ '%' }}</td>
              <td>{{ totalBP }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 特别定价原因 -->
      <div class="special-pricing-reason" v-if="pricingData.remarks">
        <h3 class="section-title">特别定价原因</h3>
        <div class="reason-box">
          {{ pricingData.remarks }}
        </div>
      </div>

      <!-- 审批意见区 -->
      <div class="approval-opinions">
        <h3 class="section-title">审批意见</h3>
        <div class="opinion-box" :class="{'empty': allOpinions.length === 0}">
          <template v-if="allOpinions.length">
            <div v-for="(item, idx) in allOpinions" :key="idx" style="margin-bottom: 10px;">
              <div>
                <strong>{{ item.node }}：</strong>{{ item.remark }}
              </div>
              <div style="font-size: 13px; color: #888;">
                审批人：{{ item.approver }}　日期：{{ item.date }}
              </div>
            </div>
          </template>
          <template v-else>
            暂无审批意见
          </template>
        </div>
      </div>

      <!-- 流程状态时间线 -->
      <div class="process-timeline">
        <h3 class="section-title">流程进度</h3>
        <el-timeline>
          <el-timeline-item 
            type="primary" 
            timestamp="发起阶段"
            placement="top"
          >
            <div class="timeline-content">
              <h4>由 {{ processData.createUserName }} 发起</h4>
              <p>时间: {{ parseTime(processData.createTime) }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="processData.reviewTime || processData.status === '01'"
            :type="processData.reviewTime ? 'success' : 'warning'"
            timestamp="审查阶段" 
            placement="top"
          >
            <div class="timeline-content">
              <h4 v-if="processData.reviewTime">
                由 {{ processData.reviewerName }} 审查{{ processData.status === '06' ? '退回' : '通过' }}
              </h4>
              <h4 v-else>待审查</h4>
              <p v-if="processData.reviewTime">时间: {{ parseTime(processData.reviewTime) }}</p>
              <p v-if="processData.reviewRemark">意见: {{ processData.reviewRemark }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="processData.branchApproveTime || processData.status === '02'"
            :type="processData.branchApproveTime ? 'success' : 'warning'"
            timestamp="支行审批阶段" 
            placement="top"
          >
            <div class="timeline-content">
              <h4 v-if="processData.branchApproveTime">
                由 {{ processData.branchApproverName }} 审批{{ processData.status === '06' ? '退回' : '通过' }}
              </h4>
              <h4 v-else>待支行审批</h4>
              <p v-if="processData.branchApproveTime">时间: {{ parseTime(processData.branchApproveTime) }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="processData.headApproveTime || processData.status === '03'"
            :type="processData.headApproveTime ? 'success' : 'warning'"
            timestamp="总行审批阶段" 
            placement="top"
          >
            <div class="timeline-content">
              <h4 v-if="processData.headApproveTime">
                由 {{ processData.headApproverName }} 审批{{ processData.status === '06' ? '退回' : '通过' }}
              </h4>
              <h4 v-else>待总行审批</h4>
              <p v-if="processData.headApproveTime">时间: {{ parseTime(processData.headApproveTime) }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="processData.status === '04'"
            type="success"
            timestamp="已完成" 
            placement="top"
          >
            <div class="timeline-content">
              <h4>流程已完成</h4>
              <p>定价利率: {{ pricingData.finalRate }}%</p>
              <p>加点BP: {{ totalBP }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="processData.status === '09'"
            type="danger"
            timestamp="已作废" 
            placement="top"
          >
            <div class="timeline-content">
              <h4>流程已作废</h4>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 底部操作按钮区域 -->
    <div class="bottom-actions">
      <el-button type="primary" @click="printTable">打印</el-button>
      
      
      <!-- 审查按钮：只有客户经理角色可以显示 -->
      <el-button 
        v-if="processData.status == '01' && !isSameUser(processData.userName) && hasManagerRole" 
        type="success" 
        @click="openReviewDialog" 
        :disabled="isSameUser(processData.userName)"
      >审查</el-button>

      <!-- 支行审批按钮：网点负责人、副行长、行长可以显示 -->
      <el-button 
        v-if="processData.status == '02' && !isSameUser(processData.userName) && hasBranchApprovalRole" 
        type="success" 
        @click="openBranchApproveDialog"
        :disabled="isSameUser(processData.userName)"
      >支行审批</el-button>
      
      <!-- 总行审批按钮：总行角色且需要总行审批的流程才显示 -->
      <el-button 
        v-if="processData.status == '03' && !isSameUser(processData.userName) && hasHeadOfficeRole && processData.isUseHeadPower == '1'" 
        type="success" 
        @click="openHeadApproveDialog"
        :disabled="isSameUser(processData.userName)"
      >总行审批</el-button>
      
      <el-button @click="goBack">返回</el-button>
    </div>

    <!-- 打印专用隐藏区域 -->
    <div id="printArea" class="print-only">
      <div class="custom-header">
        <div class="header-title">{{ processData.bankName || '农商银行' }}贷款利率定价表</div>
        <div class="header-date-row">
          <span class="header-branch">网点：{{ processData.deptName }}</span>
          <span class="header-date">定价日期：{{ pricingData.priceDate }}</span>
          <span class="header-unit">单位：万元、BP</span>
        </div>
      </div>
      
      <div class="print-customer-info">
        <table class="print-info-table">
          <tr>
            <td class="print-label">客户号</td>
            <td>{{ processData.customerNo }}</td>
            <td class="print-label">客户名称</td>
            <td colspan="2">{{ processData.customerName }}</td>
          </tr>
          <tr>
            <td class="print-label">申贷金额</td>
            <td class="print-label">原欠贷款</td>
            <td class="print-label">其中：信用</td>
            <td class="print-label">保证</td>
            <td class="print-label">抵（质）押</td>
          </tr>
          <tr>
            <td>{{ pricingData.applyAmount }}</td>
            <td>{{ pricingData.originalDebt }}</td>
            <td>{{ pricingData.credit }}</td>
            <td>{{ pricingData.guarantee }}</td>
            <td>{{ pricingData.collateral }}</td>
          </tr>
        </table>
      </div>
      
      <div class="print-deposit-info">
        <h3 class="print-section-title">存款信息</h3>
        <table class="print-process-table">
          <thead>
            <tr>
              <th width="15%">存款人姓名</th>
              <th width="15%">关系类型</th>
              <th width="15%">客户号</th>
              <th width="15%">定期余额(万元)</th>
              <th width="15%">活期余额(万元)</th>
              <th width="25%">折算存款(万元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in depositList" :key="index">
              <td>{{ item.depositorName }}</td>
              <td>{{ typeMap[item.relationType] }}</td>
              <td>{{ item.customerNo }}</td>
              <td>{{ item.fixedDeposit || 0 }}</td>
              <td>{{ item.currentDeposit || 0 }}</td>
              <td>{{ item.totalDeposit || 0 }}</td>
            </tr>
            <tr v-if="!depositList.length">
              <td colspan="6" class="print-empty-text">暂无存款信息</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="print-pricing-process">
        <h3 class="print-section-title">定价计算过程</h3>
        <table class="print-process-table">
          <thead>
            <tr>
              <th width="10%">项目号</th>
              <th width="20%">指标名称</th>
              <th width="50%">定价说明</th>
              <th width="20%">加减BP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pricingItems" :key="index">
              <td align="center">{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td v-html="item.description"></td>
              <td>{{ item.bp }}</td>
            </tr>
            <tr class="print-total-row">
              <td>合计</td>
              <td colspan="2">LPR利率：{{ pricingData.lprValue || 0 }}{{ '%' }} 最低限值：{{ pricingData.minRate || 0 }}{{ '%' }} 定价利率: {{ pricingData.finalRate || 0 }}{{ '%' }}</td>
              <td>{{ totalBP }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="print-special-pricing-reason" v-if="pricingData.remarks">
        <h3 class="print-section-title">特别定价原因</h3>
        <div class="print-reason-box">
          {{ pricingData.remarks }}
        </div>
      </div>
      
      <div class="print-approval-opinions">
        <h3 class="print-section-title">审批意见</h3>
        <div class="print-opinion-box" :class="{'print-empty': allOpinions.length === 0}">
          <template v-if="allOpinions.length">
            <div v-for="(item, idx) in allOpinions" :key="idx" style="margin-bottom: 10px;">
              <div>
                <strong>{{ item.node }}：</strong>{{ item.remark }}
              </div>
              <div style="font-size: 13px; color: #888;">
                审批人：{{ item.approver }}　日期：{{ item.date }}
              </div>
            </div>
          </template>
          <template v-else>
            暂无审批意见
          </template>
        </div>
      </div>
    </div>

    <!-- 审查对话框 -->
    <el-dialog title="审查" v-model="reviewDialogVisible" width="500px" append-to-body>
      <el-form :model="approveForm" ref="approveForm" label-width="80px" :rules="approveRules">
        <el-form-item label="审批类型">
          <el-radio-group v-model="approveForm.approveType">
            <el-radio label="pass">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="reviewerRemark">
          <el-input type="textarea" v-model="approveForm.reviewerRemark" placeholder="请输入审批意见" :rows="4" maxlength="500" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReviewSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 支行审批对话框 -->
    <el-dialog title="支行审批" v-model="branchApproveDialogVisible" width="500px" append-to-body>
      <el-form :model="approveForm" ref="approveForm" label-width="80px" :rules="approveRules">
        <el-form-item label="审批类型">
          <el-radio-group v-model="approveForm.approveType">
            <el-radio label="pass">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="branchApproveRemark">
          <el-input type="textarea" v-model="approveForm.branchApproveRemark" placeholder="请输入审批意见" :rows="4" maxlength="500" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="branchApproveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBranchApproveSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 总行审批对话框 -->
    <el-dialog title="总行审批" v-model="headApproveDialogVisible" width="500px" append-to-body>
      <el-form :model="approveForm" ref="approveForm" label-width="80px" :rules="approveRules">
        <el-form-item label="审批类型">
          <el-radio-group v-model="approveForm.approveType">
            <el-radio label="pass">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="headApproveRemark">
          <el-input type="textarea" v-model="approveForm.headApproveRemark" placeholder="请输入审批意见" :rows="4" maxlength="500" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="headApproveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleHeadApproveSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getRateProcessByNo } from "@/api/szhl/pricing/customer/rateProcessApi";
import { getRatePrice } from "@/api/szhl/pricing/customer/ratePrice";
import { parseTime } from '@/utils/ruoyi';
import { approve } from "@/api/szhl/pricing/customer/rateProcessApi";
import { custDepositList } from "@/api/szhl/pricing/customer/index";
import useUserStore from '@/store/modules/user';

export default {
  name: "ProcessDetail",
  data() {
    return {
      loading: false,
      submitLoading: false,
      // 流程数据
      processData: {},
      // 定价数据
      pricingData: {
        applyAmount: 0,
        originalDebt: 0,
        credit: 0,
        guarantee: 0,
        collateral: 0,
        finalRate: 0,
        remarks: "",
        priceDate: ""
      },
      // 定价计算项目
      pricingItems: [],
      // 存款信息列表
      depositList: [],
      // 操作类型
      actionType: "",
      // 审批表单
      approveForm: {
        id: "",
        reviewerRemark: "同意通过并继续上报审批！",
        branchApproveRemark: "同意通过并继续上报审批！",
        headApproveRemark: "同意通过并继续上报审批！",
      },
      typeMap: {
        'borrower': '借款人',
        'spouse': '配偶',
        'relatedCompany': '关联企业',
        'legalRepresentative': '法定代表人',
        'legalRepresentativeSpouse': '法定代表人配偶',
        'majorShareholder': '占比50%（不含）以上股东',
        'majorShareholderSpouse': '占比50%（不含）以上股东配偶'
      },
      // 审批表单校验规则
      approveRules: {
        reviewerRemark: [
          { required: true, message: "请输入审批意见", trigger: "blur" },
          { min: 2, max: 500, message: "长度在 2 到 500 个字符", trigger: "blur" }
        ],
        branchApproveRemark: [
          { required: true, message: "请输入审批意见", trigger: "blur" },
          { min: 2, max: 500, message: "长度在 2 到 500 个字符", trigger: "blur" }
        ],
        headApproveRemark: [
          { required: true, message: "请输入审批意见", trigger: "blur" },
          { min: 2, max: 500, message: "长度在 2 到 500 个字符", trigger: "blur" }
        ]
      },
      // 对话框控制
      reviewDialogVisible: false,
      branchApproveDialogVisible: false,
      headApproveDialogVisible: false
    };
  },
  computed: {
    // 总BP值
    totalBP() {
      return this.pricingItems.reduce((sum, item) => sum + parseFloat(item.bp || 0), 0);
    },
    
    // 检查是否有客户经理角色
    hasManagerRole() {
      const userStore = useUserStore();
      const branchRoles = ['manager', 'commander', 'assistant', 'president', 'admin'];
      return userStore.roles.some(role => branchRoles.includes(role));
    },
    
    // 检查是否有支行审批角色（网点负责人、副行长、行长）
    hasBranchApprovalRole() {
      const userStore = useUserStore();
      const branchRoles = ['commander', 'assistant', 'president', 'admin'];
      return userStore.roles.some(role => branchRoles.includes(role));
    },
    
    // 检查是否有总行审批角色
    hasHeadOfficeRole() {
      const userStore = useUserStore();
      const headRoles = ['pricing_process_approve', 'admin'];
      return userStore.roles.some(role => headRoles.includes(role));
    },
    // 合并所有审批意见
    allOpinions() {
      const arr = [];
      // 调查人
      if (this.pricingData.lprValue) {
        const lpr = this.pricingData.lprValue || 0;
        const totalBp = this.pricingData.totalBp || 0;
        const productRateBp = this.pricingData.productRateBp || 0;
        const finalRate = this.pricingData.finalRate || (lpr + totalBp / 100);
        const investigator = this.pricingData.investigatorName || this.pricingData.createBy || "";
        let remark = "";
        remark = `经测算LPR利率为${lpr}%，加点 ${totalBp}个BP，执行利率：${finalRate}%。`;
        remark += '并继续上报审批！';
        arr.push({
          node: "调查人意见",
          approver: `${this.processData.createUserName}（工号：${this.processData.userName || '未知'})`,
          remark,
          date: this.pricingData.createTime ? this.parseTime(this.pricingData.createTime) : ""
        });
      }
      // 审查人
      if (this.processData.reviewerRemark) {
        arr.push({
          node: "审查人意见",
          approver: `${this.processData.reviewerName || ""}（工号：${this.processData.reviewer || '未知'})`,
          remark: this.processData.reviewerRemark,
          date: this.processData.reviewTime ? this.parseTime(this.processData.reviewTime) : ""
        });
      }
      // 支行审批
      if (this.processData.branchApproveRemark) {
        let remark = this.processData.branchApproveRemark;
        // 如果没有总行审批，则支行审批为"同意该笔贷款执行利率"
        // if (!this.processData.headApproveRemark) {
        //   remark = "同意该笔贷款执行利率";
        // }
        arr.push({
          node: "支行审批",
          approver: `${this.processData.branchApproverName || ""}（工号：${this.processData.branchApprover || '未知'})`,
          remark : this.processData.branchApproveRemark,
          date: this.processData.branchApproveTime ? this.parseTime(this.processData.branchApproveTime) : ""
        });
      }
      // 总行审批
      if (this.processData.headApproveRemark) {
        arr.push({
          node: "总行审批",
          approver: `${this.processData.headApproverName || ""}（工号：${this.processData.headApprover || '未知'})`,
          remark: this.processData.headApproveRemark,
          date: this.processData.headApproveTime ? this.parseTime(this.processData.headApproveTime) : ""
        });
      }
      return arr;
    }
  },
  created() {
    const pricingNo = this.$route.params.id;
    // 获取URL中的操作类型参数
    this.actionType = this.$route.query.action || "";
    if (pricingNo) {
      this.getProcessDetail(pricingNo);
      // 获取存款信息
      this.getDepositList(pricingNo);
    } else {
      this.$modal.msgError("未获取到定价编号");
      this.goBack();
    }
  },
  // activated() {
  //   const id = this.$route.params.id;
  //   if (id) {
  //     debugger
  //     this.getProcessDetail(id);
  //   }
  // },
  // watch: {
  //   $route(to, from) {
  //     const newId = to.params.id;
  //     const oldId = from.params.id;
  //     // 只有当ID变化时才重新加载数据
  //     if (newId && newId !== oldId) {
  //       debugger
  //       this.getProcessDetail(newId);
  //     }
  //   }
  // },
  methods: {
    // 获取存款信息
    getDepositList(pricingId) {
      if (!pricingId) return;
      
      const params = {
        pricingNo: pricingId
      };
      custDepositList(params).then(response => {
        if (response.code === 200) {
          this.depositList = response.data || [];
        } else {
          this.depositList = [];
        }
      }).catch(error => {
        console.error("获取存款信息异常:", error);
        this.depositList = [];
      });
    },
    
    // 获取流程详情
    getProcessDetail(pricingNo) {
      this.loading = true;
      // 清空原有数据，防止显示缓存数据
      this.processData = {};
      this.pricingItems = [];
      this.depositList = [];
      getRateProcessByNo(pricingNo).then(response => {
        if (response.code === 200) {
          this.processData = response.data;
          // 获取定价详情
          if (this.processData && this.processData.pricingNo) {
            this.getRatePriceData(this.processData.pricingNo);
            
          } else {
            this.$modal.msgWarning("未获取到客户编号信息");
            this.loading = false;
          }
        } else {
          this.$modal.msgError("获取流程详情失败: " + (response.msg || "未知错误"));
          this.loading = false;
        }
      }).catch(error => {
        console.error("获取流程详情异常:", error);
        this.$modal.msgError("获取流程详情异常: " + (error.message || "未知错误"));
        this.loading = false;
      });
    },
    
    // 获取定价详情
    getRatePriceData(customerNo) {
      // 清空原有数据，防止显示缓存数据
      this.pricingData = {
        applyAmount: 0,
        originalDebt: 0,
        credit: 0,
        guarantee: 0,
        collateral: 0,
        finalRate: 0,
        remarks: "",
        lprValue: 0,
        minRate: 0,
        totalBp: 0,
        createBy: "",
        createTime: "",
        productRateBp: 0,
        bankPowerRateBp: 0,
        priceDate: ""
      };
      
      getRatePrice(customerNo).then(response => {
        if (response.code === 200 && response.data) {
          // 设置定价详情数据
          const data = response.data;
          this.pricingData = {
            applyAmount: data.applyAmount || 0,
            originalDebt: data.originalDebt || 0, 
            credit: data.credit || 0,
            guarantee: data.guarantee || 0,
            collateral: data.collateral || 0,
            finalRate: data.finalRate || 0,
            remarks: data.remarks || "",
            lprValue: data.lprValue || 0,
            minRate: data.minRate || 0,
            totalBp: data.totalBp || 0,
            createBy: data.createBy || "",
            createTime: data.createTime || "",
            remarks: data.remarks || "",
            productRateBp: data.productRateBp || 0,
            bankPowerRateBp: data.bankPowerRateBp || 0,
            priceDate: data.priceDate || ""
          };
          
          // 构建定价项目列表
          this.buildPricingItems(data);
        } else {
          this.$modal.msgWarning("未获取到客户定价信息: " + (response.msg || ""));
        }
        this.loading = false;
      }).catch(error => {
        console.error("获取客户定价信息异常:", error);
        this.$modal.msgError("获取客户定价信息异常: " + (error.message || "未知错误"));
        this.loading = false;
      });
    },
    
    // 构建定价项目列表
    buildPricingItems(data) {
      this.pricingItems = [];
      
      // 1. 基础定价
      if (data.basePointBp) {
        this.pricingItems.push({
          name: "基础加点",
          description: "基础定价标准",
          bp: data.basePointBp
        });
      }
      
      // 2. 客户类型因素
      if (data.borrowerTypeBp) {
        this.pricingItems.push({
          name: "客户类型",
          description: "类型: " + (data.borrowerType || ""),
          bp: data.borrowerTypeBp
        });
      }
      
      // 3. 担保方式因素
      this.pricingItems.push({
        name: "担保方式",
        description: "担保方式: " + (data.guaranteeType || ""),
        bp: data.guaranteeTypeBp
      });
      
      // 4. 资金用途方式
      if (data.fundingMethodBp) {
        this.pricingItems.push({
          name: "用款方式",
          description: "用款方式: " + (data.fundingMethod || ""),
          bp: data.fundingMethodBp
        });
      }
      
      // 5. 信贷关系因素
      if (data.creditFactorsBp) {
        this.pricingItems.push({
          name: "征信情况",
          description: "征信情况: " + (data.creditFactors || ""),
          bp: data.creditFactorsBp
        });
      }
      
      // 6. 粘性指标因素
      if (data.intermediateServicesBp) {
        this.pricingItems.push({
          name: "粘性指标业务",
          description: "粘性指标: " + (data.intermediateServices ? 
                                     (Array.isArray(data.intermediateServices) ? 
                                      data.intermediateServices.join(";") : 
                                      typeof data.intermediateServices === 'string' ? 
                                      data.intermediateServices : String(data.intermediateServices)) : ""),
          bp: data.intermediateServicesBp
        });
      }
      
      // 7. 特殊情况
      if (data.specialBusinessBp) {
        this.pricingItems.push({
          name: "特殊荣誉",
          description: "特殊荣誉: " + (data.specialBusiness ? 
                                     (Array.isArray(data.specialBusiness) ? 
                                      data.specialBusiness.join(";") : 
                                      typeof data.specialBusiness === 'string' ? 
                                      data.specialBusiness : String(data.specialBusiness)) : ""),
          bp: data.specialBusinessBp
        });
      }
      
      // 9. 贷款期限
      if (data.loanTermBp) {
        this.pricingItems.push({
          name: "贷款期限",
          description: "期限: " + (data.loanTerm || ""),
          bp: data.loanTermBp
        });
      }
      
      // 10. 额度定价
      if (data.quotaBp) {
        this.pricingItems.push({
          name: "总额度定价",
          description: "总额度: " + (data.quota || ""),
          bp: data.quotaBp
        });
      }
      
      // 11. 土地性质
      if (data.landTypeBp) {
        this.pricingItems.push({
          name: "土地性质",
          description: "土地性质: " + (data.landType || ""),
          bp: data.landTypeBp
        });
      }
      
      // 12. 抵押物属地
      if (data.regionBp) {
        this.pricingItems.push({
          name: "所属抵押物属地",
          description: "抵押物属地: " + (data.region || ""),
          bp: data.regionBp
        });
      }
      
      // 13. 抵押物属性
      if (data.purposeBp) {
        this.pricingItems.push({
          name: "抵押物属性",
          description: "抵押物属性: " + (data.purpose || ""),
          bp: data.purposeBp
        });
      }
      
      // 14. 年龄
      if (data.ageBp) {
        this.pricingItems.push({
          name: "年龄",
          description: "年龄: " + (data.age || ""),
          bp: data.ageBp
        });
      }
      
      // 15. 企业规模
      if (data.enterpriseScaleBp) {
        this.pricingItems.push({
          name: "经营规模",
          description: "经营规模: " + (data.enterpriseScale || ""),
          bp: data.enterpriseScaleBp
        });
      }
      
      // 16. 企业代发业务
      if (data.enterpriseRepresentativeBusinessBp) {
        this.pricingItems.push({
          name: "企业代发业务",
          description: "代发业务: " + (data.enterpriseRepresentativeBusiness || ""),
          bp: data.enterpriseRepresentativeBusinessBp
        });
      }
      
      // 17. 行业属性
      if (data.industryPropertyBp) {
        this.pricingItems.push({
          name: "行业属性",
          description: "行业: " + (data.industryProperty ? 
                                 (Array.isArray(data.industryProperty) ? 
                                  data.industryProperty.join("、") : 
                                  typeof data.industryProperty === 'string' ? 
                                  data.industryProperty : String(data.industryProperty)) : ""),
          bp: data.industryPropertyBp
        });
      }
      
      // 18. 忠诚度
      if (data.loyaltyDegreeBp) {
        this.pricingItems.push({
          name: "忠诚度",
          description: "忠诚度: " + (data.loyaltyDegree ? 
                                   (Array.isArray(data.loyaltyDegree) ? 
                                    data.loyaltyDegree.join("、") : 
                                    typeof data.loyaltyDegree === 'string' ? 
                                    data.loyaltyDegree : String(data.loyaltyDegree)) : ""),
          bp: data.loyaltyDegreeBp
        });
      }
      
      // 19. 财富业务
      if (data.wealthBusinessBp) {
        this.pricingItems.push({
          name: "财富业务",
          description: "财富业务: " + (data.wealthBusiness ? 
                                    (Array.isArray(data.wealthBusiness) ? 
                                     data.wealthBusiness.join("、") : 
                                     typeof data.wealthBusiness === 'string' ? 
                                     data.wealthBusiness : String(data.wealthBusiness)) : ""),
          bp: data.wealthBusinessBp
        });
      }
      
      // 20. 存贷比
      if (data.depositRatioBp) {
        this.pricingItems.push({
          name: "存贷比",
          description: "系统计算存款日均:" + (data.dailyDeposits || "0") + "万元，其他存款日均:" 
          + "<span style='color: red;'>"+(data.otherDeposit || "0") +"万元</span>"
          + "，存贷比:" + (data.depositRatio || "0") + "%",
          bp: data.depositRatioBp
        });
      }
      
      // 21. 融资家数
      if (data.creditNumBp) {
        this.pricingItems.push({
          name: "融资家数",
          description: "融资家数: " + (data.creditNum || ""),
          bp: data.creditNumBp
        });
      }
      
      // 22. 还款方式
      if (data.repaymentMethodBp) {
        this.pricingItems.push({
          name: "还款方式",
          description: "还款方式: " + (data.repaymentMethod || ""),
          bp: data.repaymentMethodBp
        });
      }
      
      // 23. 还息因素
      if (data.interestFactorsBp) {
        this.pricingItems.push({
          name: "还息因素",
          description: "还息因素: " + (data.interestFactors || ""),
          bp: data.interestFactorsBp
        });
      }
      
      // 24. 首贷因素
      if (data.firstLoanFactorsBp) {
        this.pricingItems.push({
          name: "首贷因素",
          description: "首贷因素: " + (data.firstLoanFactors || ""),
          bp: data.firstLoanFactorsBp
        });
      }

      // 25. 最低利率限制
      if (data.rateLimitAdjusted && data.rateLimitAdjusted > 0) {
        this.pricingItems.push({
          name: "最低利率限制",
          description: "最低利率限制调整",
          bp: data.rateLimitAdjusted
        });
      }
            
      // 26. 产品定价
      if (data.productRateBp) {
        this.pricingItems.push({
          name: "产品定价",
          description: data.productRate,
          bp: data.productRateBp
        });
      }

       // 27. 行权限定价
       if (data.bankPowerRateBp) {
        this.pricingItems.push({
          name: this.processData.isUseHeadPower === '1' ? "特别定价" : "行权限定价",
          description: this.processData.isUseHeadPower === '1' ? 
                      "===详见特别定价原因===" : 
                      (data.bankPowerRate),
          bp: data.bankPowerRateBp
        });
      }
            
      // 28. 协议定价
      if (data.protocolBp) {
        this.pricingItems.push({
          name: "协议定价",
          description: "<span style='color: red;'>协议加点</span>",
          bp: data.protocolBp
        });
      }
    },
    
    // 返回
    goBack() {
      this.$tab.closePage();
      this.$router.go(-1);
    },
    
    // 打印
    printTable() {
      const printContent = document.getElementById('printArea');
      
      // 创建一个新窗口并写入打印内容
      const printWindow = window.open('', '_blank');
      
      // 写入打印样式和内容
      printWindow.document.write(`
        <html>
          <head>
            <title>农商银行贷款利率定价表</title>
            <style>
              body {
                font-family: SimSun, Arial, sans-serif;
                margin: 5mm 5mm;
              }
              .custom-header {
                margin-bottom: 10px;
              }
              .header-title {
                text-align: center;
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              .header-date-row {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                width: 100%;
                position: relative;
                margin-bottom: 10px;
              }
              .header-date {
                flex: 1;
                text-align: center;
                font-size: 15px;
                color: #409EFF;
                font-weight: 500;
              }
              .header-unit {
                flex: 1;
                text-align: right;
                font-size: 14px;
                color: #606266;
                font-weight: normal;
                position: absolute;
                right: 0;
                top: 0;
              }
              .print-info-table, .print-process-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
                margin-bottom: 20px;
              }
              .print-info-table td, .print-process-table th, .print-process-table td {
                border: 1px solid #000;
                padding: 8px;
              }
              .print-label {
                background-color: #f5f5f5;
                font-weight: bold;
                width: 15%;
              }
              .print-section-title {
                font-size: 16px;
                font-weight: bold;
                margin: 15px 0 10px 0;
                border-left: 4px solid #000;
                padding-left: 8px;
              }
              .print-process-table th {
                background-color: #f5f5f5;
                font-weight: bold;
                text-align: center;
              }
              .print-total-row {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .print-reason-box, .print-opinion-box {
                border: 1px solid #000;
                padding: 8px;
                min-height: 60px;
                margin-bottom: 15px;
                white-space: pre-line;
              }
              .print-empty {
                color: #999;
                font-style: italic;
              }
              .print-empty-text {
                text-align: center;
                color: #999;
                font-style: italic;
              }
              .print-footer {
                margin-top: 30px;
                text-align: right;
                font-size: 12px;
              }
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      // 等待内容加载完成后打印
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.print();
        // 打印后自动关闭窗口
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      };
    },
    
    // 获取当前时间
    getCurrentTime() {
      return parseTime(new Date());
    },
    
    // 打开审查对话框
    openReviewDialog() {
      // 判断是否为同一用户
      if (this.isSameUser(this.processData.userName)) {
        this.$modal.msgError("不能审批自己发起的流程");
        return;
      }
      
      // 检查权限：只有客户经理可以审查
      if (!this.hasManagerRole) {
        this.$modal.msgError("当前用户无权进行审查操作");
        return;
      }
      
      this.reviewDialogVisible = true;
      this.approveForm = {
        pricingNo: this.processData.pricingNo,
        approveType: "pass",
        reviewerRemark: "同意通过并继续上报审批！"
      };
    },
    
    // 打开支行审批对话框
    openBranchApproveDialog() {
      // 判断是否为同一用户
      if (this.isSameUser(this.processData.userName)) {
        this.$modal.msgError("不能审批自己发起的流程");
        return;
      }
      
      // 检查权限：只有网点负责人、副行长、行长可以支行审批
      if (!this.hasBranchApprovalRole) {
        this.$modal.msgError("当前用户无权进行支行审批操作");
        return;
      }
      
      this.branchApproveDialogVisible = true;
      let remark = "同意通过并继续上报审批！"
      if(this.processData.isUseHeadPower === "0"){
        remark = "同意该笔贷款执行利率！"
      }
      this.approveForm = {
        pricingNo: this.processData.pricingNo,
        approveType: "pass",
        branchApproveRemark: remark
      };
    },
    
    // 打开总行审批对话框
    openHeadApproveDialog() {
      // 判断是否为同一用户
      if (this.isSameUser(this.processData.userName)) {
        this.$modal.msgError("不能审批自己发起的流程");
        return;
      }
      
      // 检查权限：只有总行角色且需要总行审批的流程才能操作
      if (!this.hasHeadOfficeRole) {
        this.$modal.msgError("当前用户无权进行总行审批操作");
        return;
      }
      
      if (this.processData.isUseHeadPower !== '1') {
        this.$modal.msgError("该流程无需总行审批");
        return;
      }
      
      this.headApproveDialogVisible = true;
      this.approveForm = {
        pricingNo: this.processData.pricingNo,
        approveType: "pass",
        headApproveRemark: "同意该笔贷款执行利率！"
      };
    },
    
    // 提交审查
    handleReviewSubmit() {
      // 再次验证用户身份
      if (this.isSameUser(this.processData.userName)) {
        this.$modal.msgError("不能审批自己发起的流程");
        this.reviewDialogVisible = false;
        return;
      }
      
      // 再次检查权限
      if (!this.hasManagerRole) {
        this.$modal.msgError("当前用户无权进行审查操作");
        this.reviewDialogVisible = false;
        return;
      }
      
      this.submitLoading = true;

      approve(this.approveForm).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("审查成功");
          this.reviewDialogVisible = false;
          // 标记需要刷新数据，然后返回上一页
          sessionStorage.setItem('processListNeedRefresh', 'true');
          this.$tab.closePage();
          this.$router.go(-1);
        }else {
          this.$modal.msgError("审查失败: " + (response.msg || "未知错误"));
        }
        this.submitLoading = false;
      }).catch(error => {
        console.error("审查异常:", error);
        this.$modal.msgError("审查异常: " + (error.message || "未知错误"));
        this.submitLoading = false;
      });
    },
    
    // 提交支行审批
    handleBranchApproveSubmit() {
      // 再次验证用户身份
      if (this.isSameUser(this.processData.userName)) {
        this.$modal.msgError("不能审批自己发起的流程");
        this.branchApproveDialogVisible = false;
        return;
      }
      
      // 再次检查权限
      if (!this.hasBranchApprovalRole) {
        this.$modal.msgError("当前用户无权进行支行审批操作");
        this.branchApproveDialogVisible = false;
        return;
      }
      
      this.submitLoading = true;
      approve(this.approveForm).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("支行审批成功");
          this.branchApproveDialogVisible = false;
          // 标记需要刷新数据，然后返回上一页
          sessionStorage.setItem('processListNeedRefresh', 'true');
          this.$tab.closePage();
          this.$router.go(-1);
        } else {
          this.$modal.msgError("支行审批失败: " + (response.msg || "未知错误"));
        }
        this.submitLoading = false;
      }).catch(error => {
        console.error("支行审批异常:", error);
        this.$modal.msgError("支行审批异常: " + (error.message || "未知错误"));
        this.submitLoading = false;
      });
    },
    
    // 提交总行审批
    handleHeadApproveSubmit() {
      // 再次验证用户身份
      if (this.isSameUser(this.processData.userName)) {
        this.$modal.msgError("不能审批自己发起的流程");
        this.headApproveDialogVisible = false;
        return;
      }
      
      // 再次检查权限
      if (!this.hasHeadOfficeRole) {
        this.$modal.msgError("当前用户无权进行总行审批操作");
        this.headApproveDialogVisible = false;
        return;
      }
      
      if (this.processData.isUseHeadPower !== '1') {
        this.$modal.msgError("该流程无需总行审批");
        this.headApproveDialogVisible = false;
        return;
      }
      
      this.submitLoading = true;
      approve(this.approveForm).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("总行审批成功");
          this.headApproveDialogVisible = false;
          // 标记需要刷新数据，然后返回上一页
          sessionStorage.setItem('processListNeedRefresh', 'true');
          this.$tab.closePage();
          this.$router.go(-1);
        } else {
          this.$modal.msgError("总行审批失败: " + (response.msg || "未知错误"));
        }
        this.submitLoading = false;
      }).catch(error => {
        console.error("总行审批异常:", error);
        this.$modal.msgError("总行审批异常: " + (error.message || "未知错误"));
        this.submitLoading = false;
      });
    },
    
    // 格式化时间
    parseTime,

    // 判断是否为同一用户
    isSameUser(userId) {
      return useUserStore().name === userId;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  
  .custom-header {
    margin-bottom: 10px;

    .header-title {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    // 网点 / 定价日期 / 单位 在同一行：左 / 中 / 右
    .header-date-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 10px;

      .header-branch {
        flex: 1;
        text-align: left;
        font-size: 14px;
        color: #606266;
      }

      .header-date {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #606266;
      }

      .header-unit {
        flex: 1;
        text-align: right;
        font-size: 14px;
        color: #606266;
      }
    }
  }
  
  .customer-info {
    margin-bottom: 20px;
    .info-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #dcdcdc;
      margin-bottom: 20px;
      td {
        border: 1px solid #dcdcdc;
        padding: 8px 12px;
        text-align: center;
        font-size: 15px;
        &.label {
          background: #f5f7fa;
          font-weight: bold;
        }
      }
    }
  }
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #409EFF;
    margin: 20px 0 10px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }
  
  .deposit-info, .pricing-process {
    margin-bottom: 20px;
    
    .process-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #EBEEF5;
      
      th, td {
        padding: 12px;
        border: 1px solid #EBEEF5;
        text-align: center;
      }
      
      th {
        background-color: #F5F7FA;
        font-weight: bold;
      }
      
      .total-row {
        background-color: #F5F7FA;
        font-weight: bold;
      }
      
      .empty-text {
        text-align: center;
        color: #909399;
        font-style: italic;
      }
    }
  }
  
  .special-pricing-reason, .approval-opinions {
    margin-bottom: 20px;
    
    .reason-box, .opinion-box {
      padding: 15px;
      border: 1px solid #EBEEF5;
      background-color: #FAFAFA;
      min-height: 60px;
      white-space: pre-line;
      
      &.empty {
        color: #909399;
        font-style: italic;
      }
    }
  }

  .process-timeline {
    margin-bottom: 20px;
    
    .timeline-content {
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
      }
      p {
        margin: 0;
        font-size: 13px;
        color: #606266;
      }
    }
  }
}

.print-only {
  display: none;
}

.bottom-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}

@media print {
  .actions, .bottom-actions {
    display: none !important;
  }
  
  @page {
    size: A4;
    margin: 5mm;
  }
  
  body {
    margin: 0;
  }
  
  .custom-header { margin-bottom: 10px; }
  .header-title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 2px; }
  .header-date-row { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; position: relative; margin-bottom: 10px; }
  .header-date { flex: 1; text-align: center; font-size: 15px; color: #606266; font-weight: 500; }
  .header-unit { flex: 1; text-align: right; font-size: 14px; color: #606266; font-weight: normal; position: absolute; right: 0; top: 0; }
  
  /* 避免强制分页 */
  .print-header, .print-footer, .print-customer-info, 
  .print-deposit-info, .print-pricing-process, .print-special-pricing-reason, 
  .print-approval-opinions {
    page-break-after: avoid;
    page-break-before: avoid;
    page-break-inside: avoid;
  }
  
  .print-empty-text {
    text-align: center;
    color: #909399;
    font-style: italic;
  }
  
  /* 减小表格间距 */
  .print-info-table, .print-process-table {
    margin-bottom: 10px;
  }
  
  .print-info-table td, .print-process-table th, 
  .print-process-table td {
    padding: 5px;
  }
  
  /* 缩小审批意见区域 */
  .print-reason-box, .print-opinion-box {
    padding: 5px;
    min-height: auto;
  }
}
</style> 
 