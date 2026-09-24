<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="文号" prop="docNumber">
        <el-input v-model="queryParams.docNumber" placeholder="请输入文号" clearable style="width: 160px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="文件名" prop="fileName">
        <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable style="width: 160px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择分类" clearable style="width: 120px">
          <el-option v-for="item in CATEGORY_FILTER_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="部室" prop="department">
        <el-select v-model="queryParams.department" placeholder="请选择部室" clearable style="width: 160px">
          <el-option v-for="item in DEPARTMENT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['szhl:policyLibrary:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Promotion" @click="openDistributeDialog"
          v-hasPermi="['szhl:policyLibrary:distribute']">制度学习</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="部室" align="center" prop="department" min-width="50" show-overflow-tooltip />
      <el-table-column label="序号" align="center" prop="sortNo" width="70" />
      <el-table-column label="分类" align="center" prop="category" width="100">
        <template #default="scope">
          <span>{{ categoryLabel(scope.row.category) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="制度办法" align="center" prop="fileName" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="handleViewFiles(scope.row)">{{ scope.row.fileName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="文号" align="center" prop="docNumber" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
            v-hasPermi="['szhl:policyLibrary:edit']" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['szhl:policyLibrary:edit']">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="open" :title="title" width="620px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="文号" prop="docNumber">
          <el-input v-model="form.docNumber" placeholder="请输入文号" />
        </el-form-item>
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="form.fileName" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in CATEGORY_OPTIONS" :key="item.value" :value="item.value"
              :label="categoryOptionLabel(item)">
              {{ categoryLabel(item.value) }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="序号" prop="sortNo">
          <el-input-number v-model="form.sortNo" :min="0" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="部室" prop="department">
          <el-select v-model="form.department" placeholder="请选择部室" style="width: 100%">
            <el-option v-for="item in DEPARTMENT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="正文" prop="policyFileUrl">
          <FileUpload v-model="form.policyFileUrl" :action="POLICY_LIBRARY_UPLOAD_URL" :limit="1" :file-size="50"
            :file-type="['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx']" />
        </el-form-item>
        <el-form-item label="附件" prop="attachmentFileUrl">
          <FileUpload v-model="form.attachmentFileUrl" :action="POLICY_LIBRARY_UPLOAD_URL" :limit="10" :file-size="50"
            :file-type="['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar']" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="fileDetailOpen" title="制度文件" width="720px" append-to-body destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文号">{{ fileDetail.docNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ fileDetail.fileName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部室">{{ fileDetail.department || '-' }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryLabel(fileDetail.category) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="正文">
          <el-link v-if="fileDetail.policyFileUrl" type="primary" :underline="false" @click="openBodyFile">
            {{ fileDetail.policyFileName || '查看正文' }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="附件">
          <template v-if="fileDetail.attachmentFileUrl">
            <div v-for="(item, index) in parseFileList(fileDetail.attachmentFileUrl, fileDetail.attachmentFileName)"
              :key="index" class="attachment-link">
              <el-link type="primary" :href="fileUrl(item.url)" target="_blank" :underline="false">{{ item.name }}</el-link>
            </div>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="fileDetailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="distributeOpen" title="制度学习分发" width="1280px" append-to-body
      destroy-on-close class="policy-distribute-dialog" @closed="resetDistributeDialog">
      <el-row :gutter="16" class="distribute-panels">
        <el-col :span="12">
          <div class="distribute-panel">
            <div class="distribute-panel-title">
              <span class="distribute-panel-title-text">待选文件</span>
            </div>
            <el-form :model="distributeQueryParams" :inline="true" class="distribute-search-form">
              <el-form-item label="文号">
                <el-input v-model="distributeQueryParams.docNumber" placeholder="请输入文号" clearable
                  style="width: 120px" @keyup.enter="handleDistributeQuery" />
              </el-form-item>
              <el-form-item label="文件名">
                <el-input v-model="distributeQueryParams.fileName" placeholder="请输入文件名" clearable
                  style="width: 120px" @keyup.enter="handleDistributeQuery" />
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="distributeQueryParams.category" placeholder="请选择分类" clearable
                  style="width: 100px">
                  <el-option v-for="item in CATEGORY_FILTER_OPTIONS" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="部室">
                <el-select v-model="distributeQueryParams.department" placeholder="请选择部室" clearable
                  style="width: 140px">
                  <el-option v-for="item in DEPARTMENT_OPTIONS" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleDistributeQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetDistributeQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <div ref="pendingTableWrapRef" class="distribute-table-wrap">
            <el-table ref="pendingTableRef" v-loading="distributeLoading" :data="distributeList" row-key="id"
              class="distribute-table" :height="pendingTableHeight" @selection-change="handlePendingSelectionChange">
              <el-table-column type="selection" width="45" align="center" :selectable="isPendingSelectable" />
              <el-table-column label="文号" align="left" prop="docNumber" min-width="150"
                class-name="distribute-text-cell" />
              <el-table-column label="文件名" align="left" prop="fileName" min-width="160"
                class-name="distribute-text-cell" />
              <el-table-column label="分类" align="center" prop="category" width="70">
                <template #default="scope">
                  <span>{{ categoryLabel(scope.row.category) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="部室" align="center" prop="department" width="100"
                show-overflow-tooltip />
            </el-table>
            </div>

            <div class="distribute-panel-footer">
              <pagination v-show="distributeTotal > 0" :total="distributeTotal"
                v-model:page="distributeQueryParams.pageNum" v-model:limit="distributeQueryParams.pageSize"
                layout="total, prev, pager, next" :pager-count="5"
                @pagination="getDistributeList" />
              <div class="distribute-add-row">
                <el-button type="primary" plain icon="Right" :disabled="!pendingSelection.length"
                  @click="addToSelected">添加至已选</el-button>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="distribute-panel distribute-panel--selected">
            <div class="distribute-panel-title">
              <span class="distribute-panel-title-text">
                已选文件
                <el-tag type="info" size="small" effect="plain" round class="distribute-count-tag">
                  {{ distributeSelectedList.length }}
                </el-tag>
              </span>
              <el-button link type="danger" :disabled="!distributeSelectedList.length"
                @click="clearSelectedList">清空已选</el-button>
            </div>

            <div ref="selectedTableWrapRef" class="distribute-table-wrap">
            <el-table :data="distributeSelectedList" row-key="id" class="distribute-table"
              :height="selectedTableHeight" empty-text="请从左侧勾选文件并添加至已选">
              <el-table-column label="文号" align="left" prop="docNumber" min-width="150"
                class-name="distribute-text-cell" />
              <el-table-column label="文件名" align="left" prop="fileName" min-width="160"
                class-name="distribute-text-cell" />
              <el-table-column label="分类" align="center" prop="category" width="70">
                <template #default="scope">
                  <span>{{ categoryLabel(scope.row.category) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="部室" align="center" prop="department" width="100"
                show-overflow-tooltip />
              <el-table-column label="操作" align="center" width="70" fixed="right">
                <template #default="scope">
                  <el-button link type="danger" @click="removeFromSelected(scope.row)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            </div>

            <div class="distribute-panel-tip">
              <div class="distribute-tip-title">分发说明</div>
              <ul class="distribute-tip-list">
                <li>将为本角色下全部用户创建学习任务：<strong>应知应会制度库分发人员</strong></li>
                <li>分发日期记录为任务创建时间；同一制度与同一用户不会重复分发</li>
                <li>已停用制度无法加入分发，请先在列表中启用</li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>

      <template #footer>
        <el-button type="primary" :loading="distributeSubmitLoading" :disabled="!distributeSelectedList.length"
          @click="confirmDistribute">分发</el-button>
        <el-button @click="distributeOpen = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  listPolicyLibrary,
  getPolicyLibrary,
  addPolicyLibrary,
  updatePolicyLibrary,
  changePolicyLibraryStatus,
  distributePolicyLearning,
  DEPARTMENT_OPTIONS,
  POLICY_LIBRARY_UPLOAD_URL,
  CATEGORY_OPTIONS,
  CATEGORY_FILTER_OPTIONS,
  categoryLabel,
  categoryOptionLabel
} from '@/api/szhl/policyLibrary/policyLibrary'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const fileDetailOpen = ref(false)
const fileDetail = ref({})
const submitLoading = ref(false)
const title = ref('')
const list = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  docNumber: undefined,
  fileName: undefined,
  category: undefined,
  department: undefined
})

const form = ref({})
const rules = {
  fileName: [{ required: true, message: '文件名不能为空', trigger: 'blur' }],
  sortNo: [{ required: true, message: '序号不能为空', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部室', trigger: 'change' }],
  policyFileUrl: [{ required: true, message: '请上传正文', trigger: 'change' }]
}

const queryFormRef = ref(null)
const formRef = ref(null)

const distributeOpen = ref(false)
const distributeLoading = ref(false)
const distributeSubmitLoading = ref(false)
const distributeList = ref([])
const distributeTotal = ref(0)
const distributeSelectedList = ref([])
const pendingSelection = ref([])
const pendingTableRef = ref(null)
const pendingTableWrapRef = ref(null)
const pendingTableHeight = ref(360)
const selectedTableWrapRef = ref(null)
const selectedTableHeight = ref(360)
const distributeTableResizeObserver = ref(null)
const distributeQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  docNumber: undefined,
  fileName: undefined,
  category: undefined,
  department: undefined,
  status: '0'
})

const selectedIdSet = computed(() => new Set(distributeSelectedList.value.map(item => item.id)))

function normalizeStatus(status) {
  return status === '1' ? '1' : '0'
}

function parseFileList(urls, names) {
  if (!urls) return []
  const urlArr = urls.split(',').filter(Boolean)
  const nameArr = (names || '').split(',')
  return urlArr.map((url, index) => ({
    url,
    name: nameArr[index] || url.split('/').pop() || '附件'
  }))
}

function fileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return import.meta.env.VITE_APP_BASE_API + url
}

function handleViewFiles(row) {
  getPolicyLibrary(row.id).then(res => {
    fileDetail.value = res.data || { ...row }
    fileDetailOpen.value = true
  }).catch(() => {
    fileDetail.value = { ...row }
    fileDetailOpen.value = true
  })
}

function openBodyFile() {
  if (!fileDetail.value.policyFileUrl) return
  window.open(fileUrl(fileDetail.value.policyFileUrl), '_blank')
}

function syncFileNames() {
  const bodyUrl = form.value.policyFileUrl
  if (bodyUrl) {
    form.value.policyFileName = bodyUrl.split('/').pop() || ''
  } else {
    form.value.policyFileName = ''
  }
  const attachmentUrl = form.value.attachmentFileUrl
  if (attachmentUrl) {
    form.value.attachmentFileName = parseFileList(attachmentUrl, form.value.attachmentFileName)
      .map(item => item.name).join(',')
  } else {
    form.value.attachmentFileUrl = ''
    form.value.attachmentFileName = ''
  }
}

function getList() {
  loading.value = true
  listPolicyLibrary(queryParams).then(res => {
    list.value = (res.rows || []).map(item => ({
      ...item,
      status: normalizeStatus(item.status)
    }))
    total.value = res.total
  }).catch(() => {
    list.value = []
    total.value = 0
  }).finally(() => {
    loading.value = false
  })
}

function reset() {
  form.value = {
    id: undefined,
    docNumber: undefined,
    fileName: undefined,
    category: '0',
    sortNo: undefined,
    department: undefined,
    policyFileUrl: undefined,
    policyFileName: undefined,
    attachmentFileUrl: undefined,
    attachmentFileName: undefined,
    remark: undefined,
    status: '0'
  }
  formRef.value?.resetFields()
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增制度'
}

function handleUpdate(row) {
  reset()
  getPolicyLibrary(row.id).then(res => {
    form.value = {
      ...res.data,
      status: normalizeStatus(res.data.status)
    }
    open.value = true
    title.value = '修改制度'
  })
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    syncFileNames()
    submitLoading.value = true
    const action = form.value.id ? updatePolicyLibrary : addPolicyLibrary
    action(form.value).then(() => {
      proxy.$modal.msgSuccess(form.value.id ? '修改成功' : '新增成功')
      open.value = false
      getList()
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

function handleStatusChange(row) {
  const enable = row.status === '0'
  const confirmMsg = enable ? '确认要启用该制度吗？' : '确认要停用该制度吗？'
  const successMsg = enable ? '启用成功' : '停用成功'
  proxy.$modal.confirm(confirmMsg).then(() => {
    return changePolicyLibraryStatus(row.id, row.status)
  }).then(() => {
    proxy.$modal.msgSuccess(successMsg)
  }).catch(() => {
    row.status = enable ? '1' : '0'
  })
}

function isPendingSelectable(row) {
  return !selectedIdSet.value.has(row.id)
}

function handlePendingSelectionChange(selection) {
  pendingSelection.value = selection
}

function addToSelected() {
  if (!pendingSelection.value.length) return
  const existingIds = selectedIdSet.value
  const toAdd = pendingSelection.value.filter(item => !existingIds.has(item.id))
  if (!toAdd.length) return
  distributeSelectedList.value = [...distributeSelectedList.value, ...toAdd]
  pendingTableRef.value?.clearSelection()
  pendingSelection.value = []
}

function removeFromSelected(row) {
  distributeSelectedList.value = distributeSelectedList.value.filter(item => item.id !== row.id)
}

function clearSelectedList() {
  distributeSelectedList.value = []
  pendingTableRef.value?.clearSelection()
  pendingSelection.value = []
}

function updateDistributeTableHeights() {
  nextTick(() => {
    const pendingHeight = pendingTableWrapRef.value?.clientHeight
    if (pendingHeight && pendingHeight > 0) {
      pendingTableHeight.value = pendingHeight
    }
    const selectedHeight = selectedTableWrapRef.value?.clientHeight
    if (selectedHeight && selectedHeight > 0) {
      selectedTableHeight.value = selectedHeight
    }
  })
}

function bindDistributeTableResize() {
  unbindDistributeTableResize()
  const targets = [pendingTableWrapRef.value, selectedTableWrapRef.value].filter(Boolean)
  if (!targets.length || typeof ResizeObserver === 'undefined') {
    updateDistributeTableHeights()
    return
  }
  distributeTableResizeObserver.value = new ResizeObserver(() => {
    updateDistributeTableHeights()
  })
  targets.forEach(target => distributeTableResizeObserver.value.observe(target))
}

function unbindDistributeTableResize() {
  distributeTableResizeObserver.value?.disconnect()
  distributeTableResizeObserver.value = null
}

function scheduleDistributeTableLayout() {
  nextTick(() => {
    updateDistributeTableHeights()
    bindDistributeTableResize()
  })
}

function openDistributeDialog() {
  distributeOpen.value = true
  distributeSelectedList.value = []
  pendingSelection.value = []
  distributeQueryParams.pageNum = 1
  distributeQueryParams.status = '0'
  getDistributeList()
}

watch(distributeOpen, (open) => {
  if (open) {
    scheduleDistributeTableLayout()
  } else {
    unbindDistributeTableResize()
  }
})

function getDistributeList() {
  distributeLoading.value = true
  listPolicyLibrary(distributeQueryParams).then(res => {
    distributeList.value = res.rows
    distributeTotal.value = res.total
    pendingSelection.value = []
    nextTick(() => pendingTableRef.value?.clearSelection())
  }).catch(() => {
    distributeList.value = []
    distributeTotal.value = 0
  }).finally(() => {
    distributeLoading.value = false
    updateDistributeTableHeights()
  })
}

function handleDistributeQuery() {
  distributeQueryParams.pageNum = 1
  getDistributeList()
}

function resetDistributeQuery() {
  distributeQueryParams.docNumber = undefined
  distributeQueryParams.fileName = undefined
  distributeQueryParams.category = undefined
  distributeQueryParams.department = undefined
  distributeQueryParams.status = '0'
  handleDistributeQuery()
}

function resetDistributeDialog() {
  unbindDistributeTableResize()
  distributeSelectedList.value = []
  pendingSelection.value = []
  distributeList.value = []
  distributeTotal.value = 0
  distributeQueryParams.pageNum = 1
  distributeQueryParams.pageSize = 10
  distributeQueryParams.docNumber = undefined
  distributeQueryParams.fileName = undefined
  distributeQueryParams.category = undefined
  distributeQueryParams.department = undefined
  distributeQueryParams.status = '0'
}

function confirmDistribute() {
  if (!distributeSelectedList.value.length) {
    proxy.$modal.msgWarning('请选择要分发的制度文件')
    return
  }
  proxy.$modal.confirm('确认将选中的制度分发给【应知应会制度库分发人员】角色下的所有用户？').then(() => {
    distributeSubmitLoading.value = true
    const policyIds = distributeSelectedList.value.map(item => item.id)
    return distributePolicyLearning(policyIds)
  }).then(res => {
    proxy.$modal.msgSuccess(res.msg || '分发成功')
    distributeOpen.value = false
  }).catch(() => {}).finally(() => {
    distributeSubmitLoading.value = false
  })
}

onMounted(() => {
  getList()
})

onBeforeUnmount(() => {
  unbindDistributeTableResize()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

.distribute-panels {
  margin: 0;
  height: 620px;
  overflow: hidden;
}

.distribute-panels :deep(.el-col) {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.distribute-panel {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px 12px;
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.distribute-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.distribute-panel-title-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.distribute-count-tag {
  min-width: 28px;
  justify-content: center;
}

.distribute-search-form {
  flex-shrink: 0;
  margin-bottom: 6px;
}

.distribute-search-form :deep(.el-form-item) {
  margin-bottom: 4px;
}

.distribute-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.distribute-panel-footer {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.distribute-panel-footer :deep(.pagination-container) {
  position: relative !important;
  height: auto !important;
  min-height: 32px;
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 !important;
  width: 100%;
  overflow-x: auto;
}

.distribute-panel-footer :deep(.pagination-container .el-pagination) {
  position: static !important;
  right: auto !important;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: 6px;
}

.distribute-add-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.distribute-panel-tip {
  flex-shrink: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
}

.distribute-panel--selected .distribute-panel-tip {
  margin-top: 8px;
}

.distribute-panel--selected {
  min-height: 0;
  overflow: hidden;
}

.distribute-tip-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.distribute-tip-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--el-text-color-regular);
}

.distribute-tip-list li + li {
  margin-top: 2px;
}

.distribute-tip-list strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.distribute-table :deep(.distribute-text-cell .cell) {
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  text-align: left;
}

.distribute-table :deep(.el-table__cell) {
  padding: 6px 0;
}

:deep(.policy-distribute-dialog .el-dialog__body) {
  padding-top: 12px;
  padding-bottom: 12px;
}

.attachment-link + .attachment-link {
  margin-top: 4px;
}
</style>
