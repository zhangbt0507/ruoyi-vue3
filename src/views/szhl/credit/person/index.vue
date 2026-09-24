<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
      <el-form-item label="报告编号" prop="reportNo">
        <el-input
          v-model="queryParams.reportNo"
          placeholder="请输入报告编号"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="身份证" prop="idNo">
        <el-input
          v-model="queryParams.idNo"
          placeholder="请输入身份证号"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button
             type="primary"
             plain
             icon="Plus"
             @click="handleAdd"
          >查询授用信报告</el-button>
          <el-button
             type="primary"
             plain
             @click="handleQueryAndParse"
             :disabled="vDisabled"
          >同步二代</el-button>
          <el-button
             type="primary"
             plain
             @click="openUserManage"
             :disabled="vDisabled"
          >配置用户</el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="userManageOpen" width="30%" height="300px"> 
          <component :is="userManageComponent" v-bind="componentProps"/>
    </el-dialog>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reportList" style="font-family: '黑体'" max-height="50vh" highlight-current-row>
      <el-table-column label="报告编号" prop="reportNo" align="center" width="200" />
      <el-table-column label="客户姓名" prop="custName" align="center" width="250" :show-overflow-tooltip="true"/>
      <el-table-column label="身份证号" prop="idNo" align="center" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="报告来源" prop="reason" align="center" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="上传账号" prop="userName" align="center" :show-overflow-tooltip="true" width="100" />
      <el-table-column label="上传人" align="center" prop="nickName" width="120" />
      <el-table-column label="支行" align="center" prop="deptId" width="150"></el-table-column>
      <el-table-column label="报告时间" align="center" prop="reportDate" width="180"></el-table-column>
      <el-table-column label="入库时间" align="center" prop="updateTime" width="180"></el-table-column>
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="openPdf(scope.row)" :disabled="scope.row.pdfVisible">原始</el-button>
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">分析</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />


    <el-dialog title="查询授用信报告" v-model="open" width="500px" :close-on-click-modal="false" append-to-body :destroy-on-close="true">
        <el-form ref="creditRef" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="查询原因" prop="queryReason" :required="true" style="width: 430px;">
                <el-select v-model="form.queryReason" @change="queryReasonChange" placeholder="请选择查询原因">
                    <el-option
                        v-for="item in queryReasonOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="证件类型" prop="idType" :required="true" style="width: 430px;">
                <el-select v-model="form.idType" placeholder="请选择证件类型" >
                    <el-option
                        v-for="item in idTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="查询姓名" prop="custName" :required="true" style="width: 430px;">
                <el-input v-model="form.custName" placeholder="请输入查询姓名" >
                  <template #append>
                    <el-button @click="openCustomerSelector">选择</el-button>
                  </template>
                </el-input>
            </el-form-item>
            
            <el-form-item label="证件号码" prop="idNo" :required="true" style="width: 430px;">
                <el-input v-model="form.idNo" placeholder="请输入证件号码"/>
            </el-form-item>
            
            <el-form-item label="业务类型" prop="businessType" v-if="showBusinessFields" :required="showBusinessFields" style="width: 430px;">
                <!-- <el-input v-model="form.businessType" placeholder="请输入业务类型"/> -->
                <el-select v-model="form.businessType" placeholder="请选择业务类型">
                  <el-option label="个人贷款" value="grdk" />
                  <el-option label="信用卡" value="xyk" />
                  <el-option label="消费金融" value="xfjr" />
                </el-select>
            </el-form-item>
            
            <el-form-item :label="form.businessType === 'xyk' ? '信用卡' : '合同号'" prop="contractNo" v-if="showBusinessFields" :required="showBusinessFields" style="width: 430px;">
                <el-input v-model="form.contractNo" :placeholder="form.businessType === 'xyk' ? '请输入信用卡号' : '请输入合同号'" />
            </el-form-item>
            
            <el-form-item label="授权书" prop="authorizationImage" v-if="showUploadField" :required="showUploadField">
                <el-upload
                    :auto-upload="false"
                    :before-upload="handleBeforeUpload"
                    accept=".jpg,.jpeg,.png,.pdf"
                    :limit="1"
                    list-type="text"
                    ref="authUpload"
                    @change="handleAuthChange"
                    :on-remove="handleAuthRemove"
                >
                    <el-button type="primary" style="width: 300px;">选择授权书文件</el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持jpg/png/pdf格式，单个文件不超过5MB
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </template>
    </el-dialog>

    <CustomerSelector
      ref="customerSelectorRef"
      v-model:visible="customerSelectorVisible"
      @confirm="handleCustomerConfirm"
    />
  </div>
</template>

<script setup name="PersonReport">
import { getCurrentInstance, ref, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import { listReport, queryCredit } from "@/api/szhl/credit/person/report";
import { queryAndParsePersonCredit} from "@/api/szhl/credit/person/details";
import { operateLog } from "@/api/system/log";
import userManageComponent from '../comp/UserManage.vue';
import CustomerSelector from '@/views/szhl/gridManage/externalPersonnel/components/CustomerSelector.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();

const reportList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const open = ref(false);

const customerSelectorVisible = ref(false);
const customerSelectorRef = ref();

const userManageOpen = ref(false);

const vDisabled = ref(false);

// 上传相关
const uploadFileUrl = ref(gatewayUrl("/common/upload"));
const headers = ref({ Authorization: "Bearer " + getToken() });

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    reportNo: undefined,
    custName: undefined,
    idNo: undefined,
    reason: undefined
  },
  form: {
    custName: '',
    idType: '',
    idNo: '',
    queryReason: '',
    businessType: '',
    contractNo: '',
    authorizationImage: null
  },
  rules: {
    custName: [{ required: true, message: "查询姓名不能为空", trigger: "blur" }],
    idType: [{ required: true, message: "证件类型不能为空", trigger: "change" }],
    idNo: [{ required: true, message: "证件号码不能为空", trigger: "blur" }],
    queryReason: [{ required: true, message: "查询原因不能为空", trigger: "change" }],
    businessType: [{ required: true, message: "业务类型不能为空", trigger: "change" }],
    contractNo: [{ required: true, message: "合同号不能为空", trigger: "blur" }],
    authorizationImage: [
      {
        validator: (rule, value, callback) => {
          if (showUploadField.value && !form.value.authorizationImage) {
            callback(new Error("请上传授权书文件"));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 控制字段显示
const showBusinessFields = ref(false);
const showUploadField = ref(true);

// 证件类型选项
const idTypeOptions = ref([
  { value: 'X', label: '其他证件' },
  { value: '1', label: '户口簿' },
  { value: '2', label: '护照' },
  { value: '9', label: '警官证' },
  { value: 'A', label: '香港身份证' },
  { value: '10', label: '身份证(身份证，临时身份证)' },
  { value: 'B', label: '澳门身份证' },
  { value: '20', label: '军人身份证件(军官证，士兵证)' },
  { value: 'C', label: '台湾身份证' },
  { value: '5', label: '港澳居民来往内地通行证' },
  { value: '8', label: '外国人居留证' },
  { value: '6', label: '台湾同胞来往内地通行证' }
]);

// 查询原因选项
const queryReasonOptions = ref([
  { value: '01', label: '贷后管理' },
  { value: '02', label: '贷款审批' },
  { value: '25', label: '资信审查' },
  { value: '03', label: '信用卡审批' },
  { value: '08', label: '担保资格审查' },
  { value: '23', label: '客户准入资格审查' },
  { value: '19', label: '特约商户实名审查' },
  { value: '22', label: '法人、负责人、高管资信审查' }
]);

/** 打开用户维护窗口 */
function openUserManage(){
  userManageOpen.value = true;
}

/** 查询报告列表 */
function getList(isResetCurrentPage = false) {
  loading.value = true;
  listReport(queryParams.value).then(response => {
    reportList.value = response.rows;
    let datas = response.rows;
    let currentDate = new Date();
    for(let d of datas){
      let parseDate = new Date(d.reportDate);
      const diff = (currentDate - parseDate) / (1000*60*60*24);
      d.pdfVisible = false
      if(diff > 31){
        d.pdfVisible = true
      }
    }
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.pageNum = 1;
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
}

/** 同步二代 */
function handleQueryAndParse() {
  vDisabled.value = true;
  queryAndParsePersonCredit().then(response => {
    if(response.data){
      proxy.$modal.msgSuccess("执行成功");
    }else{
      proxy.$modal.msgError("未配置用户");
    }
    getList();
    vDisabled.value = false;
  }).catch(() => {
      vDisabled.value = false;
  });
}

/** 表单重置 */
function reset() {
  form.value = {
    custName: '',
    idType: '',
    idNo: '',
    queryReason: '',
    businessType: '',
    contractNo: '',
    authorizationImage: null
  };
  showBusinessFields.value = false;
  showUploadField.value = true;
  proxy.resetForm("creditRef");
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

function openCustomerSelector() {
  customerSelectorVisible.value = true;
  customerSelectorRef.value?.setInitialSearchData?.({
    custName: form.value.custName,
    idNo: form.value.idNo
  })
}

function handleCustomerConfirm(payload) {
  const data = payload?.data || {};
  if(data.customerName) form.value.custName = data.customerName;
  if(data.idNumber) form.value.idNo = data.idNumber;

  proxy.$refs["creditRef"]?.validateField?.(['custName', 'idNo']);
}

/** 查询原因改变 */
function queryReasonChange(value) {
  // 贷后管理时显示业务类型和合同号字段，不需要上传文件
  if (value === '01') {
    showBusinessFields.value = true;
    showUploadField.value = false;
  } else {
    showBusinessFields.value = false;
    showUploadField.value = true;
  }
}

/** 文件上传前检查 */
function handleBeforeUpload(file) {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 10;

  if (!isValidType) {
    ElMessage.error('上传文件只能是 JPG/PNG/PDF 格式!');
  }
  if (!isLt5M) {
    ElMessage.error('上传文件大小不能超过 5MB!');
  }
  return isValidType && isLt5M;
}

/** 文件上传改变 */
function handleUploadChange(file, fileList) {
  form.value.authFile = fileList.map(f => f.response?.url || f.url).filter(Boolean);
}

/** 授权书文件改变 */
function handleAuthChange(file, fileList) {
  if (fileList.length > 0) {
    form.value.authorizationImage = fileList[0].raw;
    // 手动触发验证
    proxy.$refs["creditRef"].validateField('authorizationImage');
  } else {
    form.value.authorizationImage = null;
  }
}

/** 身份证文件上传成功 */
function handleIdCardUploadSuccess(response, file) {
  if (response.code === 200) {
    form.value.idCardFiles.push(response.url);
    ElMessage.success('身份证文件上传成功');
  } else {
    ElMessage.error('身份证文件上传失败');
  }
}

/** 授权书文件上传成功 */
function handleAuthUploadSuccess(response, file) {
  if (response.code === 200) {
    form.value.authFiles.push(response.url);
    ElMessage.success('授权书文件上传成功');
  } else {
    ElMessage.error('授权书文件上传失败');
  }
}

/** 授权书文件移除 */
function handleAuthRemove(file, fileList) {
  form.value.authorizationImage = null;
  // 清除之前的验证状态，然后重新验证
  proxy.$refs["creditRef"].clearValidate('authorizationImage');
  setTimeout(() => {
    proxy.$refs["creditRef"].validateField('authorizationImage');
  }, 50);
}

/** 文件上传成功 */
function imgUploadSuccess(response, file) {
  if (response.code === 200) {
    ElMessage.success('文件上传成功');
  } else {
    ElMessage.error('文件上传失败');
  }
}

/** 文件移除 */
function handleRemove(file, fileList) {
  form.value.authFile = fileList.map(f => f.response?.url || f.url).filter(Boolean);
}

/** 提交表单 */
function submitForm() {
  proxy.$refs["creditRef"].validate(valid => {
    if (valid) {
      // 检查文件是否已上传（非贷后管理时需要）
      if (form.value.queryReason !== '01') {
        if (!form.value.authorizationImage) {
          ElMessage.error('请上传授权书文件');
          proxy.$refs["creditRef"].validateField('authorizationImage');
          return;
        }
      }
      
      // 如果是贷后管理，需要额外验证业务类型和合同号
      if (form.value.queryReason === '01') {
        if (!form.value.businessType) {
          ElMessage.error('业务类型不能为空');
          return;
        }
        if (!form.value.contractNo) {
          ElMessage.error('合同号不能为空');
          return;
        }
      }
      
      // 使用 FormData 方式提交，支持文件上传
      const formData = new FormData();
      formData.append('custName', form.value.custName);
      formData.append('idType', form.value.idType);
      formData.append('idNo', form.value.idNo);
      formData.append('queryReason', form.value.queryReason);
      formData.append('businessType', form.value.businessType);
      formData.append('contractNo', form.value.contractNo);
      
      if (form.value.authorizationImage) {
        formData.append('authorizationImage', form.value.authorizationImage);
      }
      
      queryCredit(formData).then(response => {
        if (response.code === 200) {
          ElMessage.success('查询请求已提交成功');
          open.value = false;
          reset();
          getList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || '查询请求提交失败');
        }
      }).catch(error => {
        console.error('查询请求失败:', error);
        ElMessage.error('查询请求提交失败，请稍后重试');
      });
    }
  });
}

/** 查看原始信用报告 */
function openPdf(row){
  let fileName = row.custName+"-"+row.idNo+"-"+row.reportNo+".html";
  let date = row.updateTime.split(' ')[0].split('.').join('');
  let formData1 = new FormData();
  formData1.append("module","个人信用")
  formData1.append("operContent","查看原始报告")
  formData1.append("remark1",fileName)
  formData1.append("idNo",row.idNo)
  formData1.append("custName",row.custName)
  operateLog(formData1)
  let url = "person/bak_ok/" + date + "/" + fileName;
  let host = window.location.hostname;
  let baseUrl = "http://"+host+":8088/file/view/"+url;
  debugger
  if(process.env.NODE_ENV === "production"){
    baseUrl = "http://"+host+":8088/prod-api/file/view/" + url;
  }else{
    baseUrl = "http://"+host+":8088/file/view/"+url;
  }
  
  window.open(baseUrl,"_blank")
}

/** 查看报告详情 */
function handleView(row) {
  
  router.push({
    path: '/credit/person/detail',
    query: { reportNo: row.reportNo }
  });
}

getList();
</script>