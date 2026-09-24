<template>
  <div class="app-container">
    <!-- 基本信息 -->
    <basic-info ref="basicInfoRef" :submitData="submitData" />
    
    <!-- 贷款信息 -->
    <loan-info ref="loanInfoRef" 
      :rateForm="rateForm"
      :submitData="submitData"
      :shouldShowField="shouldShowField"
      :loanTermOptions="loanTermOptions"
      :quotaOptions="quotaOptions"
      :guaranteeTypeOptions="guaranteeTypeOptions"
      :borrowerTypeOptions="borrowerTypeOptions"
      :fundingMethodOptions="fundingMethodOptions"
      :creditNumOptions="creditNumOptions"
      :intermediateServicesOptions="intermediateServicesOptions"
      :landTypeOptions="landTypeOptions"
      :purposeOptions="purposeOptions"
      :regionOptions="regionOptions"
      :creditFactorsOptions="creditFactorsOptions"
      :repaymentMethodOptions="repaymentMethodOptions"
      :interestFactorsOptions="interestFactorsOptions"
      :firstLoanFactorsOptions="firstLoanFactorsOptions"
      :ageOptions="ageOptions"
      :industryPropertyOptions="industryPropertyOptions"
      :loyaltyDegreeOptions="loyaltyDegreeOptions"
      :wealthBusinessOptions="wealthBusinessOptions"
      :specialBusinessOptions="specialBusinessOptions"
      :enterpriseScaleOptions="enterpriseScaleOptions"
      :loading="loading"
      :rateBaseParam="rateBaseParam"
      @validate-number="validateNumberInput"
      @loan-term-change="handleLoanTermChange"
      @option-change="handleOptionChange"
      @guaranteeType-change="handleGuaranteeTypeChange"
      @multi-option-change="handleMultiOptionChange"
      @multi-select-change="handleMultiSelectChange"
      @get-bp-limit-text="getBpLimitText"
      @recalculate-deposit-ratio="calculateDepositRatio"
      @update:base-point="updateBasePointValue"
      @refresh-deposit="getCustDeposit"
    />
    
    <!-- 定价信息 -->
    <pricing-info 
      ref="pricingInfoRef"
      :rateForm="rateForm"
      :submitData="submitData"
      :shouldShowField="shouldShowField"
      :isLoanInfoComplete="isLoanInfoComplete"
      :productOptions="productOptions"
      :productRateLimit="productRateLimit"
      :bankPowerRateLimit="bankPowerRateLimit"
      :finalBasePointValue="basePointValue"
      @product-change="handleProductChange"
      @bank-power-change="handleBankPowerChange"
      @validate-product-bp="validateProductBp"
      @validate-bank-power-bp="validateBankPowerBp"
      @validate-number="validateNumberInput"
    />
    
    <!-- 利率加点信息 -->
    <rate-point-info 
      :rateBaseParam="rateBaseParam"
      :totalBp="calculateTotalBp()"
      :finalRate="calculateFinalRate()"
      :productRateLimit="productRateLimit"
      :productBp="parseFloat(rateForm.productRateBp || 0)"
      :bankPowerBp="parseFloat(rateForm.bankPowerRateBp || 0)"
      :protocolBp="parseFloat(rateForm.protocolBp || 0)"
      @update:productBp="val => rateForm.productRateBp = val"
    />
    
    <!-- 调试信息 -->
    <!-- <debug-info 
      :debug="debug"
      @validate-bp-values="validateAllBpValues"
      @debug-bp-limits="debugBpLimits"
      @debug-bp-limit-for-field="debugBpLimitForField"
      @show-debug="debug.showDebug = true"
      @close-debug="debug.showDebug = false"
    /> -->
    
    <!-- 操作按钮 -->
    <div class="button-container" style="display: flex; justify-content: center; margin-top: 20px;">
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import { saveRatePrice } from '@/api/szhl/pricing/customer/ratePrice';
import { getCustLoanInfo } from '@/api/szhl/pricing/customer/custLoanInfo';
import { getRateParamDictList } from '@/api/szhl/pricing/param/rateParamDict';
import { getSecondRateParamDictList } from '@/api/szhl/pricing/param/rateParamDictSecond';
import { getRateParamList } from '@/api/szhl/pricing/param/rateConfig';
import { getCustDepositInfo } from '@/api/szhl/pricing/customer/custdeposit';
import { getPerBusinessInfo, getPubBusinessInfo } from '@/api/szhl/pricing/customer/business';
import useUserStore from '@/store/modules/user';
import { ElMessage } from 'element-plus';
import { nextTick } from 'vue';
import { getRateProductList } from '@/api/szhl/pricing/param/rateProductDict';
import { QuestionFilled, Lock } from '@element-plus/icons-vue';
import { getRateBankPowerInfo } from "@/api/szhl/pricing/param/rateBankPower";
import {listDepositor} from "@/api/szhl/pricing/customer/index";

// 导入子组件
import BasicInfo from './components/BasicInfo.vue';
import LoanInfo from './components/LoanInfo.vue';
import PricingInfo from './components/PricingInfo.vue';
import RatePointInfo from './components/RatePointInfo.vue';


export default {
  name: 'RatePrice',
  components: {
    QuestionFilled,
    Lock,
    BasicInfo,
    LoanInfo, 
    PricingInfo,
    RatePointInfo
  },
  props: {
    customerId: {
      type: [String, Number],
      default: ''
    },
    customerName: {
      type: String,
      default: ''
    },
    customerNo: {
      type: String,
      default: ''
    }
  },
  setup() {
    return {}
  },
  async created() {
    // 在created中进行一次性初始化，避免重复调用
    await this.initCustomerInfo();
  },
  activated() {
    
  },
  data() {
    return {
      // 提交的数据
      submitData: {
        priceDate: new Date().toISOString().slice(0, 10),
        customerType: '', // 对公/对私，动态判断
        customerNo: '',
        customerName: '',
        customerId: ''
      },
      // 当前激活的选项卡 (保留此变量以兼容老代码，即使已经改为非tab页式布局)
      activeTab: 'product',
      // 表单参数
      rateForm: {
        // 贷款金额信息
        originalDebt: '0',
        credit: '0',
        guarantee: '0',
        collateral: '0',
        applyAmount: '',
        
        // 存款相关字段
        dailyDeposits: '', // 存款日均（SQL字段名）
        otherDeposit: '', // 其他日均（SQL字段名）
        depositRatio: '', // 存贷比例（SQL字段名）
        depositRatioBp: 0, // 存贷比例BP值
        depositRatioBpLimited: false, // 存贷比例BP值是否被限制
        depositPeriod: '', // 存贷区间文本
        
        // 保留原有固定字段
        loanTerm: '',
        loanTermBp: 0,
        quota: '',
        quotaBp: 0,
        
        // 添加其他字段的BP值，确保初始值为0
        guaranteeType: '',
        guaranteeTypeBp: 0,
        borrowerType: '',
        borrowerTypeBp: 0,
        fundingMethod: '',
        fundingMethodBp: 0,
        creditNum: '',
        creditNumBp: 0,
        intermediateServices: [],
        intermediateServicesBp: 0,
        landType: '',
        landTypeBp: 0,
        purpose: '',
        purposeBp: 0,
        region: '',
        regionBp: 0,
        creditFactors: '',
        creditFactorsBp: 0,
        repaymentMethod: '',
        repaymentMethodBp: 0,
        interestFactors: '',
        interestFactorsBp: 0,
        firstLoanFactors: '',
        firstLoanFactorsBp: 0,
        age: '',
        ageBp: 0,
        industryProperty: [],
        industryPropertyBp: 0,
        loyaltyDegree: [],
        loyaltyDegreeBp: 0,
        wealthBusiness: [],
        wealthBusinessBp: 0,
        specialBusiness: [],
        specialBusinessBp: 0,
        enterpriseScale: '',
        enterpriseScaleBp: 0,
        enterpriseRepresentativeBusiness: '', // 前12月代发余额
        enterpriseRepresentativeBusinessBp: 0, // 前12月代发余额BP值
        
        // 产品相关字段
        productRate: '',
        productRateBp: '',
        
        // 行权限相关字段
        bankPowerRate: '',
        bankPowerRateBp: '',
        
        // 其他已有字段...
        remarks: '',  // 备注原因
        isShare: 1,
        // 动态字段
        dynamicFields: {}
      },
      // 一级参数列表
      paramList: [],
      // 二级参数选项
      paramOptions: {},
      // 数字输入字段列表
      numberFields: ['credit', 'guarantee', 'collateral', 'applyAmount', 'dailyDeposits', 'otherDeposit', 'depositRatio', 'enterpriseRepresentativeBusiness'],
      // 表单校验
      rules: {
        credit: [
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        guarantee: [
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        collateral: [
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        applyAmount: [
          { required: true, message: '申请金额不能为空', trigger: 'blur' },
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        dailyDeposits: [
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        otherDeposit: [
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        depositRatio: [
          { validator: this.validateNumber, trigger: 'blur' }
        ],
        enterpriseRepresentativeBusiness: [
          { validator: this.validateNumber, trigger: 'blur' }
        ]
      },
      // 加载状态
      loading: false,
      // 添加各选项的选项数组，初始为空数组
      loanTermOptions: [],
      quotaOptions: [],
      guaranteeTypeOptions: [],
      borrowerTypeOptions: [],
      fundingMethodOptions: [],
      creditNumOptions: [],
      intermediateServicesOptions: [],
      // 添加更多选项数组
      landTypeOptions: [],
      purposeOptions: [],
      regionOptions: [],
      creditFactorsOptions: [],
      repaymentMethodOptions: [],
      interestFactorsOptions: [],
      firstLoanFactorsOptions: [],
      ageOptions: [],
      industryPropertyOptions: [],
      loyaltyDegreeOptions: [],
      wealthBusinessOptions: [],
      specialBusinessOptions: [],
      enterpriseScaleOptions: [],
      // 调试字段
      debug: {
        loadedParams: [],
        mappedFields: {},
        showDebug: false,
        activeTab: 'loadedParams',
        bpLimits: []
      },
      // 基础利率参数
      rateBaseParam: {
        lprValue: 0,
        minRate: 0,
        basePoint: 0
      },
      // BP值限制（按字段存储）
      paramBpLimits: {},
      // 产品列表
      productOptions: [],
      // 原始产品列表（保存完整的产品选项，用于过滤）
      originalProductOptions: [],
      
      // 当前选中产品的限制
      productRateLimit: {
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      },
      
      // 当前选中行权限的限制
      bankPowerRateLimit: {
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      },
      
      // 行权限类型
      bankPowerType: '',
      // 行权限数据列表
      bankPowerInfoList: [],
      // 当前选中的行权限数据
      currentBankPowerInfo: null,
      
      // 基础定价加点值 - 从LoanInfo组件获取
      basePointValue: 0,
      unwatchList: [], // 用于保存所有手动watch的unwatch函数
      isFetchingBankPowerInfo: false, // 行权限定价接口加锁
      secondParams: [], // 缓存二级参数
      isInitializing: true, // 初始化标志位，防止初始化期间重复计算
      otherDepositorsLoanAmount: 0, // 缓存其他存款人贷款总额，避免重复查询
    }
  },
  mounted() {
    // 添加监听器，确保组件挂载后获取基础定价加点值
    this.$nextTick(() => {
      // 尝试从LoanInfo组件获取基础定价加点值
      if (this.$refs.loanInfoRef && this.$refs.loanInfoRef.totalBpValue) {
        this.basePointValue = parseFloat(this.$refs.loanInfoRef.totalBpValue);
      }
    });

    this.$emit('expose-validate', () => {
      return this.$refs.rateFormRef.validate();
    });
  },
  watch: {
    
    
    // 监听贷款信息完整状态变化
    isLoanInfoComplete(newVal) {
      if (newVal && (this.activeTab === 'bankPower' || !this.currentBankPowerInfo)) {
        // 当贷款信息完整时，获取行权限定价数据
        // 移除这里的调用，将在担保方式和贷款期限都选择后调用
        // this.fetchBankPowerInfo();
      }
    },
    
    // 监听担保方式变化
    'rateForm.guaranteeType': function(newVal) {
      // 当担保方式和贷款期限都已选择时，获取行权限定价数据
      if (newVal && this.rateForm.loanTerm) {
        // this.fetchBankPowerInfo();
      }
    },
    
    'rateForm.loanTerm': function(newVal) {
      // 当担保方式和贷款期限都已选择时，获取行权限定价数据
      if (newVal && this.rateForm.guaranteeType) {
        // this.fetchBankPowerInfo();
      }
    },
    
    // 监听tab变化
    activeTab(newVal) {
      if (newVal === 'bankPower' && this.isLoanInfoComplete && !this.currentBankPowerInfo) {
        // 当切换到行权限tab且没有数据时，获取数据
        // 移除这里的调用，将在担保方式和贷款期限都选择后调用
        // this.fetchBankPowerInfo();
      }
    },
    
    // 添加对存款相关字段的监听，确保存贷比例能正确计算
    'rateForm.dailyDeposits': function(newVal) {
      // 初始化期间不触发计算，避免重复调用
      if (!this.isInitializing) {
        this.calculateDepositRatio();
      }
    },
    'rateForm.otherDeposit': function(newVal) {
      // 初始化期间不触发计算，避免重复调用
      if (!this.isInitializing) {
        this.calculateDepositRatio();
      }
    },
    'rateForm.applyAmount': function(newVal) {
      // 初始化期间不触发计算，避免重复调用
      if (!this.isInitializing) {
        this.calculateDepositRatio();
      }
    },
    
    // 监听所有可能影响BP总值的字段，当选择了产品后自动更新产品政策定价BP值
    'rateForm.loanTermBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.quotaBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.guaranteeTypeBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.borrowerTypeBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.fundingMethodBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.creditNumBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.intermediateServicesBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.landTypeBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.purposeBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.regionBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.creditFactorsBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.repaymentMethodBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.interestFactorsBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.firstLoanFactorsBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.ageBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.industryPropertyBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.loyaltyDegreeBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.wealthBusinessBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.specialBusinessBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.enterpriseScaleBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.depositRatioBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    'rateForm.basePointBp': function(newVal) {
      this.autoUpdateProductRateBp();
    },
    
    // 监听产品BP值变化，重新过滤产品选项
    'rateForm.productRateBp': function(newVal) {
      this.filterProductOptionsByBasePoint();
    },
    
    // 监听行权限类型变化
    bankPowerType(newVal) {
      // 当行权限类型变化时，如果有担保方式，重新获取行权限数据
      if (newVal && this.rateForm.guaranteeType) {
        // this.fetchBankPowerInfo();
      }
    },
  },
  methods: {
    /** 初始化中间业务选项 */
    initIntermediateServicesOptions() {
      // 个人客户中间业务选项
      const perBusinessOptions = [
        { label: '三代社保卡', value: '三代社保卡', bpValue: 0 },
        { label: '电子社保卡', value: '电子社保卡', bpValue: 0 },
        { label: '三代社保卡代扣电费', value: '三代社保卡代扣电费', bpValue: 0 },
        { label: '三代社保卡代扣水费', value: '三代社保卡代扣水费', bpValue: 0 },
        { label: '三代社保卡代扣华数', value: '三代社保卡代扣华数', bpValue: 0 },
        { label: '医保电子凭证', value: '医保电子凭证', bpValue: 0 },
        { label: 'ETC签约', value: 'ETC签约', bpValue: 0 },
        { label: '三方支付', value: '三方支付', bpValue: 0 },
        { label: '个人信用卡客户', value: '个人信用卡客户', bpValue: 0 }
      ];
      
      // 对公客户中间业务选项
      const pubBusinessOptions = [
        { label: '电费签约', value: '电费签约', bpValue: 0 },
        { label: '税费签约', value: '税费签约', bpValue: 0 },
        { label: '代发工资', value: '代发工资', bpValue: 0 },
        { label: '法人信用卡', value: '法人信用卡', bpValue: 0 },
        { label: '丰收互联', value: '丰收互联', bpValue: 0 }
      ];
      
      // 获取参数ID
      const paramId = 'intermediate_services';
      
      // 如果已经有这个参数的BP值配置，使用配置值替换默认值
      if (this.paramOptions && this.paramOptions[paramId]) {
        const options = this.paramOptions[paramId];
        
        // 更新个人客户中间业务BP值
        perBusinessOptions.forEach(option => {
          const configOption = options.find(o => o.value === option.value);
          if (configOption) {
            option.bpValue = configOption.bpValue;
          }
        });
        
        // 更新对公客户中间业务BP值
        pubBusinessOptions.forEach(option => {
          const configOption = options.find(o => o.value === option.value);
          if (configOption) {
            option.bpValue = configOption.bpValue;
          }
        });
      }
      
      // 根据客户类型选择对应选项
      if (this.submitData.customerType === '对私') {
        this.intermediateServicesOptions = perBusinessOptions;
      } else {
        this.intermediateServicesOptions = pubBusinessOptions;
      }
      
      this.$nextTick(() => {
        this.calculateIntermediateServicesBP && this.calculateIntermediateServicesBP();
      });
    },
    
    /** 初始化客户信息 */
    async initCustomerInfo() {
      // 清空表单数据
      this.resetFormData();
      
      // 如果有传入客户ID和名称，则填充到查询参数中
      if (this.customerId) {
        this.submitData.customerNo = this.customerNo || '';
        this.submitData.customerName = this.customerName || '';
        
        // 根据customerId判断客户类型
        await this.determineCustomerType(this.customerId);
      }
      // 额外处理路由参数（兼容路由和props两种方式）
      else if (this.$route && this.$route.query && this.$route.query.customerId) {
        await this.getCustomerInfo();
      }
      
      this.rateForm.isShare = 1;
    },
    
    /** 获取客户信息 */
    async getCustomerInfo() {
      // 如果是从客户列表页跳转过来，填充客户信息
      if (this.$route.query.customerId) {
        const customerId = this.$route.query.customerId;
        const customerName = this.$route.query.customerName;
        const customerNo = this.$route.query.customerNo;
        
        this.submitData.customerNo = customerNo || '';
        this.submitData.customerName = customerName || '';
        
        // 根据customerId判断客户类型并等待参数加载完成
        await this.determineCustomerType(customerId);
        
        // 查询该客户的贷款信息
        if (customerNo) {
          await this.getCustLoanInfo(customerId);
        }
      }
    },
    
    /** 根据customerId判断客户类型 */
    async determineCustomerType(customerId) {
      // 提取ID中的信息来判断客户类型
      const idStr = customerId.toString();
      
      if (idStr.startsWith('81')) {
        this.submitData.customerType = '对私';
      } else if (idStr.startsWith('82')) {
        this.submitData.customerType = '对公';
      } else {
        // 默认设为对私
        this.submitData.customerType = '对私';
      }

      
      // 重置选项数据
      this.loanTermOptions = [];
      this.quotaOptions = [];
      this.guaranteeTypeOptions = [];
      this.borrowerTypeOptions = [];
      this.fundingMethodOptions = [];
      this.creditNumOptions = [];
      this.intermediateServicesOptions = [];
      // 重置更多选项数据
      this.landTypeOptions = [];
      this.purposeOptions = [];
      this.regionOptions = [];
      this.creditFactorsOptions = [];
      this.repaymentMethodOptions = [];
      this.interestFactorsOptions = [];
      this.firstLoanFactorsOptions = [];
      this.ageOptions = [];
      this.industryPropertyOptions = [];
      this.loyaltyDegreeOptions = [];
      this.wealthBusinessOptions = [];
      this.specialBusinessOptions = [];
      this.enterpriseScaleOptions = [];
      
      // 按照正确的顺序执行接口调用
      try {
        // 1. 初始化中间业务选项（依赖客户类型）
        this.initIntermediateServicesOptions();
        
        // 2. 首先获取一级参数
        await this.fetchRateParams();
        
        
        // 3. 获取产品列表（依赖客户类型）
        this.fetchProductOptions();
        
      } catch (error) {
        console.error('初始化参数失败:', error);
      }
    },
    
    /** 获取利率参数 */
    async fetchRateParams() {
      this.loading = true;
      try {
        const response = await getRateParamDictList(this.submitData.customerType);
        if (response.code === 200) {
          this.paramList = response.data || [];
          
          // 如果有参数，获取对应的二级参数选项
          if (this.paramList.length > 0) {
            // 提取所有一级参数ID
            const parentIds = this.paramList.map(item => item.paramId);
            // 获取二级参数选项
            await this.fetchSecondParams(parentIds);
          }
        }
      } catch (error) {
        console.error('获取利率参数失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    /** 获取二级参数选项 */
    async fetchSecondParams(parentIds) {
      try {
        const response = await getSecondRateParamDictList(this.submitData.customerType, parentIds);
        if (response.code === 200) {
          const secondParams = response.data || [];
          this.secondParams = secondParams; // 缓存下来
          
          // 记录收到的参数ID
          this.debug.loadedParams = secondParams.map(item => {
            return { 
              id: item.paramId, 
              name: item.paramName, 
              parentId: item.parentParamId,
              minPoint: item.minPoint, // 添加最小BP值记录
              maxPoint: item.maxPoint  // 添加最大BP值记录
            };
          });
          
          // 按parentParamId分组
          const groupedParams = {};
          const paramLimits = {}; // 存储每个参数的BP限制
          
          // 找出每个参数组的父参数
          const parentParams = {};
          secondParams.forEach(item => {
            if (!parentParams[item.parentParamId]) {
              // 查找该组的父参数
              const parent = this.paramList.find(p => p.paramId === item.parentParamId);
              if (parent) {
                parentParams[item.parentParamId] = parent;
              }
            }
          });
          
          // 遍历参数，建立分组和限制
          secondParams.forEach(item => {
            const parentId = item.parentParamId;
            if (!groupedParams[parentId]) {
              groupedParams[parentId] = [];
              
              // 使用父参数中的minPoint和maxPoint
              const parent = parentParams[parentId];
              paramLimits[parentId] = {
                minBp: parent && parent.minPoint !== undefined ? Number(parent.minPoint) : undefined,
                maxBp: parent && parent.maxPoint !== undefined ? Number(parent.maxPoint) : undefined,
                paramName: parent ? parent.paramName : parentId
              };
              
            }
            groupedParams[parentId].push(item);
          });
          
          // 设置选项数据
          this.paramOptions = {};
          this.paramBpLimits = paramLimits; // 存储参数BP限制
          
          for (const parentId in groupedParams) {
            const options = groupedParams[parentId];
            
            // 获取该参数组的选项
            this.paramOptions[parentId] = options.map(item => ({
              label: item.paramName,
              value: item.paramId,
              bpValue: item.lprValue || 0
            }));
            
            // 设置对应字段的选项
            this.setFieldOptions(parentId, options);
          }
          
          // 初始化动态字段
          this.initDynamicFields();

          // 计算额度定价
          this.calculateQuotaRating();
        }
      } catch (error) {
        console.error("获取二级参数失败:", error);
      }
    },
    
    /** 设置字段的选项 */
    setFieldOptions(parentId, options) {
      
      // 特殊处理：处理常见参数映射，可以根据实际后端数据调整
      const paramMapping = {
        'quota': 'quota',  // 额度定价
        'loan_term': 'loanTerm',  // 注意前面有空格
        'guaranteeType': 'guaranteeType',
        'borrowerType': 'borrowerType'
        // 其他映射可以动态添加
      };
      
      let fieldName = '';
      if (paramMapping[parentId]) {
        fieldName = paramMapping[parentId];
      } else {
        // 尝试常规转换
        fieldName = parentId.trim().toLowerCase().replace(/^_/, '');
        fieldName = fieldName.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
      }
      
      // 记录映射信息
      this.debug.mappedFields[parentId] = fieldName;
      
      // 检查是否存在这个字段的options属性
      const optionsField = fieldName + 'Options';

      // 设置选项 - 统一使用paramName作为value而不是paramId
      if (this[optionsField] !== undefined) {
        this[optionsField] = options.map(item => ({
          label: item.paramName,
          value: item.paramName, // 使用paramName作为value
          bpValue: item.lprValue || 0  // 使用lprValue作为BP值
        }));
      } else {
        
        // 创建一个新的动态选项属性
        this.createDynamicOptionsField(parentId, fieldName, options);
      }
    },
    
    /** 创建动态选项字段 */
    createDynamicOptionsField(parentId, fieldName, options) {
      
      // 创建一个新的响应式数组属性 - 同样使用paramName作为value
      this[fieldName + 'Options'] = options.map(item => ({
        label: item.paramName,
        value: item.paramName, // 使用paramName作为value
        bpValue: item.lprValue || 0
      }));
      
      // 同时在模板中找到使用该选项的元素，并确保正确显示
      const formField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
      
      // 确保rateForm中有这个字段
      if (this.rateForm[formField] === undefined) {
        this.rateForm[formField] = '';
        this.rateForm[formField + 'Bp'] = 0;
      }
    },
    
    /** 初始化动态字段 */
    initDynamicFields() {
      const dynamicFields = {};
      
      // 根据一级参数创建动态字段
      this.paramList.forEach(param => {
        const paramId = param.paramId;
        
        // 设置默认值
        if (this.paramOptions[paramId] && this.paramOptions[paramId].length > 0) {
          // 如果有选项，初始化为空（下拉选择框）
          dynamicFields[paramId] = {
            value: '',
            bpValue: 0,
            type: 'select'
          };
        } else {
          // 如果没有选项，初始化为输入框
          dynamicFields[paramId] = {
            value: '',
            bpValue: 0,
            type: 'input'
          };
        }
      });
      
      // 设置到表单中
      this.rateForm.dynamicFields = dynamicFields;
      
      // 初始化完成后，验证所有BP值
      nextTick(() => {
        this.validateAllBpValues();
      });
    },
    
    /** 验证所有BP值是否在限制范围内 */
    validateAllBpValues() {
      // 获取所有可能有BP值的字段
      const bpFields = [
        'loanTerm', 'quota', 'guaranteeType', 'borrowerType', 
        'fundingMethod', 'creditNum', 'intermediateServices',
        'landType', 'purpose', 'region', 'creditFactors',
        'repaymentMethod', 'interestFactors', 'firstLoanFactors',
        'age', 'industryProperty', 'loyaltyDegree', 'wealthBusiness',
        'specialBusiness', 'enterpriseScale'
      ];
      
      // 检查每个字段的BP值是否在限制范围内
      bpFields.forEach(field => {
        // 检查字段是否存在且有值和选中项
        if (this.rateForm[field] && 
            ((typeof this.rateForm[field] === 'string' && this.rateForm[field] !== '') || 
             (Array.isArray(this.rateForm[field]) && this.rateForm[field].length > 0)) && 
            this.rateForm[field + 'Bp'] !== undefined && 
            this.rateForm[field + 'Bp'] !== 0) {
          
          const originalBp = this.rateForm[field + 'Bp'];
          const limitedBp = this.limitBpValue(field, originalBp);
          
          // 如果值被限制，设置标记并更新BP值
          if (originalBp !== limitedBp) {
            this.rateForm[field + 'Bp'] = limitedBp;
            this.rateForm[field + 'BpLimited'] = true;
          }
        } else {
          // 如果字段没有选中项，确保BP值为0
          if (!this.rateForm[field] || 
              (typeof this.rateForm[field] === 'string' && this.rateForm[field] === '') || 
              (Array.isArray(this.rateForm[field]) && this.rateForm[field].length === 0)) {
            this.rateForm[field + 'Bp'] = 0;
            this.rateForm[field + 'BpLimited'] = false;
          }
        }
      });
      
      // 检查动态字段
      if (this.rateForm.dynamicFields) {
        for (const key in this.rateForm.dynamicFields) {
          const field = this.debug.mappedFields[key];
          if (field && this.rateForm.dynamicFields[key].value && this.rateForm.dynamicFields[key].bpValue) {
            const originalBp = this.rateForm.dynamicFields[key].bpValue;
            const limitedBp = this.limitBpValue(field, originalBp);
            
            // 如果值被限制，更新BP值
            if (originalBp !== limitedBp) {
              this.rateForm.dynamicFields[key].bpValue = limitedBp;
            }
          }
        }
      }
    },
    
    /** 动态字段变更处理 */
    handleDynamicFieldChange(paramId, value) {
      // 查找对应的BP值
      if (this.paramOptions[paramId]) {
        const option = this.paramOptions[paramId].find(item => item.value === value);
        if (option) {
          this.rateForm.dynamicFields[paramId].bpValue = option.bpValue || 0;
        }
      }
    },
    
    /** 重置表单数据 */
    resetFormData() {
      this.rateForm = {
        // 贷款金额信息
        originalDebt: '0',
        credit: '0',
        guarantee: '0',
        collateral: '0',
        applyAmount: '',
        
        // 存款相关字段
        dailyDeposits: '', // 存款日均（SQL字段名）
        otherDeposit: '', // 其他日均（SQL字段名）
        depositRatio: '', // 存贷比例（SQL字段名）
        depositRatioBp: 0, // 存贷比例BP值
        depositRatioBpLimited: false, // 存贷比例BP值是否被限制
        depositPeriod: '', // 存贷区间文本
        
        // 保留原有固定字段
        loanTerm: '',
        loanTermBp: 0,
        quota: '',
        quotaBp: 0,
        
        // 添加其他字段的BP值，确保初始值为0
        guaranteeType: '',
        guaranteeTypeBp: 0,
        borrowerType: '',
        borrowerTypeBp: 0,
        fundingMethod: '',
        fundingMethodBp: 0,
        creditNum: '',
        creditNumBp: 0,
        intermediateServices: [],
        intermediateServicesBp: 0,
        landType: '',
        landTypeBp: 0,
        purpose: '',
        purposeBp: 0,
        region: '',
        regionBp: 0,
        creditFactors: '',
        creditFactorsBp: 0,
        repaymentMethod: '',
        repaymentMethodBp: 0,
        interestFactors: '',
        interestFactorsBp: 0,
        firstLoanFactors: '',
        firstLoanFactorsBp: 0,
        age: '',
        ageBp: 0,
        industryProperty: [],
        industryPropertyBp: 0,
        loyaltyDegree: [],
        loyaltyDegreeBp: 0,
        wealthBusiness: [],
        wealthBusinessBp: 0,
        specialBusiness: [],
        specialBusinessBp: 0,
        enterpriseScale: '',
        enterpriseScaleBp: 0,
        enterpriseRepresentativeBusiness: 0, // 前6月代发余额
        enterpriseRepresentativeBusinessBp: 0, // 前12月代发余额BP值
        
        // 产品相关字段
        productRate: '',
        productRateBp: '',
        
        // 行权限相关字段
        bankPowerRate: '',
        bankPowerRateBp: '',
        
        // 其他已有字段...
        remarks: '',  // 备注原因
        isShare: 1,
        
        // 动态字段
        dynamicFields: {}
      };
      
      this.submitData = {
        priceDate: new Date().toISOString().slice(0, 10),
        customerType: '',
        customerNo: '',
        customerName: ''
      };
      
      this.activeTab = 'product';
      this.paramList = [];
      this.paramOptions = {};
      this.paramBpLimits = {}; // 重置BP限制
    },
    
    /** 获取客户存款信息 */
    async getCustDeposit(custNo) {
      if (!custNo) return Promise.reject('custNo is required');
        
      try {
        const response = await getCustDepositInfo(custNo);
        if(response.data == null){
            console.info('客户存款信息不存在');
        }
        if (response.code === 200 && response.data) {
          // 设置存款日均值
          this.rateForm.dailyDeposits = response.data.totalDeposit || '0';
          
          // 注意：这里不再调用calculateDepositRatio，将在初始化完成后统一调用
        }
        return response;
      } catch (error) {
        console.error('获取客户存款信息失败:', error);
        return Promise.reject(error);
      }
    },
    
    /** 获取客户贷款信息 */
    async getCustLoanInfo(custNo) {
      try {
        const response = await getCustLoanInfo(custNo);
        if(response.data == null){
            console.info('客户贷款信息不存在');
        }
        if (response.code === 200 && response.data) {
          const loanInfo = response.data;
          // 填充贷款信息，直接使用接口返回的字段名
          this.rateForm.credit = loanInfo.xyye != null ? loanInfo.xyye : '0';
          this.rateForm.guarantee = loanInfo.bzye != null ? loanInfo.bzye : '0';
          this.rateForm.collateral = loanInfo.dyye != null ? loanInfo.dyye : '0';
          
          // 解析dkqk字段获取更多贷款信息（可选）
          if (loanInfo.dkqk) {
            const dkqkParts = loanInfo.dkqk.split(':');
            if (dkqkParts.length > 1) {
              // 可以根据业务需求设置其他相关字段
            }
          }
          
          // 计算原欠款金额
          this.calculateOriginalDebt();
        }
        
        // 按照正确的顺序获取后续信息
        await this.getCustDeposit(custNo);
        
        // 确保已经设置了客户类型和参数选项后再获取中间业务信息
        if (this.submitData.customerType && this.intermediateServicesOptions.length > 0) {
          // 获取客户中间业务信息 - 确保在参数加载完成后调用
          await this.getCustBusinessInfo(custNo);
        }
        
        // 获取其他存款人贷款信息并缓存，避免重复查询
        let customerId = this.customerId || (this.$route && this.$route.query.customerId);
        if (customerId) {
          try {
            this.otherDepositorsLoanAmount = await this.getOtherDepositorsLoanInfo(customerId);
            console.log('缓存其他存款人贷款总额:', this.otherDepositorsLoanAmount);
          } catch (error) {
            console.error('获取其他存款人贷款信息失败:', error);
            this.otherDepositorsLoanAmount = 0;
          }
        }
        
        // 初始化完成，设置标志位并执行一次存贷比计算
        this.isInitializing = false;
        console.log('初始化完成，开始计算存贷比');
        this.calculateDepositRatio();
        
      } catch (error) {
        console.error('获取客户贷款信息失败:', error);
        // 即使失败也要结束初始化状态
        this.isInitializing = false;
      }
    },
    
    /** 计算中间业务BP值 */
    calculateIntermediateServicesBP() {
      if (!this.rateForm.intermediateServices || this.rateForm.intermediateServices.length === 0) {
        this.rateForm.intermediateServicesBp = 0;
        this.rateForm.intermediateServicesBpLimited = false;
        return;
      }

      const selectedValues = this.rateForm.intermediateServices;
      const options = this.intermediateServicesOptions;

      if (!options || options.length === 0) {
        console.log('中间业务选项列表为空，无法计算BP值');
        return;
      }

      // 获取所有选中选项的BP值
      const THIRD_PAY_LABEL = '三方支付：签约支付宝、财付通、京东、抖音等三方协议支付产品且（本年）发生一笔交易（含）以上，每个产品算1种，封顶2种';
      
      const bps = selectedValues
        .map(val => {
          const opt = options.find(o => String(o.value) === String(val));
          if (!opt || isNaN(Number(opt.bpValue))) {
            return 0;
          }

          // 特殊处理三方支付：按产品数量（封顶2种）乘以bpValue
          if (val === THIRD_PAY_LABEL || opt.paramName === THIRD_PAY_LABEL || opt.label === THIRD_PAY_LABEL) {
            const flag = Number(this.rateForm.thirdpayFlag) || 0;
            const count = Math.min(flag, 2); // 封顶2种
            return Number(opt.bpValue) * count;
          }

          // 其他选项按原逻辑处理
          return Number(opt.bpValue);
        });

      // 累加所有选中项的BP值
      let sum = bps.reduce((sum, v) => sum + v, 0);
      
      let bpLimit = { minBp: -10, maxBp: 0 }; // 使用硬编码的默认值
      // 获取最大最小限制
      if(this.paramBpLimits['intermediate_services']){
        bpLimit = this.paramBpLimits['intermediate_services'];
      }
      
      // 设置是否达到限制标志
      if (sum <= bpLimit.minBp || sum >= bpLimit.maxBp) {
        this.rateForm.intermediateServicesBpLimited = true;
      } else {
        this.rateForm.intermediateServicesBpLimited = false;
      }
      
      // 应用最大最小限制
      if (sum < bpLimit.minBp) sum = bpLimit.minBp;
      if (sum > bpLimit.maxBp) sum = bpLimit.maxBp;

      this.rateForm.intermediateServicesBp = sum;
    },
    
    /** 计算还息因素BP值 */
    calculateInterestFactorsBP() {
      // 如果没有还息因素值，直接返回
      if (!this.rateForm.interestFactors) {
        this.rateForm.interestFactorsBp = 0;
        return;
      }
      
      // 在interestFactorsOptions中查找对应的BP值
      const selectedValue = this.rateForm.interestFactors;
      const options = this.interestFactorsOptions;
      
      if (!options || options.length === 0) {
        console.warn('还息因素选项列表为空，无法计算BP值');
        return;
      }
      
      // 查找匹配的选项
      const matchedOption = options.find(opt => String(opt.value) === String(selectedValue));
      
      if (matchedOption && !isNaN(Number(matchedOption.bpValue))) {
        // 获取原始BP值
        const originalBp = Number(matchedOption.bpValue);
        
        // 获取BP限制
        let bpLimit = null;
        const paramId = 'interest_factors'; // 参数ID
        if (this.paramBpLimits && this.paramBpLimits[paramId]) {
          bpLimit = this.paramBpLimits[paramId];
        }
        
        // 标记是否已经限制了BP值
        this.rateForm.interestFactorsBpLimited = false;
        
        // 应用BP限制
        if (bpLimit) {
          // 如果有最小值限制，并且原始BP值小于最小值，则使用最小值
          if (bpLimit.minBp !== undefined && originalBp < bpLimit.minBp) {
            this.rateForm.interestFactorsBp = bpLimit.minBp;
            this.rateForm.interestFactorsBpLimited = true;
            console.log(`还息因素BP值被限制为最小值: ${bpLimit.minBp}`);
            return;
          }
          
          // 如果有最大值限制，并且原始BP值大于最大值，则使用最大值
          if (bpLimit.maxBp !== undefined && originalBp > bpLimit.maxBp) {
            this.rateForm.interestFactorsBp = bpLimit.maxBp;
            this.rateForm.interestFactorsBpLimited = true;
            console.log(`还息因素BP值被限制为最大值: ${bpLimit.maxBp}`);
            return;
          }
        }
        
        // 如果没有被限制，使用原始BP值
        this.rateForm.interestFactorsBp = originalBp;
        console.log('还息因素BP值:', this.rateForm.interestFactorsBp);
      } else {
        // 未找到匹配选项或BP值无效，设为0
        this.rateForm.interestFactorsBp = 0;
        console.warn('未找到匹配的还息因素选项或BP值无效，设为0');
      }
      
      // 更新产品利率BP值
      this.autoUpdateProductRateBp();
    },

    /** 计算首贷因素BP值 */
    calculateFirstLoanFactorsBP() {
      // 如果没有首贷因素值，直接返回
      if (!this.rateForm.firstLoanFactors) {
        this.rateForm.firstLoanFactorsBp = 0;
        return;
      }
      
      // 在firstLoanFactorsOptions中查找对应的BP值
      const selectedValue = this.rateForm.firstLoanFactors;
      const options = this.firstLoanFactorsOptions;
      
      if (!options || options.length === 0) {
        console.warn('首贷因素选项列表为空，无法计算BP值');
        return;
      }
      
      // 查找匹配的选项
      const matchedOption = options.find(opt => String(opt.value) === String(selectedValue));
      
      if (matchedOption && !isNaN(Number(matchedOption.bpValue))) {
        // 获取原始BP值
        const originalBp = Number(matchedOption.bpValue);
        
        // 获取BP限制
        let bpLimit = null;
        const paramId = 'first_loan_factors'; // 参数ID
        if (this.paramBpLimits && this.paramBpLimits[paramId]) {
          bpLimit = this.paramBpLimits[paramId];
        }
        
        // 标记是否已经限制了BP值
        this.rateForm.firstLoanFactorsBpLimited = false;
        
        // 应用BP限制
        if (bpLimit) {
          // 如果有最小值限制，并且原始BP值小于最小值，则使用最小值
          if (bpLimit.minBp !== undefined && originalBp < bpLimit.minBp) {
            this.rateForm.firstLoanFactorsBp = bpLimit.minBp;
            this.rateForm.firstLoanFactorsBpLimited = true;
            console.log(`首贷因素BP值被限制为最小值: ${bpLimit.minBp}`);
            return;
          }
          
          // 如果有最大值限制，并且原始BP值大于最大值，则使用最大值
          if (bpLimit.maxBp !== undefined && originalBp > bpLimit.maxBp) {
            this.rateForm.firstLoanFactorsBp = bpLimit.maxBp;
            this.rateForm.firstLoanFactorsBpLimited = true;
            console.log(`首贷因素BP值被限制为最大值: ${bpLimit.maxBp}`);
            return;
          }
        }
        
        // 如果没有被限制，使用原始BP值
        this.rateForm.firstLoanFactorsBp = originalBp;
        console.log('首贷因素BP值:', this.rateForm.firstLoanFactorsBp);
      } else {
        // 未找到匹配选项或BP值无效，设为0
        this.rateForm.firstLoanFactorsBp = 0;
        console.warn('未找到匹配的首贷因素选项或BP值无效，设为0');
      }
      
      // 更新产品利率BP值
      this.autoUpdateProductRateBp();
    },
    
    /** 计算忠诚度BP值 */
    calculateLoyaltyDegreeBP() {
      if (!this.rateForm.loyaltyDegree || this.rateForm.loyaltyDegree.length === 0) {
        this.rateForm.loyaltyDegreeBp = 0;
        this.rateForm.loyaltyDegreeBpLimited = false;
        return;
      }
      
      // 获取该字段的BP限制
      const limits = this.paramBpLimits['loyaltyDegree'] || {};
      const minBp = limits.minBp !== undefined ? Number(limits.minBp) : undefined;
      const maxBp = limits.maxBp !== undefined ? Number(limits.maxBp) : undefined;
      
      // 查找选中选项的BP值并累加
      const selectedOptions = this.loyaltyDegreeOptions.filter(opt => 
        this.rateForm.loyaltyDegree.includes(opt.value)
      );
      
      if (selectedOptions.length > 0) {
        // 累加所有选中项的BP值
        let totalBp = selectedOptions.reduce((sum, opt) => 
          sum + (Number(opt.bpValue) || 0), 0
        );
        
        // 检查是否超出限制
        let isLimited = false;
        if (minBp !== undefined && totalBp < minBp) {
          totalBp = minBp;
          isLimited = true;
        } else if (maxBp !== undefined && totalBp > maxBp) {
          totalBp = maxBp;
          isLimited = true;
        }
        
        // 设置BP值和限制标志
        this.rateForm.loyaltyDegreeBp = totalBp;
        this.rateForm.loyaltyDegreeBpLimited = isLimited;
      } else {
        this.rateForm.loyaltyDegreeBp = 0;
        this.rateForm.loyaltyDegreeBpLimited = false;
      }
      
      // 更新产品利率BP值
      this.autoUpdateProductRateBp();
    },
    
    /** 获取客户中间业务信息 */
    async getCustBusinessInfo(custNo) {
      if (!custNo) return;
      // 确保中间业务选项已经初始化
      if (!this.intermediateServicesOptions || this.intermediateServicesOptions.length === 0) {
        this.initIntermediateServicesOptions();
      }
      try {
        // 根据客户类型调用不同的API
        const apiCall = this.submitData.customerType === '对私' 
          ? getPerBusinessInfo(custNo) 
          : getPubBusinessInfo(custNo);
        const response = await apiCall;
        //设置忠诚度
        const selectedLoyaltyDegrees = [];
        this.rateForm.loyaltyDegree = selectedLoyaltyDegrees;
        if(response.data == null){
          console.info('客户中间业务信息不存在');
          //设置还息因素
          const selectedoverdueMonths = [];
          selectedoverdueMonths.push('近1年每月21日无欠息余额');
          this.rateForm.interestFactors = selectedoverdueMonths[0];
          //设置首贷因素
          const selectedFirstLoanFactors = [];
          selectedFirstLoanFactors.push('前推36个月在本行无贷款记录');
          this.rateForm.firstLoanFactors = selectedFirstLoanFactors[0];
          // 计算还息因素的BP值
          this.calculateInterestFactorsBP();
          // 计算首贷因素的BP值
          this.calculateFirstLoanFactorsBP();
          return
        }
        if (response.code === 200 && response.data) {
          const data = response.data;
          const selectedServices = [];
          // 只保留未停用的
          const validParams = this.secondParams.filter(item => item.paramStatus === 1);
          const validParamNames = validParams.map(item => item.paramName);
          // 对私客户中间业务映射
          if (this.submitData.customerType === '对私') {
            if (data.corepersonalFlag === '1' && validParamNames.includes('个人核心资产客户：本年日均个人资产余额（存款、理财（含代销）日均余额大于10000元')) selectedServices.push('个人核心资产客户：本年日均个人资产余额（存款、理财（含代销）日均余额大于10000元');
            if (data.creditcardFlag === '1' && validParamNames.includes('个人信用卡客户：本年日均信用卡用信余额500元')) selectedServices.push('个人信用卡客户：本年日均信用卡用信余额500元');
            if (data.electricSign === '1' && validParamNames.includes('签约社保卡代扣电费')) selectedServices.push('签约社保卡代扣电费');
            if (data.waterSign === '1' && validParamNames.includes('签约社保卡代扣水费')) selectedServices.push('签约社保卡代扣水费');
            if (data.tvfeeSign === '1' && validParamNames.includes('签约社保卡代扣华数')) selectedServices.push('签约社保卡代扣华数');
            if (data.medSign === '1' && validParamNames.includes('签约社保卡代扣城乡两费')) selectedServices.push('签约社保卡代扣城乡两费');
            if (data.etcSign === '1' && validParamNames.includes('签约ETC')) selectedServices.push('签约ETC');
            if (data.fshlFlag === '1' && validParamNames.includes('丰收互联：持有丰收互联产品，且本年累计交易4次及以上')) selectedServices.push('丰收互联：持有丰收互联产品，且本年累计交易4次及以上');
            if (data.socialcardFlag === '1' && validParamNames.includes('持有三代社保卡')) selectedServices.push('持有三代社保卡');
            if (data.eSocialcardFlag === '1' && validParamNames.includes('签约电子社保卡')) selectedServices.push('签约电子社保卡');
            if (data.eMedvoucherFlag === '1' && validParamNames.includes('签约医保电子凭证')) selectedServices.push('签约医保电子凭证');
            if (Number(data.thirdpayFlag) >= 1 && validParamNames.includes('三方支付：签约支付宝、财付通、京东、抖音等三方协议支付产品且（本年）发生一笔交易（含）以上，每个产品算1种，封顶2种')) selectedServices.push('三方支付：签约支付宝、财付通、京东、抖音等三方协议支付产品且（本年）发生一笔交易（含）以上，每个产品算1种，封顶2种');
          } else {
            if(data.zqzgFlag === '1' && validParamNames.includes('浙企智管有效户（六宝一生态开通三项及以上且有效）')) selectedServices.push('浙企智管有效户（六宝一生态开通三项及以上且有效）');
            if (data.electricSign === '1' && validParamNames.includes('签约代扣电费')) selectedServices.push('签约代扣电费');
            if (data.forexFlag === '1' && validParamNames.includes('开立外汇结算账户')) selectedServices.push('开立外汇结算账户');
            if (data.taxSign === '1' && validParamNames.includes('签约代扣税款')) selectedServices.push('签约代扣税款');
            if (data.creditcardFlag === '1' && validParamNames.includes('本年法人信用卡用信3次及以上')) selectedServices.push('本年法人信用卡用信3次及以上');
            if(data.coreenterpriseFlag === '1' && validParamNames.includes('企业核心用户：本年日均存款余额大于等于5万元的对公客户')) selectedServices.push('企业核心用户：本年日均存款余额大于等于5万元的对公客户');
            if (data.payagentFlag === '1' && validParamNames.includes('代发工资')) selectedServices.push('代发工资');
          }
          this.rateForm.intermediateServices = selectedServices;
          //保存三分支付产品数量，用于计算BP值
          this.rateForm.thirdpayFlag = data.thirdpayFlag || 0;
          // 计算6月代发余额
          if(this.submitData.customerType === '对公' ){
            this.rateForm.enterpriseRepresentativeBusiness = data.payagentJe  || '0';
            this.calculateEnterpriseRepresentativeBusinessBp();
          }
          
          //设置还息因素
          const selectedoverdueMonths = [];
          if(data.overdueMonths && Number(data.overdueMonths) >= 3){
            selectedoverdueMonths.push('近1年存在3次（含）以上21日有欠息余额情况');
          }else{
            selectedoverdueMonths.push('近1年每月21日无欠息余额');
          }
          // 尝试将值设置为字符串而不是数组
          this.rateForm.interestFactors = selectedoverdueMonths[0];
          
          //设置首贷因素
          const selectedFirstLoanFactors = [];
          if(data.loanNum && Number(data.loanNum) >= 1){
            selectedFirstLoanFactors.push('近3年在本行有贷款记录');
          }else{
            selectedFirstLoanFactors.push('近3年在本行无用信');
          }
          // 尝试将值设置为字符串而不是数组
          this.rateForm.firstLoanFactors = selectedFirstLoanFactors[0];
          
          // 处理忠诚度字段 - 根据返回数据自动选择对应的忠诚度选项
          const selectedLoyaltyDegrees = [];
          
        // 确保忠诚度选项已初始化
          // 对私客户忠诚度映射
          if (this.submitData.customerType === '对私') {
            if(data.loyalDeposit === '1') selectedLoyaltyDegrees.push('近3年每年存款日均余额大于0');
            if(data.loyalLoan === '1') selectedLoyaltyDegrees.push('近3年每年贷款日均余额大于20万');
            if(data.loyalYxl === '1') selectedLoyaltyDegrees.push('本年日均贷款用信率达90%（含）以上');
          } 
          // 对公客户忠诚度映射
          else {
            if(data.loyalDeposit === '1') selectedLoyaltyDegrees.push('近3年每年存款日均余额大于0');
            if(data.loyalLoan === '1') selectedLoyaltyDegrees.push('近3年每年贷款日均余额大于200万');
            if(data.loyalYxl === '1') selectedLoyaltyDegrees.push('本年日均贷款用信率达90%（含）以上');
            if(data.loyalPayagent === '1') selectedLoyaltyDegrees.push('近3年有代发工资记录');
            if(data.loyalPayagentNum === '1') selectedLoyaltyDegrees.push('近一年累计代发工资笔数达96笔（含）以上');
          }
          
          // 设置选中的忠诚度值
          this.rateForm.loyaltyDegree = selectedLoyaltyDegrees;
          
          // 确保下一个渲染循环中更新BP值
          this.$nextTick(() => {
            // 使用独立的方法计算BP值
            this.calculateIntermediateServicesBP();
            // 计算还息因素的BP值
            this.calculateInterestFactorsBP();
            // 计算首贷因素的BP值
            this.calculateFirstLoanFactorsBP();
            // 计算忠诚度的BP值
            this.calculateLoyaltyDegreeBP();
          });
        } else {
          console.warn('中间业务API返回数据格式不正确:', response);
          // ...后续忠诚度、还息等逻辑不变...
        }
      } catch (error) {
        console.error('获取客户中间业务信息失败:', error);
      }
    },
    
    /** 通用数字输入验证和格式化 */
    validateNumberInput(field, fieldLabel) {
      const value = this.rateForm[field];
      
      // 如果是空，允许
      if (!value) {
        // 如果是关键金额字段，重新计算原欠款和额度定价
        if (['credit', 'guarantee', 'collateral'].includes(field)) {
          this.calculateOriginalDebt();
        } else if (field === 'applyAmount') {
          // 如果是申请金额，更新额度定价和存贷比例
          this.calculateQuotaRating();
          if (!this.isInitializing) {
            this.calculateDepositRatio();
          }
        } else if (['dailyDeposits', 'otherDeposit'].includes(field)) {
          // 如果是存款相关字段，更新存贷比例
          if (!this.isInitializing) {
            this.calculateDepositRatio();
          }
        } else if (field === 'enterpriseRepresentativeBusiness') {
          // 如果是前12月代发余额，更新其BP值
          this.calculateEnterpriseRepresentativeBusinessBp();
        }
        return true;
      }
      
      // 验证数字格式
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        ElMessage.warning(`${fieldLabel}必须是数字`);
        this.rateForm[field] = '';
        return false;
      }
      
      // 对于金额字段，验证小数点后位数不超过2位
      if (this.numberFields.includes(field)) {
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          ElMessage.warning(`${fieldLabel}最多保留两位小数`);
          // 自动格式化为两位小数
          this.rateForm[field] = numericValue.toFixed(2);
        }
        
        // 如果是关键金额字段，重新计算原欠款和额度定价
        if (['credit', 'guarantee', 'collateral'].includes(field)) {
          this.calculateOriginalDebt();
        } else if (field === 'applyAmount') {
          // 如果是申请金额，更新额度定价和存贷比例
          this.calculateQuotaRating();
          if (!this.isInitializing) {
            this.calculateDepositRatio();
          }
        } else if (['dailyDeposits', 'otherDeposit'].includes(field)) {
          // 如果是存款相关字段，更新存贷比例
          if (!this.isInitializing) {
            this.calculateDepositRatio();
          }
        } else if (field === 'enterpriseRepresentativeBusiness') {
          // 如果是前12月代发余额，更新其BP值
          this.calculateEnterpriseRepresentativeBusinessBp();
        }
      }
      
      return true;
    },
    
    /** 通用表单验证器 */
    validateNumber(rule, value, callback) {
      if (value === '' || value === undefined || value === null) {
        callback();
      } else if (rule.field === 'depositRatio') {
        // 存贷比例特殊处理，允许负数
        if (!/^-?\d+(\.\d+)?$/.test(value)) {
          callback(new Error('请输入有效的数字，可以为负数'));
        } else {
          callback();
        }
      } else if (!/^\d+(\.\d+)?$/.test(value)) {
        callback(new Error('请输入有效的数字'));
      } else {
        callback();
      }
    },
    
    /** 计算原欠款总额 */
    calculateOriginalDebt() {
      const credit = parseFloat(this.rateForm.credit) || 0;
      const guarantee = parseFloat(this.rateForm.guarantee) || 0;
      const collateral = parseFloat(this.rateForm.collateral) || 0;
      
      this.rateForm.originalDebt = (credit + guarantee + collateral).toFixed(2);
      
      // 计算完原欠款后，自动计算额度定价
      this.calculateQuotaRating();
      
      // 更新存贷比例（初始化期间不调用，避免重复计算）
      if (!this.isInitializing) {
        this.calculateDepositRatio();
      }
    },
    
    /** 根据金额自动计算额度定价 */
    calculateQuotaRating() {
      // 如果担保方式不是抵押，则清空额度定价并直接返回
      if (this.rateForm.guaranteeType !== '抵押') {
        this.rateForm.quota = '';
        this.rateForm.quotaBp = 0;
        return;
      }
      
      // 获取总金额
      const originalDebt = parseFloat(this.rateForm.originalDebt) || 0;
      const applyAmount = parseFloat(this.rateForm.applyAmount) || 0;
      const totalAmount = originalDebt + applyAmount;
      
      // 如果总金额为0，清空额度定价
      if (totalAmount <= 0) {
        this.rateForm.quota = '';
        this.rateForm.quotaBp = 0;
        return;
      }
      
      // 检查选项是否已加载
      if (!this.quotaOptions || this.quotaOptions.length === 0) {
        return;
      }
      
      // 从选项中提取数值并排序
      const numericOptions = this.quotaOptions.map(option => {
        // 尝试从label中提取数字
        const match = option.label.match(/(\d+)/);
        const value = match ? parseInt(match[1], 10) : 0;
        
        return {
          originalOption: option,
          numericValue: value
        };
      }).filter(item => item.numericValue > 0) // 过滤掉无效值
        .sort((a, b) => a.numericValue - b.numericValue); // 按数值从小到大排序
      
      // 查找匹配的选项
      let matchedOption = null;
      
      // 如果金额小于最小选项，使用最小选项
      if (totalAmount <= numericOptions[0].numericValue) {
        matchedOption = numericOptions[0].originalOption;
      } 
      // 如果金额大于最大选项，使用最大选项
      else if (totalAmount > numericOptions[numericOptions.length - 1].numericValue) {
        matchedOption = numericOptions[numericOptions.length - 1].originalOption;
      } 
      // 否则，找到第一个大于等于金额的选项
      else {
        for (let i = 0; i < numericOptions.length; i++) {
          if (numericOptions[i].numericValue >= totalAmount) {
            matchedOption = numericOptions[i].originalOption;
            break;
          }
        }
      }
      
      // 如果找到匹配的选项，设置额度定价
      if (matchedOption) {
        this.rateForm.quota = totalAmount;
        this.rateForm.quotaBp = matchedOption.bpValue || 0;
      } else {
        // 如果没找到匹配的选项，清空额度定价
        this.rateForm.quota = '';
        this.rateForm.quotaBp = 0;
      }
    },
    
    /** 计算总BP值 */
    calculateTotalBp() {
      // 使用从LoanInfo组件获取的基础定价加点值
      let finalBasePointValue = 0;
      
      // 1. 先尝试从ref获取
      if (this.$refs.loanInfoRef && this.$refs.loanInfoRef.finalBasePointValue) {
        finalBasePointValue = parseFloat(this.$refs.loanInfoRef.finalBasePointValue);
      } 
      // 2. 如果ref不可用，使用存储的值
      else if (this.basePointValue) {
        finalBasePointValue = this.basePointValue;
      }
      
      // 产品政策定价BP值
      const productBp = parseFloat(this.rateForm.productRateBp || 0);
      
      // 行权限BP值
      const bankPowerBp = parseFloat(this.rateForm.bankPowerRateBp || 0);
      
      // 协议定价BP值
      const protocolBp = parseFloat(this.rateForm.protocolBp || 0);
      
      // 总BP值 = 基础定价加点 + 产品政策定价BP + 行权限BP + 协议定价BP
      // 注意：产品和行权限只会有一个有值，另一个为0
      const totalBp = finalBasePointValue + productBp + bankPowerBp + protocolBp;
      
      // 四舍五入到整数，解决浮点数精度问题
      return Math.round(totalBp);
    },
    
    /** 获取已选择的选项标签文本 */
    getSelectedLabels(options, selectedValues) {
      if (!options || !selectedValues || !selectedValues.length) return '';
      
      return selectedValues.map(value => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
      }).join('、');
    },
    
    /** 提交按钮 */
    submitForm() {
      Promise.all([
        this.$refs.basicInfoRef.validate(),
        this.$refs.loanInfoRef.validate(),
        this.$refs.pricingInfoRef && this.$refs.pricingInfoRef.validate ? this.$refs.pricingInfoRef.validate() : Promise.resolve(true)
      ])
      .then(results => {
        // 只有全部校验通过才保存
        if (!results || !results.every(valid => valid)) return;
        // 验证所有BP值，确保在限制范围内
        this.validateAllBpValues();
        // 组装提交数据，将动态字段数据平铺到提交数据中
        const formData = { ...this.rateForm };
        if (formData.dynamicFields) {
          for (const key in formData.dynamicFields) {
            // 只有主表单没有该字段时才赋值
            if (!(key in formData)) {
              formData[key] = formData.dynamicFields[key].value;
              formData[`${key}Bp`] = formData.dynamicFields[key].bpValue;
            }
          }
          delete formData.dynamicFields;
        }
        // 多选字段转字符串
        const multiSelectFields = [
          'intermediateServices',
          'industryProperty',
          'loyaltyDegree',
          'wealthBusiness',
          'specialBusiness'
        ];
        multiSelectFields.forEach(field => {
          if (Array.isArray(formData[field])) {
            formData[field] = formData[field].join(',');
          }
        });
        // 添加基础利率参数
        formData.lprValue = this.rateBaseParam.lprValue;
        formData.minRate = this.rateBaseParam.minRate;
        // 基础定价最终结果
        formData.finalBasePointValue = this.basePointValue;
        // 新增：基础定价计算结果和利率限制调整
        formData.basePointValue = this.$refs.loanInfoRef && this.$refs.loanInfoRef.totalBpValue !== undefined
          ? (typeof this.$refs.loanInfoRef.totalBpValue === 'function'
              ? this.$refs.loanInfoRef.totalBpValue()
              : this.$refs.loanInfoRef.totalBpValue)
          : 0;
        // 新增：利率限制调整
        formData.rateLimitAdjusted = (
          this.$refs.loanInfoRef &&
          this.$refs.loanInfoRef.isMinRateLimitReached
            ? (typeof this.$refs.loanInfoRef.additionalBpRequired === 'function'
                ? this.$refs.loanInfoRef.additionalBpRequired()
                : this.$refs.loanInfoRef.additionalBpRequired)
            : 0
        );
        // 计算并添加总BP值和最终利率
        formData.totalBp = this.calculateTotalBp();
        formData.finalRate = this.calculateFinalRate();
        // 完整提交数据
        const data = {
          customerId: this.customerId || (this.$route && this.$route.query.customerId),
          ...this.submitData,
          ...formData,
          createBy: useUserStore().name
        };
        // 移除所有的BpLimited字段，因为这些只是UI标记，不需要提交
        for (const key of Object.keys(data)) {
          if (key.endsWith('BpLimited') || key.endsWith('_bp_limited')) {
            delete data[key];
          }
        }
        console.log('最终提交数据：', data);
        saveRatePrice(data).then(response => {
          ElMessage.success("保存成功");
          // 1. 重置主表单
          this.resetFormData();
          // 2. 清空调试和大对象
          this.debug = {
            loadedParams: [],
            mappedFields: {},
            showDebug: false,
            activeTab: 'loadedParams',
            bpLimits: []
          };
          this.cancel();
        });
      })
      .catch(err => {
        // 表单校验未通过时，err为校验错误对象，不做任何处理即可避免Uncaught (in promise)
        // 你可以在这里自定义提示，如：
        // ElMessage.warning('请完善表单信息后再提交');
      });
    },
    
    /** 取消按钮 */
    cancel() {
      if (this.$route && this.$route.name === 'RatePrice') {
        // 使用正确的路由路径返回客户管理页面
        this.$router.push({ name: 'customerRate' });
      } else {
        this.$emit('close');
      }
    },

    /** 判断是否应该显示某个字段 */
    shouldShowField(field) {
      // 如果paramList尚未加载，默认显示关键字段
      if (!this.paramList || this.paramList.length === 0) {
        // 始终显示这些关键字段，即使参数尚未加载
        const criticalFields = ['credit', 'guarantee', 'collateral', 'applyAmount', 'loanTerm', 'guaranteeType'];
        return criticalFields.includes(field);
      }
      
      // 对于抵押相关字段，如果担保方式为抵押，则始终返回true
      // if(this.rateForm.guaranteeType === '抵押' && ['landType', 'purpose', 'region'].includes(field)) {
      //   return true;
      // }
      
      // 转换字段名 camelCase 到 snake_case 进行匹配
      // 例如: loanTerm -> loan_term
      const fieldSnakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // 检查参数列表中是否包含该字段ID (处理前导空格和下划线格式)
      return this.paramList.some(param => {
        // 去除paramId可能有的前导空格并转为小写
        const paramIdCleaned = param.paramId ? param.paramId.trim().toLowerCase() : '';
        
        // 比较转换后的字段名与参数ID
        return paramIdCleaned === fieldSnakeCase ||  // 完全匹配
               paramIdCleaned === '_' + fieldSnakeCase || // 前导下划线匹配
               paramIdCleaned.includes(fieldSnakeCase) ||   // 包含关系
               paramIdCleaned === field.toLowerCase(); // 直接匹配，不进行camelCase转换
      });
    },

    /** 处理选项变更，更新BP值 */
    handleOptionChange(field, option, fieldLabel) {
      if (option && option.bpValue !== undefined) {
        // 如果选择了选项，设置BP值
        this.rateForm[field + 'Bp'] = option.bpValue;
        // 应用BP值限制
        const limitedBp = this.limitBpValue(field, option.bpValue);
        if (option.bpValue !== limitedBp) {
          this.rateForm[field + 'Bp'] = limitedBp;
          this.rateForm[field + 'BpLimited'] = true;
          ElMessage.warning(`${fieldLabel || field}的BP值已被限制到限制范围内`);
        } else {
          this.rateForm[field + 'BpLimited'] = false;
        }
        
        // 若是贷款期限，则调用获取基础利率参数
        if (field === 'loanTerm') {
          this.getRateParamByTerm(field, option.label, option.bpValue);
        }
        
      } else {
        // 如果清空了选项，也清空BP值
        this.rateForm[field + 'Bp'] = 0;
        this.rateForm[field + 'BpLimited'] = false;
      }
    },

    /** 根据贷款期限获取利率参数 */
    getRateParamByTerm(field, termValue,  bpValue) {
      // 构建paramId - 根据客户类型和期限值
      let paramPrefix = this.submitData.customerType === '对公' ? 'DG/' : 'DS/';
      let paramId = '';
      
      // 根据具体期限值处理
      if (termValue.includes('5年（不含）以上')) {
        paramId = paramPrefix + '5Y';
      } else {
        // 默认按1年处理
        paramId = paramPrefix + '1Y';
      }
      
      // 获取担保方式
      const pledgeType = this.rateForm.guaranteeType || '';
      
      // 调用接口获取基础利率参数，添加担保方式参数
      getRateParamList(paramId, pledgeType).then(response => {
        if (response.code === 200 && response.data) {
          this.rateBaseParam = response.data;
          
          // 如果有基础加点，添加到表单中的总BP值
          if (this.rateBaseParam.basePoint) {
            // 后续如果需要改动贷款期限的BP值，则需要修改这里
            // this.rateForm[field + 'Bp'] = this.rateBaseParam.basePoint + bpValue;
            // 直接赋值代替$set
            this.rateForm.basePointBp = this.rateBaseParam.basePoint;
            nextTick(() => {
              // 更新显示的总BP值
              ElMessage.success(`已加载基础加点: ${this.rateBaseParam.basePoint}BP`);
            });
          }
        } else {
          // 直接赋值代替$set
          this.rateForm.basePointBp = 0;
        }
      }).catch(() => {
        // 直接赋值代替$set
        this.rateForm.basePointBp = 0;
      });
    },

    /** 处理多选选项变更，累加BP值 */
    handleMultiOptionChange(field, option, label) {
      // 默认初始化BP值为0
      if (this.rateForm[field + 'Bp'] === undefined) {
        this.rateForm[field + 'Bp'] = 0;
      }
      
      // 检查选项是否被选中
      const isSelected = this.rateForm[field] && this.rateForm[field].includes(option.value);
      
      // 累加原始BP值（不限制）
      const originalBp = isSelected ? 
        this.rateForm[field + 'Bp'] + (option.bpValue || 0) : 
        this.rateForm[field + 'Bp'] - (option.bpValue || 0);
      
      // 应用BP值限制
      const limitedBp = this.limitBpValue(field, originalBp);
      this.rateForm[field + 'Bp'] = limitedBp;
      
      // 如果值被限制了，显示提示
      if (originalBp !== limitedBp) {
        // 获取字段对应的参数ID和BP限制
        const paramId = this.getParamIdByField(field);
        if (paramId && this.paramBpLimits[paramId]) {
          const limits = this.paramBpLimits[paramId];
          
          if (originalBp < limits.minBp) {
            ElMessage.warning(`${label}的BP值已达到最小限制: ${limits.minBp}`);
            // 设置标记，用于显示特殊样式
            this.rateForm[field + 'BpLimited'] = true;
          } else if (originalBp > limits.maxBp) {
            ElMessage.warning(`${label}的BP值已达到最大限制: ${limits.maxBp}`);
            // 设置标记，用于显示特殊样式
            this.rateForm[field + 'BpLimited'] = true;
          }
        }
      } else {
        // 清除限制标记
        this.rateForm[field + 'BpLimited'] = false;
      }
    },
    
    /** 限制BP值在允许范围内 */
    limitBpValue(field, value) {
      // 获取字段对应的参数ID和BP限制
      const paramId = this.getParamIdByField(field);
      if (!paramId || !this.paramBpLimits[paramId]) return value;
      
      const limits = this.paramBpLimits[paramId];
      let limitedValue = value;
      
      // 应用最小限制
      if (limits.minBp !== undefined && value < limits.minBp) {
        limitedValue = limits.minBp;
      } 
      // 应用最大限制
      else if (limits.maxBp !== undefined && value > limits.maxBp) {
        limitedValue = limits.maxBp;
      }
      
      return limitedValue;
    },
    
    /** 根据字段名获取参数ID */
    getParamIdByField(field) {
      // 反向查找映射
      for (const paramId in this.debug.mappedFields) {
        if (this.debug.mappedFields[paramId] === field) {
          return paramId;
        }
      }
      return null;
    },

    /** 清除特定字段的值 */
    clearField(field) {
      this.rateForm[field] = '';
      if (field === 'credit' || field === 'guarantee' || field === 'collateral') {
        this.calculateOriginalDebt();
      }
      // 如果有BP值，也清空
      if (this.rateForm[field + 'Bp'] !== undefined) {
        this.rateForm[field + 'Bp'] = 0;
      }
    },

    /** 获取字段的BP限制文本 */
    getBpLimitText(field) {
      const paramId = this.getParamIdByField(field);
      if (!paramId || !this.paramBpLimits[paramId]) return '';
      
      const limits = this.paramBpLimits[paramId];
      let text = '\n限制范围: ';
      
      if (limits.minBp !== undefined && limits.maxBp !== undefined) {
        text += `[${limits.minBp}, ${limits.maxBp}]`;
      } else if (limits.minBp !== undefined) {
        text += `≥ ${limits.minBp}`;
      } else if (limits.maxBp !== undefined) {
        text += `≤ ${limits.maxBp}`;
      } else {
        return '';
      }
      
      return text;
    },
    
    // 在调试面板中显示BP限制信息
    showBpLimitsInDebug() {
      this.debug.bpLimits = [];
      
      // 将参数限制转换为表格数据
      for (const paramId in this.paramBpLimits) {
        const limit = this.paramBpLimits[paramId];
        const field = this.debug.mappedFields[paramId] || paramId;
        const currentBp = field ? (this.rateForm[field + 'Bp'] || 0) : 0;
        
        this.debug.bpLimits.push({
          paramId,
          field,
          minBp: limit.minBp,
          maxBp: limit.maxBp,
          currentBp,
          isLimited: field ? this.rateForm[field + 'BpLimited'] : false
        });
      }
    },

    /** 获取其他存款人的贷款信息 */
    async getOtherDepositorsLoanInfo(customerId) {
      try {
        // 获取存款维护信息列表
        const depositorResponse = await listDepositor(customerId);
        if (depositorResponse.code !== 200 || !depositorResponse.rows) {
          console.log('获取存款维护信息列表失败或数据为空');
          return 0;
        }
        
        const depositorList = depositorResponse.rows;
        
        // 剔除本人信息，过滤出其他存款人
        const otherDepositors = depositorList.filter(depositor => {
          // 根据客户内码或客户号来判断是否是本人
          return depositor.depositorId !== customerId
        });
        
        console.log('其他存款人列表:', otherDepositors);
        
        if (otherDepositors.length === 0) {
          console.log('没有其他存款人');
          return 0;
        }
        
        // 查询每个其他存款人的贷款信息
        let totalOtherLoanAmount = 0;
        
        for (const depositor of otherDepositors) {
          try {
            // 使用客户号查询贷款信息
            const loanResponse = await getCustLoanInfo(depositor.depositorId);
            
            if (loanResponse.code === 200 && loanResponse.data) {
              const loanInfo = loanResponse.data;
              
              // 计算该客户的总贷款金额
              const creditAmount = parseFloat(loanInfo.xyye || 0); // 信用余额
              const guaranteeAmount = parseFloat(loanInfo.bzye || 0); // 保证余额
              const collateralAmount = parseFloat(loanInfo.dyye || 0); // 抵押余额
              
              const customerLoanAmount = creditAmount + guaranteeAmount + collateralAmount;
              totalOtherLoanAmount += customerLoanAmount;
              
              console.log(`客户 ${depositor.customerName}(${depositor.customerNo}) 贷款金额:`, {
                creditAmount,
                guaranteeAmount,
                collateralAmount,
                total: customerLoanAmount
              });
            } else {
              console.log(`客户 ${depositor.customerName}(${depositor.customerNo}) 无贷款信息`);
            }
          } catch (error) {
            console.error(`查询客户 ${depositor.customerName}(${depositor.customerNo}) 贷款信息失败:`, error);
          }
        }
        
        console.log('其他存款人总贷款金额:', totalOtherLoanAmount);
        return totalOtherLoanAmount;
        
      } catch (error) {
        console.error('获取其他存款人贷款信息失败:', error);
        return 0;
      }
    },

    /** 计算存贷比例 */
    calculateDepositRatio() {
      // 获取存款日均和其他日均
      const dailyDeposits = parseFloat(this.rateForm.dailyDeposits) || 0;
      const otherDeposit = parseFloat(this.rateForm.otherDeposit) || 0;
      
      // 获取原欠款总额和申请金额
      const originalDebt = parseFloat(this.rateForm.originalDebt) || 0;
      const applyAmount = parseFloat(this.rateForm.applyAmount) || 0;
      
      // 使用缓存的其他存款人贷款总额，不再重复查询接口
      const otherDepositorsLoanAmount = this.otherDepositorsLoanAmount || 0;
      
      // 计算存贷比例，分母包含本人贷款和其他存款人贷款
      let ratio = 0;
      const totalLoanAmount = originalDebt + applyAmount + otherDepositorsLoanAmount;
      if (totalLoanAmount > 0) {
        ratio = (Math.floor(dailyDeposits + otherDeposit) / totalLoanAmount) * 100;
      }
      
      // 四舍五入到两位小数
      this.rateForm.depositRatio = ratio.toFixed(2);
      
      // 计算BP值 - 确保参数已加载
      let bpValue = 0;
      
      if (ratio > 0) {
        // 将比例转换为整数部分，例如16.99%取16
        const ratioInt = Math.floor(ratio);
        
        // 存贷比例每个百分点的LPR值从paramOptions中获取
        let lprPerPoint = -5; // 默认值
        
        // 等待参数加载完成后再使用
        if (this.paramOptions && this.paramOptions['deposit_ratio'] && this.paramOptions['deposit_ratio'].length > 0) {
          lprPerPoint = this.paramOptions['deposit_ratio'][0].bpValue;
          console.log('使用参数配置的存贷比例BP值:', lprPerPoint);
        } else {
          console.log('参数未加载完成，使用默认存贷比例BP值:', lprPerPoint);
        }
        
        // 计算BP值：整数比例 * 每百分点LPR值
        bpValue = ratioInt * lprPerPoint;
        
        // 获取BP值限制
        let minBp = -500; // 默认最小值
        let maxBp = 0;    // 默认最大值，存贷比例BP值通常为负数或0
        
        // 尝试从paramBpLimits获取限制值
        if (this.paramBpLimits && this.paramBpLimits['deposit_ratio']) {
          if (this.paramBpLimits['deposit_ratio'].minBp !== undefined) {
            minBp = this.paramBpLimits['deposit_ratio'].minBp;
          }
          if (this.paramBpLimits['deposit_ratio'].maxBp !== undefined) {
            maxBp = this.paramBpLimits['deposit_ratio'].maxBp;
          }
          console.log('使用参数配置的存贷比例BP限制:', { minBp, maxBp });
        } else {
          console.log('参数限制未加载，使用默认存贷比例BP限制:', { minBp, maxBp });
        }
        
        // 应用BP值限制
        if (bpValue < minBp) {
          bpValue = minBp;
          this.rateForm.depositRatioBpLimited = true;
        } else if (bpValue > maxBp) {
          bpValue = maxBp;
          this.rateForm.depositRatioBpLimited = true;
        } else {
          this.rateForm.depositRatioBpLimited = false;
        }
      }
      
      // 设置BP值
      this.rateForm.depositRatioBp = bpValue;
      
      // 设置存贷区间
      let currentDate = new Date();
      let endMonth = currentDate.getMonth() + 1; // 当前月份
      let endYear = currentDate.getFullYear();
      
      // 计算开始月份 (12个月前)
      let startMonth = endMonth;
      let startYear = endYear - 1;
      
      // 格式化为"YYYY.MM-YYYY.MM"格式
      this.rateForm.depositPeriod = `${startYear}.${startMonth.toString().padStart(2, '0')} - ${endYear}.${endMonth.toString().padStart(2, '0')} = 12`;
      
      console.log('存贷比计算详情:', {
        dailyDeposits,
        otherDeposit,
        originalDebt,
        applyAmount,
        otherDepositorsLoanAmount,
        totalLoanAmount,
        ratio: this.rateForm.depositRatio
      });
    },
    
    /** 获取产品列表 */
    fetchProductOptions() {
      if (this.submitData.customerType && this.rateForm.guaranteeType) {
        // 获取产品列表
        getRateProductList(this.submitData.customerType, this.rateForm.guaranteeType).then(response => {
          if (response.code === 200 && response.data) {
            const productList = response.data.map(item => ({
              label: item.paramName || '',
              value: item.paramName || '',
              minRate: item.minRate,
              maxRate: item.maxRate,
              fixedRate: item.fixedRate,
              fixedPoint: item.fixedPoint,
              calculateType: item.calculateType, // 添加计算方式
              pointValue: item.pointValue,  // 添加点值
              isShare: item.isShare != null ? Number(item.isShare) : 0,  // 将isShare转换为数字
              type: 'product'
            }));
            
            // 获取行权限定价信息
            getRateBankPowerInfo(this.rateForm.guaranteeType).then(bankResponse => {
              if (bankResponse.code === 200 && bankResponse.data) {
                const bankPowerList = bankResponse.data.map(item => ({
                  label: item.paramName || '',
                  value: item.paramName || '',
                  bpPoint: item.bpPoint,
                  minRate: item.minRate,
                  // 根据行权限类型设置是否参与分成：总行权限不参与分成(0)，支行权限允许分成(1)
                  isShare: item.paramName.indexOf('总行') > -1 ? 0 : 1,
                  type: 'bankPower'
                }));
                // this.bankPowerInfoList = bankResponse.data || [];
                // if (this.bankPowerType === '总行') {
                //   this.currentBankPowerInfo = this.bankPowerInfoList.find(item => item.paramName === '总行权限') || null;
                //   if (this.currentBankPowerInfo && this.currentBankPowerInfo.bpPoint !== null && this.currentBankPowerInfo.bpPoint !== undefined) {
                //     this.rateForm.headRateBp = this.currentBankPowerInfo.bpPoint;
                //   }
                // } else {
                //   this.currentBankPowerInfo = null;
                // }
                
                
                // 保存原始的完整产品选项列表
                this.originalProductOptions = [...productList, ...bankPowerList];
                
                // 合并产品列表和行权限定价列表，并根据当前条件过滤
                this.productOptions = [...productList, ...bankPowerList];
                
                // 初始加载后根据当前基础定价加点值过滤产品选项
                this.filterProductOptionsByBasePoint();
              }
            });
          } else {
            this.productOptions = [];
            this.originalProductOptions = [];
          }
        }).catch(error => {
          console.error('获取产品列表异常:', error);
          this.productOptions = [];
          this.originalProductOptions = [];
        });
      }
    },
    
    /** 根据基础定价加点值过滤产品选项 */
    filterProductOptionsByBasePoint() {
      // 如果没有原始产品选项，直接返回
      if (!this.originalProductOptions || this.originalProductOptions.length === 0) return;
      // 获取当前LPR值和基础定价加点
      const lprValue = parseFloat(this.rateBaseParam.lprValue || 0);
      const finalBasePointValue = parseFloat(this.basePointValue || 0) / 100; // 转换为百分比
      // 产品政策定价BP值
      const productBpValue = parseFloat(this.rateForm.productRateBp || 0) / 100;
      const currentRate = lprValue + finalBasePointValue + productBpValue;
      
      // 分离普通产品和行权限产品（从原始列表中）
      const regularProducts = this.originalProductOptions.filter(item => item.type !== 'bankPower');
      const bankPowerProducts = this.originalProductOptions.filter(item => item.type === 'bankPower');
      
      // 过滤行权限产品，只保留满足最低利率要求的选项
      const filteredBankPowerProducts = bankPowerProducts.filter(item => {
        // 如果有最低利率要求，检查当前利率是否满足
        if (item.minRate !== null && item.minRate !== undefined) {
          return currentRate >= parseFloat(item.minRate);
        }
        return true; // 没有最低利率要求的选项保留
      });
      
      // 更新产品选项列表
      this.productOptions = [...regularProducts, ...filteredBankPowerProducts];
    },
    
    /** 处理产品选择变更 */
    handleProductChange(value) {
      // 重置BP值限制
      this.productRateLimit = {
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      };
      
      // 重置BP值
      this.rateForm.productRateBp = '';
      
      // 如果变更了产品定价，清空行权限选项
      // 清空行权限选项
      this.rateForm.bankPowerRate = '';
      this.rateForm.bankPowerRateBp = '';
      this.bankPowerRateLimit = {
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      };
      
      if (!value) return;
      
      // 查找选中的选项
      const selectedOption = this.productOptions.find(item => item.value === value);
      if (!selectedOption) return;
      
      // 获取基础数据
      const lprValue = parseFloat(this.rateBaseParam.lprValue || 0);
      const basePointBp = parseFloat(this.basePointValue || 0);
      const lprBp = lprValue * 100; // LPR转换为BP值
      
      if (selectedOption.type === 'product') {
        // 产品选项
        this.productRateLimit.minRate = selectedOption.minRate;
        this.productRateLimit.maxRate = selectedOption.maxRate;
        
        // 获取计算方式和点值
        const calculateType = selectedOption.calculateType;
        const pointValue = parseFloat(selectedOption.pointValue || 0);
        
        // 根据计算方式处理BP值
        if (calculateType === '人工定价') {
          // 人工定价：允许手动输入
          this.productRateLimit.isFixed = false;
          
          // 计算最低利率限制下的最小BP值
          // ... existing code ...
          // const minRate = selectedOption.minRate !== undefined && selectedOption.minRate !== null && selectedOption.minRate !== ''
          //   ? parseFloat(selectedOption.minRate)
          //   : parseFloat(this.rateBaseParam.minRate || 0);

          const minRate = parseFloat(this.rateBaseParam.minRate || 0);
          const minRateBp = minRate * 100; // 转换为BP
          const minRequiredBp = minRateBp - lprBp - basePointBp;
          
          // 设置最大Bp值限制
          // const maxRate = parseFloat(this.productRateLimit.maxRate || 0);
          // const maxRateBp = maxRate * 100; // 转换为BP
          // if(maxRateBp > 0 ){
          //   this.productRateLimit.maxBp = maxRateBp - lprBp - basePointBp;
          // }
          // // 设置最小BP值限制，确保为整数
          // if(minRateBp > 0 ){
          //   this.productRateLimit.minBp = Math.round(minRequiredBp);
          // }

          // 设置最小BP值限制，确保为整数
          if (minRequiredBp > 0) {
            this.productRateLimit.minBp = Math.round(minRequiredBp);
            // 显示提示信息
            ElMessage.info(`为满足最低利率要求，BP值不能低于${Math.round(minRequiredBp)}`);
          }
        } else {
          // 其他计算方式：自动计算并禁用输入
          this.productRateLimit.isFixed = true;
          
          let calculatedBp = 0;
          
          // 根据不同计算方式计算BP值
          if (calculateType === '固定利率' || calculateType === '最高利率' || calculateType === '最低利率') {
            // 带有"利率"字样的计算方式
            const pointValueBp = pointValue * 100;
            if (calculateType === '固定利率') {
              // 固定利率的正确计算方式
              calculatedBp = pointValueBp - lprBp - basePointBp;
              // 设置固定利率以便显示
              this.productRateLimit.fixedRate = pointValue;
            } else {
              if (calculateType === '最低利率') {
                // 最高利率和最低利率的计算方式
                if (pointValueBp > (lprBp + basePointBp)) {
                  calculatedBp = pointValueBp - (lprBp + basePointBp);
                } else {
                  calculatedBp = 0;
                }
              }else{
                // 最高利率和最低利率的计算方式
                if (pointValueBp < (lprBp + basePointBp)) {
                  calculatedBp = pointValueBp - (lprBp + basePointBp);
                } else {
                  calculatedBp = 0;
                }
              }
              
            }
          } else if (calculateType === '固定加点') {
            // 固定加点
            calculatedBp = pointValue - basePointBp;
          } else if (calculateType === '最低加点') {
            // 最低加点
            if (pointValue > basePointBp) {
              calculatedBp = pointValue - basePointBp;
            } else {
              calculatedBp = 0;
            }
          } else if (calculateType === '最高加点') {
            // 最高加点
            if (pointValue < basePointBp) {
              calculatedBp = pointValue - basePointBp;
            } else {
              calculatedBp = 0;
            }
          } else if (calculateType === '加减点值') {
            // 加减点值
            calculatedBp = pointValue;
            
            // 获取基础定价最终结果和最低利率
            const minRate = parseFloat(this.rateBaseParam.minRate || 0);
            const minRateBp = minRate * 100; // 转换为BP
            
            // 计算BP下限：确保BP值+基础定价结果不低于最低利率
            // 最低BP = 最低利率BP值 - LPR值BP - 基础定价结果
            const minRequiredBp = minRateBp - lprBp - basePointBp;
            
            // 如果计算出的BP值小于最低要求，调整为最低要求
            if (calculatedBp < minRequiredBp) {
              calculatedBp = minRequiredBp;
              // 显示提示信息
              ElMessage.info(`为满足最低利率要求，BP值已调整为${Math.round(minRequiredBp)}`);
            }
          }
          
          // 设置计算的BP值
          this.rateForm.productRateBp = Math.round(calculatedBp);
        }
      }
    },
    
    /** 自动更新产品政策定价BP值 */
    autoUpdateProductRateBp() {
      // 如果没有选择产品，不进行计算
      if (!this.rateForm.productRate) return;
      
      // 计算存贷因素BP总计
      const depositFactorsBpTotal = this.calculateDepositFactorsBpTotal();
      
      // 根据产品信息计算BP值
      if (this.productRateLimit.fixedRate !== null && this.productRateLimit.fixedRate !== undefined) {
        // 情况1: 有固定利率
        this.productRateLimit.isFixed = true;
        // 根据规则: 固定利率 - LPR值 - 存贷因素BP总计
        const lprValue = parseFloat(this.rateBaseParam.lprValue || 0);
        const fixedRateBp = this.productRateLimit.fixedRate * 100; // 转换为BP
        const finalBp = (fixedRateBp - (lprValue * 100) - depositFactorsBpTotal);
        
        this.rateForm.productRateBp = Math.round(finalBp);
      } 
      else if (this.productRateLimit.fixedPoint !== null && this.productRateLimit.fixedPoint !== undefined) {
        // 情况2: 有固定加点
        this.productRateLimit.isFixed = true;
        // 根据规则: 固定加点 - 存贷因素BP总计
        const finalBp = (this.productRateLimit.fixedPoint - depositFactorsBpTotal);
        
        this.rateForm.productRateBp = Math.round(finalBp);
      }
      else if (this.productRateLimit.addSubPoint !== null && this.productRateLimit.addSubPoint !== undefined) {
        // 情况3: 有加点值
        this.productRateLimit.isFixed = true;
        
        this.rateForm.productRateBp = this.productRateLimit.addSubPoint;
      }
    },
    
    /** 计算存贷因素BP总计 */
    calculateDepositFactorsBpTotal() {
      // 获取基础加点BP值
      const basePointBp = parseFloat(this.rateBaseParam.basePoint) || 0;
      
      // 贷款信息相关BP字段
      const loanBpFields = [
        'loanTermBp', 'quotaBp', 'guaranteeTypeBp', 'borrowerTypeBp', 
        'fundingMethodBp', 'creditNumBp', 'intermediateServicesBp',
        'landTypeBp', 'purposeBp', 'regionBp', 'creditFactorsBp',
        'repaymentMethodBp', 'interestFactorsBp', 'firstLoanFactorsBp',
        'ageBp', 'industryPropertyBp', 'loyaltyDegreeBp', 'wealthBusinessBp',
        'specialBusinessBp', 'enterpriseScaleBp', 'enterpriseRepresentativeBusinessBp'
      ];
      
      // 累加贷款信息BP字段值
      let loanBpTotal = loanBpFields.reduce((sum, field) => {
        const hasSelection = this.rateForm[field.replace('Bp', '')] && 
          ((typeof this.rateForm[field.replace('Bp', '')] === 'string' && this.rateForm[field.replace('Bp', '')] !== '') || 
           (Array.isArray(this.rateForm[field.replace('Bp', '')]) && this.rateForm[field.replace('Bp', '')].length > 0));
        
        if (hasSelection) {
          return sum + (parseFloat(this.rateForm[field]) || 0);
        }
        return sum;
      }, 0);
      
      // 存款信息BP值（存贷比例BP值）
      const depositRatioBp = parseFloat(this.rateForm.depositRatioBp) || 0;
      
      // 计算存贷因素BP总计: 基础加点BP值 - 贷款信息BP值 - 存款信息BP值
      let total = basePointBp + loanBpTotal + depositRatioBp;
      
      return total;
    },
    
    /** 验证产品BP值 */
    validateProductBp(value) {
      if (!value) return true;
      
      // 转换为数字并四舍五入为整数
      let bpValue = parseFloat(value);
      bpValue = Math.round(bpValue);
      
      // 如果有固定值，不需要验证
      if (this.productRateLimit.isFixed) return true;
      
      // 检查是否在限制范围内
      if (this.productRateLimit.minBp !== null && bpValue < this.productRateLimit.minBp) {
        ElMessage.warning(`由于最低利率限制，BP值不能小于${Math.round(this.productRateLimit.minBp)}`);
        this.rateForm.productRateBp = Math.round(this.productRateLimit.minBp);
        return false;
      }
      
      if (this.productRateLimit.maxBp !== null && bpValue > this.productRateLimit.maxBp) {
        ElMessage.warning(`由于最高利率限制，BP值不能大于${Math.round(this.productRateLimit.maxBp)}`);
        this.rateForm.productRateBp = Math.round(this.productRateLimit.maxBp);
        return false;
      }
      
      // 更新为四舍五入后的值
      this.rateForm.productRateBp = bpValue;
      
      return true;
    },
    
    /** 计算最终利率 */
    calculateFinalRate() {
      // 获取总BP值
      const totalBp = this.calculateTotalBp();
      // 将BP值转换为利率百分比：100BP = 1%
      const bpRate = totalBp / 100;
      
      // 基础LPR利率
      const lprValue = parseFloat(this.rateBaseParam.lprValue || 0);
      
      // 计算最终利率 = LPR + BP加点
      let finalRate = (lprValue + bpRate).toFixed(2);
      
      // 获取最低利率限制
      const minRate = parseFloat(this.rateBaseParam.minRate || 0);
      
      // 检查是否低于最低利率限制
      // 使用接口返回的calculateType判断是否跳过最低利率限制
      const selectedOption = this.productOptions.find(item => item.value === this.rateForm.productRate);
      let isSpecialProduct = selectedOption && (
        selectedOption.calculateType === '人工定价' ||
        selectedOption.calculateType === '固定利率' ||
        selectedOption.calculateType === '最低利率' ||
        selectedOption.calculateType === '最高利率' ||
        selectedOption.calculateType === '固定加点' ||
        selectedOption.calculateType === '最高加点' ||
        selectedOption.calculateType === '最低加点'
      );

      //总行权限可以突破基础最低利率限制，但是要限制在行权限最低利率上
      if(this.rateForm.bankPowerRate && this.rateForm.bankPowerRate.indexOf("总行") > -1){
        isSpecialProduct = true;
      }
      
      if (!isSpecialProduct && parseFloat(finalRate) < minRate) {
        finalRate = minRate.toFixed(2);
      }
      
      return finalRate;
    },
    
    /** 处理担保方式变更 */
    handleGuaranteeTypeChange(value) {
      // 清空BP值
      if (!value) {
        this.rateForm.guaranteeTypeBp = 0;
        this.rateForm.guaranteeTypeBpLimited = false;
      }
      
      // 清空贷款期限
      this.rateForm.loanTerm = '';
      this.rateForm.loanTermBp = 0;
      
      // 清空LPR相关参数
      this.rateBaseParam = {
        lprValue: 0,
        minRate: 0,
        basePoint: 0
      };
      this.rateForm.basePointBp = 0;
      
      // 清空抵押相关字段
      if (value !== '抵押') {
        // 清空土地性质
        this.rateForm.landType = '';
        this.rateForm.landTypeBp = 0;
        
        // 清空抵押物属性
        this.rateForm.purpose = '';
        this.rateForm.purposeBp = 0;
        
        // 清空抵押物属地
        this.rateForm.region = '';
        this.rateForm.regionBp = 0;
        
        // 清空额度定价
        this.rateForm.quota = '';
        this.rateForm.quotaBp = 0;
      } else {
        // 如果选择了抵押方式，计算额度定价
        this.calculateQuotaRating();
      }
      
      // 清空产品定价相关字段，避免旧产品保留
      this.rateForm.productRate = '';
      this.rateForm.productRateBp = '';
      // 重置参与分成为默认值"是"
      this.rateForm.isShare = 1;
      this.productOptions = [];
      
      // 更新提交数据中的担保方式
      this.submitData.guaranteeType = value;
      
      // 根据新的担保方式获取产品列表
      this.fetchProductOptions();
      
      // 如果选择了抵押方式，尝试加载抵押相关选项
      if (value === '抵押') {
        this.loadMortgageRelatedOptions();
      }
      
      // 重新计算BP值和存贷比例
      this.calculateDepositRatio();
      
      // 移除这里的调用，将在担保方式和贷款期限都选择后调用
      // this.fetchBankPowerInfo();
    },
    
    /** 获取行权限定价信息（加锁防止重复请求） */
    // async fetchBankPowerInfo() {
    //   if (this.isFetchingBankPowerInfo) return;
      
    //   // 确保担保方式和贷款期限都已选择
    //   if (!this.rateForm.guaranteeType || !this.rateForm.loanTerm) {
    //     console.log('担保方式或贷款期限未选择，不获取行权限定价信息');
    //     return;
    //   }
      
    //   this.isFetchingBankPowerInfo = true;
    //   try {
    //     const pledgeType = this.rateForm.guaranteeType || '';
    //     if (!pledgeType) {
    //       this.bankPowerInfoList = [];
    //       this.currentBankPowerInfo = null;
    //       return;
    //     }
    //     const response = await getRateBankPowerInfo(pledgeType);
    //     if (response.code === 200 && response.data) {
    //       this.bankPowerInfoList = response.data || [];
    //       if (this.bankPowerType === '总行') {
    //         this.currentBankPowerInfo = this.bankPowerInfoList.find(item => item.paramName === '总行权限') || null;
    //         if (this.currentBankPowerInfo && this.currentBankPowerInfo.bpPoint !== null && this.currentBankPowerInfo.bpPoint !== undefined) {
    //           this.rateForm.headRateBp = this.currentBankPowerInfo.bpPoint;
    //         }
    //       } else {
    //         this.currentBankPowerInfo = null;
    //       }
    //     } else {
    //       this.bankPowerInfoList = [];
    //       this.currentBankPowerInfo = null;
    //     }
    //   } catch (error) {
    //     console.error('获取行权限定价信息失败', error);
    //     this.bankPowerInfoList = [];
    //     this.currentBankPowerInfo = null;
    //   } finally {
    //     this.isFetchingBankPowerInfo = false;
    //   }
    // },
    
    /** 处理支行权限选择变化 */
    handleBranchInfoChange(branchInfo) {
      this.currentBankPowerInfo = branchInfo;
    },

    /** 加载抵押相关的选项数据 */
    loadMortgageRelatedOptions() {
      
      // 加载土地性质选项
      if (this.landTypeOptions.length === 0) {
        this.loadOptionsForField('landType');
      }
      
      // 加载抵押物属性选项
      if (this.purposeOptions.length === 0) {
        this.loadOptionsForField('purpose');
      }
      
      // 加载抵押物属地选项
      if (this.regionOptions.length === 0) {
        this.loadOptionsForField('region');
      }
    },

    /** 加载特定字段的选项 */
    loadOptionsForField(field) {
      // 查找字段对应的参数ID
      const paramId = field === 'landType' ? 'landType' : 
                     field === 'purpose' ? 'purpose' : 
                     field === 'region' ? 'region' : null;
                     
      if (!paramId) return;
      
      const effectDate = this.submitData.priceDate;
      const customerType = this.submitData.customerType;
      
      // 调用getRateParamDictList获取选项
      getRateParamDictList(paramId, effectDate, customerType)
        .then(response => {
          if (response.code === 200 && response.data) {
            const optionsField = field + 'Options';
            this[optionsField] = response.data.map(item => ({
              value: item.paramName || '', // 使用paramName作为value而不是dictValue
              label: item.paramName || item.dictLabel || '',
              bpValue: item.bpValue || 0
            }));
          }
        })
        .catch(error => {
          console.error(`加载${field}选项失败:`, error);
        });
    },
    
    /** 处理贷款期限变更 */
    handleLoanTermChange(value) {
      if (!value) {
        // 清空贷款期限时，重置BP值和利率参数
        this.rateForm.loanTermBp = 0;
        this.rateBaseParam = {
          lprValue: 0,
          minRate: 0,
          basePoint: 0
        };
        this.rateForm.basePointBp = 0;
      } else {
        // 获取并传递贷款期限值和担保方式
        // this.getRateParamByTerm('loanTerm', value, 0);
        
        // 如果担保方式已经选择，刷新产品列表以包含行权限信息
        if (this.rateForm.guaranteeType) {
          this.fetchProductOptions();
        }
      }
    },
    
    /** 更新基础定价加点值 */
    updateBasePointValue(value) {
      this.basePointValue = parseFloat(value);
      
      // 如果有产品选项，根据最低利率要求过滤产品选项
      if (this.originalProductOptions && this.originalProductOptions.length > 0 && this.rateForm.guaranteeType) {
        this.filterProductOptionsByBasePoint();
      }
      
      // 强制更新视图
      this.$forceUpdate();
    },

    /** 计算前6月代发余额BP值 */
    calculateEnterpriseRepresentativeBusinessBp() {
      const value = parseFloat(this.rateForm.enterpriseRepresentativeBusiness) || 0;
      let bpValue = 0;
      
      if (value > 0) {
        // 根据公式：代发工资额/10 * lprValue
        // 这里使用-5作为lprValue，与存贷比例计算保持一致
        let lprValue = -5;

         // 等待参数加载完成后再使用
        if (this.paramOptions && this.paramOptions['enterprise_representative_business'] && this.paramOptions['enterprise_representative_business'].length > 0) {
          lprValue = this.paramOptions['enterprise_representative_business'][0].bpValue;
          console.log('使用参数配置的代发业务BP值:', lprValue);
        } else {
          console.log('参数未加载完成，使用默认代发业务BP值:', lprValue);
        }

        bpValue = Math.floor(value / 10) * lprValue;
        
        // 获取BP值限制
        let minBp = -500; // 默认最小值
        let maxBp = 0;    // 默认最大值
        
        // 尝试从paramBpLimits获取限制值
        if (this.paramBpLimits && this.paramBpLimits['enterprise_representative_business']) {
          if (this.paramBpLimits['enterprise_representative_business'].minBp !== undefined) {
            minBp = this.paramBpLimits['enterprise_representative_business'].minBp;
          }
          if (this.paramBpLimits['enterprise_representative_business'].maxBp !== undefined) {
            maxBp = this.paramBpLimits['enterprise_representative_business'].maxBp;
          }
        }
        
        // 应用BP值限制
        if (bpValue < minBp) {
          bpValue = minBp;
          this.rateForm.enterpriseRepresentativeBusinessBpLimited = true;
        } else if (bpValue > maxBp) {
          bpValue = maxBp;
          this.rateForm.enterpriseRepresentativeBusinessBpLimited = true;
        } else {
          this.rateForm.enterpriseRepresentativeBusinessBpLimited = false;
        }
      } else {
        this.rateForm.enterpriseRepresentativeBusinessBpLimited = false;
      }
      
      // 设置BP值
      this.rateForm.enterpriseRepresentativeBusinessBp = bpValue;
      
      // 更新产品政策定价BP值
      this.autoUpdateProductRateBp();
    },
    
    /** 处理多选框值的变更，重新计算BP总值 */
    handleMultiSelectChange(field, values) {
      const options = this[field + 'Options']; // e.g., this.industryPropertyOptions
      if (!options || !values) {
        this.rateForm[field + 'Bp'] = 0;
        this.rateForm[field + 'BpLimited'] = false;
        return;
      }

      // 1. 根据当前选中的所有值，重新计算BP总和
      let totalBp = values.reduce((sum, value) => {
        const option = options.find(opt => opt.value === value);
        return sum + (option ? (Number(option.bpValue) || 0) : 0);
      }, 0);

      // 2. 应用BP值限制
      const limitedBp = this.limitBpValue(field, totalBp);
      this.rateForm[field + 'Bp'] = limitedBp;

      // 3. 设置UI限制状态
      this.rateForm[field + 'BpLimited'] = totalBp !== limitedBp;
    },
    
    /** 处理行权限选择变更 */
    handleBankPowerChange(value) {
      // 重置BP值限制
      this.bankPowerRateLimit = {
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      };
      
      // 重置BP值
      this.rateForm.bankPowerRateBp = '';
      
      if (!value) return;
      
      // 查找选中的选项
      const selectedOption = this.productOptions.find(item => item.value === value && item.type === 'bankPower');
      if (!selectedOption) return;
      
      // 行权限选项
      const bpPoint = parseFloat(selectedOption.bpPoint || 0);
      
      if (selectedOption.label.includes('总行')) {
        // 总行权限允许手动输入
        this.bankPowerRateLimit.isFixed = false;
        // 设置初始值，但允许用户修改
        this.rateForm.bankPowerRateBp = Math.round(bpPoint);
      } else {
        // 支行权限也允许手动输入，但有限制条件
        this.bankPowerRateLimit.isFixed = false;
        
        // 设置最小值限制 - 不能小于支行权限本身设置的BP值
        this.bankPowerRateLimit.minBp = bpPoint;
        
        // 获取基础定价最终结果和最低利率
        const basePointTotal = parseFloat(this.basePointValue) || 0;
        
        // 优先使用选项自身的minRate，如果没有则使用系统默认的最低利率
        const minRate = (selectedOption.minRate !== null && selectedOption.minRate !== undefined) 
          ? parseFloat(selectedOption.minRate) 
          : parseFloat(this.rateBaseParam.minRate || 0);
          
        const minRateBp = minRate * 100; // 转换为BP
        const lprValue = parseFloat(this.rateBaseParam.lprValue || 0);
        const lprBp = lprValue * 100; // 转换为BP
        
        // 产品政策定价BP值
        const productBp = parseFloat(this.rateForm.productRateBp || 0);
        
        // 计算BP下限：确保BP值+基础定价结果+产品BP值不低于最低利率
        // 最低BP = 最低利率BP值 - LPR值BP - 基础定价结果 - 产品BP值
        const minRequiredBp = minRateBp - lprBp - basePointTotal - productBp;
        
        // 综合两个条件，取较大的值作为最小BP值
        const effectiveMinBp = Math.max(bpPoint, minRequiredBp);
        
        // 更新最小BP值限制，确保为整数
        this.bankPowerRateLimit.minBp = Math.round(effectiveMinBp);
        
        // 设置初始BP值为计算出的最小值，确保为整数
        this.rateForm.bankPowerRateBp = Math.round(effectiveMinBp);
        
        // 清除最大值限制（如果有的话）
        this.bankPowerRateLimit.maxBp = null;
        
        // 显示提示信息
        if (effectiveMinBp > bpPoint) {
          ElMessage.warning(`为满足最低利率要求，最小BP值已调整为${Math.round(effectiveMinBp)}`);
        } else {
          ElMessage.warning(`BP值不能低于${Math.round(bpPoint)}`);
        }
      }
    },
    
    /** 验证行权限BP值 */
    validateBankPowerBp(value) {
      if (!value) return true;
      
      // 转换为数字并四舍五入为整数
      let bpValue = parseFloat(value);
      bpValue = Math.round(bpValue);
      
      // 如果有固定值，不需要验证
      if (this.bankPowerRateLimit.isFixed) return true;
      
      // 检查是否在限制范围内
      if (this.bankPowerRateLimit.minBp !== null && bpValue < this.bankPowerRateLimit.minBp) {
        ElMessage.warning(`BP值不能小于${Math.round(this.bankPowerRateLimit.minBp)}`);
        this.rateForm.bankPowerRateBp = Math.round(this.bankPowerRateLimit.minBp);
        return false;
      }
      
      if (this.bankPowerRateLimit.maxBp !== null && bpValue > this.bankPowerRateLimit.maxBp) {
        ElMessage.warning(`BP值不能大于${Math.round(this.bankPowerRateLimit.maxBp)}`);
        this.rateForm.bankPowerRateBp = Math.round(this.bankPowerRateLimit.maxBp);
        return false;
      }
      
      // 更新为四舍五入后的值
      this.rateForm.bankPowerRateBp = bpValue;
      
      return true;
    },
  },
  computed: {
    /** 检查贷款信息是否完整 */
    isLoanInfoComplete() {
      // 检查必填字段
      const requiredFields = [
        'loanTerm',      // 贷款期限
        'applyAmount',   // 申请金额
        'guaranteeType', // 担保方式
        'fundingMethod', // 用款方式
        'creditNum',     // 融资家数
        // 'intermediateServices', // 中间业务 - 移除中间业务必填项
        'creditFactors',  // 征信因素
        'firstLoanFactors', // 首贷因素
        'repaymentMethod',  // 还息因素
        'interestFactors',   // 首贷因素
        'industryProperty', // 行业属性
        'specialBusiness'  // 特殊荣誉
      ];
      
      // 如果担保方式是抵押，添加抵押相关字段
      if (this.rateForm.guaranteeType === '抵押') {
        requiredFields.push('landType'); // 土地性质
        requiredFields.push('purpose');  // 抵押物属性
        requiredFields.push('region');   // 抵押物属地
      }

      // 如果是对公客户，添加企业相关字段
      if (this.submitData.customerType === '对公') {
        requiredFields.push('enterpriseScale'); // 企业规模
        requiredFields.push('enterpriseRepresentativeBusiness'); // 前6月代发余额
      }

      // 如果是个人客户且年龄选项存在，添加年龄字段验证
      if (this.submitData.customerType === '个人' && this.ageOptions && this.ageOptions.length > 0) {
        requiredFields.push('age');
      }
      
      // 检查所有必填字段是否都已填写，且字段在页面上显示
      return requiredFields.every(field => {
        // 首先检查字段是否应该显示
        if (!this.shouldShowField(field)) {
          return true; // 如果字段不显示，则跳过验证
        }

        const value = this.rateForm[field];
        // 对于数组类型的字段，检查是否有选择
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        // 对于数字类型字段，检查是否为有效数字
        if (['applyAmount', 'enterpriseRepresentativeBusiness'].includes(field)) {
          const numValue = parseFloat(value);
          return !isNaN(numValue) && numValue >= 0;
        }
        // 对于字符串类型的字段，检查是否为空
        return value !== '' && value !== null && value !== undefined;
      });
    },
  },
  beforeUnmount() {
    // 清理所有手动watch
    this.unwatchList.forEach(unwatch => unwatch && unwatch());
    // 清理定时器/事件
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener && window.removeEventListener('resize', this.handleResize);
  },
  deactivated() {
    // keep-alive失活时清理定时器等副作用
    if (this.timer) clearInterval(this.timer);
  }
}
</script>

