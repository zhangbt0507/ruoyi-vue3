<template>
  <el-dialog
    title="批量打退标客户导入"
    v-model="visible"
    width="620px"
    append-to-body
    :close-on-click-modal="false"
    @closed="reset"
  >
    <el-form label-position="top" class="batch-tag-form">
      <el-form-item label="客户文件" required>
        <el-upload
          ref="uploadRef"
          class="batch-tag-upload"
          drag
          :limit="1"
          accept=".xls,.xlsx"
          :disabled="importing"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :on-exceed="handleFileExceed"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或 <em>点击选择</em></div>
          <template #tip>
            <div class="el-upload__tip batch-tag-file-tip">
              请先 <el-link type="primary" :underline="false" @click.stop="handleDownloadTemplate">下载模板</el-link>
              并填写客户号，仅支持 xls、xlsx。
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="目标标签" required>
        <el-cascader
          v-model="tagId"
          :options="tagOptions"
          :props="cascaderProps"
          :disabled="importing"
          placeholder="请选择要批量打标或退标的标签"
          filterable
          clearable
          style="width: 100%"
          @change="importResult = null"
        />
        <div v-if="selectedTag && !selectedTagMarkable" class="batch-tag-warning">
          该标签已禁用或过期，仅可执行批量退标。
        </div>
      </el-form-item>
    </el-form>

    <div v-if="importResult" class="batch-tag-result">
      <el-alert
        :title="`处理完成：成功 ${importResult.successCount || 0} 条，失败 ${importResult.failureCount || 0} 条`"
        :type="importFailures.length ? 'warning' : 'success'"
        :closable="false"
        show-icon
      />
      <el-table v-if="importFailures.length" :data="importFailures" max-height="220" size="small">
        <el-table-column label="行号" prop="rowNum" width="72" align="center" />
        <el-table-column label="客户号" prop="customerNo" width="180" show-overflow-tooltip />
        <el-table-column label="失败原因" prop="reason" min-width="220" show-overflow-tooltip />
      </el-table>
    </div>
    <template #footer>
      <el-button
        type="primary"
        icon="Plus"
        :loading="importing && importAction === 'MARK'"
        :disabled="submitDisabled || !selectedTagMarkable"
        @click="submitImport('MARK')"
      >批量打标</el-button>
      <el-button
        type="danger"
        icon="Minus"
        :loading="importing && importAction === 'UNMARK'"
        :disabled="submitDisabled"
        @click="submitImport('UNMARK')"
      >批量退标</el-button>
      <el-button @click="visible = false">返回</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { saveAs } from 'file-saver'
import { downloadBatchTagImportTemplate, importTagCustomers } from '@/api/szhl/crm/attribution'

const props = defineProps({
  featureTags: { type: Array, default: () => [] }
})

const emit = defineEmits(['success'])
const { proxy } = getCurrentInstance()

const visible = ref(false)
const importing = ref(false)
const importAction = ref('')
const uploadRef = ref()
const file = ref(null)
const tagId = ref()
const importResult = ref(null)

const cascaderProps = { value: 'id', label: 'tagName', children: 'children', emitPath: false }
const tagOptions = computed(() => buildBatchTagOptions(props.featureTags))
const selectedTag = computed(() => props.featureTags.find(item => String(item.id) === String(tagId.value)))
const selectedTagMarkable = computed(() => {
  const tag = selectedTag.value
  return !!tag && tag.status !== 'inactive' && !isBatchTagExpired(tag.expireDate)
})
const submitDisabled = computed(() => importing.value || !file.value || !tagId.value)
const importFailures = computed(() => importResult.value?.failures || [])

function open () {
  reset()
  visible.value = true
}

function reset () {
  importing.value = false
  importAction.value = ''
  file.value = null
  tagId.value = undefined
  importResult.value = null
  uploadRef.value?.clearFiles()
}

function handleFileChange (changedFile) {
  const name = changedFile?.name || changedFile?.raw?.name || ''
  if (!/\.(xls|xlsx)$/i.test(name)) {
    proxy.$modal.msgWarning('仅支持 xls、xlsx 文件')
    uploadRef.value?.clearFiles()
    file.value = null
    return
  }
  file.value = changedFile.raw || changedFile
  importResult.value = null
}

function handleFileRemove () {
  file.value = null
  importResult.value = null
}

function handleFileExceed (files) {
  uploadRef.value?.clearFiles()
  const exceeded = files && files[0]
  if (exceeded) uploadRef.value?.handleStart(exceeded)
}

async function handleDownloadTemplate () {
  const blob = await downloadBatchTagImportTemplate()
  saveAs(new Blob([blob]), '批量打退标客户导入模板.xlsx')
}

async function submitImport (action) {
  if (!file.value) {
    proxy.$modal.msgWarning('请选择客户文件')
    return
  }
  if (!tagId.value) {
    proxy.$modal.msgWarning('请选择目标标签')
    return
  }
  if (action === 'MARK' && !selectedTagMarkable.value) {
    proxy.$modal.msgWarning('该标签已禁用或过期，不可批量打标')
    return
  }

  const data = new FormData()
  data.append('file', file.value)
  data.append('tagId', String(tagId.value))
  data.append('action', action)
  importing.value = true
  importAction.value = action
  try {
    const response = await importTagCustomers(data)
    importResult.value = response.data || { successCount: 0, failureCount: 0, failures: [] }
    const actionText = action === 'MARK' ? '批量打标' : '批量退标'
    const successCount = importResult.value.successCount || 0
    const failureCount = importResult.value.failureCount || 0
    if (failureCount > 0) {
      proxy.$modal.msgWarning(`${actionText}完成：成功 ${successCount} 条，失败 ${failureCount} 条`)
    } else {
      proxy.$modal.msgSuccess(`${actionText}完成：成功 ${successCount} 条`)
      visible.value = false
    }
    emit('success')
  } finally {
    importing.value = false
    importAction.value = ''
  }
}

function buildBatchTagOptions (rows) {
  const sourceRows = rows || []
  const nodeMap = {}
  sourceRows.forEach(item => {
    nodeMap[String(item.id)] = {
      id: item.id,
      tagName: batchTagOptionLabel(item),
      level: Number(item.level),
      children: []
    }
  })
  const roots = []
  sourceRows.forEach(item => {
    const node = nodeMap[String(item.id)]
    const parent = nodeMap[String(item.parentId)]
    if (parent) parent.children.push(node)
    else roots.push(node)
  })
  return roots.map(pruneBatchTagOption).filter(Boolean)
}

function pruneBatchTagOption (node) {
  if (node.level === 3) {
    return { id: node.id, tagName: node.tagName }
  }
  const children = node.children.map(pruneBatchTagOption).filter(Boolean)
  return children.length ? { ...node, children } : null
}

function batchTagOptionLabel (tag) {
  if (Number(tag.level) !== 3) return tag.tagName
  if (tag.status === 'inactive') return `${tag.tagName}（已禁用）`
  if (isBatchTagExpired(tag.expireDate)) return `${tag.tagName}（已过期）`
  return tag.tagName
}

function isBatchTagExpired (expireDate) {
  if (!expireDate) return false
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return String(expireDate).slice(0, 10) < `${now.getFullYear()}-${month}-${day}`
}

defineExpose({ open })
</script>

<style scoped>
.batch-tag-upload,
.batch-tag-upload :deep(.el-upload),
.batch-tag-upload :deep(.el-upload-dragger) {
  width: 100%;
}

.batch-tag-file-tip {
  line-height: 20px;
}

.batch-tag-warning {
  margin-top: 6px;
  color: #e6a23c;
  font-size: 12px;
  line-height: 18px;
}

.batch-tag-result {
  margin-top: 8px;
}

.batch-tag-result :deep(.el-table) {
  margin-top: 12px;
}
</style>
