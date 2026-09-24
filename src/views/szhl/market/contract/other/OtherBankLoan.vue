<template>
    <el-dialog :title="title" v-model="openOtherBankLoan"  width="1000" append-to-body>
        <el-table :data="openOtherBankLoanList">
          <el-table-column label="他行贷款余额"    prop="brName" align="center" width="140"></el-table-column>
          <el-table-column label="业务种类" prop="busType" align="center" width="140"></el-table-column>
          <el-table-column label="借款日期" prop="startDt" align="center" width="100"></el-table-column>
          <el-table-column label="到期日期" prop="endDt" align="center" width="100"></el-table-column>
          <el-table-column label="担保方式" prop="guaranType" align="center" width="100"></el-table-column>
          <el-table-column label="借款余额" prop="balance" align="center" width="80"></el-table-column>
          <el-table-column label="利率测算" prop="ll" align="center" width="80"></el-table-column>
          <el-table-column label="五级分类" prop="fiveAdjust" align="center" width="100"></el-table-column>
          <el-table-column label="循环标志" prop="loanType" align="center" width="130"></el-table-column>
        </el-table>
    </el-dialog>
</template>
<script>
import { ref } from 'vue';
import { otherBankLoanList } from '@/api/szhl/market/dueContract.js'
const initEffect  = () => {
    const title = ref('');
    const openOtherBankLoan = ref(false);
    const loading = ref(false);
    const openOtherBankLoanList = ref([]);
    const openOtherBankLoanDialog = (reportNo,lastCreditInvestigationDate) => {     
        loading.value = true;
        otherBankLoanList(reportNo).then(response => {
            openOtherBankLoanList.value = response.data;
            loading.value = false;
        });
        title.value = '他行贷款信息　　　　　数据日期：'+lastCreditInvestigationDate;
        openOtherBankLoan.value = true;
    }
    return { title, openOtherBankLoan, loading, openOtherBankLoanList, openOtherBankLoanDialog }
}

export default{
    name: 'OtherBankLoan',
    setup() {
        const {  title, openOtherBankLoan, loading, openOtherBankLoanList, openOtherBankLoanDialog } = initEffect();
        return {  title, openOtherBankLoan, loading, openOtherBankLoanList, openOtherBankLoanDialog }
    }
}
</script>
