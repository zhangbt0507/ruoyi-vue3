import { computed, getCurrentInstance, ref } from 'vue'
import { getDeltaColumns } from '@/api/szhl/crm/stats'
import { getColumnConfig, saveColumnConfig } from '@/api/szhl/crm/column'
import { listDataTag } from '@/api/szhl/crm/dataTag'
import { formatDataTagLabel } from '@/utils/crmDataTag'

const MAX_DELTA_COLUMNS = 30

export function useStatsColumnSettings(pageKey, refresh) {
  const { proxy } = getCurrentInstance()
  const columnDialogOpen = ref(false)
  const deltaColumnDefs = ref([])
  const dataTagCategories = ref([])
  const visibleColumnKeys = ref([])
  const baseColumnDefs = [
    { key: 'customerId', label: '客户内码', visible: false }
  ]
  const visibleBaseColumnKeys = ref(baseColumnDefs.filter(item => item.visible).map(item => item.key))

  const defaultColumnKeys = computed(() => deltaColumnDefs.value
    .filter(item => item.defaultVisible)
    .map(item => item.fieldName))

  const dialogColumns = computed(() => deltaColumnDefs.value.map(item => ({
    key: item.fieldName,
    label: formatDataTagLabel(item.labelName, item.unit),
    visible: visibleColumnKeys.value.includes(item.fieldName),
    dataField: item.fieldName,
    subjectScope: item.subjectScope,
    categoryId: item.categoryId
  })).concat(baseColumnDefs.map(item => ({ ...item, dataField: false, visible: visibleBaseColumnKeys.value.includes(item.key) }))))

  function normalizeColumnKeys(keys) {
    const valid = new Set([
      ...deltaColumnDefs.value.map(item => item.fieldName),
      ...baseColumnDefs.map(item => item.key)
    ])
    return (keys || []).filter(key => valid.has(key))
  }

  function checkColumnLimit(keys) {
    const metricCount = keys.filter(key => deltaColumnDefs.value.some(item => item.fieldName === key)).length
    if (metricCount > MAX_DELTA_COLUMNS) {
      proxy.$modal.msgWarning(`指标列最多选择 ${MAX_DELTA_COLUMNS} 列，当前已选 ${metricCount} 列`)
      return false
    }
    return true
  }

  function mergeDataTagMeta(deltaColumns, fields) {
    const dataTagFields = new Map((fields || [])
      .filter(item => item && item.fieldName)
      .map(item => [item.fieldName, item]))
    return (deltaColumns || []).map(item => {
      const dataTagField = dataTagFields.get(item.fieldName)
      if (!dataTagField) return item
      return {
        ...item,
        labelName: dataTagField.labelName || item.labelName,
        dataType: dataTagField.dataType || item.dataType,
        subjectScope: dataTagField.subjectScope || item.subjectScope,
        unit: dataTagField.unit,
        defaultVisible: dataTagField.defaultVisible == null ? item.defaultVisible : dataTagField.defaultVisible,
        categoryId: dataTagField.categoryId
      }
    })
  }

  function applyColumns(keys) {
    const normalized = normalizeColumnKeys(keys)
    if (!checkColumnLimit(normalized)) return
    visibleColumnKeys.value = normalized.filter(key => deltaColumnDefs.value.some(item => item.fieldName === key))
    visibleBaseColumnKeys.value = normalized.filter(key => baseColumnDefs.some(item => item.key === key))
    columnDialogOpen.value = false
    refresh()
  }

  function saveColumns(keys) {
    const normalized = normalizeColumnKeys(keys)
    if (!checkColumnLimit(normalized)) return
    saveColumnConfig({ pageKey, columns: JSON.stringify(normalized) }).then(() => {
      proxy.$modal.msgSuccess('列设置已保存')
      visibleColumnKeys.value = normalized.filter(key => deltaColumnDefs.value.some(item => item.fieldName === key))
      visibleBaseColumnKeys.value = normalized.filter(key => baseColumnDefs.some(item => item.key === key))
      columnDialogOpen.value = false
      refresh()
    })
  }

  function loadColumnSettings() {
    return Promise.all([
      getDeltaColumns(),
      listDataTag().catch(() => ({ data: {} }))
    ]).then(([deltaRes, dataTagRes]) => {
      const dataTagMeta = dataTagRes.data || {}
      dataTagCategories.value = dataTagMeta.categories || []
      deltaColumnDefs.value = mergeDataTagMeta(deltaRes.data, dataTagMeta.fields)
      return getColumnConfig(pageKey)
    }).then(res => {
      let saved = []
      try {
        saved = res.data && res.data.columns ? JSON.parse(res.data.columns) : []
      } catch (e) {
        saved = []
      }
      const normalized = normalizeColumnKeys(saved)
      const metricKeys = normalized.filter(key => deltaColumnDefs.value.some(item => item.fieldName === key)).slice(0, MAX_DELTA_COLUMNS)
      const baseKeys = normalized.filter(key => baseColumnDefs.some(item => item.key === key))
      visibleColumnKeys.value = metricKeys.length > 0
        ? metricKeys
        : defaultColumnKeys.value.slice(0, MAX_DELTA_COLUMNS)
      visibleBaseColumnKeys.value = baseKeys.length > 0
        ? baseKeys
        : baseColumnDefs.filter(item => item.visible).map(item => item.key)
    })
  }

  return {
    MAX_DELTA_COLUMNS,
    columnDialogOpen,
    deltaColumnDefs,
    dataTagCategories,
    visibleColumnKeys,
    visibleBaseColumnKeys,
    defaultColumnKeys,
    dialogColumns,
    applyColumns,
    saveColumns,
    loadColumnSettings
  }
}
