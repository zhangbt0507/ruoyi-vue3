<!-- eslint-disable vue/require-v-for-key -->
<!--
 * @Author: kai.chen
 * @Date: 2024-05-29 15:01:34
 * @LastEditors: kai.chen
 * @Description: 企业征信解析详情
-->
<template>
    <div class="my-container">
        <el-button
        class="backbtn"
        size="small"
        @click="close"
        >返回</el-button>
        <el-button
        icon="download"
        type="primary"
        plain
        size="small"
        class="download"
        @click="donwloadReport"
        >PDF下载</el-button>
        <div
        ref="report"
        v-loading="false"
        class="report"
        element-loading-text="拼命加载中"
        >
        <h1 align="center" style="font-size: 25px;">对公客户内部调查分析报告</h1>
        <span class="text-right">单位: 万元</span>
        <div class="report-header">
            <span>报告编号: {{ baseInfo.rptNo }}</span>
            <span>报告查询时间: {{ baseInfo.rptTime }}</span>
        </div>
        <!--基本信息 -->
        <div class="report-body">
            <div  class="report-body-item-title" style="margin-top: -15px;">基本信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td class="tdFont">客户名称</td><td>{{baseInfo.name}}</td>
                        <td class="tdFont">统一社会信用代码</td><td>{{baseInfo.unSccode}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">法定代表人</td><td>{{baseInfo.legalName}}</td>
                        <td class="tdFont">身份证号</td><td>{{baseInfo.idNo}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">所属行业</td><td>{{baseInfo.industry}}</td>
                        <td class="tdFont">中征号</td><td>{{baseInfo.lnCard}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">成立年份</td><td>{{baseInfo.estateYear}}</td>
                        <td class="tdFont">经营地址</td><td>{{baseInfo.workAddr}}</td>
                    </tr>
                </tbody>
            </table>
    
            <div  class="report-body-item-title">主要股东</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td class="tdFont">出资方</td>
                        <td class="tdFont">证件类型</td>
                        <td class="tdFont">证件号</td>
                        <td class="tdFont">占比</td>
                    </tr>
                    <tr v-for="(shareItem, shareIndex) in baseInfo.sharerInfos">
                        <td>{{shareItem.name}}</td>
                        <td>{{shareItem.idType}}</td>
                        <td>{{shareItem.idNo}}</td>
                        <td>{{shareItem.capRadio}}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- 重点关注信息 -->
            <div  class="report-body-item-title">重点关注信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td>首贷年份</td>
                        <td>交易机构数</td>
                        <td>未结清机构数</td>
                        <td>非信贷交易账户数</td>
                        <td>欠税记录数</td>
                        <td>民事判决记录数</td>
                        <td>强制执行记录数</td>
                        <td>行政处罚记录数</td>
                    </tr>
                    <tr>
                        <td>{{ focusInfo.firstLnYear == "" ? "-" : focusInfo.firstLnYear }}</td>
                        <td>{{focusInfo.lnNum == 0 ? "-" : focusInfo.lnNum}}</td>
                        <td>{{focusInfo.unsetLnNum == 0 ? "-" : focusInfo.unsetLnNum}}</td>
                        <td>{{ focusInfo.unCdAcctNum == 0 ? "-" : focusInfo.unCdAcctNum }}</td>
                        <td :style="{color: (focusInfo.owTaxNum == 0 ? 'black' : 'red')}">{{focusInfo.owTaxNum == 0 ? "-" : focusInfo.owTaxNum}}</td>
                        <td :style="{color: (focusInfo.judgeNum == 0 ? 'black' : 'red')}">{{focusInfo.judgeNum  == 0 ? "-" : focusInfo.judgeNum}}</td>
                        <td :style="{color: (focusInfo.enforceNum == 0 ? 'black' : 'red')}">{{focusInfo.enforceNum == 0 ? "-" : focusInfo.enforceNum}}</td>
                        <td :style="{color: (focusInfo.adminPunishNum == 0 ? 'black' : 'red')}">{{focusInfo.adminPunishNum == 0 ? "-" : focusInfo.adminPunishNum}}</td>
                    </tr>
                </tbody>
            </table>
            <!-- 重点关注信息 -- 责任类型 -->
            <table class="report-body-item-table" >
                <tbody>
                    <tr>
                        <td rowspan="2">责任类型</td><td colspan="5" >其他借贷交易</td><td  colspan="3">被追偿业务</td>
                    </tr>
                    <tr>
                        <td>还款责任金额</td><td>账户数</td><td>余额</td> <td>关注类余额</td><td>不良类余额</td><td>还款责任余额</td> <td>账户数</td><td>余额</td>
                    </tr>
                    <tr v-for="(relrepayOutlineInfo, shareIndex) in relrepayOutlineInfos">
                        <td>{{relrepayOutlineInfo.dutyType}}</td><td>{{relrepayOutlineInfo.otcdAmt}}</td><td>{{ relrepayOutlineInfo.otcdAcctNum }}</td><td>{{ relrepayOutlineInfo.otcdBal }}</td> 
                        <td>{{relrepayOutlineInfo.otcdAttBal}}</td><td :style="{color: (relrepayOutlineInfo.otcdBadBal == 0 ? 'black' : 'red')}">{{relrepayOutlineInfo.otcdBadBal}}</td>
                        <td :style="{color: (relrepayOutlineInfo.recoverDutyAmt == 0 ? 'black' : 'red')}">{{relrepayOutlineInfo.recoverDutyAmt}}</td>
                        <td :style="{color: (relrepayOutlineInfo.recoverAcctNum == 0 ? 'black' : 'red')}">{{relrepayOutlineInfo.recoverAcctNum}}</td>
                        <td :style="{color: (relrepayOutlineInfo.recoverBal == 0 ? 'black' : 'red')}">{{relrepayOutlineInfo.recoverBal}}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- 重点关注信息 -- 债务信息 -->
            <table class="report-body-item-table" >
                <tbody>
                    <tr>
                        <td colspan="3">由资产管理公司处置的债务</td><td colspan="3" >垫款</td><td  colspan="3">逾期</td>
                    </tr>
                    <tr>
                        <td>账户数</td><td>余额</td> <td>最近一次处置日期</td><td>账户数</td><td>余额</td> <td>最近一次还款日期</td><td>本金</td><td>利息及其他</td> <td>总额</td>
                    </tr>
                    <tr>
                        <td :style="{color: (unsetDeptOutlineInfo.deptAcctNum == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.deptAcctNum }}</td>
                        <td :style="{color: (unsetDeptOutlineInfo.deptBal == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.deptBal }}</td> <td>{{ unsetDeptOutlineInfo.deptLastDt }}</td>
                        <td :style="{color: (unsetDeptOutlineInfo.advanceNum == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.advanceNum }}</td>
                        <td :style="{color: (unsetDeptOutlineInfo.advanceBal == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.advanceBal }}</td> <td>{{ unsetDeptOutlineInfo.advanceLastDt }}</td>
                        <td :style="{color: (unsetDeptOutlineInfo.dueRpin == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.dueRpin }}</td>
                        <td :style="{color: (unsetDeptOutlineInfo.dueInt == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.dueInt }}</td>
                        <td :style="{color: (unsetDeptOutlineInfo.dueTotal == 0 ? 'black' : 'red')}">{{ unsetDeptOutlineInfo.dueTotal }}</td>
                    </tr>
                </tbody>
            </table>
    
                <!-- 未结清负债汇总 -->
            <div  class="report-body-item-title">未结清负债汇总</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td rowspan="2">类别</td><td colspan="2">正常类</td><td colspan="2">关注类</td><td colspan="2">不良类</td><td colspan="2">合计</td>
                    </tr>
                    <tr>
                        <td>账户数</td><td>余额</td> <td>账户数</td><td>余额</td> <td>账户数</td><td>余额</td> <td>账户数</td><td>余额</td>
                    </tr>
                    <tr v-for="(unsetBizOutlineInfo, index) in unsetBizOutlineInfos">
                        <td>{{unsetBizOutlineInfo.bizType == 0 ? "-" : unsetBizOutlineInfo.bizType}}</td><td>{{unsetBizOutlineInfo.normalAcctNum == 0 ? "-" : unsetBizOutlineInfo.normalAcctNum}}</td>
                        <td>{{unsetBizOutlineInfo.normalBal == 0 ? "-" : unsetBizOutlineInfo.normalBal}}</td> <td>{{unsetBizOutlineInfo.attAcctNum == 0 ? "-" : unsetBizOutlineInfo.attAcctNum}}</td>
                        <td>{{unsetBizOutlineInfo.attBal == 0 ? "-" : unsetBizOutlineInfo.attBal}}</td> <td>{{unsetBizOutlineInfo.badAcctNum == 0 ? "-" : unsetBizOutlineInfo.badAcctNum}}</td>
                        <td>{{unsetBizOutlineInfo.badBal == 0 ? "-" : unsetBizOutlineInfo.badBal}}</td> 
                        <td>{{unsetBizOutlineInfo.totalAcctNum}}</td><td>{{unsetBizOutlineInfo.totalBal}}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- 未结清负债明细表 -->
            <div  class="report-body-item-title" style="border-bottom: 1.6px solid #000;">未结清负债明细表</div>
            <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">贷款</label> <div class = "report-body-lable">
                <label>机构：</label><label>{{ outStandOrg }}</label><label>  个， </label>
                <label>借款余额：</label><label>{{outStandBal == null ? '-' : outStandBal}}</label><label>  万元</label>
            </div></div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td>授信机构</td><td>业务种类</td><td>借款日期</td><td>到期日期</td><td>借款金额</td><td>担保</td><td>借款余额</td><td>五级</td>
                        <td>应还额(元)</td><td>逾期总额</td><td>还款</td><td>信息日期</td><td>利率测算</td>
                    </tr>
                    <tr v-for="(comBcrLoandetaiInfo,index) in comBcrLoandetaiInfos" :style="{color: (((comBcrLoandetaiInfo.cla5 == '正常' || comBcrLoandetaiInfo.cla5 == '关注') &&  comBcrLoandetaiInfo.dueAmt == '0')? 'black' : 'red')}">
                        <td style="color:blue"><a @click="openDialog(comBcrLoandetaiInfo.authOrg,comBcrLoandetaiInfo.orgName)">
                            {{(comBcrLoandetaiInfo.orgName == null || comBcrLoandetaiInfo.orgName == '')  ? comBcrLoandetaiInfo.authOrg : comBcrLoandetaiInfo.authOrg+"/"+comBcrLoandetaiInfo.orgName}}</a>
                        </td>
                        <td>{{comBcrLoandetaiInfo.bizType}}</td><td>{{comBcrLoandetaiInfo.startDt}}</td><td>{{comBcrLoandetaiInfo.endDt}}</td>
                        <td>{{comBcrLoandetaiInfo.lnAmt}}</td><td>{{comBcrLoandetaiInfo.granMethod}}</td><td>{{comBcrLoandetaiInfo.bal}}</td><td>{{comBcrLoandetaiInfo.cla5}}</td>
                        <td>{{comBcrLoandetaiInfo.lastRepayAmt}}</td><td>{{comBcrLoandetaiInfo.dueAmt}}</td><td>{{comBcrLoandetaiInfo.lastRepayedMethod}}</td>
                        <td>{{comBcrLoandetaiInfo.rptDt}}</td><td>{{comBcrLoandetaiInfo.rate}}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- 循环透支 -->
            <!-- <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">循环透支记录</label> <div class = "report-body-lable">
                <label>机构：</label><label>{{ drawAcctNum }}</label><label>  个， </label>
                <label>借款余额：</label><label>{{drawTransBal == null ? '-' : drawTransBal}}</label><label>  万元</label>
            </div></div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td>授信机构</td><td>业务种类</td><td>借款日期</td><td>到期日期</td><td>信用额度</td><td>担保</td><td>借款余额</td><td>五级</td>
                        <td>应还额</td><td>逾期总额</td><td>还款</td><td>信息日期</td>
                    </tr>
                    <tr v-for="(comBcrCircleOverdrawInfo,index) in comBcrCircleOverdraws" :style="{color: (((comBcrCircleOverdrawInfo.cla5 == '正常' || comBcrCircleOverdrawInfo.cla5 == '关注') &&  comBcrCircleOverdrawInfo.dueAmt == '0')? 'black' : 'red')}">
                        <td style="color:blue"><a @click="openDialog(comBcrCircleOverdrawInfo.authOrg,comBcrCircleOverdrawInfo.orgName)">
                            {{(comBcrCircleOverdrawInfo.orgName == null || comBcrCircleOverdrawInfo.orgName == '')  ? comBcrCircleOverdrawInfo.authOrg : comBcrCircleOverdrawInfo.authOrg+"/"+comBcrCircleOverdrawInfo.orgName}}</a>
                        </td>
                        <td>{{comBcrCircleOverdrawInfo.bizType}}</td><td>{{comBcrCircleOverdrawInfo.startDt}}</td><td>{{comBcrCircleOverdrawInfo.endDt}}</td>
                        <td>{{comBcrCircleOverdrawInfo.creditAmt}}</td><td>{{comBcrCircleOverdrawInfo.granMethod}}</td><td>{{comBcrCircleOverdrawInfo.bal}}</td><td>{{comBcrCircleOverdrawInfo.cla5}}</td>
                        <td>{{comBcrCircleOverdrawInfo.lastRpAmt}}</td><td>{{comBcrCircleOverdrawInfo.dueAmt}}</td><td>{{comBcrCircleOverdrawInfo.lastRpMethod}}</td>
                        <td>{{comBcrCircleOverdrawInfo.rptDt}}</td>
                    </tr>
                </tbody>
            </table> -->
    
            <!-- 未结清负债明细表 --贴现 -->
            <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">贴现</label> <div class = "report-body-lable">
                <label>账户：</label><label>{{ acctNum }}</label><label>  个， </label>
                <label>总额：</label><label>{{transBal == null ? '-' : transBal}}</label><label>  万元</label>
            </div></div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td>授信机构</td><td>业务种类</td><td>五级分类</td><td>账户数</td><td>余额</td><td>逾期总额</td><td>逾期本金</td>
                    </tr>
                    <tr v-for="(comBcrDisdetail,index) in comBcrDisdetails" :style="{color: (((comBcrDisdetail.cla5 == '正常' || comBcrDisdetail.cla5 == '关注') &&  comBcrDisdetail.dueAmt == '0')? 'black' : 'red')}">
                        <td style="color:blue"><a @click="openDialog(comBcrDisdetail.authOrg,comBcrDisdetail.orgName)">
                            {{(comBcrDisdetail.orgName == null || comBcrDisdetail.orgName == "")? comBcrDisdetail.authOrg : comBcrDisdetail.authOrg+"/"+comBcrDisdetail.orgName}}</a>
                        </td>
                        <td>{{comBcrDisdetail.bizType}}</td><td>{{comBcrDisdetail.cla5}}</td><td>{{comBcrDisdetail.acctNum}}</td>
                        <td>{{comBcrDisdetail.bal}}</td><td>{{comBcrDisdetail.dueAmt}}</td><td>{{comBcrDisdetail.duePrin}}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- 未结清负债明细表 --银行承兑汇票和信用证 -->
            <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">银行承兑汇票和信用证</label> <div class = "report-body-lable">
                <label>共：</label><label>{{ billAcctNum }}</label><label>  笔， </label>
                <label>总额：</label><label>{{billTransBal == null ? '-' : billTransBal}}</label><label>  万元</label>
            </div></div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td rowspan="3">授信机构</td><td rowspan="3">业务种类</td><td rowspan="3">五级分类</td><td rowspan="3">账户数</td><td rowspan="3">加权保证金比例</td>
                    </tr>
                    <tr>
                        <td colspan="4">到期日（余额）</td><td rowspan="2">合计（余额）</td>
                    </tr>
                    <tr>
                        <td>≤30</td><td>≤60</td><td>≤90</td><td>>90</td>
                    </tr>
                    <tr v-for="(comBcrBilldetailInfo,index) in comBcrBilldetailInfos" :style="{color: ((comBcrBilldetailInfo.cla5 == '正常' || comBcrBilldetailInfo.cla5 == '关注')? 'black' : 'red')}">
                        <td style="color:blue"><a @click="openDialog(comBcrBilldetailInfo.authOrg,comBcrBilldetailInfo.orgName)">
                            {{(comBcrBilldetailInfo.orgName == null || comBcrBilldetailInfo.orgName == "")? comBcrBilldetailInfo.authOrg : comBcrBilldetailInfo.authOrg+"/"+comBcrBilldetailInfo.orgName}}</a>
                        </td>
                        <td>{{comBcrBilldetailInfo.bizType}}</td><td>{{comBcrBilldetailInfo.cla5}}</td><td>{{comBcrBilldetailInfo.acctNum}}</td>
                        <td>{{comBcrBilldetailInfo.weightRate}}</td><td>{{comBcrBilldetailInfo.balL30day}}</td><td>{{comBcrBilldetailInfo.balL60day}}</td><td>{{comBcrBilldetailInfo.balL90day}}</td>
                        <td>{{comBcrBilldetailInfo.balG60day}}</td><td>{{comBcrBilldetailInfo.bal}}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- 相关还款责任明细 -->
            <div  class="report-body-item-title" style="border-bottom: 1.6px solid #000;"> 相关还款责任明细</div>
            <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">明细</label> <div class = "report-body-lable">
                <label>机构：</label><label>{{ relRepayOrg }}</label><label>  个， </label>
                <label>责任余额：</label><label>{{relRepayBal == null ? '-' : relRepayBal}}</label><label>  万元</label>
            </div></div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td>机构</td><td>责任类型</td><td>责任余额</td><td>逾期总额</td><td>开始日期</td><td>到期日期</td><td>五级</td>
                        <td>业务种类</td><td>信息日期</td><td>被担保人名称</td>
                    </tr>
                    <tr v-for="(comBcrRelrepayDetail,index) in comBcrRelrepayDetails" :style="{color: ((comBcrRelrepayDetail.fiveAdjust == '正常' || comBcrRelrepayDetail.fiveAdjust == '关注' )? 'black' : 'red')}">
                        <td style="color:blue"><a @click="openDialog(comBcrRelrepayDetail.authOrg,comBcrRelrepayDetail.orgName)">
                            {{(comBcrRelrepayDetail.orgName == null || comBcrRelrepayDetail.orgName == "")? comBcrRelrepayDetail.authOrg : comBcrRelrepayDetail.authOrg+"/"+comBcrRelrepayDetail.orgName}}</a>
                        </td>
                        <td>{{comBcrRelrepayDetail.dutyType}}</td><td>{{comBcrRelrepayDetail.bal}}</td><td>{{comBcrRelrepayDetail.dueAmt}}</td>
                        <td>{{comBcrRelrepayDetail.startDt}}</td><td>{{comBcrRelrepayDetail.endDt}}</td><td>{{comBcrRelrepayDetail.fiveAdjust}}</td>
                        <td>{{comBcrRelrepayDetail.busType}}</td><td>{{comBcrRelrepayDetail.rptDt}}</td>
                        <td style="color:blue">
                            <a @click="openVoucherDialog(comBcrRelrepayDetail.acctNo,comBcrRelrepayDetail.voucherName)">{{((comBcrRelrepayDetail.voucherName == null || comBcrRelrepayDetail.voucherName == "") && comBcrRelrepayDetail.dutyType != null )
                            ? "补录或更改信息" : comBcrRelrepayDetail.voucherName }}</a></td>
                    </tr>
                </tbody>
            </table>
    
            <!-- 负债历史 -->
            <div  class="report-body-item-title" style="border-bottom: 1.6px solid #000;"> 历史负债 </div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td rowspan="2">年月</td><td colspan="2">全部负债</td><td colspan="2">关注类负债</td><td colspan="2">不良类负债</td><td colspan="4">逾期类负债</td>
                    </tr>
                    <tr>
                        <td>账户数</td><td>余额</td><td>账户数</td><td>余额</td><td>账户数</td><td>余额</td><td>逾期类账户数</td><td>逾期总额</td><td>本金逾期账户数</td><td>逾期本金</td>
                    </tr>
                    <tr v-for="(comBcrDeptHis,index) in comBcrDeptHiss">
                        <td>{{comBcrDeptHis.rptDate}}</td><td>{{comBcrDeptHis.deptAcctNum}}</td><td>{{comBcrDeptHis.deptBal}}</td><td>{{comBcrDeptHis.attAcctNum}}</td>
                        <td>{{comBcrDeptHis.attBal}}</td>
                        <td :style="{color: (comBcrDeptHis.badAcctNum == 0 ? 'black' : 'red')}">{{comBcrDeptHis.badAcctNum}}</td>
                        <td :style="{color: (comBcrDeptHis.badBal == 0 ? 'black' : 'red')}">{{comBcrDeptHis.badBal}}</td>
                        <td :style="{color: (comBcrDeptHis.dueAcctNum == 0 ? 'black' : 'red')}">{{comBcrDeptHis.dueAcctNum}}</td>
                        <td :style="{color: (comBcrDeptHis.dueAmt == 0 ? 'black' : 'red')}">{{comBcrDeptHis.dueAmt}}</td>
                        <td :style="{color: (comBcrDeptHis.duePrinAcctNum == 0 ? 'black' : 'red')}">{{comBcrDeptHis.duePrinAcctNum}}</td>
                        <td :style="{color: (comBcrDeptHis.duePrin == 0 ? 'black' : 'red')}">{{comBcrDeptHis.duePrin}}</td>
                    </tr>
                </tbody>
            </table>
    
            <table class="report-body-item-table" style="background:#fff">
                <div id="myChart" class="report-body-canav" v-show="showMychart" :style="{ width: chartWidth + 'px' }">
                </div>
            </table>
            
    
            <!-- 负债历史 -->
            <div v-show="this.civilJudgementInfos.length != 0 || this.comBcrEnforceRecords.length != 0 || this.comBcrPenaltyRecords.length != 0">
                <div  class="report-body-item-title" style="border-bottom: 1.6px solid #000;"> 公共记录明细 </div>
                <div v-show="this.civilJudgementInfos != null &&  this.civilJudgementInfos.length != 0">
                    <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">民事判决记录</label></div>
                    <table class="report-body-item-table">
                        <tbody>
                            <tr>
                                <td>立案法院</td><td>立案日期</td><td>案由</td><td>诉讼地位</td><td>案号</td><td>审判程序</td><td>诉讼标的</td><td>诉讼标的金额（元）</td><td>结案方式</td><td>判决/调解生效日期</td>
                            </tr>
                            <tr v-for="(civilJudgementInfo,index) in civilJudgementInfos" style="color:red">
                                <td>{{civilJudgementInfo.court}}</td><td>{{civilJudgementInfo.regDate}}</td><td>{{civilJudgementInfo.cause}}</td><td>{{civilJudgementInfo.place}}</td>
                                <td>{{civilJudgementInfo.caseNum}}</td><td>{{civilJudgementInfo.course}}</td><td>{{civilJudgementInfo.subject}}</td><td>{{civilJudgementInfo.subAmt}}</td>
                                <td>{{civilJudgementInfo.way}}</td><td>{{civilJudgementInfo.effectiveDate}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-show="this.comBcrEnforceRecords != null &&  this.comBcrEnforceRecords.length != 0">
                    <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">强制执行记录</label></div>
                    <table class="report-body-item-table">
                        <tbody>
                            <tr>
                                <td>执行法院</td><td>立案日期</td><td>执行案由</td><td>案号</td><td>申请执行标的</td><td>申请执行标的金额（元）</td><td>案件状态</td><td>结案方式</td><td>已执行标的</td><td>已执行标的金额</td>
                            </tr>
                            <tr v-for="(comBcrEnforceRecord,index) in comBcrEnforceRecords" style="color:red">
                                <td>{{comBcrEnforceRecord.court}}</td><td>{{comBcrEnforceRecord.regDate}}</td><td>{{comBcrEnforceRecord.cause}}</td><td>{{comBcrEnforceRecord.caseNum}}</td>
                                <td>{{comBcrEnforceRecord.supSubject}}</td><td>{{comBcrEnforceRecord.supAmt}}</td><td>{{comBcrEnforceRecord.status}}</td><td>{{comBcrEnforceRecord.way}}</td>
                                <td>{{comBcrEnforceRecord.execSubject}}</td><td>{{comBcrEnforceRecord.execAmt}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-show="this.comBcrPenaltyRecords != null &&  this.comBcrPenaltyRecords.length != 0">
                    <div class="report-body-item-tab"><label style="width: 60%;margin-left: 10px;">行政处罚记录</label></div>
                    <table class="report-body-item-table">
                        <tbody>
                            <tr>
                                <td>执行法院</td><td>处罚决定书文号</td><td>违法行为</td><td>处罚日期</td><td>处罚决定</td><td>处罚金额</td><td>处罚执行情况</td><td>行政复议结果</td>
                            </tr>
                            <tr v-for="(comBcrPenaltyRecord,index) in comBcrPenaltyRecords" style="color:red">
                                <td>{{comBcrPenaltyRecord.organize}}</td><td>{{comBcrPenaltyRecord.docuNum}}</td><td>{{comBcrPenaltyRecord.behavior}}</td><td>{{comBcrPenaltyRecord.pubDate}}</td>
                                <td>{{comBcrPenaltyRecord.pubDecision}}</td><td>{{comBcrPenaltyRecord.pubAmt}}</td><td>{{comBcrPenaltyRecord.executionStatus}}</td><td>{{comBcrPenaltyRecord.reconsResult}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    
    
        <!-- 修改机构弹窗 -->
        <el-dialog title="修改机构名称" v-model="open" @close="cancel" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="140px">
                <el-form-item label="机构号" prop="authOrg" :required = 'true'>
                    <el-select v-model="form.authOrg" placeholder="请选择机构号" style="width: 300px;">
                        <el-option
                            v-for="item of this.organizeOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    
                    <!-- <el-input  placeholder="机构号" style="width: 300px;" disabled="true"/> -->
                </el-form-item>
                <el-form-item label="机构名称" prop="orgName">
                    <el-input v-model="form.orgName" placeholder="机构名称" style="width: 300px;"/>
                </el-form-item>
                <el-form-item>
                    <label style="color:red">说明：县内机构填写两字简称（如：工行，农行）,县外填写地名加简称（如：东阳工行）</label>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    
        <!-- 补录还款责任用户 -->
        <el-dialog title="补录还款责任用户" v-model="openVoucher" @close="closeVoucherDialog" width="500px" append-to-body>
            <el-form ref="voucherForm" :model="voucherForm" label-width="140px">
                <el-form-item label="被担保人名称" prop="voucherName">
                    <el-input v-model="voucherForm.voucherName" placeholder="被担保人名称" style="width: 300px;"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                <el-button type="primary" @click="submitVoucherForm">确 定</el-button>
                <el-button @click="closeVoucherDialog">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    
        <div class="report-footer">
            <span>打印日期: {{ currentDate }}</span>
            <span>打印人: {{ printer }}</span>
        </div>
        </div>
    </div>
    </template>
      
    <script>
    import html2pdf from 'html2pdf.js'
    import * as echarts from 'echarts'
    import dayjs from 'dayjs'
    import { queryAnalysBaseInfo, queryFocusInfo, queryLoanDetail, queryDisDetail, queryRePayDetail,queryCommonRecordDetail,
        editOrganizeName,editRepayUserName } from "@/api/szhl/credit/ComBrcInfo";
    import { operateLog } from "@/api/system/log";
    
    export default {
        created() {
            const route = useRoute();
            const fileNm = route.params && route.query.fileNm;
            // const fileNm = route.params && route.params.fileNm;
            // let fileNm = localStorage.getItem('fileNm');
            this.getReportdata(fileNm);
            this.fileNm = fileNm;
        },
        mounted(){
            this.initEcharts();
            this.windowResize();
            this.watchEchart();
            // window.addEventListener('resize',this.handleResize());
        },
        data() {
            return {
                currentDate: dayjs().format('YYYY-MM-DD'),
                printer: localStorage.getItem('userName'),
                //出资股东信息
                // shareHolder:[{"contributor":"pa","documentType":"营业执照","number":"3307****13","proportion":"50%"},{"contributor":"pa","documentType":"营业执照","number":"3307****13","proportion":"50%"}],
                //基础信息
                baseInfo: {},
                //{"name":"浙江***科技股份有限公司","unSccode":"917****79W","legalName":"苍老师","idNo":"3307*********14","industry":"电子元件制造","estateYear":"2018","workAddr":"浙江新渥(自主申报)","rptNo":"202406032356","rptTime":"2024-04-08"},
                //重点关注信息
                focusInfo:{},
                //{"firstLnYear":"2018","lnNum":"2","unsetLnNum":"1","unCdAcctNum":"1","owTaxNum":"1","judgeNum":"1","enforceNum":"1","adminPunishNum":"1"},
                //重点关注信息 -- 责任类型
                relrepayOutlineInfos:[],
                //[{"dutyType":"保证人/反担保人","otcdAmt":"2000","otcdAcctNum":"2","otcdBal":"2000","otcdAttBal":"1000","otcdBadBal":"1000",
                                        // "recoverDutyAmt":"2000","recoverAcctNum":"1","recoverBal":"1000"}],
                //重点关注信息 -- 债务信息
                unsetDeptOutlineInfo:{},
                //{"deptAcctNum":"1","deptBal":"100","deptLastDt":"2020-04-06","advanceNum":"1","advanceBal":"1000","advanceLastDt":"2021-06-06","dueRpin":"100","dueInt":"20","dueTotal":"120"},
                unsetBizOutlineInfos:[],
                //[{"bizType":"中长期借款","normalAcctNum":"5","normalBal":"13440","attAcctNum":"1","attBal":"100","badAcctNum":"1","badBal":"100","totalAcctNum":"1","totalBal":"100"},
                //{"bizType":"短期借款","normalAcctNum":"5","normalBal":"13440","attAcctNum":"1","attBal":"100","badAcctNum":"1","badBal":"100","totalAcctNum":"1","totalBal":"100"}],
                outStandOrg: "",
                outStandBal: "",
                comBcrLoandetaiInfos:[],
                //循环透支
                drawAcctNum: "",
                drawTransBal: "",
                comBcrCircleOverdraws:[],
    
                acctNum:"",
                transBal:"",
                //[{"authOrg":"B1911","bizType":"流贷","startDt":"2023-04-09","endDt":"2024-04-09","lnAmt":"2200","granMethod":"组合","bal":"2200","cla5":"正常","lastRepayAmt":"1759","dueAmt":"","lastRepayedMethod":"正常","rptDt":"2024-01-21","rate":"3.20%"}],
                comBcrDisdetails:[],
                //[{"authOrg":"B9402","bizType":"有追索权的银行承兑汇票贴现","cla5":"正常","acctNum":"5","bal":"1555.07","dueAmt":"","duePrin":""}],
                billAcctNum:"",
                billTransBal:"",
                comBcrBilldetailInfos:[],
                //[{"authOrg":"B1911","bizType":"银行承兑汇票","cla5":"正常","acctNum":"1","granteRadio":"100%","balL30day":"32600","balL60day":"1","balL90day":"1","balG60day":"1","bal":"1000"}],
                comBcrRelrepayDetails:[],
                relRepayOrg: "",
                relRepayBal: "",
    
                //[{"authOrg":"B1911","dutyType":"保证人","dutyAmt":"300","dueAmt":"305.84","startDt":"2024-04-06","endDt":"2024-04-08","fiveAdjust":"正常","busType":"固定资产贷款","rptDt":"2024-05-26","voucherName":""}],
                comBcrDeptHiss:[],
                //[{"rptDate":"2023年12月","deptAcctNum":"74","deptBal":"40481.66","attAcctNum":"1","attBal":"10","badAcctNum":"1","badBal":"10","dueAcctNum":"1","dueAmt":"10","duePrinAcctNum":"1","duePrin":"10"}]
                xData:[],
                //["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                yData: [],
                //[23,42,2,69,35,46,23],
                showMychart:true,
                chartWidth: '60%',
                civilJudgementInfos:[],
                comBcrEnforceRecords:[],
                comBcrPenaltyRecords:[],
                open:false,
                organizeSet: new Set(),
                organizeOption: [],
                form:{
                    authOrg:"",
                    orgName:""
                },
                rules:{
                    authOrg:[
                        {required:true,message:'请选择机构号',trigger:'change'}
                    ]
                },
                openVoucher: false,
                voucherForm:{
                    voucherName:""
                },
                fileNm:"",
            }
        },
        methods: {
            donwloadReport() {
                const element = document.getElementsByClassName('report')[0]
                // const element = this.$refs['table']
                const opt = {
                    margin: 0,
                    filename: this.baseInfo.name + this.baseInfo.rptNo +'.pdf',
                    image: { type: 'jpeg', quality: 0.8 },
                    html2canvas: {
                        scale: 2,
                    },
                    pagebreak: { mode: 'avoid-all', before: '#pageBreak' },
                    // jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    // contentHeight: 500,
                    jsPDF: {
                        orientation: 'p',
                        unit: 'mm',
                        format: 'A4',
                        putOnlyUsedFonts: true,
                        floatPrecision: 1, // or "smart", default is 16 }
                    },
                    pagebreak:{mode:'avoid-all'}
                }
                // New Promise-based usage:
                html2pdf().set(opt).from(element).save()
            },
            getReportdata(name){
                let formData = new FormData();
                formData.append("name",name);
                //基础信息
                this.queryAnalys(formData);
                //关注信息
                this.queryFocus(formData);
                //借款明细
                this.queryLoan(formData);
                //贴现、银行承兑汇票
                this.queryDis(formData);
                //循环透支
                // this.queryCircleOverdraw(formData);
                //历史负债
                this.queryRePay(formData);
                //公共记录
                this.queryCommonRecord(formData);
                
            },
            queryAnalys(formData){
                queryAnalysBaseInfo(formData).then(result=>{
                    this.baseInfo = result.data;
                    if(result.data.sharerInfos == null || result.data.sharerInfos.length == 0){
                        result.data.sharerInfos = [{"name":"","idType":"","idNo":"","capRadio":""}];
                    }else{
                        let formData1 = new FormData();
                        formData1.append("module","企业信用")
                        formData1.append("operContent","查看分析报告")
                        formData1.append("idNo",result.data.unSccode)
                        formData1.append("custName",result.data.name)
                        formData1.append("remark1",this.fileNm)
                        operateLog(formData1)
                    }
                });
            },
            queryFocus(formData){
                queryFocusInfo(formData).then(result=>{
                    let data = result.data;
                    this.focusInfo = data.comBcrOutlineInfo;
                    this.relrepayOutlineInfos = data.relrepayOutlineInfos;
                    if(this.relrepayOutlineInfos == null || this.relrepayOutlineInfos.length == 0 ){
                        this.relrepayOutlineInfos = [{"dutyType":"","otcdAmt":"","otcdAcctNum":"","otcdBal":"","otcdAttBal":"","otcdBadBal":"",
                                         "recoverDutyAmt":"","recoverAcctNum":"","recoverBal":""}]
                    }
                    this.unsetDeptOutlineInfo = data.comBcrUnsetDeptOutlineInfo;
                    this.unsetBizOutlineInfos = (data.comBcrUnsetBizOutlineInfos == null || data.comBcrUnsetBizOutlineInfos.length == 0) ? [{}] : data.comBcrUnsetBizOutlineInfos;
                });
            },
            queryLoan(formData){
                queryLoanDetail(formData).then(result=>{
                    let data = result.data;
                    if(data.comBcrLoanDetailInfos != null && data.comBcrLoanDetailInfos.length != 0){
                        for(let info of data.comBcrLoanDetailInfos){
                            this.organizeSet.add(info.authOrg);
                        }
                        this.comBcrLoandetaiInfos = data.comBcrLoanDetailInfos;
                    }else{
                        this.comBcrLoandetaiInfos = [{}];
                    }
                    this.outStandOrg = data.outStandOrg;
                    this.outStandBal = data.outStandBal;
                });
            },
            queryDis(formData){
                queryDisDetail(formData).then(result=>{
                    let data = result.data;
                    this.acctNum = data.acctNum;
                    this.transBal = data.transBal;
                    //贴现
                    if(data.comBcrDisDetailInfos != null && data.comBcrDisDetailInfos.length != 0){
                        for(let info of data.comBcrDisDetailInfos){
                            this.organizeSet.add(info.authOrg);
                        }
                    }
                    this.comBcrDisdetails = data.comBcrDisDetailInfos == null ? [{}] : data.comBcrDisDetailInfos;
                    this.billAcctNum = data.billAcctNum;
                    this.billTransBal = data.billTransBal;
                    //银行承兑汇票
                    if(data.comBcrBillDetailInfos != null && data.comBcrBillDetailInfos.length != 0){
                        
                        for(let info of data.comBcrBillDetailInfos){
                            this.organizeSet.add(info.authOrg);
                        }
                    }
                    this.comBcrBilldetailInfos = data.comBcrBillDetailInfos == null ? [{}] : data.comBcrBillDetailInfos;
                });
            },
            // queryCircleOverdraw(formData){
            //     queryCircleOverdrawDetail(formData).then(result=>{
            //         let data = result.data;
            //         this.drawAcctNum = data.drawAcctNum;
            //         this.drawTransBal = data.drawTransBal;
            //         this.comBcrCircleOverdraws = data.comBcrCircleOverdraws == null ? [{}] : data.comBcrCircleOverdraws;
            //     });
            // },
            queryRePay(formData){
                queryRePayDetail(formData).then(result=>{
                    let data = result.data;
                    if(data.relRepayDetails != null && data.relRepayDetails.length != 0){
                        for(let info of data.relRepayDetails){
                            this.organizeSet.add(info.authOrg);
                        }
                        this.comBcrRelrepayDetails =  data.relRepayDetails;
                    }else{
                        this.comBcrRelrepayDetails =  [{}];
                    }
                    this.relRepayOrg = data.relRepayOrg;
                    this.relRepayBal = data.relRepayBal;
                    let comBcrDeptHis = data.comBcrDeptHis;
                    this.comBcrDeptHiss = (comBcrDeptHis == null ||　comBcrDeptHis == 0)?[{}]: comBcrDeptHis;
                    if(comBcrDeptHis != null && comBcrDeptHis.length >0){
                        this.xData = [];
                        this.yData = [];
                        for(let i = comBcrDeptHis.length -1;i > -1 ;i--){
                            this.xData.push(comBcrDeptHis[i].rptDate);
                            this.yData.push(comBcrDeptHis[i].deptBal);
                        }
                        const option = {
                            xAxis:{
                                data: this.xData,
                                name:"时间"
                            },
                            tooltip:{
                                trigger:'axis',
                            },
                            title:{
                                text:"各时点比较图表（万元）",
                                left:'center'
                            },
                            yAxis:{name:"余额"},
                            series:[{
                                data:this.yData,
                                type:'line',
                                showSymbol:true,
                              
                            }]
                        }
                        this.myChart.setOption(option);
                    }else{
                        this.showMychart = false;
                    }
                });
            },
            queryCommonRecord(formData){
                queryCommonRecordDetail(formData).then(result=>{
                    let data = result.data;
                    this.civilJudgementInfos = data.civilJudgementList;
                    this.comBcrEnforceRecords = data.comBcrEnforceRecordList;
                    this.comBcrPenaltyRecords = data.comBcrPenaltyRecordList;
                });
            },
            initEcharts(){
                this.myChart = echarts.init(document.getElementById("myChart"));
            },
            handleResize(){
                this.myChart.resize();
            },
            windowResize() {
                window.addEventListener("resize", () => {
                    this.updatechartWidth();//这个必须放在这里
                })
            },
    
            watchEchart() {
                const myChartSize = document.getElementById("myChart");
                var ro = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        const cr = entry.contentRect;
                        // console.log('myChart Element:', entry.target);
                        this.chartResize();
                    }
                });
                ro.observe(myChartSize);
            },
            updatechartWidth() {
                this.chartWidth = '60%'
                //window.innerWidth * 0.9;
            },
            chartResize() {
                this.myChart.resize();
            },
            /** 打开修改机构弹窗 */
            openDialog(org,orgName){
                this.organizeOption = [];
                this.organizeSet.forEach((value)=>{
                    this.organizeOption.push({
                        value:value,
                        label:value
                    })
                });
                this.form.authOrg = org;
                this.form.orgName = orgName;
                this.open = true;
            },
    
            /** 取消按钮 */
            cancel() {
                this.$refs.form.resetFields();
                this.open = false;
            },

            
            close(){
                this.$tab.closeOpenPage();
                this.$router.go(-1);
                
            },
    
            submitForm(){
                this.$refs.form.validate(valid=>{
                    if(valid){
                        let formData = new FormData();
                        formData.append("fileName",this.fileNm);
                        formData.append("authOrg",this.form.authOrg);
                        formData.append("orgName",this.form.orgName.trim());
                        editOrganizeName(formData).then(response=>{
                            let formFileData = new FormData();
                            formFileData.append("name",this.fileNm);
                            //未结清负债
                            this.queryLoan(formFileData);
                            //贴现、承兑汇票
                            this.queryDis(formFileData);
                            //相关还款明细
                            this.queryRePay(formFileData);
                            this.open = false;
                        })
                       
                    }
                })
            },
    
            /** 打开修改补录人弹窗 */
            openVoucherDialog(acctNo,voucherName){
                localStorage.setItem('acctNo',acctNo);
                this.voucherForm.voucherName = voucherName;
                this.openVoucher = true;
            },
            closeVoucherDialog(){
                this.$refs.voucherForm.resetFields();
                this.openVoucher = false;
            },
            submitVoucherForm(){
                this.$refs.voucherForm.validate(valid=>{
                    if(valid){
                        let formData = new FormData();
                        formData.append("fileName",this.fileNm);
                        formData.append("voucherName",this.voucherForm.voucherName);
                        formData.append("acctNo",localStorage.getItem('acctNo'));
                        editRepayUserName(formData).then(response=>{
                            let formFileData = new FormData();
                            formFileData.append("name",name);
                            //相关还款明细
                            this.queryRePay(formFileData);
                            this.openVoucher = false;
                        })
                    }
                })
            }
    
        }
    }
    </script>
    <style lang="scss" scoped>
    .my-container {
            position: relative;
            box-sizing: border-box;
            padding: 0 12%;
            background-color: #FFF;
        .backbtn {
            position: absolute;
            top: 80px;
            right: 40px;
        }
        .download {
            position: absolute;
            right: 38px;
            top: 20px;
            font-size: 16px;
        }
    
    }
    .tdFont {
        font-weight: 600;
    }
    .report {
        position: relative;
        margin: 0 auto 50px;
        display: flex;
        flex-direction: column;
        width: 96%;
        font-size: 12px;
    .text-right {
        text-align: right;
    }
    .report-header, .report-footer {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        span:nth-child(n-1) {
        width: 50%;
        }
        span:nth-child(2),
        span:nth-child(5) {
        text-align: right;
        }
        span:nth-child(n + 3) {
        width: 31%;
        }
    }
    .report-body {
        margin-top: 26px;
        .report-body-item-title {
            width: 100%;
            margin-top: 15px;
            font-size: 18px;
            font-weight: 600;
            padding: 10px ;
            border-left: 1.6px solid #000;
            border-right: 1.6px solid #000;
            border-top: 1.6px solid #000;
            background-color: #e1ebff;
            text-align: center;
        // border-bottom: transparent;
        }
        .report-body-item:nth-of-type(1)  .report-body-item-title {
        border-top: 1.6px solid #000;
        }
        .report-body-lable{
            width: 40%;
            text-align:right;
            margin-right: 10px;
        }
        .report-body-item-tab {
        flex-direction: row; 
        display: flex; 
        font-size: 16px; 
        height: 30px; 
        align-items: center; 
        background: rgb(178, 182, 184);
        }
        .report-body-item-table {
            width: 100%;
            border-spacing: 1.6px;
            border-collapse: separate;
            background: #000;
            td {
                height: 30px;
                background-color: #fff;
                text-align: center;
            }
        }
        .report-body-canav {
            height:400px;
            width:60%;
            background:#fff;
            float:left;
            margin-top:10px;
        }
        .color-red {
        color: red;
        }
        .border-bottom {
        border-bottom: 1.6px solid #000;
        }
    }
    .report-footer {
        padding: 20px 0;
    }
    
    }
    
    .text-center {
        text-align: center;
    }
    </style>
      