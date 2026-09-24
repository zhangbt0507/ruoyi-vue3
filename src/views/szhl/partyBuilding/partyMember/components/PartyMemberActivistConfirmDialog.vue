<template>
  <el-dialog :model-value="visible" title="资料上传" width="820px" append-to-body destroy-on-close
    @close="handleClose">
    <div v-loading="loading">
      <el-table :data="materialRows" size="small">
        <el-table-column label="资料类型" min-width="200">
          <template #default="scope">
            {{ scope.row.label }}
            <el-tag v-if="scope.row.required" type="danger" size="small" class="ml4">必填</el-tag>
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

      <el-form v-if="step === 2" label-width="120px" class="contact-form">
        <el-form-item label="培养联系人一" required>
          <el-select v-model="contactGyh1" placeholder="请选择在册、在职、无处分的正式党员" filterable style="width: 100%">
            <el-option v-for="item in userOptions" :key="'pylxr1-' + item.userName"
              :label="item.nickName + '（' + item.userName + '）'" :value="item.userName"
              :disabled="item.userName === contactGyh2 || item.userName === memberGyh" />
          </el-select>
        </el-form-item>
        <el-form-item label="培养联系人二" required>
          <el-select v-model="contactGyh2" placeholder="请选择在册、在职、无处分的正式党员" filterable style="width: 100%">
            <el-option v-for="item in userOptions" :key="'pylxr2-' + item.userName"
              :label="item.nickName + '（' + item.userName + '）'" :value="item.userName"
              :disabled="item.userName === contactGyh1 || item.userName === memberGyh" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <template v-if="step === 1">
        <el-button type="primary" @click="handleConfirmClick">确定积极分子</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </template>
      <template v-else>
        <el-button type="primary" :loading="submitLoading" @click="submitConfirm">确 认</el-button>
        <el-button @click="step = 1">返 回</el-button>
      </template>
    </template>

    <PartyMemberMaterialDialog v-model:visible="uploadOpen" :member-gyh="memberGyh"
      :material-type="uploadType" :material-label="uploadLabel" :show-remark="false"
      :member-hj="member?.hj" @success="handleUploadSuccess" />
  </el-dialog>
</template>

<script setup>
/** 党建管理 - 确定积极分子弹窗 */
import { ref, watch, computed } from 'vue'
import {
  listPartyMemberMaterial,
  listEligibleFormalMembersForContact,
  executeStageAction,
  STAGE_ACTION,
  activistConfirmMaterialDefs,
  getMissingRequiredMaterialLabels,
  mapFormalMemberSelectOptions
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
const step = ref(1)
const uploadedList = ref([])
const userOptions = ref([])
const contactGyh1 = ref('')
const contactGyh2 = ref('')

const uploadOpen = ref(false)
const uploadType = ref('')
const uploadLabel = ref('')

const memberGyh = computed(() => props.member?.gyh || '')

const materialDefs = computed(() => activistConfirmMaterialDefs(props.member || {}))

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

/** 加载培养联系人候选列表 */
function loadUsers() {
  return listEligibleFormalMembersForContact().then(res => {
    userOptions.value = mapFormalMemberSelectOptions(res.data || [], memberGyh.value)
  })
}

/** 重置弹窗状态 */
function resetState() {
  step.value = 1
  contactGyh1.value = ''
  contactGyh2.value = ''
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
  uploadOpen.value = true
}

/** 资料上传成功后刷新列表 */
function handleUploadSuccess() {
  loadMaterials()
}

/** 校验资料并进入下一步 */
function handleConfirmClick() {
  const uploadedTypes = uploadedList.value.map(item => item.materialType)
  const missing = getMissingRequiredMaterialLabels(materialDefs.value, uploadedTypes)
  if (missing.length) {
    proxy.$modal.msgWarning('以下必填资料尚未上传：' + missing.join('、'))
    return
  }
  loadUsers().then(() => {
    if (!userOptions.value.length) {
      proxy.$modal.msgWarning('暂无可选的在册、在职、无处分的正式党员')
      return
    }
    step.value = 2
  })
}

/** 提交确定积极分子 */
function submitConfirm() {
  if (!contactGyh1.value || !contactGyh2.value) {
    proxy.$modal.msgWarning('请选择两名培养联系人')
    return
  }
  if (contactGyh1.value === contactGyh2.value) {
    proxy.$modal.msgWarning('两名培养联系人不能为同一人')
    return
  }
  submitLoading.value = true
  executeStageAction({
    gyh: memberGyh.value,
    action: STAGE_ACTION.CONFIRM_ACTIVIST,
    pylxrGyh: contactGyh1.value,
    pylxr2Gyh: contactGyh2.value
  }).then(() => {
    proxy.$modal.msgSuccess('已确定为积极分子')
    emit('update:visible', false)
    emit('success')
  }).finally(() => {
    submitLoading.value = false
  })
}
</script>

<style scoped>
.ml4 {
  margin-left: 4px;
}
.contact-form {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
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
