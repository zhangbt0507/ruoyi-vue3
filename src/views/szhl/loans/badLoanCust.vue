<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
         <el-form-item label="客户名称" prop="xm">
            <el-input
               v-model="queryParams.xm"
               placeholder="请输入客户名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="证件号" prop="sfz">
            <el-input
               v-model="queryParams.sfz"
               placeholder="请输入证件号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="录入柜员" prop="updateBy">
            <el-input
               v-model="queryParams.updateBy"
               placeholder="请输入柜员号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="机构号" prop="deptId">
            <el-input
               v-model="queryParams.deptId"
               placeholder="请输入机构号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

        <el-card>
            <div style="min-height:50vh">
            <!-- 表格数据 -->
            <el-table v-loading="loading" :data="custmerList"  style="font-family: '黑体'" max-height="50vh" highlight-current-row>
                <el-table-column label="客户名称" prop="xm" :show-overflow-tooltip="true" width="120" />
                <el-table-column label="证件号" align="center" prop="sfz" width="150" >
                    <template #default="scope">
                        <el-link type="primary" :underline="false" @click="handleClickCustId(scope.row)">{{ scope.row.sfz }}</el-link>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="客户内码" prop="khnm" width="120" /> -->
                <el-table-column label="客户现居地址" prop="xjdz" :show-overflow-tooltip="true" width="200" />
                <el-table-column label="联系电话"  align="center" prop="dhhm"  width="120" />
                <el-table-column label="配偶姓名" prop="poxm" width="120" />
                <el-table-column label="配偶证件号" prop="pozjh" width="150" />
                <!-- <el-table-column label="配偶内码" align="center"  prop="ponm" width="150"></el-table-column> -->
                <el-table-column label="录入柜员" align="center" prop="updateBy" width="120" />
                <el-table-column label="录入机构" align="center" prop="deptId" width="120" />
                <el-table-column label="录入时间" align="center" prop="updateTime" width="180" />
                <el-table-column label="操作" align="center" min-width="150">
                    <template #default="scope">
                        <el-button link type="primary" icon="View" @click="toDetail(scope.row)">详情</el-button>
                        <el-button link type="primary" icon="Edit" @click="toEdit(scope.row)"
                        :disabled="(useUserStore().name != scope.row.updateBy)"
                        :style="{color: ((useUserStore().name != scope.row.updateBy) ? '#ccc' : '')}"
                        >修改</el-button>
                        <el-button link type="primary" icon="Delete" @click="deleteCust(scope.row)"
                        :disabled="(useUserStore().name != scope.row.updateBy)"
                        :style="{color: ((useUserStore().name != scope.row.updateBy) ? '#ccc' : '')}"
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
       
        <el-dialog title="详情" v-model="badLoanCustFormOpen" width="1000px" append-to-body :close-on-click-modal="false" >
                <div style="width:800px; margin:auto; border:2px black">
                <el-form ref="badLoanRef" :model="badLoanCustForm" label-width="120px"  class="border-form">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="借款人姓名" prop="xm" :required = "true">
                                <el-input v-model="badLoanCustForm.xm" placeholder="姓名" style="width: 250px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="证件号" prop="sfz" :required = "true">
                                <el-input v-model="badLoanCustForm.sfz" placeholder="证件号" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="客户内码" prop="khnm" :required = "true">
                                <el-input v-model="badLoanCustForm.khnm" placeholder="姓名" style="width: 250px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="借款人电话号码" prop="dhhm">
                                <el-input v-model="badLoanCustForm.dhhm" placeholder="电话号码" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="借款人现居地址" prop="xjdz">
                                <el-input v-model="badLoanCustForm.xjdz" placeholder="地址" style="width: 700px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="担保方式及余额" prop="dbfsye" >
                                <el-input v-model="badLoanCustForm.dbfsye" placeholder="担保方式及余额" style="width: 640px;" :disabled="true"/>
                                <!-- <el-button  @click="openLoanInfo()">详情</el-button> -->
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="借款人职业" prop="zy" :required = "true">
                                <el-input v-model="badLoanCustForm.zy" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="借款人从业区域" prop="qyfw" :required = "true">
                                <el-input v-model="badLoanCustForm.qyfw" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-form-item label="家庭情况" prop="jtqk">
                            <el-input v-model="badLoanCustForm.jtqk" style="width: 640px;" :disabled="true"/>
                        </el-form-item>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                        <el-form-item label="不良嗜好" prop="blsh">
                            <el-input v-model="badLoanCustForm.blsh" style="width: 300px;" :disabled="true"/>
                        </el-form-item>
                        </el-col>
                        <el-col  :span="12">
                            <el-form-item label="负面信息" prop="fmxx">
                                <el-input v-model="badLoanCustForm.fmxx" style="width: 640px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- <el-row>
                        
                    </el-row> -->
                    <el-row>
                        <el-form-item label="家庭资产情况">
                            <el-input v-model="badLoanCustForm.zcqk" style="width: 640px;" :disabled="true"/>
                        </el-form-item>
                    </el-row>


                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="家庭收入来源" prop="srly" :required = "true">
                                <el-input v-model="badLoanCustForm.srly" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="家庭主要支出" prop="jtzc" :required = "true">
                                <el-input v-model="badLoanCustForm.jtzc" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="家庭年收入估算" prop="nsr" :required = "true">
                                <el-input v-model="badLoanCustForm.nsr" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="家庭年支出估算" prop="nzc" :required = "true">
                                <el-input v-model="badLoanCustForm.nzc" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="能否联系到本人" prop="isLxbr" :required = "true">
                                <el-input v-model="badLoanCustForm.isLxbr" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="联系方式及时间" prop="lxfsasj" :required = "true" v-if="badLoanCustForm.isLxbr == '是'">
                                <el-input v-model="badLoanCustForm.lxfsasj" style="width: 700px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="还款意愿" prop="hkyy" :required = "true">
                                <el-input v-model="badLoanCustForm.hkyy" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                            
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="配偶姓名" prop="poxm">
                                <el-input v-model="badLoanCustForm.poxm" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                            
                        </el-col>
                    </el-row>

                    
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="配偶证件号" prop="pozjh">
                                <el-input v-model="badLoanCustForm.pozjh" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                            
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="配偶联系电话" prop="polxdh">
                                <el-input v-model="badLoanCustForm.polxdh" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                            
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="配偶当前职业" prop="pozy">
                                <el-input v-model="badLoanCustForm.pozy" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="配偶家庭地位" prop="podw">
                                <el-input v-model="badLoanCustForm.podw" style="width: 300px;" :disabled="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-form-item label="担保情况描述" prop="dbqkDesc">
                            <el-input v-model="badLoanCustForm.dbqkDesc" style="width: 640px;" :disabled="true"/>
                        </el-form-item>
                    </el-row>

                    <el-row>
                        <el-form-item label="清收难点分析" prop="qsnd">
                            <el-input v-model="badLoanCustForm.qsnd" style="width: 640px;" :disabled="true"/>
                        </el-form-item>
                    </el-row>

                    <el-row>
                        <el-form-item label="收回可能性" prop="shkn" :required = "true" style="width: 40%;">
                            <el-input v-model="badLoanCustForm.shkn" style="width: 640px;" :disabled="true"/>
                        </el-form-item>
                        <el-form-item prop="shknfx" style="width: 60%;">
                            <el-input v-model="badLoanCustForm.shknfx" style="width: 640px;" :disabled="true"/>
                        </el-form-item>
                    </el-row>

                    <el-row>
                        <el-form-item label="客户分析" prop="khpj" :required = "true">
                            <el-input v-model="badLoanCustForm.khpj" type="textarea" :disabled="true" :autosize="{minRows:2,maxRows:8}" style="width: 640px" />
                        </el-form-item>
                    </el-row>
                </el-form>
            </div>
            <template #footer>
                <div class="dialog-footer">
                <el-button @click="cancelForm">取 消</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog width="1000px" v-if="loanCustEditOpen" title="编辑" :visible.sync="loanCustEditOpen" v-model="loanCustEditOpen" append-to-body :close-on-click-modal="false" >
            <component :is="editLoanCust"  :id="id" @close-dialog="loanCustEditOpen = false"/>
        </el-dialog>
    </div>
</template>

<script  setup name="BadLoanCust">
    const { proxy } = getCurrentInstance();
    // config.headers.repeatSubmit = true;
    import { queryBadLoanCust,queryBadLoanCustDetail,deleteInfo } from "@/api/szhl/loans/loanCust";
    import editLoanCust from './editLoanCust.vue';
    import useUserStore from '@/store/modules/user'

    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const data = reactive({
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            sfz: proxy.$route.query.custId,
        },
    })
    const badLoanCustFormOpen = ref(false);
    const badLoanCustForm = ref({
    })

    const loanCustEditOpen = ref(false);

    const id = ref('');

    const { queryParams } = toRefs(data);
    /** 查询不良贷款客户列表 */
    function getList() {
        loading.value = true;
        queryBadLoanCust(proxy.addDateRange(queryParams.value)).then(response => {
            custmerList.value = response.rows;
            total.value = response.total;
        });
        loading.value = false;
    }

    function  toDetail(row) {
        badLoanCustFormOpen.value = true;
        queryBadLoanCustDetail(row.id).then(response => {
            badLoanCustForm.value = response.data;
        })
    }

    function toEdit(row){
        id.value = row.id;
        loanCustEditOpen.value = true;
    }

    function deleteCust(row){
        proxy.$modal.confirm('是否确认删除？').then(function () {
            deleteInfo(row.id).then(response => {
                if(response.code == 200){
                    proxy.$modal.msgSuccess("删除成功");
                    getList();
                }
            })
        })
    }

        /** 取消按钮 */
    function cancelForm() {
        badLoanCustFormOpen.value = false;
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        getList();
    }
    /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
        queryParams.value.sfz = null;
    }

    
    /** 查询客户详情 */
    function handleClickCustId(row){
        proxy.$router.push("/customer/detail/" + row.khnm);
    }

    getList();

</script>

<style>
    .el-scrollbar__bar.is-horizontal {
        height: 12px;
    } 

    .el-form-item__content {
        margin-left: 0 !important;
    }

    /* .multi-column .el-select-dropdown_item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
    } */
    .option-dropdown {
        display: flex;
        flex-wrap: wrap;
        max-height: 300px;
        /* overflow-y: auto; */
        max-width: 500px;
    }
    .columns {
        display:flex;
        flex-direction:row;
        justify-content:space-between;
        flex-wrap: wrap;
    }
    .column {
        flex: 1 1 30%;
        box-sizing: border-box;
        padding: 2px;
    }
    .border-form {
        border: 2px solid rgb(121, 121, 128);
        border-radius: 5px;
        padding: 18px
    }
</style>