<template>
  <span class="sensitive-value">
    <span>{{ isVisible ? plainValue : displayValue }}</span>
    <button
      v-if="actionable"
      type="button"
      class="copy-button"
      :title="buttonTitle"
      :aria-label="buttonTitle"
      @click.stop="handleAction"
    >
      <el-icon>
        <View v-if="!isVisible" />
        <DocumentCopy v-else />
      </el-icon>
    </button>
  </span>
</template>

<script setup name="SensitiveValue">
import { computed, getCurrentInstance, ref } from 'vue'
import { DocumentCopy, View } from '@element-plus/icons-vue'

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' }
})

const { proxy } = getCurrentInstance()

const fieldType = computed(() => sensitiveFieldType(props.label))
const actionable = computed(() => Boolean(fieldType.value) && !isEmptyValue(props.value))
const isVisible = ref(false)

const plainValue = computed(() => isEmptyValue(props.value) ? '--' : String(props.value))
const displayValue = computed(() => {
  if (isEmptyValue(props.value)) return '--'
  return fieldType.value ? maskSensitiveValue(props.value, fieldType.value) : props.value
})

const buttonTitle = computed(() => (isVisible.value ? `复制${props.label}明文` : `查看${props.label}明文`))

function sensitiveFieldType(label) {
  const text = String(label || '')
  if (/手机号|手机号码|电话号码/.test(text)) return 'phone'
  if (/证件号|证件号码|身份证号|统信码|统一社会信用代码/.test(text)) return 'identifier'
  if (/合同号/.test(text)) return 'contract'
  if (/贷款编号|贷款号|贷款号码|借据号|借款编号|借据编号/.test(text)) return 'loan'
  if (/账号/.test(text)) return 'account'
  return ''
}

function maskSensitiveValue(value, type) {
  if (!type || isEmptyValue(value)) return value
  const text = String(value)
  if (/[*＊]/.test(text)) return text
  if (text.length <= 2) return '*'.repeat(text.length)
  if (text.length <= 7) {
    return `${text.slice(0, 1)}${'*'.repeat(text.length - 2)}${text.slice(-1)}`
  }
  return `${text.slice(0, 3)}****${text.slice(-4)}`
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === '' || value === '--'
}

function copyTextFallback(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    return document.execCommand('copy')
  } finally {
    textarea.remove()
  }
}

async function copyPlainText() {
  const text = String(props.value)
  try {
    let copied = false
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        copied = true
      } catch {
        copied = false
      }
    }
    if (!copied) copied = copyTextFallback(text)
    if (!copied) throw new Error('copy failed')
    proxy.$modal.msgSuccess('复制成功')
  } catch {
    proxy.$modal.msgError('复制失败，请手动复制')
  }
}

function handleAction() {
  if (!isVisible.value) {
    isVisible.value = true
    return
  }
  copyPlainText()
}
</script>

<style scoped>
.sensitive-value {
  display: inline-flex;
  align-items: center;
}

.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  padding: 0;
  color: #909399;
  background: transparent;
  border: 0;
  border-radius: 3px;
  cursor: pointer;
}

.copy-button:hover,
.copy-button:focus-visible {
  color: #1890ff;
  background: #ecf5ff;
  outline: none;
}
</style>
