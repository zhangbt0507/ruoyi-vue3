<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-form-item label="责任类型" prop="responsibilityType">
        <el-select
          v-model="queryParams.responsibilityType"
          placeholder="请选择责任类型"
          clearable
          style="width: 200px"
        >
          <el-option label="主调查" value="主调查" />
          <el-option label="副调查" value="副调查" />
          <el-option label="审查" value="审查" />
          <el-option label="审批" value="审批" />
          <el-option label="附加" value="附加" />
        </el-select>
      </el-form-item>
      <el-form-item label="定责状态" prop="determinationStatus">
        <el-select
          v-model="queryParams.determinationStatus"
          placeholder="请选择定责状态"
          clearable
          style="width: 200px"
        >
          <el-option label="初分" value="INITIAL" />
          <el-option label="异议" value="OBJECTION" />
          <el-option label="核对" value="REVIEW" />
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="responsibilityList"
      row-key="id"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column label="操作" align="center" width="80" fixed="left">
        <template v-slot:default="scope">
          <el-button
            :type="scope.row.determinationStatus === 'INITIAL' ? 'primary' : 'info'"
            link
            icon="Edit"
            :disabled="scope.row.determinationStatus !== 'INITIAL'"
            @click="handleView(scope.row)"
          >确责</el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="140" fixed="left" :show-overflow-tooltip="true"/>
      <el-table-column label="贷款机构" align="center" prop="deptId" min-width="80" fixed="left"/>
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="120" fixed="left" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" min-width="170" :show-overflow-tooltip="true"/>
      <el-table-column label="责任人" align="center" prop="nickName" min-width="100" />
      <el-table-column label="责任类型" align="center" prop="responsibilityType" min-width="100">
        <template v-slot:default="scope">
          <el-tag :type="getResponsibilityTypeTag(scope.row.responsibilityType)">
            {{ scope.row.responsibilityType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="责任比例" align="center" prop="responsibilityRatio" min-width="80">
        <template v-slot:default="scope">
          {{ scope.row.responsibilityRatio }}%
        </template>
      </el-table-column>
      <el-table-column label="应缴" align="center" prop="payableRiskFund" min-width="100">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.payableRiskFund || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="已缴" align="center" prop="actualRiskFund" min-width="100">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.actualRiskFund || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="已退" align="center" prop="returnedRiskFund" min-width="100">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.returnedRiskFund || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="determinationStatus" min-width="80">
        <template v-slot:default="scope">
          <el-tag :type="getStatusTag(scope.row.determinationStatus)">
            {{ getStatusText(scope.row.determinationStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="初分人" align="center" prop="initialPerson" min-width="100" />
      <el-table-column label="初分日期" align="center" prop="initialDate" min-width="120" />
      
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 责任人责任核实弹窗 -->
    <responsibility-verification-dialog
      v-model:visible="verificationDialogVisible"
      :selected-row="selectedRow"
      :selected-count="selectedCount"
      @submit="handleVerificationSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listResponsibility, delResponsibility, exportResponsibility } from "@/api/szhl/badLoanManage/responsibility"
import ResponsibilityVerificationDialog from './components/ResponsibilityVerificationDialog.vue'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const responsibilityList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const selectedRow = ref(null)
const selectedRows = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const responsiblePersonDialogVisible = ref(false)
const verificationDialogVisible = ref(false)
const isEdit = ref(false)
const selectedCount = ref(0)

// 列显示控制
const columns = ref([
  { key: 'customerName', label: '客户名称', visible: true },
  { key: 'customerNo', label: '客户号', visible: true },
  { key: 'contractNo', label: '合同号', visible: true },
  { key: 'responsibilityType', label: '责任类型', visible: true },
  { key: 'responsibilityRatio', label: '责任比例', visible: true },
  { key: 'payableRiskFund', label: '风险金金额', visible: true },
  { key: 'responsiblePersonName', label: '责任人姓名', visible: true },
  { key: 'responsiblePersonDept', label: '责任人部门', visible: true },
  { key: 'determinationDate', label: '认定日期', visible: true },
  { key: 'determiner', label: '认定人', visible: true },
  { key: 'status', label: '状态', visible: true }
])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerName: '',
  contractNo: '',
  responsibilityType: '',
  determinationStatus: 'INITIAL'
})

// 表单引用
const queryFormRef = ref(null)

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
  selectedRow.value = selection.length === 1 ? selection[0] : null
  selectedRows.value = selection
}

// 行点击事件
function handleRowClick(row, column, event) {

}

// 检查是否选择了一条记录
function checkSelected() {
  if (single.value) {
    ElMessage.warning("请选择一条记录")
    return false
  }
  return true
}

// 检查是否选择了至少一条记录
function checkMultipleSelected() {
  if (multiple.value) {
    ElMessage.warning("请至少选择一条记录")
    return false
  }
  return true
}

// 获取列表数据
function getList() {
  loading.value = true
  
  listResponsibility(queryParams).then(response => {
    responsibilityList.value = response.rows || []
    total.value = response.total
    loading.value = false
  }).catch(error => {
    console.error('获取责任认定列表失败:', error)
    ElMessage.error('获取数据失败，请重试')
    loading.value = false
  })
}

// 查询操作
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm("queryForm");
  // queryFormRef.value?.resetFields()
  handleQuery()
}

// 新增责任认定
function handleAdd() {
  selectedRow.value = null
  isEdit.value = false
  dialogVisible.value = true
}

// 修改责任认定
function handleEdit() {
  if (!checkSelected()) return
  isEdit.value = true
  dialogVisible.value = true
}

// 删除责任认定
function handleDelete() {
  if (!checkMultipleSelected()) return
  
  ElMessageBox.confirm('是否确认删除选中的责任认定记录？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量删除
    const deletePromises = ids.value.map(id => delResponsibility(id))
    Promise.all(deletePromises).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 导出责任认定
function handleExport() {
  exportResponsibility(queryParams).then(response => {
    // 处理导出逻辑
    ElMessage.success('导出成功')
  }).catch(() => {
    ElMessage.error('导出失败')
  })
}

// 查看责任认定 - 打开责任人责任核实弹窗
function handleView(row) {
  if (row && row.determinationStatus !== 'INITIAL') {
    ElMessage.warning('仅“初分”状态允许确认操作')
    return
  }
  selectedRow.value = row
  selectedCount.value = 1 // 单条记录确认
  verificationDialogVisible.value = true
}

// 修改责任认定
function handleEditRow(row) {
  selectedRow.value = row
  isEdit.value = true
  dialogVisible.value = true
}

// 删除责任认定
function handleDeleteRow(row) {
  ElMessageBox.confirm('是否确认删除该责任认定记录？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delResponsibility(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理责任认定提交
function handleSubmit(formData) {
  console.log('提交的责任认定数据:', formData)
  ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
  getList()
  dialogVisible.value = false
}

// 处理责任人认定提交
function handleResponsiblePersonSubmit(formData) {
  console.log('提交的责任人认定数据:', formData)
  ElMessage.success('责任人认定成功')
  getList()
}

// 处理责任人责任核实提交
function handleVerificationSubmit(formData) {
  getList()
}

// 获取责任类型标签类型
function getResponsibilityTypeTag(type) {
  const typeMap = {
    '主调查': 'danger',
    '副调查': 'warning',
    '审查': 'info',
    '审批': 'warning',
    '附加': ''
  }
  return typeMap[type] || 'info'
}

// 获取状态标签类型
function getStatusTag(status) {
  const statusMap = {
    'NOT_DETERMINED': 'info',
    'INITIAL': 'warning',
    'OBJECTION': 'danger',
    'REVIEW': 'warning',
    'DIRECT_REPORT': 'warning',
    'COMPLETED': 'success'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
function getStatusText(status) {
   //定责状态
   const determinationStatusMap = {
    'NOT_DETERMINED': '未定责',
    'INITIAL': '初分',
    'OBJECTION':'异议',
    'REVIEW': '核对',
    'COMPLETED': '完成'
  }
  return determinationStatusMap[status] || '初分'
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>
