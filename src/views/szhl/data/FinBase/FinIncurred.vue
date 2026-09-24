<template>
  <el-card>
    
  </el-card>

    
</template>

<script>
const open=ref(false);
// 查询参数
const data = reactive({
  // 表单参数
  form: {},

  rules: {
    period: [
      { required: true, message: "报送月份必填", trigger: "blur" }
    ]
  }
})
const { form, rules } = toRefs(data);
export default {
    name:'FinIncurred',
    setup() {
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const handleExport = ()=>{
            open.value = true;
        }
        const exportEvent = ()=>{
            proxy.$refs["ref"].validate(valid => {
            if (valid) {
                proxy.download("fin-loan/export?period="+form.value.period, {},`存量单位贷款_${new Date().getTime()}.xlsx`, {appCode: 'performance'});
              }
        }) 
            
         };
        return { handleExport, open, form, rules, exportEvent }
    }
}
</script>

<style>

</style>