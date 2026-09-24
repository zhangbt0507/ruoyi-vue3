<template>
  <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
       <el-form-item label="企业名称" prop="nm">
          <el-input
             v-model="queryParams.nm"
             placeholder="请输入企业名称"
             clearable
             style="width: 240px"
             @keyup.enter="handleQuery"
          />
       </el-form-item>
       <el-form-item label="中征码" prop="lnCard">
          <el-input
             v-model="queryParams.lnCard"
             placeholder="请输入中征码"
             clearable
             style="width: 240px"
             @keyup.enter="handleQuery"
          />
       </el-form-item>
       <el-form-item label="信用代码" prop="unSccode">
          <el-input
             v-model="queryParams.unSccode"
             placeholder="请输入统一社会信用代码"
             clearable
             style="width: 240px"
             @keyup.enter="handleQuery"
          />
       </el-form-item>
       <el-form-item label="报告编号" prop="rptNo">
          <el-input
             v-model="queryParams.rptNo"
             placeholder="请输入报告编号"
             clearable
             style="width: 240px"
             @keyup.enter="handleQuery"
          />
       </el-form-item>
       <!-- <el-form-item label="中征号" prop="lnCard">
          <el-select
             v-model="queryParams.lnCard"
             placeholder="请输入中征号"
             clearable
             style="width: 240px"
          >
             <el-option
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
             />
          </el-select>
       </el-form-item>
       <el-form-item label="创建时间" style="width: 308px">
          <el-date-picker
             v-model="dateRange"
             value-format="YYYY-MM-DD"
             type="daterange"
             range-separator="-"
             start-placeholder="开始日期"
             end-placeholder="结束日期"
          ></el-date-picker>
       </el-form-item> -->
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
       </el-form-item>

       <el-form-item>
          <el-button
             type="primary"
             plain
             @click="openUserManage"
             :disabled="vDisabled"
          >配置用户</el-button>
       </el-form-item>
    </el-form>
    <!-- <el-row :gutter="10" class="mb8">
       <el-col :span="1.5">
          <el-button
             type="primary"
             plain
             icon="Plus"
             @click="handleAdd"
             v-hasPermi="['system:role:add']"
          >新增授用信报告</el-button>
       </el-col>
       <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->
    <el-card>
      <div style="min-height:50vh">
        <!-- 表格数据 -->
        <el-table v-loading="loading" :data="comBcrList"  style="font-family: '黑体'" max-height="50vh" highlight-current-row>
            <el-table-column label="报告编号" prop="rptNo" width="200" />
            <el-table-column label="企业名称" prop="nm" width="250" :show-overflow-tooltip="true"/>
            <el-table-column label="中征码" prop="lnCard" :show-overflow-tooltip="true" width="200">
              <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="openLnCode(scope.row.lnCard,scope.row.fileNm)" v-show="scope.row.lnCard.length>18"></el-button>
                {{ scope.row.lnCard }}
              </template>
            </el-table-column>
            <el-table-column label="统一社会信用代码" prop="unSccode" :show-overflow-tooltip="true"  width="200" >
              <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="openScCode(scope.row.unSccode,scope.row.fileNm)" v-show="scope.row.unSccode.length>18"></el-button>
                {{ scope.row.unSccode }}
              </template>
            </el-table-column>
            <!-- <el-table-column label="查询机构" prop="queryOrg" :show-overflow-tooltip="true" width="200" /> -->
            <el-table-column label="查询人" prop="operator" :show-overflow-tooltip="true" width="100" />
            <el-table-column label="查询原因" align="center" prop="queryReason"  width="150" />
            <el-table-column label="报告日期" align="center" prop="rptTime" width="150"></el-table-column>
            <el-table-column label="查看报告" min-width="150">
                <template #default="scope">
                    <el-button link type="primary" icon="View" @click="openPdf(scope.row.filePath,scope.row.fileNm,scope.row.unSccode,scope.row.nm)" :disabled="scope.row.pdfVisible">原始</el-button>
                    <el-button link type="primary" icon="View" @click="toReportDetail(scope.row.fileNm)">分析</el-button>
                </template>
            </el-table-column>
        </el-table>
      </div>
      <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList()"
      />
    </el-card>

      <el-dialog title="查询授用信报告" v-model="open" width="500px" :close-on-click-modal="false" append-to-body :distroy-on-close="true">
          <el-form ref="creditRef" :model="form" :rules="rules" label-width="140px">
              <el-form-item label="身份标识类型" prop="idType" :required = 'true'>
                  <el-select v-model="form.idType" placeholder="身份标识类型" style="width: 300px;" @change="idTypeChange">
                      <el-option
                          v-for="item in idTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      ></el-option>
                  </el-select>
              </el-form-item>
              <!-- <el-form-item label="企业名称" prop="custNm" :required = 'true'>
                  <el-input v-model="form.custNm" placeholder="请输入企业名称" style="width: 300px;"/>
              </el-form-item> -->
              <el-form-item label="企业名称" prop="custNm" :required = 'true'>
                  <el-autocomplete ref="autocomplete" v-model="form.custNm" placeholder="企业名称" style="width: 300px;" clearable
                    :fetch-suggestions="querySearch" @select = "handleSelect" :debounce="1000">
                  </el-autocomplete>
              </el-form-item>
              <el-form-item label="身份标识号码" prop="loanCard" :required = 'true'>
                  <el-input v-model="form.loanCard" placeholder="请输入身份标识号码" style="width: 300px;"/>
              </el-form-item>
              <el-form-item label="查询原因" prop="queryReason" :required = 'true'>
                  <el-select v-model="form.queryReason" @change="dataScopeSelectChange" placeholder="查询原因" style="width: 300px;">
                      <el-option
                          v-for="item in dataScopeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      ></el-option>
                  </el-select>
              </el-form-item>
              <el-form-item label="用户授权文件" prop="authFile" v-if="isShow">
                  <el-upload
                  multiple
                  :action="uploadFileUrl"
                  :before-upload="handleBeforeUpload"
                  :on-change="handleUploadChange"
                  :on-success="imgUploadSuccess"
                  :on-remove="handleRemove"
                  
                  class="upload-file-uploader"
                  ref="fileUpload"
                  accept=".jpg,.jpeg,.png,.svg"
                  :headers="headers"
                  :limit="1"
                  :auto-upload="true"
                  >
                  <!-- <el-icon class="el-icon--upload" style="width: 300px;"><upload-filled /></el-icon> -->
                  <!-- 上传按钮 -->
                  <el-button type="primary" style="width: 300px;">选取文件</el-button>
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


      <el-dialog v-model="userManageOpen" width="30%" height="300px"> 
          <component :is="userManageComponent" v-bind="componentProps"/>
      </el-dialog>
     

      <el-dialog title="修改中征号" v-model="lnCodeformOpen" width="500px" append-to-body>
          <el-form ref="lnCodeRef" :model="lnCodeform" :rules="lnFormRules" label-width="140px">
              <el-form-item label="原始中征号" prop="lnCodeOrg" :required = 'true'>
                  <el-input v-model="lnCodeform.lnCodeOrg" placeholder="请输入原始中征号" style="width: 300px;" disabled="true"/>
              </el-form-item>
              <el-form-item label="中征号" prop="lnCode" :required = 'true'>
                  <el-input v-model="lnCodeform.lnCode" placeholder="请输入中征号" style="width: 300px;"/>
              </el-form-item>
          </el-form>
          <template #footer>
              <div class="dialog-footer">
              <el-button type="primary" @click="submitLnCodeform">确 定</el-button>
              <el-button @click="cancelLnCodeform">取 消</el-button>
              </div>
          </template>
      </el-dialog>

      
      <el-dialog title="修改统一社会信用代码" v-model="scCodeformOpen" width="500px" append-to-body>
          <el-form ref="scCodeRef" :model="scCodeform" :rules="lnFormRules" label-width="140px">
              <el-form-item label="原始社会信用代码" prop="unScCodeOrg" :required = 'true'>
                  <el-input v-model="scCodeform.unScCodeOrg" placeholder="请输入原始社会信用代码" style="width: 300px;" disabled="true"/>
              </el-form-item>
              <el-form-item label="社会信用代码" prop="unScCode" :required = 'true'>
                  <el-input v-model="scCodeform.unScCode" placeholder="请输入社会信用代码" style="width: 300px;"/>
              </el-form-item>
          </el-form>
          <template #footer>
              <div class="dialog-footer">
              <el-button type="primary" @click="submitScCodeform">确 定</el-button>
              <el-button @click="cancelScCodeform">取 消</el-button>
              </div>
          </template>
      </el-dialog>
  </div>
</template>

<script>
export default{
  beforeRouteEnter(to, from, next) {
    next()
  },
}

</script>
<script setup name="Credit">

const props = defineProps({
/* 上传文件大小限制(MB) */
fileSize: {
  type: Number,
  default: 10,
}
});

const { proxy } = getCurrentInstance();
const router = useRouter();

import { listComBcr, addComUseReport, addComUseLog, queryAndParse, queryComBcrName, editLnCode, editScCode } from "@/api/szhl/credit/ComBrcInfo";
import { operateLog } from "@/api/system/log";
import { checkPermission } from "@/api/szhl/credit/CreditUser";
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import userManageComponent from './UserManage.vue';

const headers = ref({
  Authorization: "Bearer " + getToken()
});
/** 身份标识类型选项 "10"-中征码 "20"-统一社会信用代码 "30"-组织机构代码 "01"-工商注册号 "02"-机关和事业单位登记号 "03"-社会团体登记号 "04"-民办非企业登记号 "05"-基金会登记号 "06"-宗教证书登记号 "07"-律师事务所执业许可证号 "08"-司法鉴定许可证号 "41"-纳税人识别号（国税） "42"-纳税人识别号（地税）*/
const idTypeOptions = ref([
{ value: "10", label: "中征码" },
{ value: "20", label: "统一社会信用代码" }
// { value: "30", label: "组织机构代码" },
// { value: "01", label: "工商注册号" },
// { value: "02", label: "机关和事业单位登记号" },
// { value: "03", label: "社会团体登记号" },
// { value: "04", label: "民办非企业登记号" },
// { value: "05", label: "基金会登记号" },
// { value: "06", label: "宗教证书登记号" },
// { value: "07", label: "律师事务所执业许可证号" },
// { value: "08", label: "司法鉴定许可证号" },
// { value: "41", label: "纳税人识别号（国税）" },
// { value: "42", label: "纳税人识别号（地税）" }
]);

/** 查询原因选项 01-贷前审查 02-贷中操作 03-贷后管理 04-其他原因 05-关联查询 17-额度审批 18-担保审查*/
const dataScopeOptions = ref([
  { value: "01", label: "贷前审查" },
  { value: "02", label: "贷中操作" },
  { value: "03", label: "贷后管理" },
  { value: "04", label: "其他原因" },
  { value: "05", label: "关联查询" },
  { value: "17", label: "额度审批" },
  { value: "18", label: "担保审查" }
]);


const data = reactive({
  form: {},
  lnCodeform: {},
  scCodeform:{},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
  rules: {
    custNm: [{ required: true, message: "企业名称不能为空", trigger: "blur" }],
    idType: [{ required: true, message: "身份标识类型不能为空", trigger: "blur" }],
    loanCard: [{ required: true, message: "身份标识号码不能为空", trigger: "blur" }],
    queryReason: [{ required: true, message: "请选择查询原因", trigger: "change" }],
  },
  lnFormRules: {
    lnCodeOrg: [{ required: true, message: "原始中征号不能为空", trigger: "blur" }],
    lnCode: [{ required: true, message: "中征号不能为空", trigger: "blur" }],
  },
  scFormRules: {
    unScCodeOrg: [{ required: true, message: "原始社会信用代码不能为空", trigger: "blur" }],
    unScCode: [{ required: true, message: "社会信用代码不能为空", trigger: "blur" }],
  }
});
  const showSearch = ref(true);
  const { queryParams,form,rules,lnCodeform,lnFormRules,scCodeform,scFormRules } = toRefs(data);
  const loading = ref(true);
  const vDisabled = ref(false);
  const dateRange = ref([]);
  const comBcrList = ref([]);
  const total = ref(0);
  const isShow = ref(false);
  const userManageOpen = ref(false);

  //名称 中证号map
  const comBcrlnCode = new Map();
  //名称 信用代码map
  const comBcrUnCode = new Map();

  //中征号维护弹窗
  const lnCodeformOpen = ref(false);

  //统一社会信用代码维护弹窗
  const scCodeformOpen = ref(false);

  const uploadFileUrl = ref(gatewayUrl("/common/upload"));

  const fileUpload = ref(null)
  const open = ref(false);
  let files = [];
  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1;
    getList(true);
  }

/** 表单重置 */
function reset() {
  form.value = {
    custNm: undefined,
    idType: undefined,
    loanCard: undefined,
    queryReason: undefined,
    authFile: ''
  };
  files = [];
  isShow.value = false;
  proxy.resetForm("creditRef");
}

/** 中征号表单重置 */
function resetLnCode() {
  lnCodeform.value = {
    lnCodeOrg: undefined,
    lnCode: undefined,
  };
  proxy.resetForm("lnCodeRef");
}

/** 统一社会信用代码表单重置 */
function resetScCode() {
  scCodeform.value = {
    unScCodeOrg: undefined,
    unScCode: undefined,
  };
  proxy.resetForm("scCodeRef");
}

/** 查询征信报告列表 */
function getList(isResetCurrentPage = false) {
  loading.value = true;
  let userName = localStorage.getItem('userName');
  if(userName == "admin"){
    queryParams.value.operator = "9070560"
  }else{
    queryParams.value.operator = userName
    queryParams.value.deptId = localStorage.getItem('deptId');
  }
  
  listComBcr(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    comBcrList.value = response.rows;
    let datas = response.rows;
    let currentDate = new Date();
    for(let d of datas){
      let parseDate = new Date(d.rptTime);
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

/** 新增授信报告查询 */
function handleAdd() {
  checkPermission().then(response => {
    if(response.data){
      reset();
      form.value.idType = "10";
      open.value = true;
    }else{
      proxy.$modal.msgError("未配置用户");
    }
  });
  
}

/** 同步二代 */
function handleQueryAndParse() {
  vDisabled.value = true;
  queryAndParse().then(response => {
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

/** 打开用户维护窗口 */
function openUserManage(){
  userManageOpen.value = true;
}

/** 查看原始信用报告 */
function openPdf(filePath,fileName,unSccode,name){
  // let formData = new FormData();
  // formData.append("fileNm",fileName)
  // formData.append("operTitle","查看原始报告")
  // formData.append("operName",localStorage.getItem('userName'))
  // formData.append("fileType","企业")
  // addComUseLog(formData);
  let formData1 = new FormData();
  formData1.append("module","企业信用")
  formData1.append("operContent","查看原始报告")
  formData1.append("remark1",fileName)
  formData1.append("idNo",unSccode)
  formData1.append("custName",name)
  operateLog(formData1)
  let url = filePath.substring(12);
  let host = window.location.hostname;
  let baseUrl = "http://"+host+":8081/file/view/"+url;
  if(process.env.NODE_ENV === "production"){
    baseUrl = "http://"+host+":8081/prod-api/file/view/" + url;
  }else{
    baseUrl = "http://"+host+":8081/file/view/"+url;
  }
  
  window.open(baseUrl,"_blank")
}

function  toReportDetail(fileNm) {
  // window.open("http://localhost:8081/szhl/credit/comp/ComUseReportDetails")
  // localStorage.setItem('fileNm', fileNm);
  // let formData = new FormData();
  // formData.append("fileNm",fileNm)
  // formData.append("operTitle","查看分析报告")
  // formData.append("operName",localStorage.getItem('userName'))
  // formData.append("fileType","企业")
  // addComUseLog(formData);
  
  router.push({ path: "/credit/detail",query:{"fileNm":fileNm} });
  // proxy.$router.push("/credit/detail/" + fileNm);81030418660
  // proxy.$router.push("/credit/detail/" + fileNm);
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 取消中征号按钮 */
function cancelLnCodeform() {
  lnCodeformOpen.value = false;
  reset();
}

  /**重置筛选框 */
function resetQuery(){
  proxy.resetForm("queryRef");
  queryParams.value.pageNum = 1;
}

/** 查询原因选择触发 */
function dataScopeSelectChange(value) {
  if (value !== "03") {
    isShow.value = true;  
  }else{
    isShow.value = false;
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["creditRef"].validate(valid => {
    if (valid) {
        if(form.value.queryReason !== '03'){
          if(files.length == 0){
            proxy.$modal.msgError("请上传用户授权文件");
            return
          }
        }
        if(fileUpload.value){
          fileUpload.value.submit();
        }
        
        let formData = new FormData();
        for(const file of files){
            formData.append("authPic",file);
        }
        formData.append("custNm",form.value.custNm)
        formData.append("idType",form.value.idType)
        formData.append("loanCard",form.value.loanCard)
        formData.append("queryReason",form.value.queryReason) 
        addComUseReport(formData).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            getList();
            // let logFormData = new FormData();
            // logFormData.append("fileNm",form.value.custNm+form.value.loanCard)
            // logFormData.append("operTitle","查询授信报告")
            // logFormData.append("operName",localStorage.getItem('userName'))
            // logFormData.append("fileType","企业")
            // addComUseLog(logFormData);

            let formData1 = new FormData();
            formData1.append("module","企业信用")
            formData1.append("operContent","查询授信报告")
            formData1.append("remark1",form.value.custNm+form.value.loanCard)
            formData1.append("idNo",form.value.loanCard)
            formData1.append("custName",form.value.custNm)
            operateLog(formData1)
        });
    }
    
  });
}


// 上传前校检格式和大小
function handleBeforeUpload(file) {

  const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"];
  const isJPG = type.includes(file.type);
  //检验文件格式
  if (!isJPG) {
    proxy.$modal.msgError(`图片格式错误!`);
    return false;
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  files=[];
  files.push(file);

  return true;
}


function handleUploadChange(file,fileList){
  if(fileList.length>0){
      proxy.$refs['creditRef'].clearValidate()
  }
}

function handleRemove(file,fileList) {
  files = [];
}

function imgUploadSuccess(response, file, fileList){
  form.value.file =  file.response.data;
  // proxy.$refs["imgUpload"].clearValidate();
}

function idTypeChange(){
  form.value.loanCard = "";
}


function querySearch(queryString, cb) {
  proxy.$refs["autocomplete"].activated = false;
  if(queryString){
    proxy.$refs["autocomplete"].activated = true;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(()=>{
      let formData = new FormData();
      formData.append("nm",queryString);
      queryComBcrName(formData).then(response => {
        let nmList = [];
        let lnCode = new Map();
        let unCode = new Map();
        let data = response.data;
        for(let d of data){
          nmList.push({value:d.nm,label:d.nm});
          lnCode.set(d.nm,d.lnCard);
          unCode.set(d.nm,d.unSccode);
        }
        this.comBcrNmList = nmList;
        comBcrlnCode.value = lnCode;
        comBcrUnCode.value = unCode;
        cb(nmList)
      })
    },1000);
  }else{
    form.value.loanCard = ""
  }
}

function handleSelect(input){
  let idType = form.value.idType;
  if(idType == "10"){
    form.value.loanCard = comBcrlnCode.value.get(input.value)
  }else{
    form.value.loanCard = comBcrUnCode.value.get(input.value)
  }
}

//打开中征号维护弹窗
function openLnCode(lnCodeOrg,fileNm){
  resetLnCode();
  lnCodeformOpen.value = true;
  lnCodeform.value.lnCodeOrg = lnCodeOrg;
  lnCodeform.value.fileNm = fileNm;
}

//打开社会信用代码维护弹窗
function openScCode(scCodeOrg,fileNm){
  resetScCode();
  scCodeformOpen.value = true;
  scCodeform.value.unScCodeOrg = scCodeOrg;
  scCodeform.value.fileNm = fileNm;
}

/** 提交中征号按钮 */
function submitLnCodeform() {
  proxy.$refs["lnCodeRef"].validate(valid => {
    if (valid) {
        let formData = new FormData();
        formData.append("lnCode",lnCodeform.value.lnCode)
        formData.append("lnCodeOrg",lnCodeform.value.lnCodeOrg)
        editLnCode(formData).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            lnCodeformOpen.value = false;
            getList();
            // let logformData = new FormData();
            // logformData.append("fileNm",lnCodeform.value.fileNm)
            // logformData.append("operTitle","修改中征号")
            // logformData.append("operName",localStorage.getItem('userName'))
            // logformData.append("fileType","企业")
            // addComUseLog(logformData);

            // let formData1 = new FormData();
            // formData1.append("module","企业信用")
            // formData1.append("operContent","修改中征号")
            // formData1.append("remark1",lnCodeform.value.fileNm)
            // operateLog(formData1)
        });
    }
  });
}

/** 提交社会信用代码按钮 */
function submitScCodeform() {
  proxy.$refs["scCodeRef"].validate(valid => {
    if (valid) {
        let formData = new FormData();
        formData.append("unScCode",scCodeform.value.unScCode)
        formData.append("unScCodeOrg",scCodeform.value.unScCodeOrg)
        editScCode(formData).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            scCodeformOpen.value = false;
            getList();
            // let logformData = new FormData();
            // logformData.append("fileNm",lnCodeform.value.fileNm)
            // logformData.append("operTitle","修改统一社会信用代码")
            // logformData.append("operName",localStorage.getItem('userName'))
            // logformData.append("fileType","企业")
            // addComUseLog(logformData);

            // let formData1 = new FormData();
            // formData1.append("module","企业信用")
            // formData1.append("operContent","修改统一社会信用代码")
            // formData1.append("remark1",scCodeform.value.fileNm)
            // operateLog(formData1)
        });
    }
  });
}

getList()
</script>

<style>
.upload-file-uploader {
  margin-bottom: 5px;
}
</style>