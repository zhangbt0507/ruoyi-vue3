<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"    :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户内码" prop="nm">
        <el-input
          v-model="queryParams.nm"
          placeholder="请输入客户内码"
          clearable
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
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
      <el-form-item label="类型" prop="lx">
        <el-select v-model="queryParams.lx" placeholder="请选择类型" clearable>
          <el-option
            v-for="dict in customer_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
              v-hasPermi="['BigCustomer:jgl:add']"
          >新增</el-button>
        </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['BigCustomer:jgl:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['BigCustomer:jgl:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['BigCustomer:jgl:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['BigCustomer:jgl:import']"
        >导入</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bigCustomerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="客户内码" width="150" align="center" prop="nm" />
      <el-table-column label="客户号" width="300" align="center" prop="khh" />
      <el-table-column label="客户名称" width="600" align="left" prop="khmc" />
      <el-table-column label="类型" width="100"  align="center" prop="lx">
        <!-- <template #default="scope">
          <dict-tag :options="dict.type.customer_type" :value="scope.row.lx"/>
        </template> -->
      </el-table-column>
      <el-table-column label="创建时间"  align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['BigCustomer:jgl:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['BigCustomer:jgl:remove']"
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
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户内码" prop="nm">
          <el-input v-model="form.nm" placeholder="请输入客户内码" :disabled="disabled" />
        </el-form-item>
        <el-form-item label="客户号" prop="khh">
          <el-input v-model="form.khh" placeholder="请输入客户号"  />
        </el-form-item>
        <el-form-item label="客户名称" prop="khmc">
          <el-input v-model="form.khmc" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="类型" prop="lx">
          <el-select v-model="form.lx" placeholder="请选择类型">
            <el-option
              v-for="dict in customer_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
    </el-dialog>
     <!-- 导入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     注意：每一次导入会覆盖相同内码的数据
                  </div>
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import { listBigCustomer, getBigCustomer, delBigCustomer, addBigCustomer, updateBigCustomer } from "@/api/szhl/service/BigCustomer";
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
//客户号
const customerNames = ref([]);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nm: null,
    khh: null,
    khmc: null,
    lx: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    nm: [
      { required: true, message: "客户内码不能为空", trigger: "blur" }
    ],
    khh: [
      { required: true, message: "客户号不能为空", trigger: "blur" }
    ],
    khmc: [
      { required: true, message: "客户名称不能为空", trigger: "blur" }
    ],
    lx: [
      { required: true, message: "类型不能为空", trigger: "change" }
    ]
  }
})
const { queryParams, form, rules } = toRefs(data);
/*** 导入参数 */
const upload = reactive({
  // 是否显示弹出层（导入）
  open: false,
  // 弹出层标题（导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: gatewayUrl("/BigCustomer/jgl/importData", "performance")
});
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
  //获取数据
    const getList = ()=>{
        loading.value = true;
        listBigCustomer(proxy.addDateRange(queryParams.value)).then(res => {
            bigCustomerList.value = res.rows;
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
        proxy.resetForm("queryForm");
        handleQuery();
    }
    //新增
    const handleAdd = ()=>{
        reset();
        form.value.method = 'add';
        disabled.value = false;
        open.value = true;
        title.value = "添加客户";
    }
    //修改
    const handleUpdate = (row)=>{
        reset();
        disabled.value = true;
        const  id = row.nm || ids.value;
        getBigCustomer(id).then(response => {
            form.value = response.data;
            form.value.method = 'update';
            open.value = true;
            title.value = "修改客户";
        });
    }
    //删除
    const handleDelete = (row)=>{
        const nms = row.nm || ids.value;
        const names = row.khmc || customerNames.value;
        proxy.$modal.confirm('是否确认删除机构类客户名称为"' + names + '"的数据项？').then(function () {
            return delBigCustomer(nms);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }
    //导出
    const handleExport = ()=>{
      proxy.download("BigCustomer/jgl/export", {
        ...queryParams.value,
      },`机构类客户清单_${new Date().getTime()}.xlsx`);
    }
    //reset
    const reset = ()=>{
      form.value = {
        method: undefined,
        khh: undefined,
        khmc: undefined,
        lx: undefined
      };
      proxy.resetForm("customerRef");
    }
    const submitForm = ()=>{
        proxy.$refs["customerRef"].validate(valid => {
          if (valid) {
            if (form.value.method === 'update') {
              updateBigCustomer(form.value).then(response => {
                proxy.$modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
            } else {
              addBigCustomer(form.value).then(response => {
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
        ids.value = selection.map(item => item.khh);
        customerNames.value = selection.map(item => item.khmc);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    const handleImport = ()=>{
        upload.title = "机构类客户导入";
        upload.open = true;
    }
    //导入模板
    const importTemplate = ()=>{
        proxy.download("BigCustomer/jgl/importTemplate", {
        }, `机构类客户导入模板_${new Date().getTime()}.xlsx`);
    }
    const submitFileForm = ()=>{
        proxy.$refs["uploadRef"].submit();
    }
     const handleFileUploadProgress =  (event, file, fileList) => {
        upload.isUploading = true;
    }
    const handleFileSuccess = (response, file, fileList) => {
        upload.open = false;
        upload.isUploading = false;
        proxy.$refs["uploadRef"].handleRemove(file);
        proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
        getList();
    };

    return { bigCustomerList, getList, handleQuery, resetQuery, handleAdd, handleUpdate, handleDelete, handleSelectionChange, cancel, handleExport, submitForm,
     handleImport, importTemplate, submitFileForm, handleFileUploadProgress, handleFileSuccess }
}
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        //点击事件
        const { bigCustomerList, getList, handleQuery, resetQuery, handleAdd, handleUpdate, handleDelete, handleSelectionChange, cancel, handleExport, submitForm, handleImport, importTemplate,
         submitFileForm, handleFileUploadProgress, handleFileSuccess  }  = handleClickEffect(proxy);
       //报表类型数据字典
        const { customer_type } = proxy.useDict("customer_type");
        //第一次获取列表
        getList();
        return { bigCustomerList, customer_type, showSearch, multiple, single, queryParams, total, form, rules, loading, title, open, disabled,
        getList, handleQuery, resetQuery, handleAdd, handleUpdate, handleDelete, handleSelectionChange, cancel, handleExport, submitForm, handleImport, importTemplate, submitFileForm,
         upload, handleFileUploadProgress, handleFileSuccess 
        }
    }
}
</script>
