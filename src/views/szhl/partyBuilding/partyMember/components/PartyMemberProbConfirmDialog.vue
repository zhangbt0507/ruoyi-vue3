<template>
  <el-dialog :model-value="visible" title="资料上传" width="820px" append-to-body destroy-on-close
    @close="handleClose">
    <div v-loading="loading">
      <el-table :data="materialRows" size="small">
        <el-table-column label="资料类型" min-width="200">
          <template #default="scope">
            {{ scope.row.label }}
            <el-tag v-if="scope.row.required" type="danger" size="small" class="ml4">必填</el-tag>
            <el-tag v-if="scope.row.needReceipt" type="warning" size="small" class="ml4">需回执</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.uploaded" type="success" size="small">已上传</el-tag>
            <el-tag v-else type="info" size="small">未上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件" min-width="200">
          <template #default="scope">
            <template v-if="scope.row.files.length">
              <div v-for="file in scope.row.files" :key="file.idstr || file.fileUrl" class="file-item">
                <el-link type="primary" :href="fileUrl(file.fileUrl)" target="_blank" :title="file.fileName">
                  {{ file.fileName || '查看文件' }}
                </el-link>
              </div>
            </template>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="openUpload(scope.row)">上传</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button type="primary" :loading="submitLoading" @click="handleConfirmClick">确定预备党员</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </template>

    <PartyMemberMaterialDialog v-model:visible="uploadOpen" :member-gyh="memberGyh"
      :material-type="uploadType" :material-label="uploadLabel" :need-receipt="uploadNeedReceipt"
      :show-remark="false" :member-hj="member?.hj" @success="handleUploadSuccess" />
  </el-dialog>
</template>

<script setup>
/** 党建管理 - 确定预备党员弹窗 */
import { ref, watch, computed } from 'vue'
import {
  listPartyMemberMaterial,
  executeStageAction,
  STAGE_ACTION,
  probConfirmMaterialDefs,
  getMissingRequiredMaterialLabels
} from '@/api/szhl/partyBuilding/partyMember'
import PartyMemberMaterialDialog from './PartyMemberMaterialDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  member: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const { proxy } = getCurrentInstance()

const loading = ref(false)
const submitLoading = ref(false)
const uploadedList = ref([])

const uploadOpen = ref(false)
const uploadType = ref('')
const uploadLabel = ref('')
const uploadNeedReceipt = ref(false)

const memberGyh = computed(() => props.member?.gyh || '')

const materialDefs = computed(() => probConfirmMaterialDefs(props.member || {}))

const materialRows = computed(() => {
  const map = {}
  uploadedList.value.forEach(item => {
    if (!map[item.materialType]) {
      map[item.materialType] = []
    }
    map[item.materialType].push(item)
  })
  return materialDefs.value.map(def => {
    const files = map[def.type] || []
    return {
      ...def,
      uploaded: files.length > 0,
      files
    }
  })
})

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

/** 重置弹窗状态 */
function resetState() {
  uploadedList.value = []
}

watch(() => props.visible, (val) => {
  if (!val) return
  resetState()
  loadMaterials()
})

/** 关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
}

/** 打开资料上传弹窗 */
function openUpload(row) {
  uploadType.value = row.type
  uploadLabel.value = row.label
  uploadNeedReceipt.value = !!row.needReceipt
  uploadOpen.value = true
}

/** 资料上传成功后刷新列表 */
function handleUploadSuccess() {
  loadMaterials()
}

/** 校验资料并提交确定预备党员 */
function handleConfirmClick() {
  const uploadedTypes = uploadedList.value.map(item => item.materialType)
  const missing = getMissingRequiredMaterialLabels(materialDefs.value, uploadedTypes)
  if (missing.length) {
    proxy.$modal.msgWarning('以下必填资料尚未上传：' + missing.join('、'))
    return
  }
  proxy.$modal.confirm('确认确定为预备党员？').then(() => {
    submitLoading.value = true
    return executeStageAction({
      gyh: memberGyh.value,
      action: STAGE_ACTION.CONFIRM_PROB
    })
  }).then(() => {
    proxy.$modal.msgSuccess('已确定为预备党员')
    emit('update:visible', false)
    emit('success')
  }).catch(() => {}).finally(() => {
    submitLoading.value = false
  })
}
</script>

<style scoped>
.ml4 {
  margin-left: 4px;
}
.file-item {
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-item + .file-item {
  margin-top: 2px;
}
</style>
