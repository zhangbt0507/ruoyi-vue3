<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="数据日期" prop="workDate" label-width="80">
                <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
            </el-form-item>
            <el-form-item label="贷款机构" prop="loanOrg">
                <el-select v-model="queryParams.loanOrg" clearable filterable placeholder="请选择贷款机构"  style="width:240px" >
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.value+dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
            </el-form-item>
            <el-form-item label="所属商会" prop="commerceName">
                <el-select v-model="queryParams.commerceName" clearable filterable placeholder="请选择所属商会"  style="width:240px" >
                  <el-option
                    v-for="dict in commerce_name"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="合同号" prop="contratNo">
                <el-input
                v-model="queryParams.contratNo"
                placeholder="请输入合同号"
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
            <el-form-item label="客户名称" prop="custName" label-width="80">
                <el-input
                v-model="queryParams.custName"
                placeholder="请输入客户名称"
                clearable
                @keyup.enter="handleQuery"
                style="width: 240px"
                />
            </el-form-item>
            <el-form-item label="营销机构" prop="belong">
                <el-select v-model="queryParams.belong" clearable filterable placeholder="请选择营销机构"  style="width:240px" >
                  <el-option
                    v-for="dict in belong"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
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
                    icon="Edit"
                    @click="handleAdd"
                    v-hasPermi="['data:direct:add']"
                >新增</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleUpdate"
                    v-hasPermi="['data:direct:edit']"
                  >修改</el-button>
                </el-col>
                <el-col :span="1.5">
                <el-button
                type="warning"
                plain
                icon="Download"
                @click="handleExport"
                v-hasPermi="['data:direct:export']"
                >导出</el-button>
            </el-col>
            <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['data:direct:delete']"
        >删除</el-button>
      </el-col>
      
            </el-row>
            <el-tabs type="card" v-model="activeName">
        <el-tab-pane label="贷款合同明细" name="detail">
          <el-table v-loading="loading" :data="dataList"  @selection-change="handleSelectionChange">
                <el-table-column type="selection"  align="center" />
                <el-table-column label="贷款网点" width="100" align="center" prop="loanOrg" fixed>
                  <template #default="scope">
                      <dict-tag :options="sys_org_name" :value="scope.row.loanOrg"/>
                  </template>
                </el-table-column>
                <el-table-column label="客户号" width="190" align="center" prop="custId" fixed/>
                <el-table-column label="客户姓名" width="180" align="center" prop="custName" :show-overflow-tooltip="true"  fixed/>
                <el-table-column label="合同号" width="150"  align="center" prop="contratNo"/>
                <el-table-column label="合同利率" width="80"  align="center" prop="ll"/>
                <el-table-column label="合同额度(万元)" width="120"  align="center" prop="contratMoney"/>
                <el-table-column label="贷款余额(万元)" width="120" align="center" prop="loanBalance"/>
                <el-table-column label="贷款年日均(万元)" width="130" align="center" prop="nrj"/>
                <el-table-column label="起始日期" width="100" align="center" prop="stDate"/>
                <el-table-column label="到期日期" width="100" align="center" prop="edDate"/>
                <el-table-column label="合同状态" width="100" align="center" prop="contratSts">
                  <template #default="scope">
                      <dict-tag :options="credit_status" :value="scope.row.contratSts"/>
                  </template>
                </el-table-column>
                <el-table-column label="担保方式" width="100" align="center" prop="guaranteeForm">
                  <template #default="scope">
                      <dict-tag :options="sys_contract_security" :value="scope.row.guaranteeForm"/>
                  </template>
                </el-table-column>
                <el-table-column label="商会名称" width="100" align="center" prop="commerceName">
                  <template #default="scope">
                      <dict-tag :options="commerce_name" :value="scope.row.commerceName"/>
                  </template>
                </el-table-column>
                <el-table-column label="备注"  align="center" prop="remark"/>
                <el-table-column label="营销机构" width="100" align="center" prop="belong">
                  <template #default="scope">
                      <dict-tag :options="belong" :value="scope.row.belong"/>
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
        <el-tab-pane label="贷款网点统计" name="sums">
            <el-table v-loading="loading" :data="sumDataList"  >
                <el-table-column label="贷款网点" width="100" align="center" prop="loanOrg" fixed>
                  <template #default="scope">
                      <dict-tag :options="sys_org_name" :value="scope.row.loanOrg"/>
                  </template>
                </el-table-column>
                
                <el-table-column label="贷款余额(万元)" width="120" align="center" prop="loanBalance"/>
                <el-table-column label="贷款年日均(万元)" width="130" align="center" prop="nrj"/>
                
            </el-table>
        </el-tab-pane>
        </el-tabs>
            <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body >
      <el-form ref="creditRef" :model="creditForm" :rules="creditRules" label-width="80px" inline>
        <el-form-item label="合同号" prop="contratNo">
          <el-input v-model="creditForm.contratNo" placeholder="请输入贷款合同号"  :disabled="editDisable" style="width:220px" @blur="handleBlur(creditForm.contratNo)"/>
        </el-form-item>
        <el-form-item label="归属网点" prop="loanOrg" label-width="90">
          <el-select v-model="creditForm.loanOrg"   style="width:210px" :disabled="disabled">
            <el-option
              v-for="dict in sys_org_name"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
       
        <el-form-item label="客户号" prop="custId" >
          <el-input v-model="creditForm.custId"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="客户名称" prop="postName"  >
          <el-input v-model="creditForm.custName"  :disabled="disabled" style="width:220px" />
        </el-form-item>
        <el-form-item label="合同金额" prop="contratMoney" >
          <el-input v-model="creditForm.contratMoney"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="担保方式" prop="guaranteeForm"  >
          <el-select v-model="creditForm.guaranteeForm"   style="width:220px" :disabled="disabled">
            <el-option
              v-for="dict in sys_contract_security"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起始日期" prop="stDate" >
          <el-input v-model="creditForm.stDate"  :disabled="disabled" style="width:220px"/>
        </el-form-item>
        <el-form-item label="到期日期" prop="edDate"  >
          <el-input v-model="creditForm.edDate"  :disabled="disabled" style="width:220px" />
        </el-form-item>
        <el-form-item label="所属商会" prop="commerceName" label-width="90">
          <el-select v-model="creditForm.commerceName"   style="width:210px" >
            <el-option
              v-for="dict in commerce_name"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="营销机构" prop="belong" label-width="90">
          <el-select v-model="creditForm.belong"   style="width:210px" >
            <el-option
              v-for="dict in belong"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark"  >
          <el-input v-model="creditForm.remark" placeholder="请输入备注"  style="width:220px" />
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
import { getDirectCreditList, getCreditInfo, addDirectCredit, delDirectCredit, getDirectCreditInfo, updateDirectCredit, getDirectCreditSumsList } from "@/api/szhl/data/direct";
const activeName = ref('detail');
// 编辑
const editDisable = ref(false);
// 选中数组
const ids = ref([]);
// 非多个禁用
const multiple = ref(true);
// 非单个禁用
const single = ref(true);
//禁用
const disabled = ref(true);
//打开
const open = ref(false);
//标题
const title = ref('');
// 遮罩层
const loading = ref(false);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 表格数据
const  dataList = ref([]);
//表格数据
const sumDataList = ref([]);
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    loanOrg: null,
    assessOrg: null,
    custName: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ]
  },
  // 表单参数
  creditForm: {},
  // 表单校验
  creditRules: {
    contratNo: [
      { required: true, message: "贷款合同号必填", trigger: "blur" },
    ],
    commerceName: [
      { required: true, message: "商会必填", trigger: "blur" },
    ]
    ,
    belong: [
      { required: true, message: "营销机构必填", trigger: "blur" },
    ]
  }
  
})
const { queryParams, form, rules, creditForm, creditRules } = toRefs(data);
const handleClickEffect = (proxy) => {
    const getList = () => {
        loading.value = true;
        getDirectCreditList(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
        getDirectCreditSumsList(proxy.addDateRange(queryParams.value)).then(res => {
            sumDataList.value = res.data;
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
    }
    //新增
    const handleAdd = ()=> {
        reset();
        open.value = true;
        title.value = '贷款合同录入';
    }
    //贷款合同失去焦点事件
    const handleBlur = (contratNo) => {
      if(contratNo.length===16){
        getCreditInfo(contratNo).then(res => {
          if(res.data){
            creditForm.value = res.data;
          }else{
            reset();
            proxy.$modal.msgError("贷款合同号不存在！");
          }
        });
      }
    }
    //取消
    const cancel = ()=>{
      open.value = false;
    }
    //确认
    const submitForm = ()=>{
      proxy.$refs["creditRef"].validate(valid => {
            if (valid) {
              if(editDisable.value){
                updateDirectCredit(creditForm.value).then(res => {
                  proxy.$modal.msgSuccess("贷款合同"+creditForm.value.contratNo+"已修改！");
                  open.value = false;
                  getList();
                })
              }else{
                addDirectCredit(creditForm.value).then(res => {
                  proxy.$modal.msgSuccess("贷款合同"+creditForm.value.contratNo+"已新增！");
                  open.value = false;
                  getList();
                })
              }
                
            }
        })
    }
    //重置
    const reset = ()=>{
      creditForm.value = {
        contratNo: undefined,
        custName: undefined,
        custId: undefined,
        loanOrg: undefined,
        guaranteeForm: undefined,
        stDate: undefined,
        edDate: undefined,
        contratMoney: undefined,
        belong: undefined
      };
      editDisable.value = false;
    }
    //删除
    const handleDelete = () => {
        const nos =  ids.value;
        proxy.$modal.confirm('是否确认删除贷款合同"' + nos + '"的数据项？').then(function () {
            return delDirectCredit(nos);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    //选中事件
    const handleSelectionChange = (selection)=>{
        ids.value = selection.map(item => item.contratNo);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    //修改
    const handleUpdate = () => {
      console.log(queryParams.value.workDate);
      getDirectCreditInfo(ids.value[0],queryParams.value.workDate).then(res => {
        open.value = true;
        editDisable.value = true;
        title.value = '贷款合同录入';
        creditForm.value = res.data;
      })
    }
    //导出
    const handleExport = () => {
      proxy.download("direct-credit/export", {
        ...queryParams.value,
      },`直销贷款合同清单_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
    }
    return { getList, handleQuery, resetQuery, handleAdd, handleBlur, cancel, submitForm, handleDelete, handleSelectionChange, handleExport, handleUpdate }
}
export default {
    setup(){
        //获取代理对象
        const { proxy } = getCurrentInstance();
         //报表类型数据字典
        const { sys_org_name, commerce_name, sys_contract_security, credit_status, belong } = proxy.useDict("sys_org_name", "commerce_name", "sys_contract_security", "credit_status", "belong");
        const { getList, handleQuery, resetQuery, handleAdd, handleBlur, cancel, submitForm, handleDelete, handleSelectionChange, handleExport, handleUpdate } = handleClickEffect(proxy);
        
        return { activeName, editDisable, ids, multiple, single, disabled, sys_org_name, sys_contract_security, credit_status, commerce_name, loading, showSearch, total, dataList, queryParams, form, rules, getList
        , handleQuery, resetQuery, handleAdd, open, title, creditForm, creditRules, sumDataList
        ,handleBlur,cancel, submitForm, handleDelete, handleSelectionChange, handleExport, handleUpdate, belong }
    }
    
}

</script>