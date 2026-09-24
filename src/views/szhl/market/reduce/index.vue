<template>
<div>
      <loan-reduce-list ref="loanReduceRef" :showSearch="showSearch" :showTotal="showTotal" :showDeal="showDeal"
      @handleClickDeal="handleClickDeal" 
      @handleClickCustId="handleClickCustId"
      @handleClickCustName="handleClickCustName"
      @handleClickContractNo="handleClickContractNo"
      @handleClickReportDateLoan="handleClickReportDateLoan"
      @handleClickOtherBank="handleClickOtherBank"
      @handleClickCredit="handleClickCredit"
      @handleUserName="handleUserName"
      @total="getTotal"
      ></loan-reduce-list>
      <!-- 弹窗组件 -->
      <!-- 触达弹窗 -->
      <record ref="recordRef" @list="getList" :type="'market_contract_interactive_type'"/>
      <!-- 触达历史弹窗 -->
      <record-history ref="recordHistoryRef" /> 
      <!--本人及配偶我行贷款明细-->
      <self-spouse-contract ref="selfSpouseContract" />
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
import LoanReduceList from './list/LoanReduceList.vue';
import Record from './record/Record.vue';
import RecordHistory from '../contract/record/RecordHistory.vue';
import Contract from '../contract/info/Contract.vue';
import OtherBankLoan from '../contract/other/OtherBankLoan.vue';
import CreditDialog from '../contract/credit/CreditDialog.vue';
import Staff from './staff/Staff';
import SelfSpouseContract from '../loan/info/SelfSpouseContract';

export default {
    name: 'LoanReduce',
    components: { LoanReduceList,Record, RecordHistory, Contract, OtherBankLoan, CreditDialog, Staff, SelfSpouseContract },
    setup ( ) {
        const { proxy } = getCurrentInstance();
        const loanReduceRef = ref(null);
        const recordRef = ref(null);
        const recordHistoryRef = ref(null);
        const selfSpouseContract = ref(null);
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
            unref(loanReduceRef).handleQuery();
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
            // proxy.$modal.alert("客户360视图暂未上线");
        }
        //点击客户名称(子组件调用方式二)
        const handleClickCustName = ( custId ) => {
            //语法糖才能使用下面的方法调用子组件
            //RecordHistory.value.openHistoryDialog();
            unref(recordHistoryRef).openHistoryDialog(custId);
        }
        //点击基期贷款总额
        const handleClickContractNo = ( row ) => {
             unref(selfSpouseContract).openContractDialog(row.custNo,row.basePeriodDate);
             unref(selfSpouseContract).getSelfSpouseContractAccountList(row.custNo,row.basePeriodDate);
        }

            //点击报告期期贷款总额
        const handleClickReportDateLoan = ( row ) => {
            debugger
             unref(selfSpouseContract).openContractDialog(row.custNo, new Date(parseInt(+new Date() - 3600*1000*24)).toLocaleDateString().replace(/[/]+/g,'-'));
             unref(selfSpouseContract).getSelfSpouseContractAccountList(row.custNo, new Date(parseInt(+new Date() - 3600*1000*24)).toLocaleDateString().replace(/[/]+/g,'-'));
        }
        //点击他行余额
        const handleClickOtherBank = ( row) => {
            unref(otherBankLoanRef).openOtherBankLoanDialog(row.lastReportId,row.lastCreditInvestigationDate);
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
        const changeLoanReduceSearch = () => {
            showSearch.value = false;
            showTotal.value = false;
            showDeal.value = false;
        }
        const getTotal = (total) => {
            proxy.$emit('total',total);
        }
        //返回值
        return {loanReduceRef,recordRef, recordHistoryRef , otherBankLoanRef, creditRef, staffRef, showSearch, showTotal, showDeal, changeLoanReduceSearch,getTotal,selfSpouseContract,
        getList,handleClickDeal, handleClickCustId, handleClickCustName, handleClickContractNo, handleClickOtherBank, handleClickCredit,handleUserName,handleClickReportDateLoan }
    }
}

</script>
