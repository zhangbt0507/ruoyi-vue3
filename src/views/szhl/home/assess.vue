<template>
<div class="app-container home ">
    <el-row :gutter="10">
        <el-col :span="3"  >
            <div>
                <el-card class="card_result">
                    <template #header>
                        指标名称
                    </template>
                    <div v-for="(item, index) in assesList" :key="index">
                        <el-button type="default" size="large" class="but" v-if="item.mode ==='1' || item.mode ==='2'" @click="tranAssess2Day(item)" :disabled="disabled">{{item.zbmc}}</el-button>
                        <el-button type="default" size="large" class="but" v-else  @click="tranAssess(item)" :disabled="disabled">{{item.zbmc}}</el-button>
                    </div>
                </el-card>
            </div>
        </el-col>
        <el-col :span="10">
            <el-card class="card_result">
                <template #header>
                    <div class="header">
                        <div class="header_left">支行-{{v.zbmc}} </div> 
                        <div class="header_right">数据日期:  
                            <div class="header_right">
                                <el-date-picker v-model="date" placeholder="选择日期"  :disabled-date="disabledFun" size="small" value-format="YYYYMMDD"  style="width:140px" @change="handleDate(v)"></el-date-picker>
                            </div>
                        </div>
                    </div>
                </template>
                <div v-if="v.mode === '1' || v.mode === '2'">
                    <el-table :data="subData" stripe show-summary :summary-method="getSummaries" v-loading="subLoading">
                      <el-table-column label="支行" align="center" prop="jg">
                        <template #default="scope">
                            <dict-tag :options="sys_org_name" :value="scope.row.jg" ></dict-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="报告期" align="center" prop="bgq"></el-table-column>
                      <el-table-column label="任务数" align="center" prop="rws"></el-table-column>
                      <el-table-column label="完成比" align="center" prop="wcb">
                        <template #default="scope">
                            {{(scope.row.wcb*100).toFixed(2)}}%
                        </template>
                      </el-table-column>
                      <el-table-column label="排名" align="center" prop="pm">
                         <template #default="scope">
                            {{scope.$index+1}}
                        </template>
                      </el-table-column>
                    </el-table>
                </div>
                <div v-if="v.mode === '0'">
                    <el-table :data="subData" stripe show-summary :summary-method="getSummaries" v-loading="subLoading">
                      <el-table-column label="支行" align="center" prop="jg">
                        <template #default="scope">
                            <dict-tag :options="sys_org_name" :value="scope.row.jg" ></dict-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="基期" align="center" prop="jq"></el-table-column>
                      <el-table-column label="报告期" align="center" prop="bgq"></el-table-column>
                      <el-table-column label="增量" align="center" prop="zl" ></el-table-column>
                      <el-table-column label="任务数" align="center" prop="rws"></el-table-column>
                      <el-table-column label="完成比" align="center" prop="wcb">
                        <template #default="scope">
                            {{(scope.row.wcb*100).toFixed(2)}}%
                        </template>
                      </el-table-column>
                      <el-table-column label="排名" align="center" prop="pm"></el-table-column>
                    </el-table>
                </div>
            </el-card>
        </el-col>
        <el-col :span="10">
            <el-card class="card_result">
                <template #header>
                        <div class="header">
                        <div class="header_left">网点-{{v.zbmc}} </div> <div class="header_right">数据日期:
                            <div class="header_right">
                                <el-date-picker v-model="date" placeholder="选择日期"  :disabled-date="disabledFun" size="small" disabled value-format="YYYYMMDD"  style="width:140px" @change="handleDate(v)"></el-date-picker>
                            </div>
                        </div>
                    </div>
                </template>
                <div v-if="v.mode === '1' || v.mode === '2' "  >
                    <el-table :data="netData" stripe show-summary :summary-method="getSummaries" height="780" size="small" v-loading="netLoading">
                      <el-table-column fixed label="网点" align="center" prop="jg">
                        <template #default="scope">
                            <dict-tag :options="sys_org_name" :value="scope.row.jg" ></dict-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="报告期" align="center" prop="bgq"></el-table-column>
                      <el-table-column label="任务数" align="center" prop="rws"></el-table-column>
                      <el-table-column label="完成比" align="center" prop="wcb">
                        <template #default="scope">
                            {{(scope.row.wcb*100).toFixed(2)}}%
                        </template>
                      </el-table-column>
                      <el-table-column label="排名" align="center" prop="pm">
                        <template #default="scope">
                            {{scope.$index+1}}
                        </template>
                      </el-table-column>
                    </el-table>
                </div>
                <div v-if="v.mode === '0'">
                    <el-table :data="netData" stripe show-summary :summary-method="getSummaries" height="780" size="small" v-loading="netLoading">
                      <el-table-column fixed label="网点" align="center" prop="jg">
                        <template #default="scope">
                            <dict-tag :options="sys_org_name" :value="scope.row.jg" ></dict-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="基期" align="center" prop="jq"></el-table-column>
                      <el-table-column label="报告期" align="center" prop="bgq"></el-table-column>
                      <el-table-column label="增量" align="center" prop="zl"></el-table-column>
                      <el-table-column label="任务数" align="center" prop="rws"></el-table-column>
                      <el-table-column label="完成比" align="center" prop="wcb">
                        <template #default="scope">
                            {{(scope.row.wcb*100).toFixed(2)}}%
                        </template>
                      </el-table-column>
                      <el-table-column label="排名" align="center" prop="pm"></el-table-column>
                    </el-table>
                </div>
            </el-card>
        </el-col>
    </el-row>
</div>
</template>

<script>
import { getAllEnableAssessList,getAssessList, getAssessDate, selectAssessByCode, selectAssessByCodeWd, selectAssessByCode2Day, selectAssessByCodeWd2Day} from "@/api/szhl/agency/assess";
import  { getCurrentInstance } from 'vue';
const clickEffect = ( workDate ) => {
        const v = ref('');
        const runRule = ref('');
        const date = ref('');
        const subData = ref([]);
        const netData = ref([]);
        const subLoading = ref(false);
        const netLoading = ref(false);
        const disabled = ref(false);
        //T+1指标
        const tranAssess = (val) =>{
            v.value = val;
            runRule.value = '0';
            subLoading.value = true;
            netLoading.value = true;
            disabledBtn();
            selectAssessByCode(v.value.zbmc,workDate.value).then(res => {
                subData.value = res.data;
                date.value = res.data[0].workDate
                subLoading.value = false;
            }); 
            selectAssessByCodeWd(v.value.zbmc,workDate.value).then(res => {
                netData.value = res.data;
                netLoading.value = false;
                resetBtn();
            }); 
        }
        //T+2指标
        const tranAssess2Day = (val) =>{
            
            v.value = val;
            runRule.value = '1';
            subLoading.value = true;
            netLoading.value = true;
            disabledBtn();
            selectAssessByCode2Day(v.value.zbmc,workDate.value).then(res => {
                subData.value = res.data;
                date.value = res.data[0].workDate
                subLoading.value = false;
            }); 
            selectAssessByCodeWd2Day(v.value.zbmc,workDate.value).then(res => {
                netData.value = res.data;
                netLoading.value = false;
                resetBtn();
            }); 
        }
        //按钮防止重复点击
        const disabledBtn = () => {
            disabled.value = true;
        }

        const resetBtn = () => {
            disabled.value = false;
        }
        //禁用日期
        const disabledFun = (time) => {
            let dateObj = new Date();
            return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 1)) || time.getTime()<new Date('2023-12-31');
        }
        //日期选择
        const handleDate = (val) => {
            workDate.value = date.value;
            if(v.value.mode === '0'){
                tranAssess(val);
            }else if(v.value.mode === '1' || v.value.mode === '2'){
                tranAssess2Day(val);
            }
            
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
                if(index === 1){
                    if(column.property === 'jq'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                if(index === 2){
                    if(column.property === 'bgq'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                if(index === 3){
                    if(column.property === 'zl'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                if(index === 4){
                    if(column.property === 'rws'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }

            });
            sums[5]= (sums[3]/sums[4]*100).toFixed(2)+"%";
            return sums;
        }
        return {tranAssess, tranAssess2Day, v, runRule, subData, netData, getSummaries, subLoading, netLoading, disabled, date, disabledFun, handleDate}
}

export default {
    setup () {
        const { proxy } = getCurrentInstance();
        const { sys_org_name } = proxy.useDict("sys_org_name");
        const workDate = ref('');
        const assesList = ref([])
        getAllEnableAssessList().then(res => {
            assesList.value = res.data;
            getAssessDate().then(res => {
            workDate.value = res.data;
            tranAssess(assesList.value[0],workDate.value);
        });
        });
        
        const { tranAssess, tranAssess2Day, v, runRule,subData, netData, getSummaries, subLoading, netLoading, disabled, date, disabledFun, handleDate } = clickEffect( workDate );
        
        return {assesList, tranAssess, tranAssess2Day, v, runRule,subData, netData, sys_org_name, getSummaries, subLoading, netLoading, disabled, workDate, date, disabledFun, handleDate }
    }
}
</script>

<style scoped lang="scss">
.myCard {
  display: flex;
  margin: 0 auto;
  &__header {
    margin-top: 5px;
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 15px;
  }
  &__body {
    
    padding-bottom: 0;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #999;
  }
  &__percent{
    margin-bottom: 10px;
    width: 100%;
    color: #666;
    justify-content: space-between;
  }
  &__svg {
    margin: auto 4.5px;
    width: 10px;
    height: 10px;
}
}
.but{
    margin-top: 5px;
    margin-left: 0px;
    width: 140px;
}
.card_result{
    width: 100%;
    height: 780;
}
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