<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="合同号" prop="contractNo">
        <el-input
          v-model="queryParams.contractNo"
          placeholder="请输入合同号"
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
          style="width: 220px"
        >
          <el-option
            v-for="user in userList"
            :key="user.userName"
            :label="`${user.nickName || ''}（${user.userName}）`"
            :value="user.userName"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      ref="table"
      v-loading="loading"
      :data="refundList"
    >
      <el-table-column label="操作" align="center" width="80" fixed="left">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleRefund(scope.row)"
            :disabled="(Number(scope.row.payableRiskFund || 0) >  Number(scope.row.actualRiskFund || 0))
                || getRefundableAmount(scope.row) <=0"
            :style="{color: (((Number(scope.row.payableRiskFund || 0) >  Number(scope.row.actualRiskFund || 0)) 
                || getRefundableAmount(scope.row) <=0) ? '#ccc' : '')}"
          >
            退缴
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="责任人" prop="nickName" min-width="140" :show-overflow-tooltip="true" align="center">
        <template #default="scope">
          {{ (scope.row.nickName)+"("+scope.row.responsiblePerson+")" }}
        </template>
      </el-table-column>
      <el-table-column label="责任类型" prop="responsibilityType" min-width="100" align="center">
        <template v-slot:default="scope">
          <el-tag :type="getResponsibilityTypeTag(scope.row.responsibilityType)">
            {{ scope.row.responsibilityType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="责任比(%)" min-width="100" align="center">
        <template #default="scope">
          {{ Number(scope.row.responsibilityRatio || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="合同号" prop="contractNo" min-width="160" :show-overflow-tooltip="true" align="center"/>
      <el-table-column label="客户名称" prop="customerName" min-width="120" :show-overflow-tooltip="true" align="center"/>
      <el-table-column label="建档责任金额" min-width="110" align="center">
        <template #default="scope" >
          {{ formatMoney(scope.row.responsibilityAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="当前责任余额" min-width="110" align="center">
        <template #default="scope">
          {{ formatMoney(getCurrentResponsibility(scope.row), 2) }}
        </template>
      </el-table-column>
      <el-table-column label="收回责任金额" min-width="110" align="center">
        <template #default="scope">
          {{ formatMoney(getRecoveryAmount(scope.row), 2) }}
        </template>
      </el-table-column>
      <el-table-column label="收回比例" min-width="110" align="center">
        <template #default="scope">
          {{ formatRecoveryRatio(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="应缴" min-width="100" align="center">
        <template #default="scope">
          {{ formatMoney(scope.row.payableRiskFund || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="实缴" min-width="100" align="center">
        <template #default="scope">
          {{ formatMoney(scope.row.actualRiskFund || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="已退" min-width="100" align="center">
        <template #default="scope">
          {{ formatMoney(scope.row.returnedRiskFund || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="可退金额" min-width="100" align="center">
        <template #default="scope">
          <span :class="['refundable-cell', getRefundableAmount(scope.row) <= 0 ? 'disabled' : '']">
            {{ formatMoney(getRefundableAmount(scope.row), 2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="个账余额" min-width="100" align="center">
        <template #default="scope">
          {{ formatMoney(scope.row.balance || 0, 2) }}
        </template>
      </el-table-column>

      
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      v-model="refundDialogVisible"
      width="550px"
      :close-on-click-modal="false"
      destroy-on-close
      draggable
      class="refund-dialog"
    >
      <template #header>
        <div style="font-weight: bold; font-size: 16px; color: #409eff;">风险金退缴操作</div>
      </template>
      <el-form
        ref="refundFormRef"
        :model="refundForm"
        :rules="refundRules"
        label-width="110px"
        class="refund-form"
      >
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="责任人">
              <el-input v-model="refundForm.responsiblePerson" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个账余额">
              <el-input :value="formatMoney(refundForm.accountBalance || 0, 2)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="15">
          <el-col :span="11">
            <el-form-item label="客户名称">
              <el-input v-model="refundForm.customerName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="13">
            <el-form-item label="合同号">
              <el-input v-model="refundForm.contractNo" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="建档责任金额">
              <el-input :value="formatMoney(refundForm.responsibilityAmount || 0, 2)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前责任余额">
              <el-input :value="formatMoney(refundForm.currentResponsibility || 0, 2)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="实缴">
              <el-input :value="formatMoney(refundForm.actualRiskFund || 0, 2)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已退">
              <el-input :value="formatMoney(refundForm.returnedRiskFund || 0, 2)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="可退金额">
          <el-input :value="formatMoney(refundForm.refundableAmount || 0, 2)" disabled class="highlight-input" />
        </el-form-item>
        <el-form-item label="本次退缴金额" prop="refundAmount">
          <el-input-number
            v-model="refundForm.refundAmount"
            :min="0"
            :precision="2"
            :max="Number(refundForm.refundableAmount || 0)"
            style="width: 100%"
            placeholder="请输入本次退缴金额"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="refundForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center; padding-top: 0px;">
          <el-button type="primary" :loading="submitLoading" @click="handleSubmitRefund" size="default" style="min-width: 100px; margin: 0 8px;">退缴</el-button>
          <el-button @click="refundDialogVisible = false" size="default" style="min-width: 100px; margin: 0 8px;">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRiskFundList, refundRiskFund } from '@/api/szhl/badLoanManage/responsibility'
import { listUser } from '@/api/system/user'
import { getPersonalAccountBalance } from '@/api/szhl/badLoanManage/personalAccount'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const refundList = ref([])
const userList = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerName: '',
  contractNo: '',
  responsiblePerson: '',
  refundableOnly: true
})

const queryFormRef = ref(null)
const table = ref(null)
const refundFormRef = ref(null)

const refundDialogVisible = ref(false)
const submitLoading = ref(false)
const refundForm = reactive({
  id: null,
  responsiblePerson: '',
  customerName: '',
  contractNo: '',
  responsibilityAmount: '',
  currentResponsibility: '',
  actualRiskFund: '',
  returnedRiskFund: '',
  refundableAmount: '',
  accountNumber: '',
  accountName: '',
  accountBalance: '',
  refundAmount: null,
  remarks: ''
})

const refundRules = {
  refundAmount: [
    { required: true, message: '请输入本次退缴金额', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const maxAmount = Number(refundForm.refundableAmount || 0)
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入本次退缴金额'))
        } else if (value <= 0) {
          callback(new Error('退缴金额必须大于0'))
        } else if (value > maxAmount) {
          callback(new Error('退缴金额不能超过可退金额'))
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

function formatAmount(value) {
  const number = Number(value || 0)
  return number.toFixed(2)
}

function getCurrentResponsibility(row) {
  const currentBalance = Number(row.currentBalance || 0)
  const ratio = Number(row.responsibilityRatio || 0) * 0.01
  const amount = currentBalance * ratio
  return amount > 0 ? amount : 0
}

function getRecoveryAmount(row) {
  const responsibilityAmount = Number(row.responsibilityAmount || 0)
  const currentResponsibility = getCurrentResponsibility(row)
  const recovered = responsibilityAmount - currentResponsibility
  return recovered > 0 ? recovered : 0
}

function getRecoveryRatio(row) {
  const responsibilityAmount = Number(row.responsibilityAmount || 0)
  if (responsibilityAmount <= 0) {
    return 0
  }
  const recoveryAmount = getRecoveryAmount(row)
  const ratio = recoveryAmount / responsibilityAmount
  return ratio > 0 ? ratio : 0
}

function formatRecoveryRatio(row) {
  const ratio = getRecoveryRatio(row)
  if (ratio <= 0) {
    return '0'
  }
  return `${formatAmount(ratio * 100)}%`
}

function getRefundableAmount(row) {
  const payable = Number(row.payableRiskFund || 0)
  const returned = Number(row.returnedRiskFund || 0)
  const ratio = getRecoveryRatio(row)
  const amount = payable * ratio - returned
  return amount > 0 ? amount : 0
}

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

function getList() {
  loading.value = true
  getRiskFundList(queryParams)
    .then((response) => {
      if (response.code === 200) {
        refundList.value = response.rows || []
        total.value = response.total || 0
      } else {
        ElMessage.error(response.msg || '获取数据失败')
      }
    })
    .catch(() => {
      ElMessage.error('获取数据失败，请稍后重试')
    })
    .finally(() => {
      loading.value = false
    })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryFormRef");
  // queryFormRef.value?.resetFields()
  queryParams.refundableOnly = true
  handleQuery()
}

async function handleRefund(row) {
  const refundableAmount = getRefundableAmount(row)
  if (refundableAmount <= 0) {
    ElMessage.warning('该责任记录暂无可退金额')
    return
  }

  const payable = Number(row.payableRiskFund || 0)
  const actual = Number(row.actualRiskFund || 0)
  if (payable < actual) {
    ElMessage.error('实缴金额不能大于应缴金额，无法退缴')
    return
  }

  const accountNumber = row.responsiblePerson
  if (!accountNumber) {
    ElMessage.error('未找到责任人账号信息')
    return
  }

  try {
    const balanceResponse = await getPersonalAccountBalance(accountNumber)
    if (balanceResponse.code !== 200) {
      ElMessage.error('获取个人账户信息失败')
      return
    }
    const accountInfo = balanceResponse.data || {}

    refundForm.id = row.id
    refundForm.responsiblePerson = row.responsiblePerson || ''
    refundForm.customerName = row.customerName || ''
    refundForm.contractNo = row.contractNo || ''
    refundForm.responsibilityAmount = formatAmount(row.responsibilityAmount)
    refundForm.currentResponsibility = formatAmount(getCurrentResponsibility(row))
    refundForm.actualRiskFund = formatAmount(row.actualRiskFund)
    refundForm.returnedRiskFund = formatAmount(row.returnedRiskFund)
    refundForm.refundableAmount = formatAmount(refundableAmount)
    refundForm.accountNumber = accountNumber
    refundForm.accountName = accountInfo.accountName || row.responsiblePerson || ''
    refundForm.accountBalance = formatAmount(accountInfo.accountBalance)
    refundForm.refundAmount = null
    refundForm.remarks = row.responsibilityType + "责任退款"

    refundDialogVisible.value = true
  } catch (error) {
    console.error('打开退缴弹窗失败:', error)
    ElMessage.error('获取账户信息失败，请稍后重试')
  }
}

function handleSubmitRefund() {
  if (!refundFormRef.value) return
  refundFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await ElMessageBox.confirm(
        `确认退缴 ${refundForm.refundAmount} 元?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      submitLoading.value = true
      const response = await refundRiskFund({
        responsibilityId: refundForm.id,
        refundAmount: refundForm.refundAmount,
        remarks: refundForm.remarks
      })

      if (response.code === 200) {
        ElMessage.success('退缴成功')
        refundDialogVisible.value = false
        getList()
      } else {
        ElMessage.error(response.msg || '退缴失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退缴失败:', error)
        ElMessage.error(error.msg || '退缴失败，请稍后重试')
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
.refundable-cell {
  font-weight: 600;
  color: #d9001b;
}
.refundable-cell.disabled {
  color: #909399;
}
.highlight-input :deep(.el-input__inner) {
  color: #606266;
  background-color: #e6f7ff;
  font-weight: 600;
}

/* 退缴弹窗样式优化 */
.refund-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.refund-dialog :deep(.el-dialog__body) {
  padding: 20px 20px 10px;
}

.refund-dialog :deep(.el-dialog__footer) {
  padding: 15px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

.refund-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.refund-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.refund-form :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: not-allowed;
}

.refund-form :deep(.el-input__inner) {
  font-size: 14px;
}

.refund-form :deep(.el-textarea__inner) {
  font-size: 14px;
}

.refund-form :deep(.el-input-number) {
  width: 100%;
}

.refund-form :deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>

