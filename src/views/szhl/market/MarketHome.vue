<template>
    <div class="home ">
        <el-row :gutter="10">
      <el-col :sm="24" :lg="4" >
       <el-card class="box-card-top" shadow="hover" v-loading="ckLoading">
        <template #default >
              <div class="myCard myCard__header">
                <span >存款年日均</span>
              </div>
              <div class="myCard myCard__body">{{ dataFormat(depositInfo.nrj) }}</div>
              <div class="myCard myCard__percent">
                比年初：{{ dataFormat(depositInfo.nrj - depositInfo.prevYearNrj) }} 
                <div>
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(depositInfo.nrj - depositInfo.prevYearNrj)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(depositInfo.nrj - depositInfo.prevYearNrj)>0"></use>
                  </svg>
                </div>
                <div >
                  比上月：{{ dataFormat(depositInfo.nrj - depositInfo.prevMonthNrj) }} 
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(depositInfo.nrj - depositInfo.prevMonthNrj)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(depositInfo.nrj - depositInfo.prevMonthNrj)>0"></use>
                  </svg>
                </div>
              </div>
              <el-divider style="margin:10px 0"/>
              <div class="myCard myCard__percent"><span >存款时点：{{ dataFormat(depositInfo.ye) }}</span></div>
        </template>
              
       </el-card>
      </el-col>
      
      <el-col :sm="24" :lg="4">
       <el-card class="box-card-top" shadow="hover" v-loading="dkLoading">
          <div class="myCard myCard__header">
                <span >贷款年日均</span>
              </div>
              <div class="myCard myCard__body">{{ dataFormat(loanInfo.nrj) }}</div>
              <div class="myCard myCard__percent">
                比年初：{{ dataFormat(loanInfo.nrj - loanInfo.prevYearNrj) }} 
                <div>
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(loanInfo.nrj - loanInfo.prevYearNrj)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(loanInfo.nrj - loanInfo.prevYearNrj)>0"></use>
                  </svg>
                </div>
                <div >
                  比上月：{{ dataFormat(loanInfo.nrj - loanInfo.prevMonthNrj) }}
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(loanInfo.nrj - loanInfo.prevMonthNrj)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(loanInfo.nrj - loanInfo.prevMonthNrj)>0"></use>
                  </svg>
                </div>
              </div>
              <el-divider style="margin:10px 0"/>
              <div class="myCard myCard__percent"><span >贷款时点：{{ dataFormat(loanInfo.ye) }}</span></div>
        
       </el-card>
      </el-col>
      <el-col :sm="24" :lg="4">
       <el-card class="box-card-top" shadow="hover" v-loading="dgLoading">
          <div class="myCard myCard__header">
                <span >对公管户(户)</span>
              </div>
              <div class="myCard myCard__body">{{dgManagerInfo.hs}}</div>
              <div class="myCard myCard__percent">
                年增量：{{dgManagerInfo.hs - dgManagerInfo.prevYearHs}}
                <div>
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(dgManagerInfo.hs - dgManagerInfo.prevYearHs)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(dgManagerInfo.hs - dgManagerInfo.prevYearHs)>0"></use>
                  </svg>
                </div>
                <div >
                  月增量：{{dgManagerInfo.hs - dgManagerInfo.prevMonthHs}}
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(dgManagerInfo.hs - dgManagerInfo.prevMonthHs)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(dgManagerInfo.hs - dgManagerInfo.prevMonthHs)>0"></use>
                  </svg>
                </div>
              </div>
              <el-divider style="margin:10px 0"/>
              <div class="myCard myCard__percent"><span >管户排名：{{dgManagerInfo.pm}}</span></div>
       </el-card>
      </el-col>
      <el-col :sm="24" :lg="4">
       <el-card class="box-card-top" shadow="hover" v-loading="dsLoading">
          <div class="myCard myCard__header">
                <span >对私管户(户)</span>
              </div>
              <div class="myCard myCard__body">{{dsManagerInfo.hs}}</div>
              <div class="myCard myCard__percent">
              年增量：{{dsManagerInfo.hs - dsManagerInfo.prevYearHs}}
                <div>
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(dsManagerInfo.hs - dsManagerInfo.prevYearHs)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(dsManagerInfo.hs - dsManagerInfo.prevYearHs)>0"></use>
                  </svg>
                </div>
                <div >
                  月增量：{{dsManagerInfo.hs - dsManagerInfo.prevMonthHs}}
                  <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                      <use xlink:href="#icon-arrow-lv" v-if="(dsManagerInfo.hs - dsManagerInfo.prevMonthHs)<0"></use>
                      <use xlink:href="#icon-arrow-red" v-if="(dsManagerInfo.hs - dsManagerInfo.prevMonthHs)>0"></use>
                  </svg>
                </div>
              </div>
              <el-divider style="margin:10px 0"/>
              <div class="myCard myCard__percent"><span >管户排名：{{dsManagerInfo.pm}}</span></div>
       </el-card>
      </el-col>
       <el-col :sm="24" :lg="8">
       <el-card class="box-card-top">
        <div class="content">
          <el-link :underline="false" @click="handClickJx">
            <div class="content__btn" >
              <el-badge :value="creditFileTotal">
                <svg class="icon svg-icon content__svg" aria-hidden="true" >
                      <use xlink:href="#icon-jx"></use>
                </svg>
                </el-badge>
                <div class="content__font">待移交档案</div> 
            </div>
          </el-link>
          <el-link :underline="false" @click="handClickCk">
            <div class="content__btn">
                <svg class="icon svg-icon content__svg" aria-hidden="true">
                  <use xlink:href="#icon-ck"></use>
                </svg>
                <div class="content__font">个人业绩</div> 
            </div>
          </el-link>
          <el-link :underline="false" @click="handClickDk">
            <div class="content__btn">
                  <svg class="icon svg-icon content__svg" aria-hidden="true">
                    <use xlink:href="#icon-dk"></use>
                  </svg>
                  <div class="content__font">贷款管户</div> 
            </div>
          </el-link>
          <el-link :underline="false" @click="handClickDueContract(total)">
            <div class="content__btn">
              <el-badge :value="total" :max="10" class="content__item">
                  <svg class="icon svg-icon content__svg" aria-hidden="true">
                    <use xlink:href="#icon-ls"></use>
                  </svg>
              </el-badge>
              <div class="content__font">临期合同</div> 
            </div>
          </el-link>

          <el-link :underline="false" @click="handClickLoanReduce(loanReduceTotal)">
            <div class="content__btn">
              <el-badge :value="loanReduceTotal" :max="10" class="content__item">
                  <svg class="icon svg-icon content__svg" aria-hidden="true">
                    <use xlink:href="#icon-lskh"></use>
                  </svg>
              </el-badge>
              <div class="content__font">流失客户</div> 
            </div>
          </el-link>

          <el-link :underline="false" @click="handClickOtherBankMarketing(otherBankTotal)">
            <div class="content__btn">
              <el-badge :value="otherBankTotal" :max="10" class="content__item">
                  <svg class="icon svg-icon content__svg" aria-hidden="true">
                    <use xlink:href="#icon-ydyx"></use>
                  </svg>
              </el-badge>
              <div class="content__font">他行有贷营销</div> 
            </div>
          </el-link>
          
        </div>
       </el-card>
      </el-col>
       <el-divider  style="margin:10px 0"/>
    <el-col :sm="24" :lg="16">
          <el-card class="box-card">
              <el-tabs  type="border-card" >
                <el-tab-pane label="临期合同提醒">
                  <due-contract ref="dueRef" @total="getTotal" style="margin-top: -20px"></due-contract>
                </el-tab-pane>
                <el-tab-pane label="流失客户预警">
                  <loan-reduce ref="loanReduceRef" @total="getLoanReduceTotal"></loan-reduce>
                </el-tab-pane>
                <el-tab-pane label="他行有贷营销">
                <other-bank-loan-marketing ref="otherBankLoanMarketingRef" @total="getOtherBankTotal"></other-bank-loan-marketing>
                  </el-tab-pane>

              </el-tabs>
            </el-card>
    </el-col>
    <el-col :sm="24" :lg="8">
       <el-card class="box-card">
        <template #header>
          <div class="msg__header">待办提醒事项</div>
        </template>
          <div class="msg__content">
            <div>营销提醒</div>
            临期合同提醒未处理数：            
            <el-link :underline="false" type="primary"  @click="handClickDueContract(total)">              
              <div class="content__font" style="font-size:13px">{{total}}</div>          
          </el-link>
          <br/>

            流失客户未处理数：
             <el-link :underline="false" type="primary"  @click="handClickLoanReduce(loanReduceTotal)">              
              <div class="content__font" style="font-size:13px">{{loanReduceTotal}}</div>          
          </el-link>
          <br/>
            他行有贷未处理数：
             <el-link :underline="false" type="primary"  @click="handClickOtherBankMarketing(otherBankTotal)">              
              <div class="content__font" style="font-size:13px">{{otherBankTotal}}</div>          
          </el-link>
          <br/>
            待移交档案数：
             <el-link :underline="false" type="primary"  @click="handClickJx()">              
              <div class="content__font" style="font-size:13px">{{creditFileTotal}}</div>          
          </el-link>
          <br/>
          精细化客群未完成指标数：
             <el-link :underline="false" type="primary"  @click="handClickMnagerDontcompletecount()">              
              <div class="content__font" style="font-size:13px">{{managerDontcompletecountTotal}}</div>          
          </el-link>
          </div>
          
          <div class="msg__content">
            <div>风险提醒</div>
            功能开发中……<br/>
           
          </div>
          

       </el-card>
        <el-card class="box-card">
        <template #header>
          <div class="msg__header">更新日志</div>
        </template>
          <div >
            <el-collapse accordion model-value="5">
              <el-collapse-item name="7" title="V1.2.4 2025-07-30">
                1.利率定价功能上线<br/>
              </el-collapse-item>
              <el-collapse-item name="6" title="V1.2.3 2025-04-24">
                1.2025万家行2.0指标上线<br/>
                2.存贷款收付息率测算工具上线<br/>
              </el-collapse-item>
              <el-collapse-item name="5" title="V1.2.2 2024-08-26">
                1.客户经理个人业绩和履职得分功能上线<br/>
                2.支行管理人员首页优化<br/>
              </el-collapse-item>
              <el-collapse-item name="4" title="V1.2.1 2024-07-30">
                1.信用管理模块上线<br/>
                2.对原有营销管理模块优化<br/>
              </el-collapse-item>
              <el-collapse-item name="3" title="V1.2.0 2024-01-16">
                1.2024劳动竞赛考核指标统计报表上线<br/>
                2.对公核心存款客户明细报表上线<br/>
              </el-collapse-item>
              <el-collapse-item name="2" title="V1.1.0 2024-01-08">
                1.客户经理存款明细功能上线<br/>
                2.客户经理贷款明细功能上线<br/>
                3.修复客户经理管户跨年取数异常<br/>
                4.劳动竞赛大屏上线<br/>
              </el-collapse-item>
              <el-collapse-item name="1" title="V1.0.0 2023-12-01">
                智慧互联平台1.0正式上线<br/>
              </el-collapse-item>
            </el-collapse>
           
          </div>
          

       </el-card>
    </el-col>
    </el-row>

    <el-divider />
  </div>
</template>
<script name="MarketHome">
import { getUserProfile } from "@/api/system/user";
import useUserStore from '@/store/modules/user';
import  { getCurrentInstance, unref } from 'vue';
import DueContract from './contract/index.vue';
import LoanReduce  from './reduce/index.vue';
import OtherBankLoanMarketing from './loan/index.vue';
import DepositDetail from '../manager/khjl/deposit/index.vue';
import { formatNumberWithRegex, countCreditFile } from "@/api/szhl/jxkh/performance";
import { selectSecondList } from "@/api/szhl/data/CustomerTarget";
const managerId =ref('');
const creditFileTotal = ref(null);
//未完成目标数
const managerDontcompletecountTotal = ref(null);
const handleClickEffect = (proxy, workDate) => {
  const name = useUserStore().name;
  const handClickJx = () => {
    window.open("http://154.126.31.85:8080/#/credit-transfer");
  }
  const handClickMnagerDontcompletecount= () => {
      //路由跳转
      proxy.$router.push({path: "/refinement/customertarget-detail"});
  }
  const handClickCk = () => {
    //路由跳转
      //proxy.$router.push({path: "/szhl/manager/khjl/deposit"});
      proxy.$router.push({path: "/manager/performance",query: { workDate: workDate.value, managerId: managerId.value, activeName: 'visit'}});
      //proxy.$router.push({path: "/assess/loan-customer-manager"});
  }
  const handClickDk = () => {
    //路由跳转
    proxy.$router.push({path: "/assess/loan-customer-manager"});
  }
  const handClickDueContract = (total) => {
    if(total>0){
      //路由跳转
      proxy.$router.push({path: "/market/contract/contract-list"});
    }else{
      proxy.$modal.alert("没有待处理到期合同");
    }
  }
    const handClickLoanReduce = (loanReduceTotal) => {
    if(loanReduceTotal>0){
      //路由跳转
      proxy.$router.push({path: "/market/reduce/reduce-list"});
    }else{
      proxy.$modal.alert("没有待处理流失客户");
    }
  }
    const handClickOtherBankMarketing = (otherBankTotal) => {
    if(otherBankTotal>0){
      //路由跳转
      proxy.$router.push({path: "/market/loan/loan-list"});
    }else{
      proxy.$modal.alert("没有待处理他行有贷营销");
    }
  }
  //获取待移交的合同
  const getCreditFile = () => {
    countCreditFile().then( res => {
      creditFileTotal.value = res.data;
    });
  }

  //未完成目标
  const getManagerDontcompletecountTotal = () => {
    const params = {
      assessOrg:useUserStore().deptId,
      customerManager:useUserStore().name
    };
    selectSecondList(params).then( res => {
      if(res.total===0){
        managerDontcompletecountTotal.value=0;
      }else{
        managerDontcompletecountTotal.value = res.rows[0].targetcount-res.rows[0].completecount;
      }
    });
  }

  
  return { handClickJx, handClickCk, handClickDk, handClickDueContract,handClickLoanReduce,handClickOtherBankMarketing,getCreditFile,getManagerDontcompletecountTotal,handClickMnagerDontcompletecount };
};
//个人业绩初始化
const performanceEffect = () => {
  const performance = {
            managerId: '',
            nrj: 0,
            ye: 0,
            prevMonthNrj: 0,
            prevMonthYe: 0,
            prevYearNrj: 0,
            prevYearYe: 0,
            hs: 0,
            prevYearHs: 0,
            prevMonthHs: 0,
            pm: ''
        }
  const depositInfo = ref(performance);
  const loanInfo = ref(performance);
  const dgManagerInfo = ref(performance);
  const dsManagerInfo = ref(performance);
  const ckLoading = ref(false);
  const dkLoading = ref(false);
  const dgLoading = ref(false);
  const dsLoading = ref(false);
  //存款
  const getDeposit = () => {
    ckLoading.value = true;
    // depositPerformance().then(res => {
    //   if(res.data != null){
    //     depositInfo.value = res.data;
    //   }
    //   ckLoading.value = false;
    // });
  }
  //贷款
  const getLoan = () => {
    dkLoading.value = true;
    // loanPerformance().then(res => {
    //   if(res.data != null){
    //     loanInfo.value = res.data;
    //   }
    //   dkLoading.value = false;
    // })
  }
  //对公管户
  const getDgManagerInfo = () => {
    dgLoading.value = true;
    // loanDgManagerPerformance().then(res => {
    //   if(res.data != null){
    //     dgManagerInfo.value = res.data;
    //   }
    //   dgLoading.value = false;
    // })
  }
   //对私管户
  const getDsManagerInfo = () => {
    dsLoading.value = true;
    // loanDsManagerPerformance().then(res => {
    //   if(res.data != null){
    //     dsManagerInfo.value = res.data;
    //   }
    //   dsLoading.value = false;
    // })
  }
  const dataFormat = ( n ) => {
    return formatNumberWithRegex(n);
  }
  
  return { getDeposit, depositInfo, getLoan, loanInfo, getDgManagerInfo, dgManagerInfo, getDsManagerInfo, dsManagerInfo, dataFormat, ckLoading, dkLoading, dgLoading, dsLoading }
}

const dueRef = ref(null);
const loanReduceRef = ref(null);
const otherBankLoanMarketingRef = ref(null);
export default{
  props: { workDate: String, org: String },
  components: { DueContract, LoanReduce, OtherBankLoanMarketing, DepositDetail },
  mounted(){
    //页面加载完成后处理显示模块
    unref(dueRef).changeSearch();
    unref(loanReduceRef).changeLoanReduceSearch();
    unref(otherBankLoanMarketingRef).changeOtherBankLoanMarketingSearch();
  },
  setup (props) {
    const { proxy } = getCurrentInstance();
    const { workDate, org }= toRefs(props);
    const total = ref(null);
    const otherBankTotal = ref(null);
    const loanReduceTotal = ref(null);
    //右侧按钮点击事件
    const { handClickJx, handClickCk, handClickDk, handClickDueContract,handClickLoanReduce,handClickOtherBankMarketing,getCreditFile,getManagerDontcompletecountTotal,handClickMnagerDontcompletecount } = handleClickEffect( proxy, workDate );
    const getTotal = (c) => {
      total.value = c;      
    }
    const getOtherBankTotal = (c) => {    
      otherBankTotal.value = c;      
    }
        const getLoanReduceTotal = (c) => {    
      loanReduceTotal.value = c;      
    }
    getUserProfile().then(res => {
        managerId.value = res.data.userName;
  });

    
    //存款业绩
    const { getDeposit, depositInfo, getLoan, loanInfo, getDgManagerInfo, dgManagerInfo, getDsManagerInfo, dsManagerInfo, dataFormat, 
    ckLoading, dkLoading, dgLoading, dsLoading } = performanceEffect();
    // getDeposit();
    // getLoan();
    // getDgManagerInfo();
    // getDsManagerInfo();
    getCreditFile();
    getManagerDontcompletecountTotal();
    return { handClickJx, handClickCk, handClickDk, handClickDueContract,handClickLoanReduce,handClickOtherBankMarketing,dueRef,getTotal,total,loanReduceRef,otherBankLoanMarketingRef,
            getDeposit, depositInfo, getLoan, loanInfo, getDgManagerInfo, dgManagerInfo, getDsManagerInfo, dsManagerInfo, dataFormat, 
            ckLoading, dkLoading, dgLoading, dsLoading, getOtherBankTotal,otherBankTotal,getLoanReduceTotal,loanReduceTotal, getCreditFile ,creditFileTotal,
            getManagerDontcompletecountTotal,managerDontcompletecountTotal, handClickMnagerDontcompletecount,managerId
    }
  }
}
  
</script>
<style scoped lang="scss">
.msg {
  &__header {
    font-size: 20px;
  }
  &__content {
    width: 100%;
    border: 1px solid var(--el-border-color);
    border-left:5px rgb(241, 154, 24) solid;
    border-radius: 5px;
    margin: 10px 0;
    font-size: 13px;
    color: #999;
    margin: -10px auto;
    padding: 10px;
  }
}
.myCard {
  display: flex;
  margin: 0 auto;
  &__header {
    padding-bottom: 0;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #999;
  }
  &__body {
    margin-top: 5px;
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 25px;
  }
  &__percent{
    margin-bottom: 10px;
    width: 100%;
    color: #666;
    justify-content: space-between;
  }
  &__svg {
    margin: auto 4.5px;
    width: 10px;
    height: 10px;
}
}
.box-card-top{
  height: 140px;
}
.content {
  margin: auto;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  &__btn{
    margin: auto;
    width: 80px;
  }
  &__font{
    font-size: 10px;
  }
  &__svg{
  margin: auto 4.5px ;
  width: 35px;
  height: 35px;
  &__item{
    margin-top: 10px;
    margin-right: 40px;
  }
}
}
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

