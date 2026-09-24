<template>
    <!-- <el-dialog :title="title" v-model="openCredit"> -->
        <el-table :data="creditList">
          <el-table-column label="征信日期" prop="reportDate" align="center" width="110"></el-table-column>
          <el-table-column label="机构数" prop="loanOrgNum" align="center" width="100"></el-table-column>
          <el-table-column label="贷款余额" prop="normalContractBal" align="center" width="100"></el-table-column>
          <el-table-column label="卡机构数" prop="creditOrgNum" align="center" width="110" ></el-table-column>
          <el-table-column label="透支余额" prop="creditUsed" align="center" width="110" ></el-table-column>
          <el-table-column label="还款责任" prop="repaymentBal" align="center" width="80" ></el-table-column>
          <el-table-column label="逾期金额" prop="overDueBal" align="center" width="100"></el-table-column>
          <el-table-column label="呆账金额" prop="debtsBal" align="center" width="160"></el-table-column>
        </el-table>
    <!-- </el-dialog> -->
</template>
<script>
import { ref } from "vue"
import { getCreditList } from "@/api/szhl/market/dueContract.js";
const openCredit = ref(false);
const creditList = ref([]);
export const initData = ()=> {
    const openCreditDialog = (custId)=>{
        openCredit.value = true;
        getCreditList(custId).then(response => {
            creditList.value = response.data;
        });
    }
    
    return { openCredit, creditList, openCreditDialog }
}


export default{ 
    name: 'Credit',
    setup() {
        const { openCredit,  creditList, openCreditDialog } = initData();
        return { openCredit,  creditList, openCreditDialog }
    }
}
</script>