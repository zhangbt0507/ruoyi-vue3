<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="证件号" prop="certNo">
        <el-input v-model="queryParams.certNo" placeholder="请输入证件号" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="在磐地址" prop="residenceAddr">
        <el-input v-model="queryParams.residenceAddr" placeholder="请输入在磐地址" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="在外地址" prop="outsideAddr">
        <el-input v-model="queryParams.outsideAddr" placeholder="请输入在外地址" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户经理" prop="managerName">
        <el-select 
          v-model="queryParams.managerName" 
          placeholder="请选择客户经理" 
          clearable 
          filterable
          style="width: 240px"
        >
          <el-option
            v-for="option in managerOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="白名单" prop="isBlacklist">
        <el-select v-model="queryParams.isBlacklist" placeholder="白名单状态" clearable style="width: 240px">
          <el-option label="是" value="Y" />
          <el-option label="否" value="N" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
        >导入</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Document"
          @click="handleTemplate"
        >模板</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="客户名称" align="center" key="customerName" prop="customerName" v-if="columns[0].visible" />
      <el-table-column label="证件号" align="center" v-if="columns[1].visible" width="180" >
        <template  #default="scope">
            <el-link :underline="false" type="primary" @click="handleClickCustId(scope.row)" >{{ scope.row.certNo }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" key="phone" prop="phone" v-if="columns[2].visible" width="120" />
      <el-table-column label="在磐地址" align="center" key="residenceAddr" prop="residenceAddr" v-if="columns[3].visible" :show-overflow-tooltip="true" />
      <el-table-column label="在外地址" align="center" key="outsideAddr" prop="outsideAddr" v-if="columns[4].visible" :show-overflow-tooltip="true" />
      <el-table-column label="在磐亲友" align="center" key="relativesFriends" prop="relativesFriends" v-if="columns[5].visible" :show-overflow-tooltip="true" />
      <el-table-column label="亲友电话" align="center" key="relativesPhone" prop="relativesPhone" v-if="columns[6].visible" width="120" />
      <el-table-column label="白名单" align="center" key="isBlacklist" v-if="columns[7].visible" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isBlacklist === 'N' ? 'danger' : 'success'">
            {{ scope.row.isBlacklist === 'Y' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="单位/职业" align="center" key="companyPosition" prop="companyPosition" v-if="columns[8].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="采集机构" align="center" key="collectOrg" prop="collectOrg" v-if="columns[9].visible" />
      <el-table-column label="责任人" align="center" key="userName" prop="userName" v-if="columns[10].visible" />
    </el-table>
    
    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/修改客户信息对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <ExternalPersonnelForm ref="formRef" />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="500px" append-to-body>
      <el-upload
        ref="uploadRef"
        v-model:file-list="fileList"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :auto-upload="false"
        :data="{ updateSupport: upload.updateSupport ? 'true' : 'false' }"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的数据
            </div>
            <div style="margin-top: 10px;">
              <span>仅允许导入xls、xlsx格式文件，文件大小不超过5MB。</span>
            </div>
            <div style="margin-top: 5px;">
              <el-link type="primary" @click="handleTemplate">下载导入模板</el-link>
              <el-popover
                placement="right"
                title="导入说明"
                :width="300"
                trigger="hover"
              >
                <template #reference>
                  <el-link type="info" style="margin-left: 10px;">查看导入说明</el-link>
                </template>
                <div>
                  <p><strong>字段说明：</strong></p>
                  <ul>
                    <li>客户姓名：必填</li>
                    <li>证件号码：必填，唯一标识</li>
                    <li>客户内码：必填，系统内部编码</li>
                    <li>联系电话：选填</li>
                    <li>在磐地址：选填</li>
                    <li>在外地址：选填</li>
                    <li>区划代码：选填</li>
                    <li>单位/职业：选填</li>
                    <li>在磐亲友：选填</li>
                    <li>亲友联系电话：选填</li>
                    <li>是否列入白名单：选填(Y/N)</li>
                    <li>责任客户经理：选填</li>
                    <li>备注：选填</li>
                  </ul>
                  <p><strong>注意事项：</strong></p>
                  <ul>
                    <li>证件号码和客户内码必须唯一</li>
                    <li>勾选"是否更新已经存在的数据"可更新重复数据</li>
                  </ul>
                </div>
              </el-popover>
            </div>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
            <el-button type="success" @click="submitUpload" :loading="upload.isUploading" style="margin-left: 10px;">
            {{ upload.isUploading ? '上传中...' : '开始上传' }}
            </el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ExternalPersonnelManage">
import { ref, reactive, toRefs, onMounted, onActivated, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { 
  listExternalPersonnel, 
  getExternalPersonnel,
  addExternalPersonnel,
  updateExternalPersonnel,
  delExternalPersonnel,
  exportExternalPersonnel,
  importExternalPersonnel,
  downloadImportTemplate
} from "@/api/szhl/gridManage/externalPersonnel"
import { queryAllUser } from '@/api/system/user'
import ExternalPersonnelForm from './components/ExternalPersonnelForm.vue'
import { getToken } from '@/utils/auth'
import gatewayUrl from '@/utils/gatewayUrl'
import { ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance()
const router = useRouter()

const customerList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const submitLoading = ref(false)
const managerOptions = ref([]) // 客户经理选项
const formRef = ref(null)
const fileList = ref([]) // 添加文件列表变量

// 导入相关变量
const upload = ref({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的数据
  updateSupport: false,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: gatewayUrl("/szhl/externalPersonnel/importData")
});

// 列显隐信息
const columns = ref([
  { key: 0, label: `客户名称`, visible: true },
  { key: 1, label: `证件号`, visible: true },
  { key: 2, label: `联系电话`, visible: true },
  { key: 3, label: `在磐地址`, visible: true },
  { key: 4, label: `在外地址`, visible: true },
  { key: 5, label: `在磐亲友`, visible: true },
  { key: 6, label: `亲友电话`, visible: true },
  { key: 7, label: `黑名单`, visible: true },
  { key: 8, label: `采集机构`, visible: true },
  { key: 9, label: `责任人`, visible: true },
  { key: 10, label: `备注`, visible: true }
])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: null,
    certNo: null,
    phone: null,
    residenceAddr: null,
    outsideAddr: null,
    managerName: null,
    collectOrg: null,
    isBlacklist: null
  }
})

const { queryParams } = toRefs(data)

/** 获取所有客户经理列表 */
function getManagerList() {
  queryAllUser().then(response => {
    managerOptions.value = response.data.map(user => ({
      label: `${user.nickName}（${user.userName}）`,  // 显示姓名和工号
      value: user.userName
    }))
  }).catch(error => {
    console.error('获取客户经理列表失败:', error)
    proxy.$modal.msgError('获取客户经理列表失败')
  })
}

/** 查询客户列表 */
function getList() {
  loading.value = true
  listExternalPersonnel(queryParams.value).then(response => {
    customerList.value = response.rows;
    total.value = response.total || 3
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 重置操作表单 */
function reset() {
  formRef.value?.resetForm()
}

/** 取消按钮 */
function cancel() {
  open.value = false
  submitLoading.value = false
  reset()
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "新增客户信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const customerId = row.id || ids.value[0]
  getExternalPersonnel(customerId).then(response => {
    formRef.value?.setFormData(response.data)
    open.value = true
    title.value = "修改客户信息"
  }).catch(() => {
    // 模拟数据
    const mockData = customerList.value.find(item => item.id === customerId)
    if (mockData) {
      formRef.value?.setFormData(mockData)
      open.value = true
      title.value = "修改客户信息"
    }
  })
}

/** 提交按钮 */
function submitForm() {
  formRef.value?.validateForm().then(valid => {
    if (valid) {
      submitLoading.value = true
      const formData = formRef.value?.getFormData()
      
      if (formData.id != null) {
        updateExternalPersonnel(formData).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        }).finally(() => {
          submitLoading.value = false
        })
      } else {
        addExternalPersonnel(formData).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        }).finally(() => {
          submitLoading.value = false
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  let customerCodes = '';
  if (row.customerCode) {
    customerCodes = row.customerCode;
  } else if (ids.value && ids.value.length > 0) {
    // 处理多选删除的情况
    customerCodes = ids.value.map(item => item.customerCode).join(',');
  }
  
  if (!customerCodes) {
    proxy.$modal.msgError("未选择任何数据项");
    return;
  }
  
  proxy.$modal.confirm('是否确认删除选中的数据项？').then(function() {
    return delExternalPersonnel(customerCodes)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导入按钮操作 */
function handleImport() {
  upload.value.open = true;
}

/** 下载模板按钮操作 */
function handleTemplate() {
  downloadImportTemplate().then(response => {
    // 使用浏览器原生的下载方法而不是proxy.download
    if (response) {
      const blob = new Blob([response]);
      const filename = `在外人员导入模板_${new Date().getTime()}.xlsx`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  });
}

/** 提交上传文件 */
function submitUpload() {
  
  // 校验是否有文件上传
  if (!fileList.value || fileList.value.length === 0) {
    proxy.$modal.msgError('请先选择要上传的文件！');
    return;
  }
  
  // 限制只能上传一个文件
  if (fileList.value.length > 1) {
    proxy.$modal.msgError('只能上传一个文件！');
    return;
  }
  
  // 通过引用直接调用上传组件的submit方法
  proxy.$refs.uploadRef.submit();
}

/** 文件上传前处理 */
function beforeUpload(file) {
  // 检查文件类型
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel' ||
                  file.name.endsWith('.xlsx') || 
                  file.name.endsWith('.xls');
  
  if (!isExcel) {
    proxy.$modal.msgError('只支持Excel文件格式！');
    return false;
  }
  
  // 检查文件大小
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    proxy.$modal.msgError('上传文件大小不能超过 5MB!');
    return false;
  }
  
  return true;
}

/** 文件上传中处理 */
function handleFileUploadProgress(event, file, fileList) {
  upload.value.isUploading = true;
}

/** 文件上传成功处理 */
function handleUploadSuccess(response, file, fileList) {
  upload.value.isUploading = false;
  if (response.code === 200) {
    // 导入成功后，提示框需要用户自行点击关闭
    ElMessageBox.alert(response.msg, '导入结果', {
      confirmButtonText: '确定',
      type: 'success',
      dangerouslyUseHTMLString: true
    }).then(() => {
      proxy.$refs.uploadRef.clearFiles();
        getList();
    }).catch(() => {
      // 用户点击关闭或取消按钮时也执行清理操作
      proxy.$refs.uploadRef.clearFiles();
    });
  } else {
    // 导入失败后，提示框也需要用户自行点击关闭
    ElMessageBox.alert(response.msg, '导入失败', {
      confirmButtonText: '确定',
      type: 'error',
      dangerouslyUseHTMLString: true
    }).then(() => {
      proxy.$refs.uploadRef.clearFiles();
        getList()
      // 在失败情况下，额外调用handleRemove确保文件被移除
      try {
        proxy.$refs.uploadRef.handleRemove(file);
      } catch (e) {
        console.log('Failed to remove file:', e);
      }
    }).catch(() => {
      // 用户点击关闭或取消按钮时也执行清理操作
      proxy.$refs.uploadRef.clearFiles();
      try {
        proxy.$refs.uploadRef.handleRemove(file);
      } catch (e) {
        console.log('Failed to remove file:', e);
      }
    });
  }
}

/** 文件上传失败处理 */
function handleUploadError(error) {
  upload.value.isUploading = false;
  proxy.$modal.msgError('上传文件失败: ' + error.message);
  proxy.$refs.uploadRef.clearFiles();
  upload.value.open = false; // 确保在失败时也关闭对话框
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("szhl/externalPersonnel/export", {
    ...queryParams.value,
  }, `在外人员_${new Date().getTime()}.xlsx`);
}

/** 查询客户360详情 */
function handleClickCustId(row){
    proxy.$router.push("/customer/detail/" + row.customerCode.trim());
}

onMounted(() => {
  getList();
  getManagerList(); // 加载客户经理列表
})

// 从详情页返回时刷新数据，但保持分页状态
onActivated(() => {
  // 刷新数据但不改变分页状态
  getList();
})
</script>

<style scoped>
/* 自定义样式 */
</style>