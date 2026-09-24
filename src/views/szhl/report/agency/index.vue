<template>
    <div class="app-container">
                <div  style="height:850px">
                    <iframe  :src="url"  width="100%" height="100%" scrolling = "no" />
                </div>
    </div>
</template>
<script>
import  { getCurrentInstance } from 'vue';
import { dataScopeByMenuRole } from "@/api/system/user";
export default {
    setup() {
        const deptId = ref('');
        const userName = ref('');
        const dataScope = ref('');
        const { proxy } = getCurrentInstance();
        const url = ref('');
        //url.value = proxy.$route.query.url;
        dataScopeByMenuRole('report:agency').then(response => {
                deptId.value = response.data.deptId;
                userName.value = response.data.userName;
                dataScope.value = response.data.dataScope;
                url.value = proxy.$route.query.url+"&deptId="+deptId.value+"&dataScope="+dataScope.value; 
            });
        return { url }
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