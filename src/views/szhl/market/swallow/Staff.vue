<template>
  <el-dialog
    :title="title"
    v-model="open"
    width="700px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form :model="form" :rules="rules" ref="staffRef" label-width="90px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户号:" prop="cuidcsid">
            {{ form.cuidcsid }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户名称:" prop="cunaflnm">
            {{ form.cunaflnm }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="原责任人:" prop="userName">
            <dict-tag :options="sys_user_name" :value="form.userName"></dict-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="原机构号:" prop="zrrjg">
            <dict-tag :options="sys_org_name" :value="form.zrrjg"></dict-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="新责任人:" prop="staffNoNew">
            <select-user v-model="form.staffNoNew" @deptName="getDetpName" @deptId="getDeptId" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="新机构号:" prop="zrrjgNew">
            {{ deptName }}
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm(form)" :disabled="disabled">
          确 定
        </el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { updateReturnSwallowZrr } from '@/api/szhl/market/swallow'
import selectUser from '../../common/selectUser.vue'
import useUserStore from '@/store/modules/user'

const disabled = ref(false)
const open = ref(false)
const deptName = ref('')
const deptId = ref('')

const initEffect = proxy => {
  const title = ref('修改责任人')
  const recordData = reactive({
    form: {},
    rules: {
      staffNoNew: [{ required: true, message: '请选择责任人', trigger: 'blur' }]
    }
  })

  const { form, rules } = toRefs(recordData)

  const openStaffDialog = row => {
    reset()
    form.value = { ...row }
    // 打开弹窗时清空新责任人
    form.value.staffNoNew = ''
    deptName.value = ''
    deptId.value = ''
    open.value = true
  }

  /** 重置操作表单 */
  const reset = () => {
    form.value = {}
    disabled.value = false
    proxy.resetForm && proxy.resetForm('staffRef')
  }

  // 回调获取责任人网点名称
  const getDetpName = val => {
    deptName.value = val
  }

  // 回调获取责任人机构号
  const getDeptId = val => {
    deptId.value = val
  }

  return { title, open, form, rules, openStaffDialog, getDetpName, getDeptId, deptName, deptId }
}

const handleClickEffect = proxy => {
  const submitForm = form => {
    proxy.$refs.staffRef.validate(valid => {
      if (!valid) return
      disabled.value = true
      // 将责任人字段更新为新选择的用户
      form.userName = form.staffNoNew
      // 将机构号更新为新选择的机构号
      form.zrrjg = deptId.value
      // 获取当前登录用户的角色
      const userStore = useUserStore()
      if (userStore.roles.includes('pricing_param')) {
        form.isSameOrg = 0
      } else {
        form.isSameOrg = 1
      }
      updateReturnSwallowZrr(form).then(() => {
        proxy.$modal.msgSuccess('归燕责任人已修改')
        open.value = false
        disabled.value = false
        proxy.$emit('updated')
      }).catch(() => {
        disabled.value = false
      })
    })
  }

  const cancel = () => {
    open.value = false
  }

  return { disabled, submitForm, cancel }
}

export default {
  name: 'SwallowStaff',
  components: { selectUser },
  emits: ['updated'],
  setup() {
    const { proxy } = getCurrentInstance()
    // 数据字典
    const { sys_user_name, sys_org_name } = proxy.useDict('sys_user_name', 'sys_org_name')
    // 页面初始化
    const { title, open, form, rules, openStaffDialog, getDetpName, getDeptId, deptName, deptId } = initEffect(proxy)
    // 按钮点击事件
    const { disabled, submitForm, cancel } = handleClickEffect(proxy)

    return {
      title,
      open,
      form,
      rules,
      openStaffDialog,
      getDetpName,
      getDeptId,
      deptName,
      deptId,
      sys_user_name,
      sys_org_name,
      disabled,
      submitForm,
      cancel
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>


