<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryFormRef"
      :rules="rules"
      :inline="true"
      v-show="true"
      label-width="80px"
      @submit.prevent="handleQuery"
    >
      <el-form-item label="身份证号" prop="cust_idcard">
        <el-input
          v-model="queryParams.cust_idcard"
          placeholder="请输入身份证号"
          clearable
          maxlength="18"
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <!-- <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button> -->
        <el-button type="primary" icon="Search" native-type="submit" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button icon="Document" @click="openDownloadLogDialog">查看下载记录</el-button>
      </el-form-item>
    </el-form>

    <el-card v-loading="loading" shadow="never" class="result-card">
      <template #header>
        <div class="card-header">
          <span>强禁入查询结果</span>
          <el-button
            v-if="queried"
            type="success"
            icon="Download"
            :loading="downloading"
            @click="handleDownloadPdf"
          >
            下载PDF
          </el-button>
        </div>
      </template>

      <el-empty v-if="!queried" description="请输入身份证号后查询" />

      <el-descriptions v-else :column="1" border>
        <el-descriptions-item label="身份证号">{{ result.sfzh || '—' }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ result.xm || '—' }}</el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="isResultFail ? 'danger' : 'success'">{{ result.jg || '—' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="查询时间">{{ result.sj || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- PDF 导出区域：导出时短暂显示以确保 html2canvas 正确渲染 -->
    <div v-if="exportingPdf" ref="pdfRef" class="pdf-panel">
      <h2 class="pdf-panel__title">强禁入查询结果</h2>
      <table class="pdf-panel__table">
        <tbody>
          <tr>
            <th>身份证号</th>
            <td>{{ result.sfzh || '—' }}</td>
          </tr>
          <tr>
            <th>姓名</th>
            <td>{{ result.xm || '—' }}</td>
          </tr>
          <tr>
            <th>结果</th>
            <td :class="isResultFail ? 'pdf-panel__fail' : 'pdf-panel__pass'">{{ result.jg || '—' }}</td>
          </tr>
          <tr>
            <th>查询时间</th>
            <td>{{ result.sj || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-dialog
      v-model="downloadLogOpen"
      title="PDF下载记录"
      width="900px"
      append-to-body
      destroy-on-close
      @open="handleDownloadLogDialogOpen"
    >
      <!-- <el-form :inline="true" :model="downloadLogQuery" class="download-log-form"> -->
      <el-form :inline="true" :model="downloadLogQuery" class="download-log-form" @submit.prevent="getDownloadLogList">
        <el-form-item label="身份证号">
          <el-input
            v-model="downloadLogQuery.sfzh"
            placeholder="请输入身份证号"
            clearable
            maxlength="18"
            style="width: 200px"
            @keyup.enter="getDownloadLogList"
          />
        </el-form-item>
        <el-form-item label="下载人员">
          <el-input
            v-model="downloadLogQuery.downloadUser"
            placeholder="请输入柜员号"
            clearable
            style="width: 160px"
            @keyup.enter="getDownloadLogList"
          />
        </el-form-item>
        <el-form-item>
          <!-- <el-button type="primary" icon="Search" @click="getDownloadLogList">搜索</el-button> -->
          <el-button type="primary" icon="Search" native-type="submit" @click="getDownloadLogList">搜索</el-button>
          <el-button icon="Refresh" @click="resetDownloadLogQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="downloadLogLoading" :data="downloadLogList" border>
        <el-table-column label="身份证号" prop="sfzh" min-width="170" show-overflow-tooltip />
        <el-table-column label="姓名" prop="xm" min-width="100" show-overflow-tooltip />
        <el-table-column label="结果" prop="jg" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag :type="row.jg?.startsWith('不通过') ? 'danger' : 'success'">{{ row.jg || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下载时间" prop="downloadTime" min-width="170" />
        <el-table-column label="下载人员" prop="downloadUser" min-width="100" show-overflow-tooltip />
      </el-table>

      <pagination
        v-show="downloadLogTotal > 0"
        :total="downloadLogTotal"
        v-model:page="downloadLogQuery.pageNum"
        v-model:limit="downloadLogQuery.pageSize"
        @pagination="getDownloadLogList"
      />
    </el-dialog>
  </div>
</template>

<script setup name="StrongProhibition">
import { ref, reactive, computed, getCurrentInstance, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { selectList, selectCustomerName, saveDownloadLog, listDownloadLog } from '@/api/szhl/data/StrongProhibition'

const { proxy } = getCurrentInstance()

const queryFormRef = ref()
const pdfRef = ref()
const loading = ref(false)
const downloading = ref(false)
const exportingPdf = ref(false)
const queried = ref(false)
const downloadLogOpen = ref(false)
const downloadLogLoading = ref(false)
const downloadLogList = ref([])
const downloadLogTotal = ref(0)

const downloadLogQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  sfzh: '',
  downloadUser: ''
})

const queryParams = reactive({
  cust_idcard: ''
})

const rules = {
  cust_idcard: [
    { required: true, message: '身份证号不能为空', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{17}[\dX]$)/i, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

const result = ref({
  sfzh: '',
  xm: '',
  jg: '',
  sj: ''
})

function resetResult() {
  result.value = {
    sfzh: '',
    xm: '',
    jg: '',
    sj: ''
  }
}

const isResultFail = computed(() => result.value.jg?.startsWith('不通过'))

/** 从身份证号计算周岁年龄 */
function calculateAgeFromIdCard(idCard) {
  const id = (idCard || '').trim().toUpperCase()
  let y
  let m
  let d
  if (/^\d{17}[\dX]$/.test(id)) {
    y = parseInt(id.substring(6, 10), 10)
    m = parseInt(id.substring(10, 12), 10)
    d = parseInt(id.substring(12, 14), 10)
  } else if (/^\d{15}$/.test(id)) {
    const yy = parseInt(id.substring(6, 8), 10)
    y = yy <= 30 ? 2000 + yy : 1900 + yy
    m = parseInt(id.substring(8, 10), 10)
    d = parseInt(id.substring(10, 12), 10)
  } else {
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - y
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  if (currentMonth < m || (currentMonth === m && currentDay < d)) {
    age--
  }
  return age
}

/** 根据身份证年龄判断是否直接不通过 */
function getAgeRestrictionResult(idCard) {
  const age = calculateAgeFromIdCard(idCard)
  if (age === null) {
    return null
  }
  if (age >= 65) {
    return '不通过'
  }
  if (age < 23) {
    return '不通过（助学贷款除外）'
  }
  return null
}


function getList() {
  queryFormRef.value?.validate(async valid => {
    if (!valid) {
      return
    }

    loading.value = true
    try {
      const xm = await selectCustomerName(queryParams)
      let jg = '通过'
      let sj = proxy.parseTime(new Date())

      const listResponse = await selectList(queryParams);
      if(listResponse.rows.length > 0){
        jg = "不通过";
      }else{
        const ageResult = getAgeRestrictionResult(queryParams.cust_idcard)
        if (ageResult) {
          jg = ageResult
        } 
      }

      result.value.sfzh = queryParams.cust_idcard;
      result.value.xm = xm;
      result.value.jg = jg;
      result.value.sj = sj;

      queried.value = true
    } catch (error) {
      console.error('获取强禁入结果失败:', error)
      ElMessage.error('获取强禁入结果失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  proxy.resetForm("queryFormRef")
  queried.value = false
  resetResult()
}

function openDownloadLogDialog() {
  downloadLogOpen.value = true
}

function handleDownloadLogDialogOpen() {
  downloadLogQuery.sfzh = queryParams.cust_idcard || ''
  downloadLogQuery.pageNum = 1
  getDownloadLogList()
}

function resetDownloadLogQuery() {
  downloadLogQuery.sfzh = ''
  downloadLogQuery.downloadUser = ''
  downloadLogQuery.pageNum = 1
  getDownloadLogList()
}

async function getDownloadLogList() {
  downloadLogLoading.value = true
  try {
    const response = await listDownloadLog(downloadLogQuery)
    downloadLogList.value = response.rows || []
    downloadLogTotal.value = response.total || 0
  } catch (error) {
    console.error('获取下载记录失败:', error)
    ElMessage.error('获取下载记录失败，请重试')
  } finally {
    downloadLogLoading.value = false
  }
}

function waitForRender() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, 200))
    })
  })
}

async function handleDownloadPdf() {
  if (!queried.value) {
    return
  }

  downloading.value = true
  exportingPdf.value = true
  try {
    await nextTick()
    await waitForRender()

    const element = pdfRef.value
    if (!element) {
      throw new Error('PDF 导出区域未就绪')
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - margin * 2
    const maxHeight = pageHeight - margin * 2

    let renderWidth = maxWidth
    let renderHeight = (canvas.height * renderWidth) / canvas.width
    if (renderHeight > maxHeight) {
      renderHeight = maxHeight
      renderWidth = (canvas.width * renderHeight) / canvas.height
    }

    const offsetX = (pageWidth - renderWidth) / 2
    const offsetY = margin

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight)
    pdf.save(`强禁入查询结果_${result.value.sfzh}.pdf`)

    await saveDownloadLog({
      sfzh: result.value.sfzh,
      xm: result.value.xm,
      jg: result.value.jg
    })
    ElMessage.success('PDF下载成功')
  } catch (error) {
    console.error('下载PDF失败:', error)
    ElMessage.error('下载PDF失败，请重试')
  } finally {
    exportingPdf.value = false
    downloading.value = false
  }
}
</script>

<style scoped>
.result-card {
  max-width: 640px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.download-log-form {
  margin-bottom: 12px;
}

.pdf-panel {
  position: fixed;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  z-index: 100000;
  width: 700px;
  padding: 40px;
  background: #fff;
  color: #333;
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  box-sizing: border-box;
}

.pdf-panel__title {
  margin: 0 0 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.pdf-panel__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}

.pdf-panel__table th,
.pdf-panel__table td {
  border: 1px solid #dcdfe6;
  padding: 12px 16px;
  text-align: left;
  line-height: 1.5;
  color: #333;
  word-break: break-all;
}

.pdf-panel__table th {
  width: 120px;
  background: #f5f7fa;
  font-weight: 600;
}

.pdf-panel__pass {
  color: #67c23a;
  font-weight: 600;
}

.pdf-panel__fail {
  color: #f56c6c;
  font-weight: 600;
}
</style>
