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
         <el-form-item label="证件号" prop="idNo">
            <el-input
               v-model="queryParams.custId"
               placeholder="请输入证件号"
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
                <el-table-column label="操作" align="center" width="120" >
                    <template #default="scope">
                        <el-button link type="primary" icon="Edit" @click="openBadLoanForm(scope.row)">建档</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="客户名称" prop="custName" :show-overflow-tooltip="true" width="120" />
                <el-table-column label="证件号" align="center" prop="custId" width="150" >
                    <template #default="scope">
                        <el-link type="primary" :underline="false" @click="handleClickCustId(scope.row)">{{ scope.row.custId }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column label="客户现居地址" prop="addr" :show-overflow-tooltip="true" width="200" />
                <el-table-column label="联系电话"  align="center" prop="tel"  width="120" />
                <el-table-column label="配偶姓名" prop="spouseName" width="120" />
                <el-table-column label="配偶证件号" prop="spouseCustId" width="150" />

                <el-table-column label="建档次数" align="center" width="150" >
                    <template #default="scope">
                        <el-link type="primary" @click="jumpBadLoanCust(scope.row.custNo,scope.row.custId)" :disabled="scope.row.times == 0">{{ scope.row.times }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column label="最后建档时间"  align="center" prop="updateTime" min-width="150"></el-table-column>
                
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

        <el-dialog title="不良贷款信息建档" v-model="badLoanCustFormOpen" width="1000px" append-to-body :close-on-click-modal="false" >
            <div style="width:800px; margin:auto; border:2px black">
            <el-form ref="badLoanRef" :model="badLoanCustForm" :rules="badLoanFormRules" label-width="120px"  class="border-form">
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
                            <el-input v-model="badLoanCustForm.dhhm" placeholder="电话号码" style="width: 300px;" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="借款人现居地址" prop="xjdz">
                            <el-input v-model="badLoanCustForm.xjdz" placeholder="地址" style="width: 700px;"/>
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
                        <el-form-item label="借款人职业" prop="zyxx" :required = "true">
                            <el-select v-model="badLoanCustForm.zyxx" placeholder="支持多选" clearable style="width: 300px" multiple>
                                <!-- <el-option
                                    v-for="dict in zyOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                >
                                </el-option> -->
                                <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in zyOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                        </div>
                                </div>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="借款人从业区域" prop="qyfwxx" :required = "true">
                            <el-select v-model="badLoanCustForm.qyfwxx" placeholder="支持多选" clearable style="width: 300px" multiple>
                                <!-- <el-option
                                    v-for="dict in qyOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                /> -->
                                <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in qyOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                        </div>
                                </div>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-form-item label="家庭情况" prop="jtqkxx">
                        <el-select v-model="badLoanCustForm.jtqkxx" placeholder="支持多选" clearable style="width: 640px" multiple>
                            <!-- <el-option
                                v-for="dict in jtqkOption"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                            /> -->
                            <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in jtqkOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                        </div>
                            </div>
                        </el-select>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-col :span="12">
                    <el-form-item label="不良嗜好" prop="blshxx">
                        <el-select v-model="badLoanCustForm.blshxx" placeholder="支持多选" clearable style="width: 640px" multiple>
                            <!-- <el-option
                                v-for="dict in blshOption"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                            /> -->
                            <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in blshOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                        </div>
                            </div>
                        </el-select>
                    </el-form-item>
                    </el-col>
                    <el-col  :span="12">
                        <el-form-item label="负面信息" prop="fmxxxx">
                            <el-select v-model="badLoanCustForm.fmxxxx" placeholder="支持多选" clearable style="width: 640px" multiple>
                                <!-- <el-option
                                    v-for="dict in fmxxOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                /> -->
                                <div class="option-dropdown">
                                        <div class="columns"> 
                                            <div class="column" v-for="(dict,index) in fmxxOption">
                                                <el-option 
                                                :label="dict.label"
                                                :value="dict.value"></el-option>
                                            </div>
                                            </div>
                                </div>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- <el-row>
                    
                </el-row> -->
                <el-row>
                    <el-form-item label="家庭资产情况">
                        <el-checkbox-group v-model="checkZcqk" @change="hangleZcChange">
                            <el-checkbox label="房产" style="width: 280px;">房产
                                <el-input v-if="showfc" v-model="jtzcqkform.fcms" placeholder="请输入房产情况(必填)" style="width: 230px" />
                            </el-checkbox>
                            <el-checkbox label="汽车" style="width: 280px;">汽车
                                <el-input v-if="showqc" v-model="jtzcqkform.qcms" placeholder="请输入车产情况(必填)" style="width: 230px"/>
                            </el-checkbox>
                            <el-checkbox label="药材" style="width: 280px;">药材
                                <el-input v-if="showyc" v-model="jtzcqkform.ycms" placeholder="请输入药材持有情况(必填)" style="width: 230px" />
                            </el-checkbox>
                            <el-checkbox label="厂房" style="width: 280px;" >厂房
                                <el-input v-if="showcf" v-model="jtzcqkform.cfms" placeholder="请输入厂房情况(必填)" style="width: 230px" />
                            </el-checkbox>
                            <el-checkbox label="设备" style="width: 280px;">设备
                                <el-input v-if="showsb" v-model="jtzcqkform.sbms" placeholder="请输入厂房情况(必填)" style="width: 230px" />
                            </el-checkbox>
                            <el-checkbox label="其他" style="width: 280px;">其他
                                <el-input v-if="showqt" v-model="jtzcqkform.qtms" placeholder="请输入其他资产情况(必填)" style="width: 230px" />
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-row>


                <el-row>
                    <el-col :span="12">
                        <el-form-item label="家庭收入来源" prop="srlyxx" :required = "true">
                            <el-select v-model="badLoanCustForm.srlyxx" placeholder="支持多选" clearable style="width: 300px" multiple>
                                <!-- <el-option
                                    v-for="dict in srlyOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                /> -->
                                <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in srlyOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                        </div>
                                </div>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="家庭主要支出" prop="jtzcxx" :required = "true">
                            <el-select v-model="badLoanCustForm.jtzcxx" placeholder="支持多选" clearable style="width: 300px" multiple>
                                <!-- <el-option
                                    v-for="dict in jtzcOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                /> -->
                                <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in jtzcOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                        </div>
                                </div>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="家庭年收入估算" prop="nsr" :required = "true">
                            <el-select v-model="badLoanCustForm.nsr" placeholder="年收入" clearable style="width: 300px">
                                <el-option
                                    v-for="dict in nsrOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                />
                            </el-select>
                    </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="家庭年支出估算" prop="nzc" :required = "true">
                            <el-select v-model="badLoanCustForm.nzc" placeholder="年支出" clearable style="width: 300px">
                                <el-option
                                    v-for="dict in nsrOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="能否联系到本人" prop="isLxbr" :required = "true">
                            <el-select v-model="badLoanCustForm.isLxbr" placeholder="能否联系本人" clearable style="width: 300px">
                                <el-option label="是" value="是"></el-option>
                                <el-option label="否" value="否"></el-option>
                            </el-select>
                    </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="联系方式及时间" prop="lxfsasj" :required = "true" v-if="badLoanCustForm.isLxbr == '是'">
                            <el-input v-model="badLoanCustForm.lxfsasj" placeholder="输入联系方式及时间" style="width: 700px;"/>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="还款意愿" prop="hkyy" :required = "true">
                            <el-select v-model="badLoanCustForm.hkyy" placeholder="还款意愿" clearable style="width: 300px">
                                <el-option label="好" value="好"></el-option>
                                <el-option label="一般" value="一般"></el-option>
                                <el-option label="差" value="差"></el-option>
                                <el-option label="极差" value="极差"></el-option>
                            </el-select>
                        </el-form-item>
                        
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="配偶姓名" prop="poxm">
                            <el-input v-model="badLoanCustForm.poxm" placeholder="配偶姓名" style="width: 300px;"/>
                        </el-form-item>
                        
                    </el-col>
                </el-row>

                
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="配偶证件号" prop="pozjh">
                            <el-input v-model="badLoanCustForm.pozjh" placeholder="配偶证件号" style="width: 300px;"/>
                        </el-form-item>
                        
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="配偶联系电话" prop="polxdh">
                            <el-input v-model="badLoanCustForm.polxdh" placeholder="配偶联系电话" style="width: 300px;"/>
                        </el-form-item>
                        
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="配偶当前职业" prop="pozyxx">
                            <el-select v-model="badLoanCustForm.pozyxx" placeholder="支持多选" clearable style="width: 300px" multiple>
                                <!-- <el-option
                                    v-for="dict in zyOption"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value"
                                /> -->
                                <div class="option-dropdown">
                                    <div class="columns"> 
                                        <div class="column" v-for="(dict,index) in zyOption">
                                            <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                        </div>
                                    </div>
                                </div>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="配偶家庭地位" prop="podw">
                            <el-select v-model="badLoanCustForm.podw" placeholder="配偶家庭地位" clearable style="width: 300px">
                                <el-option label="主角" value="主角"></el-option>
                                <el-option label="配角" value="配角"></el-option>
                                <el-option label="平等" value="平等"></el-option>
                                <el-option label="无地位" value="无地位"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-form-item label="担保情况描述" prop="dbqkDesc" :required = "badLoanCustForm.dbfsye.includes('抵押') || badLoanCustForm.dbfsye.includes('保证')">
                        <el-input v-model="badLoanCustForm.dbqkDesc" type="textarea" placeholder="担保情况描述" :autosize="{minRows:2,maxRows:8}" style="width: 640px" />
                    </el-form-item>
                </el-row>

                <el-row>
                    <el-form-item label="清收难点分析" prop="qsndxx">
                        <el-select v-model="badLoanCustForm.qsndxx" placeholder="支持多选" clearable style="width: 640px" multiple>
                            <!-- <el-option label="诉讼过程复杂" value="诉讼过程复杂"></el-option>
                            <el-option label="死亡" value="死亡"></el-option>
                            <el-option label="失联" value="失联"></el-option>
                            <el-option label="无收入" value="无收入"></el-option>
                            <el-option label="家庭负担过重" value="家庭负担过重"></el-option> -->
                            <div class="option-dropdown">
                                <div class="columns"> 
                                    <div class="column" v-for="(dict,index) in qsndOption">
                                        <el-option 
                                            :label="dict.label"
                                            :value="dict.value"></el-option>
                                    </div>
                                </div>
                            </div>
                        </el-select>
                       
                    </el-form-item>
                </el-row>

                <el-row>
                    <el-form-item label="收回可能性" prop="shkn" :required = "true" style="width: 40%;">
                        <el-select v-model="badLoanCustForm.shkn" clearable @change="knxChange">
                            <el-option label="可盘活" value="可盘活"></el-option>
                            <el-option label="全额清收" value="全额清收"></el-option>
                            <el-option label="部分清收" value="部分清收"></el-option>
                            <el-option label="待清收" value="待清收"></el-option>
                            <el-option label="无法清收" value="无法清收"></el-option>
                        </el-select>
                        
                    </el-form-item>
                    <el-form-item prop="shknfx" style="width: 60%;">
                        <el-input v-model="badLoanCustForm.shknfx" :placeholder="shknHolder" :required = "true"/>
                    </el-form-item>
                </el-row>

                <el-row>
                    <el-form-item label="客户分析" prop="khpj" :required = "true">
                        <el-input v-model="badLoanCustForm.khpj" type="textarea" placeholder="填写不良成因、客户近况、拟采取措施等" :autosize="{minRows:2,maxRows:8}" style="width: 640px" />
                    </el-form-item>
                </el-row>
            </el-form>
        </div>
            <template #footer>
                <div class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancelForm">取 消</el-button>
                </div>
            </template>
        </el-dialog>
       
        <el-dialog v-model="loanCustInfoOpen" >
            <template #footer>
                <div class="dialog-footer">
                <el-button type="primary" @click="submitCustInfoForm">确 定</el-button>
                <el-button @click="cancelCustInfoForm">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script  setup name="LoanCust">
    const { proxy } = getCurrentInstance();
    import { queryLoanCust,insertBadLoanCust } from "@/api/szhl/loans/loanCust";
    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const data = reactive({
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },

        checkZcqk:[],
        showfc:false,
        showqc:false,
        showyc:false,
        showcf:false,
        showsb:false,
        showqt:false,
        shknHolder:"分析",
        badLoanFormRules: {
            zyxx: [{ type:'array', required: true, message: "职业不能为空", trigger: "change" }],
            qyfwxx: [{ required: true, message: "区域不能为空", trigger: "change" }],
            isLxbr: [{ required: true, message: "选择是否能联系到本人", trigger: "change" }],
            hkyy: [{ required: true, message: "请选择还款意愿", trigger: "change" }],
            shkn: [{ required: true, message: "请选择收回可能", trigger: "change" }],
            shknfx: [{ required: true, message: "请填写说明", trigger: "blur" }],
            khpj: [{ required: true, message: "请填写", trigger: "blur" }],
            srlyxx: [{ required: true, message: "收入来源不能为空", trigger: "change" }],
            jtzcxx: [{ required: true, message: "主要支出不能为空", trigger: "change" }],
            nsr: [{ required: true, message: "年收入不能为空", trigger: "change" }],
            nzc: [{ required: true, message: "年支出不能为空", trigger: "change" }],
            lxfsasj: [{ required: true, message: "请填写", trigger: "blur" }],
            dbqkDesc: [{ required: true, message: "请填写", trigger: "blur" }],
        },
    });
    const { queryParams,checkZcqk,showfc,showqc,showyc,showcf,showsb,showqt,shknHolder,badLoanFormRules } = toRefs(data);

    /** 不良贷款窗口 */
    const badLoanCustFormOpen = ref(false);
    const badLoanCustForm = ref({
        zyxx:[],
        qyfwxx:[],
        srlyxx:[],
        jtzcxx:[]
    })
    const jtzcqkform = ref({})

    const loanCustInfoOpen = ref(false);

    /** 职业选项 */
    const zyOption = ref([
        {label:"公务员/事业",value:"公务员/事业"},
        {label:"国企/外企",value:"国企/外企"},
        {label:"私企工作",value:"私企工作"},
        {label:"普通员工",value:"普通员工"},
        {label:"中层领导",value:"中层领导"},
        {label:"高管",value:"高管"},
        {label:"个体工商户",value:"个体工商户"},
        {label:"餐饮住宿",value:"餐饮住宿"},
        {label:"社会教培",value:"社会教培"},
        {label:"传统农业",value:"传统农业"},
        {label:"经济农业种植",value:"经济农业种植"},
        {label:"工匠手艺人",value:"工匠手艺人"},
        {label:"家庭主妇",value:"家庭主妇"},
        {label:"地产开发商",value:"地产开发商"},
        {label:"工程承包",value:"工程承包"},
        {label:"KTV/洗浴/娱乐",value:"KTV/洗浴/娱乐"},
        {label:"中介/典当/咨询",value:"中介/典当/咨询"},
        {label:"出卖人力",value:"出卖人力"},
        {label:"技工",value:"技工"},
        {label:"律师",value:"律师"},
        {label:"教师",value:"教师"},
        {label:"医生",value:"医生"},
        {label:"厨师",value:"厨师"},
        {label:"金融",value:"金融"},
    ]);
    /** 从业地区选项 */
    const qyOption = ref([
        {label:"村内",value:"村内"},
        {label:"镇内",value:"镇内"},
        {label:"县内",value:"县内"},
        {label:"东阳",value:"东阳"},
        {label:"义乌",value:"义乌"},
        {label:"金华市区",value:"金华市区"},
        {label:"市内其他",value:"市内其他"},
        {label:"杭州",value:"杭州"},
        {label:"省内其他",value:"省内其他"},
        {label:"省外",value:"省外"},
    ]);
    /** 家庭情况选项 */
    const jtqkOption = ref([
        {label:"子女已婚",value:"子女已婚"},
        {label:"抚养子女",value:"抚养子女"},
        {label:"赡养父母",value:"赡养父母"},
        {label:"离异/丧偶",value:"离异/丧偶"},
        {label:"重组家庭",value:"重组家庭"},
        {label:"未分家",value:"未分家"},
        {label:"有长期病人",value:"有长期病人"},
        {label:"子女在外",value:"子女在外"},
        {label:"单人独居",value:"单人独居"},
        {label:"父母健在",value:"父母健在"},
        {label:"父母重疾",value:"父母重疾"},
        {label:"父母实力较好",value:"父母实力较好"},
        {label:"父母品行好",value:"父母品行好"},
        {label:"父母不好沟通",value:"父母不好沟通"},
        {label:"子女成年未婚",value:"子女成年未婚"},
        {label:"子女收入较好",value:"子女收入较好"},
    ]);
     /** 不良嗜好选项 */
     const blshOption = ref([
        {label:"吸烟",value:"吸烟"},
        {label:"酗酒",value:"酗酒"},
        {label:"打牌",value:"打牌"},
        {label:"麻将",value:"麻将"},
        {label:"KTV",value:"KTV"},
        {label:"熬夜",value:"熬夜"},
     ])
    /** 负面信息选项 */
    const fmxxOption = ref([
        {label:"未执结案件",value:"未执结案件"},
        {label:"酒驾案底",value:"酒驾案底"},
        {label:"赌博案底",value:"赌博案底"},
        {label:"治安拘留",value:"治安拘留"},
        {label:"司法拘留",value:"司法拘留"},
        {label:"刑满释放",value:"刑满释放"},
        {label:"限高人员",value:"限高人员"},
        {label:"口碑问题",value:"口碑问题"},
        {label:"家庭问题",value:"家庭问题"},
        {label:"上访史",value:"上访史"},
        {label:"投诉史",value:"投诉史"},
        {label:"破产史",value:"破产史"},
        {label:"债务危机",value:"债务危机"},
        {label:"涉嫌诈骗",value:"涉嫌诈骗"},
        {label:"家暴",value:"家暴"},
    ])
    /** 收入来源选项 */
    const srlyOption = ref([
        {label:"工薪奖金",value:"工薪奖金"},
        {label:"经营收入",value:"经营收入"},
        {label:"租赁收入",value:"租赁收入"},
        {label:"零工收入",value:"零工收入"},
        {label:"投资收入",value:"投资收入"},
        {label:"社会救济",value:"社会救济"},
        {label:"财政补贴",value:"财政补贴"},
        {label:"兼职收入",value:"兼职收入"},
        {label:"传统农业",value:"传统农业"},
        {label:"子女给予",value:"子女给予"},
        {label:"版权收入",value:"版权收入"},
        {label:"无收入",value:"无收入"},
    ])
    /** 家庭支出选项 */
    const jtzcOption = ref([
        {label:"衣食住行",value:"衣食住行"},
        {label:"子女抚养",value:"子女抚养"},
        {label:"子女教育",value:"子女教育"},
        {label:"赡养老人",value:"赡养老人"},
        {label:"医疗保健",value:"医疗保健"},
        {label:"娱乐消费",value:"娱乐消费"},
        {label:"他行债务",value:"他行债务"},
        {label:"民间债务",value:"民间债务"},
        {label:"其他支出",value:"其他支出"},
    ])
    /** 年收入/支出选项 */
    const nsrOption = ref([
        {label:"2万元以下",value:"2万元以下"},
        {label:"2-5万元",value:"2-5万元"},
        {label:"5-10万元",value:"5-10万元"},
        {label:"10万元以上",value:"10万元以上"},
    ])

    /** 清收难点选项 */
    const qsndOption = ref([
        {label:"诉讼过程复杂",value:"诉讼过程复杂"},
        {label:"死亡",value:"死亡"},
        {label:"失踪",value:"失踪"},
        {label:"无法联系",value:"无法联系"},
        {label:"无收入",value:"无收入"},
        {label:"家庭负担过重",value:"家庭负担过重"},
        {label:"老赖客户",value:"老赖客户"},
        {label:"道德与合规风险",value:"道德与合规风险"},
        {label:"其他情况",value:"其他情况"},
    ])

      /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
    }
    
    /** 搜索按钮操作 */
    function handleQuery() {
        if((queryParams.value.custName == '' || queryParams.value.custName == null) 
        && (queryParams.value.idNo == '' || queryParams.value.idNo == null)){
            proxy.$modal.msgWarning("请输入选项后查询");
            return;
        }
        getList();
    }

    /** 查询贷款客户列表 */
    function getList() {
        loading.value = true;
        queryLoanCust(proxy.addDateRange(queryParams.value)).then(response => {
            custmerList.value = response.rows;
            total.value = response.total;
        });
        loading.value = false;
    }
    // getList();

    /** ------不良贷款方法------- */
    function openBadLoanForm(row){
        badLoanCustFormOpen.value = true;
        reset();
        badLoanCustForm.value.xm = row.custName;
        badLoanCustForm.value.sfz = row.custId;
        badLoanCustForm.value.khnm = row.custNo;
        badLoanCustForm.value.dhhm = row.tel;
        badLoanCustForm.value.xjdz = row.addr;
        badLoanCustForm.value.dbfsye = row.dkqk;
        badLoanCustForm.value.poxm = row.spouseName;
        badLoanCustForm.value.pozjh = row.spouseCustId;
        badLoanCustForm.value.polxdh = row.spouseTel;
        checkZcqk.value = [];
        hangleZcChange();
    }
    /** 保存 */
    function submitForm() {
        proxy.$refs["badLoanRef"].validate(valid => {
            if (valid) {
                if(!checkjtzc()){
                    return;
                }
                badLoanCustForm.value.zy = badLoanCustForm.value.zyxx == null ? "" : badLoanCustForm.value.zyxx.join(',');
                badLoanCustForm.value.qyfw = badLoanCustForm.value.qyfwxx == null ? "" : badLoanCustForm.value.qyfwxx.join(',');
                badLoanCustForm.value.jtqk = badLoanCustForm.value.jtqkxx == null ? "" : badLoanCustForm.value.jtqkxx.join(',');
                badLoanCustForm.value.blsh = badLoanCustForm.value.blshxx == null ? "" : badLoanCustForm.value.blshxx.join(',');
                badLoanCustForm.value.fmxx = badLoanCustForm.value.fmxxxx == null ? "" : badLoanCustForm.value.fmxxxx.join(',');
                badLoanCustForm.value.srly = badLoanCustForm.value.srlyxx == null ? "" : badLoanCustForm.value.srlyxx.join(',');
                badLoanCustForm.value.jtzc = badLoanCustForm.value.jtzcxx == null ? "" : badLoanCustForm.value.jtzcxx.join(',');
                badLoanCustForm.value.pozy = badLoanCustForm.value.pozyxx == null ? "" : badLoanCustForm.value.pozyxx.join(',');
                badLoanCustForm.value.qsnd = badLoanCustForm.value.qsndxx == null ? "" : badLoanCustForm.value.qsndxx.join(',');
                insertBadLoanCust(badLoanCustForm.value).then(response => {
                    if(response.code == '200'){
                        proxy.$modal.msgSuccess("保存成功");
                        badLoanCustFormOpen.value = false;
                    }
                })
            }
            
        });
    }

    /** 校验家庭资产情况 */
    function checkjtzc(){
        badLoanCustForm.value.zcqk = "";
        if(checkZcqk.value.includes("房产")){
            if(jtzcqkform.value.fcms == null || jtzcqkform.value.fcms == ''){
                proxy.$modal.msgError("请输入房产情况");
                return false;
            }
            badLoanCustForm.value.zcqk += "房产:"+jtzcqkform.value.fcms
        }

        if(checkZcqk.value.includes("汽车")){
            if(jtzcqkform.value.qcms == null || jtzcqkform.value.qcms == ''){
                proxy.$modal.msgError("请输入汽车情况");
                return false
            }
            if(badLoanCustForm.value.zcqk != null && badLoanCustForm.value.zcqk != ""){
                badLoanCustForm.value.zcqk += ", 汽车:"+jtzcqkform.value.qcms
            }else{
                badLoanCustForm.value.zcqk += "汽车:"+jtzcqkform.value.qcms
            }
            
        }

        if(checkZcqk.value.includes("药材")){
            if(jtzcqkform.value.ycms == null || jtzcqkform.value.ycms == ''){
                proxy.$modal.msgError("请输入药材情况");
                return false
            }
            if(badLoanCustForm.value.zcqk != null && badLoanCustForm.value.zcqk != ""){
                badLoanCustForm.value.zcqk += ", 药材:"+jtzcqkform.value.ycms
            }else{
                badLoanCustForm.value.zcqk += "药材:"+jtzcqkform.value.ycms
            }
        }

        if(checkZcqk.value.includes("厂房")){
            if(jtzcqkform.value.cfms == null || jtzcqkform.value.cfms == ''){
                proxy.$modal.msgError("请输入厂房情况");
                return false
            }
            if(badLoanCustForm.value.zcqk != null && badLoanCustForm.value.zcqk != ""){
                badLoanCustForm.value.zcqk += ", 厂房:"+jtzcqkform.value.cfms
            }else{
                badLoanCustForm.value.zcqk += "厂房:"+jtzcqkform.value.cfms
            }
            
        }

        if(checkZcqk.value.includes("设备")){
            if(jtzcqkform.value.sbms == null || jtzcqkform.value.sbms == ''){
                proxy.$modal.msgError("请输入设备情况");
                return false
            }
            if(badLoanCustForm.value.zcqk != null && badLoanCustForm.value.zcqk != ""){
                badLoanCustForm.value.zcqk += ", 设备:"+jtzcqkform.value.sbms
            }else{
                badLoanCustForm.value.zcqk += "设备:"+jtzcqkform.value.sbms
            }
            
        }

        if(checkZcqk.value.includes("其他")){
            if(jtzcqkform.value.qtms == null || jtzcqkform.value.qtms == ''){
                proxy.$modal.msgError("请输入其他情况");
                return false
            }
            if(badLoanCustForm.value.zcqk != null && badLoanCustForm.value.zcqk != ""){
                badLoanCustForm.value.zcqk += ", 其他:"+jtzcqkform.value.qtms
            }else{
                badLoanCustForm.value.zcqk += "其他:"+jtzcqkform.value.qtms
            }
            
        }

        return true;

    }
    /** 取消按钮 */
    function cancelForm() {
        badLoanCustFormOpen.value = false;
        reset();
    }
    /** 表单重置 */
    function reset() {
        proxy.resetForm("badLoanRef");
    }
    /** 资产情况选择 */
    function hangleZcChange(){
        if(checkZcqk.value.includes("房产")){
            showfc.value = true
        }else{
            showfc.value = false
            jtzcqkform.value.fcms = ''
        }
        if(checkZcqk.value.includes("汽车")){
            showqc.value = true
        }else{
            showqc.value = false
            jtzcqkform.value.qcms = ''
        }
        if(checkZcqk.value.includes("药材")){
            showyc.value = true
        }else{
            showyc.value = false
            jtzcqkform.value.ycms = ''
        }
        if(checkZcqk.value.includes("厂房")){
            showcf.value = true
        }else{
            showcf.value = false
            jtzcqkform.value.cfms = ''
        }
        if(checkZcqk.value.includes("设备")){
            showsb.value = true
        }else{
            showsb.value = false
            jtzcqkform.value.sbms = ''
        }
        if(checkZcqk.value.includes("其他")){
            showqt.value = true
        }else{
            showqt.value = false
            jtzcqkform.value.qtms = ''
        }
    }
    /** 回收可能性改变 */
    function knxChange(){
        if(badLoanCustForm.value.shkn == "可盘活"){
            shknHolder.value = "填写盘活方案(必填)"
        }else if(badLoanCustForm.value.shkn == "全额清收"){
            shknHolder.value = "预计何时能清，需要配合的政策(必填)"
        }else if(badLoanCustForm.value.shkn == "部分清收"){
            shknHolder.value = "预计何时能清，清收比例？需要配合的调节(必填)"
        }else if(badLoanCustForm.value.shkn == "待清收"){
            shknHolder.value = "需要达到什么条件(必填)"
        }else if(badLoanCustForm.value.shkn == "无法清收"){
            shknHolder.value = "说明无法清收原因(必填)"
        }
    }

    /** 查询客户详情 */
    function handleClickCustId(row){
        proxy.$router.push("/customer/detail/" + row.custNo);
    }

    /** 跳转不良客户页 */
    function jumpBadLoanCust(custNo,custId){
        proxy.$router.push({path:'/LoanCust/BadLoanCust', query:{"custId":custId}}).then(()=>{
            proxy.$tab.refreshPage();
        });
    }

    function openLoanInfo(){
        loanCustInfoOpen.value = true;
    }
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