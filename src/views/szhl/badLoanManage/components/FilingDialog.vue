<template>
  <el-dialog 
    :title="props.isSupplement ? '补档' : '不良贷款建档'" 
    v-model="dialogVisible" 
    width="50%" 
    :close-on-click-modal="false"
    append-to-body
    @close="resetForms"
  >
    <!-- <el-tabs v-model="activeTab" type="card"> -->
      <!-- 账务信息建档 -->
      <!-- <el-tab-pane label="账务信息建档" name="financialInfo"> -->
        <div class="filing-container">
          <el-form ref="financialInfoFormRef" :model="financialInfoForm" :rules="financialInfoRules" label-width="100px" class="filing-form">
            <!-- 第一行：客户名称、客户号、客户内码 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="客户名称" prop="customerName" required>
                  <el-input v-model="financialInfoForm.customerName" disabled/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="客户号" prop="customerNo" required>
                  <el-input v-model="financialInfoForm.customerNo" disabled/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="客户内码" prop="customerCode" required>
                  <el-input v-model="financialInfoForm.customerCode" disabled/>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第二行：贷款合同号、业务类别、合同金额 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="贷款合同号" prop="contractNo" required>
                  <el-input v-model="financialInfoForm.contractNo" disabled/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="业务类别" prop="businessType" required >
                  <el-select v-model="financialInfoForm.businessType" style="width: 100%" disabled>
                    <el-option label="贷款" value="贷款" />
                    <el-option label="信用卡" value="信用卡" />
                    <el-option label="承兑" value="承兑" />
                    <el-option label="贴现" value="贴现" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="合同金额" prop="contractAmount" required>
                  <el-input v-model="financialInfoForm.contractAmount" disabled/>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第三行：合同日期、到期日期、担保方式 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="合同日期" prop="contractStartDate" required>
                  <el-date-picker
                    v-model="financialInfoForm.contractStartDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="到期日期" prop="contractEndDate" required>
                  <el-date-picker
                    v-model="financialInfoForm.contractEndDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="担保方式" prop="guaranteeType" required>
                  <el-input v-model="financialInfoForm.guaranteeType" disabled/>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第四行：贷款用途 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="贷款用途" prop="loanPurpose">
                  <el-input v-model="financialInfoForm.loanPurpose" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="建档余额" prop="filingAmount" required >
                  <el-input v-model="financialInfoForm.filingAmount" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="诉讼时效" prop="litigationDeadline" required>
                  <el-date-picker
                    v-model="financialInfoForm.litigationDeadline"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第五行：建档余额、建档欠息、建档类型 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="建档类型" prop="badLoanNature" required>
                  <el-select v-model="financialInfoForm.badLoanNature" style="width: 100%">
                    <el-option label="不良" value="不良" />
                    <el-option label="核销" value="核销" />
                    <el-option label="正常" value="正常" />
                    <el-option label="盘活" value="盘活" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="担保补充说明" prop="guaranteeInstruction" required>
                  <el-input v-model="financialInfoForm.guaranteeInstruction"  
                    placeholder="余值抵押、保证函等"/>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第六行：联系电话、客户地址 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="联系电话" prop="contactPhone" required>
                  <el-input v-model="financialInfoForm.contactPhone" placeholder="请输入联系电话"/>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="客户地址" prop="customerAddress" required>
                  <el-input v-model="financialInfoForm.customerAddress" placeholder="请输入客户地址"/>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第七行：管贷机构、原机构号 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="管贷机构" prop="managementInstitution" required>
                  <el-select v-model="financialInfoForm.managementInstitution" placeholder="请选择管贷机构" style="width: 100%" :disabled="props.isSupplement">
                    <el-option
                      v-for="dept in deptList"
                      :key="dept.deptId"
                      :label="`${dept.deptName}（${dept.deptId}）`"
                      :value="String(dept.deptId)"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="原机构号" prop="originalLoanInstitution" required>
                  <el-select v-model="financialInfoForm.originalLoanInstitution" placeholder="请选择原机构号" style="width: 100%">
                    <el-option
                      v-for="dept in deptList"
                      :key="dept.deptId"
                      :label="`${dept.deptName}（${dept.deptId}）`"
                      :value="String(dept.deptId)"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="管贷责任人" prop="managementPerson" required>
                  <el-select v-model="financialInfoForm.managementPerson"
                   placeholder="请选择管贷责任人" 
                   style="width: 100%" 
                   :disabled="props.isSupplement"
                   filterable>
                    <el-option
                      v-for="user in userList"
                      :key="user.userName"
                      :label="`${user.nickName}（${user.userName}）`"
                      :value="String(user.userName)"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第八行：不良贷款成因分析 -->
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="不良贷款成因分析" prop="badLoanAnalysis" required>
                  <el-input
                    type="textarea"
                    v-model="financialInfoForm.badLoanAnalysis"
                    rows="3"
                    placeholder="请输入不良贷款成因分析..."
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 管理信息放在最下面 -->
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="机构号">
                  <el-input 
                    :value="getDeptNameById(financialInfoForm.deptId)" 
                    disabled 
                    style="width: 100%" 
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="建档人">
                  <el-input 
                    :value="getFilingPersonDisplay()" 
                    disabled 
                    style="width: 100%" 
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="更新日期">
                  <el-input 
                    :value="formatDateForDisplay(financialInfoForm.updateDate)" 
                    disabled 
                    style="width: 100%" 
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="最后更新人">
                  <el-input 
                    :value="getUserNameById(financialInfoForm.updateBy)" 
                    disabled 
                    style="width: 100%" 
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      <!-- </el-tab-pane> -->
    <!-- </el-tabs> -->
    
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitFiling">提交</el-button>
        <el-button @click="cancelFiling">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { getBadLoan, addBadLoan, updateBadLoan } from '@/api/szhl/badLoanManage/badLoan'
import { getToBeSet } from '@/api/szhl/badLoanManage/tobeset'
import { listAllDept } from '@/api/system/dept'
import { queryAllUser } from '@/api/system/user'
import useUserStore from '@/store/modules/user'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
    default: false
  },
  selectedRow: {
    type: Object,
    required: false,
    default: () => ({})
  },
  isSupplement: {
    type: Boolean,
    required: false,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'submit', 'refresh'])

// 用户信息
const userStore = useUserStore()
const currentUser = {
  userName: userStore.name || '',        // 登录名（userName）
  nickName: userStore.nickName || '',    // 真实姓名（nickName）
  userId: userStore.userId || '',        // 用户ID
  deptId: String(userStore.deptId || '') // 部门ID
}

// 对话框可见性控制
const dialogVisible = ref(false)
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    // 对话框打开时初始化表单数据
    initFormData()
  }
})
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 标签页和表单相关
const activeTab = ref('financialInfo')

// 表单引用
const financialInfoFormRef = ref(null)

// 防止重复调用API的标记
const isInitializing = ref(false)

// 机构和用户列表数据
const deptList = ref([])
const userList = ref([])

// 获取机构列表
async function loadDeptList() {
  try {
    const response = await listAllDept()
    if (response.code === 200) {
      deptList.value = response.data || []
    }
  } catch (error) {
    console.error('获取机构列表失败:', error)
  }
}

// 获取用户列表
async function loadUserList() {
  try {
    const response = await queryAllUser({})
    if (response.code === 200) {
      userList.value = response.data || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadDeptList()
  loadUserList()
})

// 根据部门ID获取部门名称（编号）
function getDeptNameById(deptId) {
  if (!deptId || !deptList.value.length) return deptId
  const dept = deptList.value.find(d => d.deptId == deptId)
  return dept ? `${dept.deptName}（${dept.deptId}）` : deptId
}

// 根据用户ID获取用户名称（编号）
function getUserNameById(userName) {
  if (!userName || !userList.value.length) return userName
  const user = userList.value.find(u => u.userName == userName)
  return user ? `${user.nickName}（${user.userName}）` : userName
}

// 获取建档人显示信息（直接使用当前登录用户）
function getFilingPersonDisplay() {
  // 优先显示当前登录用户信息
  if (currentUser.nickName && currentUser.userName) {
    return `${currentUser.nickName}（${currentUser.userName}）`
  }
  
  // 如果只有登录名，也显示
  if (currentUser.userName) {
    return currentUser.userName
  }
  
  // 如果没有当前用户信息，尝试从表单获取
  if (financialInfoForm.createdBy) {
    return getUserNameById(financialInfoForm.createdBy)
  }
  
  return '当前用户'
}

// 格式化日期用于显示
function formatDateForDisplay(date) {
  if (!date) return ''
  
  if (typeof date === 'string') {
    // 如果是字符串，直接返回日期部分
    return date.split('T')[0]
  }
  
  if (date instanceof Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return String(date)
}


// 账务信息表单验证规则
const financialInfoRules = reactive({
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  customerNo: [
    { required: true, message: '请输入客户号', trigger: 'blur' }
  ],
  customerCode: [
    { required: true, message: '请输入客户内码', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  customerAddress: [
    { required: true, message: '请输入客户地址', trigger: 'blur' }
  ],
  businessType: [
    { required: true, message: '请选择业务类别', trigger: 'change' }
  ],
  contractNo: [
    { required: true, message: '请输入贷款合同号', trigger: 'blur' }
  ],
  contractAmount: [
    { required: true, message: '请输入合同金额', trigger: 'blur' },
    { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' }
  ],
  contractStartDate: [
    { required: true, message: '请选择合同日期', trigger: 'change' }
  ],
  contractEndDate: [
    { required: true, message: '请选择到期日期', trigger: 'change' }
  ],
  guaranteeType: [
    { required: true, message: '请输入担保方式', trigger: 'blur' }
  ],
  // loanPurpose: [
  //   { required: true, message: '请输入贷款用途', trigger: 'blur' }
  // ],
  filingAmount: [
    { required: true, message: '请输入建档余额', trigger: 'blur' },
    { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' }
  ],
  guaranteeInstruction: [
    { required: true, message: '请输入担保补充说明', trigger: 'blur' }
  ],
  badLoanLevel: [
    { required: true, message: '请选择不良级段', trigger: 'change' }
  ],
  badLoanNature: [
    { required: true, message: '请选择建档类型', trigger: 'change' }
  ],
  originalLoanInstitution: [
    { required: true, message: '请选择原机构号', trigger: 'change' }
  ],
  managementInstitution: [
    { required: true, message: '请选择管贷机构', trigger: 'change' }
  ],
  managementPerson: [
    { required: true, message: '请选择管贷责任人', trigger: 'change' }
  ],
  litigationDeadline: [
    { required: true, message: '请选择诉讼时效', trigger: 'change' }
  ],
  badLoanAnalysis: [
    { required: true, message: '请输入不良贷款成因分析', trigger: 'blur' }
  ],
  isFlag: [
    { required: true, message: '请选择是否盘活', trigger: 'change' }
  ],
})

// 账务信息表单
const financialInfoForm = reactive({
  customerName: '',
  customerNo: '',
  customerCode: '',
  contactPhone: '',
  customerAddress: '',
  businessType: '贷款',
  contractNo: '',
  contractAmount: '',
  contractStartDate: '',
  contractEndDate: '',
  guaranteeType: '',
  loanPurpose: '',
  filingAmount: '',
  guaranteeInstruction: '',
  litigationDeadline: '',
  badLoanLevel: '不良',
  badLoanNature: '不良',
  originalLoanInstitution: '',
  managementInstitution: '',
  managementPerson: '',
  badLoanAnalysis: '',
  otherDescription: '',
  isFlag: '否',
  overduePerson: '',
  overdueInstitution: '',
  overdueDate: '',
  originalContractNo: '',
  deptId: '',
  createdBy: '',
  updateBy: '',
  updateDate: '',
  determinationStatus: '',
  riskFundStatus: ''
})

// 将待建档数据映射到表单数据
function mapToBeSetDataToForm(tobeSetData) {
  return {
    customerName: tobeSetData.nfanflnm || '',
    customerNo: tobeSetData.nfabcsid || '',
    customerCode: tobeSetData.nfaacsno || '',
    contactPhone: tobeSetData.contactPhone || '',
    customerAddress: tobeSetData.customerAddress || '',
    businessType: '贷款',
    contractNo: tobeSetData.contractNo || '',
    contractAmount: tobeSetData.nfaallmt ? parseFloat(tobeSetData.nfaallmt).toFixed(2) : '0.00',
    contractStartDate: tobeSetData.nfabdate || '',
    contractEndDate: tobeSetData.nfacdate || '',
    guaranteeType: tobeSetData.nfaassty || '',
    loanPurpose: tobeSetData.dkyt || '',
    filingAmount: tobeSetData.htye ? parseFloat(tobeSetData.htye).toFixed(2) : '0.00',
    guaranteeInstruction: tobeSetData.guaranteeInstruction ? tobeSetData.guaranteeInstruction : '',
    litigationDeadline: tobeSetData.litigationDeadline || '',
    badLoanLevel: tobeSetData.wjxt || '不良',
    badLoanNature: '不良',
    originalLoanInstitution: tobeSetData.nfaabrno ? String(tobeSetData.nfaabrno) : '',
    managementInstitution: tobeSetData.nfaabrno ? String(tobeSetData.nfaabrno) : currentUser.deptId,
    managementPerson: currentUser.userName,
    badLoanAnalysis: '',
    otherDescription: '',
    isFlag: '否',
    overduePerson: '',
    overdueInstitution: '',
    overdueDate: '',
    originalContractNo: '',
    deptId: currentUser.deptId,
    createdBy: currentUser.userName,
    updateBy: '',
    updateDate: new Date(),
    determinationStatus: '',
    riskFundStatus: ''
  }
}

// 初始化表单数据
async function initFormData() {
  // 防止重复调用
  if (isInitializing.value) {
    return
  }
  isInitializing.value = true
  
  try {
    // 重置表单
    resetForms()
    
    // 如果有选中行数据，则填充表单
    if (props.selectedRow && Object.keys(props.selectedRow).length > 0) {
      const val = props.selectedRow
      
      try {
        let response
        // 根据操作类型调用不同的接口
        if (props.isSupplement) {
          // 补档操作：调用不良贷款详情接口
          response = await getBadLoan(val.contractNo)
        } else {
          // 建档操作：调用待建档合同明细详细信息接口
          response = await getToBeSet(val.contractNo)
        }
        
        if (response.code === 200 && response.data) {
          const latestData = response.data
          
          if (props.isSupplement) {
            // 补档：使用不良贷款详情数据
          Object.assign(financialInfoForm, {
            customerName: latestData.customerName || '',
            customerNo: latestData.customerNo || '',
            customerCode: latestData.customerCode || '',
            contactPhone: latestData.contactPhone || '',
            customerAddress: latestData.customerAddress || '',
            businessType: latestData.businessType || '贷款',
            contractNo: latestData.contractNo || '',
            contractAmount: latestData.contractAmount ? parseFloat(latestData.contractAmount).toFixed(2) : '0.00',
            contractStartDate: latestData.contractStartDate || '',
            contractEndDate: latestData.contractEndDate || '',
            guaranteeType: latestData.guaranteeType || '',
            loanPurpose: latestData.loanPurpose || '',
            filingAmount: latestData.filingAmount ? parseFloat(latestData.filingAmount).toFixed(2) : '0.00',
            guaranteeInstruction: latestData.guaranteeInstruction ? latestData.guaranteeInstruction : '',
            litigationDeadline: latestData.litigationDeadline || '',
            badLoanLevel: latestData.badLoanLevel || '不良',
            badLoanNature: latestData.badLoanNature || '不良',
            originalLoanInstitution: latestData.originalLoanInstitution ? String(latestData.originalLoanInstitution) : '',
            managementInstitution: latestData.managementInstitution ? String(latestData.managementInstitution) : currentUser.deptId,
            managementPerson: latestData.managementPerson ? String(latestData.managementPerson) : currentUser.userName,
            badLoanAnalysis: latestData.badLoanAnalysis || '',
            otherDescription: latestData.otherDescription || '',
            isFlag: latestData.isFlag || '否',
            overduePerson: latestData.overduePerson || '',
            overdueInstitution: latestData.overdueInstitution || '',
            overdueDate: latestData.overdueDate || '',
            originalContractNo: latestData.originalContractNo || '',
            deptId: currentUser.deptId,
            createdBy: currentUser.userName,
            updateBy: latestData.updateBy ? String(latestData.updateBy) : '',
              updateDate: latestData.lastUpdateDate || latestData.updateDate || new Date(),
              determinationStatus: latestData.determinationStatus || val.determinationStatus || '',
              riskFundStatus: latestData.riskFundStatus || val.riskFundStatus || ''
          })
          } else {
            // 建档：使用待建档数据，需要映射字段
            const mappedData = mapToBeSetDataToForm(latestData)
            Object.assign(financialInfoForm, mappedData)
          }
        } else {
          // 如果接口调用失败，使用传入的数据
          fillFormWithPassedData(val)
        }
      } catch (error) {
        // 如果接口调用出错，使用传入的数据
        console.error('调用详情接口失败:', error)
        fillFormWithPassedData(val)
      }
    } else {
    }
  } finally {
    // 无论成功或失败，都重置初始化标记
    isInitializing.value = false
  }
}

// 使用传入数据填充表单的辅助函数
function fillFormWithPassedData(val) {
  // 填充账务信息表单数据
  Object.assign(financialInfoForm, {
    customerName: val.customerName || '',
    customerNo: val.customerNo || '',
    customerCode: val.customerCode || '',
    contactPhone: val.contactPhone || '',
    customerAddress: val.customerAddress || '',
    businessType: val.businessType || '贷款',
    contractNo: val.contractNo || '',
    contractAmount: val.contractAmount ? parseFloat(val.contractAmount).toFixed(2) : '0.00',
    contractStartDate: val.contractStartDate || '',
    contractEndDate: val.contractEndDate || '',
    guaranteeType: val.guaranteeType || '',
    loanPurpose: val.loanPurpose || '',
    filingAmount: val.loanBalance ? parseFloat(val.loanBalance).toFixed(2) : '0.00',
    guaranteeInstruction: val.guaranteeInstruction ? String(val.guaranteeInstruction) : '',
    litigationDeadline: val.litigationDeadline || '',
    badLoanLevel: val.badLoanLevel || '不良',
    badLoanNature: val.badLoanNature || '不良',
    originalLoanInstitution: val.originalLoanInstitution ? String(val.originalLoanInstitution) : '',
    managementInstitution: val.managementInstitution ? String(val.managementInstitution) : currentUser.deptId,
    managementPerson: val.managementPerson ? String(val.managementPerson) : currentUser.userName,
    badLoanAnalysis: val.badLoanAnalysis || '',
    otherDescription: val.otherDescription || '',
    isFlag: val.isFlag || '否',
    overduePerson: val.overduePerson || '',
    overdueInstitution: val.overdueInstitution || '',
    overdueDate: val.overdueDate || '',
    originalContractNo: val.originalContractNo || '',
    deptId: currentUser.deptId,
    createdBy: currentUser.userName,
    updateBy: val.updateBy ? String(val.updateBy) : '',
    updateDate: val.lastUpdateDate || val.updateDate || new Date(),
    determinationStatus: val.determinationStatus || '',
    riskFundStatus: val.riskFundStatus || ''
  })
}

// 监听选中行变化，填充表单
watch(() => props.selectedRow, (newVal, oldVal) => {
  // 只有在对话框可见且选中行发生变化时才重新初始化
  if (dialogVisible.value && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    initFormData()
  }
}, { deep: true })


// 查看合同详情
function viewContractDetail() {
  ElMessage.info('查看合同详情功能开发中')
}

// 记取历史
function recordHistory() {
  ElMessage.info('记取历史功能开发中')
}

// 格式化金额数据，确保有两位小数
function formatMoneyValue(value) {
  if (!value) return '0.00'
  const num = parseFloat(value)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

// 提交建档表单（全部信息）
function submitFiling() {
  // 验证账务信息表单
  financialInfoFormRef.value?.validate((financialValid) => {
    if (financialValid) {
      
      // 准备不良贷款账务信息数据
      const badLoanAccount = {
        contractNo: financialInfoForm.contractNo,
        customerNo: financialInfoForm.customerNo,
        customerName: financialInfoForm.customerName,
        customerCode: financialInfoForm.customerCode,
        contactPhone: financialInfoForm.contactPhone,
        customerAddress: financialInfoForm.customerAddress,
        contractAmount: financialInfoForm.contractAmount,
        contractStartDate: formatDate(financialInfoForm.contractStartDate),
        contractEndDate: formatDate(financialInfoForm.contractEndDate),
        guaranteeType: financialInfoForm.guaranteeType,
        loanPurpose: financialInfoForm.loanPurpose,
        filingAmount: financialInfoForm.filingAmount,
        guaranteeInstruction: financialInfoForm.guaranteeInstruction,
        litigationDeadline: formatDate(financialInfoForm.litigationDeadline),
        badLoanNature: financialInfoForm.badLoanNature || '不良',
        originalLoanInstitution: financialInfoForm.originalLoanInstitution,
        managementInstitution: financialInfoForm.managementInstitution,
        managementPerson: financialInfoForm.managementPerson,
        badLoanAnalysis: financialInfoForm.badLoanAnalysis,
        filingPerson: currentUser.userName,
        filingInstitution: currentUser.deptId,
        filingDate: formatDate(new Date()),
        updateBy: currentUser.userName,
        lastUpdateDate: formatDate(new Date())
      }
      
      // 如果是补档操作，保持原有的 determinationStatus 和 riskFundStatus
      if (props.isSupplement) {
        // 优先从 selectedRow 获取，如果没有则从接口返回的数据中获取
        const sourceData = props.selectedRow || {}
        if (sourceData.determinationStatus) {
          badLoanAccount.determinationStatus = sourceData.determinationStatus
        } else {
          // 如果 selectedRow 中没有，尝试从表单数据中获取（在 initFormData 中可能已保存）
          badLoanAccount.determinationStatus = financialInfoForm.determinationStatus || 'NOT_DETERMINED'
        }
        if (sourceData.riskFundStatus) {
          badLoanAccount.riskFundStatus = sourceData.riskFundStatus
        } else {
          // 如果 selectedRow 中没有，尝试从表单数据中获取
          badLoanAccount.riskFundStatus = financialInfoForm.riskFundStatus || 'NOT_CALCULATED'
        }
      } else {
        // 新建时使用默认值
        badLoanAccount.determinationStatus = 'NOT_DETERMINED'
        badLoanAccount.riskFundStatus = 'NOT_CALCULATED'
      }
          
          // 显示加载提示
          const loadingInstance = ElLoading.service({
            lock: true,
            text: '正在保存数据，请稍候...',
            background: 'rgba(0, 0, 0, 0.7)'
          })
      
      // 根据是否是补档操作选择不同的接口
      const apiCall = props.isSupplement ? updateBadLoan(badLoanAccount) : addBadLoan(badLoanAccount)
          
          // 调用整合接口，使用事务保存数据
      apiCall
            .then(response => {
              if (response.code === 200) {
            ElMessage.success(props.isSupplement ? '补档信息提交成功' : '不良贷款建档信息提交成功')
                // 触发父组件刷新列表
                emit('submit', {
                  contractNo: financialInfoForm.contractNo,
                  customerName: financialInfoForm.customerName,
              action: props.isSupplement ? 'supplement_success' : 'filing_success'
                })
                dialogVisible.value = false
              } else {
                ElMessage.error(response.msg || '保存失败，请重试')
              }
            })
            .catch(error => {
              console.error('保存数据时出错:', error)
              ElMessage.error('保存失败，请检查网络连接')
            })
            .finally(() => {
              // 关闭加载提示
              loadingInstance.close()
            })
        } else {
          ElMessage.error('表单验证失败，请检查必填项')
        }
      })
}

// 格式化日期为 yyyy-MM-dd 格式
function formatDate(date) {
  if (!date) return null
  
  if (typeof date === 'string') {
    // 如果已经是字符串格式，尝试转换为标准格式
    const parts = date.split('-')
    if (parts.length === 3) {
      const year = parts[0]
      const month = parts[1].padStart(2, '0')
      const day = parts[2].padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return date
  }
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 重置表单
function resetForms() {
  financialInfoFormRef.value?.resetFields()
  
  // 重置一些可能不会被resetFields重置的字段
  financialInfoForm.updateDate = new Date()
  
  // 重置状态标记
  isInitializing.value = false
}

// 取消建档
function cancelFiling() {
  // ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将会丢失', '提示', {
  //   confirmButtonText: '确定',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // }).then(() => {
    
  // }).catch(() => {
  //   // 用户取消操作，不做任何处理
  // })
  resetForms()
    dialogVisible.value = false
}
</script>

<style scoped>
.filing-container {
  padding: 5px 10px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.form-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.dialog-footer {
  text-align: center;
  margin-top: 10px;
  padding-top: 10px;
}

/* 标签相关样式 */
.tag-container {
  display: flex;
  align-items: flex-start;
}

.tag-input {
  flex: 1;
  min-height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-button {
  margin-top: 2px;
}

.button-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  height: 100%;
  justify-content: center;
}

.action-buttons .el-button {
  width: 100%;
  min-width: 100px;
  height: 40px;
  font-weight: 500;
}

.no-wrap-label :deep(.el-form-item__label) {
  white-space: nowrap;
}

.filing-form {
  padding: 10px 0;
}

.filing-form .el-form-item {
  margin-bottom: 16px;
}

.filing-form .el-input,
.filing-form .el-select,
.filing-form .el-date-picker {
  width: 100%;
}

/* 统一表单项高度 */
.filing-form :deep(.el-input__inner),
.filing-form :deep(.el-select__wrapper) {
  height: 36px;
  line-height: 36px;
}

/* 优化textarea样式 */
.filing-form :deep(.el-textarea__inner) {
  resize: vertical;
  min-height: 80px;
  padding: 8px;
  line-height: 1.5;
}

/* 表单项标签样式优化 */
.filing-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 表单项内容区域样式 */
.filing-form :deep(.el-form-item__content) {
  line-height: 36px;
}

/* 标签页样式优化 */
:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}
</style>