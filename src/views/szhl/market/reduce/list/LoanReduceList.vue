<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
            <el-form-item label="客户姓名" prop="custName">
                <el-input
                v-model="queryParams.custName"
                placeholder="请输入客户姓名"
                clearable
                style="width: 180px"
                @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="提醒状态" prop="recordStat">
                <el-select v-model="queryParams.recordStat" placeholder="请选择提醒状态">
                        <el-option
                           v-for="item in sys_contract_status"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"
                        ></el-option>
                     </el-select>
            </el-form-item>
                  <el-form-item label="责任分解" prop="isSameOrg" v-if="userNameChange">
                <el-select v-model="queryParams.isSameOrg" placeholder="请选择是否已分解" v-if="userNameChange">
                        <el-option
                           v-for="item in is_same_org"
                           
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"
                        ></el-option>
                     </el-select>
            </el-form-item>
            <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                    <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        >导出</el-button>
            </el-form-item>
            <right-toolbar :search="false" @queryTable="getList" :columns="columns" style="float:right"></right-toolbar>
        </el-form>
    <el-card>
      <div style="min-height:55vh">
        <!-- 表格数据 -->
      <el-table v-loading="loading" :data="contractList" max-height="55vh" style="font-family: '黑体'" highlight-current-row>
        <el-table-column label="操作" fixed="left" align="center" class-name="small-padding fixed-width" v-if="showDeal1 && showDeal" width="80">
            <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleClickDeal(scope.row)" :disabled="scope.row.recordStat != '1' " v-hasPermi="['market:contract:dispose']">处理</el-button>
            </template>
        </el-table-column>  
         <el-table-column label="客户号" fixed="left" width="210" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickCustId(scope.row)">{{ scope.row.custId }}</el-link>
            </template>
         </el-table-column>
     
         <el-table-column label="客户名称" fixed="left" prop="custName" :show-overflow-tooltip="true" width="180" >
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickCustName(scope.row.custId)">{{ scope.row.custName }}</el-link>
            </template>
         </el-table-column>
         <el-table-column label="本人/配偶电话" prop="tel" v-if="columns[0].visible" :show-overflow-tooltip="true" width="220" align="center"/>

         <el-table-column label="报告日期" prop="lastCreditInvestigationDate" v-if="columns[10].visible" width="110" align="center"/>

         <el-table-column label="提醒日期" prop="reportDate" width="110" align="center"/>

         <el-table-column label="提醒天数" :show-overflow-tooltip="true" width="100" align="center">
            <template #default="scope">
                <span :class="{'text-red': calculateDateDiff(scope.row.reportDate) > 7} ">
                    {{ calculateDateDiff(scope.row.reportDate) }}
                </span>
            </template>
         </el-table-column>

         <el-table-column label="基期贷款余额" prop="basePeriodLoanBanance" v-if="columns[1].visible" width="110" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickContractNo(scope.row)">{{ scope.row.basePeriodLoanBanance }}</el-link>
            </template>
         </el-table-column>

             <el-table-column label="本期余额" prop="reportingPeriodLoanBanance" v-if="columns[2].visible" width="110" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickReportDateLoan(scope.row)">{{ scope.row.reportingPeriodLoanBanance }}</el-link>            </template>
         </el-table-column>

         
          <el-table-column label="机构名称" prop="orgNo" v-if="columns[3].visible" width="100" align="center">
            <template #default="scope">
                <dict-tag :options="sys_org_name" :value="scope.row.orgNo"></dict-tag>
            </template>
         </el-table-column>
         <el-table-column label="责任人"  width="100" v-if="columns[4].visible" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" link v-if="userNameChange"  @click="handleUserName(scope.row)">
                    <dict-tag :options="sys_user_name" :value="scope.row.userName == null ? '' : scope.row.userName "  ></dict-tag>
                </el-link>
                <dict-tag :options="sys_user_name" v-if="!userNameChange"  :value="scope.row.userName == null ? '' : scope.row.userName "  ></dict-tag>
            </template>
         </el-table-column>    
        <el-table-column label="准入分" prop="riskScore" v-if="columns[5].visible" width="80" align="center">
            <template #default="scope">
                <el-tag v-if="scope.row.riskScore!=null&&scope.row.riskScore>=580" type="success" calss="mx-1" >{{ scope.row.riskScore }}</el-tag>
                <el-tag v-if="scope.row.riskScore!=null&&scope.row.riskScore>=520&&scope.row.riskScore<580" type="warning" calss="mx-1">{{ scope.row.riskScore }}</el-tag>
                <el-tag v-if="scope.row.riskScore!=null&&scope.row.riskScore<520" type="danger" calss="mx-1">{{ scope.row.riskScore }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="风险提示" prop="riskWarning" v-if="columns[6].visible" width="80" align="center"/>         
        
       
                  
         <el-table-column label="延迟付息" prop="overdueTimes" v-if="columns[7].visible" width="80" align="center"/>

               <el-table-column label="他行贷款" prop="otherBankLoanBalance" v-if="columns[8].visible"  align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false"  @click="handleClickOtherBank(scope.row)">{{ scope.row.otherBankLoanBalance }}</el-link>
            </template>
         </el-table-column>

           
                <el-table-column label="报告数" prop="creditInvestigationNum" v-if="columns[9].visible" width="80" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickCredit(scope.row.custId)">{{ scope.row.creditInvestigationNum }}</el-link>
            </template>
         </el-table-column>

        <el-table-column label="地址" prop="addr" v-if="columns[11].visible" :show-overflow-tooltip="true" width="250" align="left"/>
         
      </el-table>
    </div>
      <pagination 
         v-show="total > 0 && showTotal"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
    </el-card>
    </div>
</template>
<script>
import useUserStore from '@/store/modules/user';
import { listLoanReduce } from "@/api/szhl/market/loanReduce";
import { toRefs } from 'vue';
//初始化事件
const initEffect = ( proxy ) => {
    const contractList = ref([]);
    const loading = ref(true);
    const total = ref(0);
    const showDeal1 = ref(true);
    const dateRange = ref([]);
    const open = ref(false);
    const roleName = ref('');     

    const data = reactive({
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            custName: undefined,
            recordStat: '1',
            isSameOrg: '1'
        }
    });
  
    const { queryParams } = toRefs(data);
    //获取列表
    const getList = () => {   
        loading.value = true;
        listLoanReduce(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
            loading.value = false;
            contractList.value = res.rows;
            total.value = res.total;
            proxy.$emit('total',res.total);
        }); 
    }
    //搜索事件
    const handleQuery = () => {
             if(queryParams.value.recordStat != '1'){
            showDeal1.value = false;
        }else{
            showDeal1.value = true;
        }
        queryParams.value.pageNum = 1;
        getList();
    }
    //重置事件
    const resetQuery = () => {
        dateRange.value = [];
        proxy.resetForm("queryRef");
        handleQuery();
    }

    //导出
    const handleExport = ()=>{
      proxy.download("market/reduce/export", {
        ...queryParams.value,
      },`贷款流失客户清单_${new Date().getTime()}.xlsx`);
    }
    return { loading, total, contractList, queryParams, getList, handleQuery, resetQuery,open,showDeal1,roleName,handleExport}
}
export default {
    name: 'LoanReduceList',
    props:{ showSearch: Boolean,showTotal: Boolean, showDeal:Boolean },
    setup(props) {
        const { proxy } = getCurrentInstance();
        const { sys_contract_status, sys_user_name, sys_org_name,is_same_org } = proxy.useDict("sys_contract_status", "sys_user_name", "sys_org_name","is_same_org");
        // 初始化变量、事件
        const { loading, total, contractList, queryParams, getList, handleQuery, resetQuery, open,showDeal1,roleName,handleExport } = initEffect( proxy );
        const userNameChange = ref(false);
        //获取列表
        getList();
        //是否显示搜索条件
        const { showSearch, showTotal, showDeal } = toRefs(props);
        //按钮点击事件
        const handleClickDeal = (row)=> {
            proxy.$emit('handleClickDeal',row);
        }
        const handleClickCustId = ( row ) => {
            proxy.$emit('handleClickCustId', row);
        }
        const handleClickCustName = ( custId ) => {
            proxy.$emit('handleClickCustName', custId);
        }
        const handleClickContractNo = (row) => {
            proxy.$emit('handleClickContractNo', row);
        }
             const handleClickReportDateLoan = (row) => {
            proxy.$emit('handleClickReportDateLoan', row);
        }
        
        const handleClickOtherBank = (row) => {
            proxy.$emit('handleClickOtherBank', row);
        }
        const handleClickCredit = (custId) => {
            proxy.$emit('handleClickCredit', custId);
        }
        const handleUserName = (row) => {
            proxy.$emit('handleUserName', row);
        }
        //权限
        const permissions = useUserStore().permissions;
        userNameChange.value = permissions.includes('market:contract:edit');
        // 列显隐信息
        const columns = ref([
            { key: 0, label: `本人/配偶电话`, visible: true },
            { key: 1, label: `基期贷款余额`, visible: true },
            { key: 2, label: `本期余额`, visible: true },
            { key: 3, label: `机构名称`, visible: true },
            { key: 4, label: `责任人`, visible: true },
            { key: 5, label: `准入分`, visible: true },
            { key: 6, label: `风险提示`, visible: true },
            { key: 7, label: `延迟付息`, visible: true },
            { key: 8, label: `他行贷款`, visible: true },
            { key: 9, label: `报告数`, visible: true },
            { key: 10, label: `报告日期`, visible: true },
            { key: 11, label: `地址`, visible: true }
            
        ]);

        
        const calculateDateDiff = (createTime) => {
            if(!createTime) return '-';
            const createDate = new Date(createTime);
            const today = new Date();
            createDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            const diffTime = Math.abs(today - createDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 *24)) -1;
            return diffDays === 0 ? '' : diffDays
        }
        return { sys_contract_status, sys_user_name, sys_org_name,is_same_org, userNameChange, columns,roleName,
        loading, showSearch, showTotal, showDeal, total, contractList, queryParams, getList, handleQuery, resetQuery, open,showDeal1,
        handleClickDeal,handleClickCustId, handleClickCustName, handleClickContractNo, handleClickOtherBank, handleClickCredit, handleUserName,handleClickReportDateLoan,handleExport,calculateDateDiff }
    }
}
</script>

<style>
    .el-scrollbar__bar.is-horizontal {
        height: 12px;
    }

    .text-red {
        color: #F56C6C;
    }
</style>
