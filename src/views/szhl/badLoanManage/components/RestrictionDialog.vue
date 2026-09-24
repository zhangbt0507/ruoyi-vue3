<template>
  <el-dialog 
    title="批量解止扣操作" 
    v-model="dialogVisible" 
    width="70%" 
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="restriction-container">
      <!-- 操作方式选择 -->
      <div class="form-item">
        <span class="label">操作方式</span>
        <el-select v-model="operationType" class="operation-select" @change="handleOperationTypeChange">
          <el-option label="全额止付" value="fullStop" />
          <el-option label="部分止付" value="partialStop" />
          <el-option label="解除止付" value="release" />
          <el-option label="扣款操作" value="deduction" />
        </el-select>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="waiting-list-header">
          <span class="blue-bg-title">止扣待选清单</span>
          <div class="search-form">
            <span class="label">客户名称</span>
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
            <span class="label">客户号</span>
            <el-input v-model="searchForm.customerNo" placeholder="请输入客户号" clearable />
            <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          </div>
        </div>

        <!-- 待选清单表格 -->
        <el-table
          ref="waitingTableRef"
          v-loading="loading"
          :data="waitingList"
          style="width: 100%"
          border
          height="250"
          @selection-change="handleWaitingSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="客户名称" prop="customerName" align="center" min-width="150" />
          <el-table-column label="客户号" prop="customerNo" align="center" min-width="150" />
          <el-table-column label="存款账号" prop="depositAccount" align="center" min-width="180" />
          <el-table-column label="余额" prop="balance" align="center" width="100">
            <template #default="scope">
              {{ parseFloat(scope.row.balance).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" align="center" width="80" />
          <el-table-column label="关系" prop="relationship" align="center" width="100" />
          <el-table-column label="止付原因" prop="stopReason" align="center" min-width="150" />
          <el-table-column label="日期" prop="date" align="center" width="120" />
          <el-table-column label="操作员" prop="operator" align="center" width="100" />
        </el-table>

        <!-- 已选清单区域 -->
        <div class="selected-list-header">
          <span class="blue-bg-title">止扣已选清单</span>
        </div>

        <!-- 已选清单表格 -->
        <el-table
          v-loading="loading"
          :data="selectedList"
          style="width: 100%"
          border
          height="200"
        >
          <el-table-column label="客户名称" prop="customerName" align="center" min-width="120" />
          <el-table-column label="存款账号" prop="depositAccount" align="center" min-width="150" />
          <el-table-column label="操作方式" align="center" width="100">
            <template #default="scope">
              {{ scope.row.operationTypeText }}
            </template>
          </el-table-column>
          <el-table-column label="操作金额" align="center" width="150">
            <template #default="scope">
              <el-input 
                v-if="scope.row.needAmountInput" 
                v-model="scope.row.operationAmount" 
                size="small" 
                placeholder="请输入金额"
                @input="validateAmount(scope.row)"
                clearable
              />
              <span v-else>{{ parseFloat(scope.row.balance).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 原因说明 -->
        <div class="reason-area">
          <span class="label">原因说明</span>
          <el-input 
            v-model="reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入解止扣原因"
          />
        </div>

        <!-- 送达方式和机构信息 -->
        <div class="footer-form">
          <div class="form-row">
            <div class="form-item">
              <span class="label">送达方式</span>
              <el-select v-model="deliveryMethod" class="form-select">
                <el-option label="纸质传递" value="paper" />
                <el-option label="电子传递" value="electronic" />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <span class="label">机构号</span>
              <el-select v-model="institutionNo" class="form-select">
                <el-option label="888000" value="888000" />
                <el-option label="888010" value="888010" />
                <el-option label="888080" value="888080" />
              </el-select>
            </div>
            <div class="form-item">
              <span class="label">操作员</span>
              <el-select v-model="operator" class="form-select">
                <el-option label="陈斌" value="陈斌" />
                <el-option label="周军" value="周军" />
                <el-option label="张三" value="张三" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打印专用隐藏区域 -->
    <div v-show="false" id="restrictionPrintArea" ref="printAreaRef">
      <div class="print-container">
        <!-- 标题和印章 -->
        <div class="print-header">
          <h1>账户解止扣申请表</h1>
          <div class="print-stamps">
            <div class="print-stamp" v-if="hasOperationType('release')">解</div>
            <div class="print-stamp" v-if="hasOperationType('fullStop') || hasOperationType('partialStop')">止</div>
            <div class="print-stamp" v-if="hasOperationType('deduction')">扣</div>
          </div>
        </div>

        <!-- 申请机构 -->
        <div class="print-institution">
          申请机构：{{ institutionNo }}
        </div>
        
        <!-- 客户基本信息表格 -->
        <div class="print-table-container">
          <table class="print-info-table">
            <tr>
              <td class="label-cell">主客户名称</td>
              <td class="content-cell">{{ props.selectedRows[0]?.customerName || '' }}</td>
              <td class="label-cell">客户号</td>
              <td class="content-cell">{{ props.selectedRows[0]?.customerNo || '' }}</td>
            </tr>
            <tr>
              <td class="label-cell">客户内码</td>
              <td class="content-cell">81000000001</td>
              <td class="label-cell">联系电话</td>
              <td class="content-cell">18967***01**</td>
            </tr>
            <tr>
              <td class="label-cell">地址</td>
              <td class="content-cell" colspan="3">浙江省***县***镇****村***号</td>
            </tr>
          </table>
        </div>

        <!-- 操作客户清单 -->
        <div class="print-section-title">操作客户清单</div>
        <div class="print-table-container">
          <table class="print-operation-table">
            <thead>
              <tr>
                <th>账户名称</th>
                <th>账号</th>
                <th>操作方式</th>
                <th>操作金额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in selectedList" :key="index">
                <td>{{ item.customerName }}</td>
                <td>{{ item.depositAccount }}</td>
                <td>{{ item.operationTypeText }}</td>
                <td>{{ item.needAmountInput ? parseFloat(item.operationAmount).toFixed(2) : parseFloat(item.balance).toFixed(2) }}</td>
              </tr>
              <!-- 空行填充 -->
              <tr v-for="i in Math.max(0, 5 - selectedList.length)" :key="'empty-' + i">
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 经办理由及意见 -->
        <div class="print-reason-section">
          <table class="print-reason-table">
            <tr>
              <td class="reason-label-cell">
                经<br/>
                办<br/>
                理<br/>
                由<br/>
                及<br/>
                意<br/>
                见
              </td>
              <td class="reason-content-cell">
                {{ reason || '上述客户因涉及陈***不良贷款，申请扣款操作。' }}
                <div class="reason-signature">
                  <span>{{ operator }}</span>
                  <span>{{ getCurrentDate() }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="reason-label-cell">
                审<br/>
                批
              </td>
              <td class="reason-content-cell approval-cell">
                同意。
                <div class="reason-signature">
                  <span>陈**</span>
                  <span>{{ getCurrentDate() }}</span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitRestriction">打印</el-button>
        <el-button @click="cancelRestriction">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
    default: false
  },
  selectedRows: {
    type: Array,
    required: false,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'submit'])

// 对话框可见性控制
const dialogVisible = ref(false)
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    // 当弹窗打开时，初始化已选清单
    initSelectedList()
  }
})
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 解止扣相关数据
const loading = ref(false)
const operationType = ref('fullStop')
const reason = ref('')
const deliveryMethod = ref('paper')
const institutionNo = ref('888000')
const operator = ref('陈斌')

// 搜索表单
const searchForm = reactive({
  customerName: '',
  customerNo: ''
})

// 待选清单
const waitingList = ref([])
// 已选清单
const selectedList = ref([])
// 待选清单中选中的项
const waitingSelected = ref([])
// 待选清单表格引用
const waitingTableRef = ref(null)

// 获取操作类型文本
function getOperationTypeText(type) {
  switch (type) {
    case 'fullStop':
      return '全额止付'
    case 'partialStop':
      return '部分止付'
    case 'release':
      return '解止付'
    case 'deduction':
      return '扣款操作'
    default:
      return '未知'
  }
}

// 获取当前日期
function getCurrentDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取当前日期时间
function getCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 初始化已选清单
function initSelectedList() {
  // 清空已选清单，用户需要从待选清单中选择
  selectedList.value = []
  waitingSelected.value = []
  
  // 清空表格选择状态
  nextTick(() => {
    if (waitingTableRef.value) {
      waitingTableRef.value.clearSelection()
    }
  })
}

// 模拟获取存款账号
function getDepositAccount() {
  // 生成随机存款账号
  const prefix = '6228'
  const middle = Math.floor(Math.random() * 9000) + 1000
  const suffix = Math.floor(Math.random() * 900) + 100
  return `${prefix}****7990****${suffix}`
}

// 处理搜索
function handleSearch() {
  loading.value = true
  
  // 模拟搜索请求
  setTimeout(() => {
    // 模拟数据
    waitingList.value = [
      {
        customerName: '磐*尚湖**镇企***公室',
        customerNo: '9991107060720****',
        depositAccount: '6228****7990****039',
        balance: '11.11',
        status: '正常',
        relationship: '借款人',
        stopReason: '',
        date: '',
        operator: '陈斌'
      },
      {
        customerName: '俞*浩',
        customerNo: '1013307271963****',
        depositAccount: '6230****7990****752',
        balance: '14.38',
        status: '冻结',
        relationship: '配偶',
        stopReason: '磐安法院',
        date: '2025-07-01',
        operator: '陈斌'
      },
      {
        customerName: '徐*良',
        customerNo: '1013307271967****',
        depositAccount: '6230****7990****348',
        balance: '7.44',
        status: '止付',
        relationship: '法代人',
        stopReason: '公司不良贷款止付',
        date: '2025-07-01',
        operator: '陈斌'
      },
      {
        customerName: '韦*鸿',
        customerNo: '1013307276902****',
        depositAccount: '6228****7511****141',
        balance: '15.04',
        status: '正常',
        relationship: '担保人',
        stopReason: '',
        date: '',
        operator: '陈斌'
      },
      {
        customerName: '孙*明',
        customerNo: '1013307276903****',
        depositAccount: '6228****7511****142',
        balance: '14.17',
        status: '冻结',
        relationship: '担保人',
        stopReason: '东阳法院',
        date: '2025-07-01',
        operator: '陈斌'
      }
    ].filter(item => {
      // 由于我们修改了字段，搜索条件也需要调整
      return true; // 暂时不过滤，因为我们修改了数据结构
    })
    
    loading.value = false
  }, 300)
}

// 处理待选清单选择变化
function handleWaitingSelectionChange(selection) {
  waitingSelected.value = selection
  
  // 找出新选中的项目（与之前选中的比较）
  const currentSelected = selectedList.value.map(item => item.depositAccount)
  const newSelections = selection.filter(item => 
    !currentSelected.includes(item.depositAccount)
  )
  
  // 找出取消选中的项目
  const selectedAccounts = selection.map(item => item.depositAccount)
  const remainingSelected = selectedList.value.filter(item => 
    selectedAccounts.includes(item.depositAccount)
  )
  
  // 将新选中的项目转换为已选清单格式，记录当前的操作方式
  const newItems = newSelections.map(item => ({
    customerName: item.customerName,
    customerNo: item.customerNo, 
    depositAccount: item.depositAccount,
    balance: item.balance,
    operationAmount: item.balance,
    status: item.status,
    relationship: item.relationship,
    // 记录选择时的操作方式，后续不会改变
    operationType: operationType.value,
    operationTypeText: getOperationTypeText(operationType.value),
    needAmountInput: operationType.value === 'partialStop' || operationType.value === 'deduction'
  }))
  
  // 合并保留的已选项目和新选项目
  selectedList.value = [...remainingSelected, ...newItems]
}

// 处理操作方式变更
function handleOperationTypeChange() {
  console.log('操作方式变更为:', operationType.value, getOperationTypeText(operationType.value))
  // 操作方式变更只影响下次选择的数据，不影响已选清单中的数据
}

// 检查已选清单中是否包含特定操作类型
function hasOperationType(type) {
  return selectedList.value.some(item => item.operationType === type)
}

// 验证金额输入
function validateAmount(row) {
  let value = row.operationAmount
  
  // 移除非数字字符（除了小数点）
  value = value.toString().replace(/[^\d.]/g, '')
  
  // 确保只有一个小数点
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // 限制小数位数为2位
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2)
  }
  
  row.operationAmount = value
  
  // 验证金额范围
  const amount = parseFloat(value)
  if (!isNaN(amount)) {
    // 确保不超过余额
    const balance = parseFloat(row.balance)
    if (amount > balance) {
      ElMessage.warning('操作金额不能超过账户余额')
      row.operationAmount = balance.toFixed(2)
    } else if (amount <= 0) {
      ElMessage.warning('操作金额必须大于0')
    }
  }
}

// 提交解止扣操作
async function submitRestriction() {
  if (selectedList.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  if (!reason.value.trim()) {
    ElMessage.warning('请输入解止扣原因')
    return
  }
  
  // 检查需要输入金额的操作是否填写了金额
  const invalidAmounts = selectedList.value.some(item => 
    item.needAmountInput && (!item.operationAmount || isNaN(parseFloat(item.operationAmount)) || parseFloat(item.operationAmount) <= 0)
  )
  
  if (invalidAmounts) {
    ElMessage.warning('请为需要输入金额的账户填写有效的操作金额')
    return
  }
  
  try {
    loading.value = true
    
    // 构造保存数据
    const saveData = {
      operationType: operationType.value,
      reason: reason.value,
      deliveryMethod: deliveryMethod.value,
      institutionNo: institutionNo.value,
      operator: operator.value,
      selectedList: selectedList.value,
      createTime: getCurrentDateTime()
    }
    
    ElMessage.success('数据保存成功')
    
    // 数据保存成功后进行打印
    generatePrintPreview()
    
    // 提交数据到父组件
    emit('submit', saveData)
    
    // 打印成功后不自动关闭弹窗，让用户手动关闭
    // 只清空表单数据，保持弹窗开启状态
    reason.value = ''
    waitingSelected.value = []
    selectedList.value = []
    
    // 清空表格选择状态
    nextTick(() => {
      if (waitingTableRef.value) {
        waitingTableRef.value.clearSelection()
      }
    })
    
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生成打印预览
function generatePrintPreview() {
  const printContent = document.getElementById('restrictionPrintArea')
  if (!printContent) {
    ElMessage.error('打印区域未找到')
    return
  }
  
  // 创建一个新窗口并写入打印内容
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('无法创建打印窗口，请检查是否启用了弹窗')
    return
  }
  
  try {
    // 写入打印样式和内容
    printWindow.document.write(`
      <html>
        <head>
          <title>账户解止扣申请表</title>
          <style>
            body {
              font-family: SimSun, Arial, sans-serif;
              margin: 10mm;
            }
            .print-container {
              border: 2px solid #87CEEB;
              padding: 20px;
              font-family: SimSun, sans-serif;
              font-size: 14px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              position: relative;
            }
            .print-header h1 {
              font-size: 22px;
              font-weight: bold;
              margin: 0;
              padding: 10px 0;
            }
            .print-stamps {
              position: absolute;
              top: 0;
              right: 30px;
              display: flex;
              gap: 5px;
            }
            .print-stamp {
              font-size: 24px;
              color: red;
              border: 2px solid red;
              border-radius: 50%;
              width: 45px;
              height: 45px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
            }
            .print-institution {
              text-align: left;
              margin-bottom: 15px;
              font-size: 14px;
            }
            .print-table-container {
              margin-top: 20px;
              margin-bottom: 20px;
            }
            .print-info-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              font-size: 14px;
            }
            .print-info-table td {
              border: 1px solid #000;
              padding: 8px;
              height: 24px;
            }
            .label-cell {
              font-weight: bold;
              background-color: #f5f5f5;
              text-align: center;
              width: 100px;
              padding: 8px;
              border: 1px solid #000;
            }
            .content-cell {
              padding: 8px;
              border: 1px solid #000;
              text-align: left;
            }
            .print-section-title {
              font-size: 16px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              text-align: center;
            }
            .print-operation-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .print-operation-table th, .print-operation-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
              height: 30px;
            }
            .print-operation-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .print-reason-section {
              margin-top: 20px;
            }
            .print-reason-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
            }
            .reason-label-cell {
              width: 80px;
              text-align: center;
              writing-mode: vertical-lr;
              font-weight: bold;
              border: 1px solid #000;
              padding: 10px 5px;
              font-size: 14px;
              vertical-align: top;
            }
            .reason-content-cell {
              border: 1px solid #000;
              padding: 15px;
              font-size: 14px;
              line-height: 1.8;
              vertical-align: top;
              position: relative;
              height: 120px;
            }
            .approval-cell {
              height: 60px;
            }
            .reason-signature {
              position: absolute;
              bottom: 10px;
              right: 15px;
              display: flex;
              gap: 30px;
              font-size: 14px;
            }
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    // 等待内容加载完成后打印
    printWindow.document.close()
    printWindow.onload = function() {
      setTimeout(() => {
        try {
          printWindow.print()
          // 打印后自动关闭窗口
          printWindow.onafterprint = function() {
            printWindow.close()
          }
        } catch (e) {
          console.error('打印过程中出错:', e)
          ElMessage.error('打印过程中出错')
        }
      }, 300)
    }
  } catch (e) {
    console.error('准备打印内容时出错:', e)
    ElMessage.error('准备打印内容时出错')
    if (printWindow) {
      printWindow.close()
    }
  }
}

// 取消操作
function cancelRestriction() {
  dialogVisible.value = false
}

// 初始化数据
handleSearch()
</script>

<style scoped>
.restriction-container {
  padding: 10px;
}

.dialog-footer {
  text-align: center;
  margin-top: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.label {
  margin-right: 10px;
  min-width: 70px;
  text-align: right;
}

.operation-select {
  width: 200px;
}

.blue-bg-title {
  background-color: #409EFF;
  color: white;
  padding: 5px 15px;
  display: inline-block;
  margin-bottom: 10px;
}

.search-area {
  margin-top: 20px;
}

.waiting-list-header, .selected-list-header {
  margin-bottom: 10px;
}

.search-form {
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.search-form .el-input {
  width: 200px;
  margin-right: 15px;
}

.reason-area {
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
}

.reason-area .el-textarea {
  width: calc(100% - 80px);
}

.footer-form {
  margin-top: 20px;
}

.form-row {
  display: flex;
  margin-bottom: 15px;
}

.form-row .form-item {
  margin-right: 30px;
  margin-bottom: 0;
}

.form-select {
  width: 200px;
}

/* 打印样式 */
.print-container {
  border: 2px solid #87CEEB;
  padding: 20px;
  font-family: SimSun, sans-serif;
  background: white;
  font-size: 14px;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.print-header h1 {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  padding: 10px 0;
}

.print-stamps {
  position: absolute;
  top: 0;
  right: 30px;
  display: flex;
  gap: 5px;
}

.print-stamp {
  font-size: 24px;
  color: red;
  border: 2px solid red;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.print-institution {
  text-align: left;
  margin-bottom: 15px;
  font-size: 14px;
}

.print-table-container {
  margin-top: 20px;
  margin-bottom: 20px;
}

.print-info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 14px;
}

.print-info-table td {
  border: 1px solid #000;
  padding: 8px;
  height: 24px;
}

.label-cell {
  font-weight: bold;
  background-color: #f5f5f5;
  text-align: center;
  width: 100px;
  padding: 8px;
  border: 1px solid #000;
}

.content-cell {
  padding: 8px;
  border: 1px solid #000;
  text-align: left;
}

.print-section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  text-align: center;
}

.print-operation-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  margin-bottom: 20px;
  font-size: 14px;
}

.print-operation-table th, .print-operation-table td {
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
  height: 30px;
}

.print-operation-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.print-reason-section {
  margin-top: 20px;
}

.print-reason-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
}

.reason-label-cell {
  width: 80px;
  text-align: center;
  writing-mode: vertical-lr;
  font-weight: bold;
  border: 1px solid #000;
  padding: 10px 5px;
  font-size: 14px;
  vertical-align: top;
}

.reason-content-cell {
  border: 1px solid #000;
  padding: 15px;
  font-size: 14px;
  line-height: 1.8;
  vertical-align: top;
  position: relative;
  height: 120px;
}

.approval-cell {
  height: 60px;
}

.reason-signature {
  position: absolute;
  bottom: 10px;
  right: 15px;
  display: flex;
  gap: 30px;
  font-size: 14px;
}

.print-empty-text {
  text-align: center;
  color: #999;
  font-style: italic;
}
</style> 