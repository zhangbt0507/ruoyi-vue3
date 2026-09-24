<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="乡镇名称" prop="townshipName">
        <el-select
          v-model="queryParams.townshipName"
          placeholder="请选择乡镇"
          filterable
          clearable
          style="width: 200px"
          :loading="townshipLoading"
          @change="onTownshipChange"
        >
          <el-option v-for="item in townshipOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="村名" prop="villageName">
        <el-select
          v-model="queryParams.villageName"
          placeholder="请先选择乡镇"
          filterable
          clearable
          style="width: 200px"
          :disabled="!queryParams.townshipName"
          :loading="villageLoading"
        >
          <el-option v-for="item in villageOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="归属部门" prop="deptId">
        <el-select v-model="queryParams.deptId" placeholder="全部" clearable filterable style="width: 200px">
          <el-option v-for="d in deptOptions" :key="d.deptId" :label="d.deptName" :value="d.deptId" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户经理" prop="managerName">
        <el-input v-model="queryParams.managerName" placeholder="客户经理" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="Document" :disabled="selection.length !== 1" @click="openReport">村报告</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="success" plain icon="EditPen" :disabled="selection.length !== 1" @click="openWeeklyJournal">周志</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="User" :disabled="selection.length !== 1" @click="openPersonnelAdd">新增人员</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" :disabled="selection.length !== 1" @click="openPersonnelImport">导入人员</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" :disabled="selection.length !== 1" @click="exportPersonnelForSelection">导出人员</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增村</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="!ids.length" @click="handleDelete">删除</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" @click="handleImport">导入村</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出村</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="采集日期" prop="collectDate" width="120" align="center">
        <template #default="scope">
          <span>{{ scope.row.collectDate ? parseTime(scope.row.collectDate, '{y}-{m}-{d}') : '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="乡镇名称" prop="townshipName" min-width="120" show-overflow-tooltip />
      <el-table-column label="村名" prop="villageName" min-width="110" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="openStatsDialog(scope.row)">{{ scope.row.villageName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="归属部门" min-width="140" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="sys_org_name" :value="scope.row.deptId" />
        </template>
      </el-table-column>
      <el-table-column label="客户经理" prop="managerName" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <div class="dict-tag-inline-list">
            <template v-if="rowManagerCodes(scope.row).length">
              <dict-tag
                v-for="code in rowManagerCodes(scope.row)"
                :key="String(code)"
                :options="sys_user_name"
                :value="code"
              />
            </template>
            <span v-else class="cell-empty-dash">—</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="户数" prop="householdCount" width="80" align="right" />
      <el-table-column label="人口总数" prop="populationTotal" width="90" align="right" />
      <el-table-column label="在外人口" prop="populationOutside" width="90" align="right" />
      <el-table-column label="主要产业" prop="mainIndustry" min-width="100" show-overflow-tooltip />
      <el-table-column label="集体经济年收入" prop="collectiveIncomeDesc" min-width="120" show-overflow-tooltip />
      <el-table-column label="村民主要收入来源" prop="mainIncomeSource" min-width="140" show-overflow-tooltip />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog v-model="statsOpen" title="维护村情统计" width="560px" append-to-body destroy-on-close>
      <el-form ref="statsFormRef" :model="statsForm" :rules="statsRules" label-width="140px">
        <el-form-item label="乡镇名称">
          <el-input v-model="statsForm.townshipName" disabled />
        </el-form-item>
        <el-form-item label="村名">
          <el-input v-model="statsForm.villageName" disabled />
        </el-form-item>
        <el-form-item label="归属部门">
          <el-select
            v-if="canEditDeptAndManager"
            v-model="statsForm.deptId"
            placeholder="请选择部门"
            filterable
            clearable
            class="w-full"
            @change="onStatsDeptChange"
          >
            <el-option v-for="d in deptOptions" :key="d.deptId" :label="d.deptName" :value="d.deptId" />
          </el-select>
          <el-input v-else :model-value="statsReadonlyDeptLabel" disabled class="w-full stats-readonly-plain" />
        </el-form-item>
        <el-form-item label="客户经理">
          <el-select
            v-if="canEditDeptAndManager"
            v-model="statsForm.managerUserIds"
            placeholder="请先选择部门，可多选"
            filterable
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
            :disabled="!statsForm.deptId"
          >
            <el-option v-for="u in statsManagerOptions" :key="u.userId" :label="managerOptionLabel(u)" :value="u.userId" />
          </el-select>
          <el-input v-else :model-value="statsReadonlyManagerText" type="textarea" :rows="2" disabled class="w-full stats-readonly-plain" />
        </el-form-item>
        <el-form-item label="户数" prop="householdCount">
          <el-input-number v-model="statsForm.householdCount" :min="0" :controls="true" class="w-full" />
        </el-form-item>
        <el-form-item label="人口总数" prop="populationTotal">
          <el-input-number v-model="statsForm.populationTotal" :min="0" :controls="true" class="w-full" />
        </el-form-item>
        <el-form-item label="在外人口数" prop="populationOutside">
          <el-input-number v-model="statsForm.populationOutside" :min="0" :controls="true" class="w-full" />
        </el-form-item>
        <el-form-item label="主要产业" prop="mainIndustry">
          <el-input v-model="statsForm.mainIndustry" placeholder="选填" />
        </el-form-item>
        <el-form-item label="集体经济年收入" prop="collectiveIncomeDesc">
          <el-input v-model="statsForm.collectiveIncomeDesc" placeholder="如：20万元" />
        </el-form-item>
        <el-form-item label="村民主要收入来源" prop="mainIncomeSource">
          <el-input v-model="statsForm.mainIncomeSource" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="statsLoading" @click="submitStats">保 存</el-button>
        <el-button @click="statsOpen = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addOpen" title="新增村信息" width="560px" append-to-body destroy-on-close>
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="归属部门" prop="deptId">
          <el-select v-model="addForm.deptId" placeholder="请选择部门" filterable clearable class="w-full" @change="onAddDeptChange">
            <el-option v-for="d in deptOptions" :key="d.deptId" :label="d.deptName" :value="d.deptId" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户经理" prop="managerUserIds">
          <el-select
            v-model="addForm.managerUserIds"
            placeholder="请先选择部门，可多选"
            filterable
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
            :disabled="!addForm.deptId"
          >
            <el-option v-for="u in managerOptions" :key="u.userId" :label="managerOptionLabel(u)" :value="u.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="乡镇名称" prop="townshipName">
          <el-input v-model="addForm.townshipName" />
        </el-form-item>
        <el-form-item label="村名" prop="villageName">
          <el-input v-model="addForm.villageName" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="addLoading" @click="submitAdd">确 定</el-button>
        <el-button @click="addOpen = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="upload.title" v-model="upload.open" width="520px" append-to-body>
      <el-upload
        ref="uploadRef"
        v-model:file-list="fileList"
        :limit="1"
        accept=".xlsx,.xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :auto-upload="false"
        :data="{ updateSupport: upload.updateSupport ? 'true' : 'false' }"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip text-center">
            <el-checkbox v-model="upload.updateSupport">是否更新已存在的村（按乡镇+村匹配；可更新部门ID、客户经理工号）</el-checkbox>
            <div class="mt-2">
              Excel 列：<strong>乡镇名称、村名、部门ID（sys_dept.dept_id）、客户经理（工号，多个英文逗号分隔）</strong>。新增行须填写部门ID；更新时部门ID可留空表示不改部门。
            </div>
            <el-link type="primary" @click="handleTemplate">下载导入模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button type="success" :loading="upload.isUploading" @click="submitUpload">{{ upload.isUploading ? '上传中…' : '开始上传' }}</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="personnelFormOpen" title="新增村人员" width="640px" append-to-body destroy-on-close>
      <el-form ref="personnelFormRef" :model="personnelForm" :rules="personnelFormRules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="乡镇名称" prop="townshipName">
              <el-input v-model="personnelForm.townshipName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="村名" prop="villageName">
              <el-input v-model="personnelForm.villageName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="客户分类" prop="customerCategories">
              <el-select
                v-model="personnelForm.customerCategories"
                placeholder="请选择客户分类（可多选）"
                filterable
                multiple
                class="personnel-category-select w-full"
              >
                <el-option
                  v-for="item in villagePersonnelCategoryOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="personName">
              <el-input v-model="personnelForm.personName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号" prop="idCard">
              <el-input v-model="personnelForm.idCard" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phoneNumber">
              <el-input v-model="personnelForm.phoneNumber" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门牌号" prop="houseNumber">
              <el-input v-model="personnelForm.houseNumber" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配偶姓名" prop="spouseName">
              <el-input v-model="personnelForm.spouseName" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配偶证件号" prop="spouseIdCard">
              <el-input v-model="personnelForm.spouseIdCard" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="资源说明" prop="resourceDesc">
              <el-input v-model="personnelForm.resourceDesc" type="textarea" :rows="3" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="personnelForm.remark" type="textarea" :rows="2" placeholder="选填" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="personnelSubmitLoading" @click="submitPersonnelForm">确 定</el-button>
        <el-button @click="personnelFormOpen = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="personnelImport.title" v-model="personnelImport.open" width="520px" append-to-body>
      <p v-if="personnelImportContext.townshipName" class="personnel-import-hint">
        当前村：<strong>{{ personnelImportContext.townshipName }}</strong> / <strong>{{ personnelImportContext.villageName }}</strong>
      </p>
      <el-upload
        ref="personnelUploadRef"
        v-model:file-list="personnelImportFileList"
        :limit="1"
        accept=".xlsx,.xls"
        :headers="personnelImport.headers"
        :action="personnelImport.url"
        :disabled="personnelImport.isUploading"
        :on-progress="handlePersonnelUploadProgress"
        :on-success="handlePersonnelUploadSuccess"
        :on-error="handlePersonnelUploadError"
        :before-upload="beforePersonnelUpload"
        :auto-upload="false"
        :data="personnelImportFormData"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="mt-2">单次文件须为<strong>同一乡镇、同一村</strong>；导入前将<strong>清空该村</strong>原有人员，再写入本文件全部行（全量覆盖）。已从上方选中行带入村镇，Excel 中乡镇、村列可留空或与该村一致。</div>
            <div class="mt-2">仅允许 xls、xlsx，建议不超过 5MB。</div>
            <el-link type="primary" @click="handlePersonnelTemplate">下载导入模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button type="success" :loading="personnelImport.isUploading" @click="submitPersonnelUpload">{{
          personnelImport.isUploading ? '上传中…' : '开始上传'
        }}</el-button>
        <el-button @click="personnelImport.open = false">取 消</el-button>
      </template>
    </el-dialog>

    <VillageReportDialog v-model="reportOpen" :report="reportData" />
    <VillageWeeklyJournalDialog v-model="journalOpen" :preset="journalPreset" @success="getList" />
  </div>
</template>

<script setup name="VillageInfo">
import { computed, getCurrentInstance, nextTick, onActivated, onMounted, reactive, ref, toRefs } from 'vue'
import useUserStore from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'
import { getToken } from '@/utils/auth'
import gatewayUrl from '@/utils/gatewayUrl'
import { parseTime } from '@/utils/ruoyi'
import { listAllDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'
import {
  listVillageInfo,
  updateVillageInfoStats,
  addVillageInfo,
  downloadVillageInfoTemplate
} from '@/api/szhl/villageResource/villageInfo'
import { addVillagePersonnelBatch, downloadVillagePersonnelTemplate } from '@/api/szhl/villageResource/villagePersonnel'
import VillageReportDialog from './VillageReportDialog.vue'
import VillageWeeklyJournalDialog from './VillageWeeklyJournalDialog.vue'
import { useVillageLocationOptions } from '../composables/useVillageLocationOptions'

const villagePersonnelCategoryOptions = [
  '村四委成员',
  '驿站站长（支农联络员）',
  '有社会影响力人员',
  '主要贤达',
  '经商办企人员',
  '规模化种养业人员',
  '存款理财资源客户',
  '已贷客户',
  '贷款资源客户',
  '商户收单资源客户',
  '其他资源客户'
]

const { proxy } = getCurrentInstance()
const { sys_user_name, sys_org_name } = proxy.useDict('sys_user_name', 'sys_org_name')
const userStore = useUserStore()

/** 维护村情统计：归属部门、客户经理可编辑；仅「客户经理 manager」角色不可改（其余角色可改） */
const canEditDeptAndManager = computed(() => !(userStore.roles || []).includes('manager'))

const dataList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const ids = ref([])
const selection = ref([])

/** 仅「新增村信息」归属部门下拉：接口部门树，与 listUser(deptId) 一致 */
const deptOptions = ref([])

const managerOptions = ref([])
const statsManagerOptions = ref([])

const statsOpen = ref(false)
const statsLoading = ref(false)
const statsFormRef = ref(null)
const statsForm = ref({})
const statsRules = {}

/** 统计弹窗只读：归属部门、客户经理展示为纯文本（字典转名称，非 tag） */
const statsReadonlyDeptLabel = computed(() => {
  const v = statsForm.value?.deptId
  if (v == null || v === '') return '—'
  const opts = sys_org_name.value || []
  const o = opts.find((x) => String(x.value) === String(v))
  return o?.label ?? String(v)
})

const statsReadonlyManagerText = computed(() => {
  const codes = parseManagerUserNamesStored(statsForm.value?.managerName)
  if (!codes.length) return '—'
  const opts = sys_user_name.value || []
  return codes
    .map((c) => {
      const o = opts.find((x) => String(x.value) === String(c))
      return o?.label ?? String(c)
    })
    .join('、')
})

const addOpen = ref(false)
const addLoading = ref(false)
const addFormRef = ref(null)
const addForm = ref({
  deptId: undefined,
  managerUserIds: [],
  managerName: '',
  townshipName: '',
  villageName: ''
})
const addRules = {
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  managerUserIds: [{ required: true, type: 'array', min: 1, message: '请至少选择一名客户经理', trigger: 'change' }],
  townshipName: [{ required: true, message: '必填', trigger: 'blur' }],
  villageName: [{ required: true, message: '必填', trigger: 'blur' }]
}

const uploadRef = ref(null)
const fileList = ref([])
const upload = ref({
  open: false,
  title: '导入村信息',
  isUploading: false,
  updateSupport: false,
  headers: { Authorization: 'Bearer ' + getToken() },
  url: gatewayUrl('/szhl/villageInfo/importData')
})

const reportOpen = ref(false)
const reportData = ref(null)

const journalOpen = ref(false)
const journalPreset = ref(null)

const personnelFormOpen = ref(false)
const personnelSubmitLoading = ref(false)
const personnelFormRef = ref(null)
const personnelForm = ref({})
const personnelFormRules = {
  customerCategories: [{
    type: 'array',
    required: true,
    min: 1,
    message: '请至少选择一个客户分类',
    trigger: 'change'
  }],
  personName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
}

const personnelUploadRef = ref(null)
const personnelImportFileList = ref([])
const personnelImportContext = ref({ townshipName: '', villageName: '' })
const personnelImport = ref({
  open: false,
  title: '导入村人员信息',
  isUploading: false,
  headers: { Authorization: 'Bearer ' + getToken() },
  url: gatewayUrl('/szhl/villagePersonnel/importData')
})
const personnelImportFormData = computed(() => ({
  updateSupport: 'false',
  townshipName: personnelImportContext.value.townshipName || '',
  villageName: personnelImportContext.value.villageName || ''
}))

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    townshipName: undefined,
    villageName: undefined,
    deptId: undefined,
    managerName: undefined
  }
})
const { queryParams } = toRefs(data)

const {
  townshipOptions,
  villageOptions,
  townshipLoading,
  villageLoading,
  loadTownships,
  loadVillages,
  onTownshipChange,
  clearVillageOptions
} = useVillageLocationOptions(queryParams)

function managerOptionLabel(u) {
  const name = u.nickName || u.userName
  return u.userName && u.nickName ? `${name}（${u.userName}）` : name
}

/** 库表 manager_name：存工号 user_name，多个英文逗号分隔 */
function parseManagerUserNamesStored(raw) {
  if (raw == null || raw === '') return []
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 表格行：客户经理工号列表（只解析一次，供 v-if / v-for 共用） */
function rowManagerCodes(row) {
  return parseManagerUserNamesStored(row?.managerName)
}

/** 提交前写入 form.managerName（仅工号逗号串，姓名由字典展示） */
function applyManagerUserNamesToForm(form, userIds, optionsList) {
  const users = (userIds || []).map((id) => optionsList.find((u) => u.userId === id)).filter(Boolean)
  const codes = users.map((u) => u.userName).filter(Boolean)
  form.managerName = codes.join(',')
}

function loadDeptOptions() {
  listAllDept({}).then((res) => {
    deptOptions.value = res.data || []
  })
}

function loadManagers(deptId) {
  managerOptions.value = []
  if (!deptId) return
  listUser({ deptId, pageNum: 1, pageSize: 500, status: '0' }).then((res) => {
    managerOptions.value = res.rows || []
  })
}

function loadStatsManagers(deptId) {
  statsManagerOptions.value = []
  if (!deptId) return Promise.resolve()
  return listUser({ deptId, pageNum: 1, pageSize: 500, status: '0' }).then((res) => {
    statsManagerOptions.value = res.rows || []
  })
}

/** 打开统计弹窗时，根据已存 manager_name 反选（新：逗号工号；旧：顿号/昵称（工号）） */
function syncStatsManagerUserIdsFromRow(row) {
  const ids = []
  const raw = (row.managerName || '').trim()
  if (!raw) {
    statsForm.value.managerUserIds = []
    return
  }
  const commaParts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  const allCommaMatchUserName =
    commaParts.length > 0 &&
    commaParts.every((t) => statsManagerOptions.value.some((x) => x.userName === t))
  if (allCommaMatchUserName) {
    commaParts.forEach((t) => {
      const u = statsManagerOptions.value.find((x) => x.userName === t)
      if (u && !ids.includes(u.userId)) ids.push(u.userId)
    })
    statsForm.value.managerUserIds = ids
    return
  }
  const parts = raw.split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
  for (const p of parts) {
    const m = p.match(/^(.+)（([^）]+)）\s*$/)
    if (m) {
      const no = m[2].trim()
      const u = statsManagerOptions.value.find((x) => x.userName === no)
      if (u && !ids.includes(u.userId)) ids.push(u.userId)
      continue
    }
    const u = statsManagerOptions.value.find(
      (x) => (x.nickName || x.userName) === p || managerOptionLabel(x) === p
    )
    if (u && !ids.includes(u.userId)) ids.push(u.userId)
  }
  statsForm.value.managerUserIds = ids
}

function onStatsDeptChange(deptId) {
  statsForm.value.managerUserIds = []
  statsForm.value.managerName = ''
  loadStatsManagers(deptId)
}

function onAddDeptChange(deptId) {
  addForm.value.managerUserIds = []
  addForm.value.managerName = ''
  loadManagers(deptId)
}

function getList() {
  loading.value = true
  listVillageInfo(queryParams.value)
    .then((res) => {
      dataList.value = res.rows
      total.value = res.total
    })
    .finally(() => {
      loading.value = false
    })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  clearVillageOptions()
  handleQuery()
}

function handleSelectionChange(sel) {
  selection.value = sel
  ids.value = sel.map((r) => r.id)
}

function openStatsDialog(row) {
  statsManagerOptions.value = []
  statsForm.value = {
    id: row.id,
    deptId: row.deptId,
    townshipName: row.townshipName,
    villageName: row.villageName,
    managerUserIds: [],
    managerName: row.managerName,
    householdCount: row.householdCount ?? undefined,
    populationTotal: row.populationTotal ?? undefined,
    populationOutside: row.populationOutside ?? undefined,
    mainIndustry: row.mainIndustry,
    collectiveIncomeDesc: row.collectiveIncomeDesc,
    mainIncomeSource: row.mainIncomeSource
  }
  statsOpen.value = true
  if (canEditDeptAndManager.value && row.deptId) {
    loadStatsManagers(row.deptId).then(() => {
      syncStatsManagerUserIdsFromRow(row)
    })
  }
}

function submitStats() {
  if (canEditDeptAndManager.value) {
    if (statsForm.value.deptId == null || statsForm.value.deptId === '') {
      proxy.$modal.msgError('请选择归属部门')
      return
    }
    if (!statsForm.value.managerUserIds?.length) {
      proxy.$modal.msgError('请至少选择一名客户经理')
      return
    }
    applyManagerUserNamesToForm(statsForm.value, statsForm.value.managerUserIds, statsManagerOptions.value)
    if (!statsForm.value.managerName) {
      proxy.$modal.msgError('所选用户缺少登录名（工号），请重新选择')
      return
    }
  }
  statsLoading.value = true
  const { managerUserIds, ...payload } = statsForm.value
  updateVillageInfoStats(payload)
    .then(() => {
      proxy.$modal.msgSuccess('保存成功，采集日期已更新为当天')
      statsOpen.value = false
      getList()
    })
    .finally(() => {
      statsLoading.value = false
    })
}

function handleAdd() {
  addForm.value = {
    deptId: undefined,
    managerUserIds: [],
    managerName: '',
    townshipName: '',
    villageName: ''
  }
  managerOptions.value = []
  addOpen.value = true
}

function submitAdd() {
  addFormRef.value.validate((ok) => {
    if (!ok) return
    if (!addForm.value.managerUserIds?.length) {
      proxy.$modal.msgError('请至少选择一名客户经理')
      return
    }
    applyManagerUserNamesToForm(addForm.value, addForm.value.managerUserIds, managerOptions.value)
    if (!addForm.value.managerName) {
      proxy.$modal.msgError('所选用户缺少登录名（工号），请重新选择')
      return
    }
    addLoading.value = true
    const payload = {
      deptId: addForm.value.deptId,
      townshipName: addForm.value.townshipName,
      villageName: addForm.value.villageName,
      managerName: addForm.value.managerName
    }
    addVillageInfo(payload)
      .then(() => {
        proxy.$modal.msgSuccess('新增成功')
        addOpen.value = false
        getList()
      })
      .finally(() => {
        addLoading.value = false
      })
  })
}

// function handleDelete() {
//   if (!ids.value.length) {
//     proxy.$modal.msgWarning('请选择要删除的数据')
//     return
//   }
//   proxy.$modal
//     .confirm('是否确认删除选中的村信息？')
//     .then(() => delVillageInfo(ids.value.join(',')))
//     .then(() => {
//       getList()
//       proxy.$modal.msgSuccess('删除成功')
//     })
//     .catch(() => {})
// }

function handleImport() {
  upload.value.open = true
}

function handleTemplate() {
  downloadVillageInfoTemplate().then((response) => {
    if (response) {
      const blob = new Blob([response])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `村信息导入模板_${new Date().getTime()}.xlsx`
      link.click()
      URL.revokeObjectURL(link.href)
    }
  })
}

function submitUpload() {
  if (!fileList.value?.length) {
    proxy.$modal.msgError('请先选择文件')
    return
  }
  uploadRef.value?.submit()
}

function beforeUpload(file) {
  const ok =
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  if (!ok) {
    proxy.$modal.msgError('只支持 Excel 文件')
    return false
  }
  if (file.size / 1024 / 1024 >= 5) {
    proxy.$modal.msgError('文件不能超过 5MB')
    return false
  }
  return true
}

function handleFileUploadProgress() {
  upload.value.isUploading = true
}

function handleUploadSuccess(response) {
  upload.value.isUploading = false
  if (response.code === 200) {
    ElMessageBox.alert(response.msg, '导入结果', { type: 'success' }).then(() => {
      uploadRef.value?.clearFiles()
      upload.value.open = false
      getList()
    })
  } else {
    ElMessageBox.alert(response.msg, '导入失败', { type: 'error' }).then(() => {
      uploadRef.value?.clearFiles()
    })
  }
}

function handleUploadError() {
  upload.value.isUploading = false
  proxy.$modal.msgError('上传失败')
  uploadRef.value?.clearFiles()
}

function handleExport() {
  proxy.download('szhl/villageInfo/export', { ...queryParams.value }, `村信息_${new Date().getTime()}.xlsx`)
}

function deptNameById(deptId) {
  if (deptId == null || deptId === '') return '—'
  const d = deptOptions.value.find((x) => String(x.deptId) === String(deptId))
  return d?.deptName ?? '—'
}

// function openReport() {
//   if (selection.value.length !== 1) return
//   const id = selection.value[0].id
//   getVillageReport(id).then((res) => {
//     reportData.value = res.data
//     reportOpen.value = true
//   })
// }

function openWeeklyJournal() {
  if (selection.value.length !== 1) return
  const row = selection.value[0]
  journalPreset.value = {
    villageInfoId: row.id,
    townshipName: row.townshipName || '',
    villageName: row.villageName || '',
    orgNo: row.deptId != null && row.deptId !== '' ? String(row.deptId) : '',
    deptName: deptNameById(row.deptId),
    recorderName: userStore.nickName || userStore.name || '—'
  }
  journalOpen.value = true
}

function resetPersonnelFormForAdd() {
  const r = selection.value[0]
  personnelForm.value = {
    id: undefined,
    townshipName: r.townshipName || '',
    villageName: r.villageName || '',
    customerCategories: [],
    personName: undefined,
    idCard: undefined,
    phoneNumber: undefined,
    houseNumber: undefined,
    spouseName: undefined,
    spouseIdCard: undefined,
    resourceDesc: undefined,
    remark: undefined
  }
  nextTick(() => personnelFormRef.value?.clearValidate())
}

function openPersonnelAdd() {
  if (selection.value.length !== 1) return
  resetPersonnelFormForAdd()
  personnelFormOpen.value = true
}

function doSubmitPersonnelForm() {
  personnelSubmitLoading.value = true
  const f = personnelForm.value
  addVillagePersonnelBatch({
    townshipName: f.townshipName,
    villageName: f.villageName,
    customerCategories: f.customerCategories,
    personName: f.personName,
    idCard: f.idCard,
    phoneNumber: f.phoneNumber,
    houseNumber: f.houseNumber,
    spouseName: f.spouseName,
    spouseIdCard: f.spouseIdCard,
    resourceDesc: f.resourceDesc,
    remark: f.remark
  })
    .then(() => {
      proxy.$modal.msgSuccess('新增成功')
      personnelFormOpen.value = false
    })
    .finally(() => {
      personnelSubmitLoading.value = false
    })
}

function submitPersonnelForm() {
  personnelFormRef.value?.validate((ok) => {
    if (!ok) return
    const categories = personnelForm.value.customerCategories || []
    if (categories.length > 1) {
      const categoryText = categories.join('、')
      proxy.$modal
        .confirm(`已选择 ${categories.length} 个客户分类：${categoryText}。是否确认保存？`)
        .then(() => doSubmitPersonnelForm())
        .catch(() => {})
      return
    }
    doSubmitPersonnelForm()
  })
}

function openPersonnelImport() {
  if (selection.value.length !== 1) return
  const r = selection.value[0]
  personnelImportContext.value = {
    townshipName: r.townshipName || '',
    villageName: r.villageName || ''
  }
  personnelImportFileList.value = []
  personnelImport.value.open = true
}

function handlePersonnelTemplate() {
  downloadVillagePersonnelTemplate().then((response) => {
    if (response) {
      const blob = new Blob([response])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `村人员信息导入模板_${new Date().getTime()}.xlsx`
      link.click()
      URL.revokeObjectURL(link.href)
    }
  })
}

function submitPersonnelUpload() {
  if (!personnelImportFileList.value?.length) {
    proxy.$modal.msgError('请先选择文件')
    return
  }
  personnelUploadRef.value?.submit()
}

function beforePersonnelUpload(file) {
  return beforeUpload(file)
}

function handlePersonnelUploadProgress() {
  personnelImport.value.isUploading = true
}

function handlePersonnelUploadSuccess(response) {
  personnelImport.value.isUploading = false
  if (response.code === 200) {
    ElMessageBox.alert(response.msg, '导入结果', { type: 'success' }).then(() => {
      personnelUploadRef.value?.clearFiles()
      personnelImport.value.open = false
    })
  } else {
    ElMessageBox.alert(response.msg, '导入失败', { type: 'error' }).then(() => {
      personnelUploadRef.value?.clearFiles()
    })
  }
}

function handlePersonnelUploadError() {
  personnelImport.value.isUploading = false
  proxy.$modal.msgError('上传失败')
  personnelUploadRef.value?.clearFiles()
}

function exportPersonnelForSelection() {
  if (selection.value.length !== 1) return
  const r = selection.value[0]
  const township = r.townshipName || ''
  const village = r.villageName || ''
  proxy.download(
    'szhl/villagePersonnel/export',
    { townshipName: township, villageName: village },
    `村人员信息_${township}_${village}_${new Date().getTime()}.xlsx`
  )
}

onMounted(() => {
  loadDeptOptions()
  loadTownships().then(() => {
    if (queryParams.value.townshipName) {
      loadVillages()
    }
  })
  getList()
})

onActivated(() => {
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
.mt-2 {
  margin-top: 8px;
}
.w-full {
  width: 100%;
}
.personnel-category-select :deep(.el-select__tags) {
  flex-wrap: wrap;
  max-width: 100%;
}
.personnel-category-select :deep(.el-select__input) {
  flex-grow: 1;
  min-width: 80px;
}
.manager-readonly-box {
  min-height: 32px;
  padding: 4px 11px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
  box-sizing: border-box;
}
.dict-tag-inline-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.stats-readonly-plain :deep(.el-input__wrapper) {
  background-color: var(--el-fill-color-light);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}
.personnel-import-hint {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
