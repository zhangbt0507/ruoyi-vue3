<template>
    <el-card class="box-card">
        <template #header>
            <div class="header">
                <!-- <div >
                    <el-button type="default" size="large" class="but"   :disabled="disabledLz" @click="handleClickLz">履职考核指标</el-button>
                    <el-button type="default" size="large" class="but"   :disabled="disabledCk" @click="handleClickCk">存款指标绩效</el-button>
                    <div class="header_right">
                        <el-link type="primary" :underline="false" @click="showMore">查看详情</el-link>
                    </div>
                </div>  -->
                2025年度考核
            </div>
        </template>
        <el-tabs type="card" v-model="activeName" >
            <el-tab-pane label="得分排名" name="pm" v-if="assessRoles.includes(roleSelect)">
                <el-row :gutter="10">
                    <el-col :span="8">
                    <el-table :data="orgRankZh" v-loading="orgRankLoanding" stripe size="small">
                    <el-table-column label="机构名称" align="center" prop="org">
                        <template #default="scope">
                            <el-link type="primary" :underline="false" @click="handleOrgClick(scope.row.org)"><dict-tag :options="sys_org_name" :value="scope.row.org" /></el-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="得分" align="center" prop="score">
                        <template #default="scope">
                            {{parseFloat(scope.row.score).toFixed(2)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="支行排名" align="center" prop="df">
                        <template #default="scope">
                            {{scope.$index+1}}
                        </template>
                    </el-table-column>
                </el-table>
                </el-col>
                <el-col :span="8">
                    <el-table :data="orgRankWdTop" v-loading="orgRankLoanding" stripe size="small">
                    <el-table-column label="机构名称" align="center" prop="org">
                        <template #default="scope">
                            <el-link type="primary" :underline="false" @click="handleOrgClick(scope.row.org)"><dict-tag :options="sys_org_name" :value="scope.row.org" /></el-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="得分" align="center" prop="score">
                        <template #default="scope">
                            {{parseFloat(scope.row.score).toFixed(2)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="网点排名" align="center" prop="df">
                        <template #default="scope">
                            {{scope.$index+1}}
                        </template>
                    </el-table-column>
                </el-table>
                </el-col>
                <el-col :span="8">
                    <el-table :data="orgRankWdEnd" v-loading="orgRankLoanding" stripe size="small">
                    <el-table-column label="机构名称" align="center" prop="org">
                        <template #default="scope">
                            <el-link type="primary" :underline="false" @click="handleOrgClick(scope.row.org)"><dict-tag :options="sys_org_name" :value="scope.row.org" /></el-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="得分" align="center" prop="score">
                        <template #default="scope">
                            {{parseFloat(scope.row.score).toFixed(2)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="网点排名" align="center" prop="df">
                        <template #default="scope">
                            {{scope.$index+1+11}}
                        </template>
                    </el-table-column>
                </el-table>
                </el-col>
                </el-row>
            </el-tab-pane>
          <el-tab-pane label="履职考核指标" name="lz">
             <el-row>
                <div class="header">
                <div class="header_left">总得分(存贷款利润指标T+2,客户类指标T+1)：{{(parseFloat(score1)+parseFloat(score2)).toFixed(2)}}</div>
                <div class="header_right">
                        <el-link type="primary" :underline="false" @click="showMore">查看详情</el-link>
                </div>
                </div>
            </el-row>
            <el-row :gutter="10">
            <el-col :span="12">
                <el-table :data="data" v-loading="loanding" stripe size="small">
                <el-table-column label="指标名称(按日统计)" prop="zbmc">
                    <template #default="scope">
                        <router-link :to="'/szhl/report-data/index/' + scope.row.zbmc +'/' + org +'/' + workDate+'/907000'" v-if="scope.row.link === '0'" class="link">
                            <span>{{ scope.row.zbmc }}</span>
                        </router-link>
                        <span v-if="scope.row.link != '0'">{{ scope.row.zbmc }}</span>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="基期" align="center" prop="jq">
                    <template #default="scope">
                        {{parseFloat(scope.row.jq).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="报告期" align="center" prop="bgq">
                    <template #default="scope">
                        {{parseFloat(scope.row.bgq).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="增量" align="center" prop="zl">
                    <template #default="scope">
                        {{parseFloat(scope.row.zl).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="任务数" align="center" prop="rws">
                    <template #default="scope">
                        {{parseFloat(scope.row.rws).toLocaleString()}}
                    </template>
                </el-table-column> -->
                <el-table-column label="基本分" align="center" prop="jbf"></el-table-column>
                <el-table-column label="完成比" align="center" prop="wcb">
                    <template #default="scope"  >
                       {{parseFloat(scope.row.wcb*100).toFixed(2)}}%
                        
                    </template>
                    
                </el-table-column>
                <el-table-column label="得分" align="center" prop="df">
                    <template #default="scope">
                        {{scope.row.df}}
                    </template>
                </el-table-column>
            </el-table>
            </el-col>
            <el-col :span="12">
                <el-table :data="modeData" v-loading="modeLoanding" stripe size="small">
                <el-table-column label="指标名称(按月统计)" prop="zbmc">
                    <template #default="scope">
                        <router-link :to="'/szhl/report-data/index/' + scope.row.zbmc +'/' + org +'/' + workDate+'/907000' " v-if="scope.row.link === '0'" class="link">
                            <span  >{{ scope.row.zbmc }}</span>
                            <!-- <span v-else style="background-color:red">{{ scope.row.zbmc }}</span> -->
                        </router-link>
                        <span v-if="scope.row.link != '0' && scope.row.workDate==null" style="color:red">{{ scope.row.zbmc }}</span>
                        <span v-if="scope.row.link != '0' && scope.row.workDate!=null" >{{ scope.row.zbmc }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="基本分" align="center" prop="jbf"></el-table-column>
                <el-table-column label="完成比" align="center" prop="wcb">
                    <template #default="scope">
                         {{parseFloat(scope.row.wcb*100).toFixed(2)}}%
                    </template>
                </el-table-column>
                <el-table-column label="得分" align="center" prop="df">
                    <template #default="scope">
                        {{scope.row.df}}
                    </template>
                </el-table-column>
            </el-table>
            </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="存款指标绩效" name="ck">
            <el-row>
            <div class="header">
                <div class="header_left">预计薪酬合计：{{ scoreCk.toFixed(0) }}</div>
                <div class="header_right">
                        <el-link type="primary" :underline="false" @click="showMore">查看详情</el-link>
                </div>
            </div>
            </el-row>
            <el-table v-loading="depositSumListLoanding" :data="depositSumList"  stripe height="700" :span-method="arraySpanMethod">
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
          <el-tab-pane label="贷款指标绩效" name="dk">
            <el-row>
            <div class="header">
                <div class="header_left">预计薪酬合计：{{ scoreDk.toFixed(2) }}</div>
                <div class="header_right">
                        <el-link type="primary" :underline="false" @click="showMore">查看详情</el-link>
                </div>
            </div>
            </el-row>
            <el-table v-loading="LoanSumListLoanding" :data="LoanSumList">
                    <!-- <el-table-column type="selection"  align="center" /> -->
                    <el-table-column label="考核网点" width="100" align="center" prop="assessOrg">
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                    </el-table-column>
                    <el-table-column label="贷款增量效益总绩效" width="210" align="center" prop="zjx" />
                    
                </el-table>
          </el-tab-pane>
          
        </el-tabs>
       
    </el-card>
</template>
<script>
import { selectSumAssess, selectModeSumAssess, getOrgScoreRank, getOrgScoreRankWd } from "@/api/szhl/agency/assess";
import { getSumDepositList } from "@/api/szhl/data/deposit";
import { getLoanCustomerSum } from "@/api/szhl/data/LoanCustomer";
import { getUserProfile } from "@/api/system/user";
const date = ref('');
const assessOrg = ref('');
const activeName = ref("")
const score1 = ref(0);
const score2 = ref(0);
const scoreCk = ref(0);
const scoreDk = ref(0);
const data = ref([]);
const modeData = ref([]);
const loanding = ref(false);
const modeLoanding = ref(false);
//存款绩效
const depositSumListLoanding = ref(false);
const depositSumList = ref([])
//贷款绩效
const LoanSumListLoanding = ref(false);
const LoanSumList = ref([])
//支行排名
const orgRankLoanding = ref(false);
const orgRankWdLoanding = ref(false)
const orgRankZh = ref([]);
const orgRankWdTop = ref([]);
const orgRankWdEnd = ref([]);


const pre_dept_id = ref('');
const user = reactive({
        nickName:'',
        deptName:'',
        roles:[]
    });
const roleSelect = ref('');
const assessRoles = ref('admin,leader,manager,head_office');

const initEffect = () => {
    //获取当前登录人
    getUserProfile().then(res => {
        user.nickName = res.data.nickName;
        user.deptName = res.data.dept.deptName;
        user.roles = res.data.roles;
        roleSelect.value = res.data.roles[0]?.roleKey;
        if(assessRoles.value.includes(roleSelect.value)){
            activeName.value = 'pm';
        }else{
            activeName.value = 'lz';
        }
  });

    const getData = (workDate,org) => {
        var tempOrg = "";
        if(org.length == 7){
            tempOrg = org.substring(0,5);
        }else{
            tempOrg = org;
        }
        if(org != '907000L' && org !='907000'){
            loanding.value = true;
            selectSumAssess(workDate,org).then(res => {
                    score1.value = 0;
                    data.value = res.data;
                    loanding.value = false;
                    res.data.forEach(row => {
                        score1.value = parseFloat(row.df) +  parseFloat(score1.value);
                    });
            }); 
            modeLoanding.value = true;
            selectModeSumAssess(workDate,org).then(res => {
                score2.value = 0;
                modeData.value = res.data;
                modeLoanding.value = false;
                res.data.forEach(row => {
                        score2.value = parseFloat(row.df) +  parseFloat(score2.value);
                    });
            }); 
        }else {
            orgRankLoanding.value = true;
            getOrgScoreRank(workDate,'业务经营').then(res => {
                orgRankZh.value = res.data;
                orgRankLoanding.value = false;
            })
            orgRankWdLoanding.value = true;
            getOrgScoreRankWd(workDate,'业务经营').then(res => {
                orgRankWdTop.value = res.data.top;
                orgRankWdEnd.value = res.data.end;
                orgRankWdLoanding.value = false;
            })
        }
        //存款指标绩效
        depositSumListLoanding.value = true;
        getSumDepositList({"workDate":workDate,"assessOrg":tempOrg}).then(res => {
            scoreCk.value = 0;
            depositSumList.value = res.data;
            depositSumListLoanding.value = false;
            res.data.forEach(row => {
                    scoreCk.value = parseFloat(row.xc) +  parseFloat(scoreCk.value);
                });
        });
        //贷款指标绩效
        LoanSumListLoanding.value = true;
        getLoanCustomerSum({"workDate":workDate,"assessOrg":tempOrg}).then(res => {
            scoreDk.value = 0;
            LoanSumList.value = res.data;
            LoanSumListLoanding.value = false;
            res.data.forEach(row => {
                    scoreDk.value = parseFloat(row.zjx) +  parseFloat(scoreDk.value);
                });
        });

    }
    
    const arraySpanMethod = (param)=>{
    //     if(param.columnIndex === 0){
    //         const current_dept_id = param.row['dept_id'];
    //         let rowspan = 1;
    //         if(param.rowIndex === 0 || depositSumList.value[param.rowIndex]['dept_id'] !== pre_dept_id.value){
    //             for(let i = param.rowIndex +1; i<depositSumList.value.length; i++){
    //                 if(depositSumList.value[i]['dept_id'] === current_dept_id){
    //                     rowspan ++;
    //                     pre_dept_id.value = depositSumList.value[i]['dept_id'];
    //                 }else {

    //                     break;
    //                 }
    //             }
    //             return { rowspan: rowspan,colspan:1}
    //         }else {
    //             return { rowspan: 0,colspan:0}
    //         }
            
    //     }
    //    return { rowspan: 0,colspan:0};
    
    }
    
    
    return { getData, arraySpanMethod }
}
const handleClick = ( proxy ) => {
    
    const showMore = () => {
    //路由跳转
    if(activeName.value === 'lz'){
        proxy.$router.push({path: "/assess/screen",query: {workDate: date.value,activeName:'cd'}});
    }else if(activeName.value === 'ck'){
        proxy.$router.push({path: "/assess/screen",query: {workDate: date.value,activeName:'qt',activeName1:'deposit'}});
    }else if(activeName.value === 'dk'){
        proxy.$router.push({path: "/assess/screen",query: {workDate: date.value,activeName:'qt',activeName1:'loan'}});
    }else if(activeName.value === 'khjl'){
        proxy.$router.push({path: "/manager/performance",query: {workDate: date.value, assessOrg: assessOrg.value}});
    }
       
    }

   
    
    return { showMore }
}
    

export default {
    props: { workDate: String, org: String },
    setup( props ){
         const { proxy } = getCurrentInstance();
         const { workDate, org }= toRefs(props);
         
         //报表类型数据字典
        const { sys_org_name } = proxy.useDict("sys_org_name","account_status");
        //监控数据日期变化
        watch([workDate,org],()=>{
            if(workDate.value != '' && org.value!=''&&workDate.value != undefined && org.value!=undefined){
                getData(workDate.value,org.value);
            }
            date.value = workDate.value;
            assessOrg.value = org.value;
        })
        
        const { getData, arraySpanMethod } = initEffect( workDate );
        const { showMore } = handleClick( proxy );
        const handleOrgClick = (jg) => {
                activeName.value='lz';
                getData(workDate.value,jg);
            }
        return { workDate, org, data, loanding, showMore, modeData, modeLoanding, depositSumListLoanding, depositSumList, score1, score2, scoreCk, sys_org_name, activeName, arraySpanMethod,
        scoreDk, LoanSumListLoanding, LoanSumList, date, assessOrg, orgRankLoanding, orgRankZh, orgRankWdTop, orgRankWdEnd, handleOrgClick, roleSelect, assessRoles
        }
    }
    
}
</script>
<style scoped lang="scss">
 .header{
    white-space: nowrap;
    width: 100%;
    margin-bottom: 8px;
    &_left{
        display: inline-block;
    }
    &_right{
        display: block;
        text-align: right;
        float: right;
    }
}   
.link{
    color: #409eff;
    cursor: pointer;
}
    

</style>