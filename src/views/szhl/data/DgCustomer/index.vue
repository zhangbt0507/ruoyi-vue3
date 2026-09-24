<template>
    <div class="app-container">
          <el-form :model="queryParams" ref="queryForm"  :rules="rules"  :inline="true"  label-width="68px">
              <el-form-item label="数据日期" prop="workDate" label-width="80">
                  <el-date-picker v-model="queryParams.workDate" placeholder="请选择数据日期"  format="YYYYMMDD" value-format="YYYYMMDD" style="width: 240px"></el-date-picker>
              </el-form-item>
  
  
              <el-form-item label="客户号" prop="custId">
                  <el-input
                  v-model="queryParams.custId"
                  placeholder="请输入客户号"
                  clearable
                  @keyup.enter="handleQuery"
                  style="width: 240px"
                  />
              </el-form-item>
              <el-form-item label="客户名称" prop="custName" label-width="80">
                  <el-input
                  v-model="queryParams.custName"
                  placeholder="请输入客户名称"
                  clearable
                  @keyup.enter="handleQuery"
                  style="width: 240px"
                  />
              </el-form-item>
              <el-form-item label="客户经理" prop="managerId" label-width="80">
                  <el-input
                  v-model="queryParams.managerId"
                  placeholder="请输入客户经理柜员号"
                  clearable
                  @keyup.enter="handleQuery"
                  style="width: 240px"
                  />
              </el-form-item>
              <el-form-item label="贷款金额" prop="lv" label-width="80">
                  <el-select v-model="queryParams.lv">
                      <el-option label="大于等于0万元" value="0" key="0"></el-option>
                      <el-option label="大于等于50万元" value="50" key="50"></el-option>
                      <el-option label="大于等于100万元" value="100" key="100"></el-option>
                      <el-option label="大于等于200万元" value="200" key="200"></el-option>
                      <el-option label="大于等于300万元" value="300" key="300"></el-option>
                      <el-option label="大于等于500万元" value="500" key="500"></el-option>
                  </el-select>
              </el-form-item>
  
              <el-form-item>
                  <el-button type="primary" icon="Search"  @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh"  @click="resetQuery">重置</el-button>
              </el-form-item>
          </el-form>
          <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                  <el-button
                      type="primary"
                      plain
                      icon="Plus"
                      @click="showEffect()"
                  >查看存贷成效</el-button>
                  </el-col>
                  <el-col :span="1.5">
                  <el-button
                      type="warning"
                      plain
                      icon="Download"
                      @click="handleExport()"
                  >导出客户明细</el-button>
                  </el-col>
  
      </el-row>
          <el-table v-loading="loading" :data="dataList"  >
                  <el-table-column type="selection"  align="center" />
                  <el-table-column label="网点" width="100" align="center" prop="assessOrg" fixed>
                    <template #default="scope">
                        <dict-tag :options="sys_org_name" :value="scope.row.assessOrg"/>
                    </template>
                  </el-table-column>
                  <el-table-column label="客户号" width="200" align="center" prop="custId" :show-overflow-tooltip="true" fixed>
                      <template #default="scope">
                          <el-link type="primary" :underline="false" @click="open(scope.row)">{{ scope.row.custId }}</el-link>
                      </template>
                  </el-table-column>
                  <el-table-column label="客户姓名" width="180" align="center" prop="custName" :show-overflow-tooltip="true"  fixed/>
                  <el-table-column label="贷款余额(万元)" width="150"  align="center" prop="dkye"/>
                  <el-table-column label="贷款年日均(万元)" width="150"  align="center" prop="nrj"/>
                  <el-table-column label="存贷比(%)" width="100"  align="center" prop="cdb"/>
                  <el-table-column label="联系方式" width="120"  align="center" prop="tel"/>
                  <el-table-column label="是否小微企业" width="120" align="center" prop="xwqy"/>
                  <el-table-column label="最近一次走访时间" width="160" align="center" prop="recentlyDate"/>
                  <el-table-column label="地址"  align="addr" prop="addr"/>
                  <el-table-column label="客户经理" width="80" align="center" prop="managerId">
  
                  </el-table-column>
                  <el-table-column label="查看报告" min-width="150">
                  <template #default="scope">
                      <el-button link type="primary" icon="View" @click="getxybg(scope.row.custId,scope.row.custName,0)">原始</el-button>
                      <el-button link type="primary" icon="View" @click="getxybg(scope.row.custId,scope.row.custName,1)">分析</el-button>
                  </template>
              </el-table-column>
              </el-table>
  
              <pagination
                  v-show="total > 0"
                  :total="total"
                  v-model:page="queryParams.pageNum"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getList"
              />
              <!-- 借据对话框 -->
              <el-dialog title="客群成效" v-model="openVisit" width="900px" append-to-body>
                  <el-table v-loading="effectLoading" :data="effectList" >
  
                      <el-table-column label="指标名称"    align="center" prop="name" />
                      <el-table-column label="当期"   align="center" prop="bgq" />
                      <el-table-column label="上月末"   align="center" prop="perMonth" />
                      <el-table-column label="月增量"   align="center" prop="yzl" >
                          <template #default="scope">
                              {{ scope.row.yzl }}
                              <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                                  <use xlink:href="#icon-arrow-lv" v-if="(scope.row.yzl)<0"></use>
                                  <use xlink:href="#icon-arrow-red" v-if="(scope.row.yzl)>0"></use>
                              </svg>
                          </template>
                      </el-table-column>
                      <el-table-column label="上年末"   align="center" prop="lastYear" />
                      <el-table-column label="年增量"   align="center" prop="nzl" >
                          <template #default="scope">
                              {{ scope.row.nzl }}
                              <svg class="icon svg-icon myCard__svg" aria-hidden="true">
                                  <use xlink:href="#icon-arrow-lv" v-if="(scope.row.nzl)<0"></use>
                                  <use xlink:href="#icon-arrow-red" v-if="(scope.row.nzl)>0"></use>
                              </svg>
                          </template>
                      </el-table-column>
                  </el-table>
              </el-dialog>
          </div>
  </template>
  
  <script>
  import { getDgCustomerList, getLoanEffect, getComBcrInfo } from "@/api/szhl/data/DgCustomer";
  // 查询参数
  const data = reactive({
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      assessOrg: null,
      custName: null
    },
    // 表单参数
    form: {},
    // 表单校验
    rules: {
      workDate: [
        { required: true, message: "请选择数据日期", trigger: "blur" },
      ],
     // lv: [
     //   { required: true, message: "请选择贷款金额", trigger: "blur" },
    //  ]
    }
  
  })
  const { queryParams, form, rules } = toRefs(data);
  // 总条数
  const total = ref(0);
  // 表格数据
  const  dataList = ref([]);
  // 遮罩层
  const loading = ref(false);
  // 遮罩层
  const effectLoading = ref(false);
  // 成效数据
  const  effectList = ref([]);
  //是否打开遮罩层
  const openVisit = ref(false);
  const handleClickEffect = (proxy) => {
      const getList = () => {
          loading.value = true;
          getDgCustomerList(proxy.addDateRange(queryParams.value)).then(res => {
              dataList.value = res.rows;
              total.value = res.total;
              loading.value = false;
          });
  
      }
      //查询
      const handleQuery = ()=>{
        proxy.$refs["queryForm"].validate(valid => {
              if (valid) {
                queryParams.value.pageNum = 1;
                getList();
             }
          })
      }
      //重置
      const resetQuery = ()=>{
          proxy.resetForm("queryForm");
      }
      const open = (row) => {
              proxy.$router.push({path: "/dg-customer/info/",query: { custIsn: row.custIsn, custId: row.custId,frnm: row.frCustIsn, workDate:queryParams.value.workDate}});
          }
      //查看成效
      const showEffect = ()=>{
          proxy.$refs["queryForm"].validate(valid => {
              if (valid) {
                  effectLoading.value = true;
                  openVisit.value = true;
                  getLoanEffect(proxy.addDateRange(queryParams.value)).then(res => {
                      effectList.value = res.data;
                      effectLoading.value = false;
                  });
             }
          })
      }
  
  
      //导出
      const handleExport = ()=>{
        proxy.download("DgCustomer/export", {
          ...queryParams.value,
        },`客群明细数据_${new Date().getTime()}.xlsx`);
      }
      const getxybg = (custId,custName,lx)=>{
          getComBcrInfo(custId).then(res => {
              if(res.data != null && res.data != undefined){
                  if(lx===0){
                      openPdf(res.data.filePath,res.data.fileName,res.data.unSccode,custName);
                  }else if(lx===1){
                      toReportDetail(res.data.fileNm)
                  }
              }else {
                  proxy.$modal.alert("未找到企业信用报告");
              }
  
  
          });
      }
  
      /** 查看原始信用报告 */
      const openPdf=(filePath,fileName,unSccode,name)=>{
          let formData1 = new FormData();
          formData1.append("module","企业信用")
          formData1.append("operContent","查看原始报告")
          formData1.append("remark1",fileName)
          formData1.append("idNo",unSccode)
          formData1.append("custName",name)
          //operateLog(formData1)
          let url = filePath.substring(12);
          let host = window.location.hostname;
          let baseUrl = "http://"+host+":8088/file/view/"+url;
          if(process.env.NODE_ENV === "production"){
              baseUrl = "http://"+host+":8088/prod-api/file/view/" + url;
          }else{
              baseUrl = "http://"+host+":8088/file/view/"+url;
          }
  
          window.open(baseUrl,"_blank")
          }
      const toReportDetail=(fileNm)=> {
          proxy.$router.push({ path: "/credit/detail",query:{"fileNm":fileNm} });
      }
      return { getList, handleQuery, resetQuery, open, showEffect, handleExport,getxybg }
  }
  
  export default {
      setup(){
          //获取代理对象
          const { proxy } = getCurrentInstance();
           //报表类型数据字典
          const { sys_org_name } = proxy.useDict("sys_org_name");
          const { getList, handleQuery, resetQuery, open, showEffect, handleExport, getxybg } = handleClickEffect(proxy);
  
          return { queryParams, form, rules, total, loading, sys_org_name, dataList, getList, handleQuery, resetQuery, open, effectLoading, effectList, openVisit, showEffect, handleExport, getxybg }
      }
  }
  </script>
  
  <style>
  
  </style>
