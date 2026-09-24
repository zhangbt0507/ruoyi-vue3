<template>
  <el-dialog
    title="个人账户记账操作"
    v-model="dialogVisible"
    width="500px"
    append-to-body
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="记账日期" prop="bookingDate">
        <el-date-picker
          v-model="form.bookingDate"
          type="date"
          placeholder="选择记账日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="账号/户名" prop="accountNumber">
        <div style="display: flex; gap: 10px; width: 100%;">
          <el-select
            v-model="form.accountNumber"
            placeholder="请选择户名"
            style="flex: 1;"
            filterable
            @change="handleAccountNameChange"
          >
            <el-option
              v-for="user in userList"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
          <div style="display: flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="color: #606266; font-size: 14px;">可用余额</span>
            <el-input
              :value="formatBalance(form.availableBalance)"
              style="width: 120px;"
              :disabled="true"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-select
          v-model="form.summary"
          placeholder="请选择摘要"
          style="width: 100%"
          @change="handleSummaryChange"
        >
          <el-option label="初始化(+)" value="初始化(+)" />
          <el-option label="存入(+)" value="存入(+)" />
          <el-option label="支取(-)" value="支取(-)" />
          <el-option label="充营业外(-)" value="充营业外(-)" />
        </el-select>
      </el-form-item>
      <el-form-item label="发生额" prop="transactionAmount">
        <el-input-number
          v-model="form.transactionAmount"
          placeholder="请输入发生额"
          :precision="2"
          :min="0.01"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" size="default">保存</el-button>
        <el-button @click="handleClose" size="default">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { queryAllUser } from '@/api/system/user'
import { addPersonalAccountStatement } from '@/api/szhl/badLoanManage/personalAccountStatement'
import { getPersonalAccountBalance } from '@/api/szhl/badLoanManage/personalAccount'
import { formatMoney } from '@/utils/ruoyi'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = ref(false)
const formRef = ref(null)
const userList = ref([])

// 获取当天日期
function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化余额显示（使用千分位）
function formatBalance(value) {
  if (value === null || value === undefined || value === '') {
    return '0.00'
  }
  return formatMoney(value, 2)
}

const form = reactive({
  bookingDate: getTodayDate(), // 默认为当天
  accountName: '',
  accountNumber: '',
  summary: '初始化(+)',
  availableBalance: 0, // 默认为0
  transactionAmount: null,
  remarks: ''
})

// 自定义验证规则：发生额必须大于0
const validateTransactionAmount = (rule, value, callback) => {
  if (!value || value <= 0) {
    callback(new Error('发生额必须大于0'))
  } else {
    // 如果选择支取或冲营业外，需要验证发生额不能大于可用余额
    if (form.summary.includes("-")) {
      const availableBalance = parseFloat(form.availableBalance) || 0
      if (value > availableBalance) {
        callback(new Error(`发生额不能大于可用余额(${formatBalance(availableBalance)})`))
      } else {
        callback()
      }
    } else {
      callback()
    }
  }
}

const rules = {
  bookingDate: [
    { required: true, message: '记账日期不能为空', trigger: 'change' }
  ],
  accountName: [
    { required: true, message: '户名不能为空', trigger: 'change' }
  ],
  accountNumber: [
    { required: true, message: '账号不能为空', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '摘要不能为空', trigger: 'change' }
  ],
  transactionAmount: [
    { required: true, message: '发生额不能为空', trigger: 'blur' },
    { validator: validateTransactionAmount, trigger: 'blur' }
  ]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    resetForm()
  }
})

// 监听 dialogVisible 变化，同步到父组件
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 获取用户列表
async function loadUserList() {
  try {
    const res = await queryAllUser()
    if (res.code === 200) {
      userList.value = res.data.map(user => ({
        label: `${user.nickName}（${user.userName}）`, // 显示姓名和工号
        value: user.userName, 
        nickName: user.nickName
      }))
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 户名选择变化时，自动填充账号（工号）并查询余额
async function handleAccountNameChange(value) {
  const selectedUser = userList.value.find(user => user.value === value)
  if (selectedUser) {
    // form.accountNumber = selectedUser.value || ''
    form.accountName = selectedUser.nickName || ''
    // 根据账号查询余额
    if (selectedUser.value) {
      try {
        const response = await getPersonalAccountBalance(selectedUser.value)
        if (response.code === 200 && response.data) {
          // 回显可用余额，如果没有数据则默认为0
          form.availableBalance = response.data.accountBalance || 0
        } else {
          form.availableBalance = 0
        }
      } catch (error) {
        console.error('查询余额失败:', error)
        form.availableBalance = 0
      }
    } else {
      form.availableBalance = 0
    }
  } else {
    form.accountNumber = ''
    form.availableBalance = 0
  }
  // 清空发生额，重新验证
  form.transactionAmount = null
  formRef.value?.clearValidate('transactionAmount')
}

// 摘要变化时，重新验证发生额
function handleSummaryChange() {
  // 如果发生额已填写，重新验证
  if (form.transactionAmount) {
    formRef.value?.validateField('transactionAmount')
  }
}

// 重置表单
function resetForm() {
  Object.assign(form, {
    bookingDate: getTodayDate(), // 默认为当天
    accountName: '',
    accountNumber: '',
    summary: '',
    availableBalance: 0, // 默认为0
    transactionAmount: null,
    remarks: ''
  })
  formRef.value?.clearValidate()
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
function handleSubmit() {
  formRef.value.validate(valid => {
    if (valid) {
      // 构建提交数据，保存时只用 nickName（accountName）
      // 根据摘要类型，设置借方或贷方发生额
      const amount = Math.abs(form.transactionAmount || 0)
      let debitAmount = null
      let creditAmount = null
      
      if (form.summary.includes("+")) {
        // 存入(+) 对应贷方发生额
        creditAmount = amount
        debitAmount = 0
      } else {
        // 支取(-)、冲销(-)等对应借方发生额
        debitAmount = amount
        creditAmount = 0
      }
      
      const submitData = {
        bookingDate: form.bookingDate,
        accountName: form.accountName, // 只保存 nickName
        accountNumber: form.accountNumber, // 工号
        summary: form.summary,
        debitAmount: debitAmount, // 借方发生额
        creditAmount: creditAmount, // 贷方发生额
        remarks: form.remarks,
        // 根据业务需要，可能需要添加其他字段
        // 例如：fundFlowDirection（资金流向）、customerNo、contractNo 等
      }
      
      addPersonalAccountStatement(submitData).then(response => {
        if (response.code === 200) {
          ElMessage.success('记账成功')
          emit('success')
          handleClose()
        } else {
          ElMessage.error(response.msg || '记账失败')
        }
      }).catch(error => {
        console.error('记账失败:', error)
        ElMessage.error('记账失败，请稍后重试')
      })
    }
  })
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.dialog-footer {
  text-align: center;
  padding-top: 0px;
}

.dialog-footer .el-button {
  min-width: 100px;
  margin: 0 10px;
}

/* 优化表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 18px;
}

/* 优化标签样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 优化输入框样式 */
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #606266;
}
</style>

