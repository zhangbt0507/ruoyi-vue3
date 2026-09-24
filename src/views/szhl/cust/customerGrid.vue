<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
         <el-form-item label="客户名称" prop="custName">
            <el-input
               v-model="queryParams.custName"
               placeholder="请输入客户名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="客户内码" prop="custIsn">
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
         </el-form-item>
         
         <el-form-item label="乡镇" prop="xz">
            <el-select v-model="queryParams.xz" @change="xzSelectChange" placeholder="乡镇" style="width: 240px;" clearable>
                <el-option
                    v-for="item in xzOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="行政村" prop="xzc">
            <el-select v-model="queryParams.xzc" @change="xzcSelectChange" placeholder="行政村" style="width: 240px;" clearable>
                <el-option
                    v-for="item in xzcOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="网格区域" prop="zrc">
            <el-select v-model="queryParams.zrc" placeholder="网格区域" style="width: 240px;" clearable>
                <el-option
                    v-for="item in zrcOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
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
          <el-table v-loading="loading" :data="custmerList"  style="font-family: '黑体'" max-height="50vh" v-horizontal-scroll="'always'" highlight-current-row>
              <el-table-column label="客户名称" prop="custName" width="120" />
              <el-table-column label="客户内码" prop="custIsn" width="120" >
              </el-table-column>
              <el-table-column label="联系电话" prop="tel" width="120" />
              <!-- <el-table-column label="民族" prop="nation" width="100" /> -->
              <!-- <el-table-column label="证件类型" prop="idType" width="150" /> -->
              <el-table-column label="证件号" align="center" prop="idNo" width="150" />
              <el-table-column label="工作单位" prop="workCo" :show-overflow-tooltip="true" width="200" />
              <el-table-column label="网格区域"  align="center" prop="zrc"  width="120" />
              <el-table-column label="是否黑名单" align="center"  prop="isBlack" width="150"></el-table-column>
              <el-table-column label="客户经理" align="center"  prop="gyh" width="80"></el-table-column>
              <el-table-column label="丰收互联是否开通" align="center"  width="80"><template  #default="scope">{{  scope.row.fshlFlag == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="有效合同客户" align="center"  width="80"><template  #default="scope">{{  scope.row.effLoanContract == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="有贷款余额" align="center"  width="80"><template  #default="scope">{{  scope.row.effLoanBalance == '1' ? '是' : '否' }}</template></el-table-column>
              
              <el-table-column label="理财余额客户" align="center"  width="80"><template  #default="scope">{{  scope.row.effInvrstBalance == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="电费签约标志" align="center"  width="80"><template  #default="scope">{{  scope.row.electSign == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="水费签约标志" align="center"  width="80"><template  #default="scope">{{  scope.row.waterSign == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="ETC签约标志" align="center"  width="80"><template  #default="scope">{{  scope.row.etcSign == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="医保代扣签约标志" align="center"  width="80"><template  #default="scope">{{  scope.row.medSign == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="社保代扣签约标志" align="center"  width="80"><template  #default="scope">{{  scope.row.socialSign == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="POS商户标志" align="center"  width="80"><template  #default="scope">{{  scope.row.posMerchant == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="一码通商户标志" align="center"  width="80"><template  #default="scope">{{  scope.row.qrCodeMerchant == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="信用卡商户标志" align="center"  width="80"><template  #default="scope">{{  scope.row.creditCust == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="三代社保卡标志" align="center"  width="80"><template  #default="scope">{{  scope.row.socialCard3 == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="养老金代发标志" align="center"  width="80"><template  #default="scope">{{  scope.row.oldAgePension == '1' ? '是' : '否' }}</template></el-table-column>
              <el-table-column label="企业微信认证标志" align="center"  width="80"><template  #default="scope">{{  scope.row.cwechatAuthStatus == '1' ? '是' : '否' }}</template></el-table-column>

              <!-- <el-table-column label="修改柜员号" align="center"  prop="modifyStaff" width="100"></el-table-column>
              <el-table-column label="修改机构号" align="center"  prop="modifyOrg" width="100"></el-table-column>
              <el-table-column label="修改时间" align="center"  prop="modifyDate" width="100"></el-table-column> -->
              <!-- <el-table-column label="查看详情" min-width="150">
                  <template #default="scope">
                    <el-button link type="primary" icon="View" @click="toCustDetail(scope.row.custIsn)">详情</el-button>
                  </template>
              </el-table-column> -->
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

<script  setup name="Customer">
    const { proxy } = getCurrentInstance();

    import { listCustom } from "@/api/szhl/custom/Customer";
    import { listxz, listxzc, listzrc} from "@/api/szhl/custom/custTown";

    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const data = reactive({
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },
        xzOption:[],
        xzcOption:[],
        zrcOption:[],
    });

    const { queryParams,xzOption,xzcOption,zrcOption } = toRefs(data);

      /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
    }

    /** 查询征信报告列表 */
    function getList() {
        if((queryParams.value.xzc == null || queryParams.value.xzc == '')
        ){
            proxy.$modal.msgError(`乡镇跟行政村必选`);
            return;
        }
        loading.value = true;
        listCustom(proxy.addDateRange(queryParams.value)).then(response => {
            custmerList.value = response.rows;
            total.value = response.total;
        });
        loading.value = false;
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        getList();
    }

    
    function  toCustDetail(custIsn) {
        proxy.$router.push("/customer/detail/" + custIsn.trim());
        // proxy.$router.push("/system/user-aut/role/" + 1019);
        // debugger
        // proxy.$router.push({ path: "/customer/detail",query: {"custIsn": custIsn.trim()}});
    }

    function getXz(){
        xzOption.value = [];
        listxz(proxy.addDateRange(queryParams.value)).then(response => {
            for(let xz of response.data.xzs){
                xzOption.value.push({ value: xz, label: xz });
            }
        });
    }

    function xzSelectChange(value){
        xzcOption.value = [];
        zrcOption.value = [];
        queryParams.value.xzc = null;
        queryParams.value.zrc = null;
        if (value !== "") {
            listxzc(proxy.addDateRange(queryParams.value)).then(response => {
                for(let xzc of response.data.xzcs){
                    xzcOption.value.push({ value: xzc, label: xzc });
                }
            });
        }
    }
    
    function xzcSelectChange(value){
        zrcOption.value = [];
        queryParams.value.zrc = null;
        if (value !== "") {
            listzrc(proxy.addDateRange(queryParams.value)).then(response => {
                for(let zrc of response.data.zrcs){
                    zrcOption.value.push({ value: zrc, label: zrc });
                }
            });
        }
    }

        //导出
    function handleExport(){
        proxy.download("custom/customInfo/export", {
            ...queryParams.value,
        },`客户网格_${new Date().getTime()}.xlsx`);
    }

    getXz();
    // getList()
</script>

<style>
/* .el-table-horizontal-scrollbar:hover {
  filter: brightness(0.1);
  transform: scaleY(2) translateY(-10%);
  background-color: #f50909;
}

*/
.el-scrollbar__bar.is-horizontal {
        height: 12px;
    } 
</style>