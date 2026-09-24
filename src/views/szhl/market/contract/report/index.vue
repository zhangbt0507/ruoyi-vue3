<template>
    <div class="app-container">
        <el-tabs>
            <el-tab-pane label="临期合同处理汇总报表">
                <div  style="height:1000px">
                    <iframe  :src="url1"  width="100%" height="100%" scrolling = "no" />
                </div>
            </el-tab-pane>
            <el-tab-pane style="height:1000px" label="临期合同处理率">
                <iframe  :src="url2"  width="100%" height="100%" scrolling = "no" />
            </el-tab-pane>
            <el-tab-pane style="height:1000px" label="临期合同处理率-2025">
                <iframe  :src="url3"  width="100%" height="100%" scrolling = "no" />
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
        const url3 = ref('');
        dataScopeByMenuRole('market:contract:list').then(response => {
                deptId.value = response.data.deptId;
                userName.value = response.data.userName;
                dataScope.value = response.data.dataScope;
                url1.value = reportUrl.value+"szhl/duecontract/临期合同提醒-汇总.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value;
                url2.value = reportUrl.value+"szhl/duecontract/临期合同处理率.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value;  
                url3.value = reportUrl.value+"szhl/duecontract/临期合同处理率-2025.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value;  
            });
        

        return { url1, url2, url3, deptId }
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