<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            <el-form-item label="考核机构" prop="assessOrg">
                <el-select v-model="queryParams.assessOrg" clearable filterable placeholder="请选择考核机构"  style="width:240px" >
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
            </el-form-item>
            <el-form-item label="客户号" prop="custNo">
                <el-input
                v-model="queryParams.custNo"
                placeholder="请输入客户号"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                />
            </el-form-item>
            <el-form-item label="客户名称" prop="custName">
                <el-input
                v-model="queryParams.custName"
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
        <el-tabs type="card" v-model="activeName">
          <el-tab-pane label="线上存款明细" name="detail">
            <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    type="primary"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleChange"
                    v-hasPermi="['OnlineDeposit:OnlineDeposit:change']"
                >账号机构变更</el-button>
                </el-col>
                <el-col :span="1.5">
                <el-button
                type="warning"
                plain
                icon="Download"
                @click="handleExport"
                v-hasPermi="['OnlineDeposit:OnlineDeposit:export']"
                >导出</el-button>
            </el-col>
            <span style="color:#F56C6C">注意：线上存款默认考核机构为账号开户日营销柜员所在网点</span> 
                <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
                <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
                    <el-table-column type="selection"  align="center" />
                    <el-table-column label="客户号" width="190" align="center" prop="custNo" />
                    <el-table-column label="客户姓名" width="100" align="center" prop="custName" />
                    <el-table-column label="营销客户经理" width="120" align="center" prop="custMangager"/>
                    <el-table-column label="客户经理名称" width="120" align="center" prop="custMangagerName"/>
                    <el-table-column label="考核网点" width="120" align="center" prop="assessOrg">
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="存款产品ID" width="180"  align="center" prop="productId"/>
                    <el-table-column label="存款产品名称" width="190" align="left" prop="productName" >
                    <template #default="scope">
                        <dict-tag :options="deposit_product" :value="scope.row.productName"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="账号" width="220"  align="center" prop="depositAccount"/>
                    <el-table-column label="开户日期"   align="center" prop="openDate"/>
                    <el-table-column label="年日均"   align="center" prop="depositYearDailyaverage"/>
                    <el-table-column label="月日均"   align="center" prop="yrj"/>
                    <el-table-column label="余额"  align="center" prop="curBalance"/>
                    <el-table-column label="账户状态" width="100"  align="center" prop="accountStatus">
                        <template #default="scope">
                        <dict-tag :options="account_status" :value="scope.row.accountStatus"/>
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
          </el-tab-pane>
          <el-tab-pane label="线上存款统计" name="total">
                <el-table v-loading="loading" :data="dataSumList" show-summary :summary-method="getSummaries" stripe height="700" >
                    <el-table-column label="考核网点" width="150" align="center" prop="assessOrg">
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="年日均" width="150"  align="center" prop="depositYearDailyaverage"/>
                    <el-table-column label="余额" width="150" align="center" prop="curBalance"/>
                </el-table>
          </el-tab-pane>
        </el-tabs>
        
  
    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="750px" append-to-body >
      <el-form ref="depositRef" :model="depositForm" :rules="depositRules" label-width="80px" inline>
        <el-form-item label="账号" prop="depositAccount">
          <el-input v-model="depositForm.depositAccount" placeholder="请输入账号"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="原考核网点" prop="assessOrgFrom" label-width="90">
          <el-select v-model="depositForm.assessOrgFrom" placeholder="请输入考核网点"  style="width:210px" :disabled="disabled">
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
       
        <el-form-item label="客户号" prop="postNo" >
          <el-input v-model="depositForm.custNo" placeholder="请输入客户号" :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="客户名称" prop="postName"  >
          <el-input v-model="depositForm.custName" placeholder="请输入客户名称" :disabled="disabled" style="width:220px" />
        </el-form-item>
        
        <el-form-item label="新考核网点" prop="assessOrgTo"  label-width="92" >
          <el-select v-model="depositForm.assessOrgTo" filterable placeholder="请选择新考核网点"  style="width:210px" >
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
              :disabled="depositForm.assessOrgFrom == dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
         
        
      </el-form>
      
      <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
    </el-dialog>
      </div>
</template>

<script>
import { getOnlineDepositList, getOnlineDeposit, addOnlineDepositChange, getSumOnlineDepositList } from "@/api/szhl/data/OnlineDeposit";
// 遮罩层
const loading = ref(false);
// 非单个禁用
const disabled = ref(false);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 表格数据
const  dataList = ref([]);
//汇总表格数据
const dataSumList = ref([]);
// 弹出层标题
const title = ref('');
// 是否显示弹出层
const open = ref(false);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    workDate: null,
    custNo: null,
    custName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ]
  },
  // 表单参数
  depositForm: {},
  // 表单校验
  depositRules: {
    assessOrgTo: [
      { required: true, message: "新考核网点必填", trigger: "blur" },
    ]
  }
})
const { queryParams, form, rules, depositForm, depositRules } = toRefs(data);
const accountNo = ref('');
const activeName = ref('detail')
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
     //查询
    const handleQuery = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
                queryParams.value.pageNum = 1;
                getList();
            }
        }
    )
}
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryForm");
        handleQuery();
    }
    //获取数据
    const getList = ()=>{
        loading.value = true;
        getOnlineDepositList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
        getSumOnlineDepositList(proxy.addDateRange(queryParams.value)).then(res => {
            dataSumList.value = res.data;
        });
    } 
    //选中事件
    const handleSelectionChange = (selection)=>{
        accountNo.value = selection.map(item => item.depositAccount);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    //机构变更
    const handleChange = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
                open.value = true;
                title.value = '考核机构变更'
                getOnlineDeposit(accountNo.value,queryParams.value.workDate).then(res => {
                    depositForm.value = res.data;
                    disabled.value = true;
                });
            }
        })
        
    }
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }

     //重置
    const reset = ()=>{
      depositForm.value = {
        depositAccount: undefined,
        custName: undefined,
        custNo: undefined,
        assessOrgFrom: undefined,
        assessOrgTo: undefined,
        status: undefined
      };
      proxy.resetForm("");
    }
    //修改
    const submitForm = ()=>{
        proxy.$refs["depositRef"].validate(valid => {
          if (valid) {
            addOnlineDepositChange(depositForm.value).then(res => {
                proxy.$modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
        }
     });
    }
    //导出
    const handleExport = ()=>{
      proxy.download("OnlineDeposit/export", {
        ...queryParams.value,
      },`线上存款_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
    }
    return { getList, handleQuery, resetQuery, handleSelectionChange, handleChange, cancel, submitForm, handleExport }
   }
    //合计事件
    const handSumEffect = () => {
         //合计行处理
        const getSummaries = (param) => {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if(index === 0){
                    sums[index] = '合计';
                    return;
                }
                if(index === 1){
                    if(column.property === 'depositYearDailyaverage'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                if(index === 2){
                    if(column.property === 'curBalance'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                

            });
            return sums;
        }
        return getSummaries;
    }
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        //报表类型数据字典
        const { sys_org_name, account_status, deposit_product } = proxy.useDict("sys_org_name","account_status","deposit_product");
        const { getList, handleQuery, resetQuery, handleSelectionChange, handleChange, cancel, submitForm, handleExport } = handleClickEffect(proxy);
        const { getSummaries } = handSumEffect();
        return { loading, disabled, single, multiple, showSearch, total, sys_org_name, account_status, deposit_product, dataList, dataSumList, title, open, data, queryParams, form, activeName, rules, getList, handleQuery, resetQuery,
        handleSelectionChange, handleChange, cancel, depositForm, depositRules, submitForm, handleExport, getSummaries }
    }
    

}
</script>

<style>

</style>