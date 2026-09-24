<template>
    <div>
  <el-card>
    <div class="header">
        <el-form :model="queryParams" ref="queryForm"  :rules="rules"  >
            <el-form-item label="数据日期" prop="workDate" >
            <el-date-picker
                v-model="queryParams.workDate"
                type="date"
                placeholder="请选择日期"
                :disabled-date="disabledFun"
                value-format="YYYYMMDD"
            ></el-date-picker>
        </el-form-item>
        <el-form-item label="考核机构" prop="org" >
            <el-select v-model="queryParams.org"  placeholder="请选择机构" >
                <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                <span style="float:left">{{item.deptName}}</span>
                <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                </el-option>
            </el-select>
        </el-form-item>
        <div class="header_item">
            <el-button type="primary" @click="getList('deposit')" v-if="menuId==='deposit'">存款数据获取</el-button>
            <el-button type="primary" @click="getList('loan')" v-if="menuId==='loan'">贷款数据获取</el-button>
        </div>
    </el-form>
    </div>
  </el-card>
  <el-divider  style="margin:5px 0"/>
  <el-card>
    <DepositTool :data = data v-if="menuId==='deposit'"/>
    <LoanTool :data = loanData v-if="menuId==='loan'"/>
  </el-card>
</div>
</template>

<script>
import { listDeptAssess } from "@/api/system/dept";
import { getPredCirList, getLoanPredCirList } from "@/api/szhl/data/PredCirCal";
import DepositTool from './DepositTool.vue';
import LoanTool from './LoanTool.vue';
const workDate = ref();
const orgs = ref();
const org = ref();
const data = ref([]);
const loanData = ref([]);
const menuId = ref();
const from = reactive({
    queryParams: {
        workDate: null,
        org: null
    },
    rules: {
    workDate: [
      { required: true, message: "请选择数据日期", trigger: "blur" },
    ]
    ,
    org: [
      { required: true, message: "请选择查询网点", trigger: "blur" },
    ]
  }
})
const {  queryParams, rules } = toRefs(from);
const initEffect = ()=> {
    //获取部门
    const getDept = () => {
      listDeptAssess().then(res => {
        orgs.value = res.data;
        org.value = res.data[0]?.code;
        });
    }
    //禁用日期
    const disabledFun = (time) => {
        let dateObj = new Date();
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 2)) || time.getTime()<new Date('2023-12-31');
    }

    
    
    return { getDept, disabledFun }
}

const handleClickEvent = (proxy)=> {
    //获取
    const getList = (lx) => {
            proxy.$refs["queryForm"].validate(valid => {
                if (valid && lx === 'deposit') {
                    getPredCirList(queryParams.value.workDate,queryParams.value.org).then(res => {
                        data.value = res.data;
                    });
                }else if(valid && lx === 'loan'){
                    getLoanPredCirList(queryParams.value.workDate,queryParams.value.org).then(res => {
                        loanData.value = res.data;
                    });
                }
            })
    }

    return { getList }
}

export default {
    components: { DepositTool, LoanTool },
    setup() {
        const { proxy } = getCurrentInstance();
        const { sys_org_name } = proxy.useDict("sys_org_name");
        const { getDept, disabledFun } = initEffect();
        const { getList } = handleClickEvent(proxy);
        getDept();
        menuId.value = proxy.$route.query.id;
        return { sys_org_name, menuId, workDate, orgs, org, data, loanData, rules, queryParams, disabledFun, getList }
    }
}
</script>

<style scoped lang="scss">
.header{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    &_item{
        margin-top: 5px;
    }
}

</style>