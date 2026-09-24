<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="文件名" prop="fileName">
        <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable style="width: 180px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="部室" prop="department">
        <el-select v-model="queryParams.department" placeholder="请选择部室" clearable style="width: 160px">
          <el-option v-for="item in DEPARTMENT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
          <el-option v-for="item in LEARNING_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['szhl:policyLearning:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文号" align="center" prop="docNumber" min-width="120" show-overflow-tooltip />
      <el-table-column label="文件名" align="center" prop="fileName" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="handleViewFiles(scope.row)">{{ scope.row.fileName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" prop="category" width="80">
        <template #default="scope">
          <span>{{ categoryLabel(scope.row.category) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部室" align="center" prop="department" min-width="120" show-overflow-tooltip />
      <el-table-column label="被分发人员" align="center" min-width="130" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatLearner(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分发日期" align="center" prop="createTime" width="120">
        <template #default="scope">
          <span>{{ scope.row.createTime ? parseTime(scope.row.createTime, '{y}-{m}-{d}') : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'warning'">
            {{ learningStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="学习日期" align="center" prop="learningDate" width="120" />
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-if="canOpenDetail(scope.row)" link type="primary" icon="View"
            @click="handleDetail(scope.row)">{{ scope.row.status === '1' ? '查看' : '学习' }}</el-button>
          <el-button v-if="checkPermi(['szhl:policyLearning:remove'])" link type="primary" icon="Delete"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="fileDetailOpen" title="制度文件" width="560px" append-to-body destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文号">{{ fileDetail.docNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ fileDetail.fileName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部室">{{ fileDetail.department || '-' }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryLabel(fileDetail.category) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="正文">
          <el-link v-if="fileDetail.policyFileUrl" type="primary" :underline="false" @click="openBodyFile(fileDetail)">
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

    <el-dialog v-model="open" :title="dialogTitle" width="720px" append-to-body destroy-on-close>
      <el-descriptions :column="2" border class="mb16">
        <el-descriptions-item label="文号">{{ detail.docNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ detail.fileName }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryLabel(detail.category) }}</el-descriptions-item>
        <el-descriptions-item label="部室">{{ detail.department }}</el-descriptions-item>
        <el-descriptions-item label="正文" :span="2">
          <el-link v-if="detail.policyFileUrl" type="primary" :underline="false" @click="openBodyFile(detail)">
            {{ detail.policyFileName || '查看正文' }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="附件" :span="2">
          <template v-if="detail.attachmentFileUrl">
            <div v-for="(item, index) in parseFileList(detail.attachmentFileUrl, detail.attachmentFileName)"
              :key="index" class="attachment-link">
              <el-link type="primary" :href="fileUrl(item.url)" target="_blank">{{ item.name }}</el-link>
            </div>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" :disabled="isView">
        <el-form-item label="要点总结" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="5" placeholder="请输入要点总结" />
        </el-form-item>
        <el-form-item label="学习日期" prop="learningDate">
          <el-date-picker v-model="form.learningDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择学习日期"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="学习照片" prop="learningPhotoUrl">
          <ImageUpload v-model="form.learningPhotoUrl" :limit="5" :file-size="10"
            :file-type="['png', 'jpg', 'jpeg']" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button v-if="!isView" type="primary" :loading="submitLoading" @click="submitForm">提 交</el-button>
        <el-button @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PolicyLearning">
import {
  listPolicyLearning,
  getPolicyLearning,
  submitPolicyLearning,
  delPolicyLearning,
  LEARNING_STATUS_OPTIONS,
  learningStatusLabel
} from '@/api/szhl/policyLibrary/policyLearning'
import {
  DEPARTMENT_OPTIONS,
  categoryLabel
} from '@/api/szhl/policyLibrary/policyLibrary'
import { checkPermi } from '@/utils/permission'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const fileDetailOpen = ref(false)
const fileDetail = ref({})
const submitLoading = ref(false)
const isView = ref(false)
const dialogTitle = ref('制度学习')
const list = ref([])
const total = ref(0)
const detail = ref({})
const ids = ref([])
const multiple = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  fileName: undefined,
  department: undefined,
  status: undefined
})

const form = ref({})
const rules = {
  summary: [{ required: true, message: '要点总结不能为空', trigger: 'blur' }],
  learningDate: [{ required: true, message: '请选择学习日期', trigger: 'change' }]
}

const queryFormRef = ref(null)
const formRef = ref(null)

function formatLearner(row) {
  if (row.nickName && row.userName) {
    return `${row.nickName}（${row.userName}）`
  }
  return row.nickName || row.userName || '-'
}

/** 用 v-if + checkPermi，避免表格内 v-hasPermi 直接删 DOM 导致 insertBefore 报错 */
function canOpenDetail(row) {
  if (row.status === '1') {
    return checkPermi(['szhl:policyLearning:query'])
  }
  return checkPermi(['szhl:policyLearning:edit'])
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

function openBodyFile(row) {
  if (!row?.policyFileUrl) return
  window.open(fileUrl(row.policyFileUrl), '_blank')
}

function handleViewFiles(row) {
  getPolicyLearning(row.id).then(res => {
    fileDetail.value = res.data || { ...row }
    fileDetailOpen.value = true
  }).catch(() => {
    fileDetail.value = { ...row }
    fileDetailOpen.value = true
  })
}

function getList() {
  loading.value = true
  listPolicyLearning(queryParams).then(res => {
    list.value = res.rows || []
    total.value = res.total || 0
  }).catch(() => {
    list.value = []
    total.value = 0
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

function handleDetail(row) {
  getPolicyLearning(row.id).then(res => {
    detail.value = res.data
    form.value = {
      id: res.data.id,
      summary: res.data.summary,
      learningDate: res.data.learningDate,
      learningPhotoUrl: res.data.learningPhotoUrl
    }
    isView.value = res.data.status === '1'
    dialogTitle.value = isView.value ? '查看学习记录' : '制度学习'
    open.value = true
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    submitLoading.value = true
    submitPolicyLearning(form.value).then(() => {
      proxy.$modal.msgSuccess('提交成功')
      open.value = false
      getList()
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

function handleDelete(row) {
  const learningIds = row?.id || ids.value
  proxy.$modal.confirm('是否确认删除选中的学习记录？').then(() => {
    return delPolicyLearning(learningIds)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}

.attachment-link + .attachment-link {
  margin-top: 4px;
}
</style>
