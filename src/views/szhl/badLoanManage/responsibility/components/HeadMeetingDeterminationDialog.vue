<template>
  <el-dialog 
    v-model="visibleInner"
    title="会议定责" 
    width="1000px" 
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
    top="3vh"
    draggable
  >
    <div class="responsibility-container">
      <!-- 上半部分：左右布局 -->
      <div class="top-section">
        <!-- 左侧：新责任分配 -->
        <div class="left-panel">
          <div class="section-header">新增责任分配</div>
          <div class="form-content">
            <el-form ref="formRef" :model="form" label-width="85px" :rules="responsibilityRules" class="responsibility-form">
              
              <el-form-item label="新责任人" prop="responsiblePerson">
                <el-select 
                  v-model="form.responsiblePerson" 
                  placeholder="请选择责任人" 
                  size="small" 
                  filterable
                  clearable
                  popper-class="responsibility-select-dropdown"
                >
                  <el-option 
                    v-for="user in userList" 
                    :key="user.userName" 
                    :label="`${user.nickName}(${user.userName})`" 
                    :value="user.userName" 
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="责任类型" prop="responsibilityType">
                <el-select 
                  v-model="form.responsibilityType" 
                  placeholder="请选择责任类型" 
                  size="small" 
                  clearable
                  popper-class="responsibility-select-dropdown"
                >
                  <el-option label="主调查" value="主调查" />
                  <el-option label="副调查" value="副调查" />
                  <el-option label="审查" value="审查" />
                  <el-option label="审批" value="审批" />
                  <el-option label="附加" value="附加" />
                  <el-option label="罚金" value="罚金" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="责任比%" prop="responsibilityRatio">
                <el-input v-model="form.responsibilityRatio" placeholder="0" size="small">
                  <template #append>%</template>
                </el-input>
              </el-form-item>

              <el-form-item style="margin-bottom: 8px;">
                <el-button type="primary" @click="addRow" size="small" style="width: 100%;" icon="Plus">
                  增加
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 右侧：合同相关信息 -->
        <div class="right-panel">
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
      </div>

      <!-- 下半部分：新增责任分配列表 -->
      <div class="bottom-section">
        <el-table 
          :data="newResponsibilityList" 
          border 
          :height="160"
          empty-text="暂无数据"
          size="small"
        >
          <el-table-column label="责任人(工号)" align="center" width="120">
            <template #default="scope">
              {{ scope.row.nickName }}({{ scope.row.responsiblePerson }})
            </template>
          </el-table-column>
          <el-table-column prop="responsibilityType" label="责任类型" align="center" width="120" />
          <el-table-column prop="responsibilityRatio" label="责任比" align="center" width="70" />
          <el-table-column prop="status" label="状态" align="center" width="90">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.determinationStatus)" size="small">
                {{ statusText(scope.row.determinationStatus || scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="responsibleOpinion" label="责任人意见" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="70" fixed="right">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="removeRow(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="form-content">
        <el-form :model="form" :rules="headOpinionRules">
          <el-form-item label="总行意见" prop="headOpinion" class="opinion-form-item">
            <el-input 
              v-model="form.headOpinion" 
              type="textarea" 
              :rows="1" 
              placeholder="请输入总行意见"
              resize="none"
              maxlength="500"
              show-word-limit
              class="opinion-textarea"
            />
          </el-form-item>
        </el-form>
        
      </div>

      <!-- 底部操作区域 -->
      <div class="bottom-actions">
        <div class="left-actions">
          <span style="font-size: 13px;">剩余责任比(不含附加、罚金): </span>
          <el-input 
            :model-value="remainRatio" 
            size="small" 
            style="width: 55px;" 
            readonly 
            :class="{ 'ratio-warning': remainRatio !== 0 }"
          />
          <span v-if="remainRatio !== 0" style="color: #f56c6c; font-size: 12px; margin-left: 5px;">
            (必须为0才能保存)
          </span>
          <span v-if="hasObjection" style="color: #f56c6c; font-size: 12px; margin-left: 5px;">
            存在异议数据，不允许保存
          </span>
        </div>
        <div class="right-actions">
          <el-button type="primary" size="small" @click="handleSave" :disabled="remainRatio !== 0 || newResponsibilityList.length === 0 || hasObjection">保存</el-button>
          <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
      </div>

      <!-- 状态说明 -->
      <div class="status-description">
        <span style="color: red; font-size: 11px;">
          状态流程分为：未定责、初分、核对/异议、完成。由支行录入，确责责任人任核实，完成由总行确定
        </span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { queryAllUser } from "@/api/system/user"
import { saveHeadDetermination, getResponsibilityByContractNo } from '@/api/szhl/badLoanManage/responsibility'

const props = defineProps({
  visible: { type: Boolean, default: false },
  selectedRow: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible', 'submit'])

const visibleInner = ref(false)
const formRef = ref(null)
const userList = ref([])

// 新增责任分配列表
const newResponsibilityList = ref([
])

// 新责任分配表单
const form = reactive({
  responsiblePerson: '',
  responsibilityType: '',
  responsibilityRatio: '',
  headOpinion: ''
})

// 定责状态映射
const determinationStatusMap = ref({
  'NOT_DETERMINED': '未定责',
  'INITIAL': '初分',
  'OBJECTION':'异议',
  'REVIEW': '核对',
  'COMPLETED': '完成'
})

// 计算剩余责任比（不包括附加类型）
const remainRatio = computed(() => {
  const total = newResponsibilityList.value
    .filter(item => item.responsibilityType !== '附加' && item.responsibilityType !== '罚金')
    .reduce((sum, item) => {
      return sum + (parseFloat(item.responsibilityRatio) || 0)
    }, 0)
  return Math.max(0, 100 - total)
})

// 计算是否有异议数据
const hasObjection = computed(() => {
  return newResponsibilityList.value.some(item => item.determinationStatus === 'OBJECTION')
})

// 监听visible变化
watch(() => props.visible, (newVal) => {
  visibleInner.value = newVal
  if (newVal) {
    initData()
  }
}, { immediate: true })

watch(visibleInner, (newVal) => {
  emit('update:visible', newVal)
})

// 修复下拉框宽度问题的方法
function fixSelectDropdownWidth() {
  nextTick(() => {
    const selectElements = document.querySelectorAll('.el-select')
    selectElements.forEach(select => {
      const input = select.querySelector('.el-input__inner')
      if (input) {
        const inputWidth = input.offsetWidth
        select.style.setProperty('--el-select-width', `${Math.max(inputWidth, 160)}px`)
      }
    })
  })
}

// 初始化数据
function initData() {
  getAllUsers()
  // 重置表单和数据
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  newResponsibilityList.value = []
  // 加载已有的责任数据到新增责任分配列表
  if (props.selectedRow?.contractNo) {
    loadExistingResponsibility()
  }
  // 修复下拉框宽度
  fixSelectDropdownWidth()
}

// 获取用户列表
function getAllUsers() {
  queryAllUser().then(res => {
    if (res.code === 200) {
      userList.value = res.data || []
      nextTick(() => {
        fixSelectDropdownWidth()
      })
    }
  }).catch(error => {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  })
}

function addRow() {
  // 验证表单
  if (!form.responsiblePerson) {
    ElMessage.warning('请选择责任人')
    return
  }
  if (!form.responsibilityType) {
    ElMessage.warning('请选择责任类型')
    return
  }
  if (!form.responsibilityRatio) {
    ElMessage.warning('请输入责任比例')
    return
  }
  /**
  if (!form.headOpinion) {
    ElMessage.warning('请输入总行意见')
    return
  } */

  const ratio = parseFloat(form.responsibilityRatio)
  if (isNaN(ratio) || ratio <= 0 || ratio > 100) {
    ElMessage.warning('责任比例必须是1-100之间的数字')
    return
  }

  // 获取选中的用户信息
  const selectedUser = userList.value.find(user => user.userName === form.responsiblePerson)
  if (!selectedUser) {
    ElMessage.warning('未找到选中的用户信息')
    return
  }

  // 检查用户是否已经有相同的责任类型
  const existingUserType = newResponsibilityList.value.find(item => 
    item.responsiblePerson === form.responsiblePerson && 
    item.responsibilityType === form.responsibilityType
  )
  if (existingUserType) {
    ElMessage.warning(`责任人"${selectedUser.nickName}"已存在相同责任类型"${form.responsibilityType}"`)
    return
  }

  // 如果不是附加类型，检查剩余责任比是否足够
  if (form.responsibilityType !== '附加' && form.responsibilityType !== '罚金' && ratio > remainRatio.value) {
    ElMessage.warning(`责任比例不能超过剩余比例 ${remainRatio.value}%`)
    return
  }

  // 添加到列表，同时保存名字和工号
  newResponsibilityList.value.push({
    nickName: selectedUser.nickName,
    responsiblePerson: selectedUser.userName,
    responsibilityType: form.responsibilityType,
    responsibilityRatio: ratio,
    determinationStatus: 'COMPLETED', // 保存原始状态码
    status: determinationStatusMap.value['COMPLETED'], // 保存文本状态
    headOpinion: form.headOpinion || ''
  })

  // 重置表单
  Object.keys(form).forEach(key => {
    form[key] = ''
  })

  ElMessage.success('责任分配添加成功')
}

function removeRow(index) {
  newResponsibilityList.value.splice(index, 1)
  ElMessage.success('删除成功')
}

async function handleSave() {
  // 检查总行意见必填
  const trimmedHeadOpinion = form.headOpinion.trim();
  if (!trimmedHeadOpinion) {
    ElMessage.warning('请输入总行意见');
    return;
  }

  if (newResponsibilityList.value.length === 0) {
    ElMessage.warning('请至少添加一条责任分配记录');
    return;
  }

  // 检查是否存在异议数据
  const hasObjection = newResponsibilityList.value.some(item => item.determinationStatus === 'OBJECTION')
  if (hasObjection) {
    ElMessage.error('存在异议数据，不允许保存');
    return;
  }

  // 验证除附加类型外的责任比总和
  const nonAdditionalTotal = newResponsibilityList.value
    .filter(item => item.responsibilityType !== '附加' && item.responsibilityType !== '罚金')
    .reduce((sum, item) => {
      return sum + (parseFloat(item.responsibilityRatio) || 0)
    }, 0)

  if (nonAdditionalTotal !== 100) {
    ElMessage.warning(`除附加、罚金类型外，其他责任比总和必须为100%，当前为${nonAdditionalTotal}%`)
    return;
  }

  // 统一赋值headOpinion
  newResponsibilityList.value.forEach(item => {
    item.headOpinion = trimmedHeadOpinion;
  });

  try {
    // 构建提交数据，匹配后端 ResponsibilityRiskFund 实体类
    const responsibilityList = newResponsibilityList.value.map(item => ({
      contractNo: props.selectedRow?.contractNo,
      customerNo: props.selectedRow?.customerNo,
      customerName: props.selectedRow?.customerName,
      customerCode: props.selectedRow?.customerCode,
      responsiblePerson: item.responsiblePerson, // 使用工号
      responsibilityType: item.responsibilityType,
      responsibilityRatio: parseFloat(item.responsibilityRatio),
      headOpinion: item.headOpinion || '',
      deptId: props.selectedRow?.originalLoanInstitution,
      determinationStatus: 'COMPLETED',
    }))

    // 调用总行定责接口
    await saveHeadDetermination(props.selectedRow?.contractNo, responsibilityList)

    ElMessage.success('总行定责保存成功')

    // 触发提交事件，通知父组件刷新数据
    emit('submit', {
      action: 'meeting_save',
      contractNo: props.selectedRow?.contractNo,
      customerNo: props.selectedRow?.customerNo,
      customerName: props.selectedRow?.customerName,
      customerCode: props.selectedRow?.customerCode,
      responsibilityList: responsibilityList
    })

    handleClose()
  } catch (error) {
  }
}

function handleClose() {
  visibleInner.value = false
  // 重置表单和数据
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  newResponsibilityList.value = []
}

// 加载已有的责任数据
async function loadExistingResponsibility() {
  if (!props.selectedRow?.contractNo) {
    return
  }
  
  try {
    const response = await getResponsibilityByContractNo(props.selectedRow.contractNo)
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      newResponsibilityList.value = response.data.map(item => ({
        nickName: item.nickName, // 保持兼容性
        responsiblePerson: item.responsiblePerson, // 保持兼容性
        responsibilityType: item.responsibilityType,
        responsibilityRatio: item.responsibilityRatio,
        determinationStatus: item.determinationStatus, // 保留原始状态
        status: determinationStatusMap.value[item.determinationStatus || 'INITIAL'],
        headOpinion: item.headOpinion || '',
        responsibleOpinion: item.responsibleOpinion || ''
      }))
    } else {
      newResponsibilityList.value = []
    }
  } catch (error) {
    console.error('加载已有责任数据失败:', error)
    newResponsibilityList.value = []
  }
}

// 格式化金额
function formatAmount(amount) {
  const num = parseFloat(amount || 0)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

// 状态文本映射
function statusText(status) {
  const statusMap = {
    'NOT_DETERMINED': '未定责',
    'INITIAL': '初分',
    'OBJECTION': '异议',
    'REVIEW': '核对',
    'DIRECT_REPORT': '直报',
    'COMPLETED': '完成'
  }
  return statusMap[status] || status || '-'
}

// 账务信息表单验证规则
const responsibilityRules = reactive({
  responsiblePerson: [
    { required: true, message: '请选择责任人', trigger: 'blur' }
  ],
  responsibilityType: [
    { required: true, message: '请选择责任类型', trigger: 'blur' }
  ],
  responsibilityRatio: [
    { required: true, message: '请输入责任比例', trigger: 'blur' },
    { pattern: /^[0-9]*\.?[0-9]*$/, message: '请输入有效的责任比例', trigger: 'blur' }
  ]
})

const headOpinionRules = reactive({
  headOpinion: [
    { required: true, message: '请输入总行意见', trigger: 'blur' }
  ]
})

</script>

<style scoped>
.responsibility-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 600px;
  max-height: 850px;
}

/* 合同信息卡片 */
.contract-info-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.info-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #409eff;
  margin-right: 8px;
  border-radius: 2px;
}

.contract-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  width: 80px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.info-value.amount {
  color: #f56c6c;
  font-weight: 600;
}

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

/* 上半部分：左右布局 */
.top-section {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  flex: 0 0 auto;
  margin-top: 0;
}

.left-panel {
  flex: 0 0 320px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.right-panel {
  flex: 1;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-content {
  padding: 12px 14px;
}

.responsibility-form {
  margin: 0;
}

.responsibility-form :deep(.el-input-group__append) {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 500;
}

/* 右侧信息展示 */
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

/* 下半部分：选中列表 */
.bottom-section {
  flex: 0 0 auto;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 180px;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.left-actions span {
  font-weight: 500;
  color: #606266;
}

/* 剩余责任比警告样式 */
.ratio-warning :deep(.el-input__inner) {
  color: #f56c6c !important;
  border-color: #f56c6c !important;
  background-color: #fef0f0 !important;
}

.right-actions {
  display: flex;
  align-items: center;
}

.status-description {
  text-align: center;
  margin-top: 0;
  flex: 0 0 auto;
  padding: 6px 10px;
  background: #fff3cd;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
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

:deep(.el-table--border) {
  border: none;
}

:deep(.el-table--border::after) {
  display: none;
}

/* 表单样式优化 */
:deep(.el-form-item) {
  margin-bottom: 12px;
  height: 40px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  height: 40px;
}

:deep(.el-input) {
  border-radius: 6px;
  height: 30px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input) {
  border-radius: 6px;
}

:deep(.el-textarea .el-textarea__inner) {
  border-radius: 6px;
  font-family: inherit;
}

:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f56c6c 0%, #f25c5c 100%);
  border: none;
}

/* 对话框样式调整 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  margin-top: 5vh !important;
  margin-bottom: 5vh !important;
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
  min-height: 400px;      /* 保证内容区高度，利于滚动条常显 */
  max-height: 60vh;
  overflow-y: scroll !important;  /* 始终有滚动条轨道 */
}
:deep(.el-dialog__body)::-webkit-scrollbar {
  width: 10px;
  background: #f3f3f3;
}
:deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: #d6dadf;
  border-radius: 5px;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .top-section {
    flex-direction: column;
  }
  
  .left-panel {
    flex: none;
  }
  
  .responsibility-container {
    height: auto;
    min-height: 500px;
  }
}

.opinion-form-item {
  margin-bottom: 20px;
}
.opinion-textarea :deep(.el-textarea__inner) {
  border-radius: 10px;
  border-color: #d4d7de;
  background: #fcfdff;
  font-size: 15px;
  min-height: 56px;
  padding: 12px 16px;
  transition: border-color .2s;
}
.opinion-textarea :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px #79bbff33;
}
.opinion-textarea :deep(.el-input__count) {
  font-size: 13px;
  color: #8c939d;
  bottom: 7px;
  right: 14px;
  background: transparent !important;
}
.opinion-form-item :deep(.el-form-item__error) {
  position: static !important;
  display: block !important;
  margin-top: 6px !important;
  padding-left: 2px;
  z-index: auto !important;
}
</style>

<style>
/* 全局下拉选择框样式统一 */
.responsibility-select-dropdown {
  min-width: 200px !important;
  max-width: 400px !important;
}

.responsibility-select-dropdown .el-select-dropdown__item {
  padding: 0 12px;
  font-size: 13px;
}

/* 全局修复Element Plus下拉框宽度问题 */
.el-select-dropdown {
  min-width: 160px !important;
}

.el-select-dropdown__item {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  min-height: 34px !important;
  line-height: 34px !important;
  padding: 0 20px !important;
}

/* 确保下拉框宽度至少与触发器一致 */
.el-select .el-input {
  min-width: 120px;
}

/* 修复下拉框定位和宽度计算问题 */
.el-popper {
  min-width: var(--el-select-width, 160px) !important;
}
</style>


