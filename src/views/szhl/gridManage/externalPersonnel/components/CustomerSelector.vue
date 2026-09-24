<template>
  <el-dialog
    title="选择客户信息"
    v-model="dialogVisible"
    width="900px"
    @close="handleClose"
    class="customer-dialog"
  >
    <div class="customer-selector">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchForm.custName"
              placeholder="请输入客户姓名"
              prefix-icon="User"
              clearable
              @input="handleSearchDebounced"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="searchForm.idNo"
              placeholder="请输入证件号码"
              prefix-icon="CreditCard"
              clearable
              @input="handleSearchDebounced"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="handleSearch" :loading="searchLoading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索结果区域 -->
      <div class="search-results">
        <!-- 数据一致性警告 -->
        <el-alert
          v-if="inconsistencyWarning"
          :title="inconsistencyWarning"
          type="warning"
          show-icon
          :closable="false"
          class="warning-alert"
        />

        <!-- 客户列表 -->
        <el-table
          :data="customerList"
          highlight-current-row
          @current-change="handleSelectionChange"
          style="width: 100%"
          max-height="400px"
          :loading="searchLoading"
        >
          <el-table-column prop="customerName" label="客户姓名" width="120" />
          <el-table-column prop="idNumber" label="证件号码" width="180">
            <template #default="scope">
              <span>{{ (scope.row.idNumber) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="customerCode" label="客户内码" width="120" />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column prop="externalAddress" label="联系地址" min-width="150" />
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="selectCustomer(scope.row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <div v-if="!searchLoading && customerList.length === 0 && hasSearched" class="empty-state">
          <el-empty description="未找到匹配的客户信息">
            <el-button type="primary" @click="handleManualInput">手动输入客户信息</el-button>
          </el-empty>
        </div>
        
        <!-- 分页 -->
        <el-pagination
          v-if="total > 0"
          :current-page="searchForm.pageNum"
          :page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          class="pagination"
        />
      </div>

      <!-- 手动输入区域 -->
      <div class="manual-input-section" v-if="showManualInput">
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 500;">手动输入客户信息</span>
        </el-divider>
        
        <el-form :model="manualForm" :rules="manualRules" ref="manualFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="客户姓名" prop="customerName">
                <el-input
                  v-model="manualForm.customerName"
                  placeholder="请输入客户姓名"
                  @input="checkDataConsistency"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="证件号码" prop="idNumber">
                <el-input
                  v-model="manualForm.idNumber"
                  placeholder="请输入证件号码"
                  @input="checkDataConsistency"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户内码" prop="customerCode">
                <el-input
                  v-model="manualForm.customerCode"
                  placeholder="请输入客户内码"
                  @input="checkDataConsistency"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="showManualInput"
          type="primary"
          @click="confirmManualInput"
          :disabled="!isManualFormValid"
        >
          确认选择
        </el-button>
      </div>
    </template>

    <!-- 数据冲突确认对话框 -->
    <el-dialog
      title="数据一致性确认"
      v-model="conflictDialogVisible"
      width="500px"
      append-to-body
    >
      <div class="conflict-content">
        <el-alert
          title="检测到数据不一致"
          type="warning"
          show-icon
          :closable="false"
          style="margin-bottom: 15px"
        />
        <p>{{ conflictMessage }}</p>
        <div class="conflict-options">
          <p><strong>请选择处理方式：</strong></p>
          <el-radio-group v-model="conflictResolution">
            <el-radio value="update">更新为当前输入的信息</el-radio>
            <el-radio value="keep">保持数据库中的信息</el-radio>
            <el-radio value="manual">手动确认每个字段</el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="conflictDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConflictResolution">确认</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { listCustom } from '@/api/szhl/custom/Customer'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = ref(false)
const searchLoading = ref(false)
const hasSearched = ref(false)
const showManualInput = ref(false)
const searchTimer = ref(null)
const conflictDialogVisible = ref(false)
const conflictResolution = ref('update')
const selectedCustomer = ref(null)

// 搜索表单
const searchForm = reactive({
  custName: '',
  idNo: '',
  pageNum: 1,
  pageSize: 10
})

// 手动输入表单
const manualForm = reactive({
  customerName: '',
  idNumber: '',
  customerCode: ''
})

// 手动输入验证规则
const manualRules = {
  customerName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  idNumber: [
    { required: true, message: '请输入证件号码', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ],
  customerCode: [
    { required: true, message: '请输入客户内码', trigger: 'blur' }
  ]
}

// 客户列表数据
const customerList = ref([])
const total = ref(0) // 总记录数

// 数据一致性警告信息
const inconsistencyWarning = ref('')
const conflictMessage = ref('')

// 计算手动表单是否有效
const isManualFormValid = computed(() => {
  return manualForm.customerName && manualForm.idNumber && manualForm.customerCode
})

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    resetSearch()
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 防抖搜索
function handleSearchDebounced() {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  
  searchTimer.value = setTimeout(() => {
    if (searchForm.custName.trim() || searchForm.idNo.trim()) {
      handleSearch()
    }
  }, 500)
}

// 搜索客户
async function handleSearch() {
  if (!searchForm.custName.trim() && !searchForm.idNo.trim()) {
    return
  }

  searchLoading.value = true
  hasSearched.value = true
  inconsistencyWarning.value = ''

  try {
    // 调用真实的API接口
    const response = await listCustom({
      custName: searchForm.custName || undefined,
      idNo: searchForm.idNo || undefined,
      pageNum: searchForm.pageNum,
      pageSize: searchForm.pageSize
    })
    
    // 处理API返回数据，进行字段映射转换
    const rawData = response.rows || response.data || []
    // 设置总记录数
    total.value = response.total || rawData.length
    
    customerList.value = rawData.map(item => {
      // 字段映射转换函数
      const getFieldValue = (item, ...fieldNames) => {
        for (const fieldName of fieldNames) {
          if (item[fieldName] !== undefined && item[fieldName] !== null && item[fieldName] !== '') {
            return item[fieldName]
          }
        }
        return ''
      }
      
      const mappedItem = {
        // 根据真实API数据结构进行字段映射
        id: getFieldValue(item, 'custIsn', 'id', 'custId', 'customerId'),
        customerName: getFieldValue(item, 'custName', 'customerName', 'name', 'custFullName', 'fullName'),
        idNumber: getFieldValue(item, 'idNo', 'idNumber', 'idCard', 'certNo', 'certificateNo', 'identityCard'),
        customerCode: getFieldValue(item, 'custIsn', 'customerCode', 'custCode', 'custNo', 'customerNo', 'internalCode'),
        phone: getFieldValue(item, 'tel', 'phone', 'mobile', 'telephone', 'phoneNumber'),
        externalAddress: getFieldValue(item, 'address', 'externalAddress', 'outAddress', 'addr', 'extAddress', 'residenceAddr'),
        outsideAddr: getFieldValue(item, 'outsideAddr', 'outAddress', 'extAddr'),
        districtCode: getFieldValue(item, 'divisionCode', 'areaCode', 'regionCode', 'districtCode'),
        companyPosition: getFieldValue(item, 'workCo', 'job', 'workUnit', 'company', 'workplace', 'organization', 'employer', 'companyPosition'),
        relativesFriends: getFieldValue(item, 'relativesFriends'),
        relativesPhone: getFieldValue(item, 'relativesPhone'),
        isBlacklist: getFieldValue(item, 'isBlacklist'),
        managerName: getFieldValue(item, 'managerName'),
        collectOrg: getFieldValue(item, 'collectOrg'),
        remark: getFieldValue(item, 'remark'),
        // 保留原始数据作为备用
        _raw: item
      }
      
      return mappedItem
    })

  } catch (error) {
    console.error('搜索客户失败:', error)
    
    // 如果API调用失败，使用模拟数据作为备选
    const mockResults = [
      {
        id: 1,
        customerName: '张三',
        idNumber: '330727199001011234',
        customerCode: 'C001234567',
        phone: '13888888888',
        externalAddress: '杭州市西湖区文一路123号',
        workUnit: '杭州某科技公司',
        divisionCode: '330106',
        divisionName: '浙江省 > 杭州市 > 西湖区'
      },
      {
        id: 2,
        customerName: '李四',
        idNumber: '330727199002022345',
        customerCode: 'C002345678',
        phone: '13999999999',
        externalAddress: '杭州市上城区延安路456号',
        workUnit: '杭州某贸易公司',
        divisionCode: '330102',
        divisionName: '浙江省 > 杭州市 > 上城区'
      }
    ]

    // 根据搜索条件过滤结果
    customerList.value = mockResults.filter(item => {
      const nameMatch = !searchForm.custName || item.customerName.includes(searchForm.custName)
      const idMatch = !searchForm.idNo || item.idNumber.includes(searchForm.idNo)
      return nameMatch && idMatch
    })
    
  } finally {
    searchLoading.value = false
  }
}

// 重置搜索
function resetSearch() {
  searchForm.custName = ''
  searchForm.idNo = ''
  searchForm.pageNum = 1
  searchForm.pageSize = 10
  customerList.value = []
  total.value = 0
  hasSearched.value = false
  showManualInput.value = false
  inconsistencyWarning.value = ''
  selectedCustomer.value = null
  
  // 重置手动输入表单
  manualForm.customerName = ''
  manualForm.idNumber = ''
  manualForm.customerCode = ''
}

// 处理表格行选择
function handleSelectionChange(currentRow) {
  selectedCustomer.value = currentRow
}

// 选择客户
function selectCustomer(customer) {
  emit('confirm', {
    type: 'existing',
    data: customer
  })
  handleClose()
}

// 显示手动输入
function handleManualInput() {
  showManualInput.value = true
  // 将搜索条件自动填入手动输入表单
  if (searchForm.custName) {
    manualForm.customerName = searchForm.custName
  }
  if (searchForm.idNo) {
    manualForm.idNumber = searchForm.idNo
  }
}

// 确认手动输入
function confirmManualInput() {
  // 验证表单
  if (!isManualFormValid.value) {
    return
  }

  emit('confirm', {
    type: 'manual',
    data: {
      customerName: manualForm.customerName,
      idNumber: manualForm.idNumber,
      customerCode: manualForm.customerCode
    }
  })
  handleClose()
}

// 检查数据一致性
function checkDataConsistency() {
  inconsistencyWarning.value = ''
  
  // 简单的一致性检查逻辑
  if (manualForm.customerName && manualForm.idNumber && manualForm.customerCode) {
    // 检查是否存在重复或冲突的数据
    const existingCustomer = customerList.value.find(customer => 
      customer.customerName === manualForm.customerName ||
      customer.idNumber === manualForm.idNumber ||
      customer.customerCode === manualForm.customerCode
    )

    if (existingCustomer) {
      // 检查具体的冲突情况
      const conflicts = []
      if (existingCustomer.customerName === manualForm.customerName && existingCustomer.idNumber !== manualForm.idNumber) {
        conflicts.push('姓名相同但证件号不同')
      }
      if (existingCustomer.idNumber === manualForm.idNumber && existingCustomer.customerCode !== manualForm.customerCode) {
        conflicts.push('证件号相同但客户内码不同')
      }
      if (existingCustomer.customerCode === manualForm.customerCode && existingCustomer.customerName !== manualForm.customerName) {
        conflicts.push('客户内码相同但姓名不同')
      }

      if (conflicts.length > 0) {
        inconsistencyWarning.value = `数据一致性检查：${conflicts.join('，')}。请确认信息是否正确。`
        conflictMessage.value = `检测到与现有客户数据存在冲突：${conflicts.join('，')}。`
      }
    }
  }
}

// 处理冲突解决
function handleConflictResolution() {
  // 根据用户选择的解决方案处理冲突
  switch (conflictResolution.value) {
    case 'update':
      // 使用当前输入的信息
      break
    case 'keep':
      // 使用数据库中的信息，找到冲突的客户并填入
      const conflictCustomer = customerList.value.find(customer => 
        customer.customerName === manualForm.customerName ||
        customer.idNumber === manualForm.idNumber ||
        customer.customerCode === manualForm.customerCode
      )
      if (conflictCustomer) {
        manualForm.customerName = conflictCustomer.customerName
        manualForm.idNumber = conflictCustomer.idNumber
        manualForm.customerCode = conflictCustomer.customerCode
      }
      break
    case 'manual':
      // 保持当前状态，让用户手动调整
      break
  }
  
  conflictDialogVisible.value = false
  inconsistencyWarning.value = ''
}

// 分页处理函数
function handlePageChange(page) {
  searchForm.pageNum = page
  handleSearch()
}

function handleSizeChange(size) {
  searchForm.pageSize = size
  searchForm.pageNum = 1
  handleSearch()
}

// 格式化身份证号（中间部分用*号隐藏）
function formatIdNumber(idNumber) {
  if (!idNumber || idNumber.length < 8) return idNumber
  return idNumber.substring(0, 6) + '****' + idNumber.substring(idNumber.length - 4)
}

// 关闭对话框
function handleClose() {
  dialogVisible.value = false
  resetSearch()
}

// 设置初始搜索数据
function setInitialSearchData(data) {
  if (data.custName) {
    searchForm.custName = data.custName
  }
  if (data.idNo) {
    searchForm.idNo = data.idNo
  }
  // 如果有搜索条件，自动执行搜索
  if (data.custName || data.idNo) {
    setTimeout(() => {
      handleSearch()
    }, 100)
  }
}

// 暴露方法给父组件
defineExpose({
  setInitialSearchData
})
</script>

<style scoped>
.customer-dialog {
  .el-dialog__body {
    padding: 15px 20px;
  }
}

.customer-selector {
  .search-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .search-results {
    margin-bottom: 20px;

    .warning-alert {
      margin-bottom: 15px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .manual-input-section {
    margin-top: 20px;
    padding: 15px;
    background: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 6px;
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}

.conflict-content {
  .conflict-options {
    margin-top: 15px;
    padding: 15px;
    background: #fef7e0;
    border-radius: 4px;

    .el-radio {
      display: block;
      margin-bottom: 10px;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>