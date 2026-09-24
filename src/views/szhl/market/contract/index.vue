<template>
<div>
      <due-contract-list ref="dueContractRef" :showSearch="showSearch" :showTotal="showTotal" :showDeal="showDeal"
      @handleClickDeal="handleClickDeal" 
      @handleClickCustId="handleClickCustId"
      @handleClickCustName="handleClickCustName"
      @handleClickContractNo="handleClickContractNo"
      @handleClickOtherBank="handleClickOtherBank"
      @handleClickCredit="handleClickCredit"
      @handleUserName="handleUserName"
      @total="getTotal"
      ></due-contract-list>
      <!-- 弹窗组件 -->
      <!-- 触达弹窗 -->
      <record ref="recordRef" @list="getList" :type="'market_contract_interactive_type'"/>
      <!-- 触达历史弹窗 -->
      <record-history ref="recordHistoryRef" /> 
      <!-- 合同弹窗 -->
      <contract ref="contractRef" />
      <!-- 他行贷款 -->
      <other-bank-loan ref="otherBankLoanRef" />
      <!-- 征信弹窗 -->
      <credit-dialog ref="creditRef"></credit-dialog>
      <!-- 责任人弹窗 -->
      <staff ref="staffRef"></staff>
</div>
</template>
<script>
import  { getCurrentInstance, unref } from 'vue';
import DueContractList from './list/DueContractList.vue';
import Record from './record/Record.vue';
import RecordHistory from './record/RecordHistory.vue';
import Contract from './info/Contract.vue';
import OtherBankLoan from './other/OtherBankLoan.vue';
import CreditDialog from './credit/CreditDialog.vue';
import Staff from './staff/Staff';

export default {
    name: 'DueContract',
    components: { DueContractList,Record, RecordHistory, Contract, OtherBankLoan, CreditDialog, Staff },
    setup ( ) {
        const { proxy } = getCurrentInstance();
        const dueContractRef = ref(null);
        const recordRef = ref(null);
        const recordHistoryRef = ref(null);
        const contractRef = ref(null);
        const otherBankLoanRef = ref(null);
        const creditRef = ref(null);
        const staffRef = ref(null);
        //查询条件显示
        const showSearch = ref(true);
        //分页显示
        const showTotal = ref(true);
        //分页显示
        const showDeal = ref(true);
        //查询列表
        const getList = () => {
            unref(dueContractRef).handleQuery();
        }
        //处理按钮点击(子组件调用方式一)
        const handleClickDeal = ( row ) => {
            unref(recordRef).handleDispose(row);
        }
        //点击客户号
        const handleClickCustId = ( row ) => {
            if(row.custNo.trim().startsWith('81')){
                proxy.$router.push("/customer/detail/" + row.custNo.trim());
            }else{
                proxy.$modal.alert("企业客户360视图暂未上线");
            }
        }
        //点击客户名称(子组件调用方式二)
        const handleClickCustName = ( custId ) => {
            //语法糖才能使用下面的方法调用子组件
            //RecordHistory.value.openHistoryDialog();
            unref(recordHistoryRef).openHistoryDialog(custId);
        }
        //点击合同号
        const handleClickContractNo = ( row ) => {
            unref(contractRef).openContractDialog(row.contractNo);
            unref(contractRef).getAccountList(row.contractNo,row.reportDate);
        }
        //点击他行余额
        const handleClickOtherBank = ( row ) => {
            unref(otherBankLoanRef).openOtherBankLoanDialog(row.reportNo,row.lastCreditInvestigationDate);
        }
        //点击征信历史
        const handleClickCredit = ( custId ) => {
            unref(creditRef).openFn(custId);
        }
        //点击责任人按权限区分
        const handleUserName = (row)=>{
            unref(staffRef).openStaffDialog(row);
        }
        //显示条件
        const changeSearch = () => {
            showSearch.value = false;
            showTotal.value = false;
            showDeal.value = false;
        }
        const getTotal = (total) => {
            proxy.$emit('total',total);
        }
        //返回值
        return {dueContractRef,recordRef, recordHistoryRef ,contractRef, otherBankLoanRef, creditRef, staffRef, showSearch, showTotal, showDeal, changeSearch,getTotal,
        getList,handleClickDeal, handleClickCustId, handleClickCustName, handleClickContractNo, handleClickOtherBank, handleClickCredit,handleUserName }
    }
}

</script>
