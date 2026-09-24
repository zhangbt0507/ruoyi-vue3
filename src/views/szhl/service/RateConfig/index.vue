<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"    :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关键字" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入关键字"
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
              v-hasPermi="['rate:config:add']"
          >新增</el-button>
        </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['rate:config:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['rate:config:remove']"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['rate:config:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="rateConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" />
      <el-table-column label="关键字" align="center" prop="key" />
      <el-table-column label="利率"  align="center" prop="rate" />
      <el-table-column label="开始日期"  align="left" prop="beginDate" />
      <el-table-column label="结束日期"  align="center" prop="endDate"/>
      <el-table-column label="备注"  align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['rate:config:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['rate:config:remove']"
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

    <!-- 添加或修改机构类客户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="rateConfigRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关键字" prop="key">
          <el-input v-model="form.key" placeholder="请输入关键字" :disabled="disabled" />
        </el-form-item>
        <el-form-item label="利率" prop="rate">
          <el-input v-model="form.rate" placeholder="请输入利率" />
        </el-form-item>
        <el-form-item label="开始日期" prop="beginDate">
            <el-date-picker v-model="form.beginDate" placeholder="请选择开始日期" format="YYYYMMDD" value-format="YYYYMMDD"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="beginDate">
            <el-date-picker v-model="form.endDate" placeholder="请选择结束日期" format="YYYYMMDD" value-format="YYYYMMDD"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
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
import { getRateConfigList, addRateConfig, updateRateConfig, delRateConfig, getRateConfig } from "@/api/szhl/service/RateConfig";
// 遮罩层
const loading = ref(true);
// 选中数组
const keys = ref([]);
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
const  rateConfigList = ref([]);
// 弹出层标题
const title = ref('');
// 是否显示弹出层
const open = ref(false);

// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    beginDate: null,
    endDate: null,
    key: null,
    rate: null,
    remark: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    beginDate: [
      { required: true, message: "开始日期不能为空", trigger: "blur" }
    ],
    beginDate: [
      { required: true, message: "结束日期不能为空", trigger: "blur" }
    ],
    key: [
      { required: true, message: "关键字不能为空", trigger: "blur" }
    ],
    rate: [
      { required: true, message: "利率不能为空", trigger: "blur" }
    ]
  }
})
const { queryParams, form, rules } = toRefs(data);
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
  //获取数据
    const getList = ()=>{
        loading.value = true;
        getRateConfigList(proxy.addDateRange(queryParams.value)).then(res => {
            rateConfigList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
    }
    //查询
    const handleQuery = ()=>{
        queryParams.value.pageNum = 1;
        getList();
    }
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("rateConfigRef");
        handleQuery();
    }
    //新增
    const handleAdd = ()=>{
        reset();
        disabled.value = false;
        open.value = true;
        form.value.method = "add"
        title.value = "添加配置";
    }
    //修改
    const handleUpdate = (row)=>{
        reset();
        disabled.value = true;
        const  key = row.key || keys.value;
        getRateConfig(key).then(response => {
            form.value = response.data;
            form.value.method = "update"
            open.value = true;
            title.value = "修改配置";
        });
    }
    //reset
    const reset = ()=>{
      form.value = {
        id: undefined,
        beginDate: undefined,
        endDate: undefined,
        key: undefined,
        rate: undefined,
        remark: undefined,
        method: undefined
      };
      proxy.resetForm("rateConfigRef");
    }
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }
    //删除
    const handleDelete = (row)=>{
        const arr = row.key || keys.value;
        proxy.$modal.confirm('是否确认删除"' + arr + '"的数据项？').then(function () {
            return delRateConfig(arr);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    const submitForm = ()=>{
        proxy.$refs["rateConfigRef"].validate(valid => {
          if (valid) {
            if (form.value.method === "update") {
              updateRateConfig(form.value).then(response => {
                proxy.$modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
            } else {
              addRateConfig(form.value).then(response => {
                proxy.$modal.msgSuccess("新增成功");
                open.value = false;
                getList();
              });
            }
        }
     });
    }
    //选中事件
    const handleSelectionChange = (selection)=>{
        keys.value = selection.map(item => item.key);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    return { getList, handleQuery, resetQuery, handleAdd, submitForm, cancel, handleDelete, handleUpdate, handleSelectionChange }
}
export default {
    setup(){
        //获取代理对象
       const { proxy } = getCurrentInstance();
        //点击事件
       const { getList, handleQuery, resetQuery, handleAdd, submitForm, cancel, handleDelete, handleUpdate, handleSelectionChange } = handleClickEffect( proxy );
       //执行一次
       getList();
       return { showSearch, multiple, single, queryParams, total, form, rules, loading, title, open, disabled, rateConfigList, getList, handleQuery, resetQuery,
            handleAdd, submitForm, cancel, handleDelete, handleUpdate, handleSelectionChange
        }
    }
}
</script>

<style>

</style>