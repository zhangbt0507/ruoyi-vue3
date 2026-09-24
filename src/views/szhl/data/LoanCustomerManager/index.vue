<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            <el-form-item label="客户经理" prop="managerId">
                <el-input
                v-model="queryParams.managerId"
                placeholder="请输入客户经理柜员号"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                />
            </el-form-item>
            <el-form-item label="客户号" prop="custId">
                <el-input
                v-model="queryParams.custId"
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

            <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                <el-button
                type="warning"
                plain
                icon="Download"
                @click="handleExport"
                v-hasPermi="['data:loanCustomer:export']"
                >导出</el-button>
            </el-col>
            <span style="color:#F56C6C">
              注意：1.数据来源绩效系统，与大信贷系统无关(T+2) 
              2.汇总口径为网点+内码 
              3.只显示贷款年日均大于0的客户 </span> 
                <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
                <el-table v-loading="loading" :data="dataList">
                    <!-- <el-table-column type="selection"  align="center" /> -->
                    <el-table-column label="考核网点" width="100" align="center" prop="assessOrg" fixed>
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="客户号" width="210" align="center" prop="custId" fixed />
                    <el-table-column label="客户姓名" width="210" align="center" prop="custName" :show-overflow-tooltip="true" fixed/>
                    <el-table-column label="机构类标识" width="100" align="center" prop="jgl"/>
                    <el-table-column label="贷款余额(万元)" width="120" align="center" prop="ye"/>
                    <el-table-column label="贷款年日均(万元)"  width="130" align="center" prop="nrj"/>
                    <el-table-column label="利息收入" width="130" align="center" prop="lxsr"/>
                    <el-table-column label="加权利率"  align="center" prop="jqll"/>
                    <el-table-column label="折后分配年日均(万元)" width="130"  align="center" prop="fphDznrj"/>
                    <el-table-column label="上年末贷款余额(万元)" width="130" align="center" prop="baseYe"/>
                    <el-table-column label="上年末贷款年日均(万元)" width="130"  align="center" prop="baseNrj"/>
                    <el-table-column label="上年末利息收入" width="120" align="center" prop="baseLxsr"/>
                    <el-table-column label="上年末加权利率" width="120" align="center" prop="baseJqll"/>
                    <el-table-column label="上年末折后分配年日均(万元)" width="130" align="center" prop="fphBaseDznrj"/>
                    <el-table-column label="贷款存量绩效" width="120" align="center" prop="cljx"/>
                    <el-table-column label="贷款增量绩效" width="120" align="center" prop="zljx"/>
                    <el-table-column label="利润创造绩效" width="120" align="center" prop="czjx"/>
                    <el-table-column label="利润提升绩效" width="120" align="center" prop="tsjx"/>
                    <el-table-column label="单户总绩效" width="120" align="center" prop="zjx"/>
                    <el-table-column label="分配比例" width="120" align="center" prop="bl"/>
                    <el-table-column label="客户经理" width="120" align="center" prop="managerId">
                        <template #default="scope">
                            <dict-tag :options="sys_user_name" :value="scope.row.managerId"/>{{scope.row.managerId}}
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
         
  </div>
</template>

<script>
import { getLoanCustomerManagerList } from "@/api/szhl/data/LoanCustomer";
// 遮罩层
const loading = ref(false);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 表格数据
const  dataList = ref([]);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    workDate: null,
    custName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ]
    ,
    org: [
      { required: true, message: "请选择查询网点", trigger: "blur" },
    ]
  },
  
})
const { queryParams, form, rules } = toRefs(data);
const handleClickEffect = (proxy) => { 
  const getList = () => {
        loading.value = true;
        // if(queryParams.value.org.length === 7){
        //     queryParams.value.assessOrg = queryParams.value.org.substring(0,5);
        // }else{
        //     queryParams.value.assessOrg = queryParams.value.org;
        // }
        getLoanCustomerManagerList(proxy.addDateRange(queryParams.value)).then(res => {
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
    //导出
    const handleExport = ()=>{
      proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
              proxy.download("loan-customer/manager-export", {
                ...queryParams.value,
              },`客户经理管户明细_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
            }
      })
      
    }
    return { getList, handleQuery, resetQuery, handleExport }
}
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        //报表类型数据字典
        const { sys_org_name, sys_user_name } = proxy.useDict("sys_org_name","sys_user_name");
        
        //事件
        const { getList, handleQuery, resetQuery, handleExport } = handleClickEffect(proxy);
        if(proxy.$route.query.workDate != undefined){
            queryParams.value.workDate = proxy.$route.query.workDate;
            queryParams.value.managerId = proxy.$route.query.managerId;
            getList();
        }
        
        
        return { showSearch, total, dataList, loading, queryParams, form, rules, sys_org_name, sys_user_name, getList, handleQuery, resetQuery, handleExport }
    }
    

}
</script>

<style>

</style>