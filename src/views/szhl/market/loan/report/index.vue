<template>
    <div class="app-container">
        <el-tabs>
            <el-tab-pane label="他行有贷营销处理汇总报表">
                <div  style="height:1000px">
                    <iframe  :src="url1"  width="100%" height="100%" scrolling = "no" />
                </div>
            </el-tab-pane>
            <el-tab-pane label="他行有贷营销成功统计表">
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
        dataScopeByMenuRole('market:loan:list').then(response => {
                deptId.value = response.data.deptId;
                userName.value = response.data.userName;
                dataScope.value = response.data.dataScope;
                url1.value = reportUrl.value+"szhl/otherbank/他行有贷营销-汇总.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value; 
                url2.value = reportUrl.value+"szhl/otherbank/他行有贷营销成功统计表.cpt&deptId="+deptId.value+"&dataScope="+dataScope.value;             
            });
        

        return { url1, url2,  deptId }
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