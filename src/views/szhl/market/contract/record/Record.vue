<template>
        <!-- 触达弹窗 -->
    <el-dialog :title="title" v-model="open" width="700px" :close-on-click-modal="false" append-to-body>
         <el-form :model="form" :rules="rules" ref="contractRef" label-width="90px">
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
                  <el-form-item label="触达日期:" prop="interactiveDate">
                     <el-date-picker v-model="form.interactiveDate" placeholder="选择日期"  :disabled-date="disabledFun"></el-date-picker>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="联系电话:" prop="tel">
                     <el-input v-model="form.tel" placeholder="请输入电话"  />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item  label="触达方式:" prop="interactiveType">
                     <el-select v-model="form.interactiveType" placeholder="请选择触达方式">
                        <el-option
                           v-for="item in market_contract_interactive_type"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item  label="触达主题:" prop="interactiveSubject">
                     <el-select v-model="form.interactiveSubject" placeholder="请选择触达主题" disabled>
                        <el-option
                           v-for="item in market_contract_interactive_subject"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row v-if="form.prevResult!=null">
               <el-col :span="24">
                  <el-form-item  label="最近触达:" prop="prevResult">
                     <el-input type="textarea" :rows="2" v-model="form.prevResult" disabled></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item  label="处理结果:" prop="result">
                    <el-select v-model="form.result" placeholder="请选择处理结果" @change="hanldChange">
                        <el-option
                           v-for="item in market_contract_result"
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
                  <el-form-item  label="补充说明:" prop="remark" :rules="remakRules==''?[{required: false}]:remakRules">
                     <el-input type="textarea" :rows="2"  v-model="form.remark" placeholder="请输入补充说明"></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm" :disabled="form.recordStat != '1' ">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
</template>
<script >
import { addCustInterActiveRecord, prevRecordByCustId } from "@/api/szhl/market/dueContract.js";
import  { getCurrentInstance } from 'vue'
//点击事件
export const handleClickEffect = ( proxy,getList ) => {
    const title = ref("");
    const open = ref(false);
    const recordData = reactive({
        form: {},
        rules: {
            interactiveType: [{ required: true, message: "请选择触达方式", trigger: "blur" }],
            interactiveSubject: [{ required: true, message: "请选择触达主题", trigger: "blur" }],
            result: [{ required: true, message: "请选择处理结果", trigger: "blur" }],
            tel: [{ required: true, pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
        }
    });
    const { form, rules } = toRefs(recordData);
    //补充说明必填验证
    const remakRules = ref("");
    const hanldChange = (v) => {
      if( v === '2'){
         remakRules.value = [{ required: true, message: '填写更换主体新名称', trigger: 'blur' }]
      }else if( v === '4' ){
         remakRules.value = [{ required: true, message: '填写存在的风险点', trigger: 'blur' }]
      }else if( v === '6' ){
         remakRules.value = [{ required: true, message: '填写流失原因及去向', trigger: 'blur' }]
      }else if( v === '7' ){
         remakRules.value = [{ required: true, message: '填写其他原因', trigger: 'blur' }]
      }else {
         remakRules.value  = [{ required: true }]
      }
    }
    //处理按钮
    const handleDispose = ( row ) => {
         reset();
         tranObj(form,row);
         form.value.interactiveSubject = '1';
         //打开弹窗
         open.value = true;
         title.value = "触达处理";
         prevRecordByCustId(row.custId).then(response => {
            form.value.prevResult = response.data?.prevResult;
         });
    }
    //交互弹出框确定按钮
    const submitForm = () => {
        proxy.$refs["contractRef"].validate(valid => {
            if (valid) {
                if(form.value.parentId != undefined){
                        addCustInterActiveRecord(form.value).then(() => {
                        proxy.$modal.msgSuccess("触达信息已新增");
                        open.value = false;
                        getList();
                    });
                }else{
                    proxy.$modal.alert("未获取到合同主键,无法新增触达信息");
                }
                   
            }
        });
    }
    //交互取消按钮
    const cancel = () => {
        reset();
        open.value = false;
    }

    
    /** 重置操作表单 */
    const reset = () => {
        form.value = {

        };
        remakRules.value = '';
        proxy.resetForm("contractRef");
    }
    const tranObj = (recordForm, row) => {
        recordForm.value.custNo = row.custNo;
        recordForm.value.custId = row.custId;
        recordForm.value.custName = row.custName;
        recordForm.value.interactiveDate = new Date();
        recordForm.value.tel = row.tel;
        recordForm.value.recordStat = row.recordStat;
        recordForm.value.interactiveType = row.interactiveType;
        recordForm.value.interactiveSubject = '1';
        recordForm.value.result = row.result;
        recordForm.value.remark = row.remark;
        recordForm.value.parentId = row.uuid;
    }
    const disabledFun = (time) => {
      let dateObj = new Date();
      return time.getTime() > Date.now() || time.getTime() < new Date(dateObj.setDate(dateObj.getDate() - 7));
    }
    return { open, title, form, rules, handleDispose, submitForm, cancel, hanldChange, remakRules, disabledFun }
}

export default {
    name: 'Record',
    props: { type: String },
    setup ( props ) {
        const { proxy } = getCurrentInstance();
        const { type }= toRefs(props);
        const { market_contract_result, market_contract_interactive_type, market_contract_interactive_subject } = proxy.useDict("market_contract_result",type.value,"market_contract_interactive_subject");
        const getList = () => {
            proxy.$emit('list');
        };
        
        //点击事件
        const { open, title, form, rules, handleDispose, submitForm, cancel, hanldChange, remakRules, disabledFun } = handleClickEffect( proxy,getList );
        return { open, title, form, rules, handleDispose, submitForm, cancel, getList, disabledFun,
            market_contract_result, market_contract_interactive_type, market_contract_interactive_subject, hanldChange, remakRules }
    },
}
</script>