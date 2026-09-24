<template>
   <el-dialog :title="title" v-model="open" width="700px" :close-on-click-modal="false" append-to-body>
         <el-form :model="form" :rules="rules" ref="staffRef" label-width="90px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="客户号:" prop="custId" >
                     {{ form.custId }}
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="客户名称:" prop="custName" >
                    {{ form.custName }}
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="原责任人:" prop="staffNo">
                     <dict-tag :options="sys_user_name" :value="form.userName" ></dict-tag>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="原机构号:" prop="orgNo">
                     <dict-tag :options="sys_org_name" :value="form.orgNo"></dict-tag>
                  </el-form-item>
               </el-col>
            </el-row>
             <el-row>
               <el-col :span="12">
                  <el-form-item label="新责任人:" prop="staffNoNew">
                     <!-- <el-select v-model="form.staffNoNew" placeholder="请输入新责任人" clearable filterable >
                        <el-option
                           v-for="item in userList"
                           :key="item.userName"
                           :label="item.nickName"
                           :value="item.userName"
                        >
                        <span style="float: left">{{item.nickName}}</span>
                        <span style="float:right;">{{item.userName}}</span>
                        </el-option>
                     </el-select> -->
                     <select-user v-model="form.staffNoNew" @deptName="getDetpName"></select-user>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="新机构号:" prop="orgNo">
                    <!-- <template v-for="item in userList">
                     <div v-if="item.userName === form.staffNoNew" :key="item.userName">{{item.dept?.deptName}}</div>
                    </template> -->
                    {{deptName}}
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm(form)" :disabled="disabled">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
   </el-dialog>
</template>
<script>
import { ref,reactive,toRefs, getCurrentInstance } from 'vue';
import { updateDueContractUserName } from "@/api/szhl/market/dueContract";
import selectUser from '../../../common/selectUser.vue';
const disabled = ref(false);
const open = ref(false);
const deptName = ref('');
const initEffect = (proxy) =>{
    const title = ref("");
    const recordData = reactive({
        form: {},
        rules: {
            staffNoNew: [{ required: true, message: "请选择提醒人", trigger: "blur" }]
        }
    });
    const { form, rules } = toRefs(recordData);
    const openStaffDialog = (row) => {
        reset();
        form.value = row;
        open.value = true;
    }
     /** 重置操作表单 */
    const reset = () => {
        form.value = {

        };
        disabled.value = false;
        proxy.resetForm("staffRef");
    }
    //回调获取责任人网点名称
    const getDetpName = (val) => {
      deptName.value = val;
    }
    return { title, open, form, rules, openStaffDialog, getDetpName, deptName }
}

const handleClickEffect = (proxy) =>{
   const submitForm = (form) =>{
      proxy.$refs["staffRef"].validate(valid => {
            if (valid) {
                  disabled.value = true;
                  form.userName = form.staffNoNew;
                  updateDueContractUserName(form).then(response => {
                  proxy.$modal.msgSuccess("合同临期提醒人已修改");
                  open.value = false;
               });
            }
      });
      
   }
   const cancel = () => {
      open.value = false;
   }
   return { disabled, submitForm, cancel }
}
export default {
   components: { selectUser},
    setup() {
        const { proxy } = getCurrentInstance();
        //数据字典
        const { sys_user_name, sys_org_name } = proxy.useDict("sys_user_name","sys_org_name");
        //页面初始化
        const { title, open, form, rules, openStaffDialog, getDetpName, deptName} = initEffect(proxy);
        //按钮点击事件
        const { disabled, submitForm, cancel } = handleClickEffect(proxy);
        return { title, open, form, rules, openStaffDialog, getDetpName, deptName, sys_user_name, sys_org_name,
               disabled, submitForm, cancel} 
    }
}
</script>
