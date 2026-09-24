<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="firstListQueryParams" ref="queryForm" :inline="true" v-show="showSearch" >
      <el-form-item label="支行" prop="branchNo">
        <el-input
          v-model="firstListQueryParams.branchNo"
          placeholder="请输入支行号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="网点" prop="assessOrg">
        <el-input
          v-model="firstListQueryParams.assessOrg"
          placeholder="请输入网点号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

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
      :data="firstList"
      show-summary 
      :summary-method="getSummaries"
    >
      <el-table-column label="支行" align="center" prop="branchNo" min-width="100">
        <template #default="scope">
            <dict-tag :options="sys_org_name" :value="scope.row.assessOrg.substring(0,5)+'0L'"/>
        </template>
      </el-table-column>
      <el-table-column label="网点" align="center" prop="assessOrg" min-width="100">
        <template #default="scope">
            <el-link :underline="false" type="primary" @click="handleClickOpenSecondList(scope.row)" ><dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/></el-link>
        </template>
      </el-table-column>
      <el-table-column label="客户类型" align="center" min-width="100" :show-overflow-tooltip="true">
        <template v-slot="scope">
            <span v-if="scope.row.customerType === 1">独办行</span>
            <span v-else-if="scope.row.customerType === 2">主办行</span>
            <span v-else-if="scope.row.customerType === 3">300万以上对公</span>
            <span v-else-if="scope.row.customerType === 4">100万及以上个人</span>
        </template>
      </el-table-column>
      <el-table-column label="客户数" align="center" prop="customercount" min-width="100"/>
      <!-- <el-table-column label="指标总数" align="center" prop="targetcount" min-width="100" /> -->
      <el-table-column label="指标总数" align="center" prop="targetcount" min-width="100">
        <template #default="scope">
            <el-link :underline="false" type="primary" @click="handleClickOpenCustomerTargetDetail(scope.row)" ><dict-tag :options="sys_org_name" :value="scope.row.targetcount"/></el-link>
        </template>
      </el-table-column>
      <el-table-column label="已完成"  align="center" prop="completecount" min-width="100" />
      <el-table-column label="未完成" align="center" prop="dontcompletecount" min-width="100" />
      <el-table-column label="完成率(100%)" align="center" prop="completerate" min-width="100" />
      
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="firstTotal>0"
      :total="firstTotal"
      v-model:page="firstListQueryParams.pageNum"
      v-model:limit="firstListQueryParams.pageSize"
      @pagination="getList"
    />


    <!-- 第二层 -->
    <el-dialog title="网点指标数" v-model="secondListOpen" width="1000px" append-to-body>
      <el-table v-loading="secondListLoading" :data="secondList" >
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
        <el-table-column label="客户经理" align="center" prop="customerManager" min-width="100">
          <template #default="scope">
              <dict-tag :options="sys_user_name" :value="scope.row.customerManager"/>
          </template>
        </el-table-column>
        <el-table-column label="客户数" align="center" prop="customercount" min-width="100">
          <template  #default="scope">
              <el-link :underline="false" type="primary" @click="handleClickOpenThirdList(scope.row)" >{{ scope.row.customercount }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="指标总数" align="center" prop="targetcount" min-width="100" />
        <el-table-column label="已完成"  align="center" prop="completecount" min-width="100" />
        <el-table-column label="未完成" align="center" prop="dontcompletecount" min-width="100" />
        <el-table-column label="完成率(100%)" align="center" prop="completerate" min-width="100" />
      </el-table>

      <pagination
          v-show="secondTotal > 0"
          :total="secondTotal"
          v-model:page="secondListQueryParams.pageNum"
          v-model:limit="secondListQueryParams.pageSize"
          @pagination="getSecondList(secondListQueryParams)"
      />
    </el-dialog>

 <!-- 第三层 -->
    <el-dialog title="客户经理指标数" v-model="thirdListOpen" width="1100px" append-to-body>
      <el-table v-loading="thirdListLoading" :data="thirdList">
        <el-table-column label="客户经理" align="center" prop="customerManager" min-width="100">
          <template #default="scope">
              <dict-tag :options="sys_user_name" :value="scope.row.customerManager"/>
          </template>
        </el-table-column>
        <!-- <el-table-column label="客户姓名" align="center" prop="custName" min-width="200" /> -->
        <el-table-column label="客户姓名" align="center" prop="custName" min-width="200">
          <template  #default="scope">
              <el-link :underline="false" type="primary" @click="handleClickOpenFourthList(scope.row)" >{{ scope.row.custName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="客户内码" align="center" prop="custIsn" min-width="100" />
        <el-table-column label="客户号" align="center" prop="custId" min-width="200" />
        <el-table-column label="指标总数" align="center" prop="targetcount" min-width="100" />
        <el-table-column label="已完成"  align="center" prop="completecount" min-width="100" />
        <el-table-column label="未完成" align="center" prop="dontcompletecount" min-width="100" />
      </el-table>

      <pagination
          v-show="thirdTotal > 0"
          :total="thirdTotal"
          v-model:page="thirdListQueryParams.pageNum"
          v-model:limit="thirdListQueryParams.pageSize"
          @pagination="getThirdList(thirdListQueryParams)"
      />
    </el-dialog>

    <!-- 第四层 -->
    <el-dialog title="指标列表" v-model="fourthListOpen" width="1500px" append-to-body>
      <el-table v-loading="fourthListLoading" :data="fourthList">
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
      <el-table-column label="客户经理" align="center" prop="customerManager" min-width="100">
          <template #default="scope">
              <dict-tag :options="sys_user_name" :value="scope.row.customerManager"/>
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

      <pagination
          v-show="fourthTotal > 0"
          :total="fourthTotal"
          v-model:page="fourthListQueryParams.pageNum"
          v-model:limit="fourthListQueryParams.pageSize"
          @pagination="getFourthList(fourthListQueryParams)"
      />
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, openBlock } from 'vue'
import { ElMessage } from 'element-plus'
// import { getCustomerTargetList } from "@/api/szhl/data/CustomerTarget";
import { getFirstListGroupbyCustomerType,selectSecondList,selectThirdList,getCustomerTargetDetail,selectCustomerTargetCount } from "@/api/szhl/data/CustomerTarget";


const { proxy } = getCurrentInstance();
const { customer_target_result,sys_user_name,sys_org_name} = proxy.useDict('customer_target_result','sys_user_name','sys_org_name')
const router = useRouter();

const loading = ref(false)
const showSearch = ref(true)
const customerTypeFlag = ref('');

//第一层
const firstList = ref([])
const firstTotal = ref(0);
// 查询参数
const firstListQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  branchNo:'',
  assessOrg:''
})
let customercountsum = 0;
let targetcountsum = 0;
let completecountsum = 0;
let dontcompletecountsum = 0;

//第二层
const secondListOpen = ref(false);
const secondList = ref([])
const secondTotal = ref(0);
const secondListLoading = ref(false);
// 查询参数
const secondListQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  branchNo:'',
  assessOrg:'',
  customerType:''
})

//第三层
const thirdListOpen = ref(false);
const thirdList = ref([])
const thirdTotal = ref(0);
const thirdListLoading = ref(false);
// 查询参数
const thirdListQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  branchNo:'',
  assessOrg:'',
  customerManager:'',
  customerType:''
})

//第四层
const fourthListOpen = ref(false);
const fourthList = ref([])
const fourthTotal = ref(0);
const fourthListLoading = ref(false);
// 查询参数
const fourthListQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  branchNo:'',
  assessOrg:'',
  custIsn:'',
  customerType:''
})

// 获取第一层列表数据
function getList() {
  loading.value = true

  getFirstListGroupbyCustomerType(firstListQueryParams).then(response => {
    firstList.value = response.rows.map(item => ({
      branchNo:item.branchNo,
      assessOrg	:	item.assessOrg	,
      targetName	:	item.targetName	,
      targetCode	:	item.targetCode	,
      custIsn	:	item.custIsn	,
      custId	:	item.custId	,
      custName	:	item.custName	,
      customerType	:	item.customerType	,
      targetValue	:	item.targetValue	,
      actualValue	:	item.actualValue	,
      startDate	:	item.startDate	,
      deadlineDate	:	item.deadlineDate	,
      customerManager	:	item.customerManager	,
      targetResult	:	item.targetResult,
      customercount	:	item.customercount	,
      targetcount	:	item.targetcount	,
      completecount	:	item.completecount	,
      dontcompletecount : item.dontcompletecount ,
      completerate	:	item.completerate	
    }))

    firstTotal.value = response.total
    loading.value = false;
  }).catch(error => {
    console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败，请重试')
    loading.value = false;
  })

  selectCustomerTargetCount(firstListQueryParams).then(response => {
    customercountsum = response.customercountsum;
    targetcountsum = response.targetcountsum;
    completecountsum = response.completecountsum;
    dontcompletecountsum = response.dontcompletecountsum;
  })
}

// 查询操作
function handleQuery() {
  firstListQueryParams.pageNum = 1;
  getList();
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}

//合计
function getSummaries(param){
  const sums = [];
  sums[0] = '全行合计';
  sums[1] = '-';
  sums[2] = '-';
  sums[3] = customercountsum;
  sums[4] = h(
          'a',
          {
            style:{color:'#409EFF',cursor:'pointer'},
            //'text-decoration':'underline'
            //指标总数点击跳转
            onClick:()=>{
              router.push({path:'/refinement/customertarget-detail',query:{"targetResult":"0"}})
            }
          },
          `${targetcountsum}`
        )
  sums[5] = completecountsum;
  sums[6] = dontcompletecountsum;
  sums[7] = targetcountsum===0?'0.00':((completecountsum/targetcountsum)*100).toFixed(2);
  return sums;
}
// function getSummaries(param){
//   const {columns,data} = param;
//   const sums = [];
//   let targetcounttotal = 0;
//   let completecounttotal = 0;
  
//   columns.forEach((cloumn,index)=>{
//     const values = data.map(item=>Number(item[cloumn.property]));
//     if(!values.every(value=>isNaN(value))){
//       sums[index] = values.reduce((prev,curr)=>{
//         const value = Number(curr);
//         if(!isNaN(value)){
//           return prev+curr;
//         }else{
//           return prev;
//         }
//       },0);
//       if(index===4){
//         targetcounttotal = sums[index];
//         sums[index] = h(
//           'a',
//           {
//             style:{color:'#409EFF',cursor:'pointer'},
//             //'text-decoration':'underline'
//             //指标总数点击跳转
//             onClick:()=>{
//               router.push({path:'/refinement/customertarget-detail',query:{"targetResult":"0"}})
//             }
//           },
//           `${sums[index]}`
//         )
//       }
//       if(index===5){
//         completecounttotal = sums[index];
//       }
//     }else{
//       sums[index] = '-'
//     }
//   })
//   sums[0] = '合计';
//   sums[1] = '-';
//   sums[2] = '-';
//   sums[7] = targetcounttotal===0?'0.00':((completecounttotal/targetcounttotal)*100).toFixed(2);
//   return sums;
// }

//打开指标明细页面
function handleClickOpenCustomerTargetDetail(row){
  router.push({path:'/refinement/customertarget-detail',query:{"assessOrg":row.assessOrg,"customerType":row.customerType} })
}

//导出
function handleExport() {
  proxy.download("/CustomerTarget/exportTJGroupbyType", {
    ...firstListQueryParams.value,
  }, `精细化客群指标任务统计（根据客户类型分类）_${new Date().getTime()}.xlsx`);
}

// 获取第二层列表数据
function handleClickOpenSecondList(row){
  customerTypeFlag.value=row.customerType;
  secondListOpen.value=true;
  secondListLoading.value = true;
  secondListQueryParams.pageNum = 1;
  secondListQueryParams.assessOrg=row.assessOrg;
  secondListQueryParams.customerType=customerTypeFlag;
  getSecondList(secondListQueryParams);
}
function getSecondList(secondListQueryParams){
  selectSecondList(secondListQueryParams).then(response => {
    secondList.value = response.rows;
    secondTotal.value = response.total
    secondListLoading.value = false;
  }).catch(error => {
    console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败，请重试')
    secondListLoading.value = false;
  })
}

// 获取第三层列表数据
function handleClickOpenThirdList(row){
  thirdListOpen.value=true;
  thirdListLoading.value = true;
  thirdListQueryParams.pageNum = 1;
  thirdListQueryParams.assessOrg=row.assessOrg;
  thirdListQueryParams.customerManager=row.customerManager;
  thirdListQueryParams.customerType=customerTypeFlag;
  getThirdList (thirdListQueryParams);
}

function getThirdList (thirdListQueryParams){
  selectThirdList(thirdListQueryParams).then(response => {
    thirdList.value = response.rows;
    thirdTotal.value = response.total
    thirdListLoading.value = false;
  }).catch(error => {
    console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败，请重试')
    thirdListLoading.value = false;
  })
}

// 获取第四层列表数据
function handleClickOpenFourthList(row){
  fourthListOpen.value=true;
  fourthListLoading.value = true;
  fourthListQueryParams.pageNum = 1;
  fourthListQueryParams.assessOrg=row.assessOrg;
  fourthListQueryParams.custIsn=row.custIsn;
  fourthListQueryParams.customerType=customerTypeFlag;
  getFourthList (fourthListQueryParams);
}

function getFourthList (fourthListQueryParams){
  getCustomerTargetDetail(fourthListQueryParams).then(response => {
    fourthList.value = response.rows;
    fourthTotal.value = response.total
    fourthListLoading.value = false;
  }).catch(error => {
    console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败，请重试')
    fourthListLoading.value = false;
  })
}


onMounted(() => {
  getList()
})


</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style> 