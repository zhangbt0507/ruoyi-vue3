<template>
  <el-dialog title="触达登记" v-model="visible" width="680px" append-to-body
             :close-on-click-modal="false" @closed="reset">
    <div class="cr-customer">
      <div class="cr-customer__bar"></div>
      <div class="cr-customer__info">
        <div class="cr-customer__name">{{ customerName }}</div>
        <div v-if="ctx.phone" class="cr-customer__phone">
          <el-icon><Cellphone /></el-icon>{{ ctx.phone }}
        </div>
      </div>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="涉及客群/产品">
        <el-checkbox-group v-model="form.groupIds">
          <el-checkbox v-for="g in groups" :key="g.groupId" :label="g.groupId">
            {{ g.groupName }}<span v-if="g.targetBusiness"> · {{ g.targetBusiness }}</span>
          </el-checkbox>
        </el-checkbox-group>
        <span v-if="!groups.length" class="cr-empty">该客户暂不属于任何有效客群，将登记为客户级触达</span>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="触达方式" prop="contactWay">
            <el-select v-model="form.contactWay" style="width: 100%">
              <el-option v-for="d in contactWayOptions" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="触达结果" prop="contactResult">
            <el-select v-model="form.contactResult" style="width: 100%">
              <el-option v-for="d in contactResultOptions" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="客户态度" prop="customerAttitude">
            <el-select v-model="form.customerAttitude" style="width: 100%">
              <el-option v-for="d in attitudeOptions" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否需跟踪">
            <el-radio-group v-model="form.needFollowup">
              <el-radio label="0">否</el-radio>
              <el-radio label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="form.needFollowup === '1'" label="跟踪事项" prop="followupItem">
        <el-input v-model="form.followupItem" placeholder="请填写需要跟踪的事项" />
      </el-form-item>
      <el-form-item label="补充说明">
        <el-input v-model="form.supplement" type="textarea" :rows="2" placeholder="选填" />
      </el-form-item>
      <el-form-item v-if="form.groupIds.length" label="分产品反馈">
        <div class="cr-feedback">
          <div class="cr-feedback__head">
            <span class="cr-feedback__col cr-feedback__col--group">客群</span>
            <span class="cr-feedback__col cr-feedback__col--biz">产品</span>
            <span class="cr-feedback__col cr-feedback__col--intent">意向</span>
          </div>
          <div v-for="gid in form.groupIds" :key="gid" class="cr-feedback__row">
            <span class="cr-feedback__col cr-feedback__col--group">{{ groupName(gid) }}</span>
            <span class="cr-feedback__col cr-feedback__col--biz">{{ groupBusiness(gid) || '-' }}</span>
            <div class="cr-feedback__col cr-feedback__col--intent">
              <el-select v-model="feedback[gid]" clearable placeholder="请选择意向（选填）" style="width: 100%">
                <el-option v-for="d in productFeedbackOptions" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="ContactRecordDialog">
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { addContactRecord, customerGroups } from '@/api/szhl/crm/contactRecord'

const { proxy } = getCurrentInstance()
const {
  crm_contact_way: contactWayOptions,
  crm_contact_result: contactResultOptions,
  crm_customer_attitude: attitudeOptions,
  crm_product_feedback: productFeedbackOptions
} = proxy.useDict('crm_contact_way', 'crm_contact_result', 'crm_customer_attitude', 'crm_product_feedback')

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const groups = ref([])
const feedback = reactive({})
const customerName = ref('')
const ctx = reactive({ customerId: '', phone: '' })
const form = reactive({
  contactWay: '1', contactResult: '1', customerAttitude: '2',
  needFollowup: '0', followupItem: '', supplement: '', groupIds: []
})

const rules = computed(() => ({
  contactWay: [{ required: true, message: '请选择触达方式', trigger: 'change' }],
  contactResult: [{ required: true, message: '请选择触达结果', trigger: 'change' }],
  customerAttitude: [{ required: true, message: '请选择客户态度', trigger: 'change' }],
  followupItem: form.needFollowup === '1'
    ? [{ required: true, message: '请填写跟踪事项', trigger: 'blur' }]
    : []
}))

function groupName(gid) {
  const g = groups.value.find(x => x.groupId === gid)
  return g ? g.groupName : gid
}

function groupBusiness(gid) {
  const g = groups.value.find(x => x.groupId === gid)
  return g ? g.targetBusiness : ''
}

function reset() {
  loading.value = false
  groups.value = []
  Object.keys(feedback).forEach(k => delete feedback[k])
  Object.assign(form, {
    contactWay: '1', contactResult: '1', customerAttitude: '2',
    needFollowup: '0', followupItem: '', supplement: '', groupIds: []
  })
  formRef.value?.clearValidate()
}

// row: { customerId, customerName, contactPhone, groupId? , groupIds? }
function open(row) {
  reset()
  ctx.customerId = row.customerId
  ctx.phone = row.contactPhone || row.phone || ''
  customerName.value = row.customerName
  visible.value = true
  const preselect = Array.isArray(row.groupIds) ? row.groupIds : (row.groupId ? [row.groupId] : [])
  customerGroups(row.customerId).then(res => {
    groups.value = res.data || []
    form.groupIds = preselect.filter(gid => groups.value.some(g => g.groupId === gid))
  })
}

function submit() {
  formRef.value.validate(valid => {
    if (!valid) return
    loading.value = true
    const products = form.groupIds.map(gid => {
      const g = groups.value.find(x => x.groupId === gid)
      return { groupId: gid, targetBusiness: g ? g.targetBusiness : undefined, productFeedback: feedback[gid] || undefined }
    })
    addContactRecord({
      customerId: ctx.customerId,
      customerName: customerName.value,
      phone: ctx.phone,
      contactDate: proxy.parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
      contactWay: form.contactWay,
      contactResult: form.contactResult,
      customerAttitude: form.customerAttitude,
      supplement: form.supplement,
      needFollowup: form.needFollowup,
      followupItem: form.needFollowup === '1' ? form.followupItem : '',
      products
    }).then(() => {
      proxy.$modal.msgSuccess('触达登记已保存')
      visible.value = false
      emit('success')
    }).finally(() => {
      loading.value = false
    })
  })
}

defineExpose({ open })
</script>

<style scoped>
.cr-customer {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 18px;
  background: #f5f7fa;
  border-radius: 8px;
}
.cr-customer__bar {
  width: 3px;
  height: 34px;
  margin-right: 12px;
  background: var(--el-color-primary);
  border-radius: 2px;
}
.cr-customer__name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}
.cr-customer__phone {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 13px;
  color: #909399;
}
.cr-empty { color: #909399; font-size: 12px; }
.cr-feedback { width: 100%; }
.cr-feedback__head,
.cr-feedback__row {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr 170px;
  align-items: center;
  gap: 12px;
}
.cr-feedback__head {
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
  color: #909399;
  font-size: 12px;
}
.cr-feedback__row { margin-top: 8px; }
.cr-feedback__col--group,
.cr-feedback__col--biz {
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
