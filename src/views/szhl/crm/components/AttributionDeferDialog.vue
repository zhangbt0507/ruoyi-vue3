<template>
  <el-dialog title="暂缓触达标识" v-model="visible" width="560px" append-to-body>
    <el-form :model="deferForm" label-width="100px">
      <el-form-item label="客户名称">
        <el-input v-model="deferForm.customerName" disabled />
      </el-form-item>
      <el-form-item label="客户号">
        <el-input v-model="deferForm.customerNo" disabled />
      </el-form-item>
      <el-form-item label="管户机构">
        <dict-tag :options="orgOptions" :value="deferForm.attributionOrg" />
      </el-form-item>
      <el-form-item label="暂缓期限">
        <el-date-picker v-model="deferForm.deferRange" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
      </el-form-item>
      <el-form-item label="暂缓理由">
        <el-input v-model="deferForm.reason" type="textarea" :rows="4" placeholder="请输入暂缓理由" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitDefer">上报</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { createDefer } from '@/api/szhl/crm/defer'

defineProps({
  orgOptions: { type: Array, default: () => [] }
})

const { proxy } = getCurrentInstance()

const visible = ref(false)
const deferForm = ref({})

function open (row) {
  deferForm.value = {
    customerId: row.customerId,
    customerName: row.customerName,
    customerNo: row.customerNo,
    attributionOrg: row.attributionOrg,
    deferRange: [],
    reason: ''
  }
  visible.value = true
}

function submitDefer () {
  const range = deferForm.value.deferRange || []
  if (range.length !== 2) {
    proxy.$modal.msgWarning('请选择暂缓期限')
    return
  }
  createDefer({
    customerId: deferForm.value.customerId,
    deferStart: range[0],
    deferEnd: range[1],
    reason: deferForm.value.reason
  }).then(() => {
    visible.value = false
    proxy.$modal.msgSuccess('暂缓触达申请已上报')
  })
}

defineExpose({ open })
</script>
