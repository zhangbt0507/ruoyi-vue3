<template>
    <div class="app-container">
        <el-card>
            <template #header>
                <span>客户基本信息</span>
            </template>
            <el-form ref="groupRef" :model="form"  :inline="true">
                <el-row>
                    
                    <el-col :span="6">
                        <el-form-item label="客户内码:" prop="custIsn" label-width="120">
                            {{ form.custIsn }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="客户号:" prop="custId" label-width="120">
                            {{ form.custId }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="客户名称:" prop="custName" label-width="120">
                            {{ form.custName }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="联系方式:" prop="tel" label-width="120">
                            {{ form.tel }}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="贷款余额(万元):" prop="dkye" label-width="120">
                            {{ form.dkye }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="存款余额(万元):" prop="ckye" label-width="120">
                            {{ form.ckye }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="是否小微企业:" prop="xwqy" label-width="120">
                            {{ form.xwqy }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="存贷比:" prop="cdb" label-width="120">
                            {{ form.cdb }}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="法定代表人内码:" prop="frCustIsn" label-width="120">
                            <el-link type="primary" :underline="false" @click="openByCust(form.frCustIsn)">{{ form.frCustIsn }}</el-link>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="法定代表人姓名:" prop="frName" label-width="120">
                            {{ form.frName }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="联系方式:" prop="frTel" label-width="120">
                            {{ form.frTel }}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="配偶内码:" prop="poCustIsn" label-width="120">
                            <el-link type="primary" :underline="false" @click="openByCust(form.poCustIsn)">{{ form.poCustIsn }}</el-link>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="配偶姓名:" prop="poName" label-width="120">
                            {{ form.poName }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="联系方式:" prop="poTel" label-width="120">
                            {{ form.poTel }}
                        </el-form-item>
                    </el-col>
                </el-row>
            <el-form-item label="地址:" prop="addr" label-width="120">
                {{ form.addr }}
            </el-form-item>
        </el-form>
        </el-card>
        <el-card>
            <template #header>
                <span>贷款信息(企业、法定代表人、配偶)</span>
            </template>
            <el-table v-loading="loading" :data="qyDataList" >
                <el-table-column label="考核机构" align="center" prop="assessOrg" >
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                </el-table-column>
                <el-table-column label="客户名称"  align="center" prop="custName" >
                    <template #default="scope">
                        <el-link type="primary" :underline="false" @click="handleClick(scope.row)">{{ scope.row.custName }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column label="担保方式"    align="center" prop="dbfs" />
                <el-table-column label="贷款余额(万元)"   align="center" prop="ye" />
                <el-table-column label="贷款日均(万元)"   align="center" prop="nrj" />
                <el-table-column label="加权利率"   align="center" prop="jqll" />
            </el-table>
        </el-card>
       
        <el-card>
            <template #header>
                <span>产品信息</span>
            </template>
            <div>
                <el-tag v-for="(tag, index) in procucts" :key="index" size="large" class="tag" type="success">
                    {{ tag }}
                </el-tag>
            </div>
        </el-card>
        <el-card>
            <template #header>
                <span>走访信息</span>
            </template>
            <el-timeline>
                <el-timeline-item
                v-for="(v, index) in visits" 
                :key="index"
                :timestamp="v.signTnTime"
                >
                <div style="white-space: nowrap;display: flex;">
                    走访人： <dict-tag :options="sys_user_name" :value="v.managerId"/>({{v.managerId}})     走访时长：{{ v.min }}(分钟)    走访反馈：{{ v.visitResult }} 
                </div>       
            </el-timeline-item>
            </el-timeline>
        </el-card>
         <!-- 借据对话框 -->
    <el-dialog title="贷款借据" v-model="open" width="1400px" append-to-body>
        <el-table v-loading="loading4" :data="accountDataList" >
            
            <el-table-column label="借据号"    align="center" prop="loanAccount" />
            <el-table-column label="合同号"   align="center" prop="contratNo" />
            <el-table-column label="担保方式"   align="center" prop="dbfs" >
                <template #default="scope">
                    <dict-tag :options="sys_contract_security" :value="scope.row.dbfs"/>
                </template>
            </el-table-column>
            <el-table-column label="贷款余额"   align="center" prop="dkye" />
            <el-table-column label="贷款日均"   align="center" prop="nrj" />
            <el-table-column label="借据起始日期"   align="center" prop="bgDate" />
            <el-table-column label="借据到期日期"   align="center" prop="edDate" />
            <el-table-column label="贷款用途"   align="center" prop="loanPurpose" />
            <el-table-column label="借据状态"   align="center" prop="loanSts" >
                <template #default="scope">
                    <dict-tag :options="credit_status" :value="scope.row.loanSts"/>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
    </div>
   
</template>

<script>
import { getDgCustomer, getDgLoan, getProduct, getVisit, getLoanAccount } from "@/api/szhl/data/DgCustomer";
const form =ref({})
const qyDataList = ref([])
const loading = ref(true);
const frDataList = ref([])
const loading1 = ref(true);
const procucts = ref([]);
const loading2 = ref(true);
const visits = ref([]);
const loading3 = ref(true);
const accountDataList = ref([]);
const loading4 = ref(true);
const open = ref(false);
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const custId =proxy.$route.query.custId;
        const custIsn =proxy.$route.query.custIsn;
        console.log("custIsn:"+custIsn)
        const frnm =proxy.$route.query.frnm;
        const workDate = proxy.$route.query.workDate;
        //基本信息
        getDgCustomer(custId,workDate).then(res=>{
            form.value = res.data;
        })
        //企业贷款信息
        getDgLoan(custIsn, workDate, frnm).then(res=>{
            qyDataList.value = res.data;
            loading.value=false;
        })
        const handleClick =() =>{
            open.value = true;
            //贷款借据信息
            getLoanAccount(custIsn, workDate).then(res=>{
                accountDataList.value = res.data;
                loading4.value = false;
            })
        }
        
        //产品信息
        getProduct(custIsn, workDate).then(res=>{
            procucts.value = res.data;
            loading2.value = false;
        })
         //走访信息
         getVisit(custId, workDate).then(res=>{
            visits.value = res.data;
            loading3.value = false;
        })
        //打开个人360视图
        const openByCust = (custIsn)=>{
            proxy.$router.push("/customer/detail/" + custIsn.trim());
        }
         //报表类型数据字典
        const { sys_org_name, sys_user_name, sys_contract_security, credit_status } = proxy.useDict("sys_org_name", "sys_user_name", "sys_contract_security", "credit_status");
        return { sys_org_name, sys_user_name, sys_contract_security, form, qyDataList, frDataList, loading, loading1, procucts, loading2, visits, loading3, accountDataList, loading4, handleClick, open,
            credit_status, openByCust }
    }
}
</script>
<style scoped>
.tag{
    gap: 10px;
    flex-wrap: wrap;
    margin-left: 10px;
}
</style>