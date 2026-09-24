<template>
  <el-dialog
    v-model="dialogVisible"
    title="风险金总额计算与分摊"
    width="65%"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="handleClose"
  >
    <div class="risk-fund-dialog">
      <!-- 贷款信息区域 -->
      <div class="loan-info-section">
        <el-form :model="loanInfo" label-width="100px" class="loan-info-form">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="客户名称">
                <el-input v-model="loanInfo.customerName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="合同号">
                <el-input v-model="loanInfo.contractNo" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="贷款总额">
                <el-input v-model="loanInfo.contractAmount" disabled>
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="建档余额">
                <el-input v-model="loanInfo.filingAmount" disabled>
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="借款用途">
                <el-input v-model="loanInfo.loanPurpose" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="担保方式">
                <el-input v-model="loanInfo.guaranteeType" disabled />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6">
              <el-form-item label="产品代码">
                <el-input v-model="loanInfo.productCode" disabled />
              </el-form-item>
            </el-col> -->
            <el-col :span="6">
              <el-form-item label="合同日期">
                <el-input v-model="loanInfo.contractStartDate" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="到期日期">
                <el-input v-model="loanInfo.contractEndDate" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <!-- <el-col :span="6">
              <el-form-item label="产品名称">
                <el-input v-model="loanInfo.productName" disabled />
              </el-form-item>
            </el-col> -->
            <el-col :span="6">
              <el-form-item label="归属机构">
                <el-input v-model="loanInfo.managementInstitution" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="责任人">
                <el-input v-model="loanInfo.managementPerson" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 风险金计算区域 -->
      <div class="calculation-section">
        <el-form :model="calculationForm" :rules="calculationRules" ref="calculationFormRef" label-width="120px">
          <el-row :gutter="20">
            
            <el-col :span="8">
              <el-form-item label="应缴风险金" prop="riskFundPayable">
                <el-input v-model="calculationForm.riskFundPayable" placeholder="请输入应缴风险金">
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="赔偿比例" prop="compensationRatio">
                <el-input v-model="calculationForm.compensationRatio" placeholder="请输入赔偿比例">
                  <template #append>%</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="实际应缴">
                <el-input v-model="actualPayable" disabled>
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
           
            <el-col :span="8">
              <el-form-item label="办法依据" prop="calculationBasis">
                <el-input v-model="calculationForm.calculationBasis" 
                maxlength="200"
                type="textarea"
                  :rows="2"
                  show-word-limit
                  resize="none"
                placeholder="请输入办法依据">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item 
                label="免责原因" 
                prop="exemptionReason"
                :rules="compensationRatioRules"
              >
                <el-input
                  v-model="calculationForm.exemptionReason"
                  type="textarea"
                  :rows="2"
                  show-word-limit
                  maxlength="500"
                  placeholder="责任认定小组会议纪要（如果赔偿比例非100%，则必填）"
                  resize="none"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 风险金分解责任人区域 -->
      <div class="allocation-section">
        <div class="section-header">
          <span class="section-title">风险金分解责任人</span>
          <!-- <div class="total-difference">
            <span>总分差额：</span>
            <el-input 
              v-model="totalDifference" 
              disabled 
              style="width: 150px;"
              class="difference-input"
            />
          </div> -->
        </div>
        <el-table
          :data="responsibilityList"
          border
          style="width: 100%"
          @selection-change="handleTableSelectionChange"
        >
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column label="责任人" prop="responsiblePerson" min-width="120" align="center" />
          <el-table-column label="责任类型" prop="responsibilityType" min-width="150" align="center">
            <template v-slot:default="scope">
              {{ getResponsibilityTypeText(scope.row.responsibilityType) }}
            </template>
          </el-table-column>
          <el-table-column label="责任比" prop="responsibilityRatio" min-width="100" align="center">
            <template v-slot:default="scope">
              {{ scope.row.responsibilityRatio }}%
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="determinationStatus" min-width="100" align="center">
            <template v-slot:default="scope">
              <el-tag :type="getStatusTagType(scope.row.determinationStatus)">
                {{ getStatusText(scope.row.determinationStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="个账余额" prop="individualAccountBalance" min-width="120" align="center">
             <template v-slot:default="scope">
               <el-input
                 v-model="scope.row.individualAccountBalance"
                 placeholder="自动获取"
                 disabled
               />
             </template>
          </el-table-column>
          <el-table-column label="分摊金额" prop="payableRiskFund" min-width="120" align="center">
            <template v-slot:default="scope">
              <el-input
                v-model="scope.row.payableRiskFund"
                placeholder="自动计算"
                :disabled="scope.row.responsibilityType !== '罚金'"
              />
            </template>
          </el-table-column>
          <el-table-column label="责任本金" prop="responsibilityAmount" min-width="120" align="center">
            <template v-slot:default="scope">
              <el-input
                v-model="scope.row.responsibilityAmount"
                placeholder="自动计算"
                disabled
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
        <el-button @click="handleClose">取消</el-button>
        <!-- <el-button type="primary" @click="handleCalculate" :loading="calculating">
          分解计算
        </el-button> -->
        
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getResponsibilityByContractNo, riskCalculate } from '@/api/szhl/badLoanManage/responsibility'
import { getPersonalAccountBalance } from '@/api/szhl/badLoanManage/personalAccount'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: null
  },
  responsibilityList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'calculate', 'save'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 贷款信息
const loanInfo = reactive({
  customerName: '',
  contractNo: '',
  contractAmount: '',
  filingAmount: '',
  loanPurpose: '',
  guaranteeType: '',
  productCode: '',
  contractStartDate: '',
  contractEndDate: '',
  productName: '',
  managementInstitution: '',
  managementPerson: ''
})

// 风险金计算表单
const calculationForm = reactive({
  calculationBasis: '',
  riskFundPayable: '',
  compensationRatio: '100',
  exemptionReason: ''
})

const calculationFormRef = ref(null)

// 计算规则
const calculationRules = {
  calculationBasis: [
    { required: true, message: '请输入办法依据', trigger: 'blur' }
  ],
  riskFundPayable: [
    { required: true, message: '请输入应缴风险金', trigger: 'submit' },
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额', trigger: 'blur' }
  ],
  compensationRatio: [
    { required: true, message: '请输入赔偿比例', trigger: 'submit' },
    { pattern: /^(100|[0-9]\d?)$/, message: '请输入0-100之间的数字', trigger: 'blur' }
  ]
}

// 赔偿比例规则（动态验证）
const compensationRatioRules = computed(() => {
  const ratioVal = parseFloat(calculationForm.compensationRatio)
  const ratio = Number.isNaN(ratioVal) ? 100 : ratioVal
  if (ratio !== 100) {
    return [
      { required: true, message: '赔偿比例非100%时，免责原因必填', trigger: 'blur' }
    ]
  }
  return []
})

// 实际应缴（自动计算）
const actualPayable = computed(() => {
  const payableVal = parseFloat(calculationForm.riskFundPayable)
  const ratioVal = parseFloat(calculationForm.compensationRatio)

  const payable = Number.isNaN(payableVal) ? 0 : payableVal
  // 只有在未填写或非法时才默认 100%，允许 0 作为有效比例
  const ratio = Number.isNaN(ratioVal) ? 100 : ratioVal

  const result = (payable * ratio / 100).toFixed(2)
  return result === 'NaN' ? '' : result
})

// 责任人列表
const responsibilityList = ref([])

// 总分差额
// const totalDifference = ref('0.00')

// 加载状态
const calculating = ref(false)
const saving = ref(false)

// 初始化数据
function initData() {
  if (props.selectedRow) {
    // 填充贷款信息
    loanInfo.customerName = props.selectedRow.customerName || ''
    loanInfo.contractNo = props.selectedRow.contractNo || ''
    loanInfo.contractAmount = formatAmount(props.selectedRow.contractAmount) || ''
    const filingAmountSource = props.selectedRow.filingAmount
    loanInfo.filingAmount = (filingAmountSource === null || filingAmountSource === undefined || filingAmountSource === '')
      ? '0.00'
      : formatAmount(filingAmountSource) || '0.00'
    loanInfo.loanPurpose = props.selectedRow.loanPurpose || ''
    loanInfo.guaranteeType = props.selectedRow.guaranteeType || ''
    loanInfo.productCode = props.selectedRow.productCode || ''
    loanInfo.contractStartDate = props.selectedRow.contractStartDate || ''
    loanInfo.contractEndDate = props.selectedRow.contractEndDate || ''
    loanInfo.productName = props.selectedRow.productName || ''
    loanInfo.managementInstitution = props.selectedRow.managementInstitution || ''
    loanInfo.managementPerson = props.selectedRow.managementPerson || ''

    // 初始化风险金计算表单
    calculationForm.riskFundPayable = props.selectedRow.riskFundPayable || ''
    calculationForm.compensationRatio = '100'
    calculationForm.exemptionReason = ''

    // 加载责任人列表
    loadResponsibilityList()
  }
}

// 加载责任人列表
async function loadResponsibilityList() {
  if (!props.selectedRow?.contractNo) {
    responsibilityList.value = []
    return
  }

  try {
    const response = await getResponsibilityByContractNo(props.selectedRow.contractNo)
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      responsibilityList.value = response.data.map(item => ({
        id: item.id,
        responsiblePerson: item.nickName || item.responsiblePerson,
        employeeNo: item.responsiblePerson,
        responsibilityType: item.responsibilityType,
        responsibilityRatio: item.responsibilityRatio || 0,
        determinationStatus: item.determinationStatus,
        individualAccountBalance: item.individualAccountBalance || '',
        payableRiskFund: item.payableRiskFund || '',
        responsibilityAmount: item.responsibilityAmount || ''
      }))
      await fillIndividualAccountBalances()
      tryAutoCalculateAllocation()
    } else {
      // 如果接口返回空，使用传入的 responsibilityList
      if (props.responsibilityList && props.responsibilityList.length > 0) {
        responsibilityList.value = props.responsibilityList.map(item => ({
          id: item.id,
          responsiblePerson: item.nickName || item.responsiblePerson || item.responsiblePerson,
          employeeNo: item.responsiblePerson || item.employeeNo,
          responsibilityType: item.responsibilityType,
          responsibilityRatio: item.responsibilityRatio || 0,
          determinationStatus: item.determinationStatus,
          individualAccountBalance: item.individualAccountBalance || '',
          payableRiskFund: item.payableRiskFund || '',
          responsibilityAmount: item.responsibilityAmount || ''
        }))
      } else {
        responsibilityList.value = []
      }
      await fillIndividualAccountBalances()
      tryAutoCalculateAllocation()
    }
  } catch (error) {
    console.error('加载责任人列表失败:', error)
    responsibilityList.value = []
    await fillIndividualAccountBalances()
    tryAutoCalculateAllocation()
  }
}

// 根据责任人账号查询个账余额
async function fillIndividualAccountBalances() {
  if (!responsibilityList.value || responsibilityList.value.length === 0) {
    return
  }

  const tasks = responsibilityList.value.map(async (row) => {
    const accountNumber = row.employeeNo || row.responsiblePerson
    if (!accountNumber) {
      row.individualAccountBalance = '0.00'
      return
    }
    try {
      const res = await getPersonalAccountBalance(accountNumber)
      if (res.code === 200 && res.data) {
        const balance = parseFloat(res.data.accountBalance || 0)
        row.individualAccountBalance = Number.isNaN(balance) ? '0.00' : balance.toFixed(2)
      } else {
        row.individualAccountBalance = '0.00'
      }
    } catch (e) {
      // 查询失败时设置为0，不中断整体流程
      row.individualAccountBalance = '0.00'
    }
  })

  await Promise.all(tasks)
}

// 表格选择变化
function handleTableSelectionChange(selection) {
  // 可以在这里处理选择变化
}

// 分解计算
async function handleCalculate() {
  // 验证表单
  if (!calculationFormRef.value) return
  
  try {
    await calculationFormRef.value.validate()
  } catch (error) {
    ElMessage.warning('请完善必填信息')
    return
  }

  if (!actualPayable.value || parseFloat(actualPayable.value) <= 0) {
    ElMessage.warning('请先输入应缴风险金和赔偿比例')
    return
  }

  calculating.value = true

  try {
    // 计算分摊金额
    calculateAllocation()
    
    ElMessage.success('风险金分解计算完成')
    
    // 触发计算事件
    emit('calculate', {
      calculationForm: { ...calculationForm },
      actualPayable: actualPayable.value,
      responsibilityList: responsibilityList.value
    })
  } catch (error) {
    console.error('计算失败:', error)
    ElMessage.error('计算失败，请稍后重试')
  } finally {
    calculating.value = false
  }
}

// 计算分摊金额和责任本金
function calculateAllocation({ silent = false } = {}) {
  const actualPayVal = parseFloat(actualPayable.value)
  const filingAmountVal = parseFloat(loanInfo.filingAmount)

  const actualPay = Number.isNaN(actualPayVal) ? 0 : actualPayVal
  const filingAmount = Number.isNaN(filingAmountVal) ? 0 : filingAmountVal
  const selectedRows = responsibilityList.value.filter(row => row.responsibilityRatio > 0)
  
  if (selectedRows.length === 0) {
    if (!silent) {
      ElMessage.warning('没有可计算的责任人')
    }
    return
  }

  // 按责任比直接计算分摊金额（实际应缴 * 责任比），罚金类型允许手工录入，不自动覆盖
  selectedRows.forEach((row) => {
    if (row.responsibilityType === '罚金') {
      // 罚金类型分摊金额由人工维护，此处仅计算责任本金
      const ratioPenaltyVal = parseFloat(row.responsibilityRatio)
      const ratioPenalty = Number.isNaN(ratioPenaltyVal) ? 0 : ratioPenaltyVal
      const responsibilityAmountPenalty = (filingAmount * ratioPenalty / 100).toFixed(2)
      row.responsibilityAmount = responsibilityAmountPenalty
      return
    }
    const ratioVal = parseFloat(row.responsibilityRatio)
    const ratio = Number.isNaN(ratioVal) ? 0 : ratioVal
    // 分摊金额 = 实际应缴 * 责任比 / 100
    const allocated = (actualPay * ratio / 100).toFixed(2)
    row.payableRiskFund = allocated

    // 责任本金 = 建档余额 * 责任比 / 100
    const responsibilityAmount = (filingAmount * ratio / 100).toFixed(2)
    row.responsibilityAmount = responsibilityAmount
  })
}

function tryAutoCalculateAllocation() {
  if (!props.visible) return
  const actual = parseFloat(actualPayable.value)
  // 仅在实际应缴无法解析为数字时跳过；0 也需要触发以便将分摊金额归零
  if (Number.isNaN(actual)) return
  const hasRatio = responsibilityList.value.some(row => parseFloat(row.responsibilityRatio) > 0)
  if (!hasRatio) return
  // 建档余额可能为空，但不影响分摊金额的计算，责任本金会在建档余额存在时计算
  calculateAllocation({ silent: true })
}

// 保存
async function handleSave() {
  // 验证表单
  if (!calculationFormRef.value) return
  
  try {
    await calculationFormRef.value.validate()
  } catch (error) {
    ElMessage.warning('请完善必填信息')
    return
  }

  if (!actualPayable.value || parseFloat(actualPayable.value) < 0) {
    ElMessage.warning('请先进行分解计算')
    return
  }
  // 检查分摊金额：所有有责任比的行必须填写分摊金额，特别是罚金类型必填
  const invalidRow = responsibilityList.value.find(row => {
    const ratio = parseFloat(row.responsibilityRatio) || 0
    if (ratio <= 0) return false
    const amount = parseFloat(row.payableRiskFund)
    return Number.isNaN(amount) || amount < 0
  })

  if (invalidRow) {
    if (invalidRow.responsibilityType === '罚金') {
      ElMessage.warning('罚金责任类型的分摊金额不能为空')
    } else {
      ElMessage.warning('风险金分解责任人中的分摊金额不能为空，请检查所有责任人')
    }
    return
  }

  saving.value = true

  try {
    // 组织后端需要的数据
    const contractNo = loanInfo.contractNo
    const badLoanAccount = {
      contractNo,
      riskFundPayable: calculationForm.riskFundPayable,
      calculationBasis: calculationForm.calculationBasis,
      compensationRatio: calculationForm.compensationRatio,
      exemptionReason: calculationForm.exemptionReason
    }
    // 传递 id、分摊金额和责任本金到后端更新
    const responsibilityRiskFundList = responsibilityList.value.map(item => ({
      id: item.id,
      payableRiskFund: item.payableRiskFund,
      responsibilityAmount: item.responsibilityAmount
    }))

    const res = await riskCalculate(responsibilityRiskFundList, badLoanAccount)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      // 通知父组件刷新列表
      emit('save')
      // 关闭弹窗
      handleClose()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false
  // 重置表单
  if (calculationFormRef.value) {
    calculationFormRef.value.resetFields()
  }
  calculationForm.riskFundPayable = ''
  calculationForm.compensationRatio = '100'
  calculationForm.exemptionReason = ''
  responsibilityList.value = []
}

// 格式化金额（元转万元）
function formatAmount(value) {
  if (!value) return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  // 保留两位小数
  return (num).toFixed(2)
}

// 获取责任类型文本
function getResponsibilityTypeText(type) {
  const typeMap = {
    'MAIN_INVESTIGATION': '主调查责任',
    'REVIEW': '审查责任',
    'APPROVAL': '审批责任',
    'MANAGEMENT': '管理责任'
  }
  return typeMap[type] || type || '-'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'NOT_DETERMINED': '未定责',
    'INITIAL': '初分',
    'REVIEW': '核对',
    'OBJECTION': '异议',
    'DIRECT_REPORT': '直报',
    'COMPLETED': '完成',
    'CONFIRMED': '确责'
  }
  return statusMap[status] || status || '-'
}

// 获取状态标签类型
function getStatusTagType(status) {
  const statusMap = {
    'NOT_DETERMINED': 'info',
    'INITIAL': 'warning',
    'OBJECTION': 'danger',
    'REVIEW': 'success',
    'DIRECT_REPORT': 'primary',
    'COMPLETED': 'success',
    'CONFIRMED': 'success'
  }
  return statusMap[status] || 'info'
}

// 监听弹窗显示
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initData()
  }
})

// 监听选中行变化
watch(() => props.selectedRow, () => {
  if (props.visible) {
    initData()
  }
}, { deep: true })

// 实际应缴变化自动重新计算
watch(actualPayable, () => {
  tryAutoCalculateAllocation()
})
</script>

<style scoped>
.risk-fund-dialog {
  padding: 20px;
}

.loan-info-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.loan-info-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.calculation-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.allocation-section {
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-difference {
  display: flex;
  align-items: center;
  gap: 8px;
}

.difference-input :deep(.el-input__inner) {
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-input-group__append) {
  background-color: #f5f7fa;
  color: #606266;
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>

