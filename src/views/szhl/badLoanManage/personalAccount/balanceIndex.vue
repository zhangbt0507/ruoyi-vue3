<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
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
        <!-- <el-button type="primary" icon="Download" size="default" @click="handleExport">导出</el-button> -->
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-button type="primary" icon="Edit" size="default" @click="handleRecord">记账</el-button>
    </el-row>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="accountList"
      row-key="accountNumber"
      @row-click="handleRowClick"
    >
      <el-table-column label="账户名称" align="center" prop="accountName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="账号" align="center" prop="accountNumber" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="个账余额" align="center" prop="accountBalance" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.accountBalance, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="最后更新人" align="center" prop="lastUpdater" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="最后更新日期" align="center" prop="updateTime" min-width="120">
        <template v-slot:default="scope">
          {{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" align="center" width="150" fixed="right">
        <template v-slot:default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            size="small"
            @click="handleDetail(scope.row)"
          >明细</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 记账弹窗组件 -->
    <RecordDialog
      v-model="recordDialogVisible"
      @success="handleRecordSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listPersonalAccountBalance, exportPersonalAccountBalance } from "@/api/szhl/badLoanManage/personalAccount"
import { parseTime } from '@/utils/ruoyi'
import RecordDialog from './components/RecordDialog.vue'
import { formatMoney } from '@/utils/ruoyi'

const router = useRouter()

const { proxy } = getCurrentInstance();
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const accountList = ref([])
const selectedRow = ref(null)

// 记账弹窗
const recordDialogVisible = ref(false)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  accountName: '',
  accountNumber: ''
})

// 表单引用
const table = ref(null)

// 行点击事件
function handleRowClick(row) {
  selectedRow.value = row
}

// 获取列表数据
function getList() {
  loading.value = true
  
  listPersonalAccountBalance(queryParams).then(response => {
    if (response.code === 200) {
      accountList.value = response.rows || []
      total.value = response.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
      accountList.value = []
      total.value = 0
    }
  }).catch(error => {
    console.error('获取账户列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    accountList.value = []
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

// 处理记账按钮
function handleRecord() {
  recordDialogVisible.value = true
}

// 记账成功回调
function handleRecordSuccess() {
  getList()
}

// // 处理明细按钮
// function handleDetail(row) {
//   // 跳转到明细页，传递账户信息
//   router.push({
//     path: '/szhl/badLoanManage/personalAccount/detail',
//     query: {
//       accountNumber: row.accountNumber,
//       accountName: row.accountName
//     }
//   })
// }

// // 处理导出按钮
// function handleExport() {
//   exportPersonalAccountBalance(queryParams).then(response => {
//     const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
//     const url = window.URL.createObjectURL(blob)
//     const link = document.createElement('a')
//     link.href = url
//     link.download = '个人账户余额.xlsx'
//     link.click()
//     window.URL.revokeObjectURL(url)
//     ElMessage.success('导出成功')
//   }).catch(error => {
//     console.error('导出失败:', error)
//     ElMessage.error('导出失败，请稍后重试')
//   })
// }

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>

