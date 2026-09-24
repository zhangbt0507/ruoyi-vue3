<template>
  <div>
    <el-divider content-position="left">基本信息</el-divider>
    
    <el-form :model="submitData" label-width="120px" class="rate-form" ref="formRef" :rules="rules">
      <!-- 基础信息 -->
      <el-form-item label="定价日期" prop="priceDate">
        <el-date-picker
          v-model="submitData.priceDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 90%"
          disabled
        />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType" :required="true">
        <el-input v-model="submitData.customerType" placeholder="客户类型" style="width: 90%" disabled />
      </el-form-item>
      <el-form-item label="客户号" prop="customerNo" :required="true">
        <el-input v-model="submitData.customerNo" placeholder="请输入客户号" style="width: 90%" disabled />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName" :required="true">
        <el-input v-model="submitData.customerName" placeholder="请输入客户名称" style="width: 90%" disabled />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'BasicInfo',
  props: {
    submitData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      rules: {
        priceDate: [
          { required: true, message: '定价日期不能为空', trigger: 'blur' }
        ],
        customerType: [
          { required: true, message: '客户类型不能为空', trigger: 'blur' }
        ],
        customerNo: [
          { required: true, message: '客户号不能为空', trigger: 'blur' }
        ],
        customerName: [
          { required: true, message: '客户名称不能为空', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    validate() {
      return this.$refs.formRef.validate ? this.$refs.formRef.validate() : Promise.resolve(true);
    }
  }
}
</script>

<style lang="scss" scoped>
.rate-form {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  align-items: center;
}

@media (max-width: 1400px) {
  .rate-form {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .rate-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .rate-form {
    grid-template-columns: 1fr;
  }
}

.el-divider {
  margin: 10px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
}
</style> 