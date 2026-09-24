<template>
        <!-- 触达弹窗 -->
    <el-dialog :title="title" v-model="open" width="700px" :close-on-click-modal="false" append-to-body>
         <el-form :model="form" :rules="rules" ref="contractRef" label-width="90px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="客户证件号:" prop="idNumber" >
                     {{ form.idNumber }}
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
                     <el-date-picker v-model="form.interactiveDate" placeholder="选择日期" type="date">

                     </el-date-picker>
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
                           v-for="item in other_bank_loan_marketing_result"
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
import { addCustInterActiveRecord, prevRecordByCustId } from "@/api/szhl/market/otherBankLoanMarketing.js";
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
      if( v === '1'){
         remakRules.value = [{ required: true, message: '填写他行利率水平', trigger: 'blur' }]
      }
      else if( v === '2' ){
         remakRules.value = [{ required: true, message: '填写准入受限原因', trigger: 'blur' }]
      }
      else if( v === '3' ){
         remakRules.value = [{ required: true, message: '填写担保受限原因', trigger: 'blur' }]
      }
      else if( v === '4' ){
         remakRules.value = [{ required: true, message: '填写存在风险点', trigger: 'blur' }]
      }
        else if( v === '6' ){
         remakRules.value = [{ required: true, message: '填写其他原因', trigger: 'blur' }]
      }
       else {
         remakRules.value  = [{ required: true }]
      }
    }
    //处理按钮
    const handleDispose = ( row ) => {
         reset();
         tranObj(form,row);
         form.value.interactiveSubject = '3';
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
        recordForm.value.custId = '101'+row.idNumber;
        recordForm.value.idNumber = row.idNumber;
        recordForm.value.custName = row.custName;
        recordForm.value.interactiveDate = new Date().getFullYear()+"-"+(new Date().getMonth()+1) +'-'+new Date().getDate();
        recordForm.value.tel = row.tel;
        recordForm.value.recordStat = row.recordStat;
        recordForm.value.interactiveType = row.interactiveType;
        recordForm.value.interactiveSubject = '1';
        recordForm.value.result = row.result;
        recordForm.value.remark = row.remark;
        recordForm.value.parentId = row.uuid;
    }
    return { open, title, form, rules, handleDispose, submitForm, cancel, hanldChange, remakRules }
}

export default {
    name: 'Record',
    props: { type: String },
    setup ( props ) {
        const { proxy } = getCurrentInstance();
        const { type }= toRefs(props);
        const { other_bank_loan_marketing_result, market_contract_interactive_type, market_contract_interactive_subject } = proxy.useDict("other_bank_loan_marketing_result","market_contract_interactive_type","market_contract_interactive_subject");
        const getList = () => {
            proxy.$emit('list');
        }
        
        //点击事件
        const { open, title, form, rules, handleDispose, submitForm, cancel, hanldChange, remakRules } = handleClickEffect( proxy,getList );
        return { open, title, form, rules, handleDispose, submitForm, cancel, getList, 
            other_bank_loan_marketing_result, market_contract_interactive_type, market_contract_interactive_subject, hanldChange, remakRules }
    },
}
</script>

<style>
   .el-select-dropdown__item{
      height: 25px;
   }

</style>