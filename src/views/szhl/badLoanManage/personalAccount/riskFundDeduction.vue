<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户号" prop="customerNo">
        <el-input
          v-model="queryParams.customerNo"
          placeholder="请输入客户号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="责任人" prop="responsiblePerson">
        <el-select
          v-model="queryParams.responsiblePerson"
          placeholder="请选择责任人"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="user in userList"
            :key="user.userName"
            :label="`${user.nickName}（${user.userName}）`"
            :value="user.userName"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="定责状态" prop="determinationStatus">
        <el-select
          v-model="queryParams.determinationStatus"
          placeholder="请选择定责状态"
          clearable
          style="width: 200px"
        >
          <el-option label="初分" value="INITIAL" />
          <el-option label="完成" value="COMPLETED" />
        </el-select>
      </el-form-item> -->
      <!-- <el-form-item label="缴款状态" prop="paymentStatus">
        <el-select
          v-model="queryParams.paymentStatus"
          placeholder="请选择缴款状态"
          clearable
          style="width: 200px"
        >
          <el-option label="部缴" value="部缴" />
          <el-option label="完成" value="完成" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="deductionList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="操作" align="center" width="100" fixed="left">
        <template v-slot:default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleDeduction(scope.row)"
          >
            扣款处理
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="180" :show-overflow-tooltip="true"/>
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" min-width="160" :show-overflow-tooltip="true"/>
      <el-table-column label="责任人" align="center" prop="responsiblePerson" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="责任类型" align="center" prop="responsibilityType" min-width="100">
        <template v-slot:default="scope">
          <el-tag :type="getResponsibilityTypeTag(scope.row.responsibilityType)">
            {{ scope.row.responsibilityType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="定责状态" align="center" prop="determinationStatus" min-width="100">
        <template v-slot:default="scope">
          <el-tag :type="getStatusTag(scope.row.determinationStatus)">
            {{ getStatusText(scope.row.determinationStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="责任本金" align="center" prop="responsibilityAmount" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.responsibilityAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="应缴" align="center" prop="payableRiskFund" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.payableRiskFund || 0, 2) }}
        </template>
      </el-table-column>

      <el-table-column label="实缴" align="center" prop="actualRiskFund" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.actualRiskFund || 0, 2) }}
        </template>
      </el-table-column>

      <el-table-column label="个人账户余额" align="center" prop="balance" min-width="140">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.balance || 0, 2) }}
        </template>
      </el-table-column>
      
      
      
      <!-- <el-table-column label="认责时间" align="center" prop="acknowledgmentTime" min-width="120">
        <template v-slot:default="scope">
          {{ scope.row.acknowledgmentTime ? parseTime(scope.row.acknowledgmentTime, '{y}-{m}-{d}') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="认责意见" align="center" prop="acknowledgmentOpinion" min-width="100">
        <template v-slot:default="scope">
          {{ scope.row.acknowledgmentOpinion || '-' }}
        </template>
      </el-table-column>
      
      <el-table-column label="已退" align="center" prop="refunded" min-width="120">
        <template v-slot:default="scope">
          {{ parseFloat(scope.row.refunded || 0).toFixed(2) }}
        </template>
      </el-table-column>
    
      <el-table-column label="免责标志" align="center" prop="exemptionFlag" min-width="100">
        <template v-slot:default="scope">
          {{ scope.row.exemptionFlag || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="缴款状态" align="center" prop="paymentStatus" min-width="100">
        <template v-slot:default="scope">
          <el-tag :type="getPaymentStatusTag(scope.row.paymentStatus)">
            {{ scope.row.paymentStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remarks" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="创建人" align="center" prop="createBy" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="创建日期" align="center" prop="createTime" min-width="120">
        <template v-slot:default="scope">
          {{ scope.row.createTime ? parseTime(scope.row.createTime, '{y}-{m}-{d}') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" prop="updateBy" min-width="100" :show-overflow-tooltip="true">
        <template v-slot:default="scope">
          {{ scope.row.updateBy || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="更新日期" align="center" prop="updateTime" min-width="120">
        <template v-slot:default="scope">
          {{ scope.row.updateTime ? parseTime(scope.row.updateTime, '{y}-{m}-{d}') : '-' }}
        </template>
      </el-table-column> -->
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 扣款处理弹窗 -->
    <el-dialog
      v-model="deductionDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      destroy-on-close
      draggable
      class="deduction-dialog"
    >
      <template #header>
        <div style="color: #f56c6c; font-weight: bold; font-size: 16px;">责任人扣款处理</div>
      </template>
      <el-form
        ref="deductionFormRef"
        :model="deductionForm"
        :rules="deductionRules"
        label-width="110px"
        class="deduction-form"
      >
        <el-form-item label="个人账户名称" prop="accountName">
          <el-input
            v-model="deductionForm.accountName"
            disabled
          />
        </el-form-item>
        <el-form-item label="个人账户余额" prop="accountBalance">
          <el-input
            :value="formatMoney(deductionForm.accountBalance || 0, 2)"
            disabled
          />
        </el-form-item>
        <el-form-item label="应缴金额" prop="payableAmount">
          <el-input
            :value="formatMoney(deductionForm.payableAmount || 0, 2)"
            disabled
          />
        </el-form-item>
        <el-form-item label="已缴金额" prop="paidAmount">
          <el-input
            :value="formatMoney(deductionForm.paidAmount || 0, 2)"
            disabled
          />
        </el-form-item>
        <el-form-item label="欠缴金额" prop="dueAmount">
          <el-input
            :value="formatMoney(deductionForm.dueAmount || 0, 2)"
            disabled
          />
        </el-form-item>
        <el-form-item label="本次扣款金额" prop="deductionAmount">
          <el-input-number
            v-model="deductionForm.deductionAmount"
            :min="0"
            :precision="2"
            :max="parseFloat(deductionForm.dueAmount || 0)"
            style="width: 100%"
            placeholder="请输入本次扣款金额"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="deductionForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div  style="text-align: center; padding-top: 0px;">
          <el-button type="primary" @click="handleSubmitDeduction" :loading="submitLoading" size="default" style="min-width: 100px; margin: 0 8px;">
            提交
          </el-button>
          <el-button @click="deductionDialogVisible = false" size="default" style="min-width: 100px; margin: 0 8px;">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRiskFundDedution } from '@/api/szhl/badLoanManage/responsibility'
import { listUser } from '@/api/system/user'
import { getPersonalAccountBalance } from '@/api/szhl/badLoanManage/personalAccount'
import { deductRiskFund } from '@/api/szhl/badLoanManage/personalAccount'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const deductionList = ref([])
const selectedRows = ref([])
const userList = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerName: '',
  customerNo: '',
  responsiblePerson: '',
  determinationStatus: '',
  paymentStatus: ''
})

// 表单引用
const table = ref(null)
const deductionFormRef = ref(null)

// 扣款弹窗相关
const deductionDialogVisible = ref(false)
const submitLoading = ref(false)
const deductionForm = reactive({
  id: null,
  accountNumber: '',
  accountName: '',
  accountBalance: '',
  payableAmount: '',
  paidAmount: '',
  dueAmount: '',
  deductionAmount: null,
  contractNo: '',
  customerNo: '',
  customerName: '',
  customerCode: '',
  remarks: ''
})

// 扣款表单验证规则
const deductionRules = {
  deductionAmount: [
    { required: true, message: '请输入本次扣款金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入本次扣款金额'))
        } else if (value <= 0) {
          callback(new Error('扣款金额必须大于0'))
        } else if (value > parseFloat(deductionForm.dueAmount || 0)) {
          callback(new Error('扣款金额不能超过欠缴金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取责任类型标签类型
function getResponsibilityTypeTag(type) {
  const typeMap = {
    '主调查': 'danger',
    '副调查': 'warning',
    '审查': 'info',
    '审批': 'success',
    '附加': ''
  }
  return typeMap[type] || 'info'
}

// 获取状态标签类型
function getStatusTag(status) {
  const statusMap = {
    'NOT_DETERMINED': 'info',
    'INITIAL': 'warning',
    'OBJECTION': 'danger',
    'REVIEW': 'success',
    'DIRECT_REPORT': 'primary',
    'COMPLETED': 'success'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
function getStatusText(status) {
   //定责状态
   const determinationStatusMap = {
    'NOT_DETERMINED': '未定责',
    'INITIAL': '初分',
    'OBJECTION':'异议',
    'REVIEW': '核对',
    'COMPLETED': '完成'
  }
  return determinationStatusMap[status] || '初分'
}

// 获取缴款状态标签
function getPaymentStatusTag(status) {
  const map = {
    '部缴': 'warning',
    '完成': 'success'
  }
  return map[status] || ''
}

// 获取用户列表
async function loadUserList() {
  try {
    const response = await listUser({ pageSize: 1000 })
    if (response.code === 200) {
      userList.value = response.rows || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取列表数据
function getList() {
  loading.value = true;
  queryParams.determinationStatus = 'COMPLETED'
  getRiskFundDedution(queryParams).then(response => {
    if (response.code === 200) {
      deductionList.value = response.rows || []
      total.value = response.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
      deductionList.value = []
      total.value = 0
    }
  }).catch(error => {
    console.error('获取风险金扣款列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    deductionList.value = []
    total.value = 0
  }).finally(() => {
    loading.value = false
  })
}

// 查询操作
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery()
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedRows.value = selection
}

// 打开扣款处理弹窗
async function handleDeduction(row) {
  try {
    // 根据责任人名称查找对应的用户，获取账户号
    // const user = userList.value.find(u => u.nickName === row.responsiblePerson)
    // if (!user) {
    //   ElMessage.error('未找到责任人对应的账户信息')
    //   return
    // }
    
    const accountNumber = row.responsiblePerson
    // 获取个人账户余额信息
    const balanceResponse = await getPersonalAccountBalance(accountNumber)
    if (balanceResponse.code !== 200) {
      ElMessage.error('获取个人账户信息失败')
      return
    }
    
    const accountInfo = balanceResponse.data || {}
    
    // 填充表单数据
    deductionForm.id = row.id
    deductionForm.accountNumber = accountNumber
    deductionForm.accountName = accountInfo.accountName || row.responsiblePerson
    deductionForm.accountBalance = parseFloat(accountInfo.accountBalance || 0).toFixed(2)
    deductionForm.payableAmount = parseFloat(row.payableRiskFund || 0).toFixed(2)
    deductionForm.paidAmount = parseFloat(row.actualRiskFund || 0).toFixed(2)
    const dueAmount = parseFloat(deductionForm.payableAmount) - parseFloat(deductionForm.paidAmount)
    deductionForm.dueAmount = dueAmount > 0 ? dueAmount.toFixed(2) : '0.00'
    deductionForm.deductionAmount = null
    deductionForm.contractNo = row.contractNo || ''
    deductionForm.customerNo = row.customerNo || ''
    deductionForm.customerName = row.customerName || ''
    deductionForm.customerCode = row.customerCode || ''
    deductionForm.remarks = ''
    
    deductionDialogVisible.value = true
  } catch (error) {
    console.error('打开扣款弹窗失败:', error)
    ElMessage.error('获取账户信息失败，请稍后重试')
  }
}

// 提交扣款
async function handleSubmitDeduction() {
  if (!deductionFormRef.value) return
  
  await deductionFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (!deductionForm.deductionAmount || deductionForm.deductionAmount <= 0) {
      ElMessage.warning('请输入有效的扣款金额')
      return
    }
    
    if (parseFloat(deductionForm.deductionAmount) > parseFloat(deductionForm.dueAmount)) {
      ElMessage.warning('扣款金额不能超过欠缴金额')
      return
    }
    
    try {
      await ElMessageBox.confirm(
        `确认扣款 ${deductionForm.deductionAmount} 元？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      submitLoading.value = true
      const response = await deductRiskFund({
        id: deductionForm.id,
        accountNumber: deductionForm.accountNumber,
        accountName: deductionForm.accountName,
        debitAmount: deductionForm.deductionAmount, // 扣款金额使用借方金额字段
        contractNo: deductionForm.contractNo,
        customerNo: deductionForm.customerNo,
        customerName: deductionForm.customerName,
        customerCode: deductionForm.customerCode,
        remarks: deductionForm.remarks
      })
      
      if (response.code === 200) {
        ElMessage.success('扣款成功')
        deductionDialogVisible.value = false
        getList() // 刷新列表
      } else {
        ElMessage.error(response.msg || '扣款失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        // console.error('扣款失败:', error)
        // ElMessage.error(error.msg || '扣款失败，请稍后重试')
      }
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  loadUserList()
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

/* 扣款弹窗样式优化 */
.deduction-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.deduction-dialog :deep(.el-dialog__body) {
  padding: 20px 20px 10px;
}

.deduction-dialog :deep(.el-dialog__footer) {
  padding: 15px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

.deduction-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.deduction-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.deduction-form :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: not-allowed;
}

.deduction-form :deep(.el-input__inner) {
  font-size: 14px;
}

.deduction-form :deep(.el-textarea__inner) {
  font-size: 14px;
}

.deduction-form :deep(.el-input-number) {
  width: 100%;
}

.deduction-form :deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>

