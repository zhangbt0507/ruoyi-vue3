<template>
    <div>
        <el-table :data="data" style="width:100%"  show-summary :summary-method="getSummaries">
        <el-table-column align="center" prop="assessOrg" label="机构号" fixed="left"/>
        <el-table-column align="center" prop="assessOrg" label="机构名称" fixed="left" width="110">
            <template #default="scope">
                <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
            </template>
        </el-table-column>
        <el-table-column align="center" prop="custType" label="客户类型" fixed="left" width="100"/>
        <el-table-column align="center" prop="period" label="贷款种类" fixed="left" width="100"/>
        <el-table-column align="center"  label="当前数据(万元)">
            <el-table-column align="center" prop="sumYe" label="余额"  width="100">
                <template #default="scope">
                    {{ parseFloat(scope.row.sumYe).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="ratioSumYe" label="占比">
                <template #default="scope">
                        {{ scope.row.ratioSumYe }}%
                </template>
            </el-table-column>
            <el-table-column align="center" prop="sumNrj" label="年日均"  width="100">
                <template #default="scope">
                    {{ parseFloat(scope.row.sumNrj).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="ratioSumNrj" label="占比">
                <template #default="scope">
                        {{ scope.row.ratioSumNrj }}%
                </template>
            </el-table-column>
            <el-table-column align="center" prop="payOutSum" label="利息收入">
                <template #default="scope">
                    {{ parseFloat(scope.row.payOutSum).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="cirSum" label="收息率">
                <template #default="scope">
                        {{ scope.row.cirSum }}
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="存量未到期部分(万元)">
            <el-table-column align="center" prop="unDueYe" label="余额"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.unDueYe!='' && scope.row.unDueYe!=null">{{ parseFloat(scope.row.unDueYe).toLocaleString() }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="unDueNrj" label="年日均"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.unDueNrj!='' && scope.row.unDueNrj!=null">{{ parseFloat(scope.row.unDueNrj).toLocaleString() }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="cirUnDue" label="收息率">
                <template #default="scope">
                    <span v-if="scope.row.cirUnDue!='' && scope.row.cirUnDue!=null">{{ scope.row.cirUnDue }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="payOutUnDue" label="预计利息收入">
                <template #default="scope">
                    <span v-if="scope.row.payOutUnDue!='' && scope.row.payOutUnDue!=null">{{ parseFloat(scope.row.payOutUnDue).toLocaleString() }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="predUnDueNrj" label="预计年日均"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.predUnDueNrj!='' && scope.row.predUnDueNrj!=null">{{ parseFloat(scope.row.predUnDueNrj).toLocaleString() }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="predCirUnDue" label="预计收息率">
                <template #default="scope">
                    <span v-if="scope.row.predCirUnDue!='' && scope.row.predCirUnDue!=null">{{ scope.row.predCirUnDue }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="存量当年到期部分(万元)">
            <el-table-column align="center" prop="dueYe" label="余额"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.dueYe!='' && scope.row.dueYe!=null">{{ parseFloat(scope.row.dueYe).toLocaleString() }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="dueNrj" label="年日均"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.dueNrj!='' && scope.row.dueNrj!=null">{{ parseFloat(scope.row.dueNrj).toLocaleString() }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="cirDue" label="收息率">
                <template #default="scope">
                    <span v-if="scope.row.cirDue!='' && scope.row.cirDue!=null">{{ scope.row.cirDue }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="payOutDue" label="预计利息收入">
                <template #default="scope">
                    <span v-if="scope.row.payOutDue!='' && scope.row.payOutDue!=null">{{ scope.row.payOutDue }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="predDueNrj" label="预计年日均"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.predDueNrj!='' && scope.row.predDueNrj!=null">{{ scope.row.predDueNrj }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="predCirDue" label="预计收息率">
                <template #default="scope">
                    <span v-if="scope.row.predCirDue!='' && scope.row.predCirDue!=null">{{ scope.row.predCirDue }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="参考金额(万元)">
            <el-table-column align="center" prop="referDueNrj" label="到期日到12月末预计全年日均"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.referDueNrj!='' && scope.row.referDueNrj!=null">{{ scope.row.referDueNrj }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="nominalRate" label="根据最低收息率估计">
                <template #default="scope">
                    <span v-if="scope.row.nominalRate!='' && scope.row.nominalRate!=null">{{ scope.row.nominalRate }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="referPayOut" label="到期日到12月末预计利息收入"  width="100">
                <template #default="scope">
                    <span v-if="scope.row.referPayOut!='' && scope.row.referPayOut!=null">{{ scope.row.referPayOut }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="录入金额—存量续存情况(万元)">
            <el-table-column align="center" prop="renewNrj" label="到期日到12月末预计日均" width="120">
                <template #default="scope">
                    <el-input v-model="scope.row.renewNrj" type="number" @blur="handleBlur(scope.row)"></el-input>
                </template>
            </el-table-column>                                                                                                                                                                                                                                                                                                                                                                                              
            <el-table-column align="center" prop="renewRate" label="转贷利率" width="100">
                <template #default="scope">
                    <el-input v-model="scope.row.renewRate" type="number" @blur="handleBlur(scope.row)"></el-input>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="renewPayOut" label="转存部分利息收入" width="120">
                <template #default="scope">
                    <el-input v-model="scope.row.renewPayOut" type="number" readonly></el-input>                                                                                                 
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="录入金额—新增情况(万元)">
            <el-table-column align="center" prop="addNrj" label="预计全年日均" width="120">
                <template #default="scope">
                    <el-input v-model="scope.row.addNrj" type="number" @blur="handleBlurAdd(scope.row)"></el-input>
                </template>
            </el-table-column>                                                                                                                                                                                                                                                                                                                                                                                              
            <el-table-column align="center" prop="addRate" label="利率" width="100">
                <template #default="scope">
                    <el-input v-model="scope.row.addRate" type="number" @blur="handleBlurAdd(scope.row)"></el-input>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="addPayOut" label="利息收入" width="120">
                <template #default="scope">
                    <el-input v-model="scope.row.addPayOut" type="number" readonly></el-input>                                                                                                 
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="依据日均和转存利率计算至年底的相关数据(万元)" fixed="right">
            <el-table-column align="center" prop="znrj" label="预计全年总日均" width="120">
                <template #default="scope">
                    <span v-if="scope.row.znrj!='' && scope.row.znrj!=null">{{ scope.row.znrj }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>                                                                                                                                                                                                                                                                                                                                                                                              
            <el-table-column align="center" prop="zpayOut" label="总利息收入" width="100">
                <template #default="scope">
                    <span v-if="scope.row.zpayOut!='' && scope.row.zpayOut!=null">{{ scope.row.zpayOut }}</span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="zcirDue" label="税前加权收息率" width="120">
                <template #default="scope">
                    <span v-if="scope.row.zcirDue!='' && scope.row.zcirDue!=null">{{ scope.row.zcirDue }}</span>
                    <span v-else>-</span>                                                                          
                </template>
            </el-table-column>
            <el-table-column align="center" prop="zcirDue1" label="税后加权收息率" width="120">
                <template #default="scope">
                    <span v-if="scope.row.zcirDue!='' && scope.row.zcirDue!=null">{{ (parseFloat(scope.row.zcirDue)*0.99).toFixed(2) }}</span>
                    <span v-else>-</span>                                                                          
                </template>
            </el-table-column>
        </el-table-column>
    </el-table>
    </div>
</template>
<script>
const ckNrj = ref();
const llNrj = ref();
const initEffect = ()=> {
   
    //合计行处理
    const getSummaries = (param) => {
        const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if(index === 0){
                    sums[index] = '合计';
                    return;
                }
                if(index === 4){
                    if(column.property === 'sumYe'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 6){
                    if(column.property === 'sumNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 8){
                    if(column.property === 'payOutSum'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                   }
                    return;
                }
                if(index === 10){
                    if(column.property === 'unDueYe'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 11){
                    if(column.property === 'unDueNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 13){
                    if(column.property === 'payOutUnDue'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 14){
                    if(column.property === 'predUnDueNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 16){
                    if(column.property === 'dueYe'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 17){
                    if(column.property === 'dueNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 19){
                    if(column.property === 'payOutDue'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 20){
                    if(column.property === 'predDueNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 22){
                    if(column.property === 'referDueNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            ckNrj.value = (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 24){
                    if(column.property === 'referPayOut'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 25){
                    if(column.property === 'renewNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            llNrj.value = (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 27){
                    if(column.property === 'renewPayOut'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0)+ parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 28){
                    if(column.property === 'addNrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 30){
                    if(column.property === 'addPayOut'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 31){
                    if(column.property === 'znrj'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                if(index === 32){
                    if(column.property === 'zpayOut'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                        },0);
                    }
                    return;
                }
                // if(index === 33){
                //     if(column.property === 'zcirDue'){
                //         const values = data.map(item => (item[column.property]));
                //         sums[index] = values.reduce((prev, curr) => {
                //             return (parseFloat(prev||0) + parseFloat(curr||0)).toFixed(2);
                //         },0);
                //     }
                //     return;
                // }
               

            });
            sums[33]= (sums[32]/sums[31]*100).toFixed(2);
            sums[34]= (sums[33]*0.99).toFixed(2);
            return sums;
    }
    
    return { getSummaries }
}
const handleClickEvent = (proxy)=> {
    
    //丢失焦点事件
    const handleBlur = (row) =>{
        if(parseFloat(llNrj.value)>parseFloat(ckNrj.value)){
            proxy.$modal.alert("录入总日均不得超过参考总日均");
            row.renewNrj = 0;
        }
        row.renewPayOut = (parseFloat(row.renewNrj||0)*parseFloat((row.renewRate||0)/100)).toFixed(2);
        row.znrj = (parseFloat(row.predUnDueNrj||0)+parseFloat(row.predDueNrj||0)+parseFloat(row.renewNrj||0)+parseFloat(row.addNrj||0)).toFixed(2);
        row.zpayOut = (parseFloat(row.payOutUnDue||0)+parseFloat(row.payOutDue||0)+parseFloat(row.renewPayOut||0)+parseFloat(row.addPayOut||0)).toFixed(2);
        
        if(row.kzlx>0){
            row.kzlx = (parseFloat(row.znrj)*1.8/100).toFixed(2);
        }
        row.zcirDue = ((parseFloat(row.zpayOut)+parseFloat(row.kzlx||0))/parseFloat(row.znrj)*100).toFixed(2);
        
    }
    //丢失焦点事件
    const handleBlurAdd = (row) =>{
        row.addPayOut = (parseFloat(row.addNrj||0)*((row.addRate||0))/100).toFixed(2);
        row.znrj = (parseFloat(row.predUnDueNrj||0)+parseFloat(row.predDueNrj||0)+parseFloat(row.renewNrj||0)+parseFloat(row.addNrj||0)).toFixed(2);
        row.zpayOut = (parseFloat(row.payOutUnDue||0)+parseFloat(row.payOutDue||0)+parseFloat(row.renewPayOut||0)+parseFloat(row.addPayOut||0)).toFixed(2);
       
        if(row.kzlx>0){
            row.kzlx = (parseFloat(row.znrj)*1.8/100).toFixed(2);
        }
        row.zcirDue = ((parseFloat(row.zpayOut)+parseFloat(row.kzlx||0))/parseFloat(row.znrj)*100).toFixed(2);
    }
    return {  handleBlur, handleBlurAdd }
}
export default {
    name: "LoanTool",
    props:{ data: Array },
    setup(props) {
        const { proxy } = getCurrentInstance();
        const { sys_org_name } = proxy.useDict("sys_org_name");
        const { getSummaries } = initEffect();
        const { handleBlur, handleBlurAdd } = handleClickEvent(proxy);
        const { data } = toRefs(props);
        return { data, sys_org_name, getSummaries, handleBlur, handleBlurAdd }
    }
}
</script>