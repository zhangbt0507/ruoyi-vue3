<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
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
      <!-- <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 200px"
        >
          <el-option label="正常" value="正常" />
          <el-option label="异常" value="异常" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="机构号" prop="institutionNumber">
        <el-select
          v-model="queryParams.institutionNumber"
          placeholder="请选择机构号"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="item in orgs"
            :key="item.code || item.deptId"
            :label="`${item.deptName}(${item.code || item.deptId})`"
            :value="item.code || item.deptId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Download" size="default" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          size="default"
          @click="handlePaymentNotice"
        >
          缴款通知书
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <!-- 数据表格 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="arrearsList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="账户名称" align="center" prop="accountName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="账号" align="center" prop="accountNumber" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="应缴合同数" align="center" prop="payableContractCount" min-width="120">
        <template v-slot:default="scope">
          <!-- <el-link type="primary" @click="handleContractDetail(scope.row)"> -->
            {{ scope.row.payableContractCount || 0 }}
          <!-- </el-link> -->
        </template>
      </el-table-column>
      <el-table-column label="应缴金额" align="center" prop="payableAmount" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.payableAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="实缴" align="center" prop="actualPayment" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.actualPayment || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="已退" align="center" prop="refunded" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.refunded || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="个账余额" align="center" prop="accountBalance" min-width="120">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.accountBalance || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="欠缴金额" align="center" prop="arrearsAmount" min-width="120">
        <template v-slot:default="scope">
          <span :style="{ color: parseFloat(scope.row.arrearsAmount || 0) > 0 ? '#f56c6c' : '#67c23a' }">
            {{ formatMoney(scope.row.arrearsAmount || 0, 2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="机构号" align="center" prop="institutionNumber" min-width="120" :show-overflow-tooltip="true"/>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage  } from 'element-plus'
import { listArrearsQuery } from '@/api/szhl/badLoanManage/arrearsQuery'
import { formatMoney } from '@/utils/ruoyi'
import { listAllDept } from '@/api/system/dept'

const { proxy } = getCurrentInstance();

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const arrearsList = ref([])
const selectedRows = ref([])

// 机构号列表
const orgs = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  accountName: '',
  accountNumber: '',
  status: '',
  institutionNumber: ''
})

// 表单引用
const table = ref(null)

// 获取列表数据
function getList() {
  loading.value = true
  
  listArrearsQuery(queryParams).then(response => {
    if (response.code === 200) {
      arrearsList.value = response.rows || []
      total.value = response.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
      arrearsList.value = []
      total.value = 0
    }
  }).catch(error => {
    console.error('获取欠缴查询列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    arrearsList.value = []
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
  queryParams.status = '正常'
  handleQuery()
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedRows.value = selection
}

// 处理合同详情
function handleContractDetail(row) {
  // TODO: 跳转到合同详情页面或打开弹窗
  ElMessage.info(`查看账户 ${row.accountName} 的合同详情`)
}

// 处理缴款通知书
function handlePaymentNotice() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  // TODO: 实现缴款通知书功能
  ElMessage.info('生成缴款通知书')
}

// // 处理导出
// function handleExport() {
//   proxy.download("badLoan/arrearsQuery/export", {
//         ...queryParams.value,
//       },`欠缴统计_${new Date().getTime()}.xlsx`);
// }

//导出
function handleExport(){
    proxy.download("badLoan/arrearsQuery/export", {
    ...queryParams.value,
  },`欠缴统计_${new Date().getTime()}.xlsx`);
}

// 获取机构数据
function getDeptList() {
  listAllDept().then(res => {
    if (res.code == 200) {
      if (res.data && res.data.length > 0) {
        orgs.value = res.data.filter(item => (item.code || item.deptId) !== '907000')
      }
    }
  }).catch(error => {
    console.error('获取机构数据失败:', error)
  })
}

onMounted(() => {
  getDeptList()
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>

