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
      <el-form-item label="机构号" prop="deptId">
        <el-select
          v-model="queryParams.deptId"
          placeholder="请选择机构"
          clearable
          style="width: 200px"
        >
          <el-option v-for="item in orgs" :key="item.code || item.deptId" :label="`${item.deptName}(${item.code || item.deptId})`" :value="item.code || item.deptId" />
        </el-select>
      </el-form-item>
      <el-form-item label="五级形态" prop="wjxt">
        <el-select
          v-model="queryParams.wjxt"
          placeholder="请选择"
          clearable
          style="width: 200px"
        >
          <el-option label="正常" value="正常" />
          <el-option label="关注" value="关注" />
          <el-option label="次级" value="次级" />
          <el-option label="可疑" value="可疑" />
          <el-option label="损失" value="损失" />
        </el-select>
      </el-form-item>
      <el-form-item label="贷款种类" prop="zl">
        <el-select
          v-model="queryParams.zl"
          placeholder="请选择"
          clearable
          style="width: 200px"
        >
          <el-option label="普通贷款" value="普通贷款" />
          <el-option label="贷款核销" value="贷款核销" />
          <el-option label="贴现" value="贴现" />
          <el-option label="保函" value="保函" />
          <el-option label="承兑" value="承兑" />
        </el-select>
      </el-form-item>
      <el-form-item label="当前余额" prop="htye">
        <el-select
          v-model="queryParams.htye"
          placeholder="请选择"
          clearable
          style="width: 200px"
        >
          <el-option label=">0" value="1" />
          <el-option label="=0" value="0" />
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
          icon="Plus" 
          size="default"
          @click="handleAdd"
        >建档</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit" 
          size="default"
          @click="handleAddBlack"
        >加解黑名单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Check" 
          size="default"
          @click="handleRemoveRestriction"
        >解止扣</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Document" 
          size="default"
          @click="handleNote"
        >记事</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Warning" 
          size="default"
          @click="handleInquiry"
        >查征信</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="More" 
          size="default"
          @click="handleDetail"
        >详情</el-button>
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
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="130" />
      <el-table-column label="合同日期" align="center" prop="contractStartDate" min-width="100" />
      <el-table-column label="到期日期" align="center" prop="contractEndDate" min-width="100" />
      <el-table-column label="五级形态" align="center" prop="wjxt" min-width="100" />
      <el-table-column label="贷款种类" align="center" prop="zl" min-width="100" />
      <el-table-column label="合同金额" align="center" prop="contractAmount" min-width="110">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.contractAmount, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="贷款余额" align="center" prop="loanBalance" min-width="110">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.loanBalance || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="贷款用途" align="center" prop="loanPurpose" min-width="80" :show-overflow-tooltip="true"/>
      <el-table-column label="担保方式" align="center" prop="guaranteeType" min-width="90" />
      <el-table-column label="机构号" align="center" prop="managementInstitution" min-width="90" />
      <!-- <el-table-column label="责任人" align="center" prop="managementPerson" min-width="90" /> -->
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 引入建档弹窗组件 -->
    <filing-dialog
      v-model:visible="addDialogVisible"
      :selected-row="selectedRow"
      @submit="handleFilingSubmit"
    />

    <!-- 引入加黑名单弹窗组件 -->
    <blacklist-dialog
      v-model:visible="blacklistDialogVisible"
      :selected-rows="selectedRows"
      @submit="handleBlacklistSubmit"
    />

    <!-- 引入解止扣弹窗组件 -->
    <restriction-dialog
      v-model:visible="restrictionDialogVisible"
      :selected-rows="selectedRows"
      @submit="handleRestrictionSubmit"
    />

    <!-- 引入记事弹窗组件 -->
    <note-dialog
      v-model:visible="noteDialogVisible"
      :selected-row="selectedRow"
    />
    
    <!-- 引入详情弹窗组件 -->
    <detail-dialog
      v-model:visible="detailDialogVisible"
      :selected-row="selectedRow"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listToBeSet } from "@/api/szhl/badLoanManage/tobeset"
import { selectUserBydept } from "@/api/system/user"
import { listAllDept } from "@/api/system/dept"
import useUserStore from '@/store/modules/user'
import { formatMoney } from '@/utils/ruoyi'
import FilingDialog from './components/FilingDialog.vue'
import BlacklistDialog from './components/BlacklistDialog.vue'
import RestrictionDialog from './components/RestrictionDialog.vue'
import NoteDialog from './components/NoteDialog.vue'
import DetailDialog from './components/DetailDialog.vue'

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

// 机构和管贷人数据
const orgs = ref([])
const managers = ref([])
const userStore = useUserStore()

// 弹窗相关
const addDialogVisible = ref(false)
const blacklistDialogVisible = ref(false)
const restrictionDialogVisible = ref(false)
const noteDialogVisible = ref(false)
const detailDialogVisible = ref(false)

// 列显示控制
const columns = ref([
  { key: 'customerName', label: '客户名称', visible: true },
  { key: 'customerNo', label: '客户号', visible: true },
  { key: 'contractNo', label: '合同号', visible: true },
  { key: 'contractStartDate', label: '合同日期', visible: true },
  { key: 'contractEndDate', label: '到期日期', visible: true },
  { key: 'contractAmount', label: '合同金额', visible: true },
  { key: 'loanBalance', label: '贷款余额', visible: true },
  { key: 'guaranteeType', label: '担保方式', visible: true },
  { key: 'managementInstitution', label: '机构号', visible: true },
  { key: 'managementPerson', label: '责任人', visible: true }
])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerName: '',
  contractNo: '',
  deptId: '',
  managementPerson: '',
  wjxt: '次级'
})

// 表单引用
const queryForm = ref(null)
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
  // 避免点击选择框列时触发行选择（避免重复切换）
  if (column && column.type === 'selection') {
    return
  }
  // 切换行的选中状态
  table.value.toggleRowSelection(row)
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
  
  // 构建查询参数 - 将页面查询参数映射到待建档表字段
  const params = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    contractNo: queryParams.contractNo,
    nfanflnm: queryParams.customerName, // 户名 对应 客户名称
    nfaabrno: queryParams.deptId,       // 合同机构 对应 机构号
    wjxt: queryParams.wjxt,
    zl: queryParams.zl,
    htye: queryParams.htye
    // 其他字段可根据需要添加
  }
  
  // 调用待建档合同列表接口
  listToBeSet(params).then(response => {
    // 数据映射：将待建档表字段映射到页面显示字段
    badLoanList.value = response.rows.map(item => ({
      contractNo: item.contractNo,           // 合同号
      customerName: item.nfanflnm,           // 户名 -> 客户名称
      customerNo: item.nfabcsid,             // 客户号
      customerCode: item.nfaacsno,
      contractAmount: item.nfaallmt,         // 合同金额
      wjxt: item.wjxt,
      zl: item.zl,
      loanBalance: item.htye,                // 合同余额 -> 贷款余额
      contractStartDate: item.nfabdate,      // 合同起始日
      contractEndDate: item.nfacdate,        // 合同终止日
      guaranteeType: item.nfaassty,          // 担保方式
      loanPurpose: item.dkyt, //贷款用途
      managementInstitution: item.nfaabrno,  // 合同机构 -> 管贷机构
      badLoanLevel: item.wjxt,               // 五级形态 -> 不良级别
      // 保留原始数据，以便后续使用
      _raw: item
    }))
    
    total.value = response.total
    loading.value = false
  }).catch(error => {
    console.error('获取待建档列表失败:', error)
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
  handleQuery()
}

// 处理建档按钮
function handleAdd() {
  if (!checkSelected()) return
  addDialogVisible.value = true
}

// 处理建档提交
function handleFilingSubmit(formData) {
  getList();
}

// 处理加黑名单按钮
function handleAddBlack() {
  if (!checkSelected()) return
  blacklistDialogVisible.value = true
}

// 处理加黑名单提交
function handleBlacklistSubmit(formData) {
  console.log('提交的黑名单数据:', formData)
  
  const successMessage = formData.operationType === 'add' 
    ? '加入黑名单操作成功' 
    : '解除黑名单操作成功'
  
  ElMessage.success(successMessage)
}

// 处理解止扣按钮
function handleRemoveRestriction() {
  if (!checkSelected()) return
  restrictionDialogVisible.value = true
}

// 处理解止扣提交
function handleRestrictionSubmit(formData) {
  console.log('提交的解止扣数据:', formData)
  
  let successMessage
  switch (formData.operationType) {
    case 'fullStop':
      successMessage = '全额止付操作成功'
      break
    case 'partialStop':
      successMessage = '部分止付操作成功'
      break
    case 'release':
      successMessage = '解止付操作成功'
      break
    default:
      successMessage = '操作成功'
  }
  
  ElMessage.success(successMessage)
}

// 处理记事按钮
function handleNote() {
  if (!checkSelected()) return
  noteDialogVisible.value = true
}

// 处理查征信按钮
function handleInquiry() {
  if (!checkSelected()) return
  
  ElMessage.info('查询征信功能开发中')
}

// 处理详情按钮
function handleDetail() {
  if (!checkSelected()) return
  detailDialogVisible.value = true
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
  const currentDeptId = userStore.deptId
  if (currentDeptId) {
    selectUserBydept({ deptId: currentDeptId }).then(res => {
      if (res.code === 200) {
        managers.value = res.data || []
      }
    }).catch(error => {
      console.error('获取管贷人数据失败:', error)
      ElMessage.error('获取管贷人数据失败')
    })
  }
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