<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
         <el-form-item label="卡号" prop="cardNo">
            <el-input
               v-model="queryParams.cardNo"
               placeholder="请输入卡号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
               maxlength="19"
            />
         </el-form-item>
         <el-form-item label="柜员号" prop="cancelStaff">
            <el-input
               v-model="queryParams.cancelStaff"
               placeholder="请输入柜员号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="销卡日期" prop="cancelDate">
            <el-date-picker
               type="date"
               placeholder="销卡日期"
               v-model="queryParams.cancelDate"
               clearable
               style="width: 240px"
               format="YYYY-MM-DD"
               value-format="YYYY-MM-DD"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="机构" prop="deptId">
            <el-select v-model="queryParams.deptId"  placeholder="请选择机构" clearable style="margin-top:-5px width: 120px">
                <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                <span style="float:left">{{item.deptName}}</span>
                <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                </el-option>
            </el-select>
         </el-form-item>
         <!-- <el-form-item label="联系电话" prop="tel">
            <el-input
               v-model="queryParams.tel"
               placeholder="请输入联系电话"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item> -->
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button
             type="primary"
             @click="destroyAll"
             icon="Edit"
          >批量审批</el-button>
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
              <el-table-column label="操作" align="center" min-width="150">
                  <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="destroy(scope.row.id,scope.row.cardNo)">审批</el-button>
                    <el-button link type="primary" icon="Back" @click="back(scope.row.id)" title="回退至上报审批">回退</el-button>
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
       
    </div>
</template>

<script  setup name="beReviewCard">
    const { proxy } = getCurrentInstance();

    import { queryDestroyed,destroyedRegist,updateStatusById } from "@/api/szhl/card/scrapCard";
    import { listAllDept } from "@/api/system/dept";
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

    const user = ref({
        name: useUserStore().name
    });

    const { queryParams } = toRefs(data);

    const orgs = ref([]);

      /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
    }

    /** 查询待销毁列表 */
    function getList() {
        loading.value = true;
        queryParams.value.status = 'DESTROYED_REGIST'
        queryDestroyed(proxy.addDateRange(queryParams.value)).then(response => {
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
        // single.value = selection.length != 1;
        // multiple.value = !selection.length;
    }


    /** 销毁登记 */
    function destroy(id,cardNo){
        let cardNos = [];
        let ids = [];
        if(typeof id === 'string'){
            cardNos.push(cardNo.trim());
            ids.push(id);
        }else{
            if(id.length == 0){
                proxy.$modal.msgError("请选择选项")
                return;
            }
            ids = id;
            cardNos = cardNo
        }
        let formData = new FormData();
        formData.append("status",'DESTROYED_REGIST');
        formData.append("newStatus",'DESTROYED');
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

    /** 回退 成待上报 */
    function back(id){
        let formData = new FormData();
        formData.append("status",'BE_DESTROYED');
        formData.append("id",id);
        updateStatusById(formData).then(response => {
            if(response.code == 200){
                proxy.$modal.msgSuccess("回退成功");
                getList();
            }
        })
    }

    /** 多选销毁 */
    function destroyAll(){
        destroy(ids.value,cardNos.value);
    }

    //获取部门
    listAllDept().then(res => {
        if(res.code == 200){
            for(let a of res.data){
                if(a.code != '907000'){
                    orgs.value.push(a);
                }
            }
        }
        
    });
    getList()
</script>