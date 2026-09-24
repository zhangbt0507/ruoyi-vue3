<template>
  <el-dialog
    v-model="visible"
    width="860px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="!submitting"
    :show-close="!submitting"
    class="batch-modify-dialog"
    @closed="resetDialog"
  >
    <template #header>
      <div class="batch-dialog-header__title">批量修改归属</div>
    </template>

    <el-steps :active="activeStep" finish-status="success" align-center class="batch-steps">
      <el-step title="上传文件" />
      <el-step title="校验数据" />
      <el-step title="提交修改" />
    </el-steps>

    <!-- 待上传 -->
    <div v-if="stage === 'upload' && !submitting" class="batch-step-panel">
      <div class="batch-step-heading">
        <div class="batch-step-title">客户文件</div>
        <el-button type="primary" link icon="Download" @click="handleDownloadTemplate">下载模板</el-button>
      </div>

      <el-upload
        ref="uploadRef"
        drag
        :limit="1"
        accept=".xls,.xlsx"
        :disabled="submitting"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="() => (file = null)"
        :on-exceed="handleFileExceed"
        class="batch-upload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text"><em>选择文件</em></div>
        <div class="el-upload__tip">XLS / XLSX · 最大 10 MB</div>
      </el-upload>
    </div>

    <!-- 校验中 -->
    <div v-else-if="stage === 'upload' && submitting" class="batch-step-panel batch-progress-panel">
      <div class="batch-progress-icon"><el-icon class="is-loading"><Loading /></el-icon></div>
      <div class="batch-step-title">正在校验导入数据</div>
      <el-progress
        :percentage="progressPercent"
        :indeterminate="!hasProgress"
        :duration="12"
        class="batch-progress"
      />
      <div class="batch-progress-meta">{{ progressText }}</div>
    </div>

    <!-- 校验不通过：错误清单（每行多原因全部列出，前端分页每页 50） -->
    <div v-else-if="stage === 'invalid'" class="batch-step-panel">
      <div class="batch-step-heading">
        <div class="batch-step-title">校验结果</div>
        <el-tag type="danger" effect="plain">{{ failureCount }} / {{ totalRows }} 条未通过</el-tag>
      </div>
      <el-table :data="pagedFailures" max-height="320" size="small" class="batch-result-table">
        <el-table-column label="行号" prop="rowNum" width="72" align="center" />
        <el-table-column label="客户内码" prop="customerId" width="160" show-overflow-tooltip />
        <el-table-column label="客户名称" prop="customerName" width="140" show-overflow-tooltip />
        <el-table-column label="错误原因" min-width="240">
          <template #default="{ row }">
            <div v-for="(reason, index) in row.reasons" :key="index">{{ reason }}</div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="failures.length > failurePageSize"
        v-model:current-page="failurePage"
        :page-size="failurePageSize"
        :total="failures.length"
        layout="total, prev, pager, next"
        style="margin-top: 8px; justify-content: flex-end"
      />
    </div>

    <!-- 提交中 -->
    <div v-else-if="stage === 'validated' && submitting" class="batch-step-panel batch-progress-panel">
      <div class="batch-progress-icon batch-progress-icon--success"><el-icon class="is-loading"><Loading /></el-icon></div>
      <div class="batch-step-title">正在提交批量修改</div>
      <el-progress
        :percentage="progressPercent"
        :indeterminate="!hasProgress"
        :duration="12"
        class="batch-progress"
      />
      <div class="batch-progress-meta">{{ progressText }}</div>
    </div>

    <!-- 校验通过：预览与提交 -->
    <div v-else-if="stage === 'validated'" class="batch-step-panel">
      <div class="batch-step-heading">
        <div>
          <div class="batch-step-title">待修改 {{ totalRows }} 条</div>
          <div v-if="previewRows.length < totalRows" class="batch-preview-meta">预览前 {{ previewRows.length }} 条</div>
        </div>
        <el-tag type="success" effect="plain">校验通过</el-tag>
      </div>
      <el-table :data="previewRows" max-height="320" size="small" class="batch-result-table">
        <el-table-column label="行号" prop="rowNum" width="72" align="center" />
        <el-table-column label="客户内码" prop="customerId" width="150" show-overflow-tooltip />
        <el-table-column label="客户名称" prop="customerName" width="120" show-overflow-tooltip />
        <el-table-column label="管户机构编号" prop="attributionOrg" width="110" />
        <el-table-column label="管户机构名称" prop="attributionOrgName" width="130" show-overflow-tooltip />
        <el-table-column label="管户人编号" prop="managerId" width="100" />
        <el-table-column label="管户人名称" prop="managerName" width="110" show-overflow-tooltip />
      </el-table>
    </div>

    <!-- 执行中 / 完成 -->
    <div v-else-if="stage === 'executing'" class="batch-step-panel batch-progress-panel">
      <div class="batch-progress-icon batch-progress-icon--success"><el-icon class="is-loading"><Loading /></el-icon></div>
      <div class="batch-step-title">正在提交批量修改</div>
      <el-progress
        :percentage="progressPercent"
        :indeterminate="!hasProgress"
        :duration="12"
        class="batch-progress"
      />
      <div class="batch-progress-meta">{{ progressText }}</div>
    </div>

    <div v-else-if="stage === 'failed'" class="batch-step-panel batch-failed-panel">
      <div class="batch-progress-icon batch-progress-icon--error"><el-icon><CircleCloseFilled /></el-icon></div>
      <div class="batch-step-title">批量修改未完成</div>
      <el-alert :title="`执行失败：${task.errorMessage || '未知错误'}`" type="error" :closable="false" show-icon class="batch-result-alert" />
    </div>

    <template #footer>
      <el-button
        v-if="stage === 'upload' || stage === 'invalid' || stage === 'failed' || stage === 'validated'"
        :disabled="submitting"
        @click="visible = false"
      >取消</el-button>
      <el-button
        v-if="stage === 'upload'"
        type="primary"
        :loading="submitting"
        :disabled="!file"
        @click="handleValidate"
      >开始校验</el-button>
      <el-button
        v-if="stage === 'validated'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >确认修改</el-button>
      <el-button v-if="stage === 'invalid' || stage === 'failed'" type="primary" @click="restart">重新上传</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="AttributionBatchModifyDialog">
import { computed, getCurrentInstance, ref } from 'vue'
import { saveAs } from 'file-saver'
import {
  downloadBatchModifyTemplate,
  validateBatchModify,
  getBatchModifyTask,
  submitBatchModify
} from '@/api/szhl/crm/attribution'

const emit = defineEmits(['success'])
const { proxy } = getCurrentInstance()

const visible = ref(false)
const stage = ref('upload')
const file = ref(null)
const submitting = ref(false)
const taskId = ref('')
const task = ref({})
const uploadRef = ref(null)
const activeStep = computed(() => {
  if (stage.value === 'executing' || stage.value === 'failed' || (stage.value === 'validated' && submitting.value)) return 2
  if (stage.value === 'validated' || stage.value === 'invalid' || submitting.value) return 1
  return 0
})
const failures = computed(() => Array.isArray(task.value.failures) ? task.value.failures : [])
const previewRows = computed(() => Array.isArray(task.value.preview) ? task.value.preview : [])
const totalRows = computed(() => Number(task.value.total) || previewRows.value.length || failures.value.length || 0)
const failureCount = computed(() => failures.value.length)
const progressTotal = computed(() => Number(task.value.total) || 0)
const progressProcessed = computed(() => Number(task.value.processed) || Number(task.value.updatedRows) || 0)
const hasProgress = computed(() => progressTotal.value > 0 && progressProcessed.value > 0)
const progressPercent = computed(() => {
  if (!progressTotal.value) return 0
  return Math.min(100, Math.round((progressProcessed.value / progressTotal.value) * 100))
})
const progressText = computed(() => {
  if (progressTotal.value) return `已处理 ${Math.min(progressProcessed.value, progressTotal.value)} / ${progressTotal.value} 条`
  return '准备中…'
})
/** 错误清单前端分页：大文件错误行全量渲染会卡，每页 50 */
const failurePage = ref(1)
const failurePageSize = 50
/** 轮询定时器；轮询连续失败 3 次或 10 分钟无 updateTime 变化则停止并提示人工核对 */
let pollTimer = null
/** 连续失败计数：单次网络抖动不打断轮询 */
let pollFailureCount = 0
/** 最近一次观察到的 updateTime（毫秒）；长时间不变说明任务疑似卡死 */
let lastSeenUpdateTime = 0
let lastSeenChangeAt = 0

/** 当前页的错误行（错误行按行号升序展示） */
const pagedFailures = computed(() => {
  const start = (failurePage.value - 1) * failurePageSize
  return failures.value.slice(start, start + failurePageSize)
})

function open () {
  resetDialog()
  visible.value = true
}

function resetDialog () {
  stopPolling()
  stage.value = 'upload'
  file.value = null
  submitting.value = false
  taskId.value = ''
  task.value = {}
  failurePage.value = 1
  uploadRef.value?.clearFiles()
}

function restart () {
  stopPolling()
  stage.value = 'upload'
  file.value = null
  taskId.value = ''
  task.value = {}
  failurePage.value = 1
  uploadRef.value?.clearFiles()
}

function handleFileChange (uploadFile) {
  const name = uploadFile?.name || uploadFile?.raw?.name || ''
  if (!/\.(xls|xlsx)$/i.test(name)) {
    proxy.$modal.msgWarning('仅支持 xls、xlsx 文件')
    uploadRef.value?.clearFiles()
    file.value = null
    return
  }
  file.value = uploadFile.raw || uploadFile
}

function handleFileExceed (files) {
  uploadRef.value?.clearFiles()
  const next = files && files[0]
  if (next) uploadRef.value?.handleStart(next)
}

async function handleDownloadTemplate () {
  const blob = await downloadBatchModifyTemplate()
  saveAs(new Blob([blob]), '批量修改归属导入模板.xlsx')
}

async function handleValidate () {
  if (!file.value) {
    proxy.$modal.msgWarning('请选择客户文件')
    return
  }
  submitting.value = true
  try {
    const data = new FormData()
    data.append('file', file.value)
    const response = await validateBatchModify(data)
    taskId.value = response.data
    await pollTask()
  } finally {
    submitting.value = false
  }
}

async function handleSubmit () {
  submitting.value = true
  try {
    await submitBatchModify(taskId.value)
    stage.value = 'executing'
    await pollTask()
  } finally {
    submitting.value = false
  }
}

/** 轮询任务直到终态；连续失败 3 次或 10 分钟无 updateTime 变化则停止并提示人工核对 */
async function pollTask () {
  stopPolling()
  const target = taskId.value
  pollFailureCount = 0
  lastSeenUpdateTime = 0
  lastSeenChangeAt = Date.now()
  return new Promise(resolve => {
    pollTimer = setInterval(async () => {
      try {
        const response = await getBatchModifyTask(target)
        const next = response.data || {}
        task.value = next
        pollFailureCount = 0
        const updateTime = new Date(next.updateTime).getTime() || 0
        if (updateTime !== lastSeenUpdateTime) {
          lastSeenUpdateTime = updateTime
          lastSeenChangeAt = Date.now()
        } else if (Date.now() - lastSeenChangeAt > 10 * 60 * 1000) {
          stopPolling()
          proxy.$modal.msgError('任务长时间无进展，任务状态未知，请刷新列表核对')
          resolve()
          return
        }
        const status = next.status
        if (status === 'INVALID') {
          stopPolling()
          stage.value = 'invalid'
          resolve()
        } else if (status === 'VALIDATED') {
          stopPolling()
          stage.value = 'validated'
          resolve()
        } else if (status === 'SUCCESS') {
          stopPolling()
          proxy.$modal.msgSuccess(`已修改 ${next.updatedRows || 0} 条`)
          visible.value = false
          emit('success')
          resolve()
        } else if (status === 'FAILED') {
          stopPolling()
          stage.value = 'failed'
          resolve()
        }
      } catch (e) {
        pollFailureCount += 1
        if (pollFailureCount >= 3) {
          stopPolling()
          proxy.$modal.msgError('任务状态查询失败，任务状态未知，请刷新列表核对')
          resolve()
        }
      }
    }, 1500)
  })
}

function stopPolling () {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

defineExpose({ open })
</script>

<style scoped>
:global(.batch-modify-dialog) {
  max-width: calc(100vw - 32px);
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 14%);
}

:global(.batch-modify-dialog .el-dialog__header) {
  box-sizing: border-box;
  margin-right: 0;
  padding: 16px 52px 14px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

:global(.batch-modify-dialog .el-dialog__body) {
  padding: 18px 24px 20px;
  background: var(--el-bg-color-page);
}

:global(.batch-modify-dialog .el-dialog__footer) {
  padding: 14px 24px 18px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.batch-dialog-header__title {
  color: var(--el-text-color-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
}

.batch-steps {
  margin: 0 0 20px;
  padding: 0 18px;
}

.batch-steps :deep(.el-step__icon) {
  width: 30px;
  height: 30px;
  font-size: 14px;
  font-weight: 600;
  border-width: 1.5px;
}

.batch-steps :deep(.el-step__head.is-wait .el-step__icon) {
  color: #9ca3af;
  background: #fff;
  border-color: #d8dce5;
}

.batch-steps :deep(.el-step__head.is-process) {
  color: #2563eb;
  border-color: #2563eb;
}

.batch-steps :deep(.el-step__head.is-process .el-step__icon),
.batch-steps :deep(.el-step__head.is-success .el-step__icon) {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}

.batch-steps :deep(.el-step__head.is-process .el-step__icon) {
  box-shadow: 0 0 0 4px rgb(37 99 235 / 12%);
}

.batch-steps :deep(.el-step__line) {
  height: 1px;
  background-color: #e5e7eb;
}

.batch-steps :deep(.el-step__line-inner) {
  border-color: #2563eb;
}

.batch-steps :deep(.el-step__title) {
  margin-top: 7px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.batch-step-panel {
  min-height: 300px;
  padding: 18px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color);
}

.batch-step-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.batch-step-title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.batch-preview-meta {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}

.batch-upload :deep(.el-upload-dragger) {
  padding: 34px 24px 28px;
  border: 1px dashed #cfd6e4;
  border-radius: 6px;
  background: #fafbfd;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.batch-upload :deep(.el-upload-dragger:hover) {
  border-color: #2563eb;
  background: #f5f8ff;
}

.batch-upload :deep(.el-icon--upload) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  color: #2563eb;
  font-size: 24px;
  background: #eaf1ff;
  border-radius: 50%;
}

.batch-upload :deep(.el-upload__text) {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.batch-upload :deep(.el-upload__text em) {
  color: #2563eb;
  font-style: normal;
  font-weight: 600;
}

.batch-upload :deep(.el-upload__tip) {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.batch-result-alert {
  margin-bottom: 14px;
  border-radius: 6px;
}

.batch-result-table {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.batch-result-table :deep(.el-table__header-wrapper th.el-table__cell) {
  height: 42px;
  padding: 0;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.batch-result-table :deep(.el-table__body td.el-table__cell) {
  height: 44px;
  padding: 0;
}

.batch-result-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--el-color-primary-light-9);
}

.batch-progress-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 300px;
  text-align: center;
}

.batch-progress-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 14px;
  color: #2563eb;
  font-size: 26px;
  background: #eaf1ff;
  border-radius: 50%;
}

.batch-progress-icon--success {
  color: #2563eb;
}

.batch-progress-icon--error {
  color: #f56c6c;
  background: #fef0f0;
}

.batch-progress {
  width: min(480px, 100%);
  margin-top: 24px;
}

.batch-progress-meta {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.batch-failed-panel {
  min-height: 260px;
}

@media (max-width: 767px) {
  :global(.batch-modify-dialog .el-dialog__body) {
    padding: 14px;
  }

  :global(.batch-modify-dialog .el-dialog__footer) {
    padding: 12px 14px 14px;
  }

  .batch-steps {
    padding: 0;
  }

  .batch-step-panel {
    padding: 14px;
  }
}
</style>
