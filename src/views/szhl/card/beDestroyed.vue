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
             @click="destroyAll"
             icon="Edit"
          >批量上报</el-button>
         </el-form-item>
      </el-form>
      <el-card>
        <div style="min-height:50vh">
          <!-- 表格数据 -->
          <el-table v-loading="loading" :data="custmerList"  style="font-family: '黑体'" max-height="50vh" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="卡号" prop="cardNo" width="180" />
              <el-table-column label="姓名" prop="custName" width="120" />
              <el-table-column label="销卡机构号" prop="deptId" width="150" />
              <!-- <el-table-column label="民族" prop="nation" width="100" /> -->
              <el-table-column label="录入柜员号" prop="enterStaff" width="150" />
              <el-table-column label="销户柜员号" prop="cancelStaff" width="150" />
              <el-table-column label="销卡日期" prop="cancelDate" width="150" />
              <el-table-column label="复核柜员号" prop="checkStaff" width="150" />
              <el-table-column label="销卡原因" prop="cancelReason" :show-overflow-tooltip="true" width="200" />
              <el-table-column label="状态" width="120" >
                <template  #default="scope">{{ statusEnums[scope.row.status] }}</template>
              </el-table-column>
              <el-table-column label="操作" min-width="150"  align="center">
                  <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="destroy(scope.row.id,scope.row.cardNo)">上报</el-button>
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

    import { queryBeDestroyed,destroyedRegist,review } from "@/api/szhl/card/scrapCard";
    import useUserStore from '@/store/modules/user'
    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const data = reactive({
        queryParams: {
            status:'',
            pageNum: 1,
            pageSize: 10,
        },
        
    });

    const ids = ref([]);
    const cardNos = ref([]);

    const statusEnums = {
        "ENTERED":"已录入",
        "BE_REVIEWED":"待复核",
        "DELETED":"已删除",
        "BE_DESTROYED":"待上报",
        "DESTROYED_REGIST":"待审批",
        "DESTROYED":"已完成",
    }

    const delReasonForm = ref({
        remark:"",
        other:"",
        cardNo:"",
        date:""
    });
    const needInput = ref(false);
    const delReasonVisible = ref(false);
    const delReasons = ref([
        {label:"同卡号换卡未收回",value:"同卡号换卡未收回"},
        {label:"挂失销卡",value:"挂失销卡"},
        {label:"其他",value:"其他"},
    ])
    const delReasonrules = ref({
        remark: [{ required: true, message: "作废原因不能为空", trigger: "blur" }],
        other: [{ required: true, message: "原因不能为空", trigger: "blur" }],
    });

    const { queryParams } = toRefs(data);

      /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
    }

    /** 查询待销毁列表 */
    function getList() {
        loading.value = true;
        queryParams.value.status = 'BE_DESTROYED'
        queryBeDestroyed(proxy.addDateRange(queryParams.value)).then(response => {
            custmerList.value = response.rows;
            total.value = response.total;
        });
        loading.value = false;
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        getList();
    }

    // 多选框选中数据
    function handleSelectionChange(selection) {
        ids.value = selection.map(item => item.id.trim());
        cardNos.value = selection.map(item => item.cardNo.trim());
    }


    /** 销毁登记 */
    function destroy(id,cardNo){
        let ids = [];
        let cardNos = []
        if(typeof id === 'string'){
            cardNos.push(cardNo);
            ids.push(id)
        }else{
            if(id.length == 0){
                proxy.$modal.msgError("请选择选项")
                return;
            }
            cardNos =cardNo;
            ids = id;
        }
        let formData = new FormData();
        formData.append("status",'BE_DESTROYED');
        formData.append("newStatus",'DESTROYED_REGIST');
        formData.append("ids",ids);
        proxy.$modal.confirm('是否确认销毁卡号为"' + cardNo + '"的数据项？').then(function () {
            destroyedRegist(formData).then(response => {
                if(response.code == 200){
                    proxy.$modal.msgSuccess("销毁成功");
                    getList();
                }
            })
        })
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

    /** 删除按钮方法 */
    function delReasonCard(cardNo,id){
        delReasonForm.value = {
        };
        needInput.value = false;
        delReasonForm.value.cardNo = cardNo.trim();
        delReasonForm.value.id = id;
        delReasonVisible.value = true;
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

    /** 删除原因选项改变 */
    function delResonChange(value){
        if(value == "其他"){
            needInput.value = true;
        }else{
            needInput.value = false;
        }
    }

    /** 多选销毁 */
    function destroyAll(){
        destroy(ids.value,cardNos.value);
    }

    getList()
</script>