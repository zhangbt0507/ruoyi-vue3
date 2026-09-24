<template>
  <el-dialog
    title="贷款详情"
    v-model="dialogVisible"
    width="90%"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
  >
    <div class="detail-container">
      <!-- 左侧内容区域 -->
      <div class="content-area">
        <!-- 基本信息 -->
        <div id="basic-info" class="section">
          <div class="section-content">
            <el-form :model="detailData.basicInfo" label-width="100px" class="detail-form">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="客户名称">
                    <el-input v-model="detailData.basicInfo.customerName" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="证件号码">
                    <el-input v-model="detailData.basicInfo.idNumber" disabled  />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="客户内码">
                    <el-input v-model="detailData.basicInfo.customerCode" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="联系电话">
                    <el-input v-model="detailData.basicInfo.phoneNumber" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="客户地址">
                    <el-input v-model="detailData.basicInfo.address" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="借款日期">
                    <el-input v-model="detailData.basicInfo.loanDate" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="到期日期">
                    <el-input v-model="detailData.basicInfo.dueDate" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="合同金额">
                    <el-input v-model="detailData.basicInfo.contractAmount" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="发放金额">
                    <el-input v-model="detailData.basicInfo.loanAmount" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="担保方式">
                    <el-input v-model="detailData.basicInfo.guaranteeType" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="执行利率">
                    <el-input v-model="detailData.basicInfo.interestRate" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="欠款余额">
                    <el-input v-model="detailData.basicInfo.debtAmount" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="欠款总额">
                    <el-input v-model="detailData.basicInfo.totalDebtAmount" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="借款用途">
                    <el-input v-model="detailData.basicInfo.loanPurpose" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="担保人名称">
                    <el-input v-model="detailData.basicInfo.guarantorName" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="担保人客户号">
                    <el-input v-model="detailData.basicInfo.guarantorId" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="不良贷款成因分析">
                    <el-input 
                      v-model="detailData.basicInfo.badLoanAnalysis" 
                      type="textarea" 
                      :rows="4" 
                      disabled 
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="原机构号">
                    <el-input v-model="detailData.basicInfo.originalDeptId" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="机构号">
                    <el-input v-model="detailData.basicInfo.deptId" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="管贷责任人">
                    <el-input v-model="detailData.basicInfo.responsiblePerson" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="建档人">
                    <el-input v-model="detailData.basicInfo.createdBy" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="建档日期">
                    <el-input v-model="detailData.basicInfo.createDate" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="最后更新人">
                    <el-input v-model="detailData.basicInfo.lastUpdatedBy" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="更新日期">
                    <el-input v-model="detailData.basicInfo.updateDate" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>


        <!-- 管贷过程记录 -->
        <div id="loan-management-records" class="section">
          <div class="section-header">
            <span class="section-title">管贷过程记录</span>
          </div>
          <div class="section-content">
            <el-table :data="detailData.loanManagementRecords" style="width: 100%" border>
              <el-table-column label="登记日期" prop="recordDate" align="center" width="100" />
              <el-table-column label="管贷类型" prop="managementType" align="center" width="100" />
              <el-table-column label="登记人" prop="recorder" align="center" width="80" />
              <el-table-column label="过程及结果反馈" prop="feedback" align="center" min-width="300" />
            </el-table>
          </div>
        </div>

        <!-- 责任比与风险金 -->
        <div id="responsibility-risk" class="section">
          <div class="section-header">
            <span class="section-title">责任比与风险金</span>
          </div>
          <div class="section-content">
            <el-table :data="detailData.responsibilityRisk" style="width: 100%" border>
              <el-table-column label="责任人" prop="responsiblePerson" align="center" width="150" />
              <el-table-column label="责任类型" prop="responsibilityType" align="center" width="120" />
              <el-table-column label="责任比" prop="responsibilityRatio" align="center" width="80">
                <template #default="scope">
                  {{ scope.row.responsibilityRatio }}%
                </template>
              </el-table-column>
              <el-table-column label="认定日期" prop="confirmDate" align="center" width="100" />
              <el-table-column label="操作人" prop="operator" align="center" width="80" />
              <el-table-column label="应缴风险金" prop="expectedRiskFund" align="center" width="120" />
              <el-table-column label="实缴风险金" prop="actualRiskFund" align="center" width="120" />
              <el-table-column label="返还风险金" prop="returnedRiskFund" align="center" width="120" />
            </el-table>
          </div>
        </div>

        <!-- 黑名单情况 -->
        <div id="blacklist" class="section">
          <div class="section-header">
            <span class="section-title">黑名单情况</span>
          </div>
          <div class="section-content">
            <el-table :data="detailData.blacklist" style="width: 100%" border>
              <el-table-column label="客户名称" prop="customerName" align="center" width="120" />
              <el-table-column label="客户号" prop="customerId" align="center" width="150" />
              <el-table-column label="黑名单" prop="isBlacklisted" align="center" width="80">
                <template #default="scope">
                  <span :style="{ color: scope.row.isBlacklisted ? '#fff' : '#000', backgroundColor: scope.row.isBlacklisted ? '#f56c6c' : 'transparent', padding: '2px 8px', borderRadius: '4px' }">
                    {{ scope.row.isBlacklisted ? '是' : '否' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="关系" prop="relationship" align="center" width="80" />
              <el-table-column label="加黑原因" prop="blacklistReason" align="center" min-width="150" />
              <el-table-column label="日期" prop="date" align="center" width="100" />
              <el-table-column label="操作员" prop="operator" align="center" width="80">
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 账户止付情况 -->
        <div id="payment-status" class="section">
          <div class="section-header">
            <span class="section-title">账户止付情况</span>
          </div>
          <div class="section-content">
            <el-table :data="detailData.paymentStatus" style="width: 100%" border>
              <el-table-column label="客户名称" prop="customerName" align="center" width="120" />
              <el-table-column label="客户号" prop="customerId" align="center" width="150" />
              <el-table-column label="存款账号" prop="accountNumber" align="center" width="150" />
              <el-table-column label="余额" prop="balance" align="center" width="100">
                <template #default="scope">
                  {{ formatMoney(scope.row.balance) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="status" align="center" width="80">
                <template #default="scope">
                  <span :style="{ 
                    color: '#fff', 
                    backgroundColor: scope.row.status === '正常' ? '#67c23a' : scope.row.status === '冻结' ? '#f56c6c' : '#e6a23c', 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                  }">
                    {{ scope.row.status }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="关系" prop="relationship" align="center" width="80" />
              <el-table-column label="止付原因" prop="stopReason" align="center" min-width="150" />
            </el-table>
          </div>
        </div>

        <!-- 诉讼历程 -->
        <div id="litigation-history" class="section">
          <div class="section-header">
            <span class="section-title">诉讼历程</span>
          </div>
          <div class="section-content">
            <el-table :data="detailData.litigationHistory" style="width: 100%" border>
              <el-table-column label="日期" prop="date" align="center" width="100" />
              <el-table-column label="操作类型" prop="operationType" align="center" width="100" />
              <el-table-column label="结果" prop="result" align="center" width="80" />
              <el-table-column label="操作人" prop="operator" align="center" width="80" />
              <el-table-column label="法院" prop="court" align="center" width="100" />
              <el-table-column label="具体事项" prop="details" align="center" min-width="200" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 右侧导航菜单 -->
      <div class="nav-menu">
        <div class="menu-items">
          <div 
            v-for="(item, index) in menuItems" 
            :key="index" 
            class="menu-item" 
            :class="{ active: activeMenu === item.id }"
            @click="scrollToSection(item.id)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible'])

const dialogVisible = ref(false)
const activeMenu = ref('basic-info')

// 菜单项配置
const menuItems = [
  { id: 'basic-info', name: '基本信息' },
  { id: 'loan-management-records', name: '管贷过程记录' },
  { id: 'responsibility-risk', name: '责任比与风险金' },
  { id: 'blacklist', name: '黑名单情况' },
  { id: 'payment-status', name: '账户止付情况' },
  { id: 'litigation-history', name: '诉讼历程' }
]

// 监听visible属性变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    // 当弹窗打开时，加载数据
    loadDetailData()
    nextTick(() => {
      // 默认选中第一个菜单
      activeMenu.value = 'basic-info'
      // 添加滚动监听
      addScrollListener()
    })
  } else {
    // 当弹窗关闭时，移除滚动监听
    removeScrollListener()
  }
})

// 监听dialogVisible变化，同步到父组件
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 模拟详情数据
const detailData = reactive({
  basicInfo: {
    customerName: '',
    idNumber: '',
    customerCode: '',
    phoneNumber: '',
    address: '',
    loanDate: '',
    dueDate: '',
    contractAmount: '',
    loanAmount: '',
    guaranteeType: '',
    interestRate: '',
    debtAmount: '',
    totalDebtAmount: '',
    loanPurpose: '',
    guarantorName: '',
    guarantorId: '',
    badLoanAnalysis: '',
    originalDeptId: '',
    deptId: '',
    responsiblePerson: '',
    createdBy: '',
    createDate: '',
    lastUpdatedBy: '',
    updateDate: ''
  },
  paymentStatus: [],
  loanManagementRecords: [],
  responsibilityRisk: [],
  blacklist: [],
  litigationHistory: []
})

// 加载详情数据
function loadDetailData() {
  const selectedData = props.selectedRow || {}
  
  setTimeout(() => {
    // 基本信息（合并了账务信息）
    detailData.basicInfo = {
      customerName: selectedData.customerName || '蔡*新',
      idNumber: selectedData.customerNo || '10133072719900****',
      customerCode: selectedData.customerCode || '',
      phoneNumber: selectedData.contactPhone || '',
      address: selectedData.customerAddress || '陈*斌主调查责任马*仙审查责任蔡*东主调查责任',
      loanDate: selectedData.contractStartDate || '2021-03-24',
      dueDate: selectedData.contractEndDate || '2024-03-21',
      contractAmount: selectedData.contractAmount || '',
      loanAmount: selectedData.contractAmount || '',
      guaranteeType: selectedData.guaranteeType || '',
      interestRate: selectedData.interestRate || '',
      debtAmount: selectedData.overduePrincipal || '',
      totalDebtAmount: selectedData.totalDebt || '',
      loanPurpose: selectedData.loanPurpose || '',
      guarantorName: selectedData.guarantorName || '',
      guarantorId: selectedData.guarantorCustomerNo || '',
      badLoanAnalysis: selectedData.badLoanAnalysis || '',
      originalDeptId: selectedData.originalDeptId || '',
      deptId: selectedData.deptId || selectedData.managementInstitution || '',
      responsiblePerson: selectedData.managementPerson || '',
      createdBy: selectedData.createdBy || '',
      createDate: selectedData.createDate || '',
      lastUpdatedBy: selectedData.lastUpdatedBy || '',
      updateDate: selectedData.updateDate || selectedData.lastUpdateDate || ''
    }
    
    // 账户止付情况
    detailData.paymentStatus = [
      { customerName: '蔡*湖*瑞企***公室', customerId: '99911070607200****', accountNumber: '6228****7990****039', balance: 11.11, status: '正常', relationship: '借款人', stopReason: '' },
      { customerName: '俞*浩', customerId: '1013307271963****', accountNumber: '6230****7990****752', balance: 14.38, status: '冻结', relationship: '配偶', stopReason: 'XX法院' },
      { customerName: '徐*良', customerId: '1013307271967****', accountNumber: '6230****7990****348', balance: 7.44, status: '止付', relationship: '法代人', stopReason: '公司不良贷款止付' },
      { customerName: '韦*鸿', customerId: '1013307269022****', accountNumber: '6228****7511****141', balance: 15.04, status: '正常', relationship: '担保人', stopReason: '' },
      { customerName: '周*余', customerId: '1013307271951****', accountNumber: '6230****7990****752', balance: 14.39, status: '冻结', relationship: '担保人', stopReason: '广东法院' },
      { customerName: '陈*胜', customerId: '1013307275309****', accountNumber: '6230****7990****752', balance: 14.37, status: '止付', relationship: '担保人', stopReason: '为XX公司不良担保' },
      { customerName: '韦*荣', customerId: '19911070606121****', accountNumber: '6210****7990****773', balance: 18.04, status: '正常', relationship: '担保人', stopReason: '' },
      { customerName: '陈*杜', customerId: '1013307274404****', accountNumber: '6228****7990****471', balance: 11.27, status: '冻结', relationship: '担保人', stopReason: '广东法院' },
      { customerName: '周*良', customerId: '19911070606100****', accountNumber: '6228****7990****992', balance: 14.34, status: '止付', relationship: '担保人', stopReason: '为XX公司不良担保' }
    ]
    
    // 管贷过程记录
    detailData.loanManagementRecords = [
      { recordDate: '2025-01-01', managementType: '上门催收', recorder: '陈*斌', feedback: '对本次催收进行效果评估，并对所遇的问题进行补充说明。' },
      { recordDate: '2025-01-01', managementType: '信函催收', recorder: '陈*斌', feedback: '' },
      { recordDate: '2025-01-01', managementType: '电话催收', recorder: '陈*斌', feedback: '' }
    ]
    
    // 责任比与风险金
    detailData.responsibilityRisk = [
      { responsiblePerson: '8880090 (陈*斌)', responsibilityType: '主调查责任', responsibilityRatio: 45, confirmDate: '2025-01-01', operator: '8880090', expectedRiskFund: '', actualRiskFund: '', returnedRiskFund: '' },
      { responsiblePerson: '8880146 (陈*中)', responsibilityType: '副调查责任', responsibilityRatio: 5, confirmDate: '', operator: '', expectedRiskFund: '', actualRiskFund: '', returnedRiskFund: '' },
      { responsiblePerson: '8880126 (蔡*东)', responsibilityType: '审查责任', responsibilityRatio: 5, confirmDate: '', operator: '', expectedRiskFund: '', actualRiskFund: '', returnedRiskFund: '' },
      { responsiblePerson: '8880250 (陈*馨)', responsibilityType: '审批责任', responsibilityRatio: 25, confirmDate: '', operator: '', expectedRiskFund: '', actualRiskFund: '', returnedRiskFund: '' },
      { responsiblePerson: '8880377 (陈*深)', responsibilityType: '审批责任', responsibilityRatio: 20, confirmDate: '', operator: '', expectedRiskFund: '', actualRiskFund: '', returnedRiskFund: '' }
    ]
    
    // 黑名单情况
    detailData.blacklist = [
      { customerName: '蔡*湖*瑞企***公室', customerId: '99911070607200****', isBlacklisted: false, relationship: '借款人', blacklistReason: '', date: '' },
      { customerName: '俞*浩', customerId: '1013307271963****', isBlacklisted: true, relationship: '配偶', blacklistReason: '', date: '' },
      { customerName: '徐*良', customerId: '1013307271967****', isBlacklisted: true, relationship: '担保人', blacklistReason: '', date: '' },
      { customerName: '韦*鸿', customerId: '1013307269022****', isBlacklisted: false, relationship: '担保人', blacklistReason: '', date: '' },
      { customerName: '周*余', customerId: '1013307271951****', isBlacklisted: false, relationship: '担保人', blacklistReason: '', date: '' },
      { customerName: '陈*胜', customerId: '1013307275309****', isBlacklisted: true, relationship: '担保人', blacklistReason: '', date: '' }
    ]
    
    // 诉讼历程
    detailData.litigationHistory = [
      { date: '2025-07-11', operationType: '诉讼建档', result: '操作', operator: '陈瑞斌', court: '', details: '由XXX从不良清单导入诉讼清单' },
      { date: '2025-07-15', operationType: '提起诉讼', result: '受理', operator: '陈瑞斌', court: '蟠安法院', details: '诉状等资料已影像资料' },
      { date: '2025-08-10', operationType: '诉讼判决', result: '胜诉', operator: '陈瑞斌', court: '蟠安法院', details: '判决书等资料见影像' },
      { date: '2025-08-15', operationType: '诉讼执行', result: '领取文书', operator: '陈瑞斌', court: '蟠安法院', details: '执行文书见影像' },
      { date: '2025-08-20', operationType: '诉讼执行', result: '终本执行', operator: '陈瑞斌', court: '蟠安法院', details: '执行文书见影像' },
      { date: '2025-09-30', operationType: '诉讼执行', result: '恢复执行', operator: '', court: '', details: '' },
      { date: '2026-07-13', operationType: '诉讼执行', result: '终结执行', operator: '', court: '', details: '借款人死亡' }
    ]
  }, 300)
}

// 滚动到指定区域
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    const container = document.querySelector('.content-area')
    container.scrollTo({
      top: section.offsetTop - 20,
      behavior: 'smooth'
    })
    activeMenu.value = sectionId
  }
}

// 处理滚动事件，更新当前活动菜单
function handleScroll() {
  const container = document.querySelector('.content-area')
  const scrollPosition = container.scrollTop
  
  // 获取所有区域的位置
  const sections = menuItems.map(item => {
    const element = document.getElementById(item.id)
    return {
      id: item.id,
      offsetTop: element ? element.offsetTop - 30 : 0
    }
  })
  
  // 找到当前滚动位置对应的区域
  let currentSection = sections[0].id
  for (let i = 0; i < sections.length; i++) {
    if (scrollPosition >= sections[i].offsetTop) {
      currentSection = sections[i].id
    }
  }
  
  // 更新活动菜单
  if (activeMenu.value !== currentSection) {
    activeMenu.value = currentSection
  }
}

// 添加滚动监听
function addScrollListener() {
  const container = document.querySelector('.content-area')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
}

// 移除滚动监听
function removeScrollListener() {
  const container = document.querySelector('.content-area')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
}

// 关闭弹窗
function closeDialog() {
  dialogVisible.value = false
}

// 处理打印
function handlePrint() {
  ElMessage.success('打印功能开发中')
}

// 添加记录
function handleAddRecord() {
  ElMessage.success('添加记录功能开发中')
}

// 格式化金额
function formatMoney(value) {
  if (!value && value !== 0) return ''
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 组件卸载时移除事件监听
onMounted(() => {
  if (props.visible) {
    loadDetailData()
    nextTick(() => {
      addScrollListener()
    })
  }
})
</script>

<style scoped>
.detail-container {
  display: flex;
  height: 70vh;
  position: relative;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 20px;
}

.nav-menu {
  width: 120px;
  margin-left: 20px;
  position: sticky;
  top: 0;
}

.menu-items {
  position: sticky;
  top: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px 0;
}

.menu-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  text-align: center;
  border-left: 3px solid transparent;
  margin-bottom: 5px;
  transition: all 0.3s;
}

.menu-item:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.menu-item.active {
  color: #409eff;
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
  font-weight: bold;
}

.section {
  margin-bottom: 30px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  background-color: #f0f9eb;
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #67c23a;
}

.section-content {
  padding: 15px;
  background-color: #fff;
}

.readonly-input :deep(.el-input__wrapper) {
  background-color: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  box-shadow: none !important;
}

.readonly-input :deep(.el-input__inner) {
  background-color: transparent !important;
  color: #606266 !important;
  cursor: default !important;
  border: none !important;
  box-shadow: none !important;
}

.readonly-input :deep(.el-textarea__inner) {
  background-color: #ffffff !important;
  color: #606266 !important;
  cursor: default !important;
  border: 1px solid #dcdfe6 !important;
  box-shadow: none !important;
  resize: none !important;
}

.readonly-input:hover :deep(.el-input__wrapper) {
  border-color: #dcdfe6 !important;
  box-shadow: none !important;
}

.readonly-input:focus-within :deep(.el-input__wrapper) {
  border-color: #dcdfe6 !important;
  box-shadow: none !important;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.add-record-btn {
  margin-top: 10px;
  text-align: center;
}

/* 自定义滚动条样式 */
.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.content-area::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}
</style>