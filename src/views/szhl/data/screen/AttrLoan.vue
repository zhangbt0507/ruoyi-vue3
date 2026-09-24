<template>
    <div class="app-container home ">
        <el-row :gutter="10">
            <el-col :span="24"  >
                <el-card>
                    <template #header>
                    <div>
                        "抓拓控"专项考核指标(T+1)
                        <el-date-picker v-model="workDate" placeholder="选择日期"   size="small" value-format="YYYYMMDD" :disabled-date="disabledFun" style="width:140px;margin-top:-5px" :onchange="dateBlurEvent()"></el-date-picker>
                    </div>
                    <el-tabs type="border-card" v-model="activeName">
                        <el-tab-pane label="小微企业贷款客户流失率(负向排名)"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp6 :assessName="'小微企业流失户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="普通贷款用信户数流失率(负向排名)"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp6 :assessName="'普通贷款用信户数流失'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对公核心户数新增"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'对公核心户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="各项贷款余额新增"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'各项贷款余额增量'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="个人贷款余额新增"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'个人贷款余额增量'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对私归行率5%(含)-10%"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'对私存贷比5-10增量'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对私归行率大于等于10%"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'对私存贷比大于等于10户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对公归行率5%(含)-10%"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'对公存贷比5-10增量'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对公归行率大于等于10%"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'对公存贷比大于等于10户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="不良贷款净生成率(负向排名)"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp5 :assessName="'抓拓控不良净生成率'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                    </el-tabs>
                </template>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import AssessTableTemp1 from './AssessTableTemp1';
import AssessTableTemp2 from './AssessTableTemp2';
import AssessTableTemp3 from './AssessTableTemp3';
import AssessTableTemp4 from './AssessTableTemp4';
import AssessTableTemp5 from './AssessTableTemp5';
import AssessTableTemp6 from './AssessTableTemp6';
import { getEtlDateDiff, getEtlDate } from "@/api/szhl/agency/sumDepositAndLoan";
const workDate = ref();
const loading1 = ref(false)
const initEffect = (proxy)=> {
    const dateBlurEvent = ()=>{
        if(workDate.value != undefined){
            
        }
    }
   
    return { dateBlurEvent }
}

 //禁用日期
 const disabledFun = (time) => {
        let dateObj = new Date();
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 1)) || time.getTime()<new Date('2025-08-31');
    }
export default {
    components: { AssessTableTemp1, AssessTableTemp2, AssessTableTemp3, AssessTableTemp4, AssessTableTemp5, AssessTableTemp6 },
    mounted(){
        
        const { proxy } = getCurrentInstance();
        if(JSON.stringify(proxy.$route.query.workDate)!=undefined && JSON.stringify(proxy.$route.query.workDate) != null && JSON.stringify(proxy.$route.query.workDate)!= ''){
            workDate.value = proxy.$route.query.workDate;
        }else {
            getEtlDate().then(res => {
                workDate.value = res.data;
            });
        }
        
    },
    setup(){
      const { proxy } = getCurrentInstance();
      //数据字典
      const { sys_org_name } = proxy.useDict("sys_org_name");
      const { dateBlurEvent } = initEffect(proxy);
      return { sys_org_name, workDate, disabledFun, dateBlurEvent }
    }
}
</script>