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
        <el-form-item label="管贷人" prop="managementPerson">
          <el-select
            v-model="queryParams.managementPerson"
            placeholder="请选择管贷人"
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
        <el-form-item label="类型" prop="badLoanNature">
          <el-select
            v-model="queryParams.badLoanNature"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <el-option label="不良" value="不良" />
            <el-option label="核销" value="核销" />
            <el-option label="正常" value="正常" />
            <el-option label="盘活" value="盘活" />
          </el-select>
        </el-form-item>
        <el-form-item label="定责状态" prop="determinationStatus">
          <el-select
            v-model="queryParams.determinationStatus"
            placeholder="请选择"
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
        </el-form-item>
        <el-form-item label="当前余额" prop="currentBalance">
          <el-select
            v-model="queryParams.currentBalance"
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
          @click="handleEdit"
        >补档</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit" 
          size="default"
          @click="handleAddBlack"
        >加解黑</el-button>
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
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Share" 
          size="default"
          :disabled="!selectedRow || (selectedRow.determinationStatus !== 'INITIAL' && selectedRow.determinationStatus !== 'NOT_DETERMINED') 
            || single || !checkPermi(['szhl:responsibility:add'])"
          @click="handleResponsibility"
        >责任初分</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Files" 
          size="default"
          @click="handleLitigationRegister"
        >诉讼登记</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="List" 
          size="default"
          @click="handleRepaymentDetails"
        >还款明细</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Picture" 
          size="default"
          @click="handleImage"
        >影像</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="More" 
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
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Money" 
          size="default"
          @click="handleRiskFundApplication"
        >追风险金申请</el-button>
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
      <el-table-column label="类型" align="center" prop="badLoanNature" min-width="60" />
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="120" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" min-width="200" :show-overflow-tooltip="true"/>
      <el-table-column label="合同号" align="center" prop="contractNo" min-width="150" :show-overflow-tooltip="true"/>
      <el-table-column label="合同日期" align="center" prop="contractStartDate" min-width="100" />
      <el-table-column label="到期日期" align="center" prop="contractEndDate" min-width="100" />
      <el-table-column label="定责状态" align="center" prop="determinationStatus" min-width="100" >
        <template v-slot:default="scope">
          <el-tag :type="getStatusTag(scope.row.determinationStatus)">
            {{ determinationStatusMap[scope.row.determinationStatus] || '未定责' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="建档金额" align="center" prop="contractAmount" min-width="100">
        <template v-slot:default="scope">
          {{ formatMoney(scope.row.contractAmount || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="当前余额" align="center" prop="currentBalance" min-width="100">
        <template v-slot:default="scope">
            {{ formatMoney(scope.row.currentBalance || 0, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="担保方式" align="center" prop="guaranteeType" min-width="90" />
      <el-table-column label="诉讼时效" align="center" prop="litigationDeadline" min-width="100">
        <template v-slot:default="scope">
          {{ scope.row.litigationDeadline || '-' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="诉讼进程" align="center" prop="litigationStatus" min-width="80">
        <template v-slot:default="scope">
          <span style="color: #409eff; cursor: pointer;">{{ scope.row.litigationStatus || '已起诉' }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="原机构" align="center" prop="originalLoanInstitution" min-width="80" />
      <el-table-column label="管贷机构" align="center" prop="managementInstitution" min-width="80" />
      <el-table-column label="管贷人" align="center" prop="managementPerson" min-width="80" />
      <el-table-column label="建档人" align="center" prop="filingPerson" min-width="80" />
      <el-table-column label="建档日期" align="center" prop="filingDate" min-width="100" />
      <!-- <el-table-column label="更新人" align="center" prop="updateBy" min-width="80" />
      <el-table-column label="最后更新时间" align="center" prop="updateTime" min-width="160" /> -->
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
        :is-supplement="true"
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

      <!-- 引入责任初分弹窗组件 -->
      <responsibility-dialog
        v-model:visible="responsibilityDialogVisible"
        :selected-row="selectedRow"
        @submit="handleResponsibilitySubmit"
      />
    </div>
  </template>
  
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listBadLoan } from "@/api/szhl/badLoanManage/badLoan"
import { selectUserBydept } from "@/api/system/user"
import { listAllDept } from "@/api/system/dept"
import useUserStore from '@/store/modules/user'
import FilingDialog from './components/FilingDialog.vue'
import BlacklistDialog from './components/BlacklistDialog.vue'
import RestrictionDialog from './components/RestrictionDialog.vue'
import NoteDialog from './components/NoteDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
import ResponsibilityDialog from './components/ResponsibilityDialog.vue'
import { formatMoney } from '@/utils/ruoyi'
import { checkPermi } from "@/utils/permission";
  
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
  const managerOptions = ref([])
  const userStore = useUserStore()
  
  // 弹窗相关
  const addDialogVisible = ref(false)
  const blacklistDialogVisible = ref(false)
  const restrictionDialogVisible = ref(false)
  const noteDialogVisible = ref(false)
  const detailDialogVisible = ref(false)
  const responsibilityDialogVisible = ref(false)

  //定责状态
  const determinationStatusMap = ref({
    'NOT_DETERMINED': '未定责',
    'INITIAL': '初分',
    'OBJECTION':'异议',
    'REVIEW': '核对',
    "DIRECT_REPORT": '直报',
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
  
  // 列显示控制
  const columns = ref([
    { key: 'badLoanNature', label: '类型', visible: true },
    { key: 'customerName', label: '客户名称', visible: true },
    { key: 'customerNo', label: '客户号', visible: true },
    { key: 'contractNo', label: '合同号', visible: true },
    { key: 'contractStartDate', label: '合同日期', visible: true },
    { key: 'contractEndDate', label: '到期日期', visible: true },
    { key: 'contractAmount', label: '建档金额', visible: true },
    { key: 'currentBalance', label: '当前余额', visible: true },
    { key: 'guaranteeType', label: '担保方式', visible: true },
    { key: 'responsibilityRatio', label: '责任比例', visible: true },
    { key: 'payableAmount', label: '应缴金', visible: true },
    { key: 'actualAmount', label: '实缴金', visible: true },
    { key: 'refundedAmount', label: '已退金', visible: true },
    { key: 'litigationPeriod', label: '诉讼时效', visible: true },
    { key: 'litigationStatus', label: '诉讼状态', visible: true },
    { key: 'originalInstitution', label: '原机构', visible: true },
    { key: 'managementInstitution', label: '机构号', visible: true },
    { key: 'managementPerson', label: '管贷人', visible: true },
    { key: 'createdBy', label: '建档人', visible: true },
    { key: 'createDate', label: '建档日期', visible: true },
    { key: 'lastUpdatedBy', label: '更新人', visible: true },
    { key: 'lastUpdateDate', label: '最后更新日期', visible: true }
  ])
  
  // 查询参数
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    customerName: '',
    contractNo: '',
    deptId: '',
    managementPerson: '',
    badLoanNature: '',
    determinationStatus: 'NOT_DETERMINED'
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
    proxy.resetForm("queryForm");
    // queryFormRef.value?.resetFields()
    handleQuery()
  }
  
  // 处理补档按钮
  function handleEdit() {
    if (!checkSelected()) return
    addDialogVisible.value = true
  }
  
  // 处理建档提交
  function handleFilingSubmit(formData) {
    // 刷新列表数据
    getList()
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

  // 处理追风险金申请按钮
  function handleRiskFundApplication() {
    if (!checkSelected()) return
    ElMessage.info('追风险金申请功能开发中')
  }

  // 处理责任初分按钮
  function handleResponsibility() {
    if (!checkSelected()) return
    if (!selectedRow.value || (selectedRow.value.determinationStatus !== 'INITIAL' && selectedRow.value.determinationStatus !== 'NOT_DETERMINED')) {
      ElMessage.warning('仅“初分/未定责”状态允许进行责任初分操作')
      return
    }
    responsibilityDialogVisible.value = true
  }

  // 处理责任初分提交
  function handleResponsibilitySubmit(formData) {
    responsibilityDialogVisible.value = false
    // 刷新列表数据
    getList()
  }

  // 处理诉讼登记按钮
  function handleLitigationRegister() {
    if (!checkSelected()) return
    ElMessage.info('诉讼登记功能开发中')
  }

  // 处理还款明细按钮
  function handleRepaymentDetails() {
    if (!checkSelected()) return
    ElMessage.info('还款明细功能开发中')
  }

  // 处理影像按钮
  function handleImage() {
    if (!checkSelected()) return
    ElMessage.info('影像功能开发中')
  }

  // 处理导出按钮
  function handleExport() {
    if (!checkMultipleSelected()) return
    ElMessage.info('导出功能开发中')
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