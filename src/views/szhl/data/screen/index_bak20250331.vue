<template>
<div class="app-container home ">
    <el-row :gutter="10">
        
        <el-col :span="24"  >
            
            <el-card>
                <template #header>
                    <div>
                        2025走千访万活动考核指标(T+2)
                        <el-date-picker v-model="workDate" placeholder="选择日期"   size="small" value-format="YYYYMMDD" :disabled-date="disabledFun" style="width:140px;margin-top:-5px" :onchange="dateBlurEvent()"></el-date-picker>
                    </div>
                </template>
                
                <div>
                    <el-tabs type="card" >
                        <el-tab-pane label="日均各项存款" >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="ckZhData" :loading="loading1" @jgClickEvent="jgClickEvent"/>
                                    <div class="chart_header"><dict-tag :options="sys_org_name" :value="chartHeader"/></div>
                                    <div  ref="depostCharts" style="margin-top:30px;width: 650px;height:350px" ></div>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="ckWdData" :loading="loading2" @jgClickEvent="jgClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="日均基础存款" >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="jcckZhData" :loading="loading3" @jgClickEvent="jgClickEvent1"/>
                                    <div class="chart_header"><dict-tag :options="sys_org_name" :value="chartHeader1"/></div>
                                    <div  ref="baseDepostCharts" style="margin-top:30px;width: 650px;height:350px"></div>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="jcckWdData" :loading="loading4" @jgClickEvent="jgClickEvent1"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="日均个人定期储蓄"  >
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="cxckZhData" :loading="loading5" @jgClickEvent="jgClickEvent2"/>
                                    <div class="chart_header"><dict-tag :options="sys_org_name" :value="chartHeader2"/></div>
                                    <div  ref="depostCharts2" style="margin-top:30px;width: 650px;height:350px"></div>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="cxckWdData" :loading="loading6" @jgClickEvent="jgClickEvent2"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="日均各项贷款"  name="3">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="dkZhData" :loading="loading7" @jgClickEvent="jgClickEvent3"/>
                                    <div class="chart_header"><dict-tag :options="sys_org_name" :value="chartHeader3"/></div>
                                    <div  ref="loanCharts" style="margin-top:30px;width: 650px;height:350px"></div>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp1 :data="dkWdData" :loading="loading8" @jgClickEvent="jgClickEvent3"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="日均小微企业贷款"  name="4">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="xwRjZhData" :loading="loading15" @jgClickEvent="xwClickEvent"/>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="xwRjWdData" :loading="loading15" @jgClickEvent="xwClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="小微企业贷款户数"  name="5">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="xwZhData" :loading="loading16" @jgClickEvent="xwClickEvent"/>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="xwWdData" :loading="loading16" @jgClickEvent="xwClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="日均个人贷款"  name="6">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="rjGrZhData" :loading="loading16" @jgClickEvent="rjGrClickEvent"/>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="rjGrWdData" :loading="loading16" @jgClickEvent="rjGrClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="个人用信户数"  name="7">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="grHsZhData" :loading="loading18" @jgClickEvent="grHsClickEvent"/>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="grHsWdData" :loading="loading18" @jgClickEvent="grHsClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="个人核心户数"  name="8">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="dsHsZhData" :loading="loading13" @jgClickEvent="dsHxClickEvent"/>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="dsHsWdData" :loading="loading13" @jgClickEvent="dsHxClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="对公核心户数"  name="9">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="dgHsZhData" :loading="loading14" @jgClickEvent="dgHxClickEvent"/>
                                </el-col>
                                <el-col :span="12">
                                    <AssessTableTemp2 :data="dgHsWdData" :loading="loading14" @jgClickEvent="dgHxClickEvent"/>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="普惠型贷款增幅" >
                            <el-table :data="phxData" row-key="assessOrg" v-loading="loading9" :row-class-name="tableRowClassName">
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
                        <el-tab-pane label="存款营销奖" >
                            <el-button type="primary" @click="handleExport('deposit')">导出</el-button>
                            <el-table :data="depositData" row-key="assessOrg" v-loading="loading10">
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
                                    <el-table-column label="低成本(10元/万元)" align="center">
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
                                    <el-table-column label="低成本(2元/万元)" align="center">
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
                        <el-tab-pane label="贷款营销奖" >
                            <el-button type="primary" @click="expandEvent()">展开/折叠</el-button>
                            <el-table :data="loanData" row-key="assessOrg" v-loading="loading11" :default-expand-all="expand">
                                <el-table-column label="机构" prop="assessName"  align="center" width="160"/>
                                <el-table-column label="非机构类贷款" align="center">
                                    <el-table-column label="高收益(12元/万元)" align="center">
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
                                    <el-table-column label="中收益(10元/万元)" align="center">
                                        <el-table-column label="报告期" prop="f_mid_bgq" align="center">
                                            <template #default="scope">
                                                {{ parseFloat(scope.row.f_mid_bgq).toLocaleString() }}
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="增量" prop="f_mid_zl" align="center">
                                            <template #default="scope">
                                                {{ parseFloat(scope.row.f_mid_zl).toLocaleString() }}
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="应发奖金" prop="f_mid_jj" align="center">
                                            <template #default="scope">
                                                {{ parseFloat(scope.row.f_mid_jj).toLocaleString() }}
                                            </template>
                                        </el-table-column>
                                    </el-table-column>
                                    <el-table-column label="低收益(8元/万元)" align="center">
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
                                <el-table-column label="机构类贷款" align="center">
                                    <el-table-column label="不区分收益(2元/万元)" align="center">
                                        <el-table-column label="报告期" prop="j_high_bgq" align="center">
                                            <template #default="scope">
                                                <span v-if="scope.row.j_high_bgq!='' && scope.row.j_high_bgq!=null">{{ parseFloat(scope.row.j_high_bgq).toLocaleString() }}</span>
                                                <span v-else>-</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="增量" prop="j_high_zl" align="center">
                                            <template #default="scope" >
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
                                </el-table-column>
                                <el-table-column label="总应发奖金" prop="zjj" align="center">
                                    <template #default="scope">
                                        <span v-if="scope.row.zjj!='' && scope.row.zjj!=null">{{ parseFloat(scope.row.zjj).toLocaleString() }}</span>
                                        <span v-else>-</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="客户经理营销达人" >
                            <el-table :data="marketData" v-loading="loading12" height="780" stripe size="small">
                                <el-table-column label="网点" width="100" prop="assessOrg" align="center" fixed>
                                    <template #default="scope">
                                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                                    </template>
                                </el-table-column>
                                <el-table-column label="柜员号" prop="managerId" align="center" fixed>
                                    <template #default="scope">
                                        <dict-tag :options="sys_user_name" :value="scope.row.managerId"/>
                                    </template>
                                </el-table-column>
                                <el-table-column label="贷款日均新增(万元)" align="center">
                                    <el-table-column label="基期" prop="loanJq" align="center">
                                        <template #default="scope">
                                            <span v-if="scope.row.loanJq!='' && scope.row.loanJq!=null">{{ parseFloat(scope.row.loanJq).toLocaleString() }}</span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="报告期" prop="loanBgq" align="center">
                                        <template #default="scope">
                                            <span v-if="scope.row.loanBgq!='' && scope.row.loanBgq!=null">{{ parseFloat(scope.row.loanBgq).toLocaleString() }}</span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="增量" prop="loanZl" align="center">
                                        <template #default="scope">
                                            <span v-if="scope.row.loanZl!='' && scope.row.loanZl!=null">{{ parseFloat(scope.row.loanZl).toLocaleString() }}</span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="得分" prop="loanDf" align="center">
                                        <template #default="scope">
                                            {{(scope.row.loanDf*1).toFixed(2)}}
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="派生存款新增(万元)" align="center">
                                    <el-table-column label="基期" prop="depositJq" align="center">
                                        <template #default="scope">
                                            <span v-if="scope.row.depositJq!='' && scope.row.depositJq!=null">{{ parseFloat(scope.row.depositJq).toLocaleString() }}</span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="报告期" prop="depositBgq" align="center">
                                        <template #default="scope">
                                            <span v-if="scope.row.depositBgq!='' && scope.row.depositBgq!=null">{{ parseFloat(scope.row.depositBgq).toLocaleString() }}</span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="增量" prop="depositZl" align="center">
                                        <template #default="scope">
                                            <span v-if="scope.row.depositZl!='' && scope.row.depositZl!=null">{{ parseFloat(scope.row.depositZl).toLocaleString() }}</span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="得分" prop="depositDf" align="center">
                                        <template #default="scope">
                                            {{(scope.row.depositDf*1).toFixed(2)}}
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="小微企业新增(户)" align="center">
                                    <el-table-column label="基期" prop="xwJq" align="center"></el-table-column>
                                    <el-table-column label="报告期" prop="xwBgq" align="center"></el-table-column>
                                    <el-table-column label="增量" prop="xwZl" align="center"></el-table-column>
                                    <el-table-column label="得分" prop="xwDf" align="center">
                                        <template #default="scope">
                                            {{(scope.row.xwDf*1).toFixed(2)}}
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="个人贷款新增(户)" align="center" >
                                    <el-table-column label="基期" prop="personLoanJq" align="center"></el-table-column>
                                    <el-table-column label="报告期" prop="personLoanBgq" align="center"></el-table-column>
                                    <el-table-column label="增量" prop="personLoanZl" align="center"></el-table-column>
                                    <el-table-column label="得分" prop="personLoanDf" align="center">
                                        <template #default="scope">
                                            {{(scope.row.personLoanDf*1).toFixed(2)}}
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="贷款核心户数新增(户)" align="center">
                                    <el-table-column label="基期" prop="coreHsJq" align="center"></el-table-column>
                                    <el-table-column label="报告期" prop="coreHsBgq" align="center"></el-table-column>
                                    <el-table-column label="增量" prop="coreHsZl" align="center"></el-table-column>
                                    <el-table-column label="得分" prop="coreHsDf" align="center">
                                        <template #default="scope">
                                            {{(scope.row.coreHsDf*1).toFixed(2)}}
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="总得分" prop="zdf" align="center" fixed="right">
                                    <template #default="scope">
                                            {{(scope.row.zdf*1).toFixed(2)}}
                                        </template>
                                </el-table-column>
                                <el-table-column label="排名" align="center" fixed="right">
                                    <template #default="scope">
                                        {{scope.$index+1}}
                                    </template>
                                </el-table-column>
                            </el-table>
                            
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
import { selectAssessByCode, selectAssessByCodeWd } from "@/api/szhl/agency/assess";
import { getEtlDateDiff } from "@/api/szhl/agency/sumDepositAndLoan";
import { getLoanGrowRate } from "@/api/szhl/agency/OrgTempOne";
import { getDepositOrLoan } from "@/api/szhl/agency/OrgTempTwo";
import { getMarketAssessScore } from "@/api/szhl/jxkh/performance";
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
const activeName = ref();
const workDate = ref();
const marketData = ref();
const phxData = ref([]);
const depositData = ref([]);
const loanData = ref([]);
const ckZhData = ref([]);
const ckWdData = ref([]);
const jcckZhData = ref([]);
const jcckWdData = ref([]);
const cxckZhData = ref([]);
const cxckWdData = ref([]);
const dkZhData = ref([]);
const dkWdData = ref([]);
const dsHsZhData = ref([]);
const dsHsWdData = ref([]);
const dgHsZhData = ref([]);
const dgHsWdData = ref([]);
const xwRjZhData = ref([]);
const xwRjWdData = ref([]);
const xwZhData = ref([]);
const xwWdData = ref([]);
const rjGrZhData = ref([]);
const rjGrWdData = ref([]);
const grHsZhData = ref([]);
const grHsWdData = ref([]);
const loading1 =ref(false);
const loading2 =ref(false);
const loading3 =ref(false);
const loading4 =ref(false);
const loading5 =ref(false);
const loading6 =ref(false);
const loading7 =ref(false);
const loading8 =ref(false);
const loading9 =ref(false);
const loading10 =ref(false);
const loading11 =ref(false);
const loading12 =ref(false);
const loading13 =ref(false);
const loading14 =ref(false);
const loading15 =ref(false);
const loading16 =ref(false);
const loading17 =ref(false);
const loading18 =ref(false);
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
        loading5.value = true;
        loading6.value = true;
        loading7.value = true;
        loading8.value = true;
        loading9.value = true;
        loading10.value = true;
        loading11.value = true;
        loading12.value = true;
        loading13.value =true;
        loading14.value =true;
        loading15.value =true;
        loading16.value =true;
        loading17.value =true;
        loading18.value =true;
        //支行
        selectAssessByCode("日均各项存款增量",workDate.value).then(res => {
            ckZhData.value = res.data;
            loading1.value = false;
        })
        //网点
        selectAssessByCodeWd("日均各项存款增量",workDate.value).then(res => {
            ckWdData.value = res.data;
            loading2.value = false;
        })
         //支行
         selectAssessByCode("日均基础存款增量",workDate.value).then(res => {
            jcckZhData.value = res.data;
            loading3.value = false;
        })
        //网点
        selectAssessByCodeWd("日均基础存款增量",workDate.value).then(res => {
            jcckWdData.value = res.data;
            loading4.value = false;
        })
        //支行
        selectAssessByCode("日均定期储蓄存款增量",workDate.value).then(res => {
            cxckZhData.value = res.data;
            loading5.value = false;
        })
        //网点
        selectAssessByCodeWd("日均定期储蓄存款增量",workDate.value).then(res => {
            cxckWdData.value = res.data;
            loading6.value = false;
        })
        //支行
        selectAssessByCode("日均各项贷款增量",workDate.value).then(res => {
            dkZhData.value = res.data;
            loading7.value = false;
        })
        //网点
        selectAssessByCodeWd("日均各项贷款增量",workDate.value).then(res => {
            dkWdData.value = res.data;
            loading8.value = false;
        })
        //支行
        selectAssessByCode("个人核心户数",workDate.value).then(res => {
            dsHsZhData.value = res.data;
            loading13.value = false;
        })
        //网点
        selectAssessByCodeWd("个人核心户数",workDate.value).then(res => {
            dsHsWdData.value = res.data;
            loading13.value = false;
        })
        //支行
        selectAssessByCode("对公核心户数",workDate.value).then(res => {
            dgHsZhData.value = res.data;
            loading14.value = false;
        })
        //网点
        selectAssessByCodeWd("对公核心户数",workDate.value).then(res => {
            dgHsWdData.value = res.data;
            loading14.value = false;
        })
        //支行
        selectAssessByCode("小微企业日均",workDate.value).then(res => {
            xwRjZhData.value = res.data;
            loading15.value = false;
        })
        //网点
        selectAssessByCodeWd("小微企业日均",workDate.value).then(res => {
            xwRjWdData.value = res.data;
            loading15.value = false;
        })
        //支行
        selectAssessByCode("小微企业户数",workDate.value).then(res => {
            xwZhData.value = res.data;
            loading16.value = false;
        })
        //网点
        selectAssessByCodeWd("小微企业户数",workDate.value).then(res => {
            xwWdData.value = res.data;
            loading16.value = false;
        })
        //支行
        selectAssessByCode("日均个人贷款",workDate.value).then(res => {
            rjGrZhData.value = res.data;
            loading17.value = false;
        })
        //网点
        selectAssessByCodeWd("日均个人贷款",workDate.value).then(res => {
            rjGrWdData.value = res.data;
            loading17.value = false;
        })
         //支行
         selectAssessByCode("个人用信户数",workDate.value).then(res => {
            grHsZhData.value = res.data;
            loading18.value = false;
        })
        //网点
        selectAssessByCodeWd("个人用信户数",workDate.value).then(res => {
            grHsWdData.value = res.data;
            loading18.value = false;
        })
        //普惠型贷款增幅
        getLoanGrowRate(workDate.value).then(res => {
            phxData.value = res.data;
            loading9.value = false;
            
        })
        //存款营销奖励
        getDepositOrLoan(workDate.value,'deposit').then(res => {
            depositData.value = res.data;
            loading10.value = false;
        })
         //贷款营销奖励
         getDepositOrLoan(workDate.value,'loan').then(res => {
            loanData.value = res.data;
            loading11.value = false;
        })
        //客户经理营销达人
        getMarketAssessScore(workDate.value).then(res => {
            marketData.value = res.data;
            loading12.value = false;
        })
        
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
            const depostChartsIntance2 = echarts.init(depostCharts2.value, "macarons");
            depostChartsIntance2.setOption({
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

         
        })
      
        //基础存款图表
        getBaseDepositPieChart(workDate,assessOrg).then(res =>{
            const depostChartsIntance = echarts.init(baseDepostCharts.value, "macarons");
            depostChartsIntance.setOption({
            title: {
                text: '存款成本结构图',
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
                name: '存款成本类型',
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
        })
        //贷款结构图表
        getLoanPieChart(workDate,assessOrg).then(res =>{
            const depostChartsIntance = echarts.init(loanCharts.value, "macarons");
            depostChartsIntance.setOption({
            title: {
                text: '贷款收益结构图',
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
                name: '贷款收益类型',
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
        })
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
    components: { AssessTableTemp1, AssessTableTemp2 },
    mounted(){
        getEtlDateDiff().then(res => {
            workDate.value = res.data;
            //initChart(workDate.value,'907000L');
        });
        
    },
    setup(){
      const { proxy } = getCurrentInstance();
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
        const xwClickEvent = ()=>{
            proxy.$router.push({path: "/szhl/report/agency/",query: {url: "http://154.126.31.204:8059/WebReport/decision/view/report?viewlet=szhl/jxkh/机构考核/小微企业贷款户明细.cpt"}});
        }
        const dgHxClickEvent = ()=>{
            proxy.$router.push({path: "/szhl/report/agency/",query: {url: "http://154.126.31.204:8059/WebReport/decision/view/report?viewlet=szhl/jxkh/机构考核/核心对公客户统计.cpt"}});
        }
        const dsHxClickEvent = ()=>{
            proxy.$router.push({path: "/szhl/report/agency/",query: {url: "http://154.126.31.204:8059/WebReport/decision/view/report?viewlet=szhl/jxkh/机构考核/核心对私客户明细.cpt"}});
        }
        const rjGrClickEvent = ()=>{
            proxy.$modal.alert("该指标直取省行结果，无明细数据！省行数据结果可通过：统一门户->普惠金融->数据自助分析->数据报表->个人用信、个人(资产)核心客户统计报表查看!");
        }
        const grHsClickEvent = ()=>{
            proxy.$router.push({path: "/szhl/report/agency/",query: {url: "http://154.126.31.204:8059/WebReport/decision/view/report?viewlet=szhl/jxkh/机构考核/个人贷款明细.cpt"}});
        }
        
      return { sys_org_name, sys_user_name, workDate, dateBlurEvent, ckWdData, ckZhData, jcckZhData, jcckWdData, cxckZhData, cxckWdData, dkZhData, dkWdData, loading1, loading2, loading3, loading4, loading5, loading6
        , loading7, loading8, loading9, loading10, loading11, loading12, phxData, depostCharts, depositData, loanData, marketData, activeName, depostCharts2, baseDepostCharts, loanCharts, 
        tableRowClassName, jgClickEvent, disabledFun, chartHeader, jgClickEvent1, chartHeader1, jgClickEvent2, chartHeader2, jgClickEvent3, chartHeader3,dsHsZhData,dsHsWdData,loading13,
        dgHsZhData,dgHsWdData,loading14,xwRjZhData,xwRjWdData,loading15,xwZhData,xwWdData,loading16,rjGrZhData,rjGrWdData,loading17,grHsZhData,grHsWdData,loading18,
        xwClickEvent,dgHxClickEvent,dsHxClickEvent,rjGrClickEvent,grHsClickEvent, handleExport,expandEvent, expand }
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