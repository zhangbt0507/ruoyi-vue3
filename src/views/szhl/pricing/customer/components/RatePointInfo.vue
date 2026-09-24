<template>
  <div>
    <el-divider content-position="left">利率加点信息</el-divider>
    <el-card class="pricing-card">
      <div class="bp-display">
        <span class="bp-label">LPR值：</span>
        <span class="bp-value">{{rateBaseParam.lprValue || 0}}%</span>
        <span class="bp-label" style="margin-left: 20px;">最低限值：</span>
        <span class="bp-value">{{rateBaseParam.minRate || 0}}%</span>
        <span class="bp-label" style="margin-left: 20px;">基础加点BP：</span>
        <span class="bp-value">{{rateBaseParam.basePoint || 0}}</span>
      </div>
      
      <!-- 总BP值显示 -->
      <div class="total-bp">
        <span class="total-bp-label">总BP值：</span>
        <span class="total-bp-value">{{totalBp}}</span>
        
        <span class="final-rate">
          <span class="final-rate-label">最终利率：</span>
          <span class="final-rate-value">{{finalRate}}%</span>
          <span class="rate-formula">({{rateBaseParam.lprValue || 0}}% + {{totalBp/100}}%)</span>
        </span>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'RatePointInfo',
  props: {
    rateBaseParam: {
      type: Object,
      required: true
    },
    totalBp: {
      type: [String, Number],
      required: true
    },
    finalRate: {
      type: [String, Number],
      required: true
    },
    productRateLimit: {
      type: Object,
      default: () => ({
        minRate: null,
        maxRate: null,
        fixedRate: null,
        fixedPoint: null,
        minBp: null,
        maxBp: null,
        isFixed: false
      })
    },
    productBp: {
      type: [String, Number],
      default: 0
    },
    protocolBp: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      localProductBp: 0
    }
  },
  watch: {
    productBp: {
      immediate: true,
      handler(val) {
        this.localProductBp = parseFloat(val) || 0;
      }
    }
  },
  methods: {
    handleBpValueChange(value) {
      this.$emit('update:productBp', value);
    }
  }
}
</script>

<style lang="scss" scoped>
.pricing-card {
  margin-top: 20px;
}

/* BP值显示样式 */
.bp-display {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.bp-label, .total-bp-label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.bp-value, .total-bp-value {
  font-size: 16px;
  color: #409EFF;
}

.total-bp {
  margin-top: 20px;
  padding: 15px;
  background-color: #ecf5ff;
  border-radius: 4px;
  text-align: right;
}

.total-bp-value {
  font-size: 18px;
  font-weight: bold;
}

.final-rate {
  margin-left: 20px;
  display: inline-flex;
  align-items: center;
}

.final-rate-label {
  color: #606266;
  font-weight: bold;
  margin-right: 5px;
}

.final-rate-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.rate-formula {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

/* 手动输入BP值的样式 */
.manual-bp-input {
  margin-top: 10px;
  margin-right: 20px;
  display: inline-block;
}

.bp-input-label {
  margin-right: 10px;
}
</style> 