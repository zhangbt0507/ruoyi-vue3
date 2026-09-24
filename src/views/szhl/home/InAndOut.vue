<template>
    <el-card>
        <template #header>
            <div class="header">
                <div class="header_left">存贷款变动前10户</div> 
            </div>
        </template>
        <el-tabs type="card">
            <el-tab-pane label="存款下降">
                <el-table :data="depositDownData" v-loading="loanding" stripe show-summary :summary-method="getSummaries" size="small">
                <el-table-column label="客户名称" prop="name" align="left" width="180" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="当前余额" prop="bal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.bal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="上日余额" prop="prevBal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.prevBal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="增量" prop="zl" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.zl).toLocaleString()}}
                    </template>
                </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="存款新增">
                <el-table :data="depositRiseData" v-loading="loanding" stripe show-summary :summary-method="getSummaries" size="small">
                <el-table-column label="客户名称" prop="name" align="left" width="180" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="当前余额" prop="bal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.bal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="上日余额" prop="prevBal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.prevBal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="增量" prop="zl" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.zl).toLocaleString()}}
                    </template>
                </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="贷款下降">
                <el-table :data="loanDownData" v-loading="loanding" stripe show-summary :summary-method="getSummaries" size="small">
                <el-table-column label="客户名称" prop="name" align="left" width="180" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="当前余额" prop="bal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.bal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="上日余额" prop="prevBal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.prevBal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="增量" prop="zl" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.zl).toLocaleString()}}
                    </template>
                </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="贷款上升">
                <el-table :data="loanRiseData" v-loading="loanding" stripe show-summary :summary-method="getSummaries" size="small">
                <el-table-column label="客户名称" prop="name" align="left" width="180" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="当前余额" prop="bal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.bal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="上日余额" prop="prevBal" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.prevBal).toLocaleString()}}
                    </template>
                </el-table-column>
                <el-table-column label="增量" prop="zl" align="center">
                    <template #default="scope">
                        {{parseFloat(scope.row.zl).toLocaleString()}}
                    </template>
                </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
         
    </el-card>
</template>
<script name="InAndOut">
import { getRiseAndDownItem } from "@/api/szhl/agency/InAndOut";
import { watch } from 'vue';
const initEffect = ( workDate ) => {
    const depositRiseData = ref([]);
    const depositDownData = ref([]);
    const loanRiseData = ref([]);
    const loanDownData = ref([]);
    const loanding = ref(false);
    const getData = ( workDate,org ) => {
        loanding.value = true;
        getRiseAndDownItem(workDate,org).then(res => {
                depositRiseData.value = res.data.depositRise;
                depositDownData.value = res.data.depositDown;
                loanRiseData.value = res.data.loanRise;
                loanDownData.value = res.data.loanDown;
                loanding.value = false;
            }); 
    }
    return { depositRiseData, depositDownData, loanRiseData, loanDownData, loanding, getData }
}
export default {
    props: { workDate: String, org: String },
    setup( props ){
        const { workDate, org }= toRefs(props);
        //监控数据日期变化
        watch([workDate,org],()=>{
            if(workDate.value != '' && org.value!=''&&workDate.value != undefined && org.value!=undefined){
                getData(workDate.value,org.value);
            }
        })
        
        const { depositRiseData, depositDownData, loanRiseData, loanDownData, loanding, getData } = initEffect( workDate );
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
                    if(column.property === 'bal'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                if(index === 2){
                    if(column.property === 'prevBal'){
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
            });
            return sums;
        }
        return {  depositRiseData, depositDownData, loanRiseData, loanDownData, loanding, getSummaries }
    }
}
</script>