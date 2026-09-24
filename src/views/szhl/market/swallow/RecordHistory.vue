<template>
    <!-- 触达历史弹窗 -->
    <el-dialog :title="title" v-model="openHistory"  width="800px" append-to-body>
         <el-table :data="recordList" v-loading="loading" >
           <el-table-column label="触达日期" prop="interactiveDate" align="center" width="100"/>
           <el-table-column label="联系电话" prop="tel" align="center" width="120"/>
           <el-table-column label="触达方式" width="100" align="center">
            <template #default="scope" >
                     <template v-for="item in market_contract_interactive_type">
                        <el-tag  v-if="item.value === scope.row.interactiveType" 
                        :key="item.value" 
                        :type="item.elTagType === 'default' ? '':item.elTagType">
                        {{ item.label }}</el-tag>
                     </template>
                      
            </template>
            
           </el-table-column>
           <el-table-column label="触达主题" prop="interactiveSubject" width="100" align="center">
            <template #default="scope" >
                     <template v-for="item in market_contract_interactive_subject">
                        <el-tag  v-if="item.value === scope.row.interactiveSubject" 
                        :key="item.value" 
                        :type="item.elTagType === 'default' ? '':item.elTagType">
                        {{ item.label }}</el-tag>
                     </template>
                      
            </template>
           </el-table-column>
           <el-table-column label="触达结果" prop="result" width="130" align="center">
            <template #default="scope" >
                     <template v-for="item in return_swallow_result">
                        <el-tag  v-if="item.value === scope.row.result" 
                        :key="item.value" 
                        :type="item.elTagType === 'default' ? '':item.elTagType">
                        {{ item.label }}</el-tag>
                     </template>
                      
            </template>
           </el-table-column>
           <el-table-column label="补充说明"  align="center" prop="remark"/>
           
         </el-table>
      </el-dialog>
</template>
<script >
import { ref } from "vue"
import { selectRecordList } from "@/api/szhl/market/dueContract.js";
const initEffect = ()=> {
    const openHistory = ref(false);
    const loading = ref(false);
    const title = ref('');
    const recordList = ref([]);

    const openHistoryDialog = (custId)=>{
        openHistory.value = true;
        title.value = '触达历史记录';
        getList(custId);
    }
    //根据客户号获取触达列表
    const getList = (custId) => {
        selectRecordList(custId).then(response => {
            recordList.value = response.data;
        });
    }
    return { openHistory, loading, title, recordList, openHistoryDialog, getList }
}

export default{
    name: 'RecordHistory',
    setup() {
        const { proxy } = getCurrentInstance();
        const { return_swallow_result, market_contract_interactive_type, market_contract_interactive_subject } = proxy.useDict("return_swallow_result","market_contract_interactive_type","market_contract_interactive_subject");
        const { openHistory, loading, title, recordList, openHistoryDialog, getList } = initEffect();
        return { openHistory, loading, title, recordList, openHistoryDialog, getList, return_swallow_result, market_contract_interactive_type, market_contract_interactive_subject }
    }
}
</script>