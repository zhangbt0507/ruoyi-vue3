<template>
  <el-dialog
    title="个人账户账务处理---复核"
    v-model="dialogVisible"
    width="400px"
    append-to-body
    @close="handleClose"
  >
    <div class="review-dialog-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="记账日期" prop="bookingDate">
        <el-input
          v-model="form.bookingDate"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="户名" prop="accountName">
          <el-input
            v-model="form.accountName"
            :disabled="true"
          />
          <!-- <el-icon :size="20" style="color: #409eff; cursor: pointer;" @click="handleAccountInfo">
            <User />
          </el-icon> -->
      </el-form-item>
      <el-form-item label="账号" prop="accountNumber">
        <el-input
          v-model="form.accountNumber"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-input
          v-model="form.summary"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="发生额" prop="transactionAmount">
        <el-input
          v-model="form.transactionAmount"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="账户余额" prop="balance">
        <el-input
          v-model="form.balance"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="2"
          :disabled="true"
        />
      </el-form-item>
    </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleApprove">通过</el-button>
        <el-button type="danger" @click="handleInvalidate">作废</el-button>
        <el-button @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getPersonalAccountStatement,
  approvePersonalAccountStatement,
  invalidatePersonalAccountStatement
} from '@/api/szhl/badLoanManage/personalAccountStatement'
import { parseTime } from '@/utils/ruoyi'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  recordId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  bookingDate: '',
  accountName: '',
  accountNumber: '',
  summary: '',
  transactionAmount: '',
  balance: 0,
  remarks: ''
})

const rules = {
  bookingDate: [{ required: true, message: '记账日期不能为空', trigger: 'blur' }],
  accountName: [{ required: true, message: '户名不能为空', trigger: 'blur' }],
  accountNumber: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  summary: [{ required: true, message: '摘要不能为空', trigger: 'blur' }],
  transactionAmount: [{ required: true, message: '发生额不能为空', trigger: 'blur' }]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.recordId) {
    loadDetail()
  }
})

// 监听 dialogVisible 变化，同步到父组件
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 加载详情数据
async function loadDetail() {
  if (!props.recordId) {
    ElMessage.error('记录ID不能为空')
    return
  }
  
  try {
    const response = await getPersonalAccountStatement(props.recordId)
    if (response.code === 200 && response.data) {
      const data = response.data
      
      // 格式化记账日期
      form.bookingDate = data.bookingDate ? parseTime(data.bookingDate, '{y}-{m}-{d}') : ''
      form.accountName = data.accountName || ''
      form.accountNumber = data.accountNumber || ''
      form.summary = data.summary || ''
      
      // 格式化发生额（借方显示负数，贷方显示正数）
      if (data.debitAmount && parseFloat(data.debitAmount) > 0) {
        form.transactionAmount = `-${parseFloat(data.debitAmount).toFixed(2)}`
      } else if (data.creditAmount && parseFloat(data.creditAmount) > 0) {
        form.transactionAmount = `+${parseFloat(data.creditAmount).toFixed(2)}`
      } else {
        form.transactionAmount = ''
      }
      
      form.balance = data.balance ? parseFloat(data.balance).toFixed(2) : 0
      form.remarks = data.remarks || ''
    } else {
      ElMessage.error(response.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败，请稍后重试')
  }
}

// 处理账户信息查看
function handleAccountInfo() {
  // TODO: 实现账户信息查看功能
  ElMessage.info('账户信息查看功能待实现')
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
function resetForm() {
  Object.assign(form, {
    bookingDate: '',
    accountName: '',
    accountNumber: '',
    summary: '',
    transactionAmount: '',
    balance: 0,
    remarks: '',
  })
  formRef.value?.clearValidate()
}

// 处理通过操作
function handleApprove() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return

    ElMessageBox.confirm(
      '确认通过该条记录吗？',
      '通过确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const submitData = {
        id: props.recordId,
        reviewStatus: '已复核',
        reviewResult: '通过',
        summary: form.summary,
        remarks: form.remarks,
      }
      
      approvePersonalAccountStatement(submitData).then(response => {
        if (response.code === 200) {
          ElMessage.success('复核通过成功')
          emit('success')
          handleClose()
        } else {
          ElMessage.error(response.msg || '复核通过失败')
        }
      }).catch(error => {
        console.error('复核通过失败:', error)
        ElMessage.error('复核通过失败，请稍后重试')
      })
    }).catch(() => {
      // 用户取消操作
    })
  })
}

// 处理作废操作
function handleInvalidate() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return

    ElMessageBox.confirm(
      '确认作废该条记录吗？',
      '作废确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const submitData = {
        id: props.recordId,
        reviewStatus: '已复核',
        reviewResult: '作废'
      }
      
      invalidatePersonalAccountStatement(submitData).then(response => {
        if (response.code === 200) {
          ElMessage.success('作废成功')
          emit('success')
          handleClose()
        } else {
          ElMessage.error(response.msg || '作废失败')
        }
      }).catch(error => {
        console.error('作废失败:', error)
        ElMessage.error('作废失败，请稍后重试')
      })
    }).catch(() => {
      // 用户取消操作
    })
  })
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.review-dialog-form {
  max-width: 420px;
  margin: 0 auto;
}

.review-dialog-form :deep(.el-input),
.review-dialog-form :deep(.el-textarea) {
  width: 100%;
}
</style>

