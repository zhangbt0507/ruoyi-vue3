<template>
    <div class="app-container">
      <div  style="height:850px">
          <iframe  :src="env+url"  width="100%" height="100%" scrolling = "no" />
      </div>
    </div>
</template>

<script>
import { assessReportUrl } from "@/api/szhl/agency/assess";
import { dataScopeByMenuRole } from "@/api/system/user";
export default {
    name: "ReportData",
    setup(){
        const { proxy } = getCurrentInstance();
        const env = ref(import.meta.env.VITE_APP_BASE_REPORT );// 报表服务器地址
        const url = ref('');
        dataScopeByMenuRole('report:agency').then(response => {
                assessReportUrl(proxy.$route.params.assess).then(res => {
                    url.value = res.data.url+"&deptId="+response.data.deptId+"&workDate="+proxy.$route.params.workDate+"&managerId="+proxy.$route.params.managerId+"&dataScope="+response.data.dataScope;
                });
            });
        
        return { env, url }
    }
}
</script>

<style>
iframe {
    border: none;
    margin: 0;
    padding: 0;
}
</style>