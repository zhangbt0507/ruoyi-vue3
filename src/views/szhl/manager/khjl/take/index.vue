<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm"  :inline="true" label-width="68px">
            <el-form-item label="考核月份" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.period" placeholder="请选择考核月份"  type="month"  format="YYYYMM" value-format="YYYYMM" style="width: 120px"></el-date-picker>
            </el-form-item>
            <el-form-item label="产品" prop="custId">
                <el-select v-model="queryParams.product" placeholder="请选择产品"  style="width:196px" clearable>
                    <el-option
                    v-for="dict in product"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="考核机构" prop="org" label-width="80">
                <el-select v-model="queryParams.assessOrg"  placeholder="请选择机构"  style="margin-top:-5px">
                  <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                    <span style="float:left">{{item.deptName}}</span>
                    <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                  </el-option>
                </el-select>
          
            </el-form-item>
            <el-form-item label="客户号" prop="custId">
                <el-input
                v-model="queryParams.custId"
                placeholder="请输入客户号"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                />
            </el-form-item>
            <el-form-item label="客户名称" prop="custName">
                <el-input
                v-model="queryParams.custName"
                placeholder="请输入客户名称"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                />
            </el-form-item>
            <el-form-item label="柜员号" prop="managerId">
                <el-input
                v-model="queryParams.managerId"
                placeholder="请输入柜员号"
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
              v-hasPermi="['performance:take:add']"
          >新增</el-button>
        </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="assignClick"
          v-hasPermi="['performance:take:assign']"
        >分配柜员</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['performance:take:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExportUnAssign"
          v-hasPermi="['performance:take:export-un']"
        >导出未分配</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['performance:take:import']"
        >导入待分配指标</el-button>
        </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Upload"
          @click="handleImportAssign"
          v-hasPermi="['performance:take:importAssign']"
        >导入分配结果</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" />
        <el-table-column label="考核月份"  align="center" prop="period" />
        <el-table-column label="产品类型"  align="center" prop="product" >
          <template #default="scope">
            <dict-tag :options="product" :value="scope.row.product"/>
          </template>
        </el-table-column>
        <el-table-column label="考核网点"  align="center" prop="assessOrg">
          <template #default="scope">
            <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
          </template>
        </el-table-column>
        <el-table-column label="客户号"  align="center" prop="custId"/>
        <el-table-column label="客户名称"  align="center" prop="custName"/>
        <el-table-column label="备注"  align="center" prop="remark"/>
        <el-table-column label="分配柜员号"   align="center" prop="managerId">
          <!-- <template #default="scope">
            <dict-tag :options="sys_user_name" :value="scope.row.managerId"/>
          </template> -->
        </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  v-hasPermi="['performance:take:edit']">
        <template #default="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['performance:take:edit']"
          >修改</el-button>
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
 <el-dialog :title="title" v-model="open" width="750px" append-to-body >
      <el-form ref="takeRef" :model="form" :rules="rules" label-width="90px" inline>
        <el-form-item label="考核月份" prop="period" >
          <el-date-picker v-model="form.period" placeholder="请选择考核月份" type="month" style="width:196px;" format="YYYYMM" value-format="YYYYMM" :disabled="disabled"></el-date-picker>
        </el-form-item>
        <el-form-item label="考核网点" prop="assessOrg" >
          <el-select v-model="form.assessOrg" placeholder="请选择考核网点"  style="width:196px">
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="product" >
          <el-select v-model="form.product" placeholder="请选择产品"  style="width:196px">
            <el-option
              v-for="dict in product"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户号" prop="custId" >
          <el-input v-model="form.custId" placeholder="请输入客户号" />
        </el-form-item>
        <el-form-item label="客户名称" prop="custName"  >
          <el-input v-model="form.custName" placeholder="请输入客户名称" />
        </el-form-item>
        
        <el-form-item label="分配柜员号" prop="managerId"  >
          <select-user v-model="form.managerId"></select-user>
        </el-form-item>
      </el-form>
      
      <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
    </el-dialog>
    <!-- 分配对话框 -->
    <el-dialog title="分配柜员号" v-model="assgin" width="300" append-to-body >
      <select-user v-model="managerId"></select-user>
      <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="assignManager">确 定</el-button>
               <el-button @click="cancelAssign">取 消</el-button>
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
            :action="upload.url   "
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
                  
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm" >确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>
  </div>
</template>
<script>
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import selectUser from '../../../common/selectUser.vue';
import { getTakeOverAssessList, addTakeOverAssess, updateTakeOverAssess, getTakeOverAssessInfo, updateManager } from "@/api/szhl/jxkh/takeOverAssess";
import { listDeptAssess } from "@/api/system/dept";
const orgs = ref([]);
const org = ref();
// 非多个禁用
const multiple = ref(true);
// 非单个禁用
const single = ref(true);
// 遮罩层
const loading = ref(false);
// 选中数组
const ids = ref([]);
// 打开
const open = ref(false);
//标题
const title = ref('');
// 总条数
const total = ref(0);
//禁用
const disabled = ref(true);
// 表格数据
const  dataList = ref([]);
// 打开
const assgin = ref(false);
//修改集合
const takes = ref([]);
//分配客户经理
const managerId = ref([]);
//导入类型
const importType = ref();
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    custId: null,
    custName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    period: [
      { required: true, message: "考核月份必填", trigger: "blur" },
    ],
    assessOrg: [
      { required: true, message: "考核网点必填", trigger: "blur" },
    ],
    product: [
      { required: true, message: "产品必填", trigger: "blur" },
    ],
    custId: [
      { required: true, message: "客户号必填", trigger: "blur" },
    ],
    custName: [
      { required: true, message: "客户名称必填", trigger: "blur" },
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
  url: gatewayUrl("/take-over-assess/import-assign", "performance"),
  //拼接后上传地址
  url1: ""
});
//初始化
const initClickEffect = (proxy)=>{
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
    //获取数据
    const getList = ()=>{
        loading.value = true;
        getTakeOverAssessList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
    }
    //新增
    const handleAdd = ()=>{
        reset();
        disabled.value = false;
        open.value = true;
        title.value = "新增待分配考核数据";
    }
      //重置
    const reset = ()=>{
      form.value = {
        period: undefined,
        product: undefined,
        assessOrg: undefined,
        custId: undefined,
        custName: undefined,
        managerId: undefined
      };
      proxy.resetForm("");
    }
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }
    //修改
    const handleUpdate = (row)=>{
      open.value = true;
      reset();
      form.value = row;
      form.value.method = 'update';
      title.value = '修改待分配考核数据';
    }
    //确定
    const submitForm = ()=>{
        proxy.$refs["takeRef"].validate(valid => {
            if (valid) {
              if(form.value.method === 'update'){
                updateTakeOverAssess(form.value).then(res => {
                  proxy.$modal.msgSuccess("修改成功");
                  open.value = false;
                  getList();
                });
              }else {
                addTakeOverAssess(form.value).then(res => {
                  proxy.$modal.msgSuccess("新增成功");
                  open.value = false;
                  getList();
                });
              }
              
            }
        })
    }

    //选中事件
    const handleSelectionChange = (selection)=>{
        takes.value = selection;
        single.value = selection.length != 1;
    }
    //分配客户经理
    const assignManager = () => {
      updateManager(takes.value, managerId.value).then(res => {
        proxy.$alert( res.msg );
        cancelAssign();
        getList();
      });
    }
    //分配按钮点击
    const assignClick = () => {
      assgin.value = true;
    }
    //取消分配
    const cancelAssign = () => {
      assgin.value = false;
    }
     /** 导出按钮操作 */
     const handleExport = () => {
      proxy.download("take-over-assess/export", {
        ...queryParams.value,
      },`手工分配指标数据_${new Date().getTime()}.xlsx`);
    };
    /** 导出未分配按钮操作 */
    const handleExportUnAssign = () => {
      proxy.download("take-over-assess/export-unAssign", {
        ...queryParams.value,
      },`未分配指标数据_${new Date().getTime()}.xlsx`);
    };
    //导入模板
    const importTemplate = ()=>{
        proxy.download("take-over-assess/importTemplate", {
        }, `待分配导入模板_${new Date().getTime()}.xlsx`);
    }
    const handleImportAssign = ()=>{
        upload.title = "分配指标导入";
        upload.open = true;
        upload.url = gatewayUrl("/take-over-assess/import-assign", "performance");
        importType.value = '0';
    }
    const submitFileForm = ()=>{
      confirmEvent();
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
    //确认导入
    const confirmEvent = ()=>{
      proxy.$refs["uploadRef"].submit();
    }
    const handleImport = ()=>{
        upload.title = "待分配指标导入";
        upload.open = true;
        importType.value = '1';
        upload.url = gatewayUrl("/take-over-assess/import", "performance");
    }
    return { handleQuery, resetQuery, getList, handleAdd, submitForm, handleUpdate, cancel,handleSelectionChange, assignManager, assignClick, cancelAssign, handleExport, handleExportUnAssign,
      handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, importTemplate, handleImportAssign }
}
export default {
    components: { selectUser },
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const { handleQuery, resetQuery, getList, handleAdd, submitForm, handleUpdate, cancel, handleSelectionChange, assignManager, assignClick, cancelAssign,
           handleExport, handleExportUnAssign, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, importTemplate, handleImportAssign } = initClickEffect(proxy);
        getList();
        //获取部门
        listDeptAssess().then(res => {
            orgs.value = res.data;
            org.value = res.data[0]?.code;
        });
         //报表类型数据字典
        const { sys_org_name, sys_user_name, product } = proxy.useDict("sys_org_name", "sys_user_name", "product");
        return { single, queryParams, form, rules, multiple, loading, ids, open, title, total, disabled, dataList, sys_org_name, sys_user_name, product, assgin, takes, managerId, upload,
            handleQuery, resetQuery, getList, handleAdd, submitForm, handleUpdate, cancel, handleSelectionChange, assignManager, assignClick, cancelAssign, handleExport, handleExportUnAssign, 
            handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, importTemplate, handleImportAssign,orgs,org }
    }
}
</script>