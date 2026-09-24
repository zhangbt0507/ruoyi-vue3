<template>
    <div class="app-container">
        <el-tabs>
            <el-tab-pane label="支行汇总报表">
                <div  style="height:1000px">
                    <iframe  :src="url1"  width="100%" height="100%" scrolling = "no" />
                </div>
            </el-tab-pane>
            <el-tab-pane label="客户经理汇总">
                <div  style="height:1000px">
                    <iframe  :src="url2"  width="100%" height="100%" scrolling = "no" />
                </div>
            </el-tab-pane>
        </el-tabs>
        
    </div>
</template>
<script>
import { dataScopeByMenuRole } from "@/api/system/user";
export default {
    setup() {
        const reportUrl = ref(import.meta.env.VITE_APP_BASE_REPORT ); // 报表服务器地址
        const deptId = ref('');
        const userName = ref('');
        const dataScope = ref('');
        const url1 = ref('');
        const url2 = ref('');
        dataScopeByMenuRole('market:reduce:list').then(response => {
                deptId.value = response.data.deptId;
                userName.value = response.data.userName;
                dataScope.value = response.data.dataScope;
                url1.value = reportUrl.value+"panan/信贷部报表/归雁客群/支行汇总.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value; 
                url2.value = reportUrl.value+"panan/信贷部报表/归雁客群/客户经理汇总.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value+"&userName="+userName.value;
            });
        

        return { url1, url2, deptId }
    },
}
</script>
<style lang="scss" scoped>
iframe {
    border: none;
    margin: 0;
    padding: 0;
}
</style>