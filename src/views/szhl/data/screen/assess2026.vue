<template>
    <div class="app-container home ">
        <el-row :gutter="10">
            <el-col :span="24"  >
                <el-card>
                    <template #header>
                    <div>
                        2026全年考核指标(贷款收息额、贷款收息率指标T+2，其余指标T+1)
                        <el-date-picker v-model="workDate" placeholder="选择日期"   size="small" value-format="YYYYMMDD" :disabled-date="disabledFun" style="width:140px;margin-top:-5px" :onchange="dateBlurEvent()"></el-date-picker>
                    </div>
                    <el-tabs type="border-card" v-model="activeName">
                        <el-tab-pane label="年日均各项存款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均各项存款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均各项存款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="月日均各项存款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均各项存款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均各项存款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="年日均各项贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均各项贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均各项贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="月日均各项贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均各项贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均各项贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                         <el-tab-pane label="年日均活期存款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均活期存款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均活期存款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="月日均活期存款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均活期存款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均活期存款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="年日均小微企业贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均小微企业贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均小微企业贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="月日均小微企业贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均小微企业贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均小微企业贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="年日均个人贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均个人贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均个人贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="月日均个人贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均个人贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均个人贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="年日均信保类贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均信保类贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026年日均信保类贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="月日均信保类贷款"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均信保类贷款'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :assessName="'2026月日均信保类贷款'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="小微企业贷款户数"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026小微企业贷款户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="个人用信户数-个贷"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026个人用信户数-个贷'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026个人用信户数-个贷'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="个人用信户数-信用卡"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026个人用信户数-信用卡'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026个人用信户数-信用卡'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对公核心户数"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026对公核心户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="个人核心户数"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026个人核心户数'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026个人核心户数'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="有效代发"  >
                            <el-row :gutter="10">
                                
                                <el-col :span="12">
                                    <span>有效代发-代发企业</span>
                                    <AssessTableTemp2 :assessName="'2026对公有效代发'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <span>有效代发-代发个人</span>
                                    <AssessTableTemp2 :assessName="'2026对私有效代发'" :workDate="workDate" :type="'0'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="有效收单商户"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026核心收单商户'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026核心收单商户'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="贷款收息率"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp5 :assessName="'2026贷款收息率'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp5 :assessName="'2026贷款收息率'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="贷款收息额"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp4 :assessName="'2026贷款收息额'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp4 :assessName="'2026贷款收息额'" :workDate="workDate" :type="'1'" />
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <!-- 
                       
                        
                        
                        <el-tab-pane label="个人贷款户数"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :assessName="'2026劳动竞赛个人贷款户数月增量'" :workDate="workDate" :type="'0'" />
                                </el-col>
                                
                            </el-row>
                        </el-tab-pane>
                        
                         -->
                        
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
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 1)) || time.getTime()<new Date('2025-11-30');
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