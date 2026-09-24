<template>
  <el-dialog 
    title="责任认定操作" 
    v-model="dialogVisible" 
    width="800px" 
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
    top="3vh"
  >
    <div class="responsibility-container">
      <!-- 上部分：原核心系统责任情况 -->
      <div class="top-section" v-if="!hideOriginal">
        <div class="section-header">原核心系统责任情况</div>
          <el-table :data="originalResponsibilityList" border size="small" max-height="150">
            <el-table-column prop="nickName" label="责任人" align="center" />
            <el-table-column prop="creditorCode" label="柜员号" align="center" />
            <el-table-column prop="type" label="责任类型" align="center" />
            <el-table-column prop="capitalProportion" label="责任比%" align="center" />
          </el-table>
      </div>

      <!-- 中部分：新责任分配表单 -->
      <div class="middle-section">
        <div class="section-header">新责任分配</div>
        <div class="form-content">
          <el-form ref="newResponsibilityFormRef" :model="newResponsibilityForm" :inline="true" label-width="70px" class="responsibility-form">
            <el-form-item label="新责任人" prop="responsiblePerson">
              <el-select 
                v-model="newResponsibilityForm.responsiblePerson" 
                placeholder="请选择责任人" 
                size="small" 
                filterable
                clearable
                style="width: 100px;"
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
                v-model="newResponsibilityForm.responsibilityType" 
                placeholder="请选择责任类型" 
                size="small" 
                clearable
                style="width: 100px;"
                popper-class="responsibility-select-dropdown"
              >
                <el-option label="主调查" value="主调查" />
                <el-option label="副调查" value="副调查" />
                <el-option label="审查" value="审查" />
                <el-option label="审批" value="审批" />
                <el-option label="附加" value="附加" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="责任比%" prop="responsibilityRatio">
              <el-input 
                v-model="newResponsibilityForm.responsibilityRatio" 
                placeholder="0" 
                size="small"
                style="width: 60px;"
                @input="handleRatioInput"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="addResponsibility" size="small">
                增加
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 下部分：责任初分列表 -->
      <div class="bottom-section">
        <div class="section-header">责任初分列表<span style="float: right; font-size: 12px; font-weight: normal; margin-right: 10px;">剩余责任比: {{ remainingRatio }}%</span></div>
        <el-table 
          :data="newResponsibilityList" 
          border 
          :height="160"
          empty-text="暂无数据"
          size="small"
        >
          <el-table-column label="责任人(工号)" align="center" width="140">
            <template #default="scope">
              {{ scope.row.nickName }}({{ scope.row.responsiblePerson }})
            </template>
          </el-table-column>
          <el-table-column prop="responsibilityType" label="责任类型" align="center" width="120" />
          <el-table-column prop="responsibilityRatio" label="责任比" align="center" width="100" />
          <el-table-column prop="status" label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '申定' ? 'success' : 'warning'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="responsibleOpinion" label="备注" align="center" min-width="120" show-overflow-tooltip /> -->
          <el-table-column label="操作" align="center"  fixed="right">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="deleteRow(scope.row, scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部操作区域 -->
      <div class="bottom-actions">
        <div class="left-actions">
          <el-button
            v-if="props.selectedRow && props.selectedRow.determinationStatus === 'NOT_DETERMINED'"
            type="info"
            size="small"
            @click="sendHeadDetermination"
          >不初分直接上报总行认定</el-button>
        </div>
        <div class="right-actions">
          <el-button type="primary" size="small" @click="handleSave" :disabled="!canSave">保存</el-button>
          <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { batchSave, getResponsibilityByContractNo, getOriginalLiability } from '@/api/szhl/badLoanManage/responsibility'
import { updateBadLoan } from '@/api/szhl/badLoanManage/badLoan'
import { queryAllUser } from "@/api/system/user"
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const currentUser = {
  username: userStore.name || '',
  userName: String(userStore.userName || ''),
  deptId: String(userStore.deptId || '')
}

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: () => ({})
  },
  hideOriginal: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'submit'])

// 响应式数据
const dialogVisible = ref(false)
const userList = ref([])

// 新责任分配表单
const newResponsibilityForm = reactive({
  responsiblePerson: '',
  responsibilityType: '',
  responsibilityRatio: '',
  responsibleOpinion: ''
})

//定责状态
const determinationStatusMap = ref({
  'NOT_DETERMINED': '未定责',
  'INITIAL': '初分',
  'OBJECTION':'异议',
  'REVIEW': '核对',
  'COMPLETED': '完成'
})

// 原核心系统责任情况（从另外一张表获取，待后续对接）
const originalResponsibilityList = ref([])

// 新增责任分配列表
const newResponsibilityList = ref([
])

// 计算剩余责任比（不包括附加类型）
const remainingRatio = computed(() => {
  const total = newResponsibilityList.value
    .filter(item => item.responsibilityType !== '附加')
    .reduce((sum, item) => {
      return sum + (parseFloat(item.responsibilityRatio) || 0)
    }, 0)
  return Math.max(0, 100 - total)
})

// 计算是否可以保存
const canSave = computed(() => {
  // 必须有责任分配记录
  if (newResponsibilityList.value.length === 0) {
    return false
  }
  
  // 除了附加类型外，其他责任比总和必须为100%
  const nonAdditionalTotal = newResponsibilityList.value
    .filter(item => item.responsibilityType !== '附加')
    .reduce((sum, item) => {
      return sum + (parseFloat(item.responsibilityRatio) || 0)
    }, 0)
  
  return nonAdditionalTotal === 100
})

// 表单引用
const newResponsibilityFormRef = ref(null)

// 监听visible变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    initData()
  }
}, { immediate: true })

watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 修复下拉框宽度问题的方法
function fixSelectDropdownWidth() {
  nextTick(() => {
    // 获取所有下拉框元素
    const selectElements = document.querySelectorAll('.el-select')
    selectElements.forEach(select => {
      const input = select.querySelector('.el-input__inner')
      if (input) {
        const inputWidth = input.offsetWidth
        // 设置CSS变量，供下拉框使用
        select.style.setProperty('--el-select-width', `${Math.max(inputWidth, 160)}px`)
      }
    })
  })
}

// 初始化数据
function initData() {
   getAllUsers()
  // 加载原核心系统责任情况
  if (props.selectedRow?.contractNo) {
    loadOriginalResponsibility()
  }
  // 加载已有的责任数据到新增责任分配列表
  if (props.selectedRow?.contractNo) {
    loadExistingResponsibility()
  }
  
  // 修复下拉框宽度
  fixSelectDropdownWidth()
}

// 加载原核心系统责任情况
async function loadOriginalResponsibility() {
  if (!props.selectedRow?.contractNo) {
    return
  }
  
  try {
    const response = await getOriginalLiability(props.selectedRow.contractNo)
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      // 映射后端字段到前端字段
      originalResponsibilityList.value = response.data;
    } else {
      originalResponsibilityList.value = []
    }
  } catch (error) {
    console.error('加载原核心系统责任情况失败:', error)
    originalResponsibilityList.value = []
  }
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
        status: determinationStatusMap.value[item.determinationStatus || 'INITIAL'],
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

// 处理责任比输入，只允许数字
function handleRatioInput(value) {
  // 只允许数字和小数点
  const numericValue = value.replace(/[^\d.]/g, '')
  // 确保只有一个小数点
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    newResponsibilityForm.responsibilityRatio = parts[0] + '.' + parts.slice(1).join('')
  } else {
    newResponsibilityForm.responsibilityRatio = numericValue
  }
}

// 增加责任分配
function addResponsibility() {
  // 验证表单
  if (!newResponsibilityForm.responsiblePerson) {
    ElMessage.warning('请选择责任人')
    return
  }
  if (!newResponsibilityForm.responsibilityType) {
    ElMessage.warning('请选择责任类型')
    return
  }
  if (!newResponsibilityForm.responsibilityRatio) {
    ElMessage.warning('请输入责任比例')
    return
  }

  const ratio = parseFloat(newResponsibilityForm.responsibilityRatio)
  if (isNaN(ratio) || ratio <= 0 || ratio > 100) {
    ElMessage.warning('责任比例必须是1-100之间的数字')
    return
  }

  // 获取选中的用户信息
  const selectedUser = userList.value.find(user => user.userName === newResponsibilityForm.responsiblePerson)
  if (!selectedUser) {
    ElMessage.warning('未找到选中的用户信息')
    return
  }

  // 检查用户是否已经有相同的责任类型
  const existingUserType = newResponsibilityList.value.find(item => 
    item.responsiblePerson === newResponsibilityForm.responsiblePerson && 
    item.responsibilityType === newResponsibilityForm.responsibilityType
  )
  if (existingUserType) {
    ElMessage.warning(`责任人"${selectedUser.nickName}"已存在相同责任类型"${newResponsibilityForm.responsibilityType}"`)
    return
  }

  // 如果不是附加类型，检查剩余责任比是否足够
  if (newResponsibilityForm.responsibilityType !== '附加' && ratio > remainingRatio.value) {
    ElMessage.warning(`责任比例不能超过剩余比例 ${remainingRatio.value}%`)
    return
  }

  // 添加到列表，同时保存名字和工号
  newResponsibilityList.value.push({
    nickName: selectedUser.nickName,
    responsiblePerson: selectedUser.userName, // 保存工号用于后端
    responsibilityType: newResponsibilityForm.responsibilityType,
    responsibilityRatio: ratio,
    status: determinationStatusMap.value['INITIAL'],
    responsibleOpinion: newResponsibilityForm.responsibleOpinion || ''
  })

  // 重置表单
  Object.keys(newResponsibilityForm).forEach(key => {
    newResponsibilityForm[key] = ''
  })

  ElMessage.success('责任分配添加成功')
}

// 上报总行定责
async function sendHeadDetermination() {
   if (!props.selectedRow || !props.selectedRow.contractNo) {
    ElMessage.warning('请选择一条记录')
    return
  }
  if (!props.selectedRow || props.selectedRow.determinationStatus !== 'NOT_DETERMINED') {
    ElMessage.warning('仅“未定责”状态允许上报总行')
    return
  }
  // 二次确认
  try {
    await ElMessageBox.confirm(
      '确认不进行初分，由总行直接定责？',
      '确认提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 用户确认后执行上报操作
    await updateBadLoan({
      contractNo: props.selectedRow.contractNo,
      determinationStatus: 'DIRECT_REPORT'
    })
    emit('submit', { contractNo: props.selectedRow.contractNo, action: 'direct_report' })
    handleClose()
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    console.error('上报总行定责失败:', error)
  }
}

// 删除单条责任分配
function deleteRow(row, index) {
  // 直接根据索引删除
  newResponsibilityList.value.splice(index, 1)
  ElMessage.success('删除成功')
}

// 保存责任分配
async function handleSave() {
  if (newResponsibilityList.value.length === 0) {
    ElMessage.warning('请至少添加一条责任分配记录')
    return
  }
  
  // 验证除附加类型外的责任比总和
  const nonAdditionalTotal = newResponsibilityList.value
    .filter(item => item.responsibilityType !== '附加')
    .reduce((sum, item) => {
      return sum + (parseFloat(item.responsibilityRatio) || 0)
    }, 0)
  
  if (nonAdditionalTotal !== 100) {
    ElMessage.warning(`除附加类型外，其他责任比总和必须为100%，当前为${nonAdditionalTotal}%`)
    return
  }
  
  // 确认保存
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
      initialPerson: currentUser.username, // 这里应该从用户信息中获取
      initialDate: new Date(), // 后端会处理日期格式
      determinationStatus: 'INITIAL',
      responsibleOpinion: item.responsibleOpinion || '',
      deptId: props.selectedRow?.originalLoanInstitution
    }))
    
    // 调用后端API
    await batchSave(props.selectedRow?.contractNo, responsibilityList)
    
    ElMessage.success('责任分配保存成功')
    
    // 触发提交事件，通知父组件刷新数据
    emit('submit', {
      contractNo: props.selectedRow?.contractNo,
      customerNo: props.selectedRow?.customerNo,
      customerName: props.selectedRow?.customerName,
      customerCode: props.selectedRow?.customerCode,
      responsibilityList: responsibilityList
    })
    
    handleClose()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存责任分配失败:', error)
      ElMessage.error('保存失败，请重试')
    }
  }
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false
  // 重置表单和数据
  Object.keys(newResponsibilityForm).forEach(key => {
    newResponsibilityForm[key] = ''
  })
  // 清空责任分配列表
  newResponsibilityList.value = []
}
</script>

<style scoped>
.responsibility-container {
  padding: 0;
  height: auto;
  display: flex;
  flex-direction: column;
  min-height: 450px;
  max-height: 650px;
}

.section-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  font-weight: bold;
  text-align: center;
  font-size: 13px;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

/* 上部分：原核心系统责任情况 */
.top-section {
  flex: 0 0 auto;
  margin-bottom: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 中部分：新责任分配表单 */
.middle-section {
  flex: 0 0 auto;
  margin-bottom: 10px;
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

.responsibility-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 8px;
}

.responsibility-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
}

/* 下部分：责任初分列表 */
.bottom-section {
  flex: 0 0 auto;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 200px;
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
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

:deep(.el-input) {
  border-radius: 6px;
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
  padding: 0 10px 10px 10px;
  background: #f8f9fa;
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
</style>

<style>
/* 全局下拉选择框样式统一 */
.responsibility-select-dropdown {
  min-width: 140px !important;
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
