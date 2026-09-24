<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
            <el-form-item label="客户姓名" prop="custName">
                <el-input
                v-model="queryParams.custName"
                placeholder="请输入客户姓名"
                clearable
                style="width: 240px"
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
                <el-select v-model="queryParams.isSameOrg" placeholder="请选择" v-if="userNameChange">
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
        <!-- 表格数据 -->
    <el-card>
      <div style="min-height:55vh">
      <el-table v-loading="loading" :data="contractList" style="width:100%;font-family: '黑体'" max-height="55vh" highlight-current-row>
        <el-table-column label="操作" fixed="left" align="center" width="100" class-name="small-padding fixed-width" v-if="showDeal1 && showDeal">
            <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleClickDeal(scope.row)" :disabled="scope.row.recordStat != '1' " v-hasPermi="['market:contract:dispose']">处理</el-button>
            </template>
         </el-table-column>
         <el-table-column label="客户号" fixed="left" width="210" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickCustId(scope.row)">{{ scope.row.custId }}</el-link>
            </template>
         </el-table-column>
         <el-table-column label="客户名称" fixed="left" prop="custName" :show-overflow-tooltip="true" width="160" >
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickCustName(scope.row.custId)">{{ scope.row.custName }}</el-link>
            </template>
         </el-table-column>
         <el-table-column label="联系电话" prop="tel" v-if="columns[0].visible" :show-overflow-tooltip="true" width="120" align="center"/>

         <el-table-column label="提醒日期" prop="reportDate" width="110" align="center"/>
         
         <el-table-column label="合同号" prop="contractNo" v-if="columns[1].visible" width="170" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickContractNo(scope.row)">{{ scope.row.contractNo }}</el-link>
            </template>
         </el-table-column>
         <el-table-column label="合同到期日" prop="dueDate" v-if="columns[2].visible" width="100" align="center"/>
         <el-table-column label="合同金额" prop="contractAmt" v-if="columns[3].visible"  align="center"/>
         <el-table-column label="用款次数" prop="usageCount" v-if="columns[4].visible"  align="center"/>
         <el-table-column label="用信余额" prop="loanBalance" v-if="columns[5].visible"  align="center"/>
         
         <el-table-column label="机构名称" prop="orgNo" v-if="columns[6].visible" width="100" align="center">
            <template #default="scope">
                <dict-tag :options="sys_org_name" :value="scope.row.orgNo"></dict-tag>
            </template>
         </el-table-column>
         <el-table-column label="责任人"   v-if="columns[7].visible" align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" link v-if="userNameChange"  @click="handleUserName(scope.row)">
                    <dict-tag :options="sys_user_name" :value="scope.row.userName == null ? '-' : scope.row.userName " ></dict-tag>
                </el-link>

                <dict-tag :options="sys_user_name" v-if="!userNameChange"  :value="scope.row.userName == null ? '-' : scope.row.userName " ></dict-tag>
            </template>
         </el-table-column>
         <el-table-column label="准入分" prop="riskScore" v-if="columns[8].visible" width="80" align="center">
            <template #default="scope">
                <el-tag v-if="scope.row.riskScore!=null&&scope.row.riskScore>=580" type="success" calss="mx-1" >{{ scope.row.riskScore }}</el-tag>
                <el-tag v-if="scope.row.riskScore!=null&&scope.row.riskScore>=520&&scope.row.riskScore<580" type="warning" calss="mx-1">{{ scope.row.riskScore }}</el-tag>
                <el-tag v-if="scope.row.riskScore!=null&&scope.row.riskScore<520" type="danger" calss="mx-1">{{ scope.row.riskScore }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="风险提示" prop="riskWarning" v-if="columns[9].visible"  align="center"/>
         <el-table-column label="延迟付息" prop="overdueTimes" v-if="columns[10].visible" align="center"/>
         
         
         <el-table-column label="他行贷款" prop="otherBankLoanBalance" v-if="columns[11].visible"  align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false"  @click="handleClickOtherBank(scope.row)">{{ scope.row.otherBankLoanBalance }}</el-link>
            </template>
         </el-table-column>
         <el-table-column label="报告数" prop="creditInvestigationNum" v-if="columns[12].visible"  align="center">
            <template #default="scope">
                <el-link type="primary" :underline="false" @click="handleClickCredit(scope.row.custId)">{{ scope.row.creditInvestigationNum }}</el-link>
            </template>
         </el-table-column>
         <el-table-column label="报告日期" prop="lastCreditInvestigationDate" v-if="columns[13].visible" width="110" align="center"/>
         
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
import { listDueContract } from "@/api/szhl/market/dueContract";
import { toRefs } from 'vue';
//初始化事件
const initEffect = ( proxy ) => {
    const contractList = ref([]);
    const loading = ref(true);
    const showDeal1 = ref(true);
    const total = ref(0);
    const dateRange = ref([]);
    const open = ref(false);
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
        listDueContract(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
            loading.value = false;
            contractList.value = res.rows;
            total.value = res.total;
            proxy.$emit('total',res.total);
        }); 
    }
    //搜索事件
    const handleQuery = () => {
        queryParams.value.pageNum = 1;
        if(queryParams.value.recordStat != '1'){
            showDeal1.value = false;
        }else{
            showDeal1.value = true;
        }
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
      proxy.download("market/contract/export", {
        ...queryParams.value,
      },`临期合同提醒清单_${new Date().getTime()}.xlsx`);
    }
    return { loading, total, contractList, queryParams, getList, handleQuery, resetQuery, open, showDeal1, handleExport }
}
export default {
    name: 'DueContractList',
    props:{ showSearch: Boolean,showTotal: Boolean, showDeal:Boolean },
    setup(props) {
        const { proxy } = getCurrentInstance();
        const { sys_contract_status, sys_user_name, sys_org_name, is_same_org } = proxy.useDict("sys_contract_status", "sys_user_name", "sys_org_name","is_same_org");
        // 初始化变量、事件
        const { loading, total, contractList, queryParams, getList, handleQuery, resetQuery, open, showDeal1, handleExport } = initEffect( proxy );
        const userNameChange = ref(false);
        //获取列表
        getList();
        //是否显示搜索条件，页码，处理按钮
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
            { key: 0, label: `联系电话`, visible: true },
            { key: 1, label: `合同号`, visible: true },
            { key: 2, label: `合同到期日`, visible: true },
            { key: 3, label: `合同金额`, visible: true },
            { key: 4, label: `用款次数`, visible: true },
            { key: 5, label: `用信余额`, visible: true },
            { key: 6, label: `机构名称`, visible: true },
            { key: 7, label: `责任人`, visible: true },
            { key: 8, label: `准入分`, visible: true },
            { key: 9, label: `风险提示`, visible: true },
            { key: 10, label: `延迟付息`, visible: true },
            { key: 11, label: `他行贷款`, visible: true },
            { key: 12, label: `报告数`, visible: true },
            { key: 13, label: `报告日期`, visible: true }
        ]);
        
        return { sys_contract_status, sys_user_name, sys_org_name,is_same_org, userNameChange, columns,
        loading, showSearch, showTotal, showDeal, total, contractList, queryParams, getList, handleQuery, resetQuery, open, showDeal1,
        handleClickDeal,handleClickCustId, handleClickCustName, handleClickContractNo, handleClickOtherBank, handleClickCredit, handleUserName, handleExport }
    }
}
</script>

<style>
    .el-scrollbar__bar.is-horizontal {
        height: 12px;
    }
</style>
