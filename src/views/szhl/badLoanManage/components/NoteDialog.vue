<template>
  <el-dialog 
    title="事项记载" 
    v-model="dialogVisible" 
    width="95%" 
    :close-on-click-modal="false"
    append-to-body
    top="2vh"
    class="note-dialog"
  >
    <div class="note-container">
      <!-- 基本信息维护区域 -->
      <div class="basic-info-section">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>
        
        <el-form :model="basicInfoForm" label-width="80px" class="basic-form">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="客户名称">
                <el-input v-model="basicInfoForm.customerName" size="small" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="证件号码">
                <el-input v-model="basicInfoForm.idNumber" size="small" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="客户内码">
                <el-input v-model="basicInfoForm.customerCode" size="small" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="联系电话">
                <el-input v-model="basicInfoForm.phone" size="small" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="12">
            <el-col :span="24">
              <el-form-item label="客户地址">
                <el-input v-model="basicInfoForm.address" size="small" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 合同欠款信息展示 -->
      <div class="contract-info-section">
        <div class="section-header">
          <span class="section-title">合同欠款信息展示</span>
          <el-button type="primary" size="small" @click="updateAndSave">更新</el-button>
        </div>
        
        <el-table
          :data="contractList"
          style="width: 100%"
          border
          size="small"
          height="120"
        >
          <el-table-column label="合同号" prop="contractNo" align="center" width="160" />
          <el-table-column label="合同日期" prop="contractDate" align="center" width="100" />
          <el-table-column label="到期日期" prop="dueDate" align="center" width="100" />
          <el-table-column label="担保方式" prop="guaranteeType" align="center" width="100" />
          <el-table-column label="用途" prop="purpose" align="center" width="100" />
          <el-table-column label="本金余额" prop="principalAmount" align="center" width="100">
            <template #default="scope">
              {{ parseFloat(scope.row.principalAmount).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="欠息（元）" prop="interest" align="center" width="100">
            <template #default="scope">
              {{ parseFloat(scope.row.interest).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="担保人" prop="guarantor" align="center" min-width="150" />
        </el-table>
        
        <!-- 合计行 -->
        <div class="contract-summary">
          <table class="contract-summary-table">
            <tbody>
            <tr>
              <td style="width: 160px;">合计</td>
              <td style="width: 100px;"></td>
              <td style="width: 100px;"></td>
              <td style="width: 100px;"></td>
              <td style="width: 100px;"></td>
              <td style="width: 100px;"></td>
              <td style="width: 100px;"></td>
              <td style="min-width: 150px;"></td>
            </tr>
          </tbody>
          </table>
        </div>
      </div>

      <!-- 管贷措施记录 -->
      <div class="note-section">
        <el-form :model="noteForm" label-width="80px" class="note-form">
          <el-row :gutter="12">
            <el-col :span="4">
              <el-form-item label="管贷措施">
                <el-select v-model="noteForm.managementType" placeholder="请选择" style="width: 100%" size="small">
                  <el-option label="电话催收" value="phone" />
                  <el-option label="上门催收" value="visit" />
                  <el-option label="信函催收" value="letter" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="事件日期">
                <el-date-picker 
                  v-model="noteForm.registrationDate" 
                  type="date" 
                  placeholder="年/月/日" 
                  style="width: 100%" 
                  size="small"
                  format="YYYY/MM/DD"
                  value-format="YYYY/MM/DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="记事摘要" class="summary-item">
                <div class="summary-container">
                  <el-input 
                    v-model="noteForm.summary" 
                    type="textarea" 
                    :rows="4" 
                    placeholder="请输入记事摘要"
                    size="small"
                    class="summary-textarea"
                  />
                  <div class="note-buttons">
                    <el-button type="primary" size="small" @click="saveNote">保存</el-button>
                    <el-button type="primary" size="small" @click="openImageUpload">影像上传</el-button>
                    <el-button type="primary" size="small" @click="printCollectionNotice">打印催收通知书</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 管贷过程记载表格 -->
      <div class="history-section">
        <div class="history-header">
          <span class="section-title">管贷过程记载</span>
          <el-button type="primary" @click="readSelectedData">读取选定数据</el-button>
        </div>
        
        <el-table
          v-loading="loading"
          :data="historyList"
          style="width: 100%"
          border
          size="small"
          height="200"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="登记日期" prop="registrationDate" align="center" width="100" />
          <el-table-column label="管贷类型" prop="managementType" align="center" width="100">
            <template #default="scope">
              {{ getManagementTypeText(scope.row.managementType) }}
            </template>
          </el-table-column>
          <el-table-column label="登记人" prop="registrant" align="center" width="80" />
          <el-table-column label="记事摘要" prop="summary" align="left" min-width="250" :show-overflow-tooltip="true" />
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-area">
          <div class="pagination-left">
            <el-button size="small" icon="ArrowLeft" :disabled="true"></el-button>
            <el-button size="small" icon="ArrowLeft" :disabled="true"></el-button>
            <span class="page-info">第 <el-input v-model="currentPage" size="small" style="width: 50px; margin: 0 5px;" /> 页</span>
            <el-button size="small" icon="ArrowRight"></el-button>
            <el-button size="small" icon="ArrowRight"></el-button>
          </div>
          <div class="pagination-right">
            <span>每页显示 <el-select v-model="pageSize" size="small" style="width: 60px; margin: 0 5px;">
              <el-option label="20" value="20" />
              <el-option label="50" value="50" />
              <el-option label="100" value="100" />
            </el-select> 条/共条记录 共 页</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 影像上传对话框 -->
    <el-dialog
      title="影像资料上传"
      v-model="imageUploadVisible"
      width="80%"
      :close-on-click-modal="false"
      append-to-body
      class="image-upload-dialog"
    >
      <div class="image-upload-container">
        <!-- 上传区域 -->
        <div class="upload-section">
          <div class="section-header">
            <span class="section-title">文件上传</span>
          </div>
          <div class="upload-content">
            <el-form :model="imageUploadForm" :rules="imageUploadRules" ref="imageUploadFormRef" label-width="100px" size="small">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="客户名称" prop="customerName">
                    <el-input v-model="imageUploadForm.customerName" placeholder="请输入客户名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="客户号" prop="customerNo">
                    <el-input v-model="imageUploadForm.customerNo" placeholder="请输入客户号" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="合同号" prop="contractNo">
                    <el-input v-model="imageUploadForm.contractNo" placeholder="请输入合同号" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="资料类型" prop="materialType">
                    <el-select v-model="imageUploadForm.materialType" placeholder="请选择资料类型" style="width: 100%">
                      <el-option label="身份证" value="身份证" />
                      <el-option label="营业执照" value="营业执照" />
                      <el-option label="结婚证" value="结婚证" />
                      <el-option label="户口薄" value="户口薄" />
                      <el-option label="申请书" value="申请书" />
                      <el-option label="其他" value="其他" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="资料名称" prop="materialName">
                    <el-input v-model="imageUploadForm.materialName" placeholder="请输入资料名称" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="上传文件">
                <el-upload
                  ref="imageUploadRef"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :file-list="imageUploadForm.fileList"
                  :on-success="handleImageUploadSuccess"
                  :on-error="handleImageUploadError"
                  :before-upload="beforeImageUpload"
                  :on-remove="handleImageRemove"
                  :on-change="handleImageChange"
                  :auto-upload="false"
                  multiple
                  :limit="10"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  list-type="picture-card"
                >
                  <el-icon><Plus /></el-icon>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持jpg/png/pdf/doc格式文件，单个文件不超过10MB，最多上传10个文件
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
            
            <div class="upload-buttons">
              <el-button type="primary" size="small" @click="submitImageUpload">确定上传</el-button>
              <el-button size="small" @click="imageUploadVisible = false">取消</el-button>
            </div>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <div class="file-list-section">
          <div class="section-header">
            <span class="section-title">已上传文件</span>
            <el-button type="primary" size="small" icon="Refresh" @click="getImageList">刷新</el-button>
          </div>
          <div class="file-list-content">
            <el-table
              v-loading="imageListLoading"
              :data="imageList"
              style="width: 100%"
              size="small"
              border
              height="300"
            >
              <el-table-column type="selection" width="40" align="center" />
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    icon="View" 
                    size="small" 
                    circle 
                    @click="handleImagePreview(scope.row)"
                    title="预览"
                  />
                </template>
              </el-table-column>
              <el-table-column label="资料类型" prop="materialType" width="100" align="center" />
              <el-table-column label="资料名称" prop="materialName" width="100" align="center" />
              <el-table-column label="文件名称" prop="fileName" min-width="150" align="center" />
              <el-table-column label="上传人" prop="uploader" width="80" align="center" />
              <el-table-column label="上传时间" prop="uploadTime" width="120" align="center" />
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button type="primary" size="small" text @click="handleImageDownload(scope.row)">下载</el-button>
                  <el-button type="danger" size="small" text @click="handleImageDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog
      title="文件预览"
      v-model="imagePreviewVisible"
      width="70%"
      :close-on-click-modal="false"
    >
      <div class="image-preview-container">
        <div v-if="previewImageFile.type === 'image'" class="image-preview">
          <img :src="previewImageFile.url" alt="预览图片" style="max-width: 100%; max-height: 500px;" />
        </div>
        <div v-else-if="previewImageFile.type === 'pdf'" class="pdf-preview">
          <iframe :src="previewImageFile.url" style="width: 100%; height: 500px; border: none;"></iframe>
        </div>
        <div v-else class="file-info">
          <el-icon size="48"><Document /></el-icon>
          <p>{{ previewImageFile.name }}</p>
          <p>此文件类型不支持预览，请下载后查看</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="imagePreviewVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleImageDownload(previewImageFile)">下载</el-button>
        </div>
      </template>
    </el-dialog>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import gatewayUrl from '@/utils/gatewayUrl'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
    default: false
  },
  selectedRow: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible'])

// 对话框可见性控制
const dialogVisible = ref(false)
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    initData()
  }
})
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 基本信息表单
const basicInfoForm = reactive({
  customerName: '',
  idNumber: '',
  customerCode: '',
  phone: '',
  address: '',
  legalRepresentative: '',
  legalRepIdNumber: '',
  spouseName: '',
  spouseIdNumber: '',
  legalRepPhone: '',
  spousePhone: '',
  customDescription: '',
  institutionNo: '',
  creator: '',
  lastUpdater: '',
  lastUpdateDate: ''
})

// 记事表单
const noteForm = reactive({
  managementType: 'phone',
  registrationDate: new Date(),
  institutionNo: '',
  responsiblePerson: '',
  summary: ''
})

// 合同列表
const contractList = ref([])
// 历史记录列表
const historyList = ref([])
// 选中的历史记录
const selectedHistory = ref([])
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref('20')

// 影像上传相关
const imageUploadVisible = ref(false)
const imagePreviewVisible = ref(false)
const imageListLoading = ref(false)
const imageList = ref([])
const imageUploadForm = reactive({
  customerName: '',
  customerNo: '',
  contractNo: '',
  materialType: '',
  materialName: '',
  fileList: []
})

// 预览文件信息
const previewImageFile = ref({
  name: '',
  url: '',
  type: ''
})

// 上传配置
const uploadAction = ref(gatewayUrl('/common/upload'))
const uploadHeaders = ref({
  Authorization: 'Bearer ' + getToken()
})

// 表单验证规则
const imageUploadRules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  customerNo: [{ required: true, message: '请输入客户号', trigger: 'blur' }],
  contractNo: [{ required: true, message: '请输入合同号', trigger: 'blur' }],
  materialType: [{ required: true, message: '请选择资料类型', trigger: 'change' }],
  materialName: [{ required: true, message: '请输入资料名称', trigger: 'blur' }]
}

// 表单引用
const imageUploadFormRef = ref(null)
const imageUploadRef = ref(null)

// 初始化数据
function initData() {
  // 填充基本信息
  if (props.selectedRow && Object.keys(props.selectedRow).length > 0) {
    basicInfoForm.customerName = props.selectedRow.customerName || ''
    basicInfoForm.institutionNo = props.selectedRow.managementInstitution || ''
    noteForm.institutionNo = props.selectedRow.managementInstitution || ''
    noteForm.responsiblePerson = props.selectedRow.managementPerson || ''
  }
  
  // 模拟合同数据
  contractList.value = [
    {
      contractNo: '90711202400025O5',
      contractDate: '2025-01-01',
      dueDate: '2026-12-31',
      guaranteeType: '组合担保',
      purpose: '日常消费',
      principalAmount: '30.56',
      interest: '58.49',
      guarantor: '长江后浪推前浪'
    }
  ]
  
  // 模拟历史记录数据
  historyList.value = [
    {
      id: 1,
      registrationDate: '2025-01-01',
      managementType: 'visit',
      registrant: '陈*斌',
      summary: '对本次催收进行效果评估,并对所选的标签进行补充文字说明,'
    },
    {
      id: 2,
      registrationDate: '2025-01-01',
      managementType: 'letter',
      registrant: '陈*斌',
      summary: ''
    },
    {
      id: 3,
      registrationDate: '2025-01-01',
      managementType: 'phone',
      registrant: '陈*斌',
      summary: ''
    }
  ]
}

// 获取管贷类型文本
function getManagementTypeText(type) {
  const typeMap = {
    'phone': '电话催收',
    'visit': '上门催收',
    'letter': '信函催收'
  }
  return typeMap[type] || type
}

// 处理表格选择变化
function handleSelectionChange(selection) {
  selectedHistory.value = selection
}

// 显示标签选择器
function showTagSelector() {
  ElMessage.info('标签选择功能开发中')
}

// 保存记事
function saveNote() {
  if (!noteForm.summary.trim()) {
    ElMessage.warning('请输入记事摘要')
    return
  }
  
  const newNote = {
    id: Date.now(),
    registrationDate: new Date().toISOString().split('T')[0],
    managementType: noteForm.managementType,
    registrant: noteForm.responsiblePerson || '陈*斌',
    summary: noteForm.summary
  }
  
  historyList.value.unshift(newNote)
  noteForm.summary = ''
  
  ElMessage.success('记事保存成功')
}

// 更新保存
function updateAndSave() {
  ElMessage.success('更新保存成功')
}

// 打印催收通知书
function printCollectionNotice() {
  ElMessage.info('打印催收通知书功能开发中')
}

// 打开影像上传对话框
function openImageUpload() {
  imageUploadVisible.value = true
  // 初始化表单数据
  if (props.selectedRow && Object.keys(props.selectedRow).length > 0) {
    imageUploadForm.customerName = props.selectedRow.customerName || ''
    imageUploadForm.customerNo = props.selectedRow.customerNo || ''
    imageUploadForm.contractNo = props.selectedRow.contractNo || ''
  }
  getImageList()
}

// 获取影像列表
function getImageList() {
  imageListLoading.value = true
  
  // 模拟数据
  setTimeout(() => {
    imageList.value = [
      {
        id: 1,
        materialType: '身份证',
        materialName: '身份证正面',
        fileName: 'id_card_front.jpg',
        uploader: '陈斌',
        uploadTime: '2025-01-01 10:30',
        fileUrl: '/uploads/id_card_front.jpg',
        fileType: 'image'
      },
      {
        id: 2,
        materialType: '营业执照',
        materialName: '营业执照副本',
        fileName: 'business_license.pdf',
        uploader: '陈斌',
        uploadTime: '2025-01-01 11:15',
        fileUrl: '/uploads/business_license.pdf',
        fileType: 'pdf'
      }
    ]
    imageListLoading.value = false
  }, 500)
}

// 文件上传前检查
function beforeImageUpload(file) {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 JPG/PNG/PDF/DOC 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 文件上传成功
function handleImageUploadSuccess(response, file, fileList) {
  console.log('文件上传成功:', file, fileList)
  // 更新文件列表
  imageUploadForm.fileList = fileList
}

// 文件上传失败
function handleImageUploadError(error) {
  ElMessage.error('文件上传失败')
}

// 文件变化处理
function handleImageChange(file, fileList) {
  console.log('文件变化:', file, fileList)
  imageUploadForm.fileList = fileList
}

// 移除文件
function handleImageRemove(file, fileList) {
  console.log('移除文件:', file, fileList)
  imageUploadForm.fileList = fileList
}

// 提交影像上传
function submitImageUpload() {
  imageUploadFormRef.value.validate((valid) => {
    if (valid) {
      // 检查文件列表的多种方式
      const uploadFiles = imageUploadRef.value?.uploadFiles || []
      const formFiles = imageUploadForm.fileList || []
      
      console.log('检查文件:', {
        uploadFiles: uploadFiles.length,
        formFiles: formFiles.length,
        uploadRef: imageUploadRef.value
      })
      
      if (uploadFiles.length === 0 && formFiles.length === 0) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      
      // 手动触发上传
      if (uploadFiles.length > 0) {
        imageUploadRef.value.submit()
      }
      
      // 这里应该调用后端API保存文件信息
      ElMessage.success('影像资料上传成功')
      
      // 重置表单
      setTimeout(() => {
        imageUploadFormRef.value.resetFields()
        imageUploadRef.value.clearFiles()
        imageUploadForm.fileList = []
        
        // 刷新列表
        getImageList()
      }, 1000)
    }
  })
}

// 预览图片
function handleImagePreview(row) {
  previewImageFile.value = {
    name: row.fileName,
    url: row.fileUrl,
    type: row.fileType
  }
  imagePreviewVisible.value = true
}

// 下载文件
function handleImageDownload(row) {
  // 创建下载链接
  const link = document.createElement('a')
  link.href = row.fileUrl || row.url
  link.download = row.fileName || row.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('文件下载开始')
}

// 删除文件
function handleImageDelete(row) {
  ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用后端API删除文件
    ElMessage.success('删除成功')
    getImageList() // 刷新列表
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 读取选定数据
function readSelectedData() {
  if (selectedHistory.value.length === 0) {
    ElMessage.warning('请选择要读取的记录')
    return
  }
  
  const selectedNote = selectedHistory.value[0]
  noteForm.managementType = selectedNote.managementType
  noteForm.summary = selectedNote.summary
  
  ElMessage.success('数据读取成功')
}

// 关闭对话框
function closeDialog() {
  dialogVisible.value = false
}
</script>

<style scoped>
.note-dialog :deep(.el-dialog__body) {
  padding: 10px;
  max-height: 85vh;
  overflow-y: auto;
}

.note-container {
  padding: 0;
}


.basic-info-section, .contract-info-section, .note-section, .history-section {
  margin-bottom: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
}

.section-header, .history-header {
  background-color: #f5f7fa;
  padding: 8px 15px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}

.basic-form, .note-form {
  padding: 8px 15px;
}

.basic-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.note-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.note-form .summary-item :deep(.el-form-item__content) {
  display: flex;
  flex-direction: column;
}

.summary-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.summary-textarea {
  margin-bottom: 8px;
}

.note-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.basic-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
}

.note-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
}

.tag-area {
  display: flex;
  align-items: center;
}

.contract-summary {
  border-top: 1px solid #e4e7ed;
}

.contract-summary-table {
  width: 100%;
  border-collapse: collapse;
}

.contract-summary-table td {
  padding: 6px 8px;
  border-right: 1px solid #e4e7ed;
  text-align: center;
  background-color: #f5f7fa;
  font-weight: bold;
  font-size: 13px;
}

.contract-summary-table td:last-child {
  border-right: none;
}


.pagination-area {
  padding: 8px 15px;
  border-top: 1px solid #e4e7ed;
  background-color: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #606266;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-right {
  display: flex;
  align-items: center;
}

.page-info {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.dialog-footer {
  text-align: center;
  padding: 10px 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

:deep(.el-table td) {
  padding: 6px 0;
}

/* 输入框样式优化 */
:deep(.el-input__inner) {
  font-size: 13px;
}

:deep(.el-textarea__inner) {
  font-size: 13px;
}

:deep(.el-select) {
  font-size: 13px;
}

/* 按钮样式优化 */
:deep(.el-button--small) {
  font-size: 13px;
  padding: 6px 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .note-dialog :deep(.el-dialog) {
    width: 98% !important;
  }
}

/* 影像上传对话框样式 */
.image-upload-dialog :deep(.el-dialog__body) {
  padding: 15px;
  max-height: 80vh;
  overflow-y: auto;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section, .file-list-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
}

.upload-content, .file-list-content {
  padding: 15px;
}

.upload-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* 上传组件样式 */
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

/* 预览对话框样式 */
.image-preview-container {
  text-align: center;
  padding: 20px;
}

.image-preview img {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-info {
  padding: 40px;
  color: #666;
}

.file-info p {
  margin: 10px 0;
  font-size: 14px;
}

/* 文件列表表格样式 */
.file-list-section :deep(.el-table) {
  font-size: 13px;
}

.file-list-section :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #303133;
}

.file-list-section :deep(.el-table td) {
  padding: 8px 0;
}

/* 响应式设计 - 影像上传 */
@media (max-width: 768px) {
  .image-upload-container {
    flex-direction: column;
  }
  
  .upload-section, .file-list-section {
    width: 100%;
  }
}
</style> 