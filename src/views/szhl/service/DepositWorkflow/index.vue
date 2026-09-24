<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"    :inline="true" v-show="showSearch" label-width="68px">
     
      <el-form-item label="客户号" prop="khh">
        <el-input
          v-model="queryParams.khh"
          placeholder="请输入客户号"
          clearable
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="khmc">
        <el-input
          v-model="queryParams.khmc"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
     
      <el-form-item>
        <el-button type="primary" icon="Search"  @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh"  @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
          <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['service:workflow:add']"
          >自营存款申请</el-button>
        </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['service:workflow:edit']"
        >修改</el-button>
      </el-col>
      
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bigCustomerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="客户内码" width="150" align="center" prop="custIsn" />
      <el-table-column label="客户号" width="300" align="center" prop="custId" />
      <el-table-column label="客户名称" width="600" align="left" prop="custName" />
      <el-table-column label="状态" width="100"  align="center" prop="status">
        <!-- <template #default="scope">
          <dict-tag :options="dict.type.customer_type" :value="scope.row.lx"/>
        </template> -->
      </el-table-column>
      <el-table-column label="申请时间"  align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['service:workflow:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['service:workflow:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

     <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body >
      <el-form ref="depositRef" :model="form" :rules="rules" label-width="80px" inline>
        <el-form-item label="存款账号" prop="depositAccount">
          <el-input v-model="form.depositAccount" placeholder="请输入存款账号"  @blur="handleAccount(form.depositAccount)"/>
        </el-form-item>
        <el-form-item label="机构号" prop="openOrg">
          <el-input v-model="form.openOrg"  disabled />
        </el-form-item>
        <el-form-item label="客户内码" prop="custIsn" v-show="false">
          <el-input v-model="form.custIsn" disabled />
        </el-form-item>
        <el-form-item label="客户号" prop="custId">
          <el-input v-model="form.custId" disabled />
        </el-form-item>
        <el-form-item label="客户名称" prop="custName">
          <el-input v-model="form.custName" disabled />
        </el-form-item>
        <el-form-item label="开户日期" prop="openDate" >
          <el-date-picker v-model="form.openDate" format="YYYYMMDD" value-format="YYYYMMDD" style="width: 195px" disabled></el-date-picker>
        </el-form-item>
        <el-form-item label="原归属人" prop="custName">
          <el-input v-model="form.managerId" disabled />
        </el-form-item>
        
      </el-form>
      
      <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
    </el-dialog>
  </div>
</template>

<script>
import { getAccount, createWorkflow } from "@/api/szhl/jxkh/depositWorkflow";
// 遮罩层
const loading = ref(true);
// 选中数组
const ids = ref([]);
// 非单个禁用
const disabled = ref(false);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 机构类客户表格数据
const  bigCustomerList = ref([]);
// 弹出层标题
const title = ref('');
// 是否显示弹出层
const open = ref(false);
//调整日期类型
const options = [
        {
            value: 'openDate',
            label: '开户日期'
        },
        {
            value: 'selfDate',
            label: '自定义日期'
        }
    ]
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    custId: null,
    custName: null,
    depositAccount: null,
    status: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    depositAccount: [
      { required: true, message: "存款账号不能为空", trigger: "blur" }
    ]
  }
})
const { queryParams, form, rules } = toRefs(data);
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
    //新增
    const handleAdd = ()=>{
        reset();
        open.value = true;
        title.value = "自营存款申请";
    }
     //重置
    const reset = ()=>{
      form.value = {
        custId: undefined,
        custName: undefined,
        depositAccount: undefined,
        managerId: undefined,
        status: undefined
      };
      proxy.resetForm("depositRef");
    }
    //账号丢失焦点事件
    const handleAccount = (depositAccount) => {
        loading.value = true;
        getAccount(depositAccount).then(res => {
            form.value = res.data;
        });
    }
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }
    //确定
    const submitForm = ()=>{
        createWorkflow().then(res => {
            console.log(res);
        });
    }
    return { handleAdd, handleAccount, cancel, submitForm }
}
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const { handleAdd, handleAccount, cancel, submitForm } = handleClickEffect(proxy);
        loading.value = false;
        return { showSearch, multiple, single, queryParams, total, form, rules, loading, title, open, options, handleAdd, handleAccount, cancel, submitForm }
    }

}
</script>

<style>

</style>