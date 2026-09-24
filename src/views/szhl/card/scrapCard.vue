<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="50px">
         <el-form-item label="卡号" prop="cardNo">
            <el-input
               v-model="queryParams.cardNo"
               placeholder="请输入卡号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
               maxlength="19"
            />
         </el-form-item>
         <el-form-item label="姓名" prop="custName">
            <el-input
               v-model="queryParams.custName"
               placeholder="请输入客户姓名"
               clearable
               style="width: 120px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>

         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px" @keyup.enter="handleQuery">
                <el-option
                    v-for="dict in statusOption"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
            </el-select>
         </el-form-item>

          <el-form-item label="日期" prop="time">
            <el-date-picker
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
               v-model="queryParams.time"
               placeholder="请选择时间区间"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="机构" prop="deptId" label-width="80">
                <el-select v-model="queryParams.deptId"  placeholder="请选择机构" clearable style="margin-top:-5px width: 120px">
                  <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                    <span style="float:left">{{item.deptName}}</span>
                    <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                  </el-option>
                </el-select>
          
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        >导出</el-button>
         </el-form-item>
      </el-form>
      <el-card>
        <div style="min-height:50vh">
          <!-- 表格数据 -->
          <el-table v-loading="loading" :data="custmerList"  style="font-family: '黑体'" max-height="50vh">
              <el-table-column label="卡号" prop="cardNo" width="180" />
              <el-table-column label="姓名" prop="custName" width="80" />
              <el-table-column label="销卡机构号" prop="deptId" width="100" />
              <el-table-column label="销卡日期" prop="cancelDate" width="100" />
              <el-table-column label="录入柜员号" prop="enterStaff" width="100" />
              <el-table-column label="销户柜员号" prop="cancelStaff" width="100" />
              <el-table-column label="复核柜员号" prop="checkStaff" width="100" />
              <el-table-column label="监督柜员" prop="destrorySuperviseStaff" width="100" />
              <el-table-column label="销毁时间" prop="destroryTime" align="center"  width="180" />
              <el-table-column label="数据来源" align="center" width="100" >
                <template  #default="scope">{{ dataSourceEnums[scope.row.dataSource] }}</template>
              </el-table-column>
              <el-table-column label="销卡原因" prop="cancelReason" :show-overflow-tooltip="true" width="100" />
              <el-table-column label="状态" width="100" >
                <template  #default="scope">{{ statusEnums[scope.row.status] }}</template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="100" />
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

    import { queryAllCard } from "@/api/szhl/card/scrapCard";
    import { listAllDept } from "@/api/system/dept";
    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const data = reactive({
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },
        
    });

    const statusEnums = {
        "ENTERED":"已录入",
        "BE_REVIEWED":"待复核",
        "DELETED":"已删除",
        "BE_DESTROYED":"待上报",
        "DESTROYED_REGIST":"待审批",
        "DESTROYED":"已完成",
    }

    const statusOption = ref([
        {label:"已录入",value:"ENTERED"},
        {label:"待复核",value:"BE_REVIEWED"},
        {label:"已删除",value:"DELETED"},
        {label:"待上报",value:"BE_DESTROYED"},
        {label:"待审批",value:"DESTROYED_REGIST"},
        {label:"已完成",value:"DESTROYED"},
    ]);

    const dataSourceEnums = {
        "ARTIFICIAL":"人工",
        "MACHINE":"自动"
    }

    const { queryParams } = toRefs(data);

    const orgs = ref([]);

      /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
    }

    //导出
    function handleExport(){
        proxy.download("scrap/card/export", {
        ...queryParams.value,
      },`废卡清单_${new Date().getTime()}.xlsx`);
    }


    /** 查询待销毁列表 */
    function getList() {
        loading.value = true;
        //后端对应枚举值，传空字符串异常
        if(queryParams.value.status == ""){
            queryParams.value.status = null
        }
        if(queryParams.value.time != null && queryParams.value.time != ""){
            queryParams.value.startTime = queryParams.value.time[0];
            queryParams.value.endTime = queryParams.value.time[1];
        }else{
            queryParams.value.startTime = null;
            queryParams.value.endTime = null;
        }
       
        queryAllCard(proxy.addDateRange(queryParams.value)).then(response => {
            custmerList.value = response.rows;
            total.value = response.total;
        });
        loading.value = false;
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        getList();
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