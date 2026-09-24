<template>
  <el-dialog :model-value="visible" :title="dialogTitle" width="680px" append-to-body destroy-on-close
    @close="handleClose">
    <div v-loading="loading">
      <el-descriptions :column="1" border size="small" class="mb16">
        <el-descriptions-item label="申请类型">
          <el-tag v-if="hasApplyMaterials" type="primary" size="small">{{ applyTypeLabel }}</el-tag>
          <el-tag v-else type="danger" size="small">未提交{{ applyTypeLabel }}申请</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-for="item in materialDefs" :key="item.type" :label="item.label">
          <template v-if="hasApplyMaterials && getFiles(item.type).length">
            <div v-for="file in getFiles(item.type)" :key="file.idstr || file.fileUrl" class="file-item">
              <el-link type="primary" :href="fileUrl(file.fileUrl)" target="_blank" :title="file.fileName">
                {{ file.fileName || '查看文件' }}
              </el-link>
            </div>
          </template>
          <el-tag v-else type="danger" size="small">未上传</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-form label-width="140px" class="receipt-form">
        <el-form-item required>
          <template #label>
            <span class="receipt-label">{{ receiptMaterialDef.label }}</span>
          </template>
          <FileUpload v-model="receiptFileUrl" :limit="1" :file-size="20"
            :file-type="['doc', 'docx', 'pdf']" />
        </el-form-item>
        <el-form-item v-if="existingReceiptFiles.length" label="已上传">
          <div v-for="file in existingReceiptFiles" :key="file.idstr || file.fileUrl" class="file-item">
            <el-link type="primary" :href="fileUrl(file.fileUrl)" target="_blank" :title="file.fileName">
              {{ file.fileName || '查看文件' }}
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button type="primary" :disabled="!canApprove" :loading="submitLoading" @click="handleApprove">
        {{ confirmButtonText }}
      </el-button>
      <el-button @click="handleClose">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/** 党建管理 - 转正延期审批弹窗 */
import { ref, watch, computed } from 'vue'
import {
  listPartyMemberMaterial,
  savePartyMemberMaterial,
  executeStageAction,
  STAGE_ACTION,
  MEMBER_STAGE,
  transferApplyMaterialDefs,
  transferApproveReceiptMaterialDef,
  transferApproveReceiptMaterialType,
  hasTransferApplyMaterials,
  hasDelayApplyMaterials
} from '@/api/szhl/partyBuilding/partyMember'

const props = defineProps({
  visible: { type: Boolean, default: false },
  member: { type: Object, default: null },
  /** transfer=同意转正 delay=同意延期 */
  applyType: { type: String, default: 'transfer' }
})

const emit = defineEmits(['update:visible', 'success'])

const { proxy } = getCurrentInstance()

const loading = ref(false)
const submitLoading = ref(false)
const uploadedList = ref([])
const receiptFileUrl = ref('')

const memberGyh = computed(() => props.member?.gyh || '')
const memberHj = computed(() => props.member?.hj || '')
const isDelay = computed(() => props.applyType === 'delay')
const applyTypeLabel = computed(() => isDelay.value ? '延期' : '转正')
const dialogTitle = computed(() => isDelay.value ? '同意延期' : '同意转正')
const confirmButtonText = computed(() => isDelay.value ? '同意延期' : '同意转正')
const confirmMessage = computed(() =>
  isDelay.value ? '确认同意延期转正？提醒将延后6个月' : '确认审批通过并转为正式党员？')
const approveAction = computed(() =>
  isDelay.value ? STAGE_ACTION.APPROVE_DELAY : STAGE_ACTION.APPROVE_FORMAL)

const materialDefs = computed(() => transferApplyMaterialDefs(isDelay.value ? 'delay' : 'transfer'))
const receiptMaterialDef = computed(() => transferApproveReceiptMaterialDef(isDelay.value ? 'delay' : 'transfer'))
const receiptMaterialType = computed(() => transferApproveReceiptMaterialType(isDelay.value ? 'delay' : 'transfer'))

const hasApplyMaterials = computed(() =>
  isDelay.value ? hasDelayApplyMaterials(uploadedList.value) : hasTransferApplyMaterials(uploadedList.value))

const existingReceiptFiles = computed(() => getFiles(receiptMaterialType.value))

const hasReceiptFile = computed(() => !!receiptFileUrl.value || existingReceiptFiles.value.length > 0)

const canApprove = computed(() => {
  if (!hasApplyMaterials.value || !hasReceiptFile.value) return false
  return materialDefs.value.every(def => getFiles(def.type).length > 0)
})

/** 获取指定类型的已上传资料 */
function getFiles(type) {
  return uploadedList.value.filter(item => item.materialType === type)
}

/** 拼接完整文件访问地址 */
function fileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return import.meta.env.VITE_APP_BASE_API + url
}

/** 加载已上传资料列表 */
function loadMaterials() {
  if (!memberGyh.value) return Promise.resolve()
  loading.value = true
  return listPartyMemberMaterial({ memberGyh: memberGyh.value }).then(res => {
    uploadedList.value = res.data || []
  }).finally(() => {
    loading.value = false
  })
}

watch(() => props.visible, (val) => {
  if (!val) return
  uploadedList.value = []
  receiptFileUrl.value = ''
  loadMaterials()
})

/** 关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
}

/** 保存意见回执文件 */
async function saveReceiptMaterialIfNeeded() {
  if (!receiptFileUrl.value) return
  await savePartyMemberMaterial({
    memberGyh: memberGyh.value,
    materialType: receiptMaterialType.value,
    fileUrl: receiptFileUrl.value,
    fileName: receiptFileUrl.value.substring(receiptFileUrl.value.lastIndexOf('/') + 1),
    hj: memberHj.value || MEMBER_STAGE.PROB_TRANSFER
  })
}

/** 审批通过转正或延期 */
function handleApprove() {
  if (!hasApplyMaterials.value) {
    proxy.$modal.msgWarning('未找到' + applyTypeLabel.value + '申请资料')
    return
  }
  const missing = materialDefs.value
    .filter(def => !getFiles(def.type).length)
    .map(def => def.label)
  if (missing.length) {
    proxy.$modal.msgWarning('以下申请资料尚未上传：' + missing.join('、'))
    return
  }
  if (!hasReceiptFile.value) {
    proxy.$modal.msgWarning('请上传意见回执文件')
    return
  }
  proxy.$modal.confirm(confirmMessage.value).then(async () => {
    submitLoading.value = true
    await saveReceiptMaterialIfNeeded()
    return executeStageAction({
      gyh: memberGyh.value,
      action: approveAction.value
    })
  }).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    emit('update:visible', false)
    emit('success')
  }).catch(() => {}).finally(() => {
    submitLoading.value = false
  })
}
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}
.receipt-form {
  margin-top: 16px;
}
.receipt-label {
  color: #C8161D;
}
.file-item {
  line-height: 1.6;
}
.file-item + .file-item {
  margin-top: 4px;
}
</style>
