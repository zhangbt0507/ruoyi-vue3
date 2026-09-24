<template>
  <el-dialog
    v-model="dialogVisible"
    title="责任人责任核实"
    width="400px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="verification-dialog"
    :show-close="true"
  >
    <div class="verification-form">
      <!-- 客户信息卡片 -->
      <div class="info-card">
        <div class="info-header">
          <i class="el-icon-user"></i>
          <span>客户信息</span>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">客户名称</span>
            <span class="info-value">{{ props.selectedRow?.customerName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">责任比</span>
            <span class="info-value responsibility-ratio">{{ props.selectedRow?.responsibilityRatio ? props.selectedRow.responsibilityRatio + '%' : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 认定表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="verification-form-content">
        <!-- 认定结果 -->
        <el-form-item label="认定结果" prop="determinationStatus" class="form-item-custom">
          <el-select 
            v-model="form.determinationStatus" 
            placeholder="请选择认定结果"
            class="select-custom"
          >
            <el-option label="正确" value="REVIEW">
              <span class="option-content">
                <i class="el-icon-check option-icon success"></i>
                正确
              </span>
            </el-option>
            <el-option label="异议" value="OBJECTION">
              <span class="option-content">
                <i class="el-icon-close option-icon danger"></i>
                异议
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 认定意见 -->
        <el-form-item :label="form.determinationStatus === 'OBJECTION' ? '认定意见 *' : '认定意见'" prop="responsibleOpinion" class="form-item-custom">
          <el-input
            v-model="form.responsibleOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入认定意见"
            class="textarea-custom"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" class="btn-submit">
          <i class="el-icon-check"></i>
          提交
        </el-button>
        <el-button @click="handleClose" class="btn-cancel">
          <i class="el-icon-back"></i>
          返回
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { responsibilityVerification } from "@/api/szhl/badLoanManage/responsibility"

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: () => ({})
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
    determinationStatus: 'REVIEW',
    responsibleOpinion: ''
})

const rules = {
  determinationStatus: [
    { required: true, message: '请选择认定结果', trigger: 'change' }
  ],
  responsibleOpinion: [
    { 
      validator: (rule, value, callback) => {
        if (form.determinationStatus === 'OBJECTION') {
          if (!value || value.trim() === '') {
            callback(new Error('选择异议时，认定意见为必填项'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    initForm()
  }
})

watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 监听认定结果变化，重新验证认定意见
watch(() => form.determinationStatus, (newVal) => {
  if (formRef.value) {
    formRef.value.validateField('responsibleOpinion')
  }
})

function initForm() {
  // 初始化表单数据
  form.determinationStatus = 'REVIEW'
  form.responsibleOpinion = ''
}

function handleClose() {
  dialogVisible.value = false
  resetForm()
}

function resetForm() {
  form.determinationStatus = 'REVIEW'
  form.responsibleOpinion = ''
  formRef.value?.resetFields()
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      // 获取当前日期
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD格式
      
      // 构建更新数据
      const updateData = {
        id: props.selectedRow?.id,
        determinationStatus: form.determinationStatus, // 认定结果更新为DETERMINATION_STATUS
        responsibleOpinion: form.responsibleOpinion, // 认定意见更新为RESPONSIBLE_OPINION
        responsibleReviewDate: todayStr // 责任人认定日期为当天
      }

      // 调用责任人认定接口
      responsibilityVerification(updateData).then(() => {
        ElMessage.success('责任人责任核实提交成功')
        emit('submit', updateData)
        handleClose()
      }).catch((error) => {
        // console.info('责任人认定失败:', error)
      })
    }
  })
}
</script>

<style scoped>
/* 弹窗整体样式 */
:deep(.verification-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.verification-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  margin: 0;
  border-radius: 8px 8px 0 0;
}

:deep(.verification-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

:deep(.verification-dialog .el-dialog__headerbtn) {
  top: 12px;
  right: 16px;
}

:deep(.verification-dialog .el-dialog__close) {
  color: white;
  font-size: 16px;
}

:deep(.verification-dialog .el-dialog__body) {
  padding: 0;
  background: #f8fafc;
}

:deep(.verification-dialog .el-dialog__footer) {
  padding: 8px 16px;
  background: white;
  border-radius: 0 0 8px 8px;
  border-top: 1px solid #e5e7eb;
}

/* 表单容器 */
.verification-form {
  padding: 12px;
}

/* 客户信息卡片 */
.info-card {
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
  overflow: hidden;
}

.info-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
}

.info-header i {
  font-size: 14px;
}

.info-content {
  padding: 8px 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #64748b;
  font-size: 13px;
  width: 80px;
  text-align: left;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
  flex: 1;
  text-align: right;
}

.responsibility-ratio {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}


/* 表单内容 */
.verification-form-content {
  background: white;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.form-item-custom {
  margin-bottom: 12px;
}

:deep(.form-item-custom .el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.form-item-custom .el-form-item__content) {
  margin-top: 4px;
}

/* 输入框统一样式 */
.input-custom {
  width: 100%;
}

:deep(.input-custom .el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 0px 8px;
  min-height: 28px;
}

:deep(.input-custom .el-input__wrapper:hover) {
  border-color: #667eea;
}

:deep(.input-custom .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

:deep(.input-custom .el-input__inner) {
  font-size: 13px;
  color: #374151;
}

/* 选择框样式 */
.select-custom {
  width: 100%;
}

:deep(.select-custom .el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 0px 8px;
  min-height: 28px;
}

:deep(.select-custom .el-input__wrapper:hover) {
  border-color: #667eea;
}

:deep(.select-custom .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

:deep(.select-custom .el-input__inner) {
  font-size: 13px;
  color: #374151;
}

/* 选项样式 */
.option-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.option-icon {
  font-size: 14px;
}

.option-icon.success {
  color: #10b981;
}

.option-icon.danger {
  color: #ef4444;
}

/* 文本域样式 */
.textarea-custom {
  width: 100%;
}

:deep(.textarea-custom .el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 6px 8px;
  font-size: 13px;
  color: #374151;
  resize: vertical;
  min-height: 50px;
  line-height: 1.4;
}

:deep(.textarea-custom .el-textarea__inner:hover) {
  border-color: #667eea;
}

:deep(.textarea-custom .el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

:deep(.textarea-custom .el-input__count) {
  color: #9ca3af;
  font-size: 11px;
  background: #f8fafc;
  padding: 2px 6px;
  border-radius: 3px;
}

/* 按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  color: #374151;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-submit {
  padding: 8px 16px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.btn-submit:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.verification-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .verification-form {
    padding: 8px;
  }
  
  .info-content {
    padding: 8px 12px;
  }
  
  .verification-form-content {
    padding: 8px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 6px;
  }
  
  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}

/* 动画效果 */
:deep(.verification-dialog) {
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 表单项错误状态 */
:deep(.form-item-custom.is-error .el-input__wrapper) {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

:deep(.form-item-custom.is-error .el-textarea__inner) {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

/* 滚动条样式 */
:deep(.el-textarea__inner::-webkit-scrollbar) {
  width: 4px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 2px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 2px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}
</style>
