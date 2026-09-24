<template>
    <div>
                <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" label-width="68px">
                    
                    <el-form-item label="授信日期" prop="workDate" label-width="100">
                        <el-tooltip content="有余额的合同金额" placement="top" >
                            <el-icon class="tip"><question-filled /></el-icon>
                        </el-tooltip>
                        <el-date-picker v-model="queryParams.workDate" placeholder="授信日期" format="YYYYMMDD" value-format="YYYYMMDD"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="证件号" prop="idNo">
                    
                    <el-input
                        v-model="queryParams.idNo"
                        placeholder="请输入证件号"
                        clearable
                        @keyup.enter="handleQuery"
                        style="width: 240px"
                    />
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
                        type="danger"
                        plain
                        icon="Delete"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['data:fin:delete']"
                    >删除</el-button>
                </el-col>
                
                <el-col :span="1.5">
                    <el-button
                    type="warning"
                    plain
                    icon="Upload"
                    @click="handleImport"
                    v-hasPermi="['data:fin:import']"
                    >省行非同业客户信息导入</el-button>
                </el-col>

                <el-col :span="1.5">
                    <el-button
                    type="warning"
                    plain
                    icon="Download"
                    @click="handleExport"
                    v-hasPermi="['data:fin:export']"
                    >导出报送非同业客户信息</el-button>
                </el-col>
                
                </el-row>
                <el-table  style="width:100%" v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" fixed="left"/>
                    <el-table-column align="center" prop="finCode" width="170" label="金融机构代码" fixed="left"/>
                    <el-table-column align="center" prop="customerName"  width="200" label="客户名称" fixed="left"/>
                    <el-table-column align="center" prop="idType"  width="80" label="客户证件类型" fixed="left"/>
                    <el-table-column align="center" prop="idNo"  width="200" label="客户证件代码" fixed="left"/>
                    <el-table-column align="center" prop="baseDepositAccount" width="200" label="基本存款账号" />
                    <el-table-column align="center" prop="openBankName" width="200" label="基本账户开户行名称" :show-overflow-tooltip="true"/>
                    <el-table-column align="center" prop="busPart" width="200" label="经营范围" :show-overflow-tooltip="true"/>
                    <el-table-column align="center" prop="regCapital" width="100" label="注册资本" />
                    <el-table-column align="center" prop="paidInCapital" width="100" label="实收资本" />
                    <el-table-column align="center" prop="totalAssets" width="140" label="总资产" />
                    <el-table-column align="center" prop="revenue" width="100" label="营业收入" />
                    <el-table-column align="center" prop="pnums" label="从业人员数" />
                    <el-table-column align="center" prop="listed" label="是否上市公司" />
                    <el-table-column align="center" prop="firstBeginDate" width="100" label="首次建立信贷关系日期" />
                    <el-table-column align="center" prop="regAddr" width="200" label="注册地址" :show-overflow-tooltip="true"/>
                    <el-table-column align="center" prop="addrCode" label="地区代码" />
                    <el-table-column align="center" prop="busStatus" label="经营状态" />
                    <el-table-column align="center" prop="beDate"  width="100" label="成立日期" />
                    <el-table-column align="center" prop="industry" label="所属行业" />
                    <el-table-column align="center" prop="scale" label="企业规模" />
                    <el-table-column align="center" prop="part" label="客户经济成分" />
                    <el-table-column align="center" prop="dept" label="客户国民经济部门" />
                    <el-table-column align="center" prop="creditAmount"  width="170"  label="授信额度"/>
                    <el-table-column align="center" prop="useCreditAmount"  width="170"  label="已用额度" />
                    <el-table-column align="center" prop="isRelated" label="是否关联方" />
                    <el-table-column align="center" prop="actualNo"  width="170"  label="实际控制人证件代码" />
                    <el-table-column align="center" prop="level" label="客户信用级别总等级数"/>
                    <el-table-column align="center" prop="grade" label="客户信用评级" />
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
                    注意：增量导入，不会覆盖已有客户数据
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
            <el-button type="primary" @click="confirmEvent">确 定</el-button>
            <el-button @click="openConfirm = false">取 消</el-button>
       </template>
     </el-dialog>
</template>
<script>
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import { getFinBaseCustomerList, delFinBaseCustomer } from "@/api/szhl/data/FinBaseCustomer";
//导入禁用
const disabled = ref(false);
// 非多个禁用
const multiple = ref(true);
// 非单个禁用
const single = ref(true);
// 选中数组
const ids = ref([]);
//选中的名称
const idNames = ref('');
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
  url: gatewayUrl("/fin-base-customer/import", "performance"),
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
    workDate: null,
    idNo: null,
    customerName: null
  },
  // 表单参数
  form: {},
  rules: {
    workDate: [
      { required: true, message: "请选择授信日期", trigger: "blur" }
    ]
  }
})
const { queryParams, form, rules } = toRefs(data);

const initEffect = (proxy)=>{
    const getList = () => {
        loading.value = true;
        getFinBaseCustomerList(proxy.addDateRange(queryParams.value)).then(res => {
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
        proxy.download("fin-base-customer/importTemplate", {
        }, `非同业客户信息导入模板_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
    }
    const handleImport = ()=>{
        upload.title = "非同业客户信息导入";
        upload.open = true;
        proxy.resetForm("importRef");
    }
    const submitFileForm = ()=>{
        confirmEvent();
    }
     const handleFileUploadProgress =  (event, file, fileList) => {
        upload.isUploading = true;
    }
    const handleFileSuccess = (response, file, fileList) => {
        upload.open = false;
        upload.isUploading = false;
        proxy.$refs["uploadRef"].handleRemove(file);
        proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
        disabled.value = false;
        //getList();
    };
    //确认导入
    const confirmEvent = ()=>{
      disabled.value = true;
      upload.url1 = upload.url ;
      proxy.$refs["uploadRef"].submit();
      openConfirm.value = false;
    }

    const handleExport = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
        if (valid) {
            proxy.download("fin-base-customer/export", {...queryParams.value},`非同业客户信息_${new Date().getTime()}.xlsx`);
            }
        }) 
    }

    //选中事件
    const handleSelectionChange = (selection)=>{
        ids.value = selection;
        idNames.value = selection.map(item => item.customerName);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    //删除
    const handleDelete = () => {
        const nos =  ids.value;
        proxy.$modal.confirm('是否确认删除客户"' + idNames.value + '"的数据项？').then(function () {
            return delFinBaseCustomer(proxy.addDateRange(nos));
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }

    return { handleQuery, resetQuery, importTemplate, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, handleExport, handleSelectionChange, handleDelete }
}
export default {
    name: 'FinBaseCustomer',
    setup() {
         //获取代理对象
         const { proxy } = getCurrentInstance();
         const { getList, handleQuery, resetQuery, importTemplate, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, handleExport, handleSelectionChange, handleDelete } = initEffect(proxy);
         return {  disabled, multiple, single, ids, idNames, loading, openConfirm, dataList,total, getList, handleQuery, resetQuery, queryParams, form, rules, upload, importTemplate, handleImport, submitFileForm, handleFileUploadProgress, 
            handleFileSuccess, handleExport, handleSelectionChange, handleDelete }
    }
}
</script>