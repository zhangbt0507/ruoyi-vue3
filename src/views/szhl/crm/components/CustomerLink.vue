<template>
  <el-tooltip v-if="displayValue" class="crm-customer-tooltip" :content="fullValue" placement="top">
    <el-link class="crm-customer-link" type="primary" :underline="false" @click="handleClick">
      {{ displayValue }}
    </el-link>
  </el-tooltip>
  <span v-else>{{ emptyText }}</span>

  <ContactFollowupTimelineDialog v-if="isTouchMode" ref="timelineDialogRef" />
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import ContactFollowupTimelineDialog from '@/views/szhl/crm/components/ContactFollowupTimelineDialog'
import { useCustomer360Nav } from '@/views/szhl/crm/composables/useCustomer360Nav'

const props = defineProps({
  row: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'name'
  },
  field: {
    type: String,
    default: ''
  },
  emptyText: {
    type: String,
    default: '-'
  }
})

const { proxy } = getCurrentInstance()
const { openViewByNo } = useCustomer360Nav()

const timelineDialogRef = ref()

const displayField = computed(() => props.field || (props.mode === 'no' ? 'customerNo' : 'customerName'))
const fullValue = computed(() => props.row && props.row[displayField.value])
const displayValue = computed(() => {
  return fullValue.value
})
const isTouchMode = computed(() => props.mode !== 'no')

function handleClick() {
  if (!isTouchMode.value) {
    openCustomer360()
    return
  }
  openCustomerTouchHistory()
}

function openCustomer360() {
  if (!props.row.customerNo) {
    proxy.$modal.msgWarning('未获取到客户号')
    return
  }
  openViewByNo(props.row.customerNo, props.row.publicPrivateType, props.row.customerName)
}

function openCustomerTouchHistory() {
  timelineDialogRef.value?.open(props.row)
}
</script>

<style scoped>
.crm-customer-link {
  display: inline-block;
  width: 100%;
  max-width: 100%;
  vertical-align: middle;
}

.crm-customer-tooltip {
  display: block;
  max-width: 100%;
}

.crm-customer-link :deep(.el-link__inner) {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
