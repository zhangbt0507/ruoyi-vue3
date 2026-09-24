<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"    :inline="true" v-show="showSearch" label-width="68px">
     
      <el-form-item label="柜员号" prop="staffNo">
        <el-input
          v-model="queryParams.staffNo"
          placeholder="请输入柜员号"
          clearable
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="staffName">
        <el-input
          v-model="queryParams.staffName"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
     <el-form-item label="考核月份" prop="period">
      <el-date-picker v-model="queryParams.period" placeholder="请选择考核月份" type="month"  format="YYYY-MM" value-format="YYYY-MM" ></el-date-picker>
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
              v-hasPermi="['service:staff:add']"
          >新增</el-button>
        </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate1"
          v-hasPermi="['service:staff:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['service:staff:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['service:staff:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['service:staff:import']"
        >导入</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="staffList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="柜员号" width="100" align="center" prop="staffNo" />
        <el-table-column label="姓名" width="100" align="center" prop="staffName" />
        <el-table-column label="归属网点" width="150" align="left" prop="belongOrg" >
          <template #default="scope">
            <dict-tag :options="sys_org_name" :value="scope.row.belongOrg"/>
          </template>
        </el-table-column>
        <el-table-column label="考核网点" width="150"  align="center" prop="assessOrg">
          <template #default="scope">
            <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
          </template>
        </el-table-column>
        <el-table-column label="岗位编号" width="100"  align="center" prop="postNo"/>
        <el-table-column label="岗位名称" width="180"  align="center" prop="postName"/>
        <el-table-column label="系数" width="100"  align="center" prop="ratio"/>
        <el-table-column label="数据年月" width="100"  align="center" prop="period"/>
        <el-table-column label="用工性质" width="100"  align="center" prop="staffType"/>
        <el-table-column label="备注" width="200"  align="center" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['service:staff:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleSingleDelete(scope.row)"
            v-hasPermi="['service:staff:remove']"
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
      <el-form ref="staffRef" :model="form" :rules="rules" label-width="80px" inline>
        <el-form-item label="柜员号" prop="staffNo">
          <el-input v-model="form.staffNo" placeholder="请输入柜员号"  :disabled="disabled"/>
        </el-form-item>
        <el-form-item label="姓名" prop="staffName">
          <el-input v-model="form.staffName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="归属网点" prop="belongOrg" >
          <el-select v-model="form.belongOrg" placeholder="请选择归属网点"  style="width:196px">
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
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
        <el-form-item label="岗位编号" prop="postNo" >
          <el-input v-model="form.postNo" placeholder="请输入岗位编号" />
        </el-form-item>
        <el-form-item label="岗位名称" prop="postName"  >
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="考核月份" prop="period" >
          <el-date-picker v-model="form.period" placeholder="请选择考核月份" type="month" style="width:196px;" format="YYYY-MM" value-format="YYYY-MM" :disabled="disabled"></el-date-picker>
        </el-form-item>
        <el-form-item label="用工性质" prop="staffType"  >
          <el-input v-model="form.staffType" placeholder="请输入用工性质"/>
        </el-form-item>
         <el-form-item label="系数" prop="ratio" >
          <el-input-number v-model="form.ratio"  placeholder="请输入系数" style="width:196px;" />
        </el-form-item>
        <el-form-item label="备注" prop="remark" >
          <el-input v-model="form.remark" placeholder="请输入备注"/>
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
        <el-form ref="importRef" :model="imprtForm" :rules="importRules"  >
         <div>
             <el-form-item label="考核月份" prop="period">
                <el-date-picker v-model="imprtForm.period" placeholder="考核月份" type="month" style="width:90px;" size="small" format="YYYY-MM" value-format="YYYY-MM"></el-date-picker>
             </el-form-item>
         </div>
        </el-form>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url1   "
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
                     注意：每一次导入会覆盖相同考核月份的数据
                  </div>
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
      <!-- 导入确认提示框 -->
      <el-dialog title="导入提示" v-model="openConfirm" width="600">
        <span>{{confirmTitle}}</span>
        <template #footer>
             <el-button type="primary" @click="confirmEvent">确 定</el-button>
             <el-button @click="openConfirm = false">取 消</el-button>
        </template>
      </el-dialog>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import gatewayUrl from "@/utils/gatewayUrl";
import { getStaffList, getStaffAllList, getStaffsCount, delStaff, updateStaff, addStaff } from "@/api/szhl/jxkh/staff";
// 遮罩层
const loading = ref(true);
// 选中数组
const staffs = ref([]);
//选中的名称
const staffNames = ref('');
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
const  staffList = ref([]);
// 弹出层标题
const title = ref('');
// 是否显示弹出层
const open = ref(false);
//调整日期类型
const confirmTitle = ref('')
// 弹出确认框
const openConfirm = ref(false);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    staffNo: null,
    staffName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    staffNo: [
      { required: true, message: "柜员号不能为空", trigger: "blur" },
    ],
    staffName: [
      { required: true, message: "姓名不能为空", trigger: "blur" },
    ],
    belongOrg: [
      { required: true, message: "归属网点不能为空", trigger: "blur" },
    ],
    assessOrg: [
      { required: true, message: "考核网点不能为空", trigger: "blur" },
    ],
    postNo: [
      { required: true, message: "岗位编号不能为空", trigger: "blur" },
    ],
    postName: [
      { required: true, message: "岗位名称不能为空", trigger: "blur" },
    ],
    period: [
      { required: true, message: "考核月份不能为空", trigger: "blur" },
    ],
    staffType: [
      { required: true, message: "用工性质不能为空", trigger: "blur" },
    ],
    ratio: [
      { required: true, message: "系数不能为空", trigger: "blur" },
    ]
  },
  imprtForm: {},
  // 表单校验
  importRules: {
    period: [
      { required: true, message: "考核月份必填", trigger: "blur" }
    ]
  }
})
const { queryParams, form, imprtForm, rules, importRules } = toRefs(data);
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
  url: gatewayUrl("/staff/import", "performance"),
  //拼接后上传地址
  url1: ""
});
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
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
        getStaffList(proxy.addDateRange(queryParams.value)).then(res => {
            staffList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
    }
    //新增
    const handleAdd = ()=>{
        reset();
        disabled.value = false;
        open.value = true;
        title.value = "新增考核员工信息";
    }
    //修改
    const handleUpdate = (row)=>{
      disabled.value = true;
      open.value = true;
      reset();
      form.value = row;
      form.value.method = 'update';
      title.value = '修改考核员工信息';
    }
    //修改
    const handleUpdate1 = ()=>{
      disabled.value = true;
      open.value = true;
      reset();
      form.value = staffs.value[0];
      form.value.method = 'update';
      title.value = '修改考核员工信息';
    }
    //批量删除
    const handleDelete = () =>{
      deleteEvent(staffs.value,staffNames.value);
    }
    //单个删除
    const handleSingleDelete = (row) =>{
      deleteEvent([row],row.staffName);
    }
    //删除事件
    const deleteEvent = (staffs,names)=>{
      proxy.$modal.confirm('是否确认删除员工为"' + names + '"的数据项？').then(function () {
            return delStaff(proxy.addDateRange(staffs));
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    //选中事件
    const handleSelectionChange = (selection)=>{
        staffs.value = selection;
        staffNames.value = selection.map(item => item.staffName);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
     //重置
    const reset = ()=>{
      form.value = {
        staffNo: undefined,
        staffName: undefined,
        belongOrg: undefined,
        assessOrg: undefined,
        postNo: undefined,
        postName: undefined,
        period: undefined,
        staffType: undefined,
        ratio: undefined,
        remark: undefined,
        method: undefined
      };
      proxy.resetForm("");
    }
    
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }
    //确定
    const submitForm = ()=>{
        proxy.$refs["staffRef"].validate(valid => {
            if (valid) {
              if(form.value.method === 'update'){
                  updateStaff(form.value).then(res => {
                  proxy.$modal.msgSuccess("修改成功");
                  open.value = false;
                  getList();
                });
              }else {
                addStaff(form.value).then(res => {
                  proxy.$modal.msgSuccess("新增成功");
                  open.value = false;
                  getList();
                });
              }
              
            }
        })
    }
    /** 导出按钮操作 */
    const handleExport = () => {
      proxy.download("staff/export", {
        ...queryParams.value,
      },`考核员工_${new Date().getTime()}.xlsx`);
    };
    //导入模板
    const importTemplate = ()=>{
        proxy.download("staff/importTemplate", {
        }, `考核员工导入模板_${new Date().getTime()}.xlsx`);
    }
    const handleImport = ()=>{
        upload.title = "员工名单导入";
        upload.open = true;
        proxy.resetForm("importRef");
    }
    const submitFileForm = ()=>{
        proxy.$refs["importRef"].validate(valid => {
            if (valid) {
              getStaffsCount(imprtForm.value.period).then(res => {
                if(res.data>0){
                  confirmTitle.value = "考核月份" + imprtForm.value.period + '已经存在' + res.data + '行数据，继续导入会覆盖原有数据，是否继续？';
                  openConfirm.value = true;
                }else{
                  confirmEvent();
                }
              });
            }
        })
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
      upload.url1 = upload.url + "?period=" + imprtForm.value.period;
      proxy.$refs["uploadRef"].submit();
      openConfirm.value = false;
    }

    return { handleQuery, resetQuery, getList, handleAdd, handleUpdate, handleUpdate1, handleDelete, cancel, submitForm, handleImport, submitFileForm, handleSelectionChange,
    handleFileUploadProgress, handleFileSuccess, importTemplate, confirmEvent, handleSingleDelete, handleExport }
}
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        //报表类型数据字典
        const { sys_org_name } = proxy.useDict("sys_org_name");
        //点击事件
        const { handleQuery, resetQuery, getList, handleAdd, handleUpdate, handleUpdate1, handleDelete, cancel, submitForm, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess,
         importTemplate, confirmEvent, handleSelectionChange, handleSingleDelete, handleExport } = handleClickEffect(proxy);
        getList();
        return { showSearch, multiple, single, disabled, queryParams, total, form, rules, loading, title, open, staffList, handleQuery, resetQuery, getList, handleAdd, handleUpdate, handleUpdate1, handleDelete,
         cancel, submitForm, upload, handleImport, submitFileForm, handleFileUploadProgress, handleFileSuccess, importTemplate, importRules, imprtForm, confirmTitle,confirmEvent, handleSelectionChange,
         openConfirm, sys_org_name, handleSingleDelete, handleExport }
    }

}
</script>

<style>

</style>