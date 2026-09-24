<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm"  :rules="queryRules"  :inline="true" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            <el-form-item label="存款账号" prop="tAcctNo">
                <el-input
                v-model="queryParams.tAcctNo"
                placeholder="请输入存款账号"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                />
           
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
                    icon="Edit"
                    @click="handleAdd"
                    v-hasPermi="['performance:depositManager:add']"
                >新增</el-button>
                </el-col>
               
                <el-col :span="1.5">
                <el-button
                    type="warning"
                    plain
                    icon="Download"
                    @click="handleExport"
                    v-hasPermi="['performance:depositManager:export']"
                    >导出</el-button>
            </el-col>
            <el-col :span="1.5">
            <el-button
                type="danger"
                plain
                icon="Delete"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['performance:depositManager:delete']"
                >删除</el-button>
            </el-col>
      
            </el-row>
    <el-tabs type="card" v-model="activeName">
        <div style="color:red">注意：1.数据来源于管会系统(T+2),建议T+2维护存款 2.此工具只用于网点内部考核台账，预计绩效不单独发放汇入网点公共存款，可作为网点二次分配的参考依据，由网点二次分配 3.只显示本网点的存款数据</div>
        <el-tab-pane label="存款业绩关系明细" name="detail">
        <el-table v-loading="loading" :data="dataList"  @selection-change="handleSelectionChange">
                    <el-table-column type="selection"  align="center" />
                    <el-table-column label="考核网点" width="120" align="center" prop="assessOrg" fixed>
                      <template #default="scope">
                          <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                      </template>
                    </el-table-column>
                    <el-table-column label="客户号" align="center" prop="custId" fixed/>
                    <el-table-column label="客户姓名" align="center" prop="custName" :show-overflow-tooltip="true"  fixed/>
                    <el-table-column label="存款账号"  align="center" prop="acctNo"/>
                    <el-table-column label="余额(万元)"   align="center" prop="curBal"/>
                    <el-table-column label="年日均(万元)"  align="center" prop="nrj"/>
                    <el-table-column label="月日均(万元)"  align="center" prop="yrj"/>
                    <el-table-column label="利率"  align="center" prop="ll"/>
                    <el-table-column label="客户经理"  align="center" prop="managerId">
                        <template #default="scope">
                            <dict-tag :options="sys_user_name" :value="scope.row.managerId"/>{{scope.row.managerId}}
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
          </el-tab-pane>
          <el-tab-pane label="存款维护统计" name="sums">
            <el-table v-loading="loading" :data="jxDataList" stripe >
                
                <el-table-column label="客户经理"  align="center" prop="managerId" width="150">
                    <template #default="scope">
                        <dict-tag :options="sys_user_name" :value="scope.row.managerId" />{{scope.row.managerId}}
                    </template>
                </el-table-column>
                <el-table-column label="存款日均"  align="center" prop="nrj" width="150"/>
                <el-table-column label="存款余额"  align="center" prop="curBal" width="150"/>
            </el-table>
          </el-tab-pane>
     </el-tabs>
     <el-dialog :title="title" v-model="open" width="800px" append-to-body >
      <el-form ref="depositRef" :model="form" :rules="rules" label-width="80px" inline>
        <el-form-item label="存款账号" prop="acctNo">
          <el-input v-model="form.acctNo" placeholder="请输入存款账号"   style="width:220px" @blur="handleBlur(form.acctNo)"/>
        </el-form-item>
        <el-form-item label="归属网点" prop="loanOrg" label-width="90">
          <el-select v-model="form.assessOrg"   style="width:210px" :disabled="disabled">
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
       
        <el-form-item label="客户号" prop="custId" >
          <el-input v-model="form.custId"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="客户名称" prop="postName"  >
          <el-input v-model="form.custName"  :disabled="disabled" style="width:220px" />
        </el-form-item>
        <el-form-item label="开户日期" prop="openDate" >
          <el-input v-model="form.openDate"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="存款余额(万元)" prop="curBal" >
          <el-input v-model="form.curBal"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="客户经理" prop="managerId" >
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
    </div>
</template>
<script>
import { geDepositManagerList, getDepositInfo, addDepositManager, delDepositManager, getDepositManagerJx } from "@/api/szhl/jxkh/depositManager";
import selectUser from '../../../common/selectUser.vue';

const activeName = ref('detail');
// 非多个禁用
const multiple = ref(true);
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
// 表格数据
const  jxDataList = ref([]);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tAcctNo: null,
    custId: null,
    custName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    acctNo: [
      { required: true, message: "存款账号必填", trigger: "blur" },
    ],
    managerId: [
      { required: true, message: "客户经理必填", trigger: "blur" },
    ]
  },
  // 表单校验
  queryRules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ]
  }
})
const { queryParams, form, rules, queryRules } = toRefs(data);
const handleClickEffect = (proxy) => {
    const getList = () => {
        loading.value = true;
        geDepositManagerList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
       getDepositManagerJx(queryParams.value.workDate,queryParams.value.managerId==undefined?'907000':queryParams.value.managerId).then(res => {
            jxDataList.value = res.data;
        });
    }
    //查询
    const handleQuery = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
            if (valid) {
                queryParams.value.pageNum = 1;
                getList();
            }
        })
    }
    //重置
    const resetQuery = ()=>{
        proxy.resetForm("queryForm");
        handleQuery();
    }
    //新增
    const handleAdd = ()=> {
        reset();
        open.value = true;
        title.value = '存款账号维护';
    }
     //重置
    const reset = ()=>{
      form.value = {
        tAcctNo: undefined,
        custName: undefined,
        custId: undefined,
        assessOrg: undefined,
        curBal: undefined,
        managerId: undefined
      };
    }
      //失去焦点事件
    const handleBlur = (acctNo) => {
      if(acctNo != undefined && (acctNo.length===15 || acctNo.length===23)){
        getDepositInfo(acctNo).then(res => {
          if(res.data){
            form.value = res.data;
          }else{
            reset();
            proxy.$modal.msgError("存款账号不存在！");
          }
        }).catch(error =>{
            reset();
        });
      }
    }
    //取消
    const cancel = ()=>{
      open.value = false;
    }
     //确认
    const submitForm = ()=>{
      proxy.$refs["depositRef"].validate(valid => {
            if (valid) {
              addDepositManager(form.value).then(res => {
                  proxy.$modal.msgSuccess("存款账号"+form.value.acctNo+"已维护！");
                  open.value = false;
                  getList();
                })
                
            }
        })
    }
   //删除
    const handleDelete = () => {
        const nos =  ids.value;
        proxy.$modal.confirm('是否确认删除账号"' + nos + '"的维护关系？').then(function () {
            return delDepositManager(nos);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    //选中事件
    const handleSelectionChange = (selection)=>{
        ids.value = selection.map(item => item.acctNo);
        multiple.value = !selection.length;
    }
    //导出
    const handleExport = () => {
      proxy.download("deposit-manager/export", {
        ...queryParams.value,
      },`存款维护清单_${new Date().getTime()}.xlsx`);
    }
    return { getList, handleQuery, resetQuery, handleAdd, handleBlur, cancel, submitForm, handleSelectionChange, handleDelete, multiple, handleExport  }
}

export default {
    components: { selectUser},
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
         //报表类型数据字典
        const { sys_org_name, sys_user_name } = proxy.useDict("sys_org_name", "sys_user_name");
        const { getList, handleQuery, resetQuery, handleAdd, handleBlur, cancel, submitForm, handleSelectionChange, handleDelete, handleExport } = handleClickEffect(proxy)
        return { activeName,loading, total, open, title, disabled, queryParams, form, rules, queryRules, dataList, jxDataList, getList, handleQuery, resetQuery, handleAdd, handleBlur, cancel, submitForm
        ,sys_org_name, sys_user_name, handleSelectionChange, handleDelete, multiple, handleExport  }
    }
}
</script>
