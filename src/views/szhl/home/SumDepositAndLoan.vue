<template>
        <el-card >
                <template #header>
                    <div class="header">
                        <div class="header_left" v-show="queryType=='0'">经管存贷款汇总(万元)</div>
                        <div class="header_left" v-show="queryType=='1'">考核存贷款汇总(万元)
                            <el-tooltip  placement="top" >
                            <template #content>
                                考核口径:<br/>
                                1.数据来源管理会计系统(T+2)<br/>
                                2.各项存款=存款明细汇总数-总部认领-金磐服务站-特殊剔除客户+线上存款<br/>
                                3.基础存款为各项存款中利率符合当年基础存款利率的存款<br/>
                                4.若有人员调动到总部或者金磐，过程当中的数据会存在偏差，实际考核数据以月底回算后为准<br/>
                                5.贷款未加回不良中心数据
                            </template>
                                <el-icon class="tip"><question-filled /></el-icon>
                            </el-tooltip>
                        </div> 
                        <div class="header_right">
                            <el-select size="small" v-model="queryType">
                                <el-option value="0" label="经管口径"></el-option>
                                <el-option value="1" label="考核口径"></el-option>
                            </el-select>    
                        </div> 
                    </div>
                </template>
            <div>
                 <el-table :data="data" v-loading="loading" size="small">
                    <el-table-column label="指标名称" prop="indexName"></el-table-column>
                    <el-table-column label="当前值" prop="currentVal" align="center">
                        <template #default="scope">
                            {{parseFloat(scope.row.currentVal).toLocaleString()}}
                        </template>
                    </el-table-column>
                    <el-table-column label="比上日" prop="prevDayVal" align="center">
                        <template #default="scope">
                            <div>
                            {{parseFloat(scope.row.prevDayVal).toLocaleString()}}
                                <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                                    <use xlink:href="#icon-arrow-lv" v-if="(scope.row.prevDayVal)<0"></use>
                                    <use xlink:href="#icon-arrow-red" v-if="(scope.row.prevDayVal)>0"></use>
                                </svg>
                             </div>
                        </template>
                        
                    </el-table-column>
                    <el-table-column label="比上月" prop="prevMonthVal" align="center">
                        <template #default="scope">
                            {{parseFloat(scope.row.prevMonthVal).toLocaleString()}}
                                <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                                    <use xlink:href="#icon-arrow-lv" v-if="(scope.row.prevMonthVal)<0"></use>
                                    <use xlink:href="#icon-arrow-red" v-if="(scope.row.prevMonthVal)>0"></use>
                                </svg>
                        </template>
                    </el-table-column>
                    <el-table-column label="比年初" prop="prevYearVal" align="center">
                        <template #default="scope">
                            {{parseFloat(scope.row.prevYearVal).toLocaleString()}}
                                <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                                    <use xlink:href="#icon-arrow-lv" v-if="(scope.row.prevYearVal)<0"></use>
                                    <use xlink:href="#icon-arrow-red" v-if="(scope.row.prevYearVal)>0"></use>
                                </svg>
                        </template>
                    </el-table-column>
                 </el-table>
            </div>
            </el-card>
</template>

<script name="SumDepositAndLoan">
import { getSumDepositAndLoan } from "@/api/szhl/agency/sumDepositAndLoan";
const data = ref([]);
const queryType = ref('0');
const loading = ref(false);
const initEffect = (workDate) => {
    const getData = (workDate,org) => {
        loading.value = true;
        getSumDepositAndLoan(workDate,org,queryType.value).then(res => {
                data.value = res.data;
                loading.value = false;
            }).catch(() => {
                loading.value = false;
        });
    }
   
    return { data, loading, getData }
}
export default {
    props: { workDate: String, org: String },
    setup ( props ) {
        const { workDate, org }= toRefs(props);
        //监控数据日期变化
        watch([workDate,org,queryType],(newValue,lastName)=>{
            if(workDate.value != '' && org.value!='' && queryType.value!='' &&workDate.value != undefined && org.value!=undefined && queryType.value!=undefined){
                getData(workDate.value,org.value,queryType.value);
            }
        })
        const { data, loading, getData } = initEffect(workDate);
        
        return { workDate, data, loading, getData, queryType }
    }
}
</script>

<style  scoped lang="scss">
.header{
    white-space: nowrap;
    &_left{
        display: inline-block;
    }
    &_right{
        display: block;
        text-align: right;
        float: right;
    }
}
</style>