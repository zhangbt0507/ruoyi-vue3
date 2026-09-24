<template>
    <div class="app-container">
                <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
                <el-form-item label="企业名称" prop="enterpriseName">
                    <el-input
                        v-model="queryParams.enterpriseName"
                        placeholder="请输入企业名称"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="信用代码" prop="unifiedSocialCreditCode">
                    <el-input
                        v-model="queryParams.unifiedSocialCreditCode"
                        placeholder="请输入统一信用代码证"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="法人代表名称" prop="legalRepresentative" label-width="100">
                    <el-input
                        v-model="queryParams.legalRepresentative"
                        placeholder="请输入法人代表名称"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="法人证件" prop="identificationNumber">
                    <el-input
                        v-model="queryParams.identificationNumber"
                        placeholder="请输入法人证件"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                
                <el-form-item label="记录状态" prop="recordStat">
                    <el-select
                        v-model="queryParams.recordStat"
                        placeholder="请选择"
                        clearable
                        style="width: 240px"
                    >
                        <el-option
                            v-for="dict in record_stat"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="配偶证件" prop="poId">
                    <el-input
                        v-model="queryParams.poId"
                        placeholder="请输入配偶证件号"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="配偶名称" prop="poName">
                    <el-input
                        v-model="queryParams.poName"
                        placeholder="请输入配偶名称"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="配偶信用代码" prop="poCode" label-width="100">
                    <el-input
                        v-model="queryParams.poCode"
                        placeholder="请输入配偶信用代码"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                    
               
                <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
                </el-form>
                <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                    <el-button
                        type="primary"
                        plain
                        icon="Refresh"
                        @click="clickSync"
                        v-hasPermi="['reload:basic:sync']"
                    >同步</el-button>
                  
               </el-col>
               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
                </el-row>
               <!-- <el-col :span="1.5">
                  <el-button
                     type="success"
                     plain
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['system:report:edit']"
                  >修改</el-button>
               </el-col> -->
               <!-- <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:report:remove']"
                  >删除</el-button>
               </el-col> -->
               <el-table v-loading="loading" :data="basicDataList" @selection-change="handleSelectionChange" style="width:100%">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="统一社会信用代码" width="190" align="center" key="unifiedSocialCreditCode" prop="unifiedSocialCreditCode"  :show-overflow-tooltip="true" />
               <el-table-column label="企业名称" width="190" align="center" key="enterpriseName" prop="enterpriseName"  :show-overflow-tooltip="true" />
               <el-table-column label="法人代表" width="80" align="center" key="legalRepresentative" prop="legalRepresentative"  :show-overflow-tooltip="true" />
               <el-table-column label="成立日期"  width="100" align="center" key="establishmentDate" prop="establishmentDate"  :show-overflow-tooltip="true" />
               <el-table-column label="企业类型" width="100"  align="center" key="enterpriseType" prop="enterpriseType"  :show-overflow-tooltip="true" />
               <el-table-column label="电话" width="120" align="center" key="telephone" prop="telephone"  :show-overflow-tooltip="true" />
               <el-table-column label="法定代表人证件号" width="180" align="center" key="identificationNumber" prop="identificationNumber"  :show-overflow-tooltip="true" />
               <el-table-column label="经营范围" width="250" align="center" key="businessScope" prop="businessScope"  :show-overflow-tooltip="true" />
               <el-table-column label="经营地址" width="250" align="center" key="operatingAddress" prop="operatingAddress"  :show-overflow-tooltip="true" />
               <el-table-column label="省份" width="100" align="center" key="province" prop="province"  :show-overflow-tooltip="true" />
               <el-table-column label="城市" width="100" align="center" key="city" prop="city"  :show-overflow-tooltip="true" />
               <el-table-column label="县区" width="100" align="center" key="conty" prop="conty"  :show-overflow-tooltip="true" />
               <el-table-column label="数据来源" width="100" align="center" key="dataSource" prop="dataSource"  :show-overflow-tooltip="true" />
               <el-table-column label="记录状态"  align="center" key="recordStat" prop="recordStat"  :show-overflow-tooltip="true" >
                 <template #default="scope">
                    <dict-tag :options="record_stat" :value="scope.row.recordStat" ></dict-tag>
                </template> 
               </el-table-column>
               <el-table-column label="配偶客户号" width="200" align="center" key="poId" prop="poId"  :show-overflow-tooltip="true" />
               <el-table-column label="配偶名称" width="180" align="center" key="poName" prop="poName"  :show-overflow-tooltip="true" />
               <el-table-column label="配偶统一社会信用代码" width="190" align="center" key="poCode" prop="poCode"  :show-overflow-tooltip="true" />
               
            </el-table>
            <pagination
               v-show="total > 0"
               :total="total"
               v-model:page="queryParams.pageNum"
               v-model:limit="queryParams.pageSize"
               @pagination="getList"
            />
    </div>
</template>
<script>
import { getBasicDataList, sync } from "@/api/szhl/reloan/BasicData";

const showSearch = ref(true);
const total = ref(0);
const loading = ref(false);
const basicDataList = ref([]);
const data = reactive({
    form: {
         enable:ref(false)
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        relatedCustomerId: undefined,
        enterpriseName: undefined,
        recordStat: undefined,
        legalRepresentative: undefined,
        unifiedSocialCreditCode: undefined,
        poId: undefined,
        poName: undefined,
        poCOde: undefined
    }
});
const { queryParams, form, rules } = toRefs(data);

const handleInitEffect = ( proxy ) =>{
    //获取数据
    const getList = ()=>{
        loading.value = true;
        getBasicDataList(proxy.addDateRange(queryParams.value)).then(res => {
            basicDataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
    }
    //同步数据
    const clickSync = ()=>{
        loading.value = true;
        sync().then(res => {
            proxy.$modal.msgSuccess("同步成功");
            getList();
            loading.value = false;
        })
    }
    //查询
    const handleQuery = ()=>{
        queryParams.value.pageNum = 1;
        getList();
    }
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryRef");
        handleQuery();
    }
    const handleSelectionChange = () => {

    }
    return { getList, clickSync, handleQuery, resetQuery, handleSelectionChange }
}

export default {
    setup() {
        //获取代理对象
        const { proxy } = getCurrentInstance(); 
        const { getList, clickSync, handleQuery, resetQuery, handleSelectionChange } = handleInitEffect(proxy);
        getList();
        //报表类型数据字典
        const { record_stat } = proxy.useDict("record_stat");
        return { showSearch, total, loading, queryParams, form, rules, getList, handleQuery, resetQuery, basicDataList, clickSync, record_stat, handleSelectionChange }
    }
    
}
</script>
