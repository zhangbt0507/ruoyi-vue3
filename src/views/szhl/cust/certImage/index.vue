<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="客户号" prop="custNo">
        <el-input
          v-model="queryParams.custNo"
          placeholder="请输入客户号"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Plus" @click="handleAdd">影像上传</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="!searched"
      title="请先输入客户号并点击搜索"
      type="info"
      :closable="false"
      show-icon
      class="mb8"
    />

    <el-table v-loading="loading" :data="dataList" v-show="searched">
      <el-table-column label="客户号" prop="custNo" width="200" show-overflow-tooltip />
      <el-table-column label="客户姓名" prop="custName" width="120" show-overflow-tooltip />
      <el-table-column label="客户类型" prop="custType" width="90" align="center">
        <template #default="scope">
          {{ custTypeLabel(scope.row.custType) }}
        </template>
      </el-table-column>
      <el-table-column label="影像类型" prop="imageType" width="120" align="center">
        <template #default="scope">
          {{ imageTypeLabel(scope.row.imageType) }}
        </template>
      </el-table-column>
      <el-table-column label="上传人" prop="loginUser" width="100" align="center" show-overflow-tooltip />
      <el-table-column label="机构号" prop="orgNo" width="100" align="center" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="sys_org_name" :value="scope.row.orgNo" />
        </template>
      </el-table-column>
      <el-table-column label="上传时间" prop="uploadTime" width="170" align="center">
        <template #default="scope">
          <span>{{ parseTime(scope.row.uploadTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件名" prop="fileName" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handlePreview(scope.row)">查看</el-button>
          <el-button link type="primary" icon="Download" @click="handleDownload(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="searched && total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增 -->
    <el-dialog title="新增证件影像" v-model="open" width="720px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="custName">
              <div class="search-input-container">
                <el-input
                  v-model="form.custName"
                  placeholder="请输入客户姓名"
                  @input="handleCustNameInput"
                />
                <div v-if="showQueryResults && queryResults.length > 0" class="query-results">
                  <ul class="result-list">
                    <li
                      v-for="(item, index) in queryResults"
                      :key="index"
                      class="result-item"
                      @click="selectCustomer(item)"
                    >
                      <div class="customer-info">
                        <span class="customer-name">{{ item.cunaflnm }}</span>
                        <span class="customer-no">{{ item.cuidcsid }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户号" prop="custNo">
              <el-input v-model="form.custNo" placeholder="请输入客户号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="客户类型" prop="custType">
              <el-radio-group v-model="form.custType" @change="onCustTypeChange">
                <el-radio label="1">对公</el-radio>
                <el-radio label="2">对私</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-for="slot in currentUploadSlots" :key="slot.key">
            <el-form-item :label="slot.label">
              <el-upload
                :ref="(el) => setUploadRef(slot.key, el)"
                :auto-upload="false"
                :limit="1"
                :accept="slot.accept"
                :on-change="(file, list) => onFileChange(slot.key, file, list)"
                :on-remove="() => onFileRemove(slot.key)"
                :file-list="uploadFileLists[slot.key] || []"
              >
                <el-button type="primary">{{ slot.fileType === 'pdf' ? '选取 PDF' : '选取图片' }}</el-button>
                <template #tip>
                  <div class="el-upload__tip">{{ slot.tip }}</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 在线预览 -->
    <el-dialog v-model="previewOpen" :title="previewTitle" width="860px" append-to-body destroy-on-close>
      <div v-if="previewRow" class="preview-body">
        <el-image
          v-if="isImageFile(previewRow)"
          :src="fileAccessUrl(previewRow.filePath)"
          fit="contain"
          style="max-width: 100%; max-height: 70vh"
          :preview-src-list="[fileAccessUrl(previewRow.filePath)]"
          preview-teleported
        />
        <iframe
          v-else
          :src="fileAccessUrl(previewRow.filePath)"
          class="pdf-preview"
          frameborder="0"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="CustCertImage">
import axios from 'axios'
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'
import gatewayUrl from '@/utils/gatewayUrl'
import { parseTime } from '@/utils/ruoyi'
import { listCertImage, uploadCertImageBatch, queryCustByName } from '@/api/szhl/custom/certImage'

const { proxy } = getCurrentInstance()
const { sys_org_name } = proxy.useDict('sys_org_name')

const IMAGE_TYPE_LABELS = {
  business_license: '营业执照',
  company_charter: '公司章程',
  id_card_front: '身份证正面',
  id_card_back: '身份证反面',
  marriage_cert: '结婚证',
  household_register: '户口本'
}

const CORP_UPLOAD_SLOTS = [
  { key: 'business_license', label: '营业执照', accept: '.jpg,.jpeg,.png,.bmp,.gif', fileType: 'image', tip: '选填，支持 jpg、png 等图片格式' },
  { key: 'company_charter', label: '公司章程', accept: '.pdf', fileType: 'pdf', tip: '选填，仅支持 PDF 格式' }
]

const PERSON_UPLOAD_SLOTS = [
  { key: 'id_card_front', label: '身份证正面', accept: '.jpg,.jpeg,.png,.bmp,.gif', fileType: 'image', tip: '选填，支持 jpg、png 等图片格式' },
  { key: 'id_card_back', label: '身份证反面', accept: '.jpg,.jpeg,.png,.bmp,.gif', fileType: 'image', tip: '选填，支持 jpg、png 等图片格式' },
  { key: 'marriage_cert', label: '结婚证', accept: '.jpg,.jpeg,.png,.bmp,.gif', fileType: 'image', tip: '选填，支持 jpg、png 等图片格式' },
  { key: 'household_register', label: '户口本', accept: '.jpg,.jpeg,.png,.bmp,.gif', fileType: 'image', tip: '选填，支持 jpg、png 等图片格式' }
]

const dataList = ref([])
const loading = ref(false)
const total = ref(0)
const searched = ref(false)
const open = ref(false)
const submitLoading = ref(false)
const previewOpen = ref(false)
const previewRow = ref(null)

const uploadFiles = reactive({})
const uploadFileLists = reactive({})
const uploadRefs = {}

const queryResults = ref([])
const showQueryResults = ref(false)
const preventQuery = ref(false)
let debounceTimer = null
const DEBOUNCE_DELAY = 1000

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  custNo: undefined
})

const form = ref({
  custNo: '',
  custName: '',
  custType: '1'
})

const rules = {
  custNo: [{ required: true, message: '请输入客户号', trigger: 'blur' }],
  custName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  custType: [{ required: true, message: '请选择客户类型', trigger: 'change' }]
}

const currentUploadSlots = computed(() =>
  form.value.custType === '2' ? PERSON_UPLOAD_SLOTS : CORP_UPLOAD_SLOTS
)

const previewTitle = computed(() => {
  if (!previewRow.value) return '文件预览'
  return imageTypeLabel(previewRow.value.imageType) + ' - ' + (previewRow.value.fileName || '')
})

function custTypeLabel(val) {
  if (val === '1') return '对公'
  if (val === '2') return '对私'
  return val || '—'
}

function imageTypeLabel(type) {
  return IMAGE_TYPE_LABELS[type] || type || '—'
}

function fileAccessUrl(filePath) {
  if (!filePath) return ''
  if (/^https?:\/\//i.test(filePath)) return filePath
  return gatewayUrl(filePath)
}

function isImageFile(row) {
  return row?.imageType !== 'company_charter'
}

function setUploadRef(key, el) {
  if (el) uploadRefs[key] = el
}

function resetUploadState() {
  Object.keys(uploadFiles).forEach((k) => delete uploadFiles[k])
  Object.keys(uploadFileLists).forEach((k) => delete uploadFileLists[k])
}

function onCustTypeChange() {
  resetUploadState()
}

function handleCustNameInput(value) {
  if (preventQuery.value) {
    return
  }
  if (form.value.custNo) {
    form.value.custNo = ''
  }
  const chineseChars = value.match(/[\u4e00-\u9fa5]/g)
  if (chineseChars && chineseChars.length >= 2) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      doQueryCustByName(value)
      debounceTimer = null
    }, DEBOUNCE_DELAY)
  } else {
    queryResults.value = []
    showQueryResults.value = false
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }
}

function doQueryCustByName(custName) {
  queryCustByName(custName)
    .then((res) => {
      if (res.data && res.data.length > 0) {
        queryResults.value = res.data
        showQueryResults.value = true
      } else {
        queryResults.value = []
        showQueryResults.value = false
      }
    })
    .catch(() => {
      proxy.$modal.msgError('查询客户信息失败')
      queryResults.value = []
      showQueryResults.value = false
    })
}

function selectCustomer(customer) {
  preventQuery.value = true
  form.value.custName = customer.cunaflnm
  form.value.custNo = customer.cuidcsid
  showQueryResults.value = false
  queryResults.value = []
  setTimeout(() => {
    preventQuery.value = false
  }, 500)
}

function onFileChange(key, file, fileList) {
  uploadFiles[key] = file.raw
  uploadFileLists[key] = fileList.slice(-1)
}

function onFileRemove(key) {
  delete uploadFiles[key]
  uploadFileLists[key] = []
}

function getList() {
  if (!queryParams.value.custNo?.trim()) {
    return
  }
  loading.value = true
  listCertImage(queryParams.value)
    .then((res) => {
      dataList.value = res.rows
      total.value = res.total
      searched.value = true
    })
    .finally(() => {
      loading.value = false
    })
}

function handleQuery() {
  if (!queryParams.value.custNo?.trim()) {
    proxy.$modal.msgWarning('请输入客户号后再查询')
    return
  }
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  dataList.value = []
  total.value = 0
  searched.value = false
}

function handleAdd() {
  resetForm()
  open.value = true
}

function resetForm() {
  form.value = {
    custNo: '',
    custName: '',
    custType: '1'
  }
  queryResults.value = []
  showQueryResults.value = false
  preventQuery.value = false
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  resetUploadState()
  nextTick(() => {
    proxy.resetForm('formRef')
  })
}

function cancel() {
  open.value = false
  resetForm()
}

function submitForm() {
  proxy.$refs.formRef.validate(async (valid) => {
    if (!valid) return
    const slots = currentUploadSlots.value.filter((slot) => uploadFiles[slot.key])
    if (slots.length === 0) {
      proxy.$modal.msgWarning('请至少上传一个证件影像')
      return
    }
    submitLoading.value = true
    try {
      const fd = new FormData()
      fd.append('custNo', form.value.custNo.trim())
      fd.append('custName', form.value.custName.trim())
      fd.append('custType', form.value.custType)
      for (const slot of slots) {
        fd.append('imageTypes', slot.key)
        fd.append('files', uploadFiles[slot.key])
      }
      await uploadCertImageBatch(fd)
      proxy.$modal.msgSuccess('上传成功')
      open.value = false
      if (queryParams.value.custNo?.trim() === form.value.custNo.trim()) {
        getList()
      }
      resetForm()
    } catch (e) {
      /* request 拦截器已提示 */
    } finally {
      submitLoading.value = false
    }
  })
}

function handlePreview(row) {
  previewRow.value = row
  previewOpen.value = true
}

function handleDownload(row) {
  const url = gatewayUrl('/custom/certImage/download/' + row.id)
  axios({
    method: 'get',
    url,
    responseType: 'blob',
    headers: { Authorization: 'Bearer ' + getToken() }
  }).then((res) => {
    saveAs(res.data, row.fileName || 'download')
  }).catch(() => {
    proxy.$modal.msgError('下载失败')
  })
}
</script>

<style scoped>
.preview-body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
.pdf-preview {
  width: 100%;
  height: 70vh;
}
.mb8 {
  margin-bottom: 8px;
}
.search-input-container {
  position: relative;
  width: 100%;
}
.query-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 2000;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}
.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.result-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f2f2f2;
}
.result-item:last-child {
  border-bottom: none;
}
.result-item:hover {
  background-color: #f5f7fa;
}
.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.customer-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.customer-no {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
}
</style>
