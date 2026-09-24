<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="customer-form">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="客户名称" prop="customerName">
          <div class="input-with-button">
            <el-input 
              v-model="form.customerName" 
              placeholder="请输入客户名称" 
              :disabled="customerSource === 'selected'"
              @input="handleManualInput"
            />
       
          </div>
          <div v-if="customerSource === 'selected'" class="field-tip">
            <div size="small" type="info">通过选择获得，不可编辑 · <el-link type="primary" @click="enableManualEdit">手动输入</el-link></div>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="证件号码" prop="certNo">
          <el-input 
            v-model="form.certNo" 
            placeholder="请输入证件号码" 
            :disabled="customerSource === 'selected'"
            @input="handleManualInput"
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="客户内码" prop="customerCode">
          <div class="input-with-button">
            <el-input 
              v-model="form.customerCode" 
              placeholder="请输入客户内码" 
              :disabled="customerSource === 'selected'"
              @input="handleManualInput"
            />
            <el-button type="primary" size="small" @click="selectCustomer">选择客户</el-button>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="在磐地址" prop="residenceAddr" :rules="[{ required: true, message: '请选择在外地址', trigger: 'submit' }]">
          <el-input 
            v-model="form.residenceAddr" 
            placeholder="请选择在磐地址" 
            readonly 
            @click="selectResidenceAddress"
            style="cursor: pointer;"
          >
            <template #suffix>
              <el-icon @click="selectResidenceAddress" style="cursor: pointer; color: #409eff;">
                <MoreFilled />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="在外地址" prop="outsideAddr" :rules="[{ required: true, message: '请选择在外地址', trigger: 'submit' }]">
          <el-input 
            v-model="form.outsideAddr" 
            placeholder="请选择在外地址" 
            readonly 
            @click="selectDivisionCode"
            style="cursor: pointer;"
          >
            <template #suffix>
              <el-icon @click="selectDivisionCode" style="cursor: pointer; color: #409eff;">
                <MoreFilled />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
    
    <!-- 区划代码隐藏字段，仅用于数据传输 -->
    <el-form-item v-show="false" prop="districtCode">
      <el-input v-model="form.districtCode" />
    </el-form-item>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="单位/职业" prop="companyPosition">
          <el-input v-model="form.companyPosition" placeholder="请输入单位或职业" />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="在磐亲友" prop="relativesFriends">
          <el-input v-model="form.relativesFriends" placeholder="请输入在磐亲友" />
        </el-form-item>
      </el-col>
    </el-row>
    
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="亲友联系电话" prop="relativesPhone">
          <el-input v-model="form.relativesPhone" placeholder="请输入亲友联系电话" />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="是否列入白名单" prop="isBlacklist">
          <el-radio-group v-model="form.isBlacklist" class="blacklist-radio-group">
            <el-radio :value="'Y'" label="Y">是</el-radio>
            <el-radio :value="'N'" label="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="采集机构" prop="collectOrg">
          <el-select v-model="form.collectOrg" placeholder="请选择采集机构" clearable filterable>
            <el-option
              v-for="option in deptOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="责任客户经理" prop="managerName">
          <el-select v-model="form.managerName" placeholder="请选择客户经理" filterable>
            <el-option
              v-for="option in managerOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="其他重要信息" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3"
            placeholder="如：职务、经营状况等"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 在磐地址区划代码选择对话框 -->
    <DivisionSelector 
      ref="residenceDivisionSelector"
      v-model:visible="residenceDivisionVisible" 
      @confirm="handleResidenceDivisionConfirm"
    />

    <!-- 在外地址区划代码选择对话框 -->
    <DivisionSelector 
      ref="divisionSelector"
      v-model:visible="divisionVisible" 
      @confirm="handleDivisionConfirm"
    />

    <!-- 客户选择对话框 -->
    <CustomerSelector 
      ref="customerSelector"
      v-model:visible="customerVisible" 
      @confirm="handleCustomerConfirm"
    />
  </el-form>
</template>

<script setup name="ExternalPersonnelForm">
import { ref, reactive, toRefs, getCurrentInstance, defineExpose, onMounted, watch } from 'vue'
import DivisionSelector from './DivisionSelector.vue'
import CustomerSelector from './CustomerSelector.vue'
import { selectUserBydept } from '@/api/system/user'
import { listAllDept } from '@/api/system/dept'
import useUserStore from '@/store/modules/user'
import { MoreFilled } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

const divisionVisible = ref(false)
const residenceDivisionVisible = ref(false)
const customerVisible = ref(false)
// 追踪客户信息来源：'selected' 表示通过选择获得，'manual' 表示手动输入
const customerSource = ref('manual')
const managerOptions = ref([]) // 责任客户经理选项
const deptOptions = ref([]) // 采集机构选项

// 获取所有用户列表用于责任客户经理选择
const getManagerList = async (deptId) => {
  try {
    const params = { pageSize: 300 };
    if (deptId) {
      params.deptId = deptId;
    }
    const response = await selectUserBydept(params);
    managerOptions.value = response.data.map(user => ({
      label: `${user.nickName}（${user.userName}）`,  // 显示姓名和工号
      value: user.userName
    }));
  } catch (error) {
    console.error('获取用户列表失败:', error);
    proxy.$modal.msgError('获取责任客户经理列表失败');
  }
};

// 获取所有部门列表用于采集机构选择
const getDeptList = async () => {
  try {
    const response = await listAllDept();
    deptOptions.value = response.data.map(dept => ({
      label: dept.deptName,
      value: dept.deptId
    }));
  } catch (error) {
    console.error('获取部门列表失败:', error);
    proxy.$modal.msgError('获取采集机构列表失败');
  }
};

const data = reactive({
  form: {
    id: null,
    customerName: '',
    certNo: '',
    customerCode: '',
    phone: '',
    residenceAddr: '',
    residenceDistrictCode: '',
    residenceDivisionName: '',
    residenceDetailAddress: '',
    outsideAddr: '',
    districtCode: '',
    divisionName: '',
    detailAddress: '',
    companyPosition: '',
    relativesFriends: '',
    relativesPhone: '',
    isBlacklist: 'N',
    managerName: userStore.name || '',
    collectOrg: userStore.deptId || '',
    remark: ''
  },
  rules: {
    customerName: [
      { required: true, message: "客户名称不能为空", trigger: "submit" }
    ],
    certNo: [
      { required: true, message: "证件号码不能为空", trigger: "submit" },
      { 
        pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, 
        message: "请输入正确的身份证号码", 
        trigger: "blur" 
      }
    ],
    customerCode: [
      { required: true, message: "客户内码不能为空", trigger: "submit" }
    ],
    phone: [
      { required: true, message: "联系电话不能为空", trigger: "submit" }
    ],
    collectOrg: [
      { required: true, message: "请选择采集机构", trigger: "blur" }
    ],
    managerName: [
      { required: true, message: "请选择责任客户经理", trigger: "blur" }
    ]
  }
})

const { form, rules } = toRefs(data)

// 监听采集机构变化，动态更新责任客户经理列表
watch(() => form.value.collectOrg, (newVal, oldVal) => {
  getManagerList(newVal);
  // 当采集机构改变或清空时，清空已选择的责任客户经理
  if (newVal !== oldVal) {
    form.value.managerName = '';
  }
});

onMounted(async () => {
  // 先获取部门和经理列表
  await getDeptList();
  await getManagerList();
  
  // 确保白名单字段有正确的默认值
  if (!form.value.isBlacklist) {
    form.value.isBlacklist = 'N';
  }
  
  // 使用 nextTick 确保数据加载完成后再设置默认值
  proxy.$nextTick(() => {
    console.log('用户信息:', {
      deptId: userStore.deptId,
      name: userStore.name,
      userId: userStore.userId
    });
    
    // 设置默认采集机构为当前登录用户的机构
    if (userStore.deptId) {
      form.value.collectOrg = userStore.deptId;
      console.log('设置默认采集机构:', userStore.deptId);
    }
    
    // 设置默认责任客户经理为当前登录用户
    if (userStore.name) {
      form.value.managerName = userStore.name;  // userStore.name 是用户名（工号）
      console.log('设置默认责任客户经理:', userStore.name);
      console.log('当前经理选项:', managerOptions.value);
      console.log('当前表单managerName值:', form.value.managerName);
    }
  })
})

/** 选择客户 */
function selectCustomer() {
  customerVisible.value = true
  // 等待下一个渲染周期，确保子组件已经挂载
  proxy.$nextTick(() => {
    if (proxy.$refs.customerSelector && proxy.$refs.customerSelector.setInitialSearchData) {
      // 将当前表单中的客户名称和证件号码传递给客户选择器
      proxy.$refs.customerSelector.setInitialSearchData({
        custName: form.value.customerName || '',
        idNo: form.value.certNo || ''
      })
    }
  })
}

/** 客户选择确认 */
function handleCustomerConfirm(result) {
  if (result.type === 'existing') {
    // 选择现有客户
    const customer = result.data
    
    form.value.customerName = customer.customerName
    form.value.certNo = customer.idNumber || customer.certNo
    form.value.customerCode = customer.customerCode
    form.value.phone = customer.phone
    // form.value.companyPosition = customer.workUnit || customer.companyPosition
    
    // 将客户的联系地址带到"在磐地址"字段中
    if (customer.externalAddress) {
      form.value.residenceAddr = customer.externalAddress
    }
    
    // 设置为通过选择获得，限制编辑
    customerSource.value = 'selected'
    
  } else if (result.type === 'manual') {
    // 手动输入的客户信息
    const customer = result.data
    
    form.value.customerName = customer.customerName
    form.value.certNo = customer.idNumber || customer.certNo
    form.value.customerCode = customer.customerCode
    
    // 设置为手动输入，允许编辑
    customerSource.value = 'manual'
  }
  
  // 关闭对话框
  customerVisible.value = false
  
  // 显示成功消息
  proxy.$modal.msgSuccess('客户信息填入成功')
}

/** 手动输入时切换状态 */
function handleManualInput() {
  // 当用户手动修改时，将状态改为手动输入
  if (customerSource.value === 'selected') {
    customerSource.value = 'manual'
  }
}

/** 切换到手动编辑模式 */
function enableManualEdit() {
  proxy.$modal.confirm('切换为手动编辑模式后，将清空客户信息及相关地址，您可以重新输入。是否继续？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 切换为手动模式
    customerSource.value = 'manual'
    
    // 清空客户核心信息字段
    form.value.customerName = ''
    form.value.certNo = ''
    form.value.customerCode = ''
    
    // 清空联系电话和在磐地址
    form.value.phone = ''
    form.value.residenceAddr = ''

    form.value.companyPosition = ''
    
    // 清除表单验证状态，避免出现"有值但提示不能为空"的问题
    proxy.$nextTick(() => {
      proxy.$refs["formRef"]?.clearValidate(['customerName', 'certNo', 'customerCode', 'phone', 'residenceAddr', 'companyPosition'])
    })
    
    proxy.$modal.msgSuccess('已切换为手动编辑模式，请重新输入客户信息')
  }).catch(() => {
    // 用户取消操作
  })
}

/** 选择在磐地址区划代码 */
function selectResidenceAddress() {
  residenceDivisionVisible.value = true
  // 如果已经有选择的区划代码，则传递给子组件用于回显
  if (form.value.residenceDistrictCode) {
    // 等待下一个组件渲染循环后再设置回显数据
    proxy.$nextTick(() => {
      // 通过 ref 调用子组件的回显方法
      if (proxy.$refs.residenceDivisionSelector) {
        proxy.$refs.residenceDivisionSelector.setSelectedDivision({
          code: form.value.residenceDistrictCode,
          fullPath: form.value.residenceDivisionName || form.value.residenceAddr,
          detailAddress: form.value.residenceDetailAddress
        })
      }
    })
  }
}

/** 选择区划代码 */
function selectDivisionCode() {
  divisionVisible.value = true
  // 如果已经有选择的区划代码，则传递给子组件用于回显
  if (form.value.districtCode) {
    // 等待下一个组件渲染循环后再设置回显数据
    proxy.$nextTick(() => {
      // 通过 ref 调用子组件的回显方法
      if (proxy.$refs.divisionSelector) {
        proxy.$refs.divisionSelector.setSelectedDivision({
          code: form.value.districtCode,
          fullPath: form.value.divisionName || form.value.outsideAddr,
          detailAddress: form.value.detailAddress
        })
      }
    })
  }
}

/** 在磐地址区划代码确认 */
function handleResidenceDivisionConfirm(division) {
  form.value.residenceDistrictCode = division.code
  // 显示完整地址，去掉 > 分隔符，包含详细地址
  let fullAddress = division.fullPath.replace(/ > /g, '')
  if (division.detailAddress) {
    fullAddress += division.detailAddress
  }
  form.value.residenceAddr = fullAddress
  form.value.residenceDivisionName = division.fullPath
  form.value.residenceDetailAddress = division.detailAddress
}

/** 区划代码确认 */
function handleDivisionConfirm(division) {
  form.value.districtCode = division.code
  // 显示完整地址，去掉 > 分隔符，包含详细地址
  let fullAddress = division.fullPath.replace(/ > /g, '')
  if (division.detailAddress) {
    fullAddress += division.detailAddress
  }
  form.value.outsideAddr = fullAddress
  form.value.divisionName = division.fullPath
  form.value.detailAddress = division.detailAddress
}

/** 重置表单 */
function resetForm() {
  form.value = {
    id: null,
    customerName: '',
    certNo: '',
    customerCode: '',
    phone: '',
    residenceAddr: '',
    residenceDistrictCode: '',
    residenceDivisionName: '',
    residenceDetailAddress: '',
    outsideAddr: '',
    districtCode: '',
    divisionName: '',
    detailAddress: '',
    companyPosition: '',
    relativesFriends: '',
    relativesPhone: '',
    isBlacklist: 'N',
    managerName: userStore.name || '', // 重置时也设置默认责任客户经理
    collectOrg: userStore.deptId || '', // 重置时也设置默认采集机构
    remark: ''
  }
  
  // 重置客户来源状态
  customerSource.value = 'manual'
  
  proxy.$refs["formRef"]?.resetFields()
}

/** 设置表单数据 */
function setFormData(data) {
  form.value = { ...data }
}

/** 获取表单数据 */
function getFormData() {
  return form.value
}

/** 验证表单 */
function validateForm() {
  return proxy.$refs["formRef"].validate()
}

// 暴露方法给父组件使用
defineExpose({
  resetForm,
  setFormData,
  getFormData,
  validateForm
})
</script>

<style scoped>
.customer-form {
  padding: 0;
}

/* 表单行间距优化 */
.customer-form .el-row {
  margin-bottom: 20px;
}

.customer-form .el-row:last-child {
  margin-bottom: 0;
}

/* 表单项样式优化 */
.customer-form .el-form-item {
  margin-bottom: 16px;
}

.customer-form .el-form-item:last-child {
  margin-bottom: 0;
}

/* 输入框与按钮组合样式 */
.input-with-button {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.input-with-button .el-input {
  flex: 1;
}

/* 地址输入框样式优化 */
.el-form-item[prop="residenceAddr"] .el-input,
.el-form-item[prop="outsideAddr"] .el-input {
  min-width: 400px; /* 专门为地址设置的超大宽度，确保能显示完整的地址信息 */
  max-width: none; /* 移除最大宽度限制 */
}

/* 为不同类型的输入框设置合适的最小宽度 */
.customer-form .el-input {
  min-width: 200px; /* 基础最小宽度 */
}

/* 客户内码输入框特殊处理 - 设置更大的最小宽度 */
.customer-form .el-form-item[prop="customerCode"] .input-with-button .el-input {
  min-width: 300px;
}

/* 联系电话输入框设置合适宽度 */
.customer-form .el-form-item[prop="phone"] .el-input {
  min-width: 240px;
}


/* 地址相关字段设置更大宽度 */
.customer-form .el-form-item[prop="externalAddress"] .input-with-button .el-input,
.customer-form .el-form-item[prop="localAddress"] .el-input,
.customer-form .el-form-item[prop="localFriends"] .el-input,
.customer-form .el-form-item[prop="friendsPhone"] .el-input {
  min-width: 400px;
}

/* 在外地址输入框特别优化 */
.customer-form .el-form-item[prop="externalAddress"] .input-with-button .el-input {
  min-width: 450px;
}

/* 客户名称相关输入框 */
.customer-form .el-form-item[prop="customerName"] .input-with-button .el-input {
  min-width: 250px;
}

/* 输入框内部样式 */
.customer-form .el-input input {
  font-size: 14px;
  padding: 10px 12px;
  height: 40px;
}

/* 按钮样式优化 */
.input-with-button .el-button {
  height: 32px;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  white-space: nowrap;
}

.input-with-button .el-button + .el-button {
  margin-left: 0;
}

/* 字段提示样式 */
.field-tip {
  margin-top: 6px;
  padding-left: 2px;
  line-height: 1.4;
}

/* 被禁用的输入框样式优化 */
.customer-form .el-input.is-disabled .el-input__wrapper {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #6c757d;
}

/* 表单标签样式 */
.customer-form .el-form-item__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 40px;
}

/* 单选按钮组样式 */
.customer-form .el-radio-group {
  height: 40px;
  display: flex;
  align-items: center;
}

.customer-form .el-radio {
  margin-right: 20px;
}

/* 专门针对白名单单选按钮的样式强化 */
.customer-form .blacklist-radio-group {
  display: flex !important;
  align-items: center !important;
  height: 40px !important;
  line-height: 40px !important;
}

.customer-form .blacklist-radio-group .el-radio {
  margin-right: 24px !important;
  display: inline-flex !important;
  align-items: center !important;
  font-size: 14px !important;
  color: #606266 !important;
  font-weight: normal !important;
  cursor: pointer !important;
}

.customer-form .blacklist-radio-group .el-radio__input {
  margin-right: 8px !important;
}

.customer-form .blacklist-radio-group .el-radio__label {
  font-size: 14px !important;
  color: #606266 !important;
  font-weight: normal !important;
}

.customer-form .blacklist-radio-group .el-radio.is-checked .el-radio__label {
  color: #409eff !important;
}

.customer-form .blacklist-radio-group .el-radio__input.is-checked .el-radio__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

.customer-form .blacklist-radio-group .el-radio__input.is-checked .el-radio__inner::after {
  background-color: #fff !important;
}

/* 选择器样式 */
.customer-form .el-select {
  min-width: 200px;
}

.customer-form .el-select .el-input {
  min-width: auto;
}

/* 文本域样式 */
.customer-form .el-textarea .el-textarea__inner {
  min-height: 80px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

/* 提示链接样式 */
.field-tip .el-link {
  font-size: 12px;
  margin-left: 6px;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .customer-form .el-form-item[prop="externalAddress"] .input-with-button .el-input {
    min-width: 350px;
  }
  
  /* 地址输入框响应式优化 */
  .el-form-item[prop="residenceAddr"] .el-input,
  .el-form-item[prop="outsideAddr"] .el-input {
    min-width: 500px; /* 中等屏幕下仍保持较大宽度 */
  }
  
}

@media (max-width: 768px) {
  .customer-form .el-row {
    margin-bottom: 16px;
  }
  
  .input-with-button {
    flex-direction: column;
    gap: 8px;
  }
  
  .input-with-button .el-button {
    width: 100%;
  }
  
  /* 地址输入框移动端优化 */
  .el-form-item[prop="residenceAddr"] .el-input,
  .el-form-item[prop="outsideAddr"] .el-input {
    min-width: auto;
    width: 100%;
  }
  
  .customer-form .el-input {
    min-width: auto;
  }
}
</style>