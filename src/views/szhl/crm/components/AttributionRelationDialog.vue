<template>
  <el-dialog title="关联维护" v-model="visible" width="760px" append-to-body>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openCustomerSelect">新增关联</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Star" :disabled="relationSingle" @click="handleSetMain">变为主客</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="relationSingle" @click="handleDelRelation">删除关联</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="UserFilled" :disabled="claimDisabled" @click="handleClaimRelation">批量认领</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="rows" @selection-change="selection = $event">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="主客" prop="mainCustomerFlag" width="100" align="center">
        <template #default="scope">{{ scope.row.mainCustomerFlag === '1' ? '主客' : '关联' }}</template>
      </el-table-column>
      <el-table-column label="客户名称" prop="customerName" width="160" show-overflow-tooltip />
      <el-table-column label="客户号" prop="customerNo" width="180" show-overflow-tooltip />
      <el-table-column label="客户内码" prop="customerId" width="150" show-overflow-tooltip />
      <el-table-column label="归属机构" prop="attributionOrg" width="120" align="center">
        <template #default="scope">
          <dict-tag :options="orgOptions" :value="scope.row.attributionOrg" />
        </template>
      </el-table-column>
      <el-table-column label="客户经理" prop="managerName" width="120" align="center">
        <template #default="scope">{{ formatManagerName(scope.row) }}</template>
      </el-table-column>
    </el-table>

    <AttributionCustomerSelectDialog ref="customerSelectRef" :org-options="orgOptions" @added="loadList" />
  </el-dialog>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { claimRelation, delRelation, listRelation, setMainCustomer } from '@/api/szhl/crm/attribution'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import AttributionCustomerSelectDialog from '@/views/szhl/crm/components/AttributionCustomerSelectDialog'

defineProps({
  orgOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['success'])
const { proxy } = getCurrentInstance()
const managerOptions = useUserOptions()

const visible = ref(false)
const loading = ref(false)
const rows = ref([])
const selection = ref([])
const current = ref({})
const customerSelectRef = ref()

const relationSingle = computed(() => selection.value.length !== 1)
const claimableRelations = computed(() => selection.value.filter(row => !row.attributionOrg))
const claimDisabled = computed(() => claimableRelations.value.length === 0)

function formatManagerName (row) {
  const manager = row.managerName || row.managerId
  return formatUserDisplayName(managerOptions.value, manager, '')
}

function open (row) {
  current.value = row
  visible.value = true
  loadList()
}

function loadList () {
  loading.value = true
  listRelation(current.value.customerId).then(res => {
    rows.value = res.data || []
  }).finally(() => {
    loading.value = false
  })
}

function openCustomerSelect () {
  customerSelectRef.value.open(current.value.customerId)
}

function handleSetMain () {
  const row = selection.value[0]
  setMainCustomer(row.customerId).then(() => {
    proxy.$modal.msgSuccess('已设置为主客')
    loadList()
  })
}

function handleDelRelation () {
  const row = selection.value[0]
  proxy.$modal.confirm(`是否确认将客户"${row.customerName}"移出关联组？`).then(() => {
    return delRelation(row.customerId)
  }).then(() => {
    proxy.$modal.msgSuccess('已删除关联')
    loadList()
  }).catch(() => {})
}

function handleClaimRelation () {
  const claimRows = claimableRelations.value
  const skipped = selection.value.length - claimRows.length
  const tip = skipped > 0
    ? `将认领 ${claimRows.length} 个管户机构为空的客户到本人所在机构，另有 ${skipped} 个已有管户机构的客户将跳过，是否继续？`
    : `是否确认将选中的 ${claimRows.length} 个客户认领到本人所在机构？`
  proxy.$modal.confirm(tip).then(() => {
    return claimRelation({
      customerId: current.value.customerId,
      customerIds: claimRows.map(row => row.customerId)
    })
  }).then(() => {
    proxy.$modal.msgSuccess('认领成功')
    loadList()
    emit('success')
  }).catch(() => {})
}

defineExpose({ open })
</script>
