<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
         <!-- <el-form-item label="卡号" prop="cardNo">
            <el-input
               v-model="queryParams.cardNo"
               placeholder="请输入卡号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item> -->
         <!-- <el-form-item label="客户内码" prop="custIsn">
            <el-input
               v-model="queryParams.custIsn"
               placeholder="请输入客户内码"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="证件号" prop="idNo">
            <el-input
               v-model="queryParams.idNo"
               placeholder="请输入证件号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="联系电话" prop="tel">
            <el-input
               v-model="queryParams.tel"
               placeholder="请输入联系电话"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item> -->
         <el-form-item>
            <!-- <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button> -->
            <el-button
             type="primary"
             @click="addCardVisible"
             icon="Plus"
          >人工采集</el-button>
         </el-form-item>
      </el-form>
      <!-- <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:role:add']"
            >新增授用信报告</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row> -->
      <el-card>
        <div style="min-height:50vh">
          <!-- 表格数据 -->
          <el-table v-loading="loading" :data="custmerList"  style="font-family: '黑体'" max-height="50vh">
              <el-table-column label="卡号" prop="cardNo" width="180" />
              <el-table-column label="姓名" prop="custName" width="120" />
              <el-table-column label="销卡机构号" prop="deptId" width="150" />
              <!-- <el-table-column label="民族" prop="nation" width="100" /> -->
              <el-table-column label="录入柜员号" prop="enterStaff" width="150" />
              <el-table-column label="销户柜员号" prop="cancelStaff" width="150" />
              <el-table-column label="销卡日期" prop="cancelDate" width="150" />
              <el-table-column label="销卡原因" prop="cancelReason" :show-overflow-tooltip="true" width="200" />
              <el-table-column label="状态" width="120" >
                <template  #default="scope">{{ statusEnums[scope.row.status] }}</template>
              </el-table-column>
              <el-table-column label="操作" min-width="150">
                  <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="reviewCard(scope.row.cardNo,scope.row.id)" 
                            :disabled="(scope.row.cancelStaff != null && scope.row.cancelStaff != '' && useUserStore().name == scope.row.cancelStaff)"
                            :style="{color: ((scope.row.cancelStaff != null && scope.row.cancelStaff != '' && useUserStore().name == scope.row.cancelStaff) ? '#ccc' : '')}"
                            >复核</el-button>
                    <el-button link type="primary" icon="Delete" @click="delReasonCard(scope.row.cardNo,scope.row.id)"
                            :disabled="(scope.row.cancelStaff != null && scope.row.cancelStaff != '' && useUserStore().name != scope.row.cancelStaff)"
                            :style="{color: ((scope.row.cancelStaff != null && scope.row.cancelStaff != '' && useUserStore().name != scope.row.cancelStaff) ? '#ccc' : '')}"
                            >删除</el-button>
                  </template>
              </el-table-column>
          </el-table>
        </div>
        <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList()"
        />
      </el-card>

      <el-dialog title="人工采集" v-model="cardVisible" width="500px" append-to-body :distroy-on-close="true"  :close-on-click-modal="false" >
          <el-form ref="reviewedCardRef" :model="reviewedForm" :rules="rules"  label-width="140px">
              <el-form-item label="卡号" prop="cardNo" :required = 'true'>
                  <el-input v-model="reviewedForm.cardNo" placeholder="请输入卡号" @blur="queryName(reviewedForm.cardNo)" style="width: 300px;"/>
              </el-form-item>
              <el-form-item label="客户姓名" prop="custName" :required = 'true'>
                  <el-input v-model="reviewedForm.custName" placeholder="请输入客户姓名" style="width: 300px;"/>
              </el-form-item>
              <el-form-item label="销卡原因" prop="cancelReason" :required = 'true'>
                <el-select v-model="reviewedForm.cancelReason" placeholder="销卡原因" clearable style="width: 300px">
                    <el-option
                        v-for="dict in reasons"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    />
                </el-select>
              </el-form-item>
              <el-form-item label="销卡日期" prop="cancelDate" :required = 'true'>
                <el-date-picker v-model="reviewedForm.cancelDate" :disabled-date="disabledFun" style="width: 300px"
                ></el-date-picker>
              </el-form-item>
          </el-form>
          <template #footer>
              <div class="dialog-footer">
              <el-button type="primary" @click="submit">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
              </div>
          </template>
      </el-dialog>
       
      <el-dialog title="删除原因" v-model="delReasonVisible" width="500px" append-to-body :distroy-on-close="true"  :close-on-click-modal="false" >
          <el-form ref="delReasonCardRef" :model="delReasonForm" :rules="delReasonrules"  label-width="140px">
              <el-form-item prop="cardNo" :required = 'true'  label="卡号" >
                  <el-input v-model="delReasonForm.cardNo" style="width: 300px;" :disabled="true"/>
              </el-form-item>
              <el-form-item label="删除原因" prop="remark" :required = 'true'>
                <el-select v-model="delReasonForm.remark" placeholder="删除原因" clearable style="width: 300px" @change="delResonChange">
                    <el-option
                        v-for="dict in delReasons"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    />
                </el-select>
              </el-form-item>
              <el-form-item prop="other" :required = 'true' v-if="needInput">
                  <el-input v-model="delReasonForm.other" placeholder="请输入原因" style="width: 300px;"/>
              </el-form-item>
              <el-form-item prop="id" :required = 'true' v-show="false">
                  <el-input v-model="delReasonForm.id"/>
              </el-form-item>
          </el-form>
          <template #footer>
              <div class="dialog-footer">
              <el-button type="primary" @click="submitDeleteCard">确 定</el-button>
              <el-button @click="closeDelReasonVisible">取 消</el-button>
              </div>
          </template>
      </el-dialog>
    </div>
</template>

<script  setup name="beReviewCard">
    const { proxy } = getCurrentInstance();

    import { queryBeReview,addCard,queryNameByNo,review } from "@/api/szhl/card/scrapCard";
    import useUserStore from '@/store/modules/user'
    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const data = reactive({
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },
        
    });

    const reviewedForm = ref({
        cardNo: "",
        custName: "",
        cancelReason: "",
        // cancelDate: '2025-03-01',
        cancelDate: new Date(),
    });
    
    const rules = ref({
        cardNo: [{ required: true, message: "卡号不能为空", trigger: "blur" },
                {validator:validateCreditCardNumber,trigger: "blur" }],
        custName: [{ required: true, message: "客户姓名不能为空", trigger: "blur" }],
        cancelReason: [{ required: true, message: "销卡原因不能为空", trigger: "blur" }],
        cancelDate: [{ required: true, message: "销卡日期不能为空", trigger: "blur" }],
    });

    const delReasonForm = ref({
        remark:"",
        other:"",
        cardNo:"",
        date:""
    });

    const delReasonrules = ref({
        remark: [{ required: true, message: "作废原因不能为空", trigger: "blur" }],
        other: [{ required: true, message: "原因不能为空", trigger: "blur" }],
    });

    const statusEnums = {
        "ENTERED":"已录入",
        "BE_REVIEWED":"待复核",
        "DELETED":"已删除",
        "BE_DESTROYED":"待上报",
        "DESTROYED_REGIST":"待审批",
        "DESTROYED":"已完成",
    }

    const reasons = ref([
        {label:"借记卡销卡",value:"借记卡销卡"},
        {label:"同卡号换卡",value:"同卡号换卡"},
        {label:"借记卡补换卡",value:"借记卡补换卡"},
        {label:"IC借记卡补换卡",value:"IC借记卡补换卡"},
        {label:"信用卡补换卡",value:"信用卡补换卡"},
        {label:"信用卡销卡",value:"信用卡销卡"},
        {label:"重控销卡",value:"重控销卡"},
        {label:"吞没卡销卡",value:"吞没卡销卡"},
        {label:"挂失销卡",value:"挂失销卡"},
        {label:"其他销卡",value:"其他销卡"},
    ]);

    const delReasons = ref([
        {label:"同卡号换卡未收回",value:"同卡号换卡未收回"},
        {label:"挂失销卡",value:"挂失销卡"},
        {label:"其他",value:"其他"},
    ])

    const cardVisible = ref(false);
    const delReasonVisible = ref(false);

    const needInput = ref(false)

    const { queryParams } = toRefs(data);

    /** 查询征信报告列表 */
    function getList() {
        loading.value = true;
        queryBeReview(proxy.addDateRange(queryParams.value)).then(response => {
            custmerList.value = response.rows;
            total.value = response.total;
        });
        loading.value = false;
    }

    //禁用日期
    function disabledFun(time){
        let dateObj = new Date();
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate()));
    }

    //新增废卡
    function addCardVisible(){
        reviewedForm.value = {
            cancelDate: new Date(),
        };
        cardVisible.value = true;
    }

    /** 取消按钮 */
    function cancel() {
        cardVisible.value = false;
        reset();
    }

    /** 提交表单 */
    function submit(){
        reviewedForm.value.cancelDate = reviewedForm.value.cancelDate.getTime();
        proxy.$refs["reviewedCardRef"].validate(valid => {
            if (valid) {
                addCard(reviewedForm.value).then(response => {
                    proxy.$modal.msgSuccess("添加成功");
                    cardVisible.value = false;
                    getList();
                });
            }
        })
    }

    function queryName(cardNo){
        queryNameByNo({"cardNo":cardNo}).then(response => {
            reviewedForm.value.custName = response.msg
        });
    }

    /** 表单重置 */
    function reset() {
        reviewedForm.value = {
        };
        proxy.resetForm("reviewedCardRef");
    }

    /** 复核卡片 */
    function reviewCard(cardNo,id){
        const data = {
            "cardNo":cardNo,
            "id":id,
            "status":"BE_DESTROYED"
        }
        proxy.$modal.confirm('是否确认复核卡号为"' + cardNo + '"的数据项？').then(function () {
            review(data).then(response => {
                if(response.code == 200){
                    proxy.$modal.msgSuccess("复核成功");
                    getList();
                }
            })
        })
    }

    function delResonChange(value){
        if(value == "其他"){
            needInput.value = true;
        }else{
            needInput.value = false;
        }
    }

    /** 删除按钮方法 */
    function delReasonCard(cardNo,id){
        delReasonForm.value = {
        };
        needInput.value = false;
        delReasonForm.value.cardNo = cardNo.trim();
        delReasonForm.value.id = id;
        delReasonVisible.value = true;
    }

    /** 提交删除 */
    function submitDeleteCard(){
        proxy.$refs["delReasonCardRef"].validate(valid => {
            if(valid){
                let remark = delReasonForm.value.remark;
                if(remark == "其他"){
                    remark = delReasonForm.value.other;
                }
                deleteCard(delReasonForm.value.id,remark);
            }
        })
       
    }

    /** 关闭删除确认窗口 */
    function closeDelReasonVisible(){
        delReasonVisible.value = false;
        delReasonForm.value = {
        };
        proxy.resetForm("delReasonCardRef");
    }

    /** 调用删除操作 */
    function deleteCard(id,remark){
        const data = {
            "id":id,
            "status":"DELETED",
            "remark":remark
        }
        review(data).then(response => {
            if(response.code == 200){
                delReasonVisible.value = false;
                proxy.$modal.msgSuccess("删除成功");
                getList();
            }
        })
    }

    /** 银行卡规则校验 */
    function validateCreditCardNumber(rule,value,callback) {
        let cardNumber = value;
        //移除所有非数字字符
        cardNumber = cardNumber.replace(/\D/g, '');

        // 检查卡号是否包含 16到19 位数字
        if (cardNumber.length < 16 || cardNumber.length > 19) {
            callback(new Error("卡号位数校验不通过，请检查"));
        }

        // 使用 Luhn 算法验证银行卡号
        let sum = 0;
        let doubleUp = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));
            if (doubleUp) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            doubleUp = !doubleUp;
        }
        if (sum % 10 === 0) {
            callback();
        } else {
            callback(new Error("卡号规则校验不通过，请检查"));
        }
    }
    getList()
</script>

<style>

.el-table .el-table_body-wrapper::-webkit-scrollbar {
        width: 10px !important;
        height: 10px  !important;
    }
</style>