<template>
    <div>
        <el-form :model="queryParams" ref="queryForm"   :rules="importRules"  :inline="true" label-width="68px">
            <el-form-item label="报送月份" prop="period" label-width="80">
                <el-date-picker v-model="queryParams.period" placeholder="考核月份" type="month" format="YYYY-MM" value-format="YYYY-MM"></el-date-picker>
            </el-form-item>
            <el-form-item label="客户名称" prop="customerName">
            <el-input
                v-model="queryParams.customerName"
                placeholder="请输入客户名称"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
            />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search"  @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh"  @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                    <el-button
                    type="warning"
                    plain
                    icon="Upload"
                    @click="handleImport"
                    v-hasPermi="['data:fin:import']"
                    >省行存量单位贷款导入</el-button>
                </el-col>
                <el-col :span="1.5">
                    <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['data:fin:export']"
                        >导出报送存量单位贷款</el-button>
                </el-col>
        </el-row>
        <el-table  style="width:100%" v-loading="loading" :data="dataList" >
            <el-table-column align="center" prop="customerName"  width="200" label="客户名称" fixed="left"/>
            <el-table-column align="center" prop="finCode" width="170" label="金融机构代码" fixed="left"/>
            <el-table-column align="center" prop="orgNo" width="170" label="内部机构号"/>
            <el-table-column align="center" prop="orgAddrNo"  width="80" label="金融机构地区代码" />
            <el-table-column align="center" prop="idType"  width="200" label="借款人证件类型"/>
            <el-table-column align="center" prop="idNo" width="200" label="借款人证件代码" />
            <el-table-column align="center" prop="part" width="100" label="借款人经济成分"/>
            <el-table-column align="center" prop="scale" width="100" label="借款人企业规模"/>
            <el-table-column align="center" prop="loanAccount" width="200" label="贷款借据编码" />
            <el-table-column align="center" prop="loanContractNo" width="200" label="贷款合同编码" />
            <el-table-column align="center" prop="loanType" label="贷款产品类别" />
            <el-table-column align="center" prop="orient" width="100" label="贷款实际投向" />
            <el-table-column align="center" prop="grantDate" width="100" label="贷款发放日期" />
            <el-table-column align="center" prop="dueDate" width="100" label="贷款到期日期" />
            <el-table-column align="center" prop="extensionDate" width="100" label="贷款展期到期日期" />
            <el-table-column align="center" prop="currency" label="币种" />
            <el-table-column align="center" prop="curBal" width="100" label="贷款余额" />
            <el-table-column align="center" prop="curBalRmb" width="100" label="贷款余额折人民币" />
            <el-table-column align="center" prop="fixedRate"  label="利率是否固定" />
            <el-table-column align="center" prop="rate" label="利率水平" />
            <el-table-column align="center" prop="priceBenchmark" label="贷款定价基准类型" />
            <el-table-column align="center" prop="benchmarkRate" label="基准利率" />
            <el-table-column align="center" prop="finSupport" label="贷款财政扶持方式" />
            <el-table-column align="center" prop="reBenchmarkDate" width="100" label="贷款利率重新定价日"/>
            <el-table-column align="center" prop="guaranteeForm"   label="贷款担保方式" />
            <el-table-column align="center" prop="firstLoan" label="是否首次贷款" />
            <el-table-column align="center" prop="loanQuality"  label="贷款质量" />
            <el-table-column align="center" prop="loanStatus" label="贷款状态"/>
            <el-table-column align="center" prop="overdue" label="逾期类型" />
            <el-table-column align="center" prop="loanPurpose" width="200" label="贷款用途" />
            <el-table-column align="center" prop="exchangeCode" width="200" label="登记交易场所代码" />
        </el-table>
        <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
            />
    </div>
    <!-- 导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
        <el-form ref="importRef" :model="imprtForm" :rules="importRules"  >
         <div>
             <el-form-item label="报送月份" prop="period">
                <el-date-picker v-model="imprtForm.period" placeholder="报送月份" type="month" style="width:90px;" size="small" format="YYYY-MM" value-format="YYYY-MM"></el-date-picker>
             </el-form-item>
         </div>
        </el-form>
        <el-upload
           ref="uploadRef"
           :limit="1"
           accept=".xlsx, .xls"
           :headers="upload.headers"
           :action="upload.url1   "
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
                    注意：若报送月份数据已存在，则原有数据将被覆盖！
                 </div>
                 <span>仅允许导入xls、xlsx格式文件。</span>
                 <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
              </div>
           </template>
        </el-upload>
        <template #footer>
           <div class="dialog-footer">
              <el-button type="primary" @click="submitFileForm" :disabled="disabled">确 定</el-button>
              <el-button @click="upload.open = false">取 消</el-button>
           </div>
        </template>
     </el-dialog>
     <!-- 导入确认提示框 -->
     <el-dialog title="导入提示" v-model="openConfirm" width="600">
       <span>{{confirmTitle}}</span>
       <template #footer>
            <el-button type="primary" @click="confirmEvent" >确 定</el-button>
            <el-button @click="openConfirm = false">取 消</el-button>
       </template>
     </el-dialog>

     <el-dialog v-model="open" width="400">
    <el-form ref="ref" :model="form" :rules="rules"  >
         <div>
             <el-form-item label="报送月份" prop="period">
                <el-date-picker v-model="form.period" placeholder="报送月份" type="month"   format="YYYY-MM" value-format="YYYY-MM"></el-date-picker>
             </el-form-item>
         </div>
        </el-form>
        <template #footer>
           <div class="dialog-footer">
              <el-button type="primary" @click="exportEvent" >导 出</el-button>
              <el-button @click="open = false">取 消</el-button>
           </div>
        </template>
</el-dialog>
</template>
<script>
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import { getFinLoanList } from "@/api/szhl/data/FinLoan";
//导入禁用
const disabled = ref(false);
const open=ref(false);
// 遮罩层
const loading = ref(false);
// 总条数
const total = ref(0);
// 表格数据
const  dataList = ref([]);
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
  url: gatewayUrl("/fin-loan/import", "performance"),
  //拼接后上传地址
  url1: ""
});
// 弹出确认框
const openConfirm = ref(false);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    period: null,
    customerName: null
  },
  // 表单参数
  form: {},
  imprtForm: {},
  rules: {
    period: [
      { required: true, message: "报送月份必填", trigger: "blur" }
    ]
  },

  importRules: {
    period: [
      { required: true, message: "报送月份必填", trigger: "blur" }
    ]
  }
})
const { queryParams, form,rules, imprtForm, importRules } = toRefs(data);
const initEffect = (proxy)=>{
    const getList = () => {
        loading.value = true;
        getFinLoanList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
       
    }
    //查询
    const handleQuery = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
                queryParams.value.pageNum = 1;
                getList();
              }
        }) 
    }
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryForm");
        handleQuery();
    }
     //导入模板
     const importTemplate = ()=>{
        proxy.download("fin-loan/importTemplate", {
        }, `存量单位贷款导入模板_${new Date().getTime()}.xlsx`,  {appCode: 'performance'});
    }
    const handleImport = ()=>{
        upload.title = "存量单位贷款导入";
        upload.open = true;
        proxy.resetForm("importRef");
    }
    const submitFileForm = ()=>{
        proxy.$refs["importRef"].validate(valid => {
            if (valid) {
                confirmEvent();
            }
        })
    }
     const handleFileUploadProgress =  (event, file, fileList) => {
        upload.isUploading = true;
    }
    const handleFileSuccess = (response, file, fileList) => {
        upload.open = false;
        upload.isUploading = false;
        proxy.$refs["uploadRef"].handleRemove(file);
        proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
        loading.value=false;
        disabled.value = false;
    };
    //确认导入
    const confirmEvent = ()=>{
      loading.value=true;
      upload.url1 = upload.url + "?period=" + imprtForm.value.period;
      proxy.$refs["uploadRef"].submit();
      openConfirm.value = false;
      disabled.value = true;
    }
    const handleExport = ()=>{
            open.value = true;
        }
    const exportEvent = ()=>{
        proxy.$refs["ref"].validate(valid => {
        if (valid) {
            proxy.download("fin-loan/export?period="+form.value.period, {},`存量单位贷款_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
            }
        }) 
        
        };

    return { getList, handleQuery, resetQuery, importTemplate, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, handleExport, exportEvent }
}
export default {
    name:'FinLoan',
    setup() {
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const { getList,handleQuery, resetQuery, importTemplate, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, handleExport, exportEvent} = initEffect(proxy);

        return { disabled, queryParams, form, loading, total, dataList, upload, openConfirm, imprtForm, importRules,open, form,rules, getList, handleQuery, resetQuery, importTemplate, handleImport, submitFileForm, handleFileUploadProgress,
             handleFileSuccess, handleExport, exportEvent }
    }
}
</script>