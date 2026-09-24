<template>
  <el-dialog :model-value="visible" :title="dialogTitle" width="640px" append-to-body destroy-on-close
    @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="资料类型">
        <el-input :model-value="materialTypeLabel(form.materialType)" disabled />
        <el-tag v-if="needReceipt" type="warning" size="small" class="ml4">需回执文件</el-tag>
      </el-form-item>
      <template v-if="isQuarterlyMaterial">
        <el-form-item label="年份" prop="periodYear">
          <el-select v-model="form.periodYear" placeholder="请选择年份" style="width: 100%">
            <el-option v-for="year in yearOptions" :key="year" :label="year + '年'" :value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="季度" prop="periodPart">
          <el-select v-model="form.periodPart" placeholder="请选择季度" style="width: 100%">
            <el-option v-for="item in quarterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </template>
      <template v-else-if="isHalfYearMaterial">
        <el-form-item label="年份" prop="periodYear">
          <el-select v-model="form.periodYear" placeholder="请选择年份" style="width: 100%">
            <el-option v-for="year in yearOptions" :key="year" :label="year + '年'" :value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="半年度" prop="periodPart">
          <el-select v-model="form.periodPart" placeholder="请选择半年度" style="width: 100%">
            <el-option v-for="item in halfYearOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item v-else-if="showPeriod" label="期次" prop="periodKey">
        <el-input v-model="form.periodKey" placeholder="如 2024Q1" />
      </el-form-item>
      <el-form-item label="上传文件" prop="fileUrl">
        <FileUpload v-model="form.fileUrl" :limit="1" :file-size="20"
          :file-type="['doc', 'docx', 'pdf']" />
      </el-form-item>
      <el-form-item v-if="showRemark" label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item v-if="existingList.length" label="已上传">
        <el-table :data="existingList" size="small" max-height="220">
          <el-table-column v-if="showPeriod" label="期次" prop="periodKey" min-width="130" show-overflow-tooltip />
          <el-table-column label="文件名" prop="fileName" min-width="140" show-overflow-tooltip />
          <el-table-column label="是否回执文件" width="110" align="center">
            <template #default="scope">
              <span v-if="scope.row.receiptTime">是</span>
              <el-button v-else-if="scope.row.needReceipt === '1'" link type="primary" size="small"
                v-hasPermi="[STAGE_BUTTON_PERMS.CONFIRM_RECEIPT]"
                @click="handleReceipt(scope.row)">确认</el-button>
              <span v-else>—</span>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" prop="createTime" width="150" />
          <el-table-column label="操作" width="70" align="center">
            <template #default="scope">
              <el-button link type="primary" v-hasPermi="MATERIAL_REMOVE_PERMS"
                @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="submitLoading" @click="submitForm">保 存</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/** 党建管理 - 党员资料上传弹窗 */
import { ref, watch, computed } from 'vue'
import {
  listPartyMemberMaterial,
  savePartyMemberMaterial,
  delPartyMemberMaterial,
  markMaterialReceipt,
  materialTypeLabel,
  needReceipt as isReceiptType,
  MATERIAL_TYPE,
  STAGE_BUTTON_PERMS,
  MATERIAL_REMOVE_PERMS
} from '@/api/szhl/partyBuilding/partyMember'

const props = defineProps({
  visible: { type: Boolean, default: false },
  memberGyh: { type: String, default: '' },
  materialType: { type: String, default: '' },
  materialLabel: { type: String, default: '' },
  showPeriod: { type: Boolean, default: false },
  needReceipt: { type: Boolean, default: false },
  showRemark: { type: Boolean, default: undefined },
  memberHj: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'success'])

const { proxy } = getCurrentInstance()

const formRef = ref(null)
const submitLoading = ref(false)
const existingList = ref([])

const quarterOptions = [
  { label: '第一季度', value: '1' },
  { label: '第二季度', value: '2' },
  { label: '第三季度', value: '3' },
  { label: '第四季度', value: '4' }
]

const halfYearOptions = [
  { label: '上半年', value: '1' },
  { label: '下半年', value: '2' }
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i)

const isQuarterlyMaterial = computed(() =>
  [MATERIAL_TYPE.JDSXHB, MATERIAL_TYPE.FZSXHB].includes(props.materialType))

const isHalfYearMaterial = computed(() => props.materialType === MATERIAL_TYPE.BNKC)

const isStructuredPeriod = computed(() => isQuarterlyMaterial.value || isHalfYearMaterial.value)

const rules = computed(() => {
  const base = {
    fileUrl: [{ required: true, message: '请上传文件', trigger: 'change' }]
  }
  if (isStructuredPeriod.value) {
    base.periodYear = [{ required: true, message: '请选择年份', trigger: 'change' }]
    base.periodPart = [{
      required: true,
      message: isQuarterlyMaterial.value ? '请选择季度' : '请选择半年度',
      trigger: 'change'
    }]
  } else if (props.showPeriod) {
    base.periodKey = [{ required: true, message: '请输入期次', trigger: 'blur' }]
  }
  return base
})

const dialogTitle = computed(() => '上传资料 - ' + (props.materialLabel || materialTypeLabel(props.materialType)))

const noRemarkTypes = [
  MATERIAL_TYPE.THZL,
  MATERIAL_TYPE.JDSXHB,
  MATERIAL_TYPE.BNKC,
  MATERIAL_TYPE.FZSXHB,
  MATERIAL_TYPE.ZZSQ,
  MATERIAL_TYPE.YQSQ,
  MATERIAL_TYPE.ZZBHY,
  MATERIAL_TYPE.ZBQZCL,
  MATERIAL_TYPE.ZZBHY_ZZ,
  MATERIAL_TYPE.ZBQZCL_ZZ,
  MATERIAL_TYPE.ZZBHY_YQ,
  MATERIAL_TYPE.ZBQZCL_YQ
]

const showRemark = computed(() => {
  if (props.showRemark !== undefined) return props.showRemark
  return !noRemarkTypes.includes(props.materialType)
})

/** 获取当前默认季度 */
function defaultQuarter() {
  return String(Math.ceil((new Date().getMonth() + 1) / 3))
}

/** 获取当前默认半年度 */
function defaultHalfYear() {
  return new Date().getMonth() + 1 <= 6 ? '1' : '2'
}

/** 构建期次显示文本 */
function buildPeriodKey(formData) {
  if (isQuarterlyMaterial.value) {
    const quarter = quarterOptions.find(item => item.value === formData.periodPart)
    return `${formData.periodYear}年${quarter?.label || ''}`
  }
  if (isHalfYearMaterial.value) {
    const half = halfYearOptions.find(item => item.value === formData.periodPart)
    return `${formData.periodYear}年${half?.label || ''}`
  }
  return formData.periodKey
}

/** 创建空的资料上传表单 */
function createEmptyForm() {
  return {
    idstr: undefined,
    memberGyh: props.memberGyh,
    materialType: props.materialType,
    fileName: '',
    fileUrl: '',
    periodKey: '',
    periodYear: currentYear,
    periodPart: isHalfYearMaterial.value ? defaultHalfYear()
      : (isQuarterlyMaterial.value ? defaultQuarter() : ''),
    needReceipt: props.needReceipt || isReceiptType(props.materialType) ? '1' : '0',
    remark: '',
    hj: props.memberHj || ''
  }
}

const form = ref(createEmptyForm())

/** 加载已上传资料列表 */
function loadExisting() {
  if (!props.memberGyh || !props.materialType) {
    existingList.value = []
    return
  }
  listPartyMemberMaterial({
    memberGyh: props.memberGyh,
    materialType: props.materialType
  }).then(res => {
    existingList.value = res.data || []
  })
}

watch(() => props.visible, (val) => {
  if (!val) return
  form.value = createEmptyForm()
  loadExisting()
})

watch(() => form.value.fileUrl, (val) => {
  if (!val) {
    form.value.fileName = ''
    return
  }
  form.value.fileName = val.substring(val.lastIndexOf('/') + 1)
})

/** 关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
}

/** 标记资料为回执文件 */
function handleReceipt(row) {
  proxy.$modal.confirm('确认标记为回执文件？').then(() => {
    return markMaterialReceipt(row.idstr)
  }).then(() => {
    proxy.$modal.msgSuccess('已标记为回执文件')
    loadExisting()
    emit('success')
  }).catch(() => {})
}

/** 删除已上传资料 */
function handleDelete(row) {
  proxy.$modal.confirm('确认删除该资料？').then(() => {
    return delPartyMemberMaterial(row.idstr)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    loadExisting()
    emit('success')
  }).catch(() => {})
}

/** 提交资料上传 */
function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    submitLoading.value = true
    const payload = {
      ...form.value,
      periodKey: buildPeriodKey(form.value)
    }
    savePartyMemberMaterial(payload).then(() => {
      proxy.$modal.msgSuccess('上传成功')
      if (props.materialType === MATERIAL_TYPE.THZL) {
        emit('success')
        handleClose()
        return
      }
      form.value = createEmptyForm()
      form.value.fileUrl = ''
      loadExisting()
      emit('success')
    }).finally(() => {
      submitLoading.value = false
    })
  })
}
</script>

<style scoped>
.ml4 {
  margin-left: 8px;
}
</style>
