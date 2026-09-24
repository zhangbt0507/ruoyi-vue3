<template>
  <div>
    <el-divider content-position="left">定价信息</el-divider>
    <el-card class="pricing-card" v-if="isLoanInfoComplete">
      <!-- 产品政策定价 -->
      <div class="pricing-section">
        <h3 class="pricing-section-title">产品政策定价</h3>
        <el-form :model="rateForm" label-width="120px" ref="formRef" :rules="rules">
          <el-form-item label="产品定价">
            <div class="pricing-input-group">
              <el-select 
                v-model="rateForm.productRate" 
                placeholder="请选择产品定价" 
                style="width: 80%"
                popper-class="pricing-product-dropdown"
                @change="handleProductChange"
                filterable
                clearable
              >
                <el-option 
                  v-for="option in filteredProductOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
              </el-select>
              <el-form-item prop="productRateBp" class="bp-form-item" :style="{ marginBottom: 0 }">
                <span class="bp-label">BP值:</span>
                <el-input 
                  v-model="rateForm.productRateBp" 
                  :value="rateForm.productRateBp"
                  @input="handleBpInput"
                  @blur="handleBpBlur"
                  @keypress="event => validateNumberKeypress(event, { allowNegative: true, allowDecimal: false })"
                  placeholder="BP值" 
                  class="bp-input"
                  :disabled="productRateLimit.isFixed || !rateForm.productRate"
                />
                <el-tooltip v-if="!productRateLimit.isFixed && productRateLimit.minBp !== null && productRateLimit.maxBp !== null" placement="top" :content="`BP值范围: ${productRateLimit.minBp} ~ ${productRateLimit.maxBp}`">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </el-form-item>
            </div>
          </el-form-item>
          
          <!-- 行权限选择 -->
          <el-form-item label="行权限">
            <div class="pricing-input-group">
              <el-select 
                v-model="rateForm.bankPowerRate" 
                placeholder="请选择行权限" 
                style="width: 80%"
                @change="handleBankPowerChange"
                popper-class="pricing-product-dropdown"
                filterable
                clearable
                :disabled="!canSelectBankPower"
              >
                <el-option 
                  v-for="option in filteredBankPowerOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
              </el-select>
              <el-form-item prop="bankPowerRateBp" class="bp-form-item" :style="{ marginBottom: 0 }">
                <span class="bp-label">BP值:</span>
                <el-input 
                  v-model="rateForm.bankPowerRateBp" 
                  :value="rateForm.bankPowerRateBp"
                  @input="handleBankPowerBpInput"
                  @blur="handleBankPowerBpBlur"
                  @keypress="event => validateNumberKeypress(event, { allowNegative: true, allowDecimal: false })"
                  placeholder="BP值" 
                  class="bp-input"
                  :disabled="!rateForm.bankPowerRate"
                />
                <el-tooltip v-if="!bankPowerRateLimit.isFixed && bankPowerRateLimit.minBp !== null && bankPowerRateLimit.maxBp !== null" placement="top" :content="`BP值范围: ${bankPowerRateLimit.minBp} ~ ${bankPowerRateLimit.maxBp}`">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </el-form-item>
            </div>
          </el-form-item>
          
          <!-- 分成状态显示 -->
          <el-form-item label="参与分成">
            <el-tag :type="rateForm.isShare == 1 ? 'success' : 'info'">
              {{ rateForm.isShare == 1 ? '是' : '否' }}
            </el-tag>
          </el-form-item>
          
          <!-- 选择总行权限时显示备注输入框 -->
          <el-form-item
            v-if="rateForm.bankPowerRate && rateForm.bankPowerRate.includes('总行')"
            label="备注原因"
            prop="remarks"
            :rules="rateForm.bankPowerRate && rateForm.bankPowerRate.includes('总行') ? [{ required: true, message: '备注原因不能为空', trigger: 'blur' }] : []"
          >
            <el-input
              v-model="rateForm.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注原因"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 协议定价 -->
      <div class="pricing-section">
        <h3 class="pricing-section-title">协议定价</h3>
        <el-form :model="rateForm" label-width="120px">
          <el-form-item label="BP值">
            <el-input 
              v-model="rateForm.protocolBp" 
              placeholder="请输入协议定价BP值" 
              style="width: 200px"
              @input="validateNumberInput('protocolBp')"
              type="number"
              oninput="this.value = this.value.replace(/^0+|[^0-9]/g, '')"
              :disabled="isBankPowerProduct"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card v-else class="pricing-card">
      <div class="incomplete-info-tip">
        <el-alert
          title="请先完成贷款信息的填写"
          type="warning"
          :closable="false"
          show-icon>
          <template #default>
            <div class="incomplete-fields">
              <p>请确保以下信息已填写：</p>
              <div class="fields-grid">
                <div v-if="shouldShowField('loanTerm') && !rateForm.loanTerm" class="field-item">贷款期限</div>
                <div v-if="!rateForm.applyAmount" class="field-item">申请金额</div>
                <div v-if="shouldShowField('guaranteeType') && !rateForm.guaranteeType" class="field-item">担保方式</div>
                <div v-if="shouldShowField('fundingMethod') && !rateForm.fundingMethod" class="field-item">用款方式</div>
                <div v-if="shouldShowField('creditNum') && !rateForm.creditNum" class="field-item">融资家数</div>
                <div v-if="shouldShowField('interestFactors') && !rateForm.interestFactors" class="field-item">还息因素</div>
                <div v-if="shouldShowField('creditFactors') && !rateForm.creditFactors" class="field-item">征信因素</div>
                <div v-if="shouldShowField('firstLoanFactors') && !rateForm.firstLoanFactors" class="field-item">首贷因素</div>
                <div v-if="shouldShowField('industryProperty') && (!rateForm.industryProperty || rateForm.industryProperty.length === 0)" class="field-item">行业属性</div>
                <div v-if="shouldShowField('specialBusiness') && (!rateForm.specialBusiness || rateForm.specialBusiness.length === 0)" class="field-item">特殊荣誉</div>
                <div v-if="shouldShowField('landType') && rateForm.guaranteeType === '抵押' && !rateForm.landType" class="field-item">土地性质</div>
                <div v-if="shouldShowField('purpose') && rateForm.guaranteeType === '抵押' && !rateForm.purpose" class="field-item">抵押物属性</div>
                <div v-if="shouldShowField('region') && rateForm.guaranteeType === '抵押' && !rateForm.region" class="field-item">抵押物属地</div>
                <div v-if="shouldShowField('enterpriseScale') && submitData.customerType === '对公' && !rateForm.enterpriseScale" class="field-item">借款人类型</div>
                <div v-if="shouldShowField('enterpriseRepresentativeBusiness') && submitData.customerType === '对公' && rateForm.enterpriseRepresentativeBusiness !== 0" class="field-item">前6月代发余额</div>
                <div v-if="shouldShowField('age') && submitData.customerType === '个人' && !rateForm.age" class="field-item">年龄</div>
                <div v-if="shouldShowField('wealthBusiness') && (!rateForm.wealthBusiness || rateForm.wealthBusiness.length === 0)" class="field-item">财富业务</div>
              </div>
            </div>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script>
import { QuestionFilled, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'PricingInfo',
  components: {
    QuestionFilled,
    Lock
  },
  props: {
    rateForm: {
      type: Object,
      required: true
    },
    submitData: {
      type: Object,
      required: true
    },
    shouldShowField: {
      type: Function,
      required: true
    },
    isLoanInfoComplete: {
      type: Boolean,
      required: true
    },
    productOptions: {
      type: Array,
      default: () => []
    },
    productRateLimit: {
      type: Object,
      default: () => ({
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      })
    },
    bankPowerRateLimit: {
      type: Object,
      default: () => ({
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      })
    },
    bankPowerType: {
      type: String,
      default: ''
    },
    bankPowerInfoList: {
      type: Array,
      default: () => []
    },
    currentBankPowerInfo: {
      type: Object,
      default: null
    },
    finalBasePointValue: {
      type: [Number, String],
      required: true
    }
  },
  emits: ['product-change', 'validate-product-bp', 'validate-number', 'bank-power-change', 'branch-info-change', 'validate-bank-power-bp'],
  data() {
    return {
      selectedBranchInfo: null,
      rules: {
        productRateBp: [
          { 
            required: true, 
            message: 'BP值不能为空', 
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.rateForm.productRate && (value === '' || value === null || value === undefined) && !this.productRateLimit.isFixed) {
                callback(new Error('BP值不能为空'));
              } else {
                callback();
              }
            }
          }
        ],
        bankPowerRateBp: [
          { 
            required: true, 
            message: 'BP值不能为空', 
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.rateForm.bankPowerRate && (value === '' || value === null || value === undefined) && !this.bankPowerRateLimit.isFixed) {
                callback(new Error('BP值不能为空'));
              } else {
                callback();
              }
            }
          }
        ]
      }
    };
  },
  computed: {
    // 头行信息 - 从数组中找到名称为"总行权限"的项
    headOfficeInfo() {
      return this.bankPowerInfoList.find(item => item.paramName === '总行权限') || null;
    },
    // 支行信息列表 - 过滤掉总行权限的项
    branchInfoList() {
      return this.bankPowerInfoList.filter(item => item.paramName !== '总行权限');
    },
    // 判断当前选择的是否为行权限类型的产品
    isBankPowerProduct() {
      if (!this.rateForm.bankPowerRate) return false;
      if(this.rateForm.bankPowerRate.indexOf('总行') > -1){
        this.rateForm.protocolBp = '';
      }
      return this.rateForm.bankPowerRate.indexOf('总行') > -1;
    },
    // 获取当前选中的产品选项
    selectedProduct() {
      if (!this.rateForm.productRate) return null;
      return this.filteredProductOptions.find(option => option.value === this.rateForm.productRate);
    },
    // 获取当前选中的行权限选项
    selectedBankPower() {
      if (!this.rateForm.bankPowerRate) return null;
      return this.filteredBankPowerOptions.find(option => option.value === this.rateForm.bankPowerRate);
    },
    // 过滤出普通产品选项
    filteredProductOptions() {
      return this.productOptions.filter(option => option.type !== 'bankPower');
    },
    // 过滤出行权限选项
    filteredBankPowerOptions() {
      return this.productOptions.filter(option => option.type === 'bankPower');
    },
    canSelectBankPower() {
      const selectedProduct = this.productOptions.find(
        option => option.value === this.rateForm.productRate && option.type !== 'bankPower'
      );
      return !selectedProduct || (selectedProduct && selectedProduct.calculateType === '加减点值');
    }
  },
  watch: {
    // 当行权限信息列表变化时，重置选中的支行信息
    bankPowerInfoList() {
      this.selectedBranchInfo = null;
    },
    // 当行权限类型变化时，重置选中的支行信息
    bankPowerType() {
      this.selectedBranchInfo = null;
    },
    // 监听基础定价结果变化，清空产品定价选项和BP值
    finalBasePointValue(newVal, oldVal) {
      if (this.rateForm && 'productRate' in this.rateForm) {
        this.rateForm.productRate = '';
        this.rateForm.bankPowerRate = '';
        this.rateForm.remarks = '';
        // 重置参与分成为默认值"是"
        this.rateForm.isShare = 1;
      }
      if (this.rateForm && 'productRateBp' in this.rateForm) {
        this.rateForm.productRateBp = '';
        this.rateForm.bankPowerRateBp = '';
        this.rateForm.remarks = '';
      }
    }
  },
  setup(props, { emit }) {
    const handleProductChange = (value) => {
      // 找到当前选择的产品选项
      const selectedProduct = props.productOptions.find(option => option.value === value && option.type !== 'bankPower');
      
      // 如果选择了产品，清空行权限选择
      if (value) {
        props.rateForm.bankPowerRate = '';
        props.rateForm.bankPowerRateBp = '';
      }
      
      // 如果没有选择产品（清空或空值），设置默认值
      if (!value || value === '') {
        props.rateForm.isShare = 1; // 没有选择产品时，默认为"是"
      } else {
        // 有选择产品时，根据产品配置设置
        if (selectedProduct && typeof selectedProduct.isShare !== 'undefined') {
          props.rateForm.isShare = Number(selectedProduct.isShare);
        } else {
          props.rateForm.isShare = 1; // 没有isShare字段时，默认为1
        }
      }
      // 新增：如果不能选择行权限，清空行权限相关字段
      const canSelectBankPower = selectedProduct && selectedProduct.calculateType === '加减点值';
      if (!canSelectBankPower) {
        props.rateForm.bankPowerRate = '';
        props.rateForm.bankPowerRateBp = '';
      }
      
      emit('product-change', value);
    };
    
    const validateProductBp = (value) => {
      emit('validate-product-bp', value);
    };
    
    const validateNumberInput = (field) => {
      emit('validate-number', field);
    };
    
    const handleBankPowerChange = (value) => {
      // 找到当前选择的行权限选项
      const selectedBankPower = props.productOptions.find(option => 
        option.value === value && option.type === 'bankPower'
      );

      if (value) {
        // 有选择行权限时，根据配置设置
        if (selectedBankPower && typeof selectedBankPower.isShare !== 'undefined') {
          props.rateForm.isShare = Number(selectedBankPower.isShare);
        } else {
          props.rateForm.isShare = 0; // 行权限默认不参与分成
        }
      } else {
        // 没有选择行权限时，回退到产品选项的isShare
        const selectedProduct = props.productOptions.find(option => 
          option.value === props.rateForm.productRate && option.type !== 'bankPower'
        );
        if (selectedProduct && typeof selectedProduct.isShare !== 'undefined') {
          props.rateForm.isShare = Number(selectedProduct.isShare);
        } else {
          props.rateForm.isShare = 1; // 没有isShare字段时，默认为1
        }
      }

      emit('bank-power-change', value);
    };
    
    const handleBpInput = (val) => {
      // 空实现或可以添加实际逻辑
    };
    
    const handleBpBlur = () => {
      validateProductBp(props.rateForm.productRateBp);
    };
    
    const handleBankPowerBpInput = (val) => {
      // 空实现或可以添加实际逻辑
    };
    
    const handleBankPowerBpBlur = () => {
      emit('validate-bank-power-bp', props.rateForm.bankPowerRateBp);
    };
    
    const validateNumberKeypress = (event, options = {}) => {
      const { allowNegative = true, allowDecimal = false } = options;
      const keyCode = event.keyCode ? event.keyCode : event.which;
      // 允许数字
      const isNumber = keyCode >= 48 && keyCode <= 57;
      // 允许负号
      const isDash = keyCode === 45 && allowNegative;
      // 不允许小数点
      const isDot = keyCode === 46 && allowDecimal;

      if (!isNumber && !isDash && !isDot) {
        event.preventDefault();
        return false;
      }

      const value = event.target.value;
      // 负号只能在开头且只能有一个
      if (isDash && (value.includes('-') || event.target.selectionStart !== 0)) {
        event.preventDefault();
        return false;
      }

      // 不允许小数点
      if (isDot) {
        event.preventDefault();
        return false;
      }

      return true;
    };
    
    return {
      handleProductChange,
      validateProductBp,
      validateNumberInput,
      handleBankPowerChange,
      handleBpInput,
      handleBpBlur,
      handleBankPowerBpInput,
      handleBankPowerBpBlur,
      validateNumberKeypress
    };
  },
  methods: {
    validate() {
      // 如果选择了产品定价但没有输入BP值，则校验不通过
      if (this.rateForm.productRate && (this.rateForm.productRateBp === null || 
              this.rateForm.productRateBp === undefined || this.rateForm.productRateBp === '') && !this.productRateLimit.isFixed) {
        ElMessage.error('产品定价已选择，BP值不能为空');
        return Promise.reject({ productRateBp: [{ message: 'BP值不能为空' }] });
      }
      
      // 如果选择了行权限但没有输入BP值，则校验不通过
      if (this.rateForm.bankPowerRate && (this.rateForm.bankPowerRateBp === null || 
              this.rateForm.bankPowerRateBp === undefined || this.rateForm.bankPowerRateBp === '') && !this.bankPowerRateLimit.isFixed) {
        ElMessage.error('行权限已选择，BP值不能为空');
        return Promise.reject({ bankPowerRateBp: [{ message: 'BP值不能为空' }] });
      }
      
      return this.$refs.formRef && this.$refs.formRef.validate ? this.$refs.formRef.validate() : Promise.resolve(true);
    }
  }
}
</script>

<style lang="scss" scoped>
.pricing-card {
  margin-top: 20px;
}

.pricing-input-group {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.bp-form-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  width: 20%;
}

.bp-input-container {
  display: flex;
  align-items: center;
  width: 20%;
  white-space: nowrap;
}

.bp-input {
  width: 120px;
  margin: 0 5px;
}

.bp-label {
  margin-right: 5px;
}

.pricing-section {
  margin-bottom: 20px;
}

.pricing-section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #409EFF;
}

.bank-power-info-inline {
  color: #409EFF;
  font-size: 14px;
}

.no-data-inline {
  color: #909399;
  font-style: italic;
}

.incomplete-info-tip {
  padding: 20px;
  
  .incomplete-fields {
    margin-top: 10px;
    
    p {
      margin-bottom: 10px;
      color: #606266;
    }
    
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px 20px;
    }
    
    .field-item {
      position: relative;
      padding-left: 15px;
      margin-bottom: 8px;
      color: #E6A23C;
      
      &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #E6A23C;
        font-weight: bold;
      }
    }
  }
}

.el-divider {
  margin: 10px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
}
</style> 

<style lang="scss">
/* 全局样式：产品定价下拉列表自动适应宽度 */
.pricing-product-dropdown {
  min-width: 400px !important;
  max-width: 1200px !important;
  width: auto !important;
}

/* 全局样式：行权限下拉列表自动适应宽度 */
.pricing-bankpower-dropdown {
  min-width: 400px !important;
  max-width: 1200px !important;
  width: auto !important;
}
</style>