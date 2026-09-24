<template>
    <!-- 合同信息弹窗 -->
    <el-dialog :title="title" v-model="openContract"  width="1050" append-to-body>
        <el-form :model="info"  label-width="90px">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="合同号:" prop="contractNo" >
                     {{ info.contractNo }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="合同金额:" prop="contractAmt" >
                     {{ info.contractAmt }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="贷款余额:" prop="loanBalance" >
                     {{ info.loanBalance }}
                  </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="借款用途:" prop="loanPurpose" >
                     {{ info.loanPurpose }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="担保方式:" prop="securityType" >
                     <dict-tag :options="sys_contract_security" :value="info.securityType"></dict-tag>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="合同利率:" prop="rate" >
                     {{ info.rate }}
                  </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="合同日期:" prop="beginDate" >
                     {{ info.beginDate }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="到期日期:" prop="dueDate" >
                     {{ info.dueDate }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="产品代码:" prop="productCode" >
                        {{ info.productCode }}
                  </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="归属机构:" prop="orgNo" >
                     <dict-tag :options="sys_org_name" :value="info.orgNo"></dict-tag>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="责任人:" prop="staffNo" >
                     <dict-tag :options="sys_user_name" :value="info.staffNo"></dict-tag>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="产品名称:" prop="productName" >
                     {{ info.productName }}
                  </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="担保人:" prop="guarantor" >
                     {{ info.guarantor }}
                  </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-table :data="accountList">
          <el-table-column label="借据序号" prop="iouNum" align="center" width="80"></el-table-column>
          <el-table-column label="借款日期" prop="beginDate" align="center" width="100"></el-table-column>
          <el-table-column label="到期日期" prop="endDate" align="center" width="100"></el-table-column>
          <el-table-column label="放款金额" prop="grantAmt" align="center" width="110" :formatter="(row)=>Number(row.grantAmt)"></el-table-column>
          <el-table-column label="贷款余额" prop="loanBalance" align="center" width="110" :formatter="(row)=>Number(row.loanBalance)"></el-table-column>
          <el-table-column label="利率" prop="ll" align="center" width="80" :formatter="(row)=>Number(row.ll)" ></el-table-column>
          <el-table-column label="还贷还息日" prop="lastRepaymentDate" align="center" width="100"></el-table-column>
          <el-table-column label="放款渠道" prop="loanCha" align="center" width="160"></el-table-column>
          <el-table-column label="账号"    prop="loanAcct" align="center" width="160"></el-table-column>
        </el-table>
      </el-dialog>
</template>
<script >
import { ref } from "vue";
import { contractInfo, contractAccountList } from "@/api/szhl/market/dueContract.js";
//合同抬头初始化
const initEffect = ()=> {
    const openContract = ref(false);
    const title = ref('');
    const contractList = ref([]);
    const contractData = reactive({
        info: {},
    });
    const { info } = toRefs(contractData);
    const openContractDialog = (contractNo)=>{
        openContract.value = true;
        title.value = '合同补充信息';
        contractInfo(contractNo).then(response => {
            info.value = response.data;
            // tranContractObj(info,response.data);
        });
    }
    
    return { openContract, title, contractList, info, openContractDialog }
}
// 合同借据信息初始化
const initContractAccount  = () => {
    const loading = ref(false);
    const accountList = ref([]);
    const getAccountList = (contractNo,reportDate) => {
        loading.value = true;
        contractAccountList(contractNo,reportDate).then(response => {
            accountList.value = response.data;
            loading.value = false;
        })
    }
    return { loading, accountList, getAccountList }
}

export default{
    name: 'Contract',
    setup() {
        const { proxy } = getCurrentInstance();
        //数据字典
        const { sys_user_name, sys_org_name, sys_contract_security } = proxy.useDict("sys_user_name", "sys_org_name", "sys_contract_security");
        const { openContract, title, contractList, info, openContractDialog } = initEffect();
        const { loading, accountList, getAccountList } = initContractAccount();
        return { sys_user_name, sys_org_name, sys_contract_security,openContract, loading, title, contractList, info, openContractDialog, 
                 accountList, getAccountList}
    }
}
</script>