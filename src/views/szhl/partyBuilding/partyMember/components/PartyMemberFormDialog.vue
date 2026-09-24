<template>
  <el-dialog :model-value="visible" :title="title" width="760px" append-to-body destroy-on-close
    @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <template v-if="isAddMode">
        <el-form-item label="选择用户" prop="gyh">
          <el-select v-model="form.gyh" placeholder="请选择用户" filterable style="width: 100%"
            :loading="userLoading" @change="handleUserChange">
            <el-option v-for="item in userOptions" :key="item.userName"
              :label="item.nickName + '（' + item.userName + '）'" :value="item.userName" />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item label="姓名">
        <el-input v-model="form.xm" disabled />
      </el-form-item>
      <el-form-item label="柜员号">
        <el-input v-model="form.gyh" disabled />
      </el-form-item>
      <el-form-item label="性别" prop="xb">
        <el-input :model-value="genderLabel(form.xb)" disabled />
      </el-form-item>
      <el-form-item label="身份证号" prop="sfzh">
        <el-input v-model="form.sfzh" placeholder="请输入身份证号" maxlength="18"
          @blur="syncBirthDateFromIdCard" @input="handleSfzhInput" />
      </el-form-item>
      <el-form-item label="出生日期" prop="csrq">
        <el-input v-model="form.csrq" disabled placeholder="请先填写身份证号" />
      </el-form-item>
      <el-form-item label="联系电话" prop="lxdh">
        <el-input v-model="form.lxdh" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="学历" prop="xl">
        <el-select v-model="form.xl" placeholder="请选择学历" style="width: 100%">
          <el-option v-for="item in educationOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="归属网点" prop="gzdw">
        <el-input :model-value="gzdwDisplayText" disabled placeholder="—" />
      </el-form-item>
      <el-form-item label="工作时间" prop="gzsj">
        <el-date-picker v-model="form.gzsj" type="date" value-format="YYYY-MM-DD" placeholder="请选择工作时间"
          style="width: 100%" />
      </el-form-item>
      <el-form-item label="党内职务" prop="dnzw">
        <el-select v-model="form.dnzw" placeholder="请选择党内职务" clearable filterable style="width: 100%">
          <el-option v-for="item in partyJobSelectOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位职务" prop="gwzw">
        <el-input v-model="form.gwzw" placeholder="请输入岗位职务" />
      </el-form-item>
      <PartyMemberArchiveFields v-if="showArchiveFields" :form="form" />
      <el-form-item label="所属党组织" prop="dzzIdstr">
        <el-select v-model="form.dzzIdstr" placeholder="请选择党组织" filterable style="width: 100%"
          @change="handleOrgChange">
          <el-option v-for="item in orgOptions" :key="item.idstr" :label="item.dzzmc" :value="item.idstr" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请入党日期" prop="sqrdrq">
        <el-date-picker v-model="form.sqrdrq" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期"
          style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/** 党建管理 - 党员表单弹窗 */
import { ref, watch, computed } from 'vue'
import {
  listAvailablePartyMemberUsers,
  addPartyMember,
  updatePartyMember,
  buildPartyJobSelectOptions,
  createMemberArchiveDefaults,
  buildMemberArchiveRules
} from '@/api/szhl/partyBuilding/partyMember'
import { selectList as listPartyOrganization } from '@/api/szhl/partyBuilding/partyOrganization'
import PartyMemberArchiveFields from './PartyMemberArchiveFields.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '修改党员' },
  memberData: { type: Object, default: null },
  isAddMode: { type: Boolean, default: false },
  memberStatus: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'success'])

const { proxy } = getCurrentInstance()
const { sys_org_name } = proxy.useDict('sys_org_name')

const formRef = ref(null)
const submitLoading = ref(false)
const orgOptions = ref([])
const userOptions = ref([])
const userLoading = ref(false)

const gzdwDisplayText = computed(() =>
  proxy.selectDictLabel(sys_org_name.value, form.value.gzdw) || '—'
)

const isAddModeComputed = computed(() => props.isAddMode)
/** 修改时展示组织关系、党员状态、处分等档案字段 */
const showArchiveFields = computed(() => !isAddModeComputed.value)

const rules = computed(() => {
  const base = {
    gyh: [{ required: true, message: '请选择用户', trigger: 'change' }],
    xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    xb: [{ required: true, message: '请填写有效身份证号以识别性别', trigger: 'change' }],
    sfzh: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      { pattern: /(^\d{15}$)|(^\d{17}[\dX]$)/i, message: '请输入正确的身份证号', trigger: 'blur' }
    ],
    lxdh: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    xl: [{ required: true, message: '请选择学历', trigger: 'change' }],
    gzdw: [{ required: true, message: '归属网点不能为空', trigger: 'change' }],
    dzzIdstr: [{ required: true, message: '请选择所属党组织', trigger: 'change' }],
    sqrdrq: [{ required: true, message: '请选择申请入党日期', trigger: 'change' }],
    csrq: [{ required: true, message: '请填写有效身份证号以识别出生日期', trigger: 'change' }]
  }
  if (showArchiveFields.value) {
    Object.assign(base, buildMemberArchiveRules(form.value))
  }
  return base
})

const genderOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' }
]

const educationOptions = [
  { label: '小学', value: '小学' },
  { label: '初中', value: '初中' },
  { label: '高中', value: '高中' },
  { label: '中专', value: '中专' },
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' }
]

/** 党内职务下拉选项（含当前已保存但不在预设列表中的值） */
const partyJobSelectOptions = computed(() => buildPartyJobSelectOptions(form.value.dnzw))

const form = ref(createEmptyForm())

/** 创建空的党员表单 */
function createEmptyForm() {
  return {
    xm: '',
    gyh: '',
    xb: '',
    sfzh: '',
    lxdh: '',
    xl: '',
    gzdw: '',
    rdsj: '',
    gzsj: '',
    dnzw: '',
    gwzw: '',
    csrq: '',
    dzzIdstr: '',
    dzzmc: '',
    dyzt: props.memberStatus,
    sqrdrq: '',
    ...createMemberArchiveDefaults()
  }
}

/** 获取性别显示名称 */
function genderLabel(value) {
  return genderOptions.find(item => item.value === value)?.label || value || '—'
}

/** 校验出生日期是否合法 */
function isValidBirthDate(y, m, d) {
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

/** 从身份证号解析出生日期 */
function parseBirthDateFromIdCard(idCard) {
  const id = (idCard || '').trim().toUpperCase()
  if (!id) return ''
  let y
  let m
  let d
  if (/^\d{17}[\dX]$/.test(id)) {
    y = parseInt(id.substring(6, 10), 10)
    m = parseInt(id.substring(10, 12), 10)
    d = parseInt(id.substring(12, 14), 10)
  } else if (/^\d{15}$/.test(id)) {
    const yy = parseInt(id.substring(6, 8), 10)
    y = yy <= 30 ? 2000 + yy : 1900 + yy
    m = parseInt(id.substring(8, 10), 10)
    d = parseInt(id.substring(10, 12), 10)
  } else {
    return ''
  }
  if (!isValidBirthDate(y, m, d)) return ''
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** 同步身份证号对应的出生日期、性别 */
function syncBirthDateFromIdCard() {
  form.value.csrq = parseBirthDateFromIdCard(form.value.sfzh) || ''
  form.value.xb = form.value.sfzh.substring(16,17)%2 == 1?'1':'2'
}

/** 身份证号输入时同步出生日期、性别 */
function handleSfzhInput(value) {
  const id = (value ?? form.value.sfzh ?? '').trim()
  if (id.length === 18 || id.length === 15) {
    syncBirthDateFromIdCard()
  } else if (id.length < 15) {
    form.value.csrq = ''
    form.value.xb = ''
  }
}

/** 加载党组织下拉选项 */
function loadOrgOptions() {
  return listPartyOrganization({ pageNum: 1, pageSize: 9999 }).then(res => {
    orgOptions.value = res.rows || []
  })
}

/** 加载可选用户下拉选项 */
function loadUserOptions() {
  userLoading.value = true
  return listAvailablePartyMemberUsers().then(res => {
    userOptions.value = res.data || []
  }).finally(() => {
    userLoading.value = false
  })
}

/** 映射系统用户性别到党员性别 */
function mapUserSex(sex) {
  if (sex === '0') return '1'
  if (sex === '1') return '2'
  return ''
}

/** 用户选择变更时填充表单 */
function handleUserChange(userName) {
  const user = userOptions.value.find(item => item.userName === userName)
  if (!user) {
    form.value.xm = ''
    //form.value.xb = ''
    form.value.lxdh = ''
    form.value.gzdw = ''
    return
  }
  form.value.gyh = user.userName
  form.value.xm = user.nickName
  //form.value.xb = mapUserSex(user.sex)
  form.value.lxdh = user.phonenumber || ''
  const deptId = user.deptId || user.dept?.deptId
  form.value.gzdw = deptId != null && deptId !== '' ? String(deptId) : ''
}

/** 所属党组织选择变更 */
function handleOrgChange(value) {
  const org = orgOptions.value.find(item => item.idstr === value)
  form.value.dzzmc = org ? org.dzzmc : ''
}

/** 初始化表单数据 */
function initForm() {
  form.value = props.memberData ? { ...createEmptyForm(), ...props.memberData } : createEmptyForm()
  if (props.memberStatus) {
    form.value.dyzt = props.memberStatus
  }
  if (!form.value.zzgx) form.value.zzgx = '1'
  if (!form.value.ryzt) form.value.ryzt = '1'
  if (!form.value.sfycf) form.value.sfycf = '0'
  if (form.value.sfycf !== '1') form.value.cfsm = ''
  syncBirthDateFromIdCard()
}

watch(() => props.visible, (val) => {
  if (!val) return
  initForm()
  const tasks = [loadOrgOptions()]
  if (props.isAddMode) {
    tasks.push(loadUserOptions())
  }
  Promise.all(tasks)
})

/** 关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
}

/** 提交新增/修改表单 */
function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    submitLoading.value = true
    const isNew = props.isAddMode
    const payload = { ...form.value }
    delete payload.rdsj
    delete payload.remark
    delete payload.lxrgyh
    delete payload.lxrxm
    // 组织管理修改不涉及培养联系人、入党介绍人等发展环节字段
    delete payload.pylxrGyh
    delete payload.pylxr2Gyh
    delete payload.rdjsrGyh
    delete payload.rdjsr2Gyh
    const request = isNew ? addPartyMember : updatePartyMember
    request(payload).then(() => {
      proxy.$modal.msgSuccess(isNew ? '新增成功' : '修改成功')
      emit('update:visible', false)
      emit('success')
    }).finally(() => {
      submitLoading.value = false
    })
  })
}
</script>
