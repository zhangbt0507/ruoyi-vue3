<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="乡镇名称" prop="townshipName">
        <el-select
          v-model="queryParams.townshipName"
          placeholder="请选择乡镇"
          filterable
          clearable
          style="width: 180px"
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
          style="width: 180px"
          :disabled="!queryParams.townshipName"
          :loading="villageLoading"
        >
          <el-option v-for="item in villageOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="网点" prop="deptId">
        <el-select v-model="queryParams.deptId" placeholder="全部" clearable filterable style="width: 200px">
          <el-option v-for="d in deptOptions" :key="d.deptId" :label="d.deptName" :value="d.deptId" />
        </el-select>
      </el-form-item>
      <el-form-item label="走访日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="-"
          start-placeholder="开始"
          end-placeholder="结束"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="走访日期" prop="journalDate" width="120" align="center">
        <template #default="scope">
          <span>{{ scope.row.journalDate ? parseTime(scope.row.journalDate, '{y}-{m}-{d}') : '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="乡镇" prop="townshipName" min-width="110" show-overflow-tooltip />
      <el-table-column label="村名" prop="villageName" min-width="100" show-overflow-tooltip />
      <!-- <el-table-column label="机构号" prop="orgNo" width="100" show-overflow-tooltip /> -->
      <el-table-column label="部门网点" prop="deptName" width="150" show-overflow-tooltip />
      <el-table-column label="录入人" prop="recorderName" width="100" show-overflow-tooltip />
      <el-table-column label="深耕记录" prop="deepCultivationRecord" width="200" show-overflow-tooltip />
      <el-table-column label="客户经理" width="160" show-overflow-tooltip>
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
            <span v-else>—</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="140" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">查看</el-button>
          <el-button v-hasPermi="['szhl:villageWeeklyJournal:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="dialogTitle" v-model="open" width="560px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="乡镇">
          <el-input v-model="form.townshipName" disabled />
        </el-form-item>
        <el-form-item label="村名">
          <el-input v-model="form.villageName" disabled />
        </el-form-item>
        <el-form-item label="机构号">
          <el-input v-model="form.orgNo" disabled />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="form.deptName" disabled />
        </el-form-item>
        <el-form-item label="录入人">
          <el-input v-model="form.recorderName" disabled />
        </el-form-item>
        <el-form-item label="日期" prop="journalDate">
          <el-date-picker
            v-model="form.journalDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择走访日期"
            class="w-full"
            disabled
          />
        </el-form-item>
        <el-form-item label="深耕记录" prop="deepCultivationRecord">
          <el-input
            v-model="form.deepCultivationRecord"
            type="textarea"
            :rows="6"
            maxlength="8000"
            show-word-limit
            placeholder="填写走访、深耕情况"
            :disabled="readOnly"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button v-if="!readOnly" type="primary" :loading="submitLoading" @click="submitForm">保 存</el-button>
        <el-button @click="open = false">{{ readOnly ? '关 闭' : '取 消' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VillageWeeklyJournal">
import { computed, getCurrentInstance, onActivated, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import { parseTime } from '@/utils/ruoyi'
import { listAllDept } from '@/api/system/dept'
import {
  listVillageWeeklyJournal,
  getVillageWeeklyJournal,
  updateVillageWeeklyJournal
} from '@/api/szhl/villageResource/villageWeeklyJournal'
import { useVillageLocationOptions } from '../composables/useVillageLocationOptions'

const { proxy } = getCurrentInstance()
const route = useRoute()
const { sys_user_name } = proxy.useDict('sys_user_name')

const dataList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const readOnly = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const dateRange = ref([])
const ids = ref([])
const selectedRows = ref([])
const deptOptions = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    townshipName: undefined,
    villageName: undefined,
    deptId: undefined
  },
  form: {},
  rules: {
    // journalDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
    deepCultivationRecord: [{ required: true, message: '请填写深耕记录', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

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

function loadDeptOptions() {
  listAllDept({}).then((res) => {
    deptOptions.value = res.data || []
  })
}

function rowManagerCodes(row) {
  const raw = row?.managerName
  if (raw == null || raw === '') return []
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildQueryParams() {
  const p = { ...queryParams.value }
  if (dateRange.value?.length === 2) {
    p.beginJournalDate = dateRange.value[0]
    p.endJournalDate = dateRange.value[1]
  } else {
    p.beginJournalDate = undefined
    p.endJournalDate = undefined
  }
  return p
}

function getList() {
  loading.value = true
  listVillageWeeklyJournal(buildQueryParams())
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
  dateRange.value = []
  proxy.resetForm('queryRef')
  clearVillageOptions()
  handleQuery()
}

/** 按当前筛选条件导出（含数据权限，不分页全量） */
function handleExport() {
  const p = buildQueryParams()
  const township = p.townshipName || '全部'
  const village = p.villageName || '全部'
  proxy.download(
    'szhl/villageWeeklyJournal/export',
    p,
    `深耕周志_${township}_${village}_${new Date().getTime()}.xlsx`
  )
}

function handleSelectionChange(selection) {
  selectedRows.value = selection
  ids.value = selection.map((r) => r.id)
}

function resetForm() {
  form.value = {
    id: undefined,
    townshipName: '',
    villageName: '',
    orgNo: '',
    deptName: '',
    recorderName: '',
    journalDate: '',
    deepCultivationRecord: ''
  }
  proxy.resetForm('formRef')
}

function fillFormFromRow(row) {
  form.value = {
    id: row.id,
    townshipName: row.townshipName || '',
    villageName: row.villageName || '',
    orgNo: row.orgNo || '',
    deptName: row.deptName || '',
    recorderName: row.recorderName || '',
    journalDate: row.journalDate ? parseTime(row.journalDate, '{y}-{m}-{d}') : '',
    deepCultivationRecord: row.deepCultivationRecord || ''
  }
}

function handleView(row) {
  resetForm()
  readOnly.value = true
  dialogTitle.value = '查看周志'
  getVillageWeeklyJournal(row.id).then((res) => {
    fillFormFromRow(res.data)
    open.value = true
  })
}

function handleUpdate(row) {
  resetForm()
  readOnly.value = false
  dialogTitle.value = '修改周志'
  getVillageWeeklyJournal(row.id).then((res) => {
    fillFormFromRow(res.data)
    open.value = true
  })
}

function submitForm() {
  formRef.value?.validate((ok) => {
    if (!ok) return
    submitLoading.value = true
    updateVillageWeeklyJournal({
      id: form.value.id,
      // journalDate: form.value.journalDate,
      deepCultivationRecord: form.value.deepCultivationRecord
    })
      .then(() => {
        proxy.$modal.msgSuccess('修改成功')
        open.value = false
        getList()
      })
      .finally(() => {
        submitLoading.value = false
      })
  })
}

// function handleDelete() {
//   if (!ids.value.length) return
//   proxy.$modal
//     .confirm('是否确认删除选中的周志？')
//     .then(() => delVillageWeeklyJournal(ids.value.join(',')))
//     .then(() => {
//       getList()
//       proxy.$modal.msgSuccess('删除成功')
//     })
//     .catch(() => {})
// }

function applyRouteQuery() {
  const q = route.query
  if (q.townshipName != null && q.townshipName !== '') {
    queryParams.value.townshipName = String(q.townshipName)
    return loadVillages().then(() => {
      if (q.villageName != null && q.villageName !== '') {
        queryParams.value.villageName = String(q.villageName)
      }
    })
  }
  if (q.villageName != null && q.villageName !== '') {
    queryParams.value.villageName = String(q.villageName)
  }
  return Promise.resolve()
}

onMounted(() => {
  loadDeptOptions()
  loadTownships().then(() => applyRouteQuery()).then(() => getList())
})

onActivated(() => {
  loadTownships().then(() => applyRouteQuery()).then(() => getList())
})

watch(
  () => route.query,
  () => {
    loadTownships().then(() => applyRouteQuery()).then(() => handleQuery())
  }
)
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
.w-full {
  width: 100%;
}
.dict-tag-inline-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
