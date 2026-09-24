<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="党组织名称" prop="dzzmc">
        <el-input v-model="queryParams.dzzmc" placeholder="请输入党组织名称" clearable style="width: 200px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="组织类别" prop="zzlb" label-width="80">
        <el-select v-model="queryParams.zzlb" placeholder="请选择组织类别" clearable style="width: 200px">
          <el-option v-for="item in zzlbOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['data:partyBuilding:add']">新增</el-button>
      </el-col>
    </el-row>

    <el-table ref="table" v-loading="loading" :data="list">
      <el-table-column label="党组织名称" align="center" prop="dzzmc" min-width="120">
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="openMemberList(scope.row)">
            {{ scope.row.dzzmc }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="组织类别" align="center" prop="zzlb" min-width="100">
        <template #default="scope">
          <span>{{ zzlbLabel(scope.row.zzlb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="党组织书记" align="center" prop="dzzsj" min-width="120" show-overflow-tooltip />
      <el-table-column label="党组织联系人" align="center" prop="dzzlxr" min-width="120" show-overflow-tooltip />
      <el-table-column label="党员人数" align="center" prop="dyrs" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.dyrs ?? 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="User" @click="openLeadershipList(scope.row)">班子</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['data:partyBuilding:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['data:partyBuilding:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="open" :title="title" width="520px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="党组织名称" prop="dzzmc">
          <el-input v-model="form.dzzmc" placeholder="请输入党组织名称" />
        </el-form-item>
        <el-form-item label="组织类别" prop="zzlb">
          <el-select v-model="form.zzlb" placeholder="请选择组织类别" style="width: 100%">
            <el-option v-for="item in zzlbOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="党组织书记" prop="dzzsjGyh">
          <el-select v-model="form.dzzsjGyh" placeholder="请选择正式党员" filterable style="width: 100%"
            :loading="formalMemberLoading" @change="handleSecretaryChange">
            <el-option v-for="item in formalMemberOptions" :key="item.gyh"
              :label="memberOptionLabel(item)" :value="item.gyh" />
          </el-select>
        </el-form-item>
        <el-form-item label="党组织联系人" prop="dzzlxrGyh">
          <el-select v-model="form.dzzlxrGyh" placeholder="请选择正式党员" filterable style="width: 100%"
            :loading="formalMemberLoading" @change="handleContactChange">
            <el-option v-for="item in formalMemberOptions" :key="'lxr-' + item.gyh"
              :label="memberOptionLabel(item)" :value="item.gyh" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 党员列表（预备党员+正式党员） -->
    <el-dialog v-model="memberOpen" :title="memberTitle" width="1200px" append-to-body destroy-on-close>
      <PartyMemberTable :list="memberList" :loading="memberLoading" :page-num="memberQueryParams.pageNum"
        :page-size="memberQueryParams.pageSize" :show-status="true" :show-stage="false" :show-gzdw="true"
        :show-party-job-fields="true" :show-edit-only="true" @update="handleMemberEdit" />
      <pagination v-show="memberTotal > 0" :total="memberTotal" v-model:page="memberQueryParams.pageNum"
        v-model:limit="memberQueryParams.pageSize" @pagination="getMemberList" />
    </el-dialog>

    <PartyMemberFormDialog v-model:visible="memberFormOpen" title="修改党员信息" :member-data="currentMember"
      @success="handleMemberSaved" />
  </div>
</template>

<script setup>
/** 党建管理 - 党组织 */
import { ref, reactive, computed, onMounted } from 'vue'
import {
  selectList,
  addPartyOrganization,
  updatePartyOrganization,
  delPartyOrganization
} from "@/api/szhl/partyBuilding/partyOrganization"
import { listPartyMember, MEMBER_STATUS } from '@/api/szhl/partyBuilding/partyMember'
import PartyMemberTable from '../partyMember/components/PartyMemberTable.vue'
import PartyMemberFormDialog from '../partyMember/components/PartyMemberFormDialog.vue'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const submitLoading = ref(false)
const formalMemberLoading = ref(false)
const title = ref('')

const list = ref([])
const total = ref(0)
const formalMemberOptions = ref([])
const memberOpen = ref(false)
const memberLoading = ref(false)
const memberTitle = ref('')
const memberList = ref([])
const memberTotal = ref(0)
const memberQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dzzIdstr: '',
  dyzt: '',
  params: {}
})
const memberFormOpen = ref(false)
const currentMember = ref(null)

const zzlbOptions = [
  { label: '党委', value: '1' },
  { label: '党总支', value: '2' },
  { label: '党支部', value: '3' },
  { label: '党小组', value: '4' }
]

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dzzmc: '',
  zzlb: ''
})

const form = ref(createEmptyForm())

const rules = computed(() => ({
  dzzmc: [{ required: true, message: '请输入党组织名称', trigger: 'blur' }],
  zzlb: [{ required: true, message: '请选择组织类别', trigger: 'change' }],
  dzzsjGyh: [{ required: false, message: '请选择党组织书记', trigger: 'change' }],
  dzzlxrGyh: [{ required: false, message: '请选择党组织联系人', trigger: 'change' }]
}))

/** 创建空的党组织表单 */
function createEmptyForm() {
  return {
    idstr: undefined,
    dzzmc: '',
    zzlb: '',
    dzzsj: '',
    dzzlxr: '',
    dzzsjGyh: '',
    dzzlxrGyh: ''
  }
}

/** 格式化党员下拉选项标签 */
function memberOptionLabel(member) {
  return member.xm + '（' + member.gyh + '）'
}

/** 获取组织类别显示名称 */
function zzlbLabel(value) {
  return zzlbOptions.find(item => item.value === value)?.label || value || '—'
}

/** 加载党组织下党员列表 */
function getMemberList() {
  memberLoading.value = true
  listPartyMember(memberQueryParams).then(res => {
    memberList.value = res.rows || []
    memberTotal.value = res.total || 0
  }).finally(() => {
    memberLoading.value = false
  })
}

/** 打开党员编辑弹窗 */
function handleMemberEdit(row) {
  currentMember.value = { ...row }
  memberFormOpen.value = true
}

/** 党员保存后刷新列表 */
function handleMemberSaved() {
  getMemberList()
  getList()
}

/** 打开党员列表弹窗 */
function openMemberList(row) {
  memberQueryParams.pageNum = 1
  memberQueryParams.pageSize = 10
  memberQueryParams.dzzIdstr = row.idstr
  memberQueryParams.dyzt = ''
  memberQueryParams.params = { orgMemberScope: 'probFormal' }
  memberTitle.value = row.dzzmc + ' - 党员列表'
  memberOpen.value = true
  getMemberList()
}

/** 打开班子列表弹窗 */
function openLeadershipList(row) {
  memberQueryParams.pageNum = 1
  memberQueryParams.pageSize = 10
  memberQueryParams.dzzIdstr = row.idstr
  memberQueryParams.dyzt = MEMBER_STATUS.FORMAL
  memberQueryParams.params = { hasDnzw: '1' }
  memberTitle.value = row.dzzmc + ' - 班子'
  memberOpen.value = true
  getMemberList()
}

/** 加载正式党员下拉选项 */
function loadFormalMemberOptions() {
  formalMemberLoading.value = true
  return listPartyMember({
    pageNum: 1,
    pageSize: 9999,
    dyzt: MEMBER_STATUS.FORMAL,
    dzzIdstr:form.value.idstr
  }).then(res => {
    formalMemberOptions.value = res.rows || []
  }).finally(() => {
    formalMemberLoading.value = false
  })
}

/** 根据姓名查找柜员号 */
function findMemberGyhByName(name) {
  if (!name) return ''
  const member = formalMemberOptions.value.find(item => item.xm === name)
  return member ? member.gyh : ''
}

/** 党组织书记选择变更 */
function handleSecretaryChange(gyh) {
  const member = formalMemberOptions.value.find(item => item.gyh === gyh)
  form.value.dzzsj = member ? member.xm : ''
}

/** 党组织联系人选择变更 */
function handleContactChange(gyh) {
  const member = formalMemberOptions.value.find(item => item.gyh === gyh)
  form.value.dzzlxr = member ? member.xm : ''
}

/** 打开新增/修改弹窗并初始化数据 */
function openDialog() {
  loadFormalMemberOptions().then(() => {
    form.value.dzzsjGyh = findMemberGyhByName(form.value.dzzsj)
    form.value.dzzlxrGyh = findMemberGyhByName(form.value.dzzlxr)
    open.value = true
  })
}

/** 查询党组织列表 */
function getList() {
  loading.value = true
  selectList(queryParams).then(response => {
    list.value = response.rows
    total.value = response.total
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
  proxy.resetForm("queryForm")
  handleQuery()
}

/** 重置表单数据 */
function resetForm() {
  form.value = createEmptyForm()
  proxy.resetForm("formRef")
}

/** 新增党组织 */
function handleAdd() {
  resetForm()
  title.value = '新增党组织'
  openDialog()
}

/** 修改党组织 */
function handleUpdate(row) {
  resetForm()
  form.value = { ...row, dzzsjGyh: '', dzzlxrGyh: '' }
  title.value = '修改党组织'
  openDialog()
}

/** 删除党组织 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除党组织"' + row.dzzmc + '"？').then(() => {
    return delPartyOrganization(row.idstr)
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
  proxy.$refs["formRef"].validate(valid => {
    if (!valid) return
    submitLoading.value = true
    const payload = {
      idstr: form.value.idstr,
      dzzmc: form.value.dzzmc,
      zzlb: form.value.zzlb,
      dzzsj: form.value.dzzsj,
      dzzlxr: form.value.dzzlxr
    }
    const request = form.value.idstr ? updatePartyOrganization : addPartyOrganization
    request(payload).then(() => {
      proxy.$modal.msgSuccess(form.value.idstr ? '修改成功' : '新增成功')
      open.value = false
      getList()
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

onMounted(() => {
  getList()
})
</script>
