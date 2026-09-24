<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :rules="rules" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                    <el-date-picker v-model="queryParams.workDate" format="YYYYMMDD" value-format="YYYYMMDD" placeholder="请选择数据日期" style="width: 240px"></el-date-picker>
                </el-form-item>
                <el-form-item label="发放日期" prop="rate" >
                    <el-tooltip content="大于发放日期小于数据日期" placement="top" >
                        <el-icon class="tip"><question-filled /></el-icon>
                    </el-tooltip>
                    <el-date-picker v-model="queryParams.grantDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="请选择发放日期" style="width: 240px"></el-date-picker>
                </el-form-item>
            <el-form-item label="利率" prop="rate">
                <el-tooltip content="小于等于" placement="top" >
                        <el-icon class="tip"><question-filled /></el-icon>
                    </el-tooltip>
                    <el-input
                        v-model="queryParams.rate"
                        placeholder="请输入利率"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                 <el-form-item label="发放天数" prop="days">
                    <el-tooltip content="大于等于" placement="top" >
                        <el-icon class="tip"><question-filled /></el-icon>
                    </el-tooltip>
                    <el-input
                        v-model="queryParams.days"
                        placeholder="请输入贷款天数"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                
                <el-form-item label="控股类型" prop="holdType">
                    <el-tooltip content="反选(不包含)" placement="top" >
                        <el-icon class="tip"><question-filled /></el-icon>
                    </el-tooltip>
                    <el-select v-model="queryParams.holdType" multiple collapse-tags collapse-tags-tooltip placeholder="请选择控股类型" style="width: 240px">
                    
                      <el-option  v-for="dict in enterprise_hold_type"
                            :key="dict.value"
                            :label="dict.value+dict.label"
                            :value="dict.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="用途代码" prop="loanUseCode">
                    <el-tooltip content="反选(不包含)" placement="top" >
                        <el-icon class="tip"><question-filled /></el-icon>
                    </el-tooltip>
                    <el-select v-model="queryParams.loanUseCode" multiple collapse-tags collapse-tags-tooltip placeholder="请选择贷款用途" style="width: 240px">
                      <el-option  v-for="dict in loan_use_code"
                            :key="dict.value"
                            :label="dict.value+dict.label"
                            :value="dict.value"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item label="贷款合同号" prop="loanContractNo">
                    <el-input
                        v-model="queryParams.loanContractNo"
                        placeholder="请输入贷款合同号"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item> -->
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
                        icon="Download"
                        @click="handleExport()"
                        v-hasPermi="['loan:query:export']"
                    >导出</el-button>
                  
               </el-col>
               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="reLoanDataList" @selection-change="handleSelectionChange" style="width:100%" :row-class-name="tableRowClassName">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="统一社会信用代码" width="190" align="center" key="code" prop="code" class-name="success-row" :show-overflow-tooltip="true" />
               <el-table-column label="客户名称" width="230" align="center" key="customerName" prop="customerName"  :show-overflow-tooltip="true" />
               <el-table-column label="客户号" width="210" align="center" key="custId" prop="custId"  :show-overflow-tooltip="true" />
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
            </el-table>
            <pagination
               v-show="total > 0"
               :total="total"
               v-model:page="queryParams.pageNum"
               v-model:limit="queryParams.pageSize"
               @pagination="getList"
            />
    </div>
</template>
<style lang="scss">
.tip{
    margin-left: -10px;
}
.el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
<script>
import { getLoanDetailList } from "@/api/szhl/reloan/ReLoanDetail";
const showSearch = ref(true);
const total = ref(0);
const loading = ref(false);
const reLoanDataList = ref([]);
const multiple = ref(true);
const title = ref("");
const open = ref(false);
const data = reactive({
    form: {
         enable:ref(false)
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        loanContractNo: undefined,
        workDate: undefined,
        grantDate: undefined,
        rate: undefined,
        days: undefined,
        loanUseCode: undefined,
        holdType: undefined
    },
     // 表单校验
  rules: {
    workDate: [
      { required: true, message: "数据日期不能为空", trigger: "blur" }
    ]
  }
});
const { queryParams, form, rules } = toRefs(data);
const handleInitEffect = ( proxy ) =>{
    const defaultSet =()=>{
        queryParams.value.holdType=['1','2'];
        queryParams.value.loanUseCode=['121','122','141','142','145','146','149','151','152','153','154','159'];
    }
    //获取数据
    const getList = ()=>{
        loading.value = true;
        getLoanDetailList(proxy.addDateRange(queryParams.value)).then(res => {
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

    const handleExport = ()=>{
        proxy.download("reLoan/export", {
            ...queryParams.value,
        },`贷款数据_${new Date().getTime()}.xlsx`);
    }
    const handleSelectionChange = ()=>{

    }
    const tableRowClassName = ({row,rowIndex})=>{
        
       if(row.reLoanSubmitMonth !='' && row.reLoanSubmitMonth != undefined && row.reLoanSubmitMonth != null){
         return 'success-row';
       }
    }
    return { defaultSet, getList, handleQuery, resetQuery, handleExport, handleSelectionChange, tableRowClassName }
}


export default {
    setup() {
        //获取代理对象
        const { proxy } = getCurrentInstance(); 
        const { defaultSet, getList, handleQuery, resetQuery, handleExport, handleSelectionChange, tableRowClassName } = handleInitEffect(proxy);
        //数据字典
        const { loan_use_code,enterprise_hold_type } = proxy.useDict("loan_use_code","enterprise_hold_type");
        defaultSet();
        //getList();
         return { showSearch, total, loading, queryParams, form, rules, reLoanDataList, getList, handleQuery, resetQuery, handleExport, handleSelectionChange, tableRowClassName, loan_use_code, enterprise_hold_type }
    },
}
</script>