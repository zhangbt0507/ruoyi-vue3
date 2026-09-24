<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机构号" prop="deptId">
        <el-select
          v-model="queryParams.deptId"
          placeholder="请选择..."
          clearable
          style="width: 200px"
        >
          <el-option v-for="item in orgs" :key="item.code || item.deptId" :label="`${item.deptName}(${item.code || item.deptId})`" :value="item.code || item.deptId" />
        </el-select>
      </el-form-item>
      <el-form-item label="管贷人" prop="managementPerson">
        <el-select
          v-model="queryParams.managementPerson"
          placeholder="请选择..."
          clearable
          style="width: 200px"
          filterable
        >
          <el-option v-for="option in managerOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="定责状态" prop="determinationStatus">
        <el-select
          v-model="queryParams.determinationStatus"
          placeholder="请选择..."
          clearable
          style="width: 200px"
        >
          <el-option label="未定责" value="NOT_DETERMINED" />
          <el-option label="初分" value="INITIAL" />
          <el-option label="异议" value="OBJECTION" />
          <el-option label="核对" value="REVIEW" />
          <el-option label="直报" value="DIRECT_REPORT" />
          <el-option label="完成" value="COMPLETED" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="风险金状态" prop="riskFundStatus">
        <el-select
          v-model="queryParams.riskFundStatus"
          placeholder="请选择..."
          clearable
          style="width: 200px"
        >
          <el-option label="未算" value="NOT_CALCULATED" />
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Money" 
          size="default"
          :disabled="!selectedRow || (selectedRow.riskFundStatus === 'COMPLETED') || single"
          @click="handleRiskFundCalculation"
        >风险金计算</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="View" 
          size="default"
          @click="handleDetail"
        >详情</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Download" 
          size="default"
          @click="handleExport"
        >导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="badLoanList"
      row-key="contractNo"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" align="center" fixed="left"/>
      <el-table-column label="类型" align="center" prop="badLoanNature" min-width="60" />
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="合同日期" align="center" prop="contractStartDate" min-width="100" />
      <el-table-column label="到期日期" align="center" prop="contractEndDate" min-width="100" />
      <el-table-column label="建档金额" align="center" prop="filingAmount" min-width="100">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.filingAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="当前余额" align="center" prop="currentBalance" min-width="100">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.currentBalance || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="担保方式" align="center" prop="guaranteeType" min-width="90" />
      <el-table-column label="定责状态" align="center" prop="determinationStatus" min-width="80" >
        <template v-slot:default="scope">
          <el-tag :type="getStatusTag(scope.row.determinationStatus)">
            {{ determinationStatusMap[scope.row.determinationStatus] || '未定责' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="风险金状态" align="center" prop="riskFundStatus" min-width="90" >
        <template v-slot:default="scope">
          <el-tag :type="getStatusTag(scope.row.riskFundStatus)">
            {{ riskFundStatusMap[scope.row.riskFundStatus] || '未缴' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="应缴金" align="center" prop="riskFundPayable" min-width="90">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.riskFundPayable || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="实缴金" align="center" prop="actualAmount" min-width="90">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.actualAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="已退金" align="center" prop="refundedAmount" min-width="90">
        <template v-slot:default="scope">
          {{ scope.row.refundedAmount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="机构号" align="center" prop="managementInstitution" min-width="80" />
      <el-table-column label="管贷人" align="center" prop="managementPerson" min-width="80" />
    </el-table>
      
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <risk-fund-dialog
      v-model:visible="riskFundDialogVisible"
      :selected-row="selectedRow"
      :responsibility-list="responsibilityRows"
      @calculate="handleRiskFundCalculate"
      @save="handleRiskFundSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listBadLoan } from "@/api/szhl/badLoanManage/badLoan"
import { queryAllUser } from "@/api/system/user"
import { listAllDept } from "@/api/system/dept"
import useUserStore from '@/store/modules/user'
import RiskFundDialog from './components/RiskFundDialog.vue'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const badLoanList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const selectedRow = ref(null)
const selectedRows = ref([])
const riskFundDialogVisible = ref(false)
const responsibilityRows = ref([])

// 机构和管贷人数据
const orgs = ref([])
const managerOptions = ref([])
const userStore = useUserStore()

//定责状态
const determinationStatusMap = ref({
  'NOT_DETERMINED': '未定责',
  'INITIAL': '初分',
  'OBJECTION':'异议',
  'REVIEW': '核对',
  "DIRECT_REPORT": '直报',
  'COMPLETED': '完成'
})

//风险金状态
const riskFundStatusMap = ref({
  'NOT_CALCULATED': '未算',
  'COMPLETED': '完成'
})

// 获取状态标签类型
function getStatusTag(status) {
  const statusMap = {
    'NOT_DETERMINED': 'info',
    'INITIAL': 'warning',
    'OBJECTION': 'danger',
    'REVIEW': 'success',
    'DIRECT_REPORT': 'primary',
    'COMPLETED': 'success'
  }
  return statusMap[status] || 'info'
}


// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerName: '',
  deptId: '',
  managementPerson: '',
  determinationStatus: '',
  riskFundStatus: 'NOT_CALCULATED'
})

// 表单引用
const queryFormRef = ref(null)
const table = ref(null)

// 多选框选中数据 - 实现单选模式
function handleSelectionChange(selection) {
  // 如果选择了多条记录，只保留最后一条（实现单选效果）
  if (selection.length > 1) {
    const lastSelected = selection[selection.length - 1]
    // 清空所有选择，只选择最后一条
    table.value.clearSelection()
    table.value.toggleRowSelection(lastSelected, true)
    selectedRow.value = lastSelected
    ids.value = [lastSelected.contractNo]
    single.value = false
    multiple.value = false
    selectedRows.value = [lastSelected]
  } else {
    ids.value = selection.map(item => item.contractNo)
    single.value = selection.length !== 1
    multiple.value = !selection.length
    selectedRow.value = selection.length === 1 ? selection[0] : null
    selectedRows.value = selection
  }
}

// 行点击事件
function handleRowClick(row, column, event) {
  // 避免点击选择框列时触发行选择
  if (column.type !== 'selection') {
    table.value && table.value.toggleRowSelection(row)
  }
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

  queryParams.determinationStatus = 'COMPLETED'
  
  // 调用真实API接口获取数据
  listBadLoan(queryParams).then(response => {
    if (response.code === 200) {
      badLoanList.value = response.rows || []
      total.value = response.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
      badLoanList.value = []
      total.value = 0
    }
  }).catch(error => {
    console.error('获取不良贷款数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    badLoanList.value = []
    total.value = 0
  }).finally(() => {
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
  proxy.resetForm("queryFormRef");
  // queryFormRef.value?.resetFields()
  handleQuery()
}

// 处理风险金计算按钮
function handleRiskFundCalculation() {
  if (!checkSelected()) return
  const list = selectedRow.value?.responsibilityList || []
  responsibilityRows.value = list.map((item, index) => ({
    index,
    ...item
  }))
  riskFundDialogVisible.value = true
}

// 处理详情按钮
function handleDetail() {
  if (!checkSelected()) return
  ElMessage.info('详情功能开发中')
}

// 处理导出按钮
function handleExport() {
  if (!checkMultipleSelected()) return
  ElMessage.info('导出功能开发中')
}

function handleRiskFundCalculate(payload) {
  console.log('风险金分解计算', payload)
  ElMessage.success('风险金分解计算完成（示例）')
}

function handleRiskFundSave(payload) {
  riskFundDialogVisible.value = false;
  getList()
}

// 获取机构数据
function getDeptList() {
  listAllDept().then(res => {
    if (res.code == 200) {
      // 先看看数据结构
      if (res.data && res.data.length > 0) {
        orgs.value = res.data.filter(item => (item.code || item.deptId) !== '907000')
      }
    }
  })
}

// 获取当前用户机构的管贷人数据
function getManagerList() {
  queryAllUser().then(res => {
    if (res.code === 200) {
      managerOptions.value = res.data.map(user => ({
        label: `${user.nickName}（${user.userName}）`, // 显示姓名和工号
        value: user.userName
      }))
    }
  }).catch(error => {
    console.error('获取管贷人数据失败:', error)
    ElMessage.error('获取管贷人数据失败')
  })
}

onMounted(() => {
  getDeptList()
  getManagerList()
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>
