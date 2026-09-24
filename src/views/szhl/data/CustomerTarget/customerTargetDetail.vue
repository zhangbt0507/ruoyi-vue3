<template>
  <div class="app-container">
    <!-- 责任人弹窗 -->
    <Staff ref="staffRef"></Staff>
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" >
      <!-- <el-form-item label="支行" prop="branchNo">
        <el-input
          v-model="queryParams.branchNo"
          placeholder="请输入支行号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="网点" prop="assessOrg">
        <el-input
          v-model="queryParams.assessOrg"
          placeholder="请输入网点号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->

      <el-form-item label="客户名称" prop="custName">
        <el-input
          v-model="queryParams.custName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户经理" prop="customerManager">
        <el-input
          v-model="queryParams.customerManager"
          placeholder="请输入客户经理号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="指标名称" prop="targetName">
        <el-input
          v-model="queryParams.targetName"
          placeholder="请输入指标名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="完成情况" prop="targetResult" label-width="80">
          <el-select v-model="queryParams.targetResult">
              <el-option label="未完成" value="0" key="0"></el-option>
              <el-option label="已完成" value="1" key="1"></el-option>
              <el-option label="全部" value="" key=""></el-option>
          </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
        >导出</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
    >
      <el-table-column label="支行" align="center" prop="branchNo" min-width="100">
        <template #default="scope">
            <dict-tag :options="sys_org_name" :value="scope.row.assessOrg.substring(0,5)+'0L'"/>
        </template>
      </el-table-column>
      <el-table-column label="网点" align="center" prop="assessOrg" min-width="100">
        <template #default="scope">
          <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
        </template>
      </el-table-column>
      <el-table-column label="客户内码" align="center" prop="custIsn" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="custId" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="客户名称" align="center" prop="custName" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="客户类型" align="center" min-width="100" :show-overflow-tooltip="true">
        <template v-slot="scope">
            <span v-if="scope.row.customerType === 1">独办行</span>
            <span v-else-if="scope.row.customerType === 2">主办行</span>
            <span v-else-if="scope.row.customerType === 3">300万以上对公</span>
            <span v-else-if="scope.row.customerType === 4">100万及以上个人</span>
        </template>
      </el-table-column>
      <el-table-column label="指标名称" align="center" prop="targetName" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="指标编号" align="center" prop="targetCode" min-width="100" v-if="false" />
      <el-table-column label="目标值" align="center" min-width="100">
          <template #default="scope">
              <span v-if="['0', '1', '2'].includes(scope.row.result_type)">
                  {{ scope.row.targetValue }}
              </span>
              <span v-else-if="scope.row.result_type==='4'">
                  {{ scope.row.targetValue === 1 ? '是' : '否' }}
              </span>
          </template>
      </el-table-column>
      <el-table-column label="当前值" align="center" min-width="100">
          <template #default="scope">
              <span v-if="['0', '1', '2'].includes(scope.row.result_type)">
                  {{ scope.row.actualValue }}
              </span>
              <span v-else-if="scope.row.result_type==='4'">
                  {{ scope.row.actualValue === 1 ? '是' : '否' }}
              </span>
          </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" prop="startDate" min-width="100" />
      <el-table-column label="结束日期" align="center" prop="deadlineDate" min-width="100" />
      <!-- <el-table-column label="客户经理" align="center" prop="customerManager" min-width="100">
          <template #default="scope">
              <dict-tag :options="sys_user_name" :value="scope.row.customerManager"/>
          </template>
        </el-table-column> -->

      <el-table-column label="客户经理"  align="center" min-width="100">
        <template #default="scope">
            <el-link type="danger" :underline="false" link v-if="customerManagerChange && scope.row.customerManager == null"  @click="handleCustomerManager(scope.row)">
                <dict-tag :options="sys_user_name" :value="scope.row.customerManager == null ? '0' : scope.row.customerManager " ></dict-tag>
            </el-link>
            <el-link type="primary" :underline="false" link v-if="customerManagerChange && scope.row.customerManager != null"  @click="handleCustomerManager(scope.row)">
                <dict-tag :options="sys_user_name" :value="scope.row.customerManager == null ? '0' : scope.row.customerManager " ></dict-tag>
            </el-link>

            <dict-tag :options="sys_user_name" v-if="!customerManagerChange"  :value="scope.row.customerManager == null ? '0' : scope.row.customerManager " ></dict-tag>
        </template>
      </el-table-column>

      <el-table-column label="完成情况" align="center" min-width="100">
        <template #default="{row}">
          <el-tag :type="row.targetResult==='1'?'success':'danger'">
            {{ row.targetResult === '1' ? '已完成':'未完成'}}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, openBlock } from 'vue'
import { ElMessage } from 'element-plus'
import { getCustomerTargetDetail } from "@/api/szhl/data/CustomerTarget";
import {useRoute} from 'vue-router'
import Staff from './staff/Staff';
import useUserStore from '@/store/modules/user';


const { proxy } = getCurrentInstance();
const { customer_target_result,sys_user_name,sys_org_name} = proxy.useDict('customer_target_result','sys_user_name','sys_org_name')
const route = useRoute();

const loading = ref(false)
const showSearch = ref(true)

const list = ref([])
const total = ref(0);

const customerManagerChange = ref(false);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  branchNo:'',
  assessOrg:route.query.assessOrg,
  targetResult:route.query.targetResult,
  custName:'',
  customerManager:'',
  customerType:route.query.customerType,
  targetName:''
})

// 获取指标列表数据
function getList() {
  loading.value = true

  getCustomerTargetDetail(queryParams).then(response => {
    list.value = response.rows.map(item => ({
      branchNo:item.branchNo,
      assessOrg	:	item.assessOrg	,
      targetName	:	item.targetName	,
      targetCode	:	item.targetCode	,
      result_type :	item.result_type,
      custIsn	:	item.custIsn	,
      custId	:	item.custId	,
      custName	:	item.custName	,
      customerType	:	item.customerType	,
      targetValue	:	item.targetValue	,
      actualValue	:	item.actualValue	,
      startDate	:	item.startDate	,
      deadlineDate	:	item.deadlineDate	,
      customerManager	:	item.customerManager	,
      targetResult	:	item.targetResult
    }))

    total.value = response.total
    loading.value = false;
  }).catch(error => {
    //console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败，请重试')
    loading.value = false;
  })
}

// 查询操作
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("/CustomerTarget/export", {
    ...queryParams.value,
  }, `精细化客群指标明细_${new Date().getTime()}.xlsx`);
}

const staffRef = ref(null);
 //点击责任人按权限区分
const handleCustomerManager = (row)=>{
  row.branchNo='';
    unref(staffRef).openStaffDialog(row);
}

onMounted(() => {
  getList();
  //权限
  const permissions = useUserStore().permissions;
  //console.log("useUserStore()",useUserStore());
  //console.log("permissions",permissions);
  customerManagerChange.value = permissions.includes('data:CustomerTarget:update');
})

</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style> 