<template>
<div style="width:500px">
    <el-table :data="assesList">
      <el-table-column :label="assesList.zbmc"></el-table-column>
    </el-table>
</div>
    
</template>

<script>
import { getAssessList, getAssessDate, selectAssessByCode, selectAssessByCodeWd, selectAssessByCode2Day, selectAssessByCodeWd2Day} from "@/api/szhl/agency/assess";
import  { ref,getCurrentInstance } from 'vue';
export default {
    setup() {
        const { proxy } = getCurrentInstance();
        const { sys_org_name } = proxy.useDict("sys_org_name");
        const workDate = ref('');
        const assesList = ref([])
        getAssessList().then(res => {
            assesList.value = res.data;
        });
        return { assesList }
    }
}
</script>
<style scoped>
.el-descriptions {
    margin-top: 20px;
}
</style>