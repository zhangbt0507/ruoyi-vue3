import { formatMoney } from '@/utils/ruoyi'

const DECIMAL_DATA_TYPES = ['decimal', 'numeric', 'double', 'float']

// 数据标签展示口径：列头拼接管理端配置的单位，布尔标签显示是/否。原始值不做修改。
export function formatDataTagLabel(labelName, unit) {
  const raw = String(labelName || '')
  // 列注释可能带取值说明（如「有效合同(1有/空无)」），展示时只取主体，避免与单位重复
  const base = raw.replace(/[（(].*$/, '').trim() || raw
  if (!base) {
    return ''
  }
  const normalizedUnit = String(unit == null ? '' : unit).trim()
  return normalizedUnit ? `${base}（${normalizedUnit}）` : base
}

// decimal 等金额/小数类型的字段，在客户归属列表和导出中按万元展示。
export function isYuanAmountField(field) {
  if (!field || field.tagColumn === true) {
    return false
  }
  const dataType = String(field.dataType || '').trim().toLowerCase()
  return DECIMAL_DATA_TYPES.includes(dataType)
}

export function formatYuanToWan(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return value
  }
  // 万元保留两位等价于按百元 HALF_UP，再除以 100；负数需对称舍入。
  const rounded = Math.sign(number) * Math.round(Math.abs(number) / 100) / 100
  return formatMoney(rounded, 2)
}

// 1=是，0=否，空值留空；其他历史异常值保留原值便于发现问题
export function formatDataTagBoolean(value) {
  if (value === null || value === undefined) {
    return ''
  }
  const text = String(value).trim()
  if (!text) {
    return ''
  }
  if (text === '1') {
    return '是'
  }
  if (text === '0') {
    return '否'
  }
  return String(value)
}
