<template>
    <div class="app-container">
      <el-row :gutter="24">
        
            <!--报表数据-->
            <el-col :span="24" :xs="24">
                <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
                <el-form-item label="报表名称" prop="reportName">
                    <el-input
                        v-model="queryParams.reportName"
                        placeholder="请输入报表名称"
                        clearable
                        style="width: 240px"
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                
                <!-- <el-form-item label="状态" prop="enable">
                    <el-select
                        v-model="queryParams.enable"
                        placeholder="状态"
                        clearable
                        style="width: 240px"
                    >
                        <el-option
                            v-for="dict in sys_normal_disable"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        />
                    </el-select>
                </el-form-item> -->
               
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
                     icon="Plus"
                     @click="handleAdd"
                     v-hasPermi="['system:report:add']"
                  >新增</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="success"
                     plain
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['system:report:edit']"
                  >修改</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:report:remove']"
                  >删除</el-button>
               </el-col>
               <el-table v-loading="loading" :data="reportList" @selection-change="handleSelectionChange" style="width:100%">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="报表名称" width="200" align="center" key="reportName" prop="reportName"  :show-overflow-tooltip="true" />
               <el-table-column label="报表路径" width="300" align="center" key="reportUrl" prop="reportUrl"  :show-overflow-tooltip="true" />
               <el-table-column label="报表类型" width="150" align="center" key="reportType" prop="reportType"  :show-overflow-tooltip="true" >
                <template #default="scope">
                    <dict-tag :options="report_type" :value="scope.row.reportType" ></dict-tag>
                </template>  
               </el-table-column>
               <el-table-column label="显示顺序" width="100" align="center" key="sort" prop="sort"  :show-overflow-tooltip="true" />
               <el-table-column label="说明" width="400" align="center" key="remark" prop="remark"  :show-overflow-tooltip="true" />
               <el-table-column label="启用/停用" width="80" align="center" key="enable" >
                   <template #default="scope">
                     <el-switch
                        v-model="scope.row.enable"
                        @change="handleStatusChange(scope.row)"
                     ></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="创建时间" width="200" align="center" prop="createTime" sortable>
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.createTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="操作" align="center"  class-name="small-padding fixed-width">
                  <template #default="scope">
                     <el-tooltip content="修改" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:report:edit']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="删除" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:report:remove']"></el-button>
                     </el-tooltip>
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
            </el-row>
            <!-- 添加或修改用户配置对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form :model="form" :rules="rules" ref="reportRef" label-width="80px">
            <el-row>
               <el-col :span="24">
                  <el-form-item label="报表名称" prop="reportName">
                     <el-input v-model="form.reportName" placeholder="请输入报表名称"></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="报表路径" prop="reportUrl">
                     <el-input v-model="form.reportUrl"  placeholder="请输入报表路径"></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="报表类型" prop="reportType">
                     <el-select v-model="form.reportType" placeholder="请选择报表类型">
                        <el-option
                           v-for="item in report_type"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="是否启用" >
                     <el-switch v-model="form.enable" ></el-switch>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="显示顺序" prop="sort">
                     <el-input-number v-model="form.sort"  controls-position="right"/>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="备注">
                     <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
            </el-col>
      </el-row>
    </div>
</template>
<script >
import { getReportList, getReport, addReport, updateReport, changeReportEnable, delReport } from "@/api/szhl/service/ReportConfig";

const showSearch = ref(true);
const reportList = ref([]);
const total = ref(0);
const loading = ref(true);
const single = ref(true);
const multiple = ref(true);
const title = ref("");
const open = ref(false);
const reportNames = ref([]);
const ids = ref([]);
const data = reactive({
    form: {
         enable:ref(false)
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        reportName: undefined,
        reportUrl: undefined,
        enable: undefined
    },
    rules: {
        reportName: [{ required: true, message: "报表名称不能为空", trigger: "blur" }, { min: 2, max: 20, message: "报表名称长度必须介于 2 和 20 之间", trigger: "blur" }],
        reportUrl: [{ required: true, message: "报表路径不能为空", trigger: "blur" }],
        reportType: [{ required: true, message: "报表类型不能为空", trigger: "blur" }],
        sort: [{ required: true, message: "显示顺序不能为空", trigger: "blur" }]
    }
});
const { queryParams, form, rules } = toRefs(data);
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
    //获取数据
    const getList = ()=>{
        loading.value = true;
        getReportList(proxy.addDateRange(queryParams.value)).then(res => {
            reportList.value = res.rows;
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
        proxy.resetForm("queryRef");
        handleQuery();
    }
    //新增
    const handleAdd = ()=>{
        reset();
        open.value = true;
        title.value = "添加报表";
    }
    //修改
    const handleUpdate = (row)=>{
        reset();
        const  id = row.id || ids.value;
        getReport(id).then(response => {
            form.value = response.data;
            open.value = true;
            title.value = "修改报表";
        });
    }
    //删除
    const handleDelete = (row)=>{
        const reportIds = row.id || ids.value;
        const reportConfigNames = row.reportName || reportNames.value;
        proxy.$modal.confirm('是否确认删除名称为"' + reportConfigNames + '"的数据项？').then(function () {
            return delReport(reportIds);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    //选中事件
    const handleSelectionChange = (selection)=>{
        ids.value = selection.map(item => item.id);
        reportNames.value = selection.map(item => item.reportName);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    //启用停用
    const handleStatusChange = (row)=>{
        let text = row.enable ? "启用" : "停用";
        proxy.$modal.confirm('确认要"' + text + '""' + row.reportName + '"报表吗?').then(function () {
            return changeReportEnable(row.id, row.enable);
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.enable = row.enable ? false : true;
        });
    }
    const submitForm = ()=>{
        proxy.$refs["reportRef"].validate(valid => {
        if (valid) {
            if (form.value.id != undefined) {
                updateReport(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addReport(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
        }
     });
    }
    //取消按钮
    const cancel = ()=>{
        open.value = false;
        reset();
    }
    const reset = ()=>{
    /** 重置操作表单 */
        form.value = {
        reportName: undefined,
        reportUrl: undefined,
        reporttype: undefined,
        enable: "0",
        sort: undefined,
        remark: undefined
    };
    //proxy.resetForm("reportRef");
    }
    return { getList, handleQuery, resetQuery, handleAdd, handleUpdate, handleDelete, handleSelectionChange, handleStatusChange, submitForm, cancel }
}

export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        //定义点击事件
        const { getList,handleQuery, resetQuery, handleAdd,  handleUpdate, handleDelete, handleSelectionChange, handleStatusChange, submitForm, cancel } = handleClickEffect( proxy );
        //第一次获取列表
        getList();
        //报表类型数据字典
        const { report_type } = proxy.useDict("report_type");
        return { report_type, reportList, showSearch, multiple, single, queryParams, total, form, rules, loading, title, open, 
        getList, handleQuery, resetQuery, handleAdd,  handleUpdate, handleDelete, getList, handleSelectionChange, handleStatusChange, submitForm, cancel}
    }
}



</script>