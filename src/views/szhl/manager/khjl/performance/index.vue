<template>
<div class="app-container">
    <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            <el-form-item label="柜员号" prop="managerId">
                <el-input
                v-model="queryParams.managerId"
                placeholder="请输入柜员号"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                :disabled = "disabled"
                />
            </el-form-item>
            
            <el-form-item>
                <el-button type="primary" icon="Search"  @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh"  @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

     <el-tabs type="card" v-model="activeName" >
            <div class="title" v-show="user.userName">
                考核网点：<div class="title_org"><dict-tag :options="sys_org_name" :value="user.assessOrg"/></div> ,
                <div class="title_context"> 柜员号：{{user.userName}},</div>
                <div class="title_context"> 姓名：{{user.nickName}}</div>
            </div>
            <el-tab-pane label="个人业绩绩效" name="jx" >
                <el-button
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handlePerClick"
                >贷款业绩关系查询</el-button>
                <el-table :data="dataList" v-loading="loading" stripe size="small" show-summary :summary-method="getSummaries">
                    <el-table-column label="业务考核指标" align="center" prop="zbmc" width="200" />
                    <el-table-column label="存量绩效" align="center" prop="cljx"   width="150"/>
                    <el-table-column label="增量绩效" align="center" prop="zljx"   width="150"/>
                    <el-table-column label="总绩效" align="center" prop="zjx"   width="150"/>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="履职考核得分" name="lz" >
                <el-table :data="assessManagerList" v-loading="loading" stripe size="small" show-summary :summary-method="getSummariesLz">
                    <el-table-column label="指标名称" align="center" prop="zbmc" width="200" >
                        <template #default="scope">
                            <router-link :to="'/szhl/report-data/index/' + scope.row.zbmc +'/' + user.assessOrg +'/' + queryParams.workDate+'/' + queryParams.managerId" v-if="scope.row.link === '0'" class="link">
                                <span>{{ scope.row.zbmc }}</span>
                            </router-link>
                            <span v-if="scope.row.link != '0'">{{ scope.row.zbmc }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="基准分值" align="center" prop="jbf"   width="150"/>
                    <el-table-column label="目标任务(万元/户/目标值)" align="center" prop="rws"   width="200"/>
                    <el-table-column label="报告期" align="center" prop="zl"   width="150"/>
                    <el-table-column label="完成比/与目标的差值" align="center" prop="wcb"   width="150" >
                        <template #default="scope">
                            <div v-if="scope.row.mode==='0'">
                                {{(scope.row.wcb*100).toFixed(2)}}%
                            </div>
                            <div v-else>
                                {{(scope.row.wcb*1)}}
                            </div>
                        </template>
                    </el-table-column>
                    
                    <el-table-column label="得分" align="center" prop="df"   width="150"/>
                </el-table>
                <!-- 以下指标由指标管理部门手工统计导入 -->
                <br/>   
                <div style="color:red;margin-bottom:5px">以下指标由指标管理部门手工统计导入</div>
                <el-table :data="impAssessManagerList" v-loading="loading" stripe size="small" show-summary :summary-method="getSummariesLz">
                    <el-table-column label="指标" align="center" prop="zbmc" width="200" />
                    <el-table-column label="基准分值" align="center" prop="jbf"   width="150"/>
                    <el-table-column label="任务" align="center" prop="rws"   width="150"/>
                    <el-table-column label="报告期(万元/户/率)" align="center" prop="zl"   width="150"/>
                    <el-table-column label="完成比" align="center" prop="wcb"   width="150">
                        <template #default="scope">
                            {{(scope.row.wcb*100).toFixed(2)}}%
                        </template>
                    </el-table-column>
                    <el-table-column label="得分" align="center" prop="df"   width="150"/>
                    <el-table-column label="更新日期" align="center" prop="workDate"   width="150"/>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="万家行2.0" name="visit">
                
                <visitTwo :loading="loading" :data="visitTwoList" 
                :assignData="visitTwoList2" 
                :assessOrg="users.assessOrg" 
                :workDate="queryParams.workDate" 
                :managerId="queryParams.managerId"
                :dataScope="dataScope"/>
            </el-tab-pane>
     </el-tabs>  
</div>       
</template>
<script>
import visitTwo from '../special/visitTwo.vue';
import { getStaffInfo } from "@/api/szhl/jxkh/staff";
import { getPerformance } from "@/api/szhl/jxkh/performance";
import { getManagerLz, getImpManagerLz, getVisitTwoResultList } from "@/api/szhl/agency/assess";
import { dataScopeByMenuRole2 } from "@/api/system/user";
import { getUserProfile, userListByUserName } from "@/api/system/user";
const dataScope = ref('');
const disabled = ref(false);
const users = ref([]);
// 遮罩层
const loading = ref(false);
// 显示搜索条件
const showSearch = ref(true);
// 表格数据
const  dataList = ref([]);
// 表格数据
const  assessManagerList = ref([]);
// 表格数据
const  impAssessManagerList = ref([]);
// 表格数据
const  visitTwoList = ref([]);
// 表格数据
const  visitTwoList2 = ref([]);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    workDate: null,
    managerId: null
  },
  // 表单校验
  rules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ],
    managerId: [
      { required: true, message: "请输入柜员号", trigger: "blur" },
    ]
  } 
});
const user = reactive({
      userName:'',
      nickName:'',
      assessOrg:''
  });
const { queryParams, rules } = toRefs(data);
const activeName = ref('jx');

const initEffect = (proxy) => {
    const getUserInfo = () =>{
        getStaffInfo(queryParams.value.managerId,queryParams.value.workDate).then(res => {
            user.userName = res.data.staffNo;
            user.nickName = res.data.staffName;
            user.assessOrg = res.data.assessOrg;
            
        });
    }
    const getPerformanceList = () => {
        loading.value = true;
        getPerformance(queryParams.value.managerId,queryParams.value.workDate).then(res => {
            dataList.value = res.data;
            loading.value = false;
        });
        
    }
    const getAssessManagerList = () => {
        getManagerLz(queryParams.value.managerId,queryParams.value.workDate).then(res => {
            assessManagerList.value = res.data;
        });
        getImpManagerLz(queryParams.value.managerId,queryParams.value.workDate).then(res => {
            impAssessManagerList.value = res.data;
        });
    }
    const getAssessVisitList = () => {
        getVisitTwoResultList(queryParams.value.managerId,queryParams.value.workDate,'visit_assess').then(res => {
            visitTwoList.value = res.data;
        });
        getVisitTwoResultList(queryParams.value.managerId,queryParams.value.workDate,'visit2_assess').then(res => {
            visitTwoList2.value = res.data;
        });
    }
    //查询
    const handleQuery = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
            if(dataScope.value == 4){
                if(users.value.filter(u =>u.userName == queryParams.value.managerId).length<=0){
                    proxy.$modal.alert("该客户经理不在管辖权限范围！");
                    return;
                }
            }
            if (valid) {
                getUserInfo();
                getPerformanceList();
                getAssessManagerList();
                getAssessVisitList();
            }
        }
    )}
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryForm");
        handleQuery();
    }
    //合计行处理
        const getSummaries = (param) => {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if(index === 0){
                    sums[index] = '合计';
                    return;
                }
                
                if(index === 3){
                    if(column.property === 'zjx'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev) + parseFloat(curr)).toFixed(2);
                        },0);
                    }
                    return;
                }
                

            });
           
            return sums;
        } 
        //合计行处理
        const getSummariesLz = (param) => {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if(index === 0){
                    sums[index] = '合计';
                    return;
                }
                
                if(index === 5){
                    if(column.property === 'df'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev) + parseFloat(curr)).toFixed(2);
                        },0);
                    }
                    return;
                }
                

            });
            
            return sums;
        }     
    //查询客户经理个人贷款业绩关系
    const handlePerClick = () => {
        proxy.$router.push({path: "/assess/loan-customer-manager",query: {workDate: queryParams.value.workDate, managerId: queryParams.value.managerId}});
    }
    return { getPerformanceList, handleQuery, resetQuery, getSummaries, handlePerClick, getSummariesLz }
}

export default {
    components: { visitTwo },
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const { sys_org_name } = proxy.useDict("sys_org_name");
        const { handleQuery, resetQuery, getSummaries, handlePerClick, getSummariesLz } = initEffect(proxy);
        
        dataScopeByMenuRole2('data:loanCustomerManager:list').then(response => {
                dataScope.value = response.data.dataScope;
                //本人数据权限
                if(response.data.dataScope === '5'){
                    disabled.value = true;
                     getUserProfile().then(res => {
                        if(proxy.$route.query.workDate != undefined && proxy.$route.query.managerId != undefined){
                            queryParams.value.workDate = proxy.$route.query.workDate;
                            queryParams.value.managerId = res.data.userName;
                            activeName.value = proxy.$route.query.activeName
                        }
                });
                }else if(response.data.dataScope === '4'){
                    userListByUserName().then(res =>{
                        users.value = res.data;
                    });
                    if(proxy.$route.query.workDate != undefined && proxy.$route.query.managerId != undefined){
                        queryParams.value.workDate = proxy.$route.query.workDate;
                        queryParams.value.managerId = proxy.$route.query.managerId;
                        activeName.value = proxy.$route.query.activeName
                    }
                }else{
                    if(proxy.$route.query.workDate != undefined && proxy.$route.query.managerId != undefined){
                        queryParams.value.workDate = proxy.$route.query.workDate;
                        queryParams.value.managerId = proxy.$route.query.managerId;
                        activeName.value = proxy.$route.query.activeName
                    }
                }
            });
        
        
        return { dataScope, users, disabled, loading, showSearch, dataList, queryParams, rules, activeName, handleQuery, resetQuery, getSummaries, sys_org_name, handlePerClick,
             assessManagerList, getSummariesLz, impAssessManagerList, user, visitTwoList, visitTwoList2 }
    }
}
</script>
<style scoped lang="scss">
.title{
    white-space: nowrap;
    margin-bottom: 5px;
    &_org{
      display:inline-block;
      margin-left: 5px;
    }
    &_context{
      display:inline-block;
      margin-left: 10px;
    }
}
.link{
    color: #409eff;
    cursor: pointer;
}
</style>