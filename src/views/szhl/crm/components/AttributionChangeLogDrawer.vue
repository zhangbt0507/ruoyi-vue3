<template>
  <el-drawer :title="dialogTitle" v-model="visible" size="520px" append-to-body>
    <div v-loading="loading" class="change-log-drawer">
      <el-empty v-if="!loading && rows.length === 0" description="暂无变更历史" />
      <el-timeline v-else class="change-log-timeline">
        <el-timeline-item
          v-for="(item, index) in rows"
          :key="item.id || index"
          :timestamp="parseTime(item.changeDate, '{y}-{m}-{d}') || '-'"
          placement="top"
          type="primary"
        >
          <div class="change-log-item">
            <div class="change-log-title">
              <span>{{ item.changeSource || '管户变更' }}</span>
              <span class="change-log-operator">
                操作人：
                <span>{{ formatUser(item.operator) }}</span>
              </span>
            </div>
            <div class="change-log-compare">
              <div class="change-log-side change-log-before">
                <div class="change-log-side-title">变更前</div>
                <div class="change-log-field">
                  <span class="change-log-label">机构</span>
                  <span class="change-log-value">
                    <dict-tag v-if="item.oldOrg" :options="orgOptions" :value="item.oldOrg" />
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="change-log-field">
                  <span class="change-log-label">管户经理</span>
                  <span class="change-log-value">{{ formatUser(item.oldManager) }}</span>
                </div>
              </div>
              <div class="change-log-arrow">
                <el-icon><right /></el-icon>
              </div>
              <div class="change-log-side change-log-after">
                <div class="change-log-side-title">变更后</div>
                <div class="change-log-field">
                  <span class="change-log-label">机构</span>
                  <span class="change-log-value">
                    <dict-tag v-if="item.newOrg" :options="orgOptions" :value="item.newOrg" />
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="change-log-field">
                  <span class="change-log-label">管户经理</span>
                  <span class="change-log-value">{{ formatUser(item.newManager) }}</span>
                </div>
              </div>
            </div>
            <div class="change-log-reason">
              <span class="change-log-label">变更原因</span>
              <span class="change-log-value">{{ item.changeReason || '-' }}</span>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { getChangeLogs } from '@/api/szhl/crm/view'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'

defineProps({
  orgOptions: { type: Array, default: () => [] }
})

const { proxy } = getCurrentInstance()
const managerOptions = useUserOptions()

const visible = ref(false)
const loading = ref(false)
const rows = ref([])
const customer = ref({})
const dialogTitle = computed(() => customer.value.customerName ? `${customer.value.customerName} - 管户变更记录` : '管户变更记录')

function formatUser (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function open (row) {
  if (!row.customerNo) {
    proxy.$modal.msgWarning('未获取到客户信息')
    return
  }
  customer.value = row
  visible.value = true
  loading.value = true
  getChangeLogs(row.customerNo).then(res => {
    rows.value = res.data || []
  }).finally(() => {
    loading.value = false
  })
}

defineExpose({ open })
</script>

<style scoped>
.change-log-drawer {
  min-height: 240px;
  padding: 4px 4px 16px;
}

.change-log-timeline {
  padding: 4px 6px 0;
}

.change-log-item {
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.change-log-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #303133;
  font-weight: 500;
}

.change-log-operator {
  flex: 0 0 auto;
  color: #606266;
  font-weight: 400;
}

.change-log-label {
  color: #909399;
}

.change-log-value {
  min-width: 0;
  color: #303133;
}

.change-log-compare {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr);
  align-items: stretch;
  gap: 8px;
}

.change-log-side {
  min-width: 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.change-log-before {
  border-color: #e4e7ed;
}

.change-log-after {
  border-color: #c6e2ff;
  background: #f5f9ff;
}

.change-log-side-title {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.change-log-field {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  column-gap: 8px;
  line-height: 24px;
}

.change-log-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 18px;
}

.change-log-reason {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  column-gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}
</style>
