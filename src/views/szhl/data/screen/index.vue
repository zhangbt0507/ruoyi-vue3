<template>
<div class="app-container home ">
    <el-row :gutter="10">
        
        <el-col :span="24"  >
            
            <el-card>
                <template #header>
                    <div>
                        2025业务经营考核指标(T+2)
                        <el-date-picker v-model="workDate" placeholder="选择日期"   size="small" value-format="YYYYMMDD" :disabled-date="disabledFun" style="width:140px;margin-top:-5px" :onchange="dateBlurEvent()"></el-date-picker>
                    </div>
                </template>
                
                <div>
                    <el-tabs type="border-card" v-model="activeName">
                        <el-tab-pane label="存贷指标(T+2)" name="cd">
                            <el-tabs type="card" v-model="activeName2">
                                <el-tab-pane label="日均各项存款" name="ck">
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp3 :assessName="'日均各项存款增量'" :workDate="workDate" :type="'0'" @jgClickEvent="jgClickEvent"/>
                                            <div class="chart_header"><dict-tag :options="sys_org_name" :value="chartHeader"/></div>
                                            <div  ref="depostCharts" style="margin-top:30px;width: 650px;height:350px" ></div>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp3 :assessName="'日均各项存款增量'" :workDate="workDate" :type="'1'"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                
                                <el-tab-pane label="扩中贷款余额新增"  >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'扩中贷款余额新增'" :workDate="workDate" :type="'0'"/>
                                           
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'扩中贷款余额新增'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="日均各项贷款" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp1 :assessName="'日均各项贷款增量'" :workDate="workDate" :type="'0'" />
                                            
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp1 :assessName="'日均各项贷款增量'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                            </el-tabs>
                           
                        </el-tab-pane>
                        <el-tab-pane label="客户类指标(T+1)" name="kh">
                            <el-tabs type="card" >
                                <el-tab-pane label="日均普惠小微贷款"  >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp1 :assessName="'日均普惠小微贷款'" :workDate="workDate" :type="'0'" />
                                            
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp1 :assessName="'日均普惠小微贷款'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                
                                <el-tab-pane label="小微企业户数"  >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'小微企业户数'" :workDate="workDate" :type="'0'" @jgClickEvent="xwClickEvent" :key="`xw_0_小微企业户数`"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'小微企业户数'" :workDate="workDate" :type="'1'" @jgClickEvent="xwClickEvent" :key="`xw_1_小微企业户数`"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="普通贷款用信户数"  >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'普通贷款用信户数'" :workDate="workDate" :type="'0'" @jgClickEvent="rjGrClickEvent" :key="`pt_0_普通贷款用信户数`"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'普通贷款用信户数'" :workDate="workDate" :type="'1'" @jgClickEvent="rjGrClickEvent" :key="`pt_1_普通贷款用信户数`"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                
                                <el-tab-pane label="个人用信户数" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'个人用信户数'" :workDate="workDate" :type="'0'" @jgClickEvent="grHsClickEvent"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'个人用信户数'" :workDate="workDate" :type="'1'" @jgClickEvent="grHsClickEvent"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="个人核心户数"  >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'个人核心户数'" :workDate="workDate" :type="'0'" @jgClickEvent="dsHxClickEvent"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'个人核心户数'" :workDate="workDate" :type="'1'" @jgClickEvent="dsHxClickEvent"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="对公核心户数"  >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'对公核心户数'" :workDate="workDate" :type="'0'" @jgClickEvent="dgHxClickEvent"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'对公核心户数'" :workDate="workDate" :type="'1'" @jgClickEvent="dgHxClickEvent"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="对公有效代发" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'对公有效代发'" :workDate="workDate" :type="'0'" />
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'对公有效代发'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="季日均个人贷款" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'季日均个人贷款'" :workDate="workDate" :type="'0'"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'季日均个人贷款'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="对公高价值产品持有数(按月统计)" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'对公高价值产品持有数'" :workDate="workDate" :type="'0'"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp2 :assessName="'对公高价值产品持有数'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                            </el-tabs>
                        </el-tab-pane>
                        <el-tab-pane label="利润类指标(T+2)" name="ll">
                            <el-tabs type="card" >
                                <el-tab-pane label="贷款模拟利润" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'贷款模拟利润'" :workDate="workDate" :type="'0'"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'贷款模拟利润'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="存款模拟利润" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'存款模拟利润'" :workDate="workDate" :type="'0'"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'存款模拟利润'" :workDate="workDate" :type="'1'" />
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                            </el-tabs>
                        </el-tab-pane>
                        <el-tab-pane label="息差类指标(T+2)" name="xc">
                            <el-tabs type="card" >
                                <el-tab-pane label="贷款收息率" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp5 :assessName="'贷款收息率'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp5 :assessName="'贷款收息率'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                
                            </el-tabs>
                        </el-tab-pane>
                        <el-tab-pane label="风险类指标(按月统计)">
                            <el-tabs type="card" >
                                <el-tab-pane label="新增不良贷款清收率" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'新增不良贷款清收率'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'新增不良贷款清收率'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="不良贷款净生成率(负向排名)" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp5 :assessName="'不良贷款净生成率'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp5 :assessName="'不良贷款净生成率'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="不良贷款率(负向排名)" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp5 :assessName="'不良贷款率'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp5 :assessName="'不良贷款率'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="不良贷款清收额" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'不良贷款清收额'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'不良贷款清收额'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                            </el-tabs>
                        </el-tab-pane>
                        <el-tab-pane label="财富类指标(按月统计)"  name="cf">
                            <el-tabs type="card" >
                                <el-tab-pane label="理财日均规模" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'理财日均规模'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'理财日均规模'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="贵金属销售额" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'贵金属销售额'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'贵金属销售额'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                <el-tab-pane label="保险销售额" >
                                    <el-row :gutter="10">
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'保险销售额'" :workDate="workDate" :type="'0'" :summary="false"/>
                                        </el-col>
                                        <el-col :span="12">
                                            <AssessTableTemp4 :assessName="'保险销售额'" :workDate="workDate" :type="'1'" :summary="false"/>
                                        </el-col>
                                    </el-row>
                                </el-tab-pane>
                                
                            </el-tabs>
                        </el-tab-pane>
                        <el-tab-pane label="其他"  name="qt">
                            <el-tabs type="card" v-model="activeName1" >
                                <el-tab-pane label="普惠型贷款增幅" name="phx">
                                    <el-table :data="phxData" row-key="assessOrg" v-loading="loading1" :row-class-name="tableRowClassName">
                                        <el-table-column label="机构" prop="assessName"  align="center"/>
                                        <el-table-column label="各项贷款" align="center">
                                            <el-table-column label="基期" prop="jq" align="center">
                                                <template #default="scope">
                                                    {{ parseFloat(scope.row.jq).toLocaleString() }}
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="报告期" prop="bgq" align="center">
                                                <template #default="scope">
                                                    {{ parseFloat(scope.row.bgq).toLocaleString() }}
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="增量" prop="zl" align="center">
                                                <template #default="scope">
                                                    {{ parseFloat(scope.row.zl).toLocaleString() }}
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="增幅" prop="zf" align="center">
                                                <template #default="scope">
                                                    {{(scope.row.zf*100).toFixed(2)}}%
                                                </template>
                                            </el-table-column>
                                        </el-table-column>
                                        <el-table-column label="普惠型贷款" align="center"  name="5">
                                            <el-table-column label="基期" prop="jqPh" align="center">
                                                <template #default="scope">
                                                    {{ parseFloat(scope.row.jqPh).toLocaleString() }}
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="报告期" prop="bgqPh" align="center">
                                                <template #default="scope">
                                                    {{ parseFloat(scope.row.bgqPh).toLocaleString() }}
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="增量" prop="zlPh" align="center">
                                                <template #default="scope">
                                                    {{ parseFloat(scope.row.zlPh).toLocaleString() }}
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="增幅" prop="zfPh" align="center">
                                                <template #default="scope">
                                                    {{(scope.row.zfPh*100).toFixed(2)}}%
                                                </template>
                                            </el-table-column>
                                        </el-table-column>
                                    </el-table>
                                </el-tab-pane>
                                <el-tab-pane label="存款营销奖"  name="deposit">
                                    <el-button type="primary" @click="handleExport('deposit')">导出</el-button>
                                    <el-table :data="depositData" row-key="assessOrg" v-loading="loading2">
                                        <el-table-column label="机构" prop="assessName"  align="center" width="160"/>
                                        <el-table-column label="非机构类存款" align="center">
                                            <el-table-column label="高成本(5元/万元)" align="center">
                                                <el-table-column label="报告期" prop="f_high_bgq" align="center">
                                                    <template #default="scope">
                                                        {{ parseFloat(scope.row.f_high_bgq).toLocaleString() }}
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="增量" prop="f_high_zl" align="center">
                                                    <template #default="scope">
                                                        {{ parseFloat(scope.row.f_high_zl).toLocaleString() }}
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="应发奖金" prop="f_high_jj" align="center">
                                                    <template #default="scope">
                                                        {{ parseFloat(scope.row.f_high_jj).toLocaleString() }}
                                                    </template>
                                                </el-table-column>
                                            </el-table-column>
                                            <el-table-column label="低成本(15元/万元)" align="center">
                                                <el-table-column label="报告期" prop="f_low_bgq" align="center">
                                                    <template #default="scope">
                                                        {{ parseFloat(scope.row.f_low_bgq).toLocaleString() }}
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="增量" prop="f_low_zl" align="center">
                                                    <template #default="scope">
                                                        {{ parseFloat(scope.row.f_low_zl).toLocaleString() }}
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="应发奖金" prop="f_low_jj" align="center">
                                                    <template #default="scope">
                                                        {{ parseFloat(scope.row.f_low_jj).toLocaleString() }}
                                                    </template>
                                                </el-table-column>
                                            </el-table-column>
                                        </el-table-column>
                                        <el-table-column label="机构类存款" align="center">
                                            <el-table-column label="高成本(1元/万元)" align="center">
                                                <el-table-column label="报告期" prop="j_high_bgq" align="center">
                                                    <template #default="scope">
                                                        <span v-if="scope.row.j_high_bgq!='' && scope.row.j_high_bgq!=null">{{ parseFloat(scope.row.j_high_bgq).toLocaleString() }}</span>
                                                        <span v-else>-</span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="增量" prop="j_high_zl" align="center">
                                                    <template #default="scope">
                                                        <span v-if="scope.row.j_high_zl!='' && scope.row.j_high_zl!=null">{{ parseFloat(scope.row.j_high_zl).toLocaleString() }}</span>
                                                        <span v-else>-</span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="应发奖金" prop="j_high_jj" align="center">
                                                    <template #default="scope">
                                                        <span v-if="scope.row.j_high_jj!='' && scope.row.j_high_jj!=null">{{ parseFloat(scope.row.j_high_jj).toLocaleString() }}</span>
                                                        <span v-else>-</span>
                                                    </template>
                                                </el-table-column>
                                            </el-table-column>
                                            <el-table-column label="低成本(3元/万元)" align="center">
                                                <el-table-column label="报告期" prop="j_low_bgq" align="center">
                                                    <template #default="scope">
                                                        <span v-if="scope.row.j_low_bgq!='' && scope.row.j_low_bgq!=null">{{ parseFloat(scope.row.j_low_bgq).toLocaleString() }}</span>
                                                        <span v-else>-</span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="增量" prop="j_low_zl" align="center">
                                                    <template #default="scope">
                                                        <span v-if="scope.row.j_low_zl!='' && scope.row.j_low_zl!=null">{{ parseFloat(scope.row.j_low_zl).toLocaleString() }}</span>
                                                        <span v-else>-</span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="应发奖金" prop="j_low_jj" align="center">
                                                    <template #default="scope">
                                                        <span v-if="scope.row.j_low_jj!='' && scope.row.j_low_jj!=null">{{ parseFloat(scope.row.j_low_jj).toLocaleString() }}</span>
                                                        <span v-else>-</span>
                                                    </template>
                                                </el-table-column>
                                            </el-table-column>
                                        </el-table-column>
                                        <el-table-column label="总应发奖金" prop="zjj" align="center">
                                            <template #default="scope">
                                                <span v-if="scope.row.zjj!='' && scope.row.zjj!=null">{{ parseFloat(scope.row.zjj).toLocaleString() }}</span>
                                                <span v-else>-</span>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-tab-pane>
                                <el-tab-pane label="贷款营销奖" name="loan">
                                    <el-table :data="loanData" row-key="assessOrg"  v-loading="loading3"  width="400">
                                        <el-table-column label="机构" prop="assessOrg"  align="center" >
                                            
                                        </el-table-column>
                                        <el-table-column label="贷款增量效益总绩效(未折算集团客户)" align="center" prop="zjj"> </el-table-column>
                                       
                                    </el-table>
                                </el-tab-pane>
                            
                                
                            </el-tabs>
                        </el-tab-pane>
                    </el-tabs>
                    

                </div>
            </el-card>
        </el-col>
        
    </el-row>
</div>
</template>
<script>
import AssessTableTemp1 from './AssessTableTemp1';
import AssessTableTemp2 from './AssessTableTemp2';
import AssessTableTemp3 from './AssessTableTemp3';
import AssessTableTemp4 from './AssessTableTemp4';
import AssessTableTemp5 from './AssessTableTemp5';
import { getEtlDateDiff } from "@/api/szhl/agency/sumDepositAndLoan";
import { getLoanGrowRate } from "@/api/szhl/agency/OrgTempOne";
import { getDepositOrLoan, getLoanZjx } from "@/api/szhl/agency/OrgTempTwo";5
import { getDepositPieChart, getBaseDepositPieChart, getLoanPieChart } from "@/api/szhl/data/PieChart";
import * as echarts from 'echarts';
const expand = ref(true);
const chartHeader =ref("907000");
const chartHeader1 =ref("907000");
const chartHeader2 =ref("907000");
const chartHeader3 =ref("907000");
const depostCharts2 = ref(null);
const baseDepostCharts = ref(null);
const loanCharts = ref(null);
const activeName = ref('cd');
const activeName1 = ref();
const activeName2 = ref('ck');
const workDate = ref();
const marketData = ref();
const phxData = ref([]);
const depositData = ref([]);
const loanData = ref([]);

const loading1 =ref(false);
const loading2 =ref(false);
const loading3 =ref(false);
const loading4 =ref(false);

const initEffect = (proxy)=> {
    //导出
    const handleExport = (type) => {
      proxy.download("org-temp-two/export/"+workDate.value+"/"+type, {
      },`营销奖励_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
    }
    const expandEvent = ()=>{
        expand.value = !expand.value
    }
    const dateBlurEvent = ()=>{
        if(workDate.value != undefined){
            getAssess();
            initChart(workDate.value);
        }
    }
    //获取指标结果
    const getAssess = ()=>{
        loading1.value = true;
        loading2.value = true;
        loading3.value = true;
        loading4.value = true;
       
        
        //普惠型贷款增幅
        getLoanGrowRate(workDate.value).then(res => {
            phxData.value = res.data;
            loading1.value = false;
            
        })
        //存款营销奖励
        getDepositOrLoan(workDate.value,'deposit').then(res => {
            depositData.value = res.data;
            loading2.value = false;
        })
        //贷款指标绩效
        getLoanZjx(workDate.value).then(res => {
            loanData.value = res.data;
            loading3.value = false;
        });
         //贷款营销奖励
        //  getDepositOrLoan(workDate.value,'loan').then(res => {
        //     loanData.value = res.data;
        //     loading3.value = false;
        // })
        //客户经理营销达人
        // getMarketAssessScore(workDate.value).then(res => {
        //     marketData.value = res.data;
        //     loading4.value = false;
        // })
        
    }
   
    return { dateBlurEvent, getAssess, handleExport, expandEvent }
}
const depostCharts = ref(null);
const initChart = (workDate,assessOrg)=>{
    if(assessOrg == undefined){
        assessOrg='907000L';
    }
    getDepositPieChart(workDate,assessOrg).then(res =>{
        const depostChartsIntance = echarts.init(depostCharts.value, "macarons");
        depostChartsIntance.setOption({
        title: {
            text: '存款结构图',
            subtext: '考核口径(万元)',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        label: {
            show:true,
            position:'outside',
            formatter: '{b}:{c} ({d}%)'
        },
        series: [
            {
            name: '各项存款',
            type: 'pie',
            radius: '50%',
            data: res.data,
            emphasis: {
                itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
            }
        ]
            });
            // const depostChartsIntance2 = echarts.init(depostCharts2.value, "macarons");
            // depostChartsIntance2.setOption({
            //     title: {
            //         text: '存款结构图',
            //         subtext: '考核口径(万元)',
            //         left: 'center'
            //     },
            //     tooltip: {
            //         trigger: 'item'
            //     },
            //     legend: {
            //         orient: 'vertical',
            //         left: 'left'
            //     },
            //     label: {
            //         show:true,
            //         position:'outside',
            //         formatter: '{b}:{c} ({d}%)'
            //     },
            //     series: [
            //         {
            //         name: '各项存款',
            //         type: 'pie',
            //         radius: '50%',
            //         data: res.data,
            //         emphasis: {
            //             itemStyle: {
            //             shadowBlur: 10,
            //             shadowOffsetX: 0,
            //             shadowColor: 'rgba(0, 0, 0, 0.5)'
            //             }
            //         }
            //         }
            //     ]
            // });

         
        })
   
        // //贷款结构图表
        // getLoanPieChart(workDate,assessOrg).then(res =>{
        //     const depostChartsIntance = echarts.init(loanCharts.value, "macarons");
        //     depostChartsIntance.setOption({
        //     title: {
        //         text: '贷款收益结构图',
        //         subtext: '考核口径(万元)',
        //         left: 'center'
        //     },
        //     tooltip: {
        //         trigger: 'item'
        //     },
        //     legend: {
        //         orient: 'vertical',
        //         left: 'left'
        //     },
        //     label: {
        //         show:true,
        //         position:'outside',
        //         formatter: '{b}:{c} ({d}%)'
        //     },
        //     series: [
        //         {
        //         name: '贷款收益类型',
        //         type: 'pie',
        //         radius: '50%',
        //         data: res.data,
        //         emphasis: {
        //             itemStyle: {
        //             shadowBlur: 10,
        //             shadowOffsetX: 0,
        //             shadowColor: 'rgba(0, 0, 0, 0.5)'
        //             }
        //         }
        //         }
        //     ]
        //     });
        // })
}
//tr样式
const tableRowClassName = (obj,rowIndex)=>{
    if(obj!=undefined){    
        if((obj.row.zf*1).toFixed(2)>(obj.row.zfPh*1).toFixed(2)){
            return 'danger-row';
        }                                                    
    }
    
}

 //禁用日期
 const disabledFun = (time) => {
        let dateObj = new Date();
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 1)) || time.getTime()<new Date('2024-12-31');
    }
export default {
    components: { AssessTableTemp1, AssessTableTemp2, AssessTableTemp3, AssessTableTemp4, AssessTableTemp5 },
    mounted(){
        
        const { proxy } = getCurrentInstance();
        if(JSON.stringify(proxy.$route.query.workDate)!=undefined && JSON.stringify(proxy.$route.query.workDate) != null && JSON.stringify(proxy.$route.query.workDate)!= ''){
            workDate.value = proxy.$route.query.workDate;
        }else {
            getEtlDateDiff().then(res => {
                workDate.value = res.data;
                //initChart(workDate.value,'907000L');
            });
        }
        
    },
    setup(){
      const { proxy } = getCurrentInstance();
      if(proxy.$route.query.activeName !='' && proxy.$route.query.activeName !=undefined){
        activeName.value = proxy.$route.query.activeName;
        activeName1.value = proxy.$route.query.activeName1;
      }
      
      //数据字典
      const { sys_org_name, sys_user_name } = proxy.useDict("sys_org_name","sys_user_name");
      const { dateBlurEvent, handleExport, expandEvent } = initEffect(proxy);
      //按钮点击事件
      const jgClickEvent = (assessOrg)=>{
            initChart(workDate.value,assessOrg);
            chartHeader.value = assessOrg;
        }
      const jgClickEvent1 = (assessOrg)=>{
            initChart(workDate.value,assessOrg);
            chartHeader1.value = assessOrg;
        }
      const jgClickEvent2 = (assessOrg)=>{
            initChart(workDate.value,assessOrg);
            chartHeader2.value = assessOrg;
        }
      const jgClickEvent3 = (assessOrg)=>{
            initChart(workDate.value,assessOrg);
            chartHeader3.value = assessOrg;
        }
        
        
      return { sys_org_name, sys_user_name, workDate, dateBlurEvent, loading1, loading2, loading3, loading4,
         phxData, depostCharts, depositData, loanData, marketData, activeName, depostCharts2, baseDepostCharts, loanCharts, 
        tableRowClassName, jgClickEvent, disabledFun, chartHeader, jgClickEvent1, chartHeader1, jgClickEvent2, chartHeader2, jgClickEvent3, chartHeader3,
        handleExport,expandEvent, expand, activeName1,activeName2 }
    }
}
</script>

<style >
.tabs {
    padding: 32px;
    color: #6b778c;

}
.el-table .danger-row{
    --el-table-tr-bg-color: var(--el-color-danger-light-5);
}
.chart_header {
    margin-top: 5px;
    text-align: center;
    color: #409eff;
    overflow-wrap: break-word;
    font-size: large;
}
</style>