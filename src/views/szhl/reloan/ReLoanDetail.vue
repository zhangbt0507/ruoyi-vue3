<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            
            
                 <el-form-item label="客户名称" prop="customerName">
                    <el-input
                        v-model="queryParams.customerName"
                        placeholder="请输入客户名称"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="信用代码" prop="code">
                    <el-input
                        v-model="queryParams.code"
                        placeholder="请输入统一信用代码证"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="再贷款合同号" prop="reLoanContractNo" label-width="120">
                    <el-input
                        v-model="queryParams.reLoanContractNo"
                        placeholder="请输入统一再贷款合同号"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                
                <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                    <el-button
                        type="primary"
                        plain
                        icon="Upload"
                        @click="handleImport()"
                        v-hasPermi="['reloan:info:import']"
                    >导入</el-button>
                  
               </el-col>
               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
            <el-table v-loading="loading" :data="reLoanDataList" @selection-change="handleSelectionChange" style="width:100%">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="统一社会信用代码" width="190" align="center" key="code" prop="code"  :show-overflow-tooltip="true" />
               <el-table-column label="客户名称" width="230" align="left" key="customerName" prop="customerName"  :show-overflow-tooltip="true" />
               <el-table-column label="客户类别" width="100" align="center" key="category" prop="category"  :show-overflow-tooltip="true" />
               <el-table-column label="单户授信金额(元)"  width="120" align="center" key="creditAmount" prop="creditAmount"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款合同编号" width="160" align="center" key="loanContractNo" prop="loanContractNo"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款合同金额(元)" width="100" align="center" key="contractAmount" prop="contractAmount"  :show-overflow-tooltip="true" />
               <el-table-column label="借据号" width="150" align="center" key="loanAccount" prop="loanAccount"  :show-overflow-tooltip="true" />
               <el-table-column label="该借据号下贷款余额(元)" width="100" align="center" key="loanBalance" prop="loanBalance"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款利率(%)" width="80" align="center" key="rate" prop="rate"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款发放日期" width="100" align="center" key="grantDate" prop="grantDate"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款到期日期" width="100" align="center" key="dueDate" prop="dueDate"  :show-overflow-tooltip="true" />
               <el-table-column label="客户所属行业" width="150" align="center" key="industry" prop="industry"  :show-overflow-tooltip="true" />
               <el-table-column label="是否为民营企业" width="80" align="center" key="isLocal" prop="isLocal"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款划型" width="150" align="center" key="loanType" prop="loanType"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款用途" width="150"  align="center" key="loanPurpose" prop="loanPurpose"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款质量" width="80" align="center" key="loanQuality" prop="loanQuality"  :show-overflow-tooltip="true" />
               <el-table-column label="担保方式" width="120" align="center" key="guaranteeForm" prop="guaranteeForm"  :show-overflow-tooltip="true" />
               <el-table-column label="担保人" width="100" align="center" key="guarantee" prop="guarantee"  :show-overflow-tooltip="true" />
               <el-table-column label="抵质押物种类" width="120" align="center" key="collateralType" prop="collateralType"  :show-overflow-tooltip="true" />
               <el-table-column label="外部增信方式" width="120" align="center" key="otherCredit" prop="otherCredit"  :show-overflow-tooltip="true" />
               <el-table-column label="备注" width="120" align="center" key="remark" prop="remark"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款发放月份" width="120" align="center" key="loanBeginMonth" prop="loanBeginMonth"  :show-overflow-tooltip="true" />
               <el-table-column label="再贷款发放日期" width="120" align="center" key="reLoanBeginDate" prop="reLoanBeginDate"  :show-overflow-tooltip="true" />
               <el-table-column label="再贷款到期日期" width="120" align="center" key="reLoanEndDate" prop="reLoanEndDate"  :show-overflow-tooltip="true" />
               <el-table-column label="再贷款本金" width="120" align="center" key="reLoanPrincipal" prop="reLoanPrincipal"  :show-overflow-tooltip="true" />
               <el-table-column label="再贷款合同编号" width="120" align="center" key="reLoanContractNo" prop="reLoanContractNo"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款初始标识" width="120" align="center" key="reLoanInitMark" prop="reLoanInitMark"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款标识变更说明" width="120" align="center" key="reLoanInitMarkChangeInfo" prop="reLoanInitMarkChangeInfo"  :show-overflow-tooltip="true" />
               <el-table-column label="贷款已报销对应的月份" width="120" align="center" key="reLoanSubmitMonth" prop="reLoanSubmitMonth"  :show-overflow-tooltip="true" />
            </el-table>
            <pagination
               v-show="total > 0"
               :total="total"
               v-model:page="queryParams.pageNum"
               v-model:limit="queryParams.pageSize"
               @pagination="getList"
            />

             <!-- 导入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     注意：每一次导入会覆盖相同借据的数据
                  </div>
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>
    </div>

</template>
<script>
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import { getReLoanDetailList } from "@/api/szhl/reloan/ReLoanDetail";
const showSearch = ref(true);
const total = ref(0);
const loading = ref(false);
const reLoanDataList = ref([]);
/*** 导入参数 */
const upload = reactive({
  // 是否显示弹出层（导入）
  open: false,
  // 弹出层标题（导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: gatewayUrl("/reLoan/importData")
});
const data = reactive({
    form: {
         enable:ref(false)
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerName: undefined,
        code: undefined,
        reLoanContractNo: undefined
    }
});
const { queryParams, form } = toRefs(data);
const handleInitEffect = (proxy) => {
    const handleImport = ()=>{
        upload.title = "再贷款导入";
        upload.open = true;
    }
    //导入模板
    const importTemplate = ()=>{
        proxy.download("reLoan/importTemplate", {
        }, `再贷款导入模板_${new Date().getTime()}.xlsx`);
    }
    const submitFileForm = ()=>{
        proxy.$refs["uploadRef"].submit();
    }
    const handleFileUploadProgress =  (event, file, fileList) => {
        upload.isUploading = true;
    }
    const handleFileSuccess = (response, file, fileList) => {
        upload.open = false;
        upload.isUploading = false;
        proxy.$refs["uploadRef"].handleRemove(file);
        proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
        getList();
    };
    //获取数据
    const getList = ()=>{
        loading.value = true;
        getReLoanDetailList(proxy.addDateRange(queryParams.value)).then(res => {
            reLoanDataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
    }
    //搜索
    const handleQuery = ()=>{
        proxy.$refs["queryRef"].validate(valid => {
        if (valid) {
            queryParams.value.pageNum = 1;
            getList();
        }
     });
        
    }
     //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryRef");
        handleQuery();
    }

    const handleSelectionChange = ()=>{

    }
   

    return { upload, handleImport, importTemplate, submitFileForm, handleFileUploadProgress, handleFileSuccess, handleQuery, getList, resetQuery, handleSelectionChange  }
}
export default {
    setup() {
        //获取代理对象
        const { proxy } = getCurrentInstance(); 
        const { handleImport, importTemplate, submitFileForm, handleFileUploadProgress, handleFileSuccess, handleQuery, getList, resetQuery, handleSelectionChange } = handleInitEffect(proxy);
        //数据字典
        //const { loan_use_code,enterprise_hold_type } = proxy.useDict("loan_use_code","enterprise_hold_type");
        getList();
         return { showSearch, total, loading, queryParams, form, reLoanDataList, upload, handleImport, importTemplate, submitFileForm, handleFileUploadProgress, handleFileSuccess,
          handleQuery, getList, resetQuery, handleSelectionChange }
    },
}
</script>