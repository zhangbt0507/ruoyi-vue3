<template>
  <el-dialog 
    title="批量加解黑操作" 
    v-model="dialogVisible" 
    width="70%" 
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="blacklist-container">
      <!-- 搜索区域 -->
      <div>
        <div class="waiting-list-header">
          <div class="search-form">
            <span class="label">客户名称</span>
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
            <el-button type="primary" @click="handleSearch">关系</el-button>
            <el-button type="primary" @click="handleAdd">新增</el-button>
          </div>
        </div>

        <!-- 待选清单表格 -->
        <el-table
          v-loading="loading"
          :data="waitingList"
          style="width: 100%"
          border
          height="300"
          @selection-change="handleWaitingSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="客户名称" prop="customerName" align="center" min-width="150" />
          <el-table-column label="客户号" prop="customerNo" align="center" min-width="160" />
          <el-table-column label="内码" prop="customerCode" align="center" width="140" />
          <el-table-column label="黑名单" align="center" width="100">
            <template #default="scope">
              {{ scope.row.isBlacklisted ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column label="关系" prop="relationship" align="center" width="100" />
        </el-table>


        <!-- 底部表单区域 -->
        <div class="bottom-form">
          <!-- 第一行：操作方式、操作原因 -->
          <div class="form-row">
            <div class="form-item">
              <span class="label">操作方式</span>
              <el-select v-model="operationType" class="form-select">
                <el-option label="加黑" value="add" />
                <el-option label="解黑" value="remove" />
              </el-select>
            </div>
            <div class="form-item reason-item">
              <span class="label">操作原因</span>
              <el-input 
                v-model="reason" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入加解黑原因"
                class="reason-textarea"
              />
            </div>
          </div>
          
          <!-- 第二行：送达方式 -->
          <div class="form-row">
            <div class="form-item">
              <span class="label">送达方式</span>
              <el-select v-model="deliveryMethod" class="form-select">
                <el-option label="纸质传递" value="paper" />
                <el-option label="OA传递" value="oa" disabled/>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitBlacklist">打印/预览</el-button>
        <el-button @click="cancelBlacklist">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 打印专用隐藏区域 -->
  <div id="printArea" class="print-only">
    <div class="print-container" style="border: 2px solid #87CEEB;">
      <div class="print-header">
        <h1>加解黑名单申请表</h1>
        <div class="print-stamp" style="display: flex; align-items: center; justify-content: center;">{{ operationType === 'add' ? '加' : '解' }}</div>
      </div>
      
      <div class="print-info-row">
        <div class="print-info-label">申请机构：</div>
        <div class="print-info-value">{{ institutionNo }}</div>
      </div>
      
      <div class="print-table-container">
        <table class="print-info-table">
          <tr>
            <td width="20%" class="label-cell">主客户名称</td>
            <td width="30%">{{ selectedList[0]?.customerName || '' }}</td>
            <td width="20%" class="label-cell">客户号</td>
            <td width="30%" style="text-align: left;">{{ selectedList[0]?.customerNo ? maskCustomerNo(selectedList[0].customerNo) : '' }}</td>
          </tr>
          <tr>
            <td class="label-cell">客户内码</td>
            <td>8100000001</td>
            <td class="label-cell">联系电话</td>
            <td>1896****1**</td>
          </tr>
          <tr>
            <td class="label-cell">地址</td>
            <td colspan="3">浙江省***县***镇 ****村***号</td>
          </tr>
        </table>
      </div>
      
      <div class="print-customer-list">
        <h3 class="print-section-title">操作客户清单</h3>
        <table class="print-table">
          <thead>
            <tr>
              <th width="25%">客户名称</th>
              <th width="25%">客户号</th>
              <th width="25%">客户内码</th>
              <th width="25%">与主客户关系</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, index) in selectedList" :key="index">
              <td>{{ customer.customerName }}</td>
              <td>{{ maskCustomerNo(customer.customerNo) }}</td>
              <td>{{ 8100000000 + index + 1 }}</td>
              <td>{{ customer.relationship || '借款人' }}</td>
            </tr>
            <tr v-if="!selectedList.length">
              <td colspan="4" class="print-empty-text">暂无客户信息</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="print-reason-box">
        <div class="print-reason-label">经办理由及意见</div>
        <div class="print-reason-content">
          <p>上述客户因涉及{{ selectedList[0]?.customerName || '' }}不良贷款，申请{{ operationType === 'add' ? '加' : '解' }}黑名单管理。</p>
          <p>{{ reason || '分割' }}</p>
          <div class="print-signature">
            <span>{{ operator }}</span>
            <span>{{ getCurrentDate() }}</span>
          </div>
        </div>
      </div>
      
      <!-- 添加审批人意见框 -->
      <div class="print-reason-box">
        <div class="print-reason-label">审批人意见</div>
        <div class="print-reason-content">
          <!-- 空白区域供人工签名 -->
          <div class="print-signature" style="margin-top: 100px;">
            <span></span>
            <span>年    月    日</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue'
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

// 加黑相关数据
const loading = ref(false)
const operationType = ref('')
const reason = ref('')
const deliveryMethod = ref('')
const institutionNo = ref('')
const operator = ref('')

// 当前日期
const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

// 打印区域引用
const printAreaRef = ref(null)

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

// 初始化已选清单
function initSelectedList() {
  // 清空已选清单，不使用传入的选中行数据
  selectedList.value = [];
  
  // 调用搜索函数加载待选清单数据
  handleSearch();
}

// 根据角色获取关系
function getRelationship(row) {
  // 这里可以根据业务逻辑来判断关系
  if (row.customerName?.includes('公司')) {
    return '借款人'
  } else if (row.guaranteeType === '保证') {
    return '担保人'
  } else if (row.guaranteeType === '抵押') {
    return '抵押人'
  } else {
    return '借款人'
  }
}

// 处理新增
function handleAdd() {
  ElMessage.info('新增功能开发中')
}

// 处理搜索
function handleSearch() {
  loading.value = true;
  
  // 模拟后端API请求
  setTimeout(() => {
    // 根据操作方式获取不同的数据
    if (operationType.value === 'add') {
      // 加黑操作 - 显示未加黑的客户
      waitingList.value = [
        {
          customerName: '磐*尚湖**镇企***公室',
          customerNo: '9991107060720****',
          customerCode: '8100000001233',
          isBlacklisted: false,
          relationship: '借款人',
          blackReason: ''
        },
        {
          customerName: '俞*浩',
          customerNo: '1013307271963****',
          customerCode: '8100000001233',
          isBlacklisted: false,
          relationship: '配偶',
          blackReason: ''
        },
        {
          customerName: '韦*亮',
          customerNo: '1991107060612****',
          customerCode: '8100000001233',
          isBlacklisted: false,
          relationship: '担保人',
          blackReason: ''
        },
        {
          customerName: '陈*杜',
          customerNo: '1013307274404****',
          customerCode: '8100000001233',
          isBlacklisted: false,
          relationship: '担保人',
          blackReason: ''
        },
        {
          customerName: '周*良',
          customerNo: '1991107060610****',
          customerCode: '8100000001233',
          isBlacklisted: false,
          relationship: '担保人',
          blackReason: ''
        }
      ];
    } else {
      // 解黑操作 - 显示已加黑的客户
      waitingList.value = [
        {
          customerName: '磐*尚湖**镇企***公室',
          customerNo: '9991107060720****',
          customerCode: '8100000001233',
          isBlacklisted: true,
          relationship: '借款人',
          blackReason: '不良贷款',
          date: '2025-07-01',
          operator: '陈斌'
        },
        {
          customerName: '俞*浩',
          customerNo: '1013307271963****',
          customerCode: '8100000001233',
          isBlacklisted: true,
          relationship: '配偶',
          blackReason: '不良贷款',
          date: '2025-07-01',
          operator: '陈斌'
        },
        {
          customerName: '韦*亮',
          customerNo: '1991107060612****',
          customerCode: '8100000001233',
          isBlacklisted: true,
          relationship: '担保人',
          blackReason: '不良贷款',
          date: '2025-07-01',
          operator: '陈斌'
        }
      ];
    }
    
    // 应用搜索过滤
    waitingList.value = waitingList.value.filter(item => {
      return (searchForm.customerName ? item.customerName.includes(searchForm.customerName) : true) &&
             (searchForm.customerNo ? item.customerNo.includes(searchForm.customerNo) : true);
    });
    
    loading.value = false;
  }, 300);
}

// 处理待选清单选择变化
function handleWaitingSelectionChange(selection) {
  waitingSelected.value = selection
  // 直接将选中的项作为已选清单
  selectedList.value = selection
}

// 对客户号进行脱敏处理
function maskCustomerNo(customerNo) {
  if (!customerNo || customerNo.length < 10) return customerNo
  
  const prefix = customerNo.substring(0, 10)
  const middle = '*'.repeat(6)
  const suffix = customerNo.substring(customerNo.length - 4)
  
  return `${prefix}${middle}${suffix}`
}

// 生成打印预览
function generatePrintPreview() {
  const printContent = document.getElementById('printArea');
  if (!printContent) {
    ElMessage.error('打印区域未找到');
    return;
  }
  
  // 创建一个新窗口并写入打印内容
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    ElMessage.error('无法创建打印窗口，请检查是否启用了弹窗');
    return;
  }
  
  try {
    // 写入打印样式和内容
    printWindow.document.write(`
      <html>
        <head>
          <title>${operationType.value === 'add' ? '加' : '解'}黑名单申请表</title>
          <style>
            body {
              font-family: SimSun, Arial, sans-serif;
              margin: 10mm;
            }
            .print-container {
              border: 2px solid #87CEEB;
              padding: 20px;
              font-family: SimSun, sans-serif;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              position: relative;
            }
            .print-header h1 {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              padding: 10px 0;
            }
            .print-stamp {
              position: absolute;
              top: 0;
              right: 30px;
              font-size: 36px;
              color: red;
              border: 2px solid red;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .print-info-row {
              display: flex;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .print-info-label {
              font-weight: bold;
              width: 100px;
            }
            .print-info-value {
              flex: 1;
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
            }
            .print-customer-list {
              margin-top: 20px;
            }
            .print-section-title {
              font-size: 16px;
              font-weight: bold;
              margin: 15px 0 10px 0;
              text-align: center;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .print-table th, .print-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
              height: 24px;
            }
            .print-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .print-reason-box {
              display: flex;
              margin-top: 20px;
            }
            .print-reason-label {
              width: 100px;
              text-align: center;
              writing-mode: vertical-lr;
              font-weight: bold;
              border: 1px solid black;
              padding: 10px 0;
              font-size: 14px;
            }
            .print-reason-content {
              flex: 1;
              border: 1px solid black;
              padding: 10px;
              min-height: 150px;
              font-size: 14px;
            }
            .print-signature {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .print-empty-text {
              text-align: center;
              color: #999;
              font-style: italic;
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
    `);
    
    // 等待内容加载完成后打印
    printWindow.document.close();
    printWindow.onload = function() {
      setTimeout(() => {
        try {
          printWindow.print();
          // 打印后自动关闭窗口
          printWindow.onafterprint = function() {
            printWindow.close();
          };
        } catch (e) {
          console.error('打印过程中出错:', e);
          ElMessage.error('打印过程中出错');
        }
      }, 300);
    };
  } catch (e) {
    console.error('准备打印内容时出错:', e);
    ElMessage.error('准备打印内容时出错');
    if (printWindow) {
      printWindow.close();
    }
  }
}

// 获取当前日期格式化字符串
function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// 提交黑名单操作
function submitBlacklist() {
  if (selectedList.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  if (!reason.value.trim()) {
    ElMessage.warning('请输入加解黑原因')
    return
  }
  
  const formData = {
    operationType: operationType.value,
    reason: reason.value,
    deliveryMethod: deliveryMethod.value,
    institutionNo: institutionNo.value,
    operator: operator.value,
    selectedList: selectedList.value
  }
  
  // 提交数据
  emit('submit', formData)
  
  // 确保DOM更新后再打印
  nextTick(() => {
    generatePrintPreview()
  })
}

// 取消操作
function cancelBlacklist() {
  dialogVisible.value = false
}

// 监听操作类型变化
watch(operationType, (val) => {
  // 清空待选清单选中项
  waitingSelected.value = []
  
  // 清空已选清单
  selectedList.value = []
  
  // 重置搜索条件
  searchForm.customerName = ''
  searchForm.customerNo = ''
  
  // 重新加载待选清单数据
  handleSearch()
})


// 初始化数据
// handleSearch()

// 确保组件挂载完成后再操作DOM
onMounted(() => {
  console.log('BlacklistDialog组件已挂载');
})
</script>

<style scoped>
.blacklist-container {
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

.waiting-list-header, .selected-list-header {
  margin-bottom: 10px;
}

.search-form {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.search-form .el-input {
  width: 200px;
  margin-right: 15px;
}

.bottom-form {
  margin-top: 20px;
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.form-row .form-item {
  margin-right: 30px;
  margin-bottom: 0;
  display: flex;
  align-items: flex-start;
}

.form-item.reason-item {
  flex: 1;
}

.reason-textarea {
  width: 100%;
}

.form-select {
  width: 200px;
}

/* 打印样式 */
.print-area {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: SimSun, sans-serif;
}

.print-only {
  display: none;
}

.print-container {
  padding: 20px;
  font-family: SimSun, sans-serif;
}

.print-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.print-header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 10px 0;
}

.print-stamp {
  position: absolute;
  top: 0;
  right: 30px;
  font-size: 36px;
  color: red;
  border: 2px solid red;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.print-info-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.print-info-label {
  font-weight: bold;
  width: 100px;
}

.print-info-value {
  flex: 1;
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
}

.print-customer-list {
  margin-top: 20px;
}

.print-section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0 10px 0;
  text-align: center;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  margin-bottom: 20px;
  font-size: 14px;
}

.print-table th,
.print-table td {
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
  height: 24px;
}

.print-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.print-reason-box {
  display: flex;
  margin-top: 20px;
}

.print-reason-label {
  width: 100px;
  text-align: center;
  writing-mode: vertical-lr;
  font-weight: bold;
  border: 1px solid black;
  padding: 10px 0;
  font-size: 14px;
}

.print-reason-content {
  flex: 1;
  border: 1px solid black;
  padding: 10px;
  min-height: 150px;
  font-size: 14px;
}

.print-signature {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
}

.print-empty-text {
  text-align: center;
  color: #999;
  font-style: italic;
}
</style> 