<template>
  <el-dialog title="机构调整" v-model="visible" width="620px" append-to-body>
    <el-form :model="disputeForm" label-width="110px">
      <el-form-item label="调整类型">
        <el-radio-group v-model="disputeForm.disputeType" @change="disputeForm.newOrg = undefined">
          <el-radio-button label="调入">调入</el-radio-button>
          <el-radio-button label="调出">调出</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="客户名称">
        <el-input v-model="disputeForm.customerName" disabled />
      </el-form-item>
      <el-form-item label="客户号">
        <el-input v-model="disputeForm.customerNo" disabled />
      </el-form-item>
      <el-form-item label="原管户机构">
        <dict-tag :options="orgOptions" :value="disputeForm.originalOrg" />
      </el-form-item>
      <el-form-item label="新管户机构">
        <el-select v-model="disputeForm.newOrg" placeholder="请选择新管户机构" filterable style="width: 100%">
          <el-option v-for="item in disputeOrgOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="调整理由">
        <el-input v-model="disputeForm.reason" type="textarea" :rows="4" placeholder="请输入调整理由" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitDispute">上报</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { createDispute, listTransferInOrgs } from '@/api/szhl/crm/dispute'

const props = defineProps({
  orgOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['success'])
const { proxy } = getCurrentInstance()

const visible = ref(false)
const disputeForm = ref({})
// 当前及辖属机构号（调入时新管户机构仅限该范围），null 表示未加载
const transferInOrgs = ref(null)
const disputeOrgOptions = computed(() => {
  const options = props.orgOptions || []
  if (disputeForm.value.disputeType !== '调入') return options
  const allowed = transferInOrgs.value || []
  return options.filter(item => allowed.includes(item.value))
})

function open (row) {
  disputeForm.value = {
    customerId: row.customerId,
    disputeType: '调入',
    customerName: row.customerName,
    customerNo: row.customerNo,
    originalOrg: row.attributionOrg,
    newOrg: undefined,
    reason: ''
  }
  visible.value = true
  if (transferInOrgs.value === null) {
    listTransferInOrgs().then(res => {
      transferInOrgs.value = res.data || []
    })
  }
}

function submitDispute () {
  if (!disputeForm.value.disputeType) {
    proxy.$modal.msgWarning('请选择调整类型')
    return
  }
  if (!disputeForm.value.newOrg) {
    proxy.$modal.msgWarning('请选择新管户机构')
    return
  }
  createDispute({
    customerId: disputeForm.value.customerId,
    disputeType: disputeForm.value.disputeType,
    newOrg: disputeForm.value.newOrg,
    reason: disputeForm.value.reason
  }).then(() => {
    visible.value = false
    if (!disputeForm.value.originalOrg) {
      proxy.$modal.msgSuccess('无原归属机构，已直接调整归属机构')
      emit('success')
    } else {
      proxy.$modal.msgSuccess('机构调整申请已发起')
    }
  })
}

defineExpose({ open })
</script>
