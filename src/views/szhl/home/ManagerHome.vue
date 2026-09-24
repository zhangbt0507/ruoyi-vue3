<template>
    <div >
        <el-row :gutter="10">
            <!-- <el-col :span="24">
                <el-card>
                    <div class="header_left">欢迎你，{{user.deptName}} {{user.nickName}}</div>
                    <div class="header_right">
                        机构：<el-select v-model="org" placeholder="请选择机构" size="small" style="margin-top:-5px">
                          <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                            <span style="float:left">{{item.deptName}}</span>
                            <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                          </el-option>
                        </el-select>
                        业绩日期：<el-date-picker v-model="workDate" placeholder="选择日期"  :disabled-date="disabledFun" size="small" value-format="YYYYMMDD"  style="width:140px;margin-top:-5px"></el-date-picker>
                    </div>
                    </el-card>
                <el-divider  style="margin:5px 0"/>
            </el-col> -->
            <el-col :span="16"  >
                <SumDepositAndLoan :workDate="workDate" :org="org" />
                <el-divider  style="margin:5px 0"/>
                <!-- <SumAssess :workDate="workDate" :org="org" v-show="showFlag"/> -->
                <!-- <div v-if="!showFlag" class="divClass"><el-button type="danger" class="linkClass" @click="clickEvent">点击前往2025年“走千访万”活动面板</el-button></div> -->
            </el-col>
            <el-col :span="8"  >
                <!-- <InAndOut :workDate="workDate" :org="org"/> -->
                <!-- <PerformanceList :workDate="workDate" :org="org" v-if="showFlag"/> -->
            </el-col>
        </el-row>
      
    </div>
</template>

<script>
import SumDepositAndLoan from './SumDepositAndLoan.vue';
import InAndOut from './InAndOut.vue';
import PerformanceList from './PerformanceList.vue';
import SumAssess from './SumAssess.vue';
import OrgScore from './OrgScore.vue';
import {  getAssessDate } from "@/api/szhl/agency/assess";
import {  listDeptAssess } from "@/api/system/dept";
import { getUserProfile } from "@/api/system/user";
const showFlag = ref(true);
const initEffect = ()=> {
    const workDate = ref('');
    const orgs = ref();
    const org = ref();
    const user = reactive({
        nickName:'',deptName:''
    });
    getAssessDate().then(res => {
            workDate.value = res.data;
        });
    //禁用日期
    const disabledFun = (time) => {
        let dateObj = new Date();
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 1)) || time.getTime()<new Date('2023-12-31');
    }
    //获取部门
    listDeptAssess().then(res => {
        orgs.value = res.data;
        org.value = res.data[0].code;
    });
    //获取当前登录人
    getUserProfile().then(res => {
        user.nickName = res.data.nickName;
        user.deptName = res.data.dept.deptName;
  });
    return { user, org, orgs, workDate, disabledFun }
}

export default {
    components: { SumDepositAndLoan, InAndOut, SumAssess, OrgScore, PerformanceList },
    props: { workDate: String, org: String },
    setup(props) {
        const { workDate, org }= toRefs(props);
        const { proxy } = getCurrentInstance();
        const { sys_org_name } = proxy.useDict("sys_org_name");
        //监控数据日期变化
        watch([workDate,org],(newValue,lastName)=>{
            if(workDate.value != '' && org.value!=''&&workDate.value != undefined){
               // showFlag.value=(parseInt(workDate.value)<20250101)
            }
        })
        const clickEvent = ()=>{
            //路由跳转
            proxy.$router.push({path: "/assess/screen"});
         }   
        return {  org, workDate,  sys_org_name, showFlag ,clickEvent }
    },
}
</script>
<style scoped lang="scss">
.header{
    white-space: nowrap;
    &_left{
        display: inline-block;
    }
    &_right{
        // margin-bottom: 5px;
        display: block;
        text-align: right;
        float: right;
        
    }
}
.divClass{
    display: flex;
    width: 1000px;
    height: 400px;
    align-items: center;
    justify-content: center;
}
.linkClass{
    height: auto;
    text-align: center;
    font-size: 50px;
}
</style>