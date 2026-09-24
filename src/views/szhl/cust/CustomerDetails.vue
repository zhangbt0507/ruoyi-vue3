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
        icon="Close"
        @click="close()"
        >返回</el-button>
        <!-- <el-button
        icon="download"
        type="primary"
        plain
        size="small"
        class="download"
        @click="donwloadReport"
        >PDF下载</el-button> -->
        <div
        ref="report"
        v-loading="false"
        class="report"
        element-loading-text="拼命加载中"
        >
        <h1 align="center" style="font-size: 25px;">客户信息</h1>
        <span class="text-right">单位: 万元</span>
        <!-- <span class="text-right">单位: 万元</span>
        <div class="report-header">
            <span>报告编号: {{ baseInfo.rptNo }}</span>
            <span>报告查询时间: {{ baseInfo.rptTime }}</span>
        </div> -->
        <!--基本信息 -->
        <div class="report-body">
            <div  class="report-body-item-title" style="margin-top: -15px;">客户基础信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td class="tdFont" style="width: 20%;">客户名称</td><td style="width: 30%;">{{ customerInfo.custName }}</td>
                        <td class="tdFont" style="width: 20%;">客户内码</td><td style="width: 30%;">{{ customerInfo.custIsn }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">证件类型</td><td>{{customerInfo.idType}}</td>
                        <td class="tdFont">证件号</td><td>{{customerInfo.idNo}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">签发日期</td><td>{{customerInfo.idEffDt}}</td>
                        <td class="tdFont">到期日期</td><td>{{customerInfo.idEndDt}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">客户类型</td><td>{{customerInfo.custType}}</td>
                        <td class="tdFont">婚姻状况</td><td>{{customerInfo.mrg}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">职业类别</td><td>{{ customerInfo.job }}</td>
                        <td class="tdFont">职业描述</td><td>{{customerInfo.jobDesc}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">配偶姓名</td><td>{{customerInfo.spouseName == null ? '--' : customerInfo.spouseName}}</td>
                        <td class="tdFont">配偶内码</td>
                        <template v-if="customerInfo.spouseCustIns != null">
                            <td  @click="querySpouse(customerInfo.spouseCustIns)" style="color:blue;cursor:pointer">{{customerInfo.spouseCustIns}}</td>
                        </template>
                        <template v-else>
                            <td >{{ '--'}}</td>
                        </template>
                    </tr>
                    <tr>
                        <td class="tdFont">黑灰名单</td><td>{{customerInfo.isBlack}}</td>
                        <td class="tdFont">配偶证件号</td><td>{{customerInfo.spouseIdId}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">配偶黑灰名单</td><td>{{spouseCustInfo == null ? "--" : spouseCustInfo.isBlack}}</td>
                        <td class="tdFont">更新柜员</td><td>{{customerInfo.modifyStaff}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">更新机构</td><td>{{customerInfo.modifyOrg}}</td>
                        <td class="tdFont">更新日期</td><td>{{customerInfo.modifyDate}}</td>
                    </tr>
                    <!-- <tr>
                        <td class="tdFont">归属机构</td><td>{{7}}</td>
                        <td class="tdFont">归属网格</td><td>{{8}}</td>
                    </tr> -->
                </tbody>
            </table>

            <div  class="report-body-item-title"  id="page1">客户基础扩展信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td class="tdFont" style="width: 20%;">民族</td><td style="width: 30%;">{{ customerInfo.nation }}</td>
                        <td class="tdFont" style="width: 20%;">政治面貌</td><td style="width: 30%;">{{ customerInfo.politcStat }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">最高学历</td><td>{{customerInfo.talstEdubg}}</td>
                        <td class="tdFont">毕业院校</td><td>{{customerInfo.graduationSchool}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">工作单位</td><td>{{customerInfo.workCo}}</td>
                        <td class="tdFont">职务</td><td>{{customerInfo.duty}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">年收入</td><td>{{customerInfo.anIcmAmt}}</td>
                        <td class="tdFont">居住状况</td><td>{{customerInfo.liveStu}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">家庭人数</td><td>{{ customerInfo.famCnt }}</td>
                        <td class="tdFont">子女人数</td><td>{{customerInfo.childNo}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">更新柜员</td><td>{{ customerInfo.extInfoModifyStaff }}</td>
                        <td class="tdFont">更新日期</td><td>{{ customerInfo.extInfoModifyDate }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">客户标识</td><td colspan="3">
                            <el-checkbox-group v-model="checkedIdenty"  style="pointer-events:none">
                                <el-checkbox label="本行股东"></el-checkbox>
                                <el-checkbox label="本行关系人"></el-checkbox>
                                <el-checkbox label="小微企业主"></el-checkbox>
                                <el-checkbox label="个体工商户"></el-checkbox>
                                <el-checkbox label="本行员工"></el-checkbox>
                                <el-checkbox label="新型农业经营主体"></el-checkbox>
                            </el-checkbox-group> 
                        </td>
                        <!-- <td colspan="3">{{5}}</td> -->
                    </tr>
                </tbody>
            </table>
            
            <div  class="report-body-item-title" id="page2">产品粘合信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td class="tdFont" style="width: 20%;">丰收互联是否开通</td><td class="double-td" style="width: 10%;">{{ custProductInfo.fshlFlag == '1' ? '是' : '否' }}</td>
                        <td class="tdFont" style="width: 20%;">丰收互联最后登录时间</td><td class="double-td" style="width: 10%;">{{ custProductInfo.fshlLastLoginDt == null ? '--' : custProductInfo.fshlLastLoginDt }}</td>
                        <td class="tdFont" style="width: 20%;">有效合同客户</td><td style="width: 10%;">{{ custProductInfo.effLoanContract == '1' ? '是' : '否' }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">有效合同客户</td><td class="double-td" >{{ custProductInfo.effLoanContract == '1' ? '是' : '否' }}</td>
                        <td class="tdFont">有贷款余额</td><td class="double-td" >{{ custProductInfo.effLoanBalance == '1' ? '是' : '否' }}</td>
                        <td class="tdFont">理财余额客户</td><td>{{ custProductInfo.effInvrstBalance == '1' ? '是' : '否' }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">电费签约标志</td><td class="double-td" >{{ custProductInfo.electSign == '1' ? '是' : '否'}}</td>
                        <td class="tdFont">水费签约标志</td><td class="double-td" >{{ custProductInfo.waterSign == '1' ? '是' : '否'}}</td>
                        <td class="tdFont">ETC签约标志</td><td>{{ custProductInfo.etcSign == '1' ? '是' : '否'}}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">医保代扣签约标志</td><td class="double-td" >{{ custProductInfo.medSign == '1' ? '是' : '否' }}</td>
                        <td class="tdFont">社保代扣签约标志</td><td class="double-td" >{{ custProductInfo.socialSign == '1' ? '是' : '否' }}</td>
                        <td class="tdFont">POS商户标志</td><td>{{ custProductInfo.posMerchant == '1' ? '是' : '否' }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">一码通商户标志</td><td class="double-td" >{{ custProductInfo.qrCodeMerchant == '1' ? '是' : '否' }}</td>
                        <td class="tdFont">信用卡标志</td><td class="double-td" >{{ custProductInfo.creditCust == '1' ? '是' : '否'  }}</td>
                        <td class="tdFont">三代社保卡标志</td><td>{{ custProductInfo.socialCard3 == '1' ? '是' : '否' }}</td>
                    </tr>
                    <tr>
                        <td class="tdFont">养老金代发标志</td><td class="double-td" >{{ custProductInfo.oldAgePension == '1' ? '是' : '否' }}</td>
                        <td class="tdFont">企业微信认证标志</td><td class="double-td" >{{ custProductInfo.cwechatAuthStatus == '1' ? '是' : '否'  }}</td>
                        <td class="tdFont" colspan="2"></td>
                    </tr>
                </tbody>
            </table>

            <!-- 联系地址 -->
            <div  class="report-body-item-title" id="page3">联系地址</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td>地址类型</td><td>属主</td><td>地址信息</td><td>更新日期</td><td>更新人</td>
                    </tr>
                    <tr v-for="(contactAdd,index) in contactAdds">
                            <td>{{contactAdd.contactWay}}</td><td>{{ customerInfo.custName }}</td><td>{{contactAdd.contactDesc}}</td><td>{{contactAdd.modifyDate}}</td>
                            <td>{{contactAdd.modifyStaff}}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- 联系电话 -->
            <div  class="report-body-item-title" id="page4">联系电话</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td>电话类型</td><td>属主</td><td>电话号码</td><td>更新日期</td><td>更新人</td>
                    </tr>
                    <tr v-for="(contactNum,index) in contactNums">
                            <td>{{contactNum.contactWay}}</td><td>{{ customerInfo.custName }}</td><td>{{contactNum.contactDesc}}</td><td>{{contactNum.modifyDate}}</td>
                            <td>{{contactNum.modifyStaff}}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 资产信息 -->
            <div  class="report-body-item-title" id="page5">资产信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td>资产类型</td><td>资产描述</td><td>评估时间</td><td>估值</td><td>修改柜员</td><td>修改机构</td><td>修改日期</td>
                    </tr>
                    <tr v-for="(custAssetInfo,index) in custAssetInfos">
                            <td>{{custAssetInfo.assetType }}</td><td>{{ custAssetInfo.assetDesc }}</td>
                            <td>{{custAssetInfo.evaluationDate}}</td>
                            <td>{{custAssetInfo.evaluationValue}}</td>
                            <td>{{custAssetInfo.modifyStaff}}</td>
                            <td>{{custAssetInfo.modifyOrg}}</td>
                            <td>{{custAssetInfo.modifyDate}}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 非银行类负债信息 -->
            <!-- <div  class="report-body-item-title" >非银行类负债信息</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr>
                        <td>负债类型</td><td>负债描述</td><td>到期日期</td>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>2</td><td>3</td>
                    </tr>
                </tbody>
            </table> -->

            <!-- 银行类负债信息（本人+配偶） -->
            <div  class="report-body-item-title"  id="page6">银行类负债信息（本人+配偶）</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td rowspan="2">总机构数</td><td  rowspan="2">总授信额度</td><td  colspan="2">正常</td><td  colspan="2">关注</td><td  colspan="2">可疑</td>
                    </tr>
                    <tr  class="tdFont">
                        <td>笔数</td><td>金额</td><td>笔数</td><td>金额</td><td>笔数</td><td>金额</td>
                    </tr>
                    <tr>
                        <td>{{ custLoanInfo.orgNum }}</td><td>{{ custLoanInfo.lineOfCreditBal }}</td>
                        <td>{{ custLoanInfo.normalNUm }}</td> <td>{{ custLoanInfo.normalBal }}</td>
                        <td :style="{color: (custLoanInfo.overdueNUm == 0 ? 'black' : 'red')}">{{ custLoanInfo.overdueNUm }}</td> 
                        <td :style="{color: (custLoanInfo.overdueBal == 0 ? 'black' : 'red')}">{{ custLoanInfo.overdueBal }}</td>
                        <td :style="{color: (custLoanInfo.debtsNUm == 0 ? 'black' : 'red')}">{{ custLoanInfo.debtsNUm }}</td> 
                        <td :style="{color: (custLoanInfo.debtsBal == 0 ? 'black' : 'red')}">{{ custLoanInfo.debtsBal }}</td>
                    </tr>
                </tbody>
            </table>

            <table class="report-body-item-table" >
                <tbody>
                    <tr  class="tdFont">
                        <td>属主</td><td>银行</td><td>业务种类</td><td>贷款金额</td><td>贷款余额</td><td>借款日期</td><td>到期日期</td><td>担保方式</td><td>五级分类</td><td>循环标志</td><td>数据日期</td>
                    </tr>
                    <tr v-for="(custLoan,index) in custLoans" :style="{color: ((custLoan.fiveAdjust == '正常' || custLoan.fiveAdjust == '关注')? 'black' : 'red')}">
                        <td>{{custInfoMap.get(custLoan.idNo.trim())}}</td>
                        <td>{{custLoan.brName}}</td><td>{{custLoan.busType}}</td> <td>{{custLoan.loanAmount}}</td>
                        <td>{{custLoan.balance}}</td><td>{{custLoan.startDt}}</td> <td>{{custLoan.endDt}}</td>
                        <td>{{custLoan.guaranType}}</td><td>{{custLoan.fiveAdjust}}</td><td>{{custLoan.loanType}}</td>
                        <template v-if="custLoan.reportDate == '更多'">
                            <td  @click="showLoanDetail" style="color:blue;cursor:pointer">{{custLoan.reportDate}}</td>
                        </template>
                        <template v-else>
                            <td >{{custLoan.reportDate}}</td>
                        </template>
                    </tr>
                </tbody>
            </table>

              
            <!-- 银行类负债信息_信用卡类（本人+配偶） -->
            <div  class="report-body-item-title"  id="page7">银行类负债信息_信用卡类（本人+配偶）</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td>属主</td><td>银行</td><td>授信额度</td><td>已用额度</td><td>当前逾期期数</td><td>当前逾期总额</td><td>账户状态</td><td>最近一次还款日期</td>
                        <td>近6月平均使用额</td><td>数据日期</td>
                    </tr>
                    <tr v-for="(creditCard,index) in creditCardInfo.custCreditCards" :style="{color: ((creditCard.odAmount != '0')? 'red' : 'black')}">
                            <td>{{custInfoMap.get(creditCard.idNo.trim())}}</td><td>{{creditCard.brName == '浙江磐安农村商业银行股份有限公司' ? '本机构' : creditCard.brName}}</td>
                            <td>{{ creditCard.creditAmount }}</td><td>{{ creditCard.balanceUsed }}</td>
                            <td>{{ creditCard.odTimes }}</td><td>{{ creditCard.odAmount }}</td>
                            <td>{{ creditCard.acctStatus }}</td><td>{{ creditCard.returnRecent }}</td>
                            <td>{{ creditCard.avg6mlimit }}</td><td>{{ creditCard.reportDate }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 相关还款责任信息（本人+配偶） -->
            <div  class="report-body-item-title"  id="page8">相关还款责任信息（本人+配偶）</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td style="width: 33%;">总机构数</td><td  style="width: 33%;">责任总金额</td><td  style="width: 34%;">责任总余额</td>
                    </tr>
                    <tr>
                        <td>{{ custOtherLoanInfo.orgNum }}</td><td>{{ custOtherLoanInfo.lineOfCreditBal }}</td>
                        <td>{{ custOtherLoanInfo.bal }}</td>
                    </tr>
                </tbody>
            </table>
            <table class="report-body-item-table">
                <tbody>
                    <tr  class="tdFont">
                        <td>属主</td><td>银行</td><td>责任对象</td><td>责任类型</td><td>责任金额</td><td>责任余额</td><td>借款日期</td><td>到期日期</td><td>五级分类</td><td>数据日期</td>
                    </tr>
                    <tr v-for="(custOtherLoan,index) in custOtherLoanInfo.custOtherLoans" :style="{color: ((custOtherLoan.fiveAdjust == '正常' || custOtherLoan.fiveAdjust == '关注')? 'black' : 'red')}">
                        <td>{{custInfoMap.get(custOtherLoan.idNo.trim())}}</td>
                        <td>{{custOtherLoan.brName}}</td><td>{{custOtherLoan.loanType}}</td> <td>{{custOtherLoan.loanerType}}</td>
                        <td>{{custOtherLoan.loanAmt}}</td><td>{{custOtherLoan.balance}}</td> <td>{{custOtherLoan.startDt}}</td>
                        <td>{{custOtherLoan.endDt }}</td><td>{{custOtherLoan.fiveAdjust}}</td><td>{{custOtherLoan.reportDate.substring(0,10) }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 户籍信息（本人+配偶+成员） -->
            <div  class="report-body-item-title"  id="page9">户籍信息（本人+配偶）</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr class="tdFont">
                        <td>户号</td><td>姓名</td><td>民族</td><td>证件号码</td><td>关系</td><td>户籍地址</td>
                    </tr>
                    <tr v-for="(custHjxx,index) in custHjxxs">
                            <td>{{custHjxx.hh}}</td><td>{{ custHjxx.xm }}</td> <td>{{custHjxx.mz}}</td>
                            <td>{{custHjxx.zjh}}</td>
                            <td>{{custHjxx.yhzgx}}</td>
                            <td>{{custHjxx.dz}}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 经营主体信息（本人+配偶） -->
            <div  class="report-body-item-title"  id="page10">经营主体信息（本人+配偶）</div>
            <table class="report-body-item-table">
                <tbody>
                    <tr class="tdFont">
                        <td>企业名称</td><td>统一代码</td><td>法定代表人</td><td>贷款总额</td><td>我行信用</td>
                        <td>我行保证</td><td>我行抵押</td><td>他行信用</td><td>他行保证</td><td>他行抵押</td><td>企业报告</td>
                    </tr>
                    <tr v-for="(custBusiness,index) in custBusinessInfo">
                            <td>{{custBusiness.enterpriseName}}</td><td>{{ custBusiness.unifiedSocialCreditCode }}</td> <td>{{custBusiness.legalRepresentative}}</td>
                            <td>{{custBusiness.dkze}}</td>
                            <td>{{custBusiness.bhxyye}}</td>
                            <td>{{custBusiness.bhbzye}}</td>
                            <td>{{custBusiness.bhdyye}}</td>
                            <td>{{custBusiness.thxyye}}</td>
                            <td>{{custBusiness.thbzye}}</td>
                            <td>{{custBusiness.thdyye}}</td>
                            <template v-if="custBusiness.fileNm != null">
                                <td  @click="toReportDetail(custBusiness.fileNm,custBusiness.enterpriseName,custBusiness.unifiedSocialCreditCode)" style="color:blue;cursor:pointer">查看报告</td>
                            </template>
                            <template v-else>
                                <td >{{ '--'}}</td>
                            </template>
                    </tr>
                </tbody>
            </table>
            <div class="navbar" style="left:auto">
                <a href="#">返回顶部</a>
                <a href="#page1">扩展信息</a>
                <a href="#page2">粘合信息</a>
                <a href="#page3">联系地址</a>
                <a href="#page4">联系电话</a>
                <a href="#page5">资产信息</a>
                <a href="#page6">银行类负债</a>
                <a href="#page7">信用卡类</a>
                <a href="#page8">相关还款责任</a>
                <a href="#page9">户籍信息</a>
                <a href="#page10">经营主体信息</a>
                <a @click="close()">关闭视图</a>
            </div>
    </div>
       
        </div>
            <el-dialog title="详情" v-model="loanDetailOpen" width="950px" >
                <div class="report">
                    <div class="report-body">
                        <table  class="report-body-item-table">
                            <tbody>
                                <tr class="tdFont">
                                    <td>属主</td><td>银行</td><td>业务种类</td><td>贷款金额</td><td>贷款余额</td><td>借款日期</td><td>到期日期</td><td>担保方式</td><td>五级分类</td><td>循环标志</td><td>数据日期</td>
                                </tr>
                                <tr v-for="(custLoan,index) in custLoanInfo.custLoans" :style="{color: ((custLoan.fiveAdjust == '正常' || custLoan.fiveAdjust == '关注')? 'black' : 'red')}">
                                    <td>{{custInfoMap.get(custLoan.idNo.trim())}}</td>
                                    <td>{{custLoan.brName}}</td><td>{{custLoan.busType}}</td> <td>{{custLoan.loanAmount}}</td>
                                    <td>{{custLoan.balance}}</td><td>{{custLoan.startDt}}</td> <td>{{custLoan.endDt}}</td>
                                    <td>{{custLoan.guaranType}}</td><td>{{custLoan.fiveAdjust}}</td><td>{{custLoan.loanType}}</td><td>{{custLoan.reportDate}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            
            <!-- <table border="1px solid black">
                <tbody>
                    <tr>
                        <td>属主</td><td>银行</td><td>业务种类</td><td>贷款金额</td><td>贷款余额</td><td>借款日期</td><td>到期日期</td><td>担保方式</td><td>五级分类</td><td>循环标志</td><td>数据日期</td>
                    </tr>
                    <tr v-for="(custLoan,index) in custLoanInfo.custLoans">
                        <td>{{custInfoMap.get(custLoan.idNo.trim())}}</td>
                        <td>{{custLoan.brName}}</td><td>{{custLoan.busType}}</td> <td>{{custLoan.loanAmount}}</td>
                        <td>{{custLoan.balance}}</td><td>{{custLoan.startDt}}</td> <td>{{custLoan.endDt}}</td>
                        <td>{{custLoan.guaranType}}</td><td>{{custLoan.fiveAdjust}}</td><td>{{custLoan.loanType}}</td><td>{{custLoan.reportDate}}</td>
                    </tr>
                </tbody>
            </table> -->
            </el-dialog>
    </div>
       
</template>

<script  setup name="CustomDetails">
  
    import { queryCustBasicInfo,queryCustContactInfo,queryCustAssetInfo,queryCustHjxxInfo, 
        queryCustLoanInfo,queryCustOtherLoanInfo,queryCreditCardInfo,queryCustProductInfo,queryCustBusinessInfo } from "@/api/szhl/custom/Customer";
    import { operateLog } from "@/api/system/log";
    const { proxy } = getCurrentInstance();

    let zjhs = new Array();
    const route = useRoute();
    const data = reactive({
        loanDetailOpen: false,
        customerInfo: {},
        checkedIdenty: [],
        spouseCustInfo: {},
        contactNums: [],
        contactAdds:[],
        custAssetInfos: [],
        custHjxxs: [],
        custLoanInfo: {},
        custInfoMap: new Map(),
        custLoans:[],
        custOtherLoanInfo:{},
        creditCardInfo:{},
        custProductInfo: {},
        custBusinessInfo: {},
    });
    
    const { loanDetailOpen,customerInfo,spouseCustInfo,checkedIdenty,contactNums,
        contactAdds,custAssetInfos, custHjxxs,custLoanInfo,custLoans,custInfoMap,custOtherLoanInfo,creditCardInfo,custProductInfo,custBusinessInfo } = toRefs(data);

    // let custIsn = proxy.$route.query.custIsn;
    const custIsn = route.params && route.params.custIsn;
    const idNo = '';

    /** 查询征信报告列表 */
    function selectCustBasicInfo() {
        queryCustBasicInfo(custIsn,idNo).then(response => {
            if( response.data == null){
                return;
            }
            
            let formData1 = new FormData();
            formData1.append("module","客户信息")
            formData1.append("operContent","查看客户360")
            formData1.append("custIsn",custIsn)
            formData1.append("idNo",response.data.idNo)
            formData1.append("custName",response.data.custName)
            operateLog(formData1)

            customerInfo.value = response.data;
            if(response.data.obankShrl == 1){
                checkedIdenty.value.push("本行股东")
            }
            if(response.data.obankRelsh == 1){
                checkedIdenty.value.push("本行关系人")
            }
            if(response.data.smeow == 1){
                checkedIdenty.value.push("小微企业主")
            }
            if(response.data.indBiz == 1){
                checkedIdenty.value.push("个体工商户")
            }
            if(response.data.obankStf == 1){
                checkedIdenty.value.push("本行员工")
            }
            if(response.data.agrMngMnsbj == 1){
                checkedIdenty.value.push("新型农业经营主体")
            }
            zjhs.push(response.data.idNo);
            if(response.data.spouseIdId != null && response.data.spouseIdId != ""){
                zjhs.push(response.data.spouseIdId);
            }
            let spouseCustIns = response.data.spouseCustIns;
            if(spouseCustIns != null && spouseCustIns != ''){
                //查询配偶信息
                queryCustBasicInfo(spouseCustIns,'').then(spouseResponse => {
                    spouseCustInfo.value = spouseResponse.data;
                })
            }
            custInfoMap.value.set(customerInfo.value.idNo.trim(),customerInfo.value.custName);
            if(customerInfo.value.spouseIdId != null && customerInfo.value.spouseIdId != ''){
                custInfoMap.value.set(customerInfo.value.spouseIdId.trim(),customerInfo.value.spouseName);
            }
            if(zjhs.length != 0){
                let formData = new FormData();
                formData.append("zjhs",zjhs)
                //查询户籍信息
                queryCustHjxxInfo(formData).then(Hjresponse => {
                    custHjxxs.value = Hjresponse.data;
                })
                let loanFormData = new FormData();
                loanFormData.append("idNos",zjhs)
                //查询户籍信息
                queryCustLoanInfo(loanFormData).then(Hjresponse => {
                    custLoanInfo.value = Hjresponse.data;
                    custLoans.value = Hjresponse.data.custLoans;
                    if(Hjresponse.data.custLoans.length>10){
                        custLoans.value = Hjresponse.data.custLoans.slice(0,10);
                        custLoans.value.push({"idNo":"","brName":"...","busType":"...","fiveAdjust":"...","reportDate":"更多"});
                    }
                });
                queryCustOtherLoanInfo(loanFormData).then(loanResponse => {
                    custOtherLoanInfo.value = loanResponse.data;
                    // custOtherLoans.value = loanResponse.data.custOtherLoans;
                    // console.log(loanResponse.data.custLoans.length)
                    // if(loanResponse.data.custOtherLoans.length>5){
                    //     custOtherLoans.value = loanResponse.data.custOtherLoans.slice(0,5);
                    //     custOtherLoans.value.push({"idNo":"","brName":"...","busType":"...","fiveAdjust":"...","reportDate":"详情"});
                    // }
                });
                queryCreditCardInfo(loanFormData).then(creditResponse => {
                    creditCardInfo.value = creditResponse.data;
                });
                queryCustBusinessInfo(loanFormData).then(busResponse =>{
                    custBusinessInfo.value = busResponse.data
                })
            }
            
        });
    }

    function selectCustContactInfo(){
        queryCustContactInfo({"custIsn":custIsn}).then(response => {
            let result = response.data;
            if(result.length != 0){
                for(let r of result){
                    if(r.contactType == 1){
                        contactNums.value.push(r)
                    }else{
                        contactAdds.value.push(r)
                    }
                }
            }
        });
    }

    function selectCustAssetInfo(){
        queryCustAssetInfo({"custIsn":custIsn}).then(response => {
            custAssetInfos.value = response.data;
        })
    }

    function selectProductInfo(){
        queryCustProductInfo({"custIsn":custIsn}).then(response => {
            if(response.data != null){
                custProductInfo.value = response.data;
            }
        })
    }

    function showLoanDetail(){
        loanDetailOpen.value = true;
    }

    function close(){
        // const obj = { path: "/cust/Customer" };
        proxy.$tab.closeOpenPage();
        proxy.$router.go(-1);
        
    }

    function querySpouse(custIsn){
        queryCustBasicInfo(custIsn,"").then(response => {
            if(response.data == null){
                proxy.$modal.alert("未获取到配偶信息");
            }else{
                proxy.$router.push("/customer/detail/" + custIsn);
            }
        })
    }

    function  toReportDetail(fileNm,custName,unSccode) {
        // let formData1 = new FormData();
        // formData1.append("module","客户信息")
        // formData1.append("operContent","查看分析报告")
        // formData1.append("remark1",fileNm)
        // formData1.append("idNo",unSccode)
        // formData1.append("custName",custName)
        // operateLog(formData1)
        proxy.$router.push({ path: "/credit/detail",query:{"fileNm":fileNm} });
        // proxy.$router.push("/credit/detail/" + fileNm);
    }

    selectCustBasicInfo();
    selectCustContactInfo();
    selectCustAssetInfo();
    selectProductInfo();
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
            font-size: 15px;
            font-weight: 600;
            padding: 10px ;
            // border-left: 1.6px solid #000;
            // border-right: 1.6px solid #000;
            // border-top: 1.6px solid #000;
            // background-color: #e1ebff;
            // color: #4c69e9;
            text-align: left;
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
            border: 1px solid ;
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

    .double-td {
        border-right-style: double;
        border-right-width: 1px;
    }

    .navbar {
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-10%);
        background-color: #f1f1f1 0.5;
        padding: 10px;
    }

    .navbar a {
        display: block;
        margin-bottom: 10px;
        color: #776262;
        text-decoration: underline;
        text-align: left;
        font-size: 15px;
    }
</style>
      