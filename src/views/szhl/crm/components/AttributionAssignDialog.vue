<template>
  <el-dialog title="客户分配到管户经理" v-model="visible" width="520px" append-to-body>
    <el-form :model="assignForm" label-width="110px">
      <el-form-item label="选择记录">
        <el-input :model-value="customerIds.length + ' 条'" disabled />
      </el-form-item>
      <el-form-item label="新管户经理">
        <UserSelect v-model="assignForm.managerId" scope="crmAssignable" placeholder="请选择可分配管户经理" />
      </el-form-item>
      <el-form-item label="分解原因">
        <el-input v-model="assignForm.reason" type="textarea" :rows="3" placeholder="请输入分解原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="confirmAssign">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { assignManager } from '@/api/szhl/crm/attribution'
import UserSelect from '@/components/UserSelect'

const emit = defineEmits(['success'])
const { proxy } = getCurrentInstance()

const visible = ref(false)
const assignForm = ref({ managerId: undefined, reason: '' })
const customerIds = ref([])

function open (rows) {
  customerIds.value = (rows || []).map(row => row.customerId)
  assignForm.value = { managerId: undefined, reason: '' }
  visible.value = true
}

function confirmAssign () {
  if (!assignForm.value.managerId) {
    proxy.$modal.msgWarning('请选择新管户经理')
    return
  }
  proxy.$modal.confirm('继续操作原管户经理将被替换为新管户经理，是否继续？').then(() => {
    return assignManager({
      customerIds: customerIds.value,
      managerId: assignForm.value.managerId,
      reason: assignForm.value.reason
    })
  }).then(() => {
    visible.value = false
    proxy.$modal.msgSuccess('管户分配已保存')
    emit('success')
  }).catch(() => {})
}

defineExpose({ open })
</script>
