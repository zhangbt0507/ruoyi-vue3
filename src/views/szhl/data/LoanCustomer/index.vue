<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            
            <el-form-item label="考核机构" prop="org" label-width="80">
                <el-select v-model="queryParams.org"  placeholder="请选择机构"  style="margin-top:-5px">
                  <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                    <span style="float:left">{{item.deptName}}</span>
                    <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                  </el-option>
                </el-select>
          
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
          <el-tab-pane label="贷款客户明细" name="detail">
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
              注意：1.数据来源管理会计系统(T+2) 
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
                    <el-table-column label="折后年日均(万元)" width="130"  align="center" prop="dzhnrj"/>
                    <el-table-column label="上年末贷款余额(万元)" width="130" align="center" prop="baseYe"/>
                    <el-table-column label="上年末贷款年日均(万元)" width="130"  align="center" prop="baseNrj"/>
                    <el-table-column label="上年末利息收入" width="120" align="center" prop="baseLxsr"/>
                    <el-table-column label="上年末加权利率" width="120" align="center" prop="baseJqll"/>
                    <el-table-column label="上年末折后年日均(万元)" width="130" align="center" prop="baseDzhnrj"/>
                    <el-table-column label="贷款增量绩效" width="120" align="center" prop="zljx"/>
                    <el-table-column label="利润创造绩效" width="120" align="center" prop="czjx"/>
                    <el-table-column label="利润提升绩效" width="120" align="center" prop="tsjx"/>
                    <el-table-column label="单户总绩效" width="120" align="center" prop="zjx"/>
                </el-table>
            
            <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
            />
          </el-tab-pane>
          <el-tab-pane label="贷款客户统计" name="total">
                <el-table v-loading="loading" :data="dataSumList" stripe>
                    <el-table-column label="考核网点" width="150" align="center" prop="assessOrg">
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="贷款指标绩效与利润指标绩效总计" width="200"  align="center" prop="zjx" />
                    
                </el-table>
          </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import { getLoanCustomerList, getLoanCustomerSum } from "@/api/szhl/data/LoanCustomer";
import { listDeptAssess } from "@/api/system/dept";
const orgs = ref([]);
const org = ref();
// 遮罩层
const loading = ref(false);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 表格数据
const  dataList = ref([]);
//汇总表格数据
const dataSumList = ref([]);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    workDate: null,
    tAcctNo: null,
    custName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ],
    queryVal: [
      { required: true, message: "请选择查询层级", trigger: "blur" },
    ]
    ,
    org: [
      { required: true, message: "请选择查询网点", trigger: "blur" },
    ]
  },
  // 表单参数
  depositForm: {},
  
})
const { queryParams, form, rules, depositForm, depositRules } = toRefs(data);
const activeName = ref('detail')
const handleClickEffect = (proxy) => { 
  const getList = () => {
        loading.value = true;
        if(queryParams.value.org.length === 7){
            queryParams.value.assessOrg = queryParams.value.org.substring(0,5);
        }else{
            queryParams.value.assessOrg = queryParams.value.org;
        }
        getLoanCustomerList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
        getLoanCustomerSum(proxy.addDateRange(queryParams.value)).then(res => {
            dataSumList.value = res.data;
        });
    }
    //查询
    const handleQuery = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
                queryParams.value.pageNum = 1;
                getList();
            }
        }
    )}
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryForm");
        handleQuery();
    }
    //导出
    const handleExport = ()=>{
      proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
              proxy.download("loan-customer/export", {
                ...queryParams.value,
              },`贷款客户明细_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
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
        const { sys_org_name } = proxy.useDict("sys_org_name");
         //获取部门
        listDeptAssess().then(res => {
            orgs.value = res.data;
            org.value = res.data[0]?.code;
        });
        //事件
        const { getList, handleQuery, resetQuery, handleExport } = handleClickEffect(proxy);
        if(proxy.$route.query.workDate != undefined){
            queryParams.value.workDate = proxy.$route.query.workDate;
            queryParams.value.org = proxy.$route.query.assessOrg;
            getList();
        }
        
        
        return { orgs, org, showSearch, total, dataList, dataSumList, loading, queryParams, form, rules, sys_org_name, activeName, getList, handleQuery, resetQuery, handleExport }
    }
    

}
</script>