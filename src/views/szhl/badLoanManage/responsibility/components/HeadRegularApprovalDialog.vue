<template>
  <el-dialog
    v-model="visibleInner"
    title="常规审批"
    width="900px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
    top="3vh"
    draggable
  >
    <div class="approval-container">
      <!-- 合同相关信息 -->
      <div class="contract-info-section">
        <div class="section-header">合同相关信息</div>
        <div class="info-content">
          <div class="info-group">
            <div class="info-item">
              <span class="label">客户名称</span>
              <span class="value">{{ props.selectedRow?.customerName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户号</span>
              <span class="value">{{ props.selectedRow?.customerNo || '-' }}</span>
            </div>
          </div>

          <div class="info-group">
            <div class="info-item">
              <span class="label">合同号</span>
              <span class="value">{{ props.selectedRow?.contractNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">合同期</span>
              <span class="value">
                {{ props.selectedRow?.contractStartDate || '-' }}
                -
                {{ props.selectedRow?.contractEndDate || '-' }}
              </span>
            </div>
          </div>

          <div class="info-group highlight">
            <div class="info-item">
              <span class="label">建档金额</span>
              <span class="value amount">{{ formatAmount(props.selectedRow?.contractAmount) }}</span>
            </div>
            <div class="info-item">
              <span class="label">管贷人</span>
              <span class="value">{{ props.selectedRow?.managementPerson || '-' }}</span>
            </div>
          </div>

          <div class="info-group">
            <div class="info-item">
              <span class="label">担保方式</span>
              <span class="value">{{ props.selectedRow?.guaranteeType || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">管贷机构</span>
              <span class="value">{{ props.selectedRow?.managementInstitution || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 责任人列表 -->
      <div class="responsibility-section">
        <div class="section-header">责任人列表</div>
        <el-table 
          v-loading="loading" 
          :data="responsibilityList" 
          border 
          size="small" 
          :height="200"
        >
          <el-table-column prop="responsiblePerson" label="责任人" align="center" width="120" />
          <el-table-column prop="employeeNo" label="柜员号" align="center" width="120" />
          <el-table-column prop="responsibilityType" label="责任类型" align="center" width="120" />
          <el-table-column prop="responsibilityRatio" label="责任比%" align="center" width="90" />
          <el-table-column prop="determinationStatus" label="状态" align="center" width="90">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.determinationStatus)" size="small">
                {{ statusText(scope.row.determinationStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="responsibleOpinion" label="责任人意见" align="left" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- 异议提示 -->
      <div v-if="hasObjection" class="objection-warning">
        <el-icon color="#f56c6c" style="vertical-align: middle;"><WarningFilled /></el-icon>
        <span style="color: #f56c6c; margin-left: 5px;">存在异议数据，不允许批量通过操作</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-badge :value="responsibilityList.length" class="item">
            <el-button 
              type="primary" 
              @click="handleBatchApprove" 
              :disabled="responsibilityList.length===0 || hasObjection"
            >认定通过</el-button>
          </el-badge>
        </div>
        <div class="footer-right">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { getResponsibilityByContractNo, batchApprove } from '@/api/szhl/badLoanManage/responsibility'

const props = defineProps({
  visible: { type: Boolean, default: false },
  selectedRow: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible', 'submit'])

const visibleInner = ref(false)
const basic = ref({})
const responsibilityList = ref([])
const loading = ref(false)

// 计算是否有异议数据
const hasObjection = computed(() => {
  return responsibilityList.value.some(item => item.determinationStatus === 'OBJECTION' || item.determinationStatus === 'INITIAL')
})

watch(() => props.visible, (val) => {
  visibleInner.value = val
  if (val) init()
}, { immediate: true })

watch(visibleInner, (val) => emit('update:visible', val))

async function init() {
  basic.value = props.selectedRow || {}
  await loadResponsibilityList()
}

// 加载责任人列表数据
async function loadResponsibilityList() {
  if (!props.selectedRow?.contractNo) {
    responsibilityList.value = []
    return
  }
  
  loading.value = true
  try {
    const response = await getResponsibilityByContractNo(props.selectedRow.contractNo)
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      responsibilityList.value = response.data.map(item => ({
        id: item.id,
        responsiblePerson: item.nickName || item.responsiblePerson,
        employeeNo: item.responsiblePerson,
        responsibilityType: item.responsibilityType,
        responsibilityRatio: item.responsibilityRatio,
        determinationStatus: item.determinationStatus,
        responsibleOpinion: item.responsibleOpinion || '-',
        headOpinion: item.headOpinion || ''
      }))
    } else {
      responsibilityList.value = []
    }
  } catch (error) {
    console.error('加载责任人列表失败:', error)
    ElMessage.error('加载责任人列表失败')
    responsibilityList.value = []
  } finally {
    loading.value = false
  }
}

function formatAmount(v) {
  const n = parseFloat(v || 0)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusText(s) {
  const map = { NOT_DETERMINED: '未定责', INITIAL: '初分', REVIEW: '核对', OBJECTION: '异议', DIRECT_REPORT: '直报', COMPLETED: '完成' }
  return map[s] || s || '-'
}

// 获取状态标签颜色
function getStatusTagType(status) {
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

async function handleBatchApprove() {
  if (!responsibilityList.value.length) {
    ElMessage.warning('没有责任人数据')
    return
  }
  
  // 前端检查是否有异议数据
  if (hasObjection.value) {
    ElMessage.error('存在异议数据，不允许批量通过')
    return
  }
  
  try {
    // 调用批量审批通过接口
    await batchApprove(props.selectedRow?.contractNo)
    
    ElMessage.success('常规审批通过成功')
    
    // 触发提交事件，通知父组件刷新数据
    emit('submit', { 
      action: 'batch_approve', 
      contractNo: props.selectedRow?.contractNo,
      responsibilityList: responsibilityList.value 
    })
    
    visibleInner.value = false
  } catch (error) {
    console.error('批量审批失败:', error)
    ElMessage.error('审批失败，请重试')
  }
}

function handleClose() {
  visibleInner.value = false
  responsibilityList.value = []
}
</script>

<style scoped>
.approval-container {
  padding: 0;
}

/* 标题头样式 */
.section-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  font-weight: bold;
  text-align: center;
  font-size: 13px;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

/* 合同信息区 */
.contract-info-section {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 8px;
}

/* 信息展示 */
.info-content {
  padding: 12px 14px;
}

.info-group {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #e4e7ed;
  transition: all 0.3s ease;
}

.info-group:hover {
  background: #ecf5ff;
  border-left-color: #409eff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.1);
}

.info-group.highlight {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-left-color: #f56c6c;
}

.info-group.highlight:hover {
  background: linear-gradient(135deg, #ffe8e8 0%, #ffd4d4 100%);
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.2);
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full {
  flex: 1 0 100%;
}

.info-item .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.info-item .value {
  font-size: 13px;
  color: #303133;
  font-weight: 600;
  word-break: break-all;
}

.info-item .value.amount {
  font-size: 15px;
  color: #f56c6c;
  font-weight: 700;
}

/* 责任列表区域 */
.responsibility-section {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 8px;
}

/* 异议警告 */
.objection-warning {
  padding: 8px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  margin-bottom: 8px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item {
  margin-right: 8px;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 13px;
  border-radius: 0;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #c9c8c8, #c9c8c8 100%) !important;
  color: white !important;
  font-weight: bold;
  padding: 8px 0;
  border-color: #c9c8c8 !important;
  font-size: 13px;
}

:deep(.el-table td) {
  padding: 6px 0;
  border-color: #ebeef5;
  font-size: 13px;
}

:deep(.el-table tbody tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 对话框样式调整 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5px 18px;
  margin: 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 15px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
}

:deep(.el-dialog__body) {
  padding: 10px;
  background: #f8f9fa;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
}
</style>
