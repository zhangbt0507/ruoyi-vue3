<template>
  <div>
    <el-table stripe size="small" :data="data" :show-summary="summary" :summary-method="getSummaries" v-loading="loading">
        <el-table-column label="机构" align="center" prop="jg">
            <template #default="scope">
                
                <el-link type="primary" @click="clickEvent(scope.row.url)" v-if="scope.row.link==='0'"><dict-tag :options="sys_org_name" :value="scope.row.jg"/></el-link>
                <dict-tag :options="sys_org_name" :value="scope.row.jg" v-else/>
            </template>
        </el-table-column>
        <el-table-column label="报告期" align="center" prop="bgq">
            <template #default="scope">
                {{ parseFloat(scope.row.bgq).toLocaleString() }}
            </template>
        </el-table-column>
        
        
        <el-table-column label="任务数" align="center" prop="rws">
            <template #default="scope">
                {{ parseFloat(scope.row.rws).toLocaleString() }}
            </template>
        </el-table-column>
        <el-table-column label="完成比" align="center" prop="wcb">
            <template #default="scope">
                {{ (parseFloat(scope.row.bgq) / parseFloat(scope.row.rws)).toFixed(2)*100}}%
            </template>
        </el-table-column>
        <el-table-column label="排名" align="center" prop="pm"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { selectAssessByCode, selectAssessByCodeWd } from "@/api/szhl/agency/assess";
const reportUrl = ref(import.meta.env.VITE_APP_BASE_REPORT ); // 报表服务器地址
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
                if(index === 1){
                    if(column.property === 'bgq'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }
                
                
                if(index === 2){
                    if(column.property === 'rws'){
                        const values = data.map(item => (item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return parseFloat(prev) + parseFloat(curr);
                        },0);
                    }
                    return;
                }

            });
            sums[3]= (sums[1]/sums[2]*100).toFixed(2)+"%";
            return sums;
        }
        return { getSummaries }
}




export default {
    props: { assessName: String, workDate: String, type: String, summary: Boolean },
    setup(props){
      const data = ref([]);
      const loading = ref(false);
      const { proxy } = getCurrentInstance();
      //数据字典
      const { sys_org_name } = proxy.useDict("sys_org_name");
      const {  getSummaries } = initEffect();
      const { assessName, workDate, type, summary }= toRefs(props);
      //按钮点击事件
      const clickEvent = (url)=> {
            proxy.$router.push({path: "/szhl/report/agency/",query: {url: reportUrl.value+url}});
        }
      //监控数据日期变化
      watch([workDate],(newValue,lastName)=>{
            if(workDate.value != '' &&workDate.value != undefined){
                loading.value = true;
                if(type.value === '0'){
                    //支行
                    selectAssessByCode(assessName.value,workDate.value).then(res => {
                        data.value = res.data;
                        loading.value = false;
                    })
                }else{
                    //网点
                    selectAssessByCodeWd(assessName.value,workDate.value).then(res => {
                        data.value = res.data;
                        loading.value = false;
                    })
                }
            }
        })
      return { sys_org_name,  getSummaries, data, loading, clickEvent, summary  }
    }

}
</script>

<style>

</style>