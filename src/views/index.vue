<template>
  <div class="app-container home " v-if="roleSelect === 'admin' || roleSelect === 'manager' || roleSelect == 'leader' || roleSelect == 'head_office' || roleSelect == 'president' || roleSelect == 'assistant' || roleSelect == 'commander'">
    <el-card>
      <div class="header_left">欢迎你，{{user.deptName}} {{user.nickName}}</div>
      <div class="header_right" >
        <div  v-show="roleSelect !== 'manager'" class="header_context">
            机构：<el-select v-model="org"  placeholder="请选择机构" size="small" style="margin-top:-5px">
                  <el-option v-for="item in orgs" :key="item.code" :label="item.deptName" :value="item.code">
                    <span style="float:left">{{item.deptName}}</span>
                    <span style="float:right;color:var(--el-text-color-secondary);font-size=13px">{{item.code}}</span>
                  </el-option>
                </el-select>
          </div>
          <div class="header_context">
            角色：<el-select v-model="roleSelect"  placeholder="请选择角色" size="small" style="margin-top:-5px">
                  <el-option v-for="role in user.roles" :key="role.roleKey" :label="role.roleName" :value="role.roleKey">
                    
                  </el-option>
                </el-select>
          </div>
          
          <div >
            业绩日期：<el-date-picker v-model="workDate" placeholder="选择日期"  :disabled-date="disabledFun" size="small" value-format="YYYYMMDD"  style="width:140px;margin-top:-5px"></el-date-picker>
          </div>
      </div>
      </el-card>
      <el-divider  style="margin:5px 0"/>
    <MarketHome :workDate="workDate" :org="org" v-if="roleSelect === 'manager'"/>
    <ManagerHome :workDate="workDate" :org="org" 
    v-else-if="roleSelect === 'admin' || roleSelect == 'leader' || roleSelect == 'head_office' || roleSelect == 'president' || roleSelect == 'assistant' || roleSelect == 'commander'"/>
    <ImgHome v-else/>
  </div>
   <ImgHome v-else/>
  
</template>

<script name="Index" >
import MarketHome from './szhl/market/MarketHome';
import ManagerHome from './szhl/home/ManagerHome';
import ImgHome from './szhl/home/ImgHome';
import { listDeptAssess } from "@/api/system/dept";
import { getUserProfile } from "@/api/system/user";
import { getAssessDate } from "@/api/szhl/agency/assess";
import { getEtlDateDiff, getEtlDate } from "@/api/szhl/agency/sumDepositAndLoan";
const roleSelect = ref('');
const workDate = ref('');
const orgs = ref();
const org = ref();
const user = reactive({
      nickName:'',
      deptName:'',
      roles:[]
  });
const initEffect = ()=> {
   
    const getDate = ()=>{
      getEtlDateDiff().then(res => {
            
            workDate.value = res.data;
        });
    }
    //禁用日期
    const disabledFun = (time) => {
        let dateObj = new Date();
        return time.getTime() > new Date(dateObj.setDate(dateObj.getDate() - 1)) || time.getTime()<new Date('2023-12-31');
    }
    //获取部门
    const getDept = () => {
      listDeptAssess().then(res => {
        orgs.value = res.data;
        org.value = res.data[0]?.code;
    });
    }
    
    //获取当前登录人
    const getUser = () => {
      getUserProfile().then(res => {
        user.nickName = res.data.nickName;
        user.deptName = res.data.dept?.deptName;
        user.roles = res.data.roles;
        roleSelect.value = res.data.roles[0]?.roleKey;
        localStorage.setItem('userName', res.data.userName);
        localStorage.setItem('deptId', res.data.dept.deptId);
  });
    }
    
    return { roleSelect, user, org, orgs, workDate, disabledFun, getDate, getDept, getUser }
}
export default {
    components: { MarketHome, ManagerHome, ImgHome },
    setup(){
      const { proxy } = getCurrentInstance();
      const { sys_org_name } = proxy.useDict("sys_org_name");
      const { roleSelect, user, org, orgs, workDate, disabledFun, getDate, getDept, getUser  } = initEffect();
      if(workDate.value == ""){
        getDate();
        getDept();
        getUser();
      }
      return { user, org, orgs, workDate, disabledFun, sys_org_name, roleSelect, getDate, getDept, getUser  }
    }
}
</script>
<style scoped lang="scss">
.header{
    white-space: nowrap;
    &_left{
        display: inline-block;
    }
    &_right{
        // margin-bottom: 5px;
        display: inline-flex;
        text-align: right;
        float: right;
    }
    &_context{
      margin-right: 8px;
    }
}
</style>
