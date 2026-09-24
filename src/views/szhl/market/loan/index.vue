<template>
<div>
      <other-bank-loan-marketing-list ref="otherBankLoanMarketingRef" :showSearch="showSearch" :showTotal="showTotal" :showDeal="showDeal"
      @handleClickDeal="handleClickDeal" 
      @handleClickCustId="handleClickCustId"
      @handleClickCustName="handleClickCustName"
      @handleClickContractNo="handleClickContractNo"
      @handleClickOtherBank="handleClickOtherBank"
      @handleClickCredit="handleClickCredit"
      @handleUserName="handleUserName"
      @total="getTotal"
      ></other-bank-loan-marketing-list>
      <!-- 弹窗组件 -->
      <!-- 触达弹窗 -->
      <record ref="recordRef" @list="getList" :type="'other_bank_loan_marketing_interactive_type'"/>
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
import OtherBankLoanMarketingList from '../loan/list/OtherBankLoanMarketingList.vue';
import Record from './record/Record.vue';
import RecordHistory from '../contract/record/RecordHistory.vue';
import Contract from '../contract/info/Contract.vue';
import OtherBankLoan from '../contract/other/OtherBankLoan.vue';
import CreditDialog from '../contract/credit/CreditDialog.vue';
import Staff from './staff/Staff';
import SelfSpouseContract from './info/SelfSpouseContract';

export default {
    name: 'OtherBankLoanMarketing',
    components: { OtherBankLoanMarketingList,Record, RecordHistory, Contract, OtherBankLoan, CreditDialog, Staff, SelfSpouseContract },
    setup ( ) {
        const { proxy } = getCurrentInstance();
        const otherBankLoanMarketingRef = ref(null);
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
            unref(otherBankLoanMarketingRef).handleQuery();
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
        //点击我行贷款
        const handleClickContractNo = ( row ) => {
             unref(selfSpouseContract).openContractDialog(row.custNo, new Date(parseInt(+new Date() - 3600*1000*24)).toLocaleDateString().replace(/[/]+/g,'-'));
             unref(selfSpouseContract).getSelfSpouseContractAccountList(row.custNo, new Date(parseInt(+new Date() - 3600*1000*24)).toLocaleDateString().replace(/[/]+/g,'-'));
        }
        //点击他行余额
        const handleClickOtherBank = ( row ) => {
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
        const changeOtherBankLoanMarketingSearch = () => {
            showSearch.value = false;
            showTotal.value = false;
            showDeal.value = false;
        }
        const getTotal = (total) => {
            proxy.$emit('total',total);
        }
        //返回值
        return {otherBankLoanMarketingRef,recordRef, recordHistoryRef , otherBankLoanRef, creditRef, staffRef, showSearch, showTotal, showDeal, changeOtherBankLoanMarketingSearch,getTotal,selfSpouseContract,
        getList,handleClickDeal, handleClickCustId, handleClickCustName, handleClickContractNo, handleClickOtherBank, handleClickCredit,handleUserName }
    }
}

</script>
