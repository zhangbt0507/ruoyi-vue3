<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            <el-form-item label="考核机构" prop="org">
                <el-select v-model="queryParams.org" clearable filterable placeholder="请选择考核机构"  style="width:240px" >
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
            </el-form-item>
            <el-form-item label="账号" prop="tAcctNo">
                <el-input
                v-model="queryParams.tAcctNo"
                placeholder="请输入账号"
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
          <el-tab-pane label="存款明细" name="detail">
            <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                <el-button
                type="warning"
                plain
                icon="Download"
                @click="handleExport"
                v-hasPermi="['data:deposit:export']"
                >导出</el-button>
            </el-col>
            <span style="color:#F56C6C">注意：1.数据来源管理会计系统(T+2) 2.线上存款默认考核机构为账号开户日营销柜员所在网点 3.利率为根据应付利息倒算的利率 4.只显示年日均大于0的账号 </span> 
                <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
                <el-table v-loading="loading" :data="dataList">
                    <!-- <el-table-column type="selection"  align="center" /> -->
                    <el-table-column label="考核网点" width="120" align="center" prop="assessOrg" fixed>
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="归属网点" width="120" align="center" prop="acctOrgCd" fixed>
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.acctOrgCd"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="客户号" width="210" align="center" prop="custId" fixed/>
                    <el-table-column label="客户姓名" width="210" align="center" prop="custName" :show-overflow-tooltip="true"  fixed/>
                    <el-table-column label="账号" width="220"  align="center" prop="tacctNo"/>
                    <el-table-column label="年日均(万元)"   align="center" prop="nrj"/>
                    <el-table-column label="余额(万元)"  align="center" prop="curBal"/>
                    <el-table-column label="起息日"  align="center" prop="startDt"/>
                    <el-table-column label="到期日"  align="center" prop="maturityDt"/>
                    <el-table-column label="利率"  align="center" prop="ll"/>
                    <el-table-column label="机构类标识"  align="center" prop="jgl"/>
                </el-table>
            
            <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
            />
          </el-tab-pane>
          <el-tab-pane label="存款统计" name="total">
                <el-table v-loading="loading" :data="dataSumList"  stripe show-summary :summary-method="getSummaries">
                     <el-table-column label="考核网点" width="150" align="center" prop="dept_id">
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.dept_id"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="账号类型" width="150" align="center" prop="jgl"/>
                    <el-table-column label="收益类型" width="150"  align="center" prop="cbType"/>
                    <el-table-column label="基期" width="150"  align="center" prop="jq">
                        <template #default="scope">
                            {{(parseFloat(scope.row.jq)).toFixed(0)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="报告期" width="150"  align="center" prop="bgq">
                        <template #default="scope">
                            {{(parseFloat(scope.row.bgq)).toFixed(0)}}
                        </template>
                    </el-table-column>
                     <el-table-column label="增量" width="150"  align="center" prop="zl">
                         <template #default="scope">
                            {{(parseFloat(scope.row.zl)).toFixed(0)}}
                        </template>
                     </el-table-column>
                     <el-table-column label="单价" width="150"  align="center" prop="dj"></el-table-column>
                     <el-table-column label="预计薪酬" width="150"  align="center" prop="xc">
                         <template #default="scope">
                            {{(parseFloat(scope.row.xc)).toFixed(0)}}
                        </template>
                     </el-table-column>
                </el-table>
          </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { getDepositList, getSumDepositList } from "@/api/szhl/data/deposit";
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
    org: null,
    assessOrg: null,
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
        getDepositList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
        getSumDepositList(proxy.addDateRange(queryParams.value)).then(res => {
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
              proxy.download("deposit/export", {
                ...queryParams.value,
              },`存款账户明细_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
            }
      })
      
    }
    //合计
    //合计行处理
        const getSummaries = (param) => {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if(index === 0){
                    sums[index] = '合计';
                    return;
                }
                if(index === 7){
                    if(column.property === 'xc'){
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
    return { getList, handleQuery, resetQuery, handleExport, getSummaries }
}
  
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        
        
        //报表类型数据字典
        const { sys_org_name, account_status } = proxy.useDict("sys_org_name","account_status");
        //事件
        const { getList, handleQuery, resetQuery, handleExport, getSummaries } = handleClickEffect(proxy);  
        if(proxy.$route.query.workDate != undefined){
            queryParams.value.workDate = proxy.$route.query.workDate;
            queryParams.value.org = proxy.$route.query.assessOrg;
            getList();
        }
        return { showSearch, total, dataList, dataSumList, loading, queryParams, form, rules, depositForm, depositRules, sys_org_name,
         account_status, getList, activeName, handleQuery, resetQuery, handleExport, getSummaries }
    }
    

}
</script>