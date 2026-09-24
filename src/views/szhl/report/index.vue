<template>
    <div class="report">
        <div v-for="(list,index) in reportList" :key="index" class="column">
            <div class="header">
                <dict-tag :options="report_type" :value="index" ></dict-tag>
            </div>
            <ul >
                <li v-for="val in list" :key="val.id">
                    <el-link type="primary" :underline="false" @click="open(val.reportUrl)">{{val.reportName}}</el-link>
                </li>
            </ul>
        </div>
    </div>

</template>
<script name="Index">
import { getEnableReportList } from "@/api/szhl/service/ReportConfig";
import  { getCurrentInstance } from 'vue';
    const reportUrl = ref(import.meta.env.VITE_APP_BASE_REPORT ); // 报表服务器地址
    const reportList = ref([]);
    //初始化
    const initEffect = ()=>{
        const getReportList = ()=>{
            getEnableReportList().then(res => {
                reportList.value = res.data;
            });
        }
        return { getReportList };
    }
    //点击事件
    const handleClickEffect = ( proxy )=>{
        const open = (url) => {
            //路由跳转, query: {url: url}
            proxy.$router.push({path: "/szhl/report/agency/",query: {url: reportUrl.value + url}});
        }
        return { open };
    }
    export default{
        setup () {
            const { proxy } = getCurrentInstance();
            //初始化获取数据
            const { getReportList } = initEffect();
            //点击事件
            const { open } = handleClickEffect( proxy );
            //执行一次
            getReportList();
            //报表类型数据字典
            const { report_type } = proxy.useDict("report_type");
            return { reportUrl, reportList, open, report_type }
        }
    }
</script>
<style scoped lang="scss">
    .report{
        height: 800px;
    }
    ul{
        padding: 0px 30px;
        margin-top: 5px;
    }
    li{
        list-style: circle;
    }
    .column {
        float: left;
        width: 20%;
    }
    .header{
        // border-bottom: 1px solid;
        padding: 14px 15px 0px !important;
    }
</style>