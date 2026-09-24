<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="合同号" prop="contractNo">
        <el-input
          v-model="queryParams.contractNo"
          placeholder="请输入合同号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="定责状态" prop="determinationStatus">
        <el-select v-model="queryParams.determinationStatus" style="width: 200px" clearable>
          <el-option label="直报" value="DIRECT_REPORT" />
          <el-option label="初分" value="INITIAL" />
          <el-option label="核对" value="REVIEW" />
          <el-option label="异议" value="OBJECTION" />
          <el-option label="未定责" value="NOT_DETERMINED" />
          <el-option label="完成" value="COMPLETED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <template v-if="selectedRow && selectedRow.determinationStatus === 'REVIEW'">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus" 
            size="default"
            @click="handleAdd"
          >常规审批</el-button>
        </el-col>
      </template>
      <template v-if="selectedRow && selectedRow.determinationStatus !== 'COMPLETED'">
        <el-col :span="1.5">
            <el-button
            type="primary"
            plain
            icon="Edit" 
            size="default"
            @click="handleAddBlack"
            >会议定责</el-button>
        </el-col>
      </template>
      
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
      row-key="contractNo"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="类型" align="center" prop="badLoanNature" min-width="80" />
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column label="客户号" align="center" prop="customerNo" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="140" :show-overflow-tooltip="true" />
      <el-table-column label="建档金额" align="center" prop="contractAmount" min-width="110">
        <template #default="scope">{{ formatMoney(scope.row.contractAmount || 0, 2) }}</template>
      </el-table-column>
      <el-table-column label="建档日期" align="center" prop="filingDate" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column label="定责状态" align="center" prop="determinationStatus" min-width="100">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.determinationStatus)">
            {{ determinationStatusMap[scope.row.determinationStatus] || '未定责' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="机构号" align="center" prop="managementInstitution" min-width="90" />
      <el-table-column label="管贷人" align="center" prop="managementPerson" min-width="90" />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 弹窗：常规审批 -->
    <head-regular-approval-dialog
      v-model:visible="regularDialogVisible"
      :selected-row="selectedRow"
      @submit="handleRegularSubmit"
    />

    <!-- 弹窗：会议定责 -->
    <head-meeting-determination-dialog
      v-model:visible="meetingDialogVisible"
      :selected-row="selectedRow"
      @submit="handleMeetingSubmit"
    />
  </div>
  
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listBadLoan } from '@/api/szhl/badLoanManage/badLoan'
import HeadRegularApprovalDialog from './components/HeadRegularApprovalDialog.vue'
import HeadMeetingDeterminationDialog from './components/HeadMeetingDeterminationDialog.vue'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const selectedRow = ref(null)
const selectedRows = ref([])
const table = ref(null)
const queryFormRef = ref(null)
const regularDialogVisible = ref(false)
const meetingDialogVisible = ref(false)

// 定责状态映射
const determinationStatusMap = {
  'NOT_DETERMINED': '未定责',
  'INITIAL': '初分',
  'OBJECTION': '异议',
  'REVIEW': '核对',
  'DIRECT_REPORT': '直报',
  'COMPLETED': '完成'
}

function getStatusTag(status) {
  const map = {
    'NOT_DETERMINED': 'info',
    'INITIAL': 'warning',
    'OBJECTION': 'danger',
    'REVIEW': 'success',
    'DIRECT_REPORT': 'info',
    'COMPLETED': 'success'
  }
  return map[status] || 'info'
}

// 查询参数（默认只看直报到总行的）
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerName: '',
  contractNo: '',
  determinationStatus: ''
})

function handleSelectionChange(selection) {
  // 单选模式：若多选，仅保留最后一条
  if (selection.length > 1) {
    const last = selection[selection.length - 1]
    table.value.clearSelection()
    table.value.toggleRowSelection(last, true)
    selectedRow.value = last
    ids.value = [last.contractNo]
    single.value = false
    multiple.value = false
    selectedRows.value = [last]
  } else {
    ids.value = selection.map(item => item.contractNo)
    single.value = selection.length !== 1
    multiple.value = !selection.length
    selectedRow.value = selection.length === 1 ? selection[0] : null
    selectedRows.value = selection
  }
}

function handleRowClick(row, column) {
  if (column.type !== 'selection') {
    table.value && table.value.toggleRowSelection(row)
  }
}

function handleAdd() {
  if (!selectedRow.value) {
    ElMessage.warning('请选择一条记录')
    return
  }
  // 这里的责任列表可按需从后端加载；暂用空数组或父页自行注入
//   regularRespList.value = []
  regularDialogVisible.value = true
}

function handleAddBlack() {
  if (!selectedRow.value) {
    ElMessage.warning('请选择一条记录')
    return
  }
  meetingDialogVisible.value = true
}

function handleRegularSubmit() {
  regularDialogVisible.value = false
  getList()
}

function handleMeetingSubmit() {
  meetingDialogVisible.value = false
  getList()
}

function getList() {
  loading.value = true
  listBadLoan(queryParams)
    .then(res => {
      if (res.code === 200) {
        list.value = res.rows || []
        total.value = res.total || 0
      } else {
        list.value = []
        total.value = 0
        ElMessage.error(res.msg || '获取数据失败')
      }
    })
    .catch(err => {
      console.error('获取列表失败:', err)
      list.value = []
      total.value = 0
      ElMessage.error('获取数据失败，请稍后重试')
    })
    .finally(() => (loading.value = false))
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryFormRef");
  // queryFormRef.value?.resetFields()
  // 重置为默认筛选“直报”
  queryParams.determinationStatus = 'DIRECT_REPORT'
  handleQuery()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mb8 { margin-bottom: 8px; }
</style>


