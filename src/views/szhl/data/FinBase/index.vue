<template>
    <div class="app-container">
        <el-tabs type="border-card">
            
            <el-tab-pane label="非同业客户信息">
                <FinBaseCustomer />

            </el-tab-pane>
            <el-tab-pane label="存量单位贷款">
                <FinLoan />
            </el-tab-pane>
            <el-tab-pane label="单位贷款发生额信息">
                <FinIncurred />
            </el-tab-pane>
        </el-tabs>
        </div>
     
</template>
<script>
import FinBaseCustomer from './FinBaseCustomer.vue';
import FinLoan from './FinLoan.vue';
import FinIncurred from './FinIncurred.vue';
export default {
    components: {FinBaseCustomer, FinLoan, FinIncurred},
    setup() {
         //获取代理对象
         const { proxy } = getCurrentInstance();
         

         return { }
    }
}
</script>


