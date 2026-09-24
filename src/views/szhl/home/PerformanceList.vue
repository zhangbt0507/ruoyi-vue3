<template>
    <el-card>
        <template #header>
            <div class="header">
                客户经理考核面板
            </div>
        </template>
        <el-tabs type="card" v-model="activeName" >
            <el-tab-pane label="个人业绩绩效" name="jx" >
                <el-table v-loading="loading" :data="jxList"  stripe height="700">
                    <el-table-column label="网点" prop="assessOrg">
                        <template #default="scope">
                            <dict-tag :options="sys_org_name" :value="scope.row.assessOrg" />
                        </template>
                    </el-table-column>
                    <el-table-column label="柜员号" prop="managerId">
                        <template #default="scope">
                            <el-link type="primary" underline @Click="handleStaffClick(scope.row.managerId,'jx')">{{scope.row.managerId}}</el-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="姓名" prop="managerId">
                        <template #default="scope">
                            <dict-tag :options="sys_user_name" :value="scope.row.managerId" />
                        </template>
                    </el-table-column>
                    <el-table-column label="个人业绩绩效" prop="zjx">
                        <template #default="scope">
                            {{(parseFloat(scope.row.zjx)).toFixed(0)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="排名" >
                        <template #default="scope">
                            {{scope.$index+1}}
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="个人履职得分" name="lz" >
                <div class="more_link">
                    <el-link type="primary" @click="linkUrlLz()">更多</el-link>
                </div>
                <el-table v-loading="loading" :data="lzList"  stripe height="700">
                    <el-table-column label="网点" prop="assessOrg">
                        <template #default="scope">
                            <dict-tag :options="sys_org_name" :value="scope.row.assessOrg" />
                        </template>
                    </el-table-column>
                    <el-table-column label="柜员号" prop="managerId">
                        <template #default="scope">
                            <el-link type="primary" underline @Click="handleStaffClick(scope.row.managerId,'lz')">{{scope.row.managerId}}</el-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="姓名" prop="managerId">
                        <template #default="scope">
                            <dict-tag :options="sys_user_name" :value="scope.row.managerId" />
                        </template>
                    </el-table-column>
                    <el-table-column label="个人履职得分" prop="score">
                        <template #default="scope">
                            {{(parseFloat(scope.row.score)).toFixed(0)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="排名" >
                        <template #default="scope">
                            {{scope.row.pm}}
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="万家行2.0" name="visit">
                <div class="more_link">
                    <el-link type="primary" @click="linkUrl()">更多</el-link>
                </div>
                <VisitSort :data="visitList" :loading="visitloading" :workDate="workDate"/>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    
</template>

<script>
import { getPerformanceList, getManagerLzList, getVisitList } from "@/api/szhl/jxkh/performance";
import VisitSort from './card/VisitSort';
const reportUrl = ref(import.meta.env.VITE_APP_BASE_REPORT ); // 报表服务器地址
const activeName = ref('jx')
const loading = ref(false);
const jxList = ref([]);
const lzList = ref([]);
const visitList = ref([]);
const visitloading = ref(false);
const handleClickEffect = (proxy, workDate) => {
    const handleStaffClick = (managerId,activeName) =>{
        proxy.$router.push({path: "/manager/performance",query: {workDate: workDate.value, managerId: managerId, activeName: activeName}});
    }
    const linkUrl = ()=>{
                //路由跳转, query: {url: url}
                const url = 'szhl/jxkh/客户经理/万家行2.cpt';
                proxy.$router.push({path: "/szhl/report/agency/",query: {url: reportUrl.value+url}});
            }
    const linkUrlLz = ()=>{
        //路由跳转, query: {url: url}
        const url = 'szhl/jxkh/客户经理/2025客户经理履职得分.cpt';
        proxy.$router.push({path: "/szhl/report/agency/",query: {url: reportUrl.value+url}});
    }        
    return { handleStaffClick, linkUrl, linkUrlLz }
}

export default {
    components: { VisitSort },
    props: { workDate: String, org: String },
    setup( props ){
        const { workDate, org }= toRefs(props);
        const { proxy } = getCurrentInstance();
        const { sys_org_name, sys_user_name } = proxy.useDict("sys_org_name","sys_user_name");
        //监控数据日期变化
        watch([workDate,org],()=>{
            if(workDate.value != '' && org.value!=''&&workDate.value != undefined && org.value!=undefined){
                loading.value = true;
                visitloading.value = true;
               getPerformanceList(org.value, workDate.value).then(res => {
                    jxList.value = res.data;
                    loading.value = false;
                });
                getManagerLzList(org.value, workDate.value).then(res => {
                    lzList.value = res.data;
                    loading.value = false;
                });
            getVisitList(org.value, workDate.value).then(res => {
                    visitList.value = res.data;
                    visitloading.value = false;
                });
            }
            
        })
        const { handleStaffClick, linkUrl, linkUrlLz } = handleClickEffect(proxy, workDate);
        return { activeName, loading, visitloading, jxList, sys_org_name, sys_user_name, handleStaffClick, workDate, lzList, visitList, linkUrl, linkUrlLz }
    }

    
}
</script>
<style scoped>
.more_link{
    text-align: right;
    margin-top: -5px;
    color: dodgerblue;
}
</style>