<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="账户名称" prop="accountName">
        <el-input
          v-model="queryParams.accountName"
          placeholder="请输入账户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="账号" prop="accountNumber">
        <el-input
          v-model="queryParams.accountNumber"
          placeholder="请输入账号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
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
      ref="table"
      v-loading="loading"
      :data="statementList"
    >
      <el-table-column label="操作" align="center" width="100" fixed="left">
        <template v-slot:default="scope">
          <el-button
            type="primary"
            link
            size="small"

            :disabled="scope.row.businessStatus === 'REVIEW' || scope.row.businessStatus === 'CANCEL'"
            :style="{color: ((scope.row.businessStatus === 'REVIEW' || scope.row.businessStatus === 'CANCEL') ? '#ccc' : '')}"
            @click="handleReview(scope.row)"
          >
            复核
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="记账日期" align="center" prop="bookingDate" min-width="120">
        <template v-slot:default="scope">
          {{ parseTime(scope.row.bookingDate, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="账号" align="center" prop="accountNumber" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="户名" align="center" prop="accountName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="摘要" align="center" prop="summary" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="发生额" align="center" min-width="120">
        <template v-slot:default="scope">
          <span v-if="scope.row.debitAmount && parseFloat(scope.row.debitAmount) > 0" style="color: #f56c6c;">
            -{{ formatMoney(scope.row.debitAmount || 0, 2) }}
          </span>
          <span v-else-if="scope.row.creditAmount && parseFloat(scope.row.creditAmount) > 0" style="color: #67c23a;">
            +{{ formatMoney(scope.row.creditAmount || 0, 2) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center" prop="balance" min-width="120">
        <template v-slot:default="scope">
          <span style="color: #409eff; font-weight: bold;">
            {{ formatMoney(scope.row.balance || 0, 2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="对方账号" align="center" prop="contractNo" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center" prop="businessStatus" min-width="100">
        <template #default="scope">
          <el-tag :type="getBusinessStatusTag(scope.row.businessStatus)">
            {{ businessStatusMap[scope.row.businessStatus] || '' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remarks" min-width="150" :show-overflow-tooltip="true"/>
      
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    
    <!-- 复核弹窗 -->
    <ReviewDialog
      v-model="reviewDialogVisible"
      :record-id="currentRecordId"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  listPersonalAccountStatement
} from "@/api/szhl/badLoanManage/personalAccountStatement"
import { parseTime } from '@/utils/ruoyi'
import ReviewDialog from './components/ReviewDialog.vue'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const statementList = ref([])
const reviewDialogVisible = ref(false)
const currentRecordId = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  accountName: '',
  accountNumber: ''
})

// 表单引用
const table = ref(null)

// 定责状态映射
const businessStatusMap = {
  'BOOKING': '记账',
  'REVIEW': '已复核',
  'CANCEL': '作废',
  'REFUND': '退缴'
}
// 获取状态标签类型
function getBusinessStatusTag(status) {
  const map = {
    'BOOKING': 'info',
    'REVIEW': 'success',
    'CANCEL': 'danger',
    'REFUND': 'primary'
  }
  return map[status] || 'info'
}

// 获取列表数据
function getList() {
  loading.value = true
  queryParams.businessStatus = "BOOKING";
  listPersonalAccountStatement(queryParams).then(response => {
    if (response.code === 200) {
      statementList.value = response.rows || []
      total.value = response.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
      statementList.value = []
      total.value = 0
    }
  }).catch(error => {
    console.error('获取明细列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    statementList.value = []
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
  proxy.resetForm("queryForm");
  handleQuery()
}

// 处理复核操作
function handleReview(row) {
  currentRecordId.value = row.id
  reviewDialogVisible.value = true
}

// 复核成功回调
function handleReviewSuccess() {
  getList()
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

