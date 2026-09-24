<template>
    <div class="login">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <h3 class="title">征信查询用户关联设置</h3>
        
        <el-form-item prop="loginName" label = "征信查询用户">
          <el-input
            v-model="loginForm.loginName"
            type="text"
            size="large"
            disabled="true"
            auto-complete="off"
            placeholder="账号"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="wc" label = "征信查询密码">
          <el-input
            v-model="loginForm.wc"
            type="password"
            show-password
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item style="width:100%;">
          <el-button
            :loading="loading"
            size="large"
            type="primary"
            style="width:100%;"
            @click.prevent="creditUserManageMethod"
          >
            <span v-if="!loading">保存</span>
            <span v-else>保存中...</span>
          </el-button>
          <!-- <div style="float: right;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div> -->
        </el-form-item>
      </el-form>
      <!--  底部  -->
      <div class="el-login-footer">
        <span>Copyright © 2018-2023 ruoyi.vip All Rights Reserved.</span>
      </div>
    </div>
  </template>
  
<script>
export default{
    name:'userManageComponent',
}
</script>
  <script setup>
  import { getUserProfile } from "@/api/system/user";
  import { queryCreditUser,creditUserManage } from "@/api/szhl/credit/CreditUser";
  
  const route = useRoute();
  const { proxy } = getCurrentInstance();
  
  const loginForm = reactive({
    //当前系统登录用户名
    userName:'',
    //征信登录用户名
    loginName:'',
    //征信登录密码
    wc:'',
    flag: "0",
  });

  //获取当前登录人
  getUserProfile().then(res => {
    let username = res.data.userName;
    loginForm.userName = username;
    queryCreditUserInfo(username);
    // roleSelect.value = res.data.roles[0]?.roleKey;
  });

  /** 查询征信报告列表 */
function queryCreditUserInfo(username) {
  loading.value = true;
  queryCreditUser({userName:username}).then(response => {
    loginForm.loginName = response.data == null ?  username : response.data.loginName;
    loginForm.wc = response.data == null ?  "" : response.data.wc;
    loading.value = false;
  });
}

function creditUserManageMethod(){
    proxy.$refs["loginRef"].validate(valid => {
        if(valid){
            creditUserManage(loginForm).then(response => {
                if(response.code == '200'){
                    proxy.$modal.msgSuccess("保存成功");
                }
            });
        }
    })
    
    
}
  
  const loginRules = {
    loginName: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
    passWord: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  };
  
  const codeUrl = ref("");
  const loading = ref(false);
  // 验证码开关
  const captchaEnabled = ref(true);
  // 注册开关
  const register = ref(false);
  const redirect = ref(undefined);
  
  watch(route, (newRoute) => {
      redirect.value = newRoute.query && newRoute.query.redirect;
  }, { immediate: true });
  
  function handleLogin() {
    proxy.$refs.loginRef.validate(valid => {
      if (valid) {
        loading.value = true;
      }
    });
  }
  </script>
  
  <style lang='scss' scoped>
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    // background-image: url("../assets/images/login-background.jpg");
    background-size: cover;
  }
  .title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #707070;
  }
  
  .login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 400px;
    padding: 25px 25px 5px 25px;
    .el-input {
      height: 40px;
      input {
        height: 40px;
      }
    }
    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 0px;
    }
  }
  .login-tip {
    font-size: 13px;
    text-align: center;
    color: #bfbfbf;
  }
  .login-code {
    width: 33%;
    height: 40px;
    float: right;
    img {
      cursor: pointer;
      vertical-align: middle;
    }
  }
  .el-login-footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
  }
  .login-code-img {
    height: 40px;
    padding-left: 12px;
  }
  </style>
  