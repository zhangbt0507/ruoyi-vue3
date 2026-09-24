<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="姓名" prop="xm">
        <el-input v-model="queryParams.xm" placeholder="请输入姓名" clearable style="width: 160px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="柜员号" prop="gyh">
        <el-input v-model="queryParams.gyh" placeholder="请输入柜员号" clearable style="width: 160px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属党组织" prop="dzzmc">
        <el-input v-model="queryParams.dzzmc" placeholder="请输入党组织名称" clearable style="width: 180px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="canAdd">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['data:partyMember:add']">新增</el-button>
      </el-col>
    </el-row>

    <PartyMemberTable :list="list" :loading="loading" :page-num="queryParams.pageNum" :page-size="queryParams.pageSize"
      :column-preset="columnPreset" :show-actions="true" :can-add="canAdd" @update="handleUpdate"
      @delete="handleDelete" @refresh="getList" />

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="open" :title="title" width="760px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <template v-if="isAddMode">
          <el-form-item label="选择用户" prop="gyh">
            <el-select v-model="form.gyh" placeholder="请选择用户" filterable style="width: 100%"
              :loading="userLoading" @change="handleUserChange">
              <el-option v-for="item in userOptions" :key="item.userName"
                :label="item.nickName + '（' + item.userName + '）'" :value="item.userName" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属网点" prop="gzdw">
            <el-input :model-value="gzdwDisplayText" disabled placeholder="请先选择用户" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="姓名">
            <el-input v-model="form.xm" disabled />
          </el-form-item>
          <el-form-item label="柜员号">
            <el-input v-model="form.gyh" disabled />
          </el-form-item>
        </template>
        <el-form-item label="性别" prop="xb">
          <el-input :model-value="genderLabel(form.xb)" disabled placeholder="请先填写身份证号"/>
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
        <el-form-item v-if="!isAddMode" label="归属网点" prop="gzdw">
          <el-input :model-value="gzdwDisplayText" disabled placeholder="—" />
        </el-form-item>
        <el-form-item label="工作时间" prop="gzsj">
          <el-date-picker v-model="form.gzsj" type="date" value-format="YYYY-MM-DD" placeholder="请选择工作时间"
            style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="showPartyJobField" label="党内职务" prop="dnzw">
          <el-select v-model="form.dnzw" placeholder="请选择党内职务" clearable filterable style="width: 100%">
            <el-option v-for="item in partyJobSelectOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <PartyMemberArchiveFields v-if="showPartyJobField" :form="form" />
        <el-form-item v-if="showTrainingContactField" label="培养联系人一"
          :prop="trainingContactEditable ? 'pylxrGyh' : undefined">
          <el-select v-if="trainingContactEditable" v-model="form.pylxrGyh" placeholder="请选择在册、在职、无处分的正式党员"
            filterable style="width: 100%" :loading="trainingContactUserLoading"
            @change="(val) => handleTrainingContactChange(1, val)">
            <el-option v-for="item in trainingContactUserOptions" :key="'pylxr1-' + item.userName"
              :label="item.nickName + '（' + item.userName + '）'" :value="item.userName"
              :disabled="item.userName === form.pylxr2Gyh || item.userName === form.gyh" />
          </el-select>
          <el-input v-else disabled placeholder="暂无培养联系人" />
        </el-form-item>
        <el-form-item v-if="showTrainingContactField && trainingContactEditable" label="培养联系人二" prop="pylxr2Gyh">
          <el-select v-model="form.pylxr2Gyh" placeholder="请选择在册、在职、无处分的正式党员"
            filterable style="width: 100%" :loading="trainingContactUserLoading"
            @change="(val) => handleTrainingContactChange(2, val)">
            <el-option v-for="item in trainingContactUserOptions" :key="'pylxr2-' + item.userName"
              :label="item.nickName + '（' + item.userName + '）'" :value="item.userName"
              :disabled="item.userName === form.pylxrGyh || item.userName === form.gyh" />
          </el-select>
        </el-form-item>
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
        <el-form-item v-if="isAddMode && requireApplication" label="入党申请书" prop="applicationFileUrl">
          <FileUpload v-model="form.applicationFileUrl" :limit="1" :file-size="20"
            :file-type="['doc', 'docx', 'pdf']" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/** 党建管理 - 党员列表面板 */
import { ref, reactive, computed, onMounted } from 'vue'
import {
  listPartyMember,
  listAvailablePartyMemberUsers,
  listEligibleFormalMembersForContact,
  addPartyMember,
  updatePartyMember,
  delPartyMember,
  MEMBER_STATUS,
  mapFormalMemberSelectOptions,
  buildPartyJobSelectOptions,
  createMemberArchiveDefaults,
  buildMemberArchiveRules
} from '@/api/szhl/partyBuilding/partyMember'
import { selectList as listPartyOrganization } from '@/api/szhl/partyBuilding/partyOrganization'
import PartyMemberTable from './PartyMemberTable.vue'
import PartyMemberArchiveFields from './PartyMemberArchiveFields.vue'

const props = defineProps({
  memberStatus: { type: String, required: true },
  canAdd: { type: Boolean, default: false },
  requireApplication: { type: Boolean, default: false },
  columnPreset: { type: String, default: 'default' }
})

const { proxy } = getCurrentInstance()
const { sys_org_name } = proxy.useDict('sys_org_name')

const loading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const submitLoading = ref(false)
const title = ref('')
const list = ref([])
const total = ref(0)
const orgOptions = ref([])
const userOptions = ref([])
const trainingContactUserOptions = ref([])
const userLoading = ref(false)
const trainingContactUserLoading = ref(false)
const initialHasTrainingContact = ref(false)
const isEditing = ref(false)

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

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  xm: '',
  gyh: '',
  dzzmc: '',
  dyzt: props.memberStatus
})

const form = ref(createEmptyForm())

const isAddMode = computed(() => props.canAdd && !isEditing.value)
/** 申请入党、正式党员不展示培养联系人；其余阶段修改时展示 */
const showTrainingContactField = computed(() =>
  props.memberStatus !== MEMBER_STATUS.APPLY && props.memberStatus !== MEMBER_STATUS.FORMAL
)
/** 正式党员修改时可编辑党内职务 */
const showPartyJobField = computed(() =>
  !isAddMode.value && props.memberStatus === MEMBER_STATUS.FORMAL
)
const partyJobSelectOptions = computed(() => buildPartyJobSelectOptions(form.value.dnzw))
const trainingContactEditable = computed(() => initialHasTrainingContact.value)
const gzdwDisplayText = computed(() =>
  proxy.selectDictLabel(sys_org_name.value, form.value.gzdw) || '—'
)

const rules = computed(() => {
  const base = {
    gyh: [{ required: true, message: '请选择用户', trigger: 'change' }],
    xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    xb: [{ required: true, message: isAddMode.value ? '请填写有效身份证号以识别性别' : '性别不能为空', trigger: 'change' }],
    sfzh: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      { pattern: /(^\d{15}$)|(^\d{17}[\dX]$)/i, message: '请输入正确的身份证号', trigger: 'blur' }
    ],
    lxdh: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    xl: [{ required: true, message: '请选择学历', trigger: 'change' }],
    dzzIdstr: [{ required: true, message: '请选择所属党组织', trigger: 'change' }],
    sqrdrq: [{ required: true, message: '请选择申请入党日期', trigger: 'change' }],
    csrq: [{ required: true, message: '请填写有效身份证号以识别出生日期', trigger: 'change' }]
  }
  base.gzdw = [{ required: true, message: isAddMode.value ? '请先选择用户以带出归属网点' : '归属网点不能为空', trigger: 'change' }]
  if (showTrainingContactField.value && initialHasTrainingContact.value) {
    base.pylxrGyh = [{ required: true, message: '请选择培养联系人一', trigger: 'change' }]
    base.pylxr2Gyh = [{ required: true, message: '请选择培养联系人二', trigger: 'change' }]
  }
  if (props.requireApplication && isAddMode.value) {
    base.applicationFileUrl = [{ required: true, message: '请上传入党申请书', trigger: 'change' }]
  }
  if (showPartyJobField.value) {
    Object.assign(base, buildMemberArchiveRules(form.value))
  }
  return base
})

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

/** 同步培养联系人初始状态 */
function syncInitialTrainingContact(data) {
  initialHasTrainingContact.value = !!(data?.pylxrGyh || data?.pylxr2Gyh)
}

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
    csrq: '',
    pylxrGyh: '',
    pylxr2Gyh: '',
    dzzIdstr: '',
    dzzmc: '',
    dyzt: props.memberStatus,
    sqrdrq: '',
    applicationFileUrl: '',
    ...createMemberArchiveDefaults()
  }
}

/** 加载党组织下拉选项 */
function loadOrgOptions() {
  listPartyOrganization({ pageNum: 1, pageSize: 9999 }).then(res => {
    orgOptions.value = res.rows || []
  })
}

/** 加载可选用户下拉选项 */
function loadUserOptions() {
  userLoading.value = true
  listAvailablePartyMemberUsers().then(res => {
    userOptions.value = res.data || []
  }).finally(() => {
    userLoading.value = false
  })
}

/** 加载培养联系人候选列表 */
function loadTrainingContactUserOptions() {
  trainingContactUserLoading.value = true
  return listEligibleFormalMembersForContact().then(res => {
    trainingContactUserOptions.value = mapFormalMemberSelectOptions(res.data || [], form.value.gyh)
  }).finally(() => {
    trainingContactUserLoading.value = false
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
  form.value.gzdw = deptId != null && deptId !== '' ? String(deptId).substring(0,5)+'0' : ''
}

/** 培养联系人选择变更 */
function handleTrainingContactChange(index, userName) {
  const user = trainingContactUserOptions.value.find(item => item.userName === userName)
  if (index === 1) {
    form.value.pylxrGyh = user ? user.userName : ''
  } else {
    form.value.pylxr2Gyh = user ? user.userName : ''
  }
}

/** 所属党组织选择变更 */
function handleOrgChange(value) {
  const org = orgOptions.value.find(item => item.idstr === value)
  form.value.dzzmc = org ? org.dzzmc : ''
}

/** 查询党员列表 */
function getList() {
  loading.value = true
  queryParams.dyzt = props.memberStatus
  listPartyMember(queryParams).then(response => {
    list.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置搜索条件 */
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}

/** 重置表单数据 */
function resetForm() {
  form.value = createEmptyForm()
  syncInitialTrainingContact(form.value)
  proxy.resetForm('formRef')
}

/** 打开新增/修改弹窗 */
function openDialog() {
  const initDialog = () => {
    if (showTrainingContactField.value && initialHasTrainingContact.value) {
      loadTrainingContactUserOptions()
    }
    if (props.canAdd && !isEditing.value) {
      loadUserOptions()
    }
  }
  initDialog()
  open.value = true
}

/** 新增党员 */
function handleAdd() {
  resetForm()
  isEditing.value = false
  title.value = '新增党员'
  openDialog()
}

/** 修改党员 */
function handleUpdate(row) {
  resetForm()
  isEditing.value = true
  form.value = { ...createEmptyForm(), ...row }
  if (!form.value.zzgx) form.value.zzgx = '1'
  if (!form.value.ryzt) form.value.ryzt = '1'
  if (!form.value.sfycf) form.value.sfycf = '0'
  if (form.value.sfycf !== '1') form.value.cfsm = ''
  syncInitialTrainingContact(form.value)
  syncBirthDateFromIdCard()
  title.value = '修改党员'
  openDialog()
}

/** 删除党员 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除党员"' + row.xm + '"？').then(() => {
    return delPartyMember(row.gyh)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 取消弹窗 */
function cancel() {
  open.value = false
  resetForm()
}

/** 提交新增/修改表单 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (!valid) return
    submitLoading.value = true
    form.value.dyzt = props.memberStatus
    const isNew = !isEditing.value
    const payload = { ...form.value }
    if (isNew && props.requireApplication && payload.applicationFileUrl) {
      payload.applicationFileName = payload.applicationFileUrl.substring(payload.applicationFileUrl.lastIndexOf('/') + 1)
    } else {
      delete payload.applicationFileUrl
    }
    delete payload.lxrgyh
    delete payload.lxrxm
    delete payload.rdsj
    delete payload.remark
    if (!isNew && !showTrainingContactField.value) {
      delete payload.pylxrGyh
      delete payload.pylxr2Gyh
    }
    if (showTrainingContactField.value && trainingContactEditable.value
        && payload.pylxrGyh && payload.pylxr2Gyh && payload.pylxrGyh === payload.pylxr2Gyh) {
      proxy.$modal.msgWarning('两名培养联系人不能为同一人')
      submitLoading.value = false
      return
    }
    const request = isNew ? addPartyMember : updatePartyMember
    request(payload).then(() => {
      proxy.$modal.msgSuccess(isNew ? '新增成功' : '修改成功')
      open.value = false
      getList()
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

onMounted(() => {
  loadOrgOptions()
  getList()
})
</script>
