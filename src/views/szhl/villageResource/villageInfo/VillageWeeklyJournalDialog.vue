<template>
  <el-dialog
    v-model="visible"
    title="村走访周志"
    width="560px"
    append-to-body
    destroy-on-close
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="乡镇">
        <el-input v-model="form.townshipName" disabled />
      </el-form-item>
      <el-form-item label="村名">
        <el-input v-model="form.villageName" disabled />
      </el-form-item>
      <el-form-item label="机构号">
        <el-input v-model="form.orgNo" disabled />
      </el-form-item>
      <el-form-item label="部门">
        <el-input v-model="form.deptName" disabled />
      </el-form-item>
      <el-form-item label="录入人">
        <el-input v-model="form.recorderName" disabled />
      </el-form-item>
      <el-form-item label="日期" prop="journalDate">
        <el-date-picker
          v-model="form.journalDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择走访日期"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="深耕记录" prop="deepCultivationRecord">
        <el-input
          v-model="form.deepCultivationRecord"
          type="textarea"
          :rows="6"
          maxlength="8000"
          show-word-limit
          placeholder="填写本周走访、深耕情况"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="loading" @click="submit">保 存</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { addVillageWeeklyJournal } from '@/api/szhl/villageResource/villageWeeklyJournal'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** 打开弹窗时由父组件传入：村 id、展示用乡镇/村/机构号/部门/录入人 */
  preset: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  villageInfoId: undefined,
  townshipName: '',
  villageName: '',
  orgNo: '',
  deptName: '',
  recorderName: '',
  journalDate: '',
  deepCultivationRecord: ''
})

const rules = {
  journalDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  deepCultivationRecord: [{ required: true, message: '请填写深耕记录', trigger: 'blur' }]
}

function applyPreset() {
  const p = props.preset
  if (!p || p.villageInfoId == null) return
  form.value = {
    villageInfoId: p.villageInfoId,
    townshipName: p.townshipName || '',
    villageName: p.villageName || '',
    orgNo: p.orgNo || '',
    deptName: p.deptName || '',
    recorderName: p.recorderName || '',
    journalDate: '',
    deepCultivationRecord: ''
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      applyPreset()
    }
  }
)

function onClosed() {
  emit('update:modelValue', false)
}

function submit() {
  formRef.value?.validate((ok) => {
    if (!ok) return
    loading.value = true
    addVillageWeeklyJournal({
      villageInfoId: form.value.villageInfoId,
      journalDate: form.value.journalDate,
      deepCultivationRecord: form.value.deepCultivationRecord
    })
      .then(() => {
        proxy.$modal.msgSuccess('周志保存成功')
        visible.value = false
        emit('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
