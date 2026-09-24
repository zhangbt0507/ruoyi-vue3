<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="账号" prop="accountNumber" :required="true">
        <el-select
          v-if="isAdmin"
          v-model="queryParams.accountNumber"
          placeholder="请选择账号"
          clearable
          filterable
          style="width: 240px"
        >
          <el-option
            v-for="user in userList"
            :key="user.userName"
            :label="`${user.nickName || ''}（${user.userName}）`"
            :value="user.userName"
          />
        </el-select>
        <el-input
          v-else
          v-model="queryParams.accountNumber"
          placeholder="请输入账号"
          disabled
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-select
          v-model="queryParams.summary"
          placeholder="请选择摘要"
          clearable
          style="width: 200px"
        >
          <el-option label="初始化(+)" value="初始化(+)" />
          <el-option label="存入(+)" value="存入(+)" />
          <el-option label="支取(-)" value="支取(-)" />
          <el-option label="充营业外(-)" value="充营业外(-)" />
          <el-option label="风险金扣款(-)" value="风险金扣款(-)" />
          <el-option label="风险金退缴(+)" value="风险金退缴(+)" />
          <el-option label="冲销(-)" value="冲销(-)" />
          <!-- <el-option label="初始化" value="初始化" />
          <el-option label="退风险金" value="退风险金" />
          <el-option label="支取" value="支取" />
          <el-option label="财务转入" value="财务转入" />
          <el-option label="扣风险金" value="扣风险金" /> -->
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="dateRange">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px"
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
      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button type="primary" icon="Download" size="default" @click="handleExport">导出</el-button>
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
      <el-table-column label="记账日期" align="center" prop="bookingDate" min-width="120">
        <template v-slot:default="scope">
          {{ parseTime(scope.row.bookingDate, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="账户名称" align="center" prop="accountName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="摘要" align="center" prop="summary" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="借方发生额" align="center" prop="debitAmount" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.debitAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="贷方发生额" align="center" prop="creditAmount" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.creditAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center" prop="balance" min-width="120">
        <template v-slot:default="scope">
          <span style="color: #409eff; font-weight: bold;">
            {{ formatMoney(scope.row.balance || 0, 2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="业务状态" align="center" prop="businessStatus" min-width="100">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  listPersonalAccountStatement
} from "@/api/szhl/badLoanManage/personalAccountStatement"
import { listUser } from '@/api/system/user'
import { parseTime } from '@/utils/ruoyi'
import useUserStore from '@/store/modules/user'
import { formatMoney } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const userStore = useUserStore()
const currentUser = {
  userName: String(userStore.name || ''),
  deptId: String(userStore.deptId || '')
}


// 定责状态映射
const businessStatusMap = {
  'BOOKING': '记账',
  'REVIEW': '已复核',
  'CANCEL': '作废',
  'REFUND': '退缴'
}

const route = useRoute()

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const statementList = ref([])
const dateRange = ref([])
const userList = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  accountNumber: currentUser.userName,
  summary: '',
  contractNo: '',
  params: {
    bookingBeginTime: '',
    bookingEndTime: ''
  }
})

// 表单引用
const queryFormRef = ref(null)
const table = ref(null)

const isAdmin = computed(() => currentUser.userName === 'admin')

async function loadUserList() {
  try {
    const response = await listUser({ pageNum: 1, pageSize: 1000 })
    if (response.code === 200) {
      userList.value = response.rows || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
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
  // 账号必填验证
  if (!queryParams.accountNumber) {
    ElMessage.warning('请输入账号')
    return
  }
  
  loading.value = true
  
  // 设置时间范围（使用记账日期）
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.params.bookingBeginTime = dateRange.value[0] + ' 00:00:00'
    queryParams.params.bookingEndTime = dateRange.value[1] + ' 23:59:59'
  } else {
    queryParams.params.bookingBeginTime = ''
    queryParams.params.bookingEndTime = ''
  }
  
  // 从路由参数获取账号（如果有）
  if (route.query.accountNumber && !queryParams.accountNumber) {
    queryParams.accountNumber = route.query.accountNumber
  }
  queryParams.businessStatus = 'REVIEW'
  
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

// 处理导出按钮
function handleExport() {
  // 账号必填验证
  if (!queryParams.accountNumber) {
    ElMessage.warning('请输入账号')
    return
  }
  
  // 设置时间范围（使用记账日期）
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.params.bookingBeginTime = dateRange.value[0] + ' 00:00:00'
    queryParams.params.bookingEndTime = dateRange.value[1] + ' 23:59:59'
  } else {
    queryParams.params.bookingBeginTime = ''
    queryParams.params.bookingEndTime = ''
  }
  debugger
  proxy.download("badLoan/personalAccountStatement/export", {
    ...queryParams,
  },`账户明细_${new Date().getTime()}.xlsx`);
}
  
  // exportPersonalAccountStatement(queryParams).then(response => {
  //   const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
  //   const url = window.URL.createObjectURL(blob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = '个账明细.xlsx'
  //   link.click()
  //   window.URL.revokeObjectURL(url)
  //   ElMessage.success('导出成功')
  // }).catch(error => {
  //   console.error('导出失败:', error)
  //   ElMessage.error('导出失败，请稍后重试')
  // })
// }

onMounted(() => {
  console.log(isAdmin.value)
  if (isAdmin.value) {
    loadUserList()
  }
  // 从路由参数获取账号
  if (route.query.accountNumber) {
    queryParams.accountNumber = route.query.accountNumber
    getList()
  }
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>

