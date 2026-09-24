<template>
  <el-dialog
    :title="title"
    v-model="open"
    width="700px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form :model="form" :rules="rules" ref="recordRef" label-width="90px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户号:">
            {{ form.cuidcsid }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户名称:">
            {{ form.cunaflnm }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="触达日期:" prop="interactiveDate">
            <el-date-picker v-model="form.interactiveDate" placeholder="选择日期" type="date" value-format="YYYY-MM-DD" disabled>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话:" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="触达方式:" prop="interactiveType">
            <el-select v-model="form.interactiveType" placeholder="请选择触达方式">
              <el-option
                v-for="item in market_contract_interactive_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="触达主题:" prop="interactiveSubject">
            <el-select v-model="form.interactiveSubject" placeholder="请选择触达主题" disabled>
              <el-option
                v-for="item in market_contract_interactive_subject"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.prevResult != null">
        <el-col :span="24">
          <el-form-item label="最近触达:" prop="prevResult">
            <el-input type="textarea" :rows="2" v-model="form.prevResult" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="处理结果:" prop="result">
            <el-select v-model="form.result" placeholder="请选择处理结果" @change="hanldChange">
              <el-option
                v-for="item in loan_reduce_result"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="补充说明:"
            prop="remark"
            :rules="remakRules === '' ? [{ required: false }] : remakRules"
          >
            <el-input type="textarea" :rows="2" v-model="form.remark" placeholder="请输入补充说明" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getCurrentInstance } from 'vue'
import { addRecord } from '@/api/szhl/market/swallow'

export default {
  name: 'SwallowRecord',
  emits: ['submit'],
  data () {
    return {
      title: '归雁处理',
      open: false,
      form: {},
      rules: {
        interactiveType: [{ required: true, message: '请选择触达方式', trigger: 'blur' }],
        interactiveSubject: [{ required: true, message: '请选择触达主题', trigger: 'blur' }],
        result: [{ required: true, message: '请选择处理结果', trigger: 'blur' }],
        phone: [{ required: true, pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
      },
      remakRules: '',
      loan_reduce_result: [],
      market_contract_interactive_type: [],
      market_contract_interactive_subject: []
    }
  },
  created () {
    const { proxy } = getCurrentInstance()
    const dicts = proxy.useDict('loan_reduce_result', 'market_contract_interactive_type', 'market_contract_interactive_subject')
    this.loan_reduce_result = dicts.loan_reduce_result
    this.market_contract_interactive_type = dicts.market_contract_interactive_type
    this.market_contract_interactive_subject = dicts.market_contract_interactive_subject
  },
  methods: {
    openDialog (detail, row) {
      this.reset()
      this.form = { ...detail }
      this.form.cuidcsid = row.cuidcsid
      this.form.cunaflnm = row.cunaflnm
      this.form.phone = row.phone
      this.form.parentId = row.uuid
      this.form.result = '';
      this.form.remark = '';
      // 默认设置触达主题为"归燕客群网格"（字典值10）
      this.form.interactiveSubject = '10'
      // 默认设置触达日期为今天
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      this.form.interactiveDate = `${year}-${month}-${day}`
      this.title = '归雁处理'
      this.open = true
      // 如果父组件已经传入了 prevResult，直接使用，不再重复调用接口
      // prevRecordByCustId 已在父组件 handleEdit 中调用
    },
    hanldChange (v) {
      if (v === '1') {
        this.remakRules = [{ required: true, message: '填写他行利率水平', trigger: 'blur' }]
      } else if (v === '2') {
        this.remakRules = [{ required: true, message: '填写更换的主体或网点', trigger: 'blur' }]
      } else if (v === '5') {
        this.remakRules = [{ required: true, message: '填写退出原因', trigger: 'blur' }]
      } else if (v === '6') {
        this.remakRules = [{ required: true, message: '填写其他原因', trigger: 'blur' }]
      } else {
        this.remakRules = [{ required: true }]
      }
    },
    submitForm () {
      this.$refs.recordRef.validate(valid => {
        if (!valid) return
        // 先保存交互记录，再由父组件更新归燕记录
        debugger
        const recordPayload = {
          // 这里 parentId 先沿用列表行传入的 uuid，如果后端使用其他主键字段，可再调整
          parentId: this.form.parentId,
          custId: this.form.cuidcsid,
          custName: this.form.cunaflnm,
          tel: this.form.phone,
          interactiveType: this.form.interactiveType,
          interactiveSubject: this.form.interactiveSubject,
          result: this.form.result,
          remark: this.form.remark,
          interactiveDate: this.form.interactiveDate
        }
        addRecord(recordPayload).then(() => {
          this.$emit('submit')
          this.open = false
        })
      })
    },
    cancel () {
      this.reset()
      this.open = false
    },
    reset () {
      this.form = {}
      this.remakRules = ''
      this.$refs.recordRef && this.$refs.recordRef.resetFields && this.$refs.recordRef.resetFields()
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
