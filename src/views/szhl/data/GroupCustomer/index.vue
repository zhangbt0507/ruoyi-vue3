<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" :inline="true"  label-width="68px">
            
            
            <el-form-item label="授信机构" prop="org" label-width="80">
                <el-select v-model="queryParams.org"  placeholder="请选择机构"  style="margin-top:-5px">
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
                    @click="add('add')"
                    v-hasPermi="['data:GroupCustomer:add']"
                >新增集团客户</el-button>
                </el-col>
            <el-col :span="1.5">
                <el-button
                type="success"
                plain
                icon="Edit"
                :disabled="single"
                @click="handleUpdate"
                v-hasPermi="['data:GroupCustomer:edit']"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                type="danger"
                plain
                icon="Delete"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['data:GroupCustomer:remove']"
                >删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                type="warning"
                plain
                icon="Download"
                @click="handleExport"
                v-hasPermi="['data:GroupCustomer:export']"
                >导出</el-button>
            </el-col>
    </el-row>
    <el-table v-loading="loading" :data="dataList" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="授信机构" width="120" align="org" prop="org" />
      <el-table-column label="客户内码" width="120" align="center" prop="custIsn" />
      <el-table-column label="客户号" width="210" align="center" prop="custId" />
      <el-table-column label="客户名称" width="350" align="center" prop="custName" />
      <el-table-column label="授信总额(万元)"  width="120"  align="center" prop="creditAmount" />
      <el-table-column label="信用额度(万元)"  width="120"  align="center" prop="xyAmount" />
      <el-table-column label="抵押额度(万元)"  width="120"  align="center" prop="dyAmount" />
      <el-table-column label="担保额度(万元)"  width="120"  align="center" prop="dbAmount" />
      <el-table-column label="开始日期" width="120" align="center" prop="beginDate" />
      <el-table-column label="结束日期" width="120" align="center" prop="endDate" />
      <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
        <template #default="scope" >
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['data:GroupCustomer:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['data:GroupCustomer:remove']"
          >删除</el-button>
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="addChild(scope.row)"
            v-hasPermi="['data:GroupCustomer:addChild']"
            v-if="scope.row.mainIsn==null"
          >添加下级</el-button>
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="openHis(scope.row)"
            v-hasPermi="['data:GroupCustomer:add']"
          >历史记录</el-button>
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
     <!-- 添加集团客户对话框 -->
     <el-dialog :title="title" v-model="open" width="550px" append-to-body>
      <el-form ref="groupRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="集团内码" prop="mainIsn" label-width="120" v-if="method == 'addChild'">
          <el-input v-model="form.mainIsn" placeholder="集团内码" disabled/>
        </el-form-item>
        <el-form-item label="集团名称" prop="mainName" label-width="120" v-if="method == 'addChild'">
          <el-input v-model="form.mainName" placeholder="集团内码" disabled/>
        </el-form-item>
        <el-form-item label="客户号" prop="custId" label-width="120">
          <el-input v-model="form.custId" placeholder="请输入客户号" @blur="blurEvent(form.custId)" :disabled="method =='update'"/>
        </el-form-item>
        <el-form-item label="客户内码" prop="custIsn" label-width="120">
          <el-input v-model="form.custIsn" placeholder="请输入客户内码" disabled />
        </el-form-item>
        <el-form-item label="客户名称" prop="custName" label-width="120">
          <el-input v-model="form.custName" placeholder="请输入客户名称" disabled/>
        </el-form-item>
        <el-form-item label="授信机构" prop="org" label-width="120">
          <el-input v-model="form.org" placeholder="请输入授信机构号" />
        </el-form-item>
        <el-form-item label="授信总额(万元)" prop="creditAmount" label-width="120">
          <el-input-number v-model="form.creditAmount" placeholder="授信总额" disabled/>
        </el-form-item>
        <el-form-item label="信用额度(万元)" prop="xyAmount" label-width="120">
          <el-input-number v-model="form.xyAmount" placeholder="信用额度"  @blur="blurAmount()"/>
        </el-form-item>
        <el-form-item label="抵押额度(万元)" prop="dyAmount" label-width="120">
          <el-input-number v-model="form.dyAmount" placeholder="抵押额度" @blur="blurAmount()"/>
        </el-form-item>
        <el-form-item label="担保额度(万元)" prop="dbAmount" label-width="120">
          <el-input-number v-model="form.dbAmount" placeholder="担保额度" @blur="blurAmount()"/>
        </el-form-item>
        <el-form-item label="起始日期" prop="beginDate" >
          <el-date-picker v-model="form.beginDate" placeholder="请选择开始日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
        </el-form-item>
        <el-form-item label="到期日期" prop="endDate"  >
          <el-date-picker v-model="form.endDate" placeholder="请选择结束日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark" label-width="120">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注"  />
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
import { listDeptAssess } from "@/api/system/dept";
import { getSingleCustomer, addGroupCustomer, listGroupCustomer, updateGroupCustomer, delGroupCustomer } from "@/api/szhl/data/GroupCustomer";
const reportUrl = ref(import.meta.env.VITE_APP_BASE_REPORT ); // 报表服务器地址
const orgs = ref([]);
const org = ref();
const open = ref(false);
const method = ref('');
// 选中数组
const ids = ref([]);
// 非单个禁用
const disabled = ref(false);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
//客户号
const customerNames = ref([]);
// 遮罩层
const loading = ref(false);
// 总条数
const total = ref(0);
// 表格数据
const  dataList = ref([]);
//标题
const title  =ref('')
// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    custId: null,
    custName: null,
    org: null
  },
  // 表单参数
  form: {
    id:null,
    custId:null,
    custIsn:null,
    custName:null,
    xyAmount:0,
    dyAmount:0,
    dbAmount:0,
    creditAmount:0,
    remark:null
  },
  // 表单校验
  rules: {
    custId: [
      { required: true, message: "请输入客户号", trigger: "blur" },
      { min:21,message: "请输入21位客户号", trigger: "blur" },
      { max:21,message: "请输入21位客户号", trigger: "blur" },
    ],
    xyAmount: [
      { required: true, message: "请输入信用额度", trigger: "blur" }
    ]
    ,
    dyAmount: [
      { required: true, message: "请输入信用额度", trigger: "blur" }
    ]
    ,
    dbAmount: [
      { required: true, message: "请输入信用额度", trigger: "blur" }
    ]
    
  },
  
})
const { queryParams, form, rules  } = toRefs(data);
//按钮点击事件
const handleClickEffect = ( proxy ) =>{
    const add = (f)=>{
        method.value = f;
        reset();
        open.value = true;
    }
    const blurEvent = (khh) => {
      if (khh.length==21) {
                getSingleCustomer(khh).then(res =>{
                    form.value.custId = res.data.custId;
                    form.value.custName = res.data.custName;
                    form.value.custIsn = res.data.custIsn;
                });
            }   
    }
    //获取数据
    const getList = ()=>{
        loading.value = true;
        listGroupCustomer(proxy.addDateRange(queryParams.value)).then(res => {
            dataList.value = res.rows;
            total.value = res.total;
            loading.value = false;
        });
    }
    //查询
    const handleQuery = ()=>{
        queryParams.value.pageNum = 1;
        getList();
    }
     //取消按钮
     const cancel = ()=>{
        open.value = false;
        reset();
    }
    const reset = ()=>{
      form.value = {
        
      };
      proxy.resetForm("groupRef");
    }
    const submitForm = ()=>{
        proxy.$refs["groupRef"].validate(valid => {
          if (valid) {
            if (method.value === 'update') {
              updateGroupCustomer(form.value).then(response => {
                proxy.$modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
            } else {
              addGroupCustomer(form.value).then(response => {
                proxy.$modal.msgSuccess("新增成功");
                open.value = false;
                getList();
              });
            }
        }
     });
    }
    const blurAmount= ()=>{
      form.value.creditAmount = form.value.xyAmount+form.value.dyAmount+form.value.dbAmount;
    }
    //选中事件
    const handleSelectionChange = (selection)=>{
        ids.value = selection.map(item => item.id);
        customerNames.value = selection.map(item => item.custName);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }
    //修改
    const handleUpdate = (row)=>{
      add('update');
      title.value = '客户信息修改'
      form.value = row;
    }
    //添加下级
    const addChild = (row)=> {
      add('addChild');
      title.value = '添加客户信息'
      form.value.main = row.id;
      form.value.mainIsn = row.custIsn;
      form.value.mainName = row.custName;
    }

    const handleDelete = (row)=>{
      const nms = row.id || ids.value;
        const names = row.custName || customerNames.value;
        proxy.$modal.confirm('是否确认删除机构类客户名称为"' + names + '"的数据项？').then(function () {
            return delGroupCustomer(nms);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
    //导出
    const handleExport = ()=>{
      proxy.download("group-customer/export", {
        ...queryParams.value,
      },`集团客户清单_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
    }
    //重置
    const resetQuery = () =>{
      proxy.resetForm("queryForm");
        handleQuery();
    }
     return { add, blurEvent, cancel, submitForm, reset, getList, handleQuery, blurAmount, handleSelectionChange, handleUpdate, addChild, handleDelete, handleExport,resetQuery }
}

export default {
    setup() {
        //获取代理对象
        const { proxy } = getCurrentInstance();
        //报表类型数据字典
        const { sys_org_name } = proxy.useDict("sys_org_name");
         //获取部门
        listDeptAssess().then(res => {
            orgs.value = res.data;
            org.value = res.data[0]?.code;
        });
        
        const { add, blurEvent, cancel, submitForm, reset, getList, handleQuery, blurAmount, handleSelectionChange, handleUpdate, addChild, handleDelete, handleExport,resetQuery } = handleClickEffect(proxy);
        getList();
        const openHis = ()=>{
          proxy.$router.push({path: "/szhl/report/agency/",query: {url: reportUrl.value+'szhl/jxkh/数据维护/集团客户修改历史.cpt'}});
        }
        return {title, method, single, multiple, customerNames, disabled, loading, total, dataList, queryParams, form, rules, orgs, org, open, sys_org_name, add, blurEvent, cancel, submitForm, reset, getList, handleQuery, blurAmount,
          handleSelectionChange, handleUpdate, addChild, handleDelete, openHis, handleExport,resetQuery }
    }
    
}
</script>