<template>
    <div style="color:red;margin-bottom:5px">以下指标按月统计得分(以下走访与采集得分，未剔除可疑数据，以最终报告期通报为准！)
        <el-link type="primary" @click="link()">
            打开统计报表
        </el-link>
    </div>
    <el-table :data="data" v-loading="loading" stripe size="small" show-summary :summary-method="getSummaries">
        <el-table-column label="指标名称" align="center" prop="zbmc" width="200" >
            <template #default="scope">
                <router-link :to="'/szhl/report-data/index/' + scope.row.zbmc +'/' + assessOrg +'/' + workDate+'/' + managerId" v-if="scope.row.link === '0'" class="link">
                    <span>{{ scope.row.zbmc }}</span>
                </router-link>
                <span v-if="scope.row.link != '0'">{{ scope.row.zbmc }}</span>
            </template>
        </el-table-column>
        <el-table-column label="基准分值" align="center" prop="jbf"   width="150"/>
        <el-table-column label="报告期(个数/户数)" align="center" prop="bgq"   width="150">
            <template #default="scope">
                <span v-if="scope.row.bgq!='' && scope.row.bgq!=null">{{ parseFloat(scope.row.bgq).toFixed(0) }}</span>
                <span v-else>-</span>                                                                          
            </template>
        </el-table-column>
        <el-table-column label="得分" align="center" prop="df"   width="150">
            <template #default="scope">
                <span v-if="scope.row.df!='' && scope.row.df!=null">{{ parseFloat(scope.row.df).toFixed(2) }}</span>
                <span v-else>-</span>                                                                          
            </template>
        </el-table-column>
    </el-table>
    <!-- 以下指标由指标管理部门手工统计导入 -->
    <br/>   
    <div style="color:red;margin-bottom:5px">以下指标由指标管理部门手工统计导入按年累积,月度成效=当月得分-上月得分</div>
    <el-table :data="assignData" v-loading="loading" stripe size="small" show-summary :summary-method="getSummaries">
        <el-table-column label="指标名称" align="center" prop="zbmc" width="200" >
            <template #default="scope">
                <router-link :to="'/szhl/report-data/index/' + scope.row.zbmc +'/' + assessOrg +'/' + workDate+'/' + managerId" v-if="scope.row.link === '0'" class="link">
                    <span>{{ scope.row.zbmc }}</span>
                </router-link>
                <span v-if="scope.row.link != '0'">{{ scope.row.zbmc }}</span>
            </template>
        </el-table-column>
        <el-table-column label="基准分值" align="center" prop="jbf"   width="150"/>
        <el-table-column label="报告期(个数/户数)" align="center" prop="bgq"   width="150">
            <template #default="scope">
                <span v-if="scope.row.bgq!='' && scope.row.bgq!=null">{{ parseFloat(scope.row.bgq).toFixed(0) }}</span>
                <span v-else>-</span>                                                                          
            </template>
        </el-table-column>
        <el-table-column label="得分" align="center" prop="df"   width="150">
            <template #default="scope">
                <span v-if="scope.row.df!='' && scope.row.df!=null">{{ parseFloat(scope.row.df).toFixed(2) }}</span>
                <span v-else>-</span>                                                                          
            </template>
        </el-table-column>
        <el-table-column label="更新日期" align="center" prop="workDate"   width="150"/>
    </el-table>
</template>
<script>
const reportUrl = ref(import.meta.env.VITE_APP_BASE_REPORT ); // 报表服务器地址
const initEffect = ()=>{
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

        return { getSummaries }
}

export default {
    name: "visitTwo",
    props:{ data: Array,assignData: Array,loading: Boolean, assessOrg: String, workDate: String , managerId: String },
    setup(props){
        const { proxy } = getCurrentInstance();
        const { data, assignData, loading, assessOrg, workDate, managerId } = toRefs(props);
        const { getSummaries } = initEffect();
        const link = ()=>{
             //路由跳转, query: {url: url}
             const url = 'szhl/jxkh/客户经理/万家行2.cpt';
             proxy.$router.push({path: "/szhl/report/agency/",query: {url: reportUrl.value+url}});
        }
        return { data, assignData, assessOrg,  workDate, managerId, loading, getSummaries, link }
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