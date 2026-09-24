<template>
  <div class="app-container crm-page data-tag-page">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="tag-tree-wrap">
          <div class="tag-tree-header">
            <span class="tag-tree-header__title">标签分类</span>
            <el-button link type="primary" icon="Plus" @click="handleAddCategory" v-hasPermi="['crm:dataTag:edit']">新增</el-button>
          </div>
          <el-tree
            ref="treeRef"
            :data="categoryTreeData"
            :props="{ label: 'label' }"
            :expand-on-click-node="false"
            node-key="key"
            highlight-current
            :draggable="canEditDataTag"
            :allow-drag="allowCategoryDrag"
            :allow-drop="allowCategoryDrop"
            @node-drop="handleCategoryDrop"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="tag-tree-node">
                <span class="tag-tree-node__label">{{ data.label }}</span>
                <span v-if="data.manageable" class="tag-tree-node__actions" v-hasPermi="['crm:dataTag:edit']">
                  <el-icon title="重命名" @click.stop="handleRenameCategory(data)"><Edit /></el-icon>
                  <el-icon title="删除" @click.stop="handleDeleteCategory(data)"><Delete /></el-icon>
                </span>
                <span class="tag-tree-node__count">{{ data.count }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <div class="page-toolbar">
          <el-button type="primary" plain icon="MagicStick" :loading="initing" @click="handleInitFromWideTable" v-hasPermi="['crm:dataTag:add']">一键初始化</el-button>
          <template v-if="showSyncTrigger">
            <el-button type="warning" plain icon="RefreshRight" :disabled="isRunning('dataTagRebuild')" @click="handleTriggerDataTagRebuild">
              {{ isRunning('dataTagRebuild') ? '宽表重建中…' : '重建标签宽表' }}
            </el-button>
            <el-button type="warning" plain icon="Clock" :disabled="isRunning('latestContact')" @click="handleTriggerLatestContactSync">
              {{ isRunning('latestContact') ? '触达同步中…' : '同步最近触达' }}
            </el-button>
          </template>
        </div>

        <el-alert v-if="showSyncTrigger && syncProgressLines.length" type="info" :closable="false" class="sync-progress-bar">
          <div v-for="line in syncProgressLines" :key="line.key">{{ line.text }}</div>
        </el-alert>

        <div class="query-row">
          <el-form :model="queryParams" inline class="query-form" @submit.prevent>
            <el-form-item label="适用范围">
              <el-select v-model="queryParams.subjectScope" placeholder="全部" clearable style="width: 130px" @change="handleScopeChange">
                <el-option label="全部" value="" />
                <el-option v-for="item in scopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="标签字段">
              <el-input
                v-model="queryParams.labelName"
                placeholder="标签名称 / 前端字段 / 数据库列"
                clearable
                style="width: 280px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
                <el-option label="启用" value="0" />
                <el-option label="停用" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-popover placement="bottom-end" :width="180" trigger="click">
            <template #reference>
              <el-button circle icon="Menu" />
            </template>
            <div class="col-settings">
              <div class="col-settings__title">显示列</div>
              <el-checkbox
                v-for="col in columns"
                :key="col.key"
                v-model="col.visible"
                class="col-settings__item"
              >{{ col.label }}</el-checkbox>
            </div>
          </el-popover>
        </div>

        <div v-if="selectedRows.length" class="batch-bar">
          <span class="batch-bar__summary">已选择 {{ selectedRows.length }} 项</span>
          <div class="batch-bar__actions">
            <el-button size="small" plain type="success" icon="CircleCheck" @click="batchStatus('0')" v-hasPermi="['crm:dataTag:edit']">批量启用</el-button>
            <el-button size="small" plain type="warning" icon="CircleClose" @click="batchStatus('1')" v-hasPermi="['crm:dataTag:edit']">批量停用</el-button>
            <el-button size="small" plain icon="View" @click="batchVisible(true)" v-hasPermi="['crm:dataTag:edit']">批量默认显示</el-button>
            <el-button size="small" plain icon="Hide" @click="batchVisible(false)" v-hasPermi="['crm:dataTag:edit']">批量默认隐藏</el-button>
            <el-button size="small" plain icon="FolderAdd" @click="batchCategoryOpen = true" v-hasPermi="['crm:dataTag:edit']">批量归类</el-button>
            <el-button size="small" link @click="clearSelection">清空</el-button>
          </div>
        </div>

        <el-table ref="tableRef" v-loading="loading" :data="rows" row-key="id" height="560" empty-text="暂无数据标签配置" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="48" />
          <el-table-column v-if="canReorder" label="排序" width="58" align="center">
            <template #default="{ row }">
              <el-tooltip content="拖拽调整顺序" placement="top">
                <span
                  v-hasPermi="['crm:dataTag:edit']"
                  class="drag-handle"
                  draggable="true"
                  @dragstart="handleDragStart(row, $event)"
                  @dragenter.prevent="handleDragEnter(row)"
                  @dragover.prevent
                  @dragend="handleDragEnd"
                >⋮⋮</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="标签名称" prop="labelName" show-overflow-tooltip />
          <el-table-column label="适用范围" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="scopeTagMap[row.subjectScope]" :type="scopeTagMap[row.subjectScope].type" effect="plain">
                {{ scopeTagMap[row.subjectScope].label }}
              </el-tag>
              <span v-else>{{ row.subjectScope || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="前端字段" prop="fieldName" min-width="150" show-overflow-tooltip v-if="columns[0].visible" />
          <el-table-column label="数据库列" prop="columnName" min-width="170" show-overflow-tooltip v-if="columns[1].visible" />
          <el-table-column label="数据类型" width="100" align="center">
            <template #default="{ row }">{{ valueTypeLabel(row.valueType) }}</template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="80" align="center" v-if="columns[3].visible">
            <template #default="{ row }">{{ row.unit || '-' }}</template>
          </el-table-column>
          <el-table-column label="布尔标签" width="90" align="center" v-if="columns[2].visible">
            <template #default="{ row }">{{ row.tagColumn ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column label="默认显示" width="90" align="center">
            <template #default="{ row }">{{ row.defaultVisible ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column label="所属分类" width="120" align="center">
            <template #default="{ row }">{{ categoryNameOf(row.categoryId) }}</template>
          </el-table-column>
          <el-table-column label="顺序" prop="sortOrder" width="80" align="right" v-if="columns[4].visible" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <button
                type="button"
                class="status-tag-button"
                :class="{ 'is-editable': canEditDataTag, 'is-updating': statusUpdatingId === row.id }"
                :disabled="!canEditDataTag || statusUpdatingId !== undefined"
                :aria-label="canEditDataTag ? `${row.status === '0' ? '停用' : '启用'}${row.labelName}` : undefined"
                @click="toggleStatus(row)"
              >
                <el-tag :type="row.status === '0' ? 'success' : 'info'" effect="plain">
                  {{ row.status === '0' ? '启用' : '停用' }}
                </el-tag>
              </button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" icon="Top" title="上移" :disabled="!canMoveRow(row, -1) || ordering" @click="moveRow(row, -1)" v-hasPermi="['crm:dataTag:edit']" />
              <el-button link type="primary" icon="Bottom" title="下移" :disabled="!canMoveRow(row, 1) || ordering" @click="moveRow(row, 1)" v-hasPermi="['crm:dataTag:edit']" />
              <el-button link type="primary" icon="Edit" title="修改" @click="openEdit(row)" v-hasPermi="['crm:dataTag:edit']" />
              <el-button link type="danger" icon="Delete" title="删除" @click="handleDelete(row)" v-hasPermi="['crm:dataTag:remove']" />
            </template>
          </el-table-column>
        </el-table>

        <common-pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <el-dialog v-model="formOpen" :title="formTitle" width="620px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="108px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标签名称" prop="labelName">
              <el-input v-model="form.labelName" maxlength="100" placeholder="业务展示名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用范围" prop="subjectScope">
              <el-select v-model="form.subjectScope" disabled style="width: 100%">
                <el-option v-for="item in scopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="前端字段" prop="fieldName">
              <el-input v-model="form.fieldName" disabled placeholder="选择数据库列后自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据库列" prop="columnName">
              <el-select
                v-if="!form.id"
                v-model="form.columnName"
                filterable
                placeholder="请选择宽表字段"
                style="width: 100%"
                @change="handlePhysicalFieldChange"
              >
                <el-option
                  v-for="item in physicalFields"
                  :key="item.columnName"
                  :label="`${item.labelName || item.columnName}（${item.columnName}）`"
                  :value="item.columnName"
                />
              </el-select>
              <el-input v-else v-model="form.columnName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据类型" prop="valueType">
              <el-select v-model="form.valueType" disabled style="width: 100%">
                <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="展示单位">
              <el-input v-model="form.unit" maxlength="20" placeholder="如 元、户、笔" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="布尔标签">
              <el-switch v-model="form.tagColumn" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认显示">
              <el-switch v-model="form.defaultVisible" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formOpen = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量归类 -->
    <el-dialog title="批量归类" v-model="batchCategoryOpen" width="420px" append-to-body @open="loadCategories">
      <el-select v-model="batchCategoryId" placeholder="选择分类（清空=移出分类）" clearable style="width: 100%">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.categoryName" :value="cat.id" />
      </el-select>
      <template #footer>
        <el-button @click="batchCategoryOpen = false">取消</el-button>
        <el-button type="primary" :loading="batchSubmitting" @click="submitBatchCategory">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="DataTag">
import { getCurrentInstance, computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import useUserStore from '@/store/modules/user'
import {
  addDataTagCategory,
  addDataTagDefinition,
  batchUpdateDataTagCategory,
  batchUpdateDataTagStatus,
  batchUpdateDataTagVisible,
  deleteDataTagCategory,
  deleteDataTagDefinition,
  getDataTagDefinition,
  getSyncProgress,
  initDataTagFromWideTable,
  listDataTagCategories,
  listDataTagDefinitions,
  triggerDataTagRebuild,
  triggerLatestContactSync,
  updateDataTagCategory,
  updateDataTagDefinition,
  updateDataTagOrder
} from '@/api/szhl/crm/dataTag'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const canEditDataTag = computed(() => proxy.$auth.hasPermi('crm:dataTag:edit'))
// 手动触发同步的柜员号白名单，需与后端 CrmDataTagDefinitionController 保持一致
const SYNC_TRIGGER_WHITELIST = ['9070741', 'admin']
const showSyncTrigger = computed(() => SYNC_TRIGGER_WHITELIST.includes(userStore.name))
const SYNC_TASK_LABELS = { dataTagRebuild: '宽表重建', latestContact: '最近触达同步' }
const syncProgress = reactive({ dataTagRebuild: null, latestContact: null })
let syncPollTimer = null
const scopeOptions = [
  { label: '通用标签', value: 'COMMON' },
  { label: '个人标签', value: 'PERSONAL' },
  { label: '对公标签', value: 'CORPORATE' }
]
// 适用范围列的标签展示样式；element-plus 2.2 的 el-tag 无 primary 字面量，空串即默认主色
const scopeTagMap = {
  COMMON: { label: '通用', type: 'info' },
  PERSONAL: { label: '私', type: '' },
  CORPORATE: { label: '公', type: 'warning' }
}
// 查询「其他」（未归类）标签的哨兵值，需与后端 CrmDataTagDefinitionMapper.xml selectList 保持一致
const UNCATEGORIZED = -1
const valueTypeOptions = [
  { label: '布尔', value: 'BOOLEAN' },
  { label: '文本', value: 'TEXT' },
  { label: '整数', value: 'INTEGER' },
  { label: '金额/小数', value: 'DECIMAL' },
  { label: '日期', value: 'DATE' }
]

const loading = ref(false)
const submitting = ref(false)
const batchSubmitting = ref(false)
const rows = ref([])
const total = ref(0)
const formOpen = ref(false)
const formTitle = ref('新增数据标签')
const formRef = ref()
const tableRef = ref()
const physicalFields = ref([])
const selectedRows = ref([])
const ordering = ref(false)
const statusUpdatingId = ref()
const draggingId = ref()
const dragOriginalIds = ref([])
// 列显隐配置：默认隐藏前端字段、数据库列、布尔标签、单位、顺序五列，用户可在右侧工具栏「显隐列」中勾选显示
const columns = ref([
  { key: 0, label: '前端字段', visible: false },
  { key: 1, label: '数据库列', visible: false },
  { key: 2, label: '布尔标签', visible: false },
  { key: 3, label: '单位', visible: false },
  { key: 4, label: '顺序', visible: false }
])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  subjectScope: '',
  labelName: undefined,
  status: undefined,
  categoryId: undefined
})
const form = reactive(emptyForm())
const fieldPattern = /^[A-Za-z][A-Za-z0-9_]*$/
const rules = {
  labelName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  subjectScope: [{ required: true, message: '请选择适用范围', trigger: 'change' }],
  fieldName: [
    { required: true, message: '请输入前端字段', trigger: 'blur' },
    { pattern: fieldPattern, message: '只能包含字母、数字、下划线，且以字母开头', trigger: 'blur' }
  ],
  columnName: [
    { required: true, message: '请输入数据库列', trigger: 'blur' },
    { pattern: fieldPattern, message: '只能包含字母、数字、下划线，且以字母开头', trigger: 'blur' }
  ],
  valueType: [{ required: true, message: '请选择数据类型', trigger: 'change' }]
}

function emptyForm() {
  return {
    id: undefined,
    labelName: '',
    fieldName: '',
    columnName: '',
    subjectScope: queryParams?.subjectScope || 'COMMON',
    valueType: 'TEXT',
    unit: '',
    tagColumn: false,
    defaultVisible: false,
    sortOrder: 0,
    status: '0',
    remark: ''
  }
}

function resetForm(data) {
  Object.assign(form, emptyForm(), data || {})
}

function getList() {
  loading.value = true
  return listDataTagDefinitions(queryParams).then(res => {
    rows.value = res.rows || []
    total.value = res.total || 0
    selectedRows.value = []
  }).finally(() => {
    loading.value = false
  })
}

function handleScopeChange() {
  // clearable 清除后值为 undefined，归一为 '' 表示全部
  if (queryParams.subjectScope == null) queryParams.subjectScope = ''
  queryParams.pageNum = 1
  getList()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.subjectScope = ''
  queryParams.labelName = undefined
  queryParams.status = undefined
  handleQuery()
}

function openEdit(row) {
  getDataTagDefinition(row.id).then(res => {
    resetForm(res.data)
    formTitle.value = '修改数据标签'
    formOpen.value = true
  })
}

function handlePhysicalFieldChange(columnName) {
  const field = physicalFields.value.find(item => item.columnName === columnName)
  if (!field) return
  form.fieldName = field.fieldName
  form.labelName = field.labelName || field.columnName
  form.tagColumn = field.tagColumn === true
  form.valueType = inferValueType(field)
  // 单位以本表配置为准，这里只做预填，管理员可修改或清空
  form.unit = field.unit || ''
}

function inferValueType(field) {
  if (field.tagColumn === true) return 'BOOLEAN'
  const dataType = String(field.dataType || '').toLowerCase()
  if (['date', 'datetime', 'timestamp'].includes(dataType)) return 'DATE'
  if (dataType.includes('int')) return 'INTEGER'
  if (['decimal', 'numeric', 'double', 'float'].includes(dataType)) return 'DECIMAL'
  return 'TEXT'
}

function valueTypeLabel(value) {
  return valueTypeOptions.find(item => item.value === value)?.label || value || '-'
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    submitting.value = true
    const request = form.id ? updateDataTagDefinition(form) : addDataTagDefinition(form)
    request.then(() => {
      proxy.$modal.msgSuccess(form.id ? '修改成功' : '新增成功')
      formOpen.value = false
      getList()
      loadTagCounts()
    }).finally(() => {
      submitting.value = false
    })
  })
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除数据标签“${row.labelName}”吗？`).then(() => {
    return deleteDataTagDefinition(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
    loadTagCounts()
  }).catch(() => {})
}

function handleSelectionChange(selection) {
  selectedRows.value = selection || []
}

function isRunning(taskKey) {
  return syncProgress[taskKey]?.status === 'RUNNING'
}

const syncProgressLines = computed(() => {
  const lines = []
  for (const key of Object.keys(SYNC_TASK_LABELS)) {
    const p = syncProgress[key]
    if (!p) continue
    let text = `${SYNC_TASK_LABELS[key]}：${p.phase || p.status}，已处理 ${p.processed || 0} 条`
    if (p.status === 'SUCCESS') text = `${SYNC_TASK_LABELS[key]}：已完成，共 ${p.result ?? p.processed} 条`
    if (p.status === 'FAILED') text = `${SYNC_TASK_LABELS[key]}：执行失败（${p.message || '未知原因'}）`
    lines.push({ key, text })
  }
  return lines
})

function fetchSyncProgress() {
  getSyncProgress().then(res => {
    const data = res.data || {}
    for (const key of Object.keys(SYNC_TASK_LABELS)) {
      const prev = syncProgress[key]
      const next = data[key]
      if (prev?.status === 'RUNNING' && next && next.status !== 'RUNNING') {
        if (next.status === 'SUCCESS') {
          proxy.$modal.msgSuccess(`${SYNC_TASK_LABELS[key]}已完成，共 ${next.result ?? next.processed} 条`)
        } else {
          proxy.$modal.msgError(`${SYNC_TASK_LABELS[key]}执行失败：${next.message || '详见后端日志'}`)
        }
      }
      syncProgress[key] = next
    }
    const anyRunning = Object.keys(SYNC_TASK_LABELS).some(key => isRunning(key))
    if (!anyRunning) stopSyncPolling()
  })
}

function startSyncPolling() {
  fetchSyncProgress()
  if (!syncPollTimer) {
    syncPollTimer = setInterval(fetchSyncProgress, 3000)
  }
}

function stopSyncPolling() {
  if (syncPollTimer) {
    clearInterval(syncPollTimer)
    syncPollTimer = null
  }
}

function handleTriggerDataTagRebuild() {
  proxy.$modal.confirm('确认从六张 Hive 客户表重建数据标签宽表并刷新归属基础信息吗？任务将在后台执行。').then(() => {
    return triggerDataTagRebuild()
  }).then(res => {
    proxy.$modal.msgSuccess(res.msg || '已在后台启动')
    startSyncPolling()
  }).catch(() => {})
}

function handleTriggerLatestContactSync() {
  proxy.$modal.confirm('确认从 CRM 触达、DB2 营销交互、PAD 走访三个来源同步客户最近触达时间吗？任务将在后台执行。').then(() => {
    return triggerLatestContactSync()
  }).then(res => {
    proxy.$modal.msgSuccess(res.msg || '已在后台启动')
    startSyncPolling()
  }).catch(() => {})
}

onMounted(() => {
  if (showSyncTrigger.value) {
    startSyncPolling()
  }
})

onUnmounted(stopSyncPolling)

function clearSelection() {
  tableRef.value?.clearSelection()
}

function selectedIdsInTableOrder() {
  const selectedIds = new Set(selectedRows.value.map(item => item.id))
  return rows.value.filter(item => selectedIds.has(item.id)).map(item => item.id)
}

function batchStatus(status) {
  const action = status === '0' ? '启用' : '停用'
  const ids = selectedIdsInTableOrder()
  proxy.$modal.confirm(`确认批量${action}已选择的 ${ids.length} 个数据标签吗？`).then(() => {
    batchSubmitting.value = true
    return batchUpdateDataTagStatus({ ids, status })
  }).then(() => {
    proxy.$modal.msgSuccess(`批量${action}成功`)
    getList()
  }).finally(() => {
    batchSubmitting.value = false
  }).catch(() => {})
}

function toggleStatus(row) {
  if (!canEditDataTag.value || statusUpdatingId.value !== undefined) return
  const status = row.status === '0' ? '1' : '0'
  const action = status === '0' ? '启用' : '停用'
  statusUpdatingId.value = row.id
  batchUpdateDataTagStatus({ ids: [row.id], status }).then(() => {
    proxy.$modal.msgSuccess(`${action}成功`)
    return getList()
  }).catch(() => {}).finally(() => {
    statusUpdatingId.value = undefined
  })
}

function rowIndex(row) {
  return rows.value.findIndex(item => item.id === row.id)
}

function canMoveRow(row, offset) {
  if (!canReorder.value) return false
  const target = rows.value[rowIndex(row) + offset]
  return Boolean(target && target.status === row.status)
}

function moveRow(row, offset) {
  const index = rowIndex(row)
  const targetIndex = index + offset
  if (!canMoveRow(row, offset) || ordering.value) return
  const nextRows = [...rows.value]
  const [moved] = nextRows.splice(index, 1)
  nextRows.splice(targetIndex, 0, moved)
  rows.value = nextRows
  saveCurrentOrder()
}

function handleDragStart(row, event) {
  if (ordering.value || !canReorder.value) {
    event.preventDefault()
    return
  }
  draggingId.value = row.id
  dragOriginalIds.value = rows.value.map(item => item.id)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(row.id))
}

function handleDragEnter(targetRow) {
  if (!draggingId.value || targetRow.id === draggingId.value) return
  const sourceIndex = rows.value.findIndex(item => item.id === draggingId.value)
  const targetIndex = rowIndex(targetRow)
  if (sourceIndex < 0 || targetIndex < 0 || rows.value[sourceIndex].status !== targetRow.status) return
  const nextRows = [...rows.value]
  const [moved] = nextRows.splice(sourceIndex, 1)
  nextRows.splice(targetIndex, 0, moved)
  rows.value = nextRows
}

function handleDragEnd() {
  const changed = dragOriginalIds.value.join(',') !== rows.value.map(item => item.id).join(',')
  draggingId.value = undefined
  dragOriginalIds.value = []
  if (changed) saveCurrentOrder()
}

function saveCurrentOrder() {
  ordering.value = true
  updateDataTagOrder({ ids: rows.value.map(item => item.id) }).then(() => {
    proxy.$modal.msgSuccess('顺序已更新')
    getList()
  }).catch(() => {
    getList()
  }).finally(() => {
    ordering.value = false
  })
}

const initing = ref(false)
const categories = ref([])
const batchCategoryOpen = ref(false)
const batchCategoryId = ref(null)

function loadCategories() {
  return listDataTagCategories().then(res => {
    categories.value = res.data || []
  })
}

const treeRef = ref()
const allTagRows = ref([])

// 分类计数跟随当前适用范围（不受表格筛选影响），标签增删/归类变化后调用刷新
function loadTagCounts() {
  return listDataTagDefinitions({ pageNum: 1, pageSize: 10000 }).then(res => {
    allTagRows.value = res.rows || []
  })
}

const categoryTreeData = computed(() => {
  const scoped = queryParams.subjectScope
    ? allTagRows.value.filter(row => row.subjectScope === queryParams.subjectScope)
    : allTagRows.value
  const nodes = [{ key: 'ALL', label: '全部分类', count: scoped.length }]
  categories.value.forEach(cat => nodes.push({
    key: `cat-${cat.id}`,
    label: cat.categoryName,
    categoryId: cat.id,
    manageable: true,
    count: scoped.filter(row => row.categoryId === cat.id).length
  }))
  nodes.push({
    key: 'uncategorized',
    label: '其他（未归类）',
    categoryId: UNCATEGORIZED,
    count: scoped.filter(row => row.categoryId == null).length
  })
  return nodes
})

// 排序序列按 scope 独立维护，跨 scope 的「全部」视图下重排会互换不同 scope 的 sort_order，故禁用
const canReorder = computed(() => Boolean(queryParams.subjectScope))

const currentNodeKey = computed(() => {
  if (queryParams.categoryId == null) return 'ALL'
  if (queryParams.categoryId === UNCATEGORIZED) return 'uncategorized'
  return `cat-${queryParams.categoryId}`
})

// 树重建（计数/分类变化）后恢复选中高亮
watch([categoryTreeData, currentNodeKey], () => {
  nextTick(() => treeRef.value?.setCurrentKey(currentNodeKey.value))
})

function handleNodeClick(node) {
  queryParams.categoryId = node.categoryId
  queryParams.pageNum = 1
  getList()
}

function allowCategoryDrag(node) {
  return Boolean(node.data.manageable)
}

function allowCategoryDrop(draggingNode, dropNode, type) {
  return type !== 'inner' && Boolean(dropNode.data.manageable)
}

// 拖拽后按新顺序重新分配分类 sortOrder，仅提交有变化的
function handleCategoryDrop(draggingNode, dropNode, dropType) {
  const dragged = categories.value.find(item => item.id === draggingNode.data.categoryId)
  const rest = categories.value.filter(item => item.id !== draggingNode.data.categoryId)
  const dropIndex = rest.findIndex(item => item.id === dropNode.data.categoryId)
  if (!dragged || dropIndex < 0) return
  rest.splice(dropType === 'before' ? dropIndex : dropIndex + 1, 0, dragged)
  const updates = []
  rest.forEach((cat, index) => {
    const sortOrder = (index + 1) * 10
    if (cat.sortOrder !== sortOrder) {
      updates.push(updateDataTagCategory({ id: cat.id, categoryName: cat.categoryName, sortOrder }))
    }
  })
  Promise.all(updates).then(loadCategories).catch(loadCategories)
}

function categoryNameOf(categoryId) {
  const cat = categories.value.find(item => item.id === categoryId)
  return cat ? cat.categoryName : '其他'
}

function handleInitFromWideTable() {
  proxy.$modal.confirm('将按六张 Hive 源表字段契约补齐标签定义，并删除无来源的旧定义，是否继续？').then(() => {
    initing.value = true
    return initDataTagFromWideTable().then(res => {
      const { added, skipped, aligned, removed, orphans } = res.data || {}
      let msg = `新增 ${added || 0} 条，保留 ${skipped || 0} 条，对齐 ${aligned || 0} 条`
      if (orphans && orphans.length) {
        msg += `；删除 ${removed || orphans.length} 条无 Hive 来源定义：${orphans.join('、')}`
      }
      proxy.$modal.alert(msg)
      getList()
      loadTagCounts()
    })
  }).catch(() => {}).finally(() => {
    initing.value = false
  })
}

function promptCategoryName(title, initialValue) {
  return ElMessageBox.prompt('请输入分类名称', title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: initialValue,
    inputValidator: value => (value && value.trim() && value.trim().length <= 50) ? true : '请输入 1-50 个字符的分类名称'
  }).then(({ value }) => value.trim())
}

function handleAddCategory() {
  promptCategoryName('新增分类').then(name => {
    return addDataTagCategory({ categoryName: name, sortOrder: (categories.value.length + 1) * 10 }).then(() => {
      proxy.$modal.msgSuccess('新增成功')
      loadCategories()
    })
  }).catch(() => {})
}

function handleRenameCategory(node) {
  const cat = categories.value.find(item => item.id === node.categoryId)
  if (!cat) return
  promptCategoryName('重命名分类', cat.categoryName).then(name => {
    return updateDataTagCategory({ id: cat.id, categoryName: name, sortOrder: cat.sortOrder }).then(() => {
      proxy.$modal.msgSuccess('重命名成功')
      loadCategories()
    })
  }).catch(() => {})
}

function handleDeleteCategory(node) {
  const cat = categories.value.find(item => item.id === node.categoryId)
  if (!cat) return
  proxy.$modal.confirm(`删除分类「${cat.categoryName}」后，其下标签将归入「其他」，是否继续？`).then(() => {
    return deleteDataTagCategory(cat.id)
  }).then(() => {
    if (queryParams.categoryId === cat.id) queryParams.categoryId = undefined
    loadCategories()
    getList()
    loadTagCounts()
  }).catch(() => {})
}

function batchVisible(visible) {
  const ids = selectedRows.value.map(row => row.id)
  batchSubmitting.value = true
  batchUpdateDataTagVisible({ ids, defaultVisible: visible }).then(() => {
    proxy.$modal.msgSuccess('批量设置成功')
    getList()
  }).finally(() => {
    batchSubmitting.value = false
  })
}

function submitBatchCategory() {
  const ids = selectedRows.value.map(row => row.id)
  batchSubmitting.value = true
  batchUpdateDataTagCategory({ ids, categoryId: batchCategoryId.value ?? null }).then(() => {
    proxy.$modal.msgSuccess('批量归类成功')
    batchCategoryOpen.value = false
    getList()
    loadTagCounts()
  }).finally(() => {
    batchSubmitting.value = false
  })
}

getList()
loadCategories()
loadTagCounts()
</script>

<style scoped>
.sync-progress-bar {
  margin-bottom: 12px;
}

.tag-tree-wrap {
  padding: 8px 0;
}

.tag-tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-right: 4px;
}

.tag-tree-header__title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.tag-tree-node {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.tag-tree-node__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-tree-node__actions {
  display: none;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.tag-tree-node__actions .el-icon {
  cursor: pointer;
}

.tag-tree-node__actions .el-icon:hover {
  color: var(--el-color-primary);
}

.tag-tree-wrap :deep(.el-tree-node__content:hover .tag-tree-node__actions) {
  display: inline-flex;
}

.tag-tree-node__count {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.page-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.query-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.query-form {
  flex: 1;
}

.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 1px solid var(--el-color-primary-light-7);
  background: var(--el-color-primary-light-9);
}

.batch-bar__summary {
  color: var(--el-color-primary);
}

.batch-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.col-settings {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-settings__title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.col-settings__item {
  margin-right: 0;
  height: auto;
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--el-text-color-secondary);
  font-weight: 700;
  letter-spacing: -2px;
  cursor: grab;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.status-tag-button {
  appearance: none;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

.status-tag-button.is-editable {
  cursor: pointer;
}

.status-tag-button.is-editable:not(:disabled):hover :deep(.el-tag) {
  filter: brightness(0.96);
}

.status-tag-button:disabled {
  cursor: default;
}

.status-tag-button.is-updating {
  cursor: wait;
  opacity: 0.6;
}

.status-tag-button:focus-visible {
  outline: 2px solid var(--el-color-primary-light-5);
  outline-offset: 2px;
}

.data-tag-page :deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
