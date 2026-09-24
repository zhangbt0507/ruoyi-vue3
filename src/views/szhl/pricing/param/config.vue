<template>
  <div class="app-container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="利率表设置" name="rateTable">
        <rate-table v-if="activeName === 'rateTable'" />
      </el-tab-pane>
      <el-tab-pane label="一级参数" name="firstParam">
        <param-dict v-if="activeName === 'firstParam'" />
      </el-tab-pane>
      <el-tab-pane label="二级参数" name="secondParam">
        <second-param v-if="activeName === 'secondParam'" />
      </el-tab-pane>
      <el-tab-pane label="产品利率参数" name="productParam">
        <product-param v-if="activeName === 'productParam'" />
      </el-tab-pane>
      <el-tab-pane label="行权限参数" name="bankPowerParam">
        <bank-power-param v-if="activeName === 'bankPowerParam'" />
      </el-tab-pane>
      <el-tab-pane label="定价分成参数" name="pricingShareParam">
        <pricing-share-param v-if="activeName === 'pricingShareParam'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import RateTable from './RateTable.vue'
import ParamDict from './ParamDict.vue'
import SecondParam from './SecondParam.vue'
import ProductParam from './ProductParam.vue'
import BankPowerParam from './BankPowerParam.vue'
import PricingShareParam from './PricingShareParam.vue'

export default {
  name: 'RateConfig',
  components: {
    RateTable,
    ParamDict,
    SecondParam,
    ProductParam,
    BankPowerParam,
    PricingShareParam
  },
  data() {
    return {
      activeName: 'rateTable'
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #fff;
}

.rate-tabs {
  margin-bottom: 20px;
}
</style>


