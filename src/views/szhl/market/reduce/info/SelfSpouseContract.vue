<template>
    <!--我行贷款情况信息弹窗 -->
    <el-dialog :title="title" v-model="openSelfSpouseContract"  width="1190" append-to-body>


        <span style="font-size: 16px">合同明细</span>
         <el-table :data="selfSpouseContractList">

          <el-table-column label="机构名称" prop="orgNo"  width="100" align="center">
            <template #default="scope">
                <dict-tag :options="sys_org_name" :value="scope.row.orgNo"></dict-tag>
            </template>
          </el-table-column>
          <el-table-column label="客户名称" prop="custName" align="center" width="90"></el-table-column>
          <el-table-column label="关系"     prop="relationShip" align="center" width="60"></el-table-column>
          <el-table-column label="合同号"   prop="contractNo" align="center" width="160"></el-table-column>
          <el-table-column label="合同日期" prop="contractBeginDate" align="left" width="120"></el-table-column>
          <el-table-column label="到期日期" prop="contractEndDate" align="left" width="120"></el-table-column>

          <el-table-column label="担保方式" prop="securityType"  width="100" align="center">
            <template #default="scope">
                <dict-tag :options="sys_contract_security" :value="scope.row.securityType"></dict-tag>
            </template>
         </el-table-column>

          <el-table-column label="合同金额" prop="contractBalance" align="left" width="80"></el-table-column>
          <el-table-column label="借款余额" prop="loanBalance" align="left" width="80"></el-table-column>
          <el-table-column label="年利率"   prop="contractRate" align="left" width="80"></el-table-column>
          <el-table-column label="担保人"   prop="guarantor" align="left" width="160"></el-table-column>
        </el-table>
       

        <br/>
        <br/>
        <span style="font-size: 16px">用信明细</span>
          <el-table :data="selfSpouseContractAccountList" >
             <el-table-column label="机构名称" prop="orgNo"  width="100" align="center">
            <template #default="scope">
                <dict-tag :options="sys_org_name" :value="scope.row.orgNo"></dict-tag>
            </template>
            </el-table-column>
            <el-table-column label="客户名称" prop="custName" align="center" width="90"></el-table-column>
            <el-table-column label="关系" prop="relationShip" align="center" width="60"></el-table-column>
            <el-table-column label="合同号" prop="contractNo" align="center" width="160"></el-table-column>
            <el-table-column label="借据序号" prop="iouNum" align="center" width="80"></el-table-column>
            <el-table-column label="担保方式" prop="guaType" align="center" width="80"></el-table-column>
            <el-table-column label="贷款余额" prop="loanBalance" align="center" width="110" :formatter="(row)=>Number(row.loanBalance)"></el-table-column>
            <el-table-column label="借款日期" prop="beginDate" align="center" width="100"></el-table-column>
            <el-table-column label="到期日期" prop="endDate" align="center" width="100"></el-table-column>
            <el-table-column label="放款金额" prop="grantAmt" align="center" width="110" :formatter="(row)=>Number(row.grantAmt)"></el-table-column>
            <el-table-column label="利率" prop="ll" align="center" width="80" :formatter="(row)=>Number(row.ll)" ></el-table-column>
            <el-table-column label="放款渠道" prop="loanCha" align="center" width="140"></el-table-column>
            <el-table-column label="五级分类" prop="stafcls" align="center" width="80"></el-table-column>
            <el-table-column label="账号"    prop="loanAcct" align="center" width="160"></el-table-column>
        </el-table>
        
     
      </el-dialog>
</template>
<script >
import { ref } from "vue";
import { listContract,listContractAccount } from "@/api/szhl/market/otherBankLoanMarketing.js";


//合同抬头初始化
const initEffect = ()=> {
    const openSelfSpouseContract = ref(false);
    const title = ref('');
    const selfSpouseContractList = ref([]);
    const loading = ref(false);

    const openContractDialog = (custNo)=>{     
        openSelfSpouseContract.value = true;
        title.value = '我行贷款情况(万元)';
         listContract(custNo).then(response => {
            loading.value = true;
             selfSpouseContractList.value = response.data;
            
         });
    }
    
    return {  title, selfSpouseContractList,loading,  openContractDialog, openSelfSpouseContract }
}
// 合同借据信息初始化

const initContractAccount  = () => {
    const loading = ref(false);
    const selfSpouseContractAccountList = ref([]);
    const getSelfSpouseContractAccountList = (custNo) => {
        loading.value = true;
        listContractAccount(custNo).then(response => {
            selfSpouseContractAccountList.value = response.data;
            loading.value = false;
        })
    }
    return { loading,  getSelfSpouseContractAccountList,selfSpouseContractAccountList }
}


export default{
    name: 'Contract',
    setup() {
        const { proxy } = getCurrentInstance();
        //数据字典
        const { sys_user_name, sys_org_name, sys_contract_security } = proxy.useDict("sys_user_name", "sys_org_name", "sys_contract_security");
        const { openContract, title, contractList, info, openContractDialog,openSelfSpouseContract,selfSpouseContractList } = initEffect();
        const { loading, selfSpouseContractAccountList, getSelfSpouseContractAccountList } = initContractAccount();
        return { sys_user_name, sys_org_name, sys_contract_security,openContract, title, contractList, info, openContractDialog, openSelfSpouseContract,selfSpouseContractList,
                  selfSpouseContractAccountList, getSelfSpouseContractAccountList 
                 }
    }
}
</script>