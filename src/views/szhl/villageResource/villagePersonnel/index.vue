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
      <el-form-item label="客户分类" prop="customerCategory">
        <el-input v-model="queryParams.customerCategory" placeholder="客户分类" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="personName">
        <el-input v-model="queryParams.personName" placeholder="姓名" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search"  @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="!ids.length" @click="handleDelete" v-hasPermi="['szhl:villagePersonnel:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="乡镇名称" prop="townshipName" min-width="120" show-overflow-tooltip />
      <el-table-column label="村名" prop="villageName" min-width="100" show-overflow-tooltip />
      <el-table-column label="客户分类" prop="customerCategory" min-width="140" show-overflow-tooltip />
      <el-table-column label="姓名" prop="personName" width="100" show-overflow-tooltip />
      <el-table-column label="证件号" prop="idCard" min-width="170" show-overflow-tooltip />
      <el-table-column label="联系电话" prop="phoneNumber" width="120" show-overflow-tooltip />
      <el-table-column label="门牌号" prop="houseNumber" width="100" show-overflow-tooltip />
      <el-table-column label="配偶姓名" prop="spouseName" width="100" show-overflow-tooltip />
      <el-table-column label="配偶证件号" prop="spouseIdCard" min-width="170" show-overflow-tooltip />
      <el-table-column label="资源说明" prop="resourceDesc" width="160" show-overflow-tooltip />
      <el-table-column label="操作" align="center" min-width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['szhl:villagePersonnel:remove']">删除</el-button>
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

    <el-dialog :title="title" v-model="open" width="640px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="乡镇名称" prop="townshipName">
              <el-input v-model="form.townshipName" placeholder="请输入乡镇名称" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="村名" prop="villageName">
              <el-input v-model="form.villageName" placeholder="请输入村名" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="客户分类" prop="customerCategory">
              <el-input v-model="form.customerCategory" placeholder="请输入客户分类" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="personName">
              <el-input v-model="form.personName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门牌号" prop="houseNumber">
              <el-input v-model="form.houseNumber" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配偶姓名" prop="spouseName">
              <el-input v-model="form.spouseName" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配偶证件号" prop="spouseIdCard">
              <el-input v-model="form.spouseIdCard" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="资源说明" prop="resourceDesc">
              <el-input v-model="form.resourceDesc" type="textarea" :rows="3" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>

    </el-dialog>

  </div>

</template>



<script setup name="VillagePersonnel">

import { getCurrentInstance, onActivated, onMounted, reactive, ref, toRefs } from 'vue'

import { listVillagePersonnel, getVillagePersonnel, updateVillagePersonnel, delVillagePersonnel } from '@/api/szhl/villageResource/villagePersonnel'
import { useVillageLocationOptions } from '../composables/useVillageLocationOptions'



const { proxy } = getCurrentInstance()


const dataList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')
const submitLoading = ref(false)
const formRef = ref(null)
const ids = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    townshipName: undefined,
    villageName: undefined,
    customerCategory: undefined,
    personName: undefined
  },
  form: {},
  rules: {
    townshipName: [{ required: true, message: '乡镇名称不能为空', trigger: 'blur' }],
    villageName: [{ required: true, message: '村名不能为空', trigger: 'blur' }],
    customerCategory: [{ required: true, message: '客户分类不能为空', trigger: 'blur' }],
    personName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
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

function getList() {
  // if (!queryParams.value.townshipName || !queryParams.value.villageName) {
  //   dataList.value = []
  //   total.value = 0
  //   return
  // }

  loading.value = true
  listVillagePersonnel(queryParams.value)
    .then((res) => {
      dataList.value = res.rows
      total.value = res.total
    })
    .finally(() => {
      loading.value = false
    })
}



function handleQuery() {
  // if (!queryParams.value.townshipName || !queryParams.value.villageName) {
  //   proxy.$modal.msgWarning('请选择乡镇与村')
  //   dataList.value = []
  //   total.value = 0
  //   return
  // }
debugger
  queryParams.value.pageNum = 1
  getList()
}



function resetQuery() {
  proxy.resetForm('queryRef')
  clearVillageOptions()
  queryParams.value.pageNum = 1
  dataList.value = []
  total.value = 0
}



function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
}

function handleDelete(row) {
  const deleteIds = row?.id ? [row.id] : ids.value
  if (!deleteIds.length) {
    proxy.$modal.msgWarning('请选择要删除的数据')
    return
  }
  proxy.$modal
    .confirm('是否确认删除选中的村人员？')
    .then(() => delVillagePersonnel(deleteIds.join(',')))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 按当前查询条件导出村人员（与村信息页「导出人员」同一接口） */
function handleExport() {
  if (!queryParams.value.townshipName || !queryParams.value.villageName) {
    proxy.$modal.msgWarning('请选择乡镇与村')
    return
  }
  const q = queryParams.value
  const township = q.townshipName
  const village = q.villageName
  proxy.download(
    'szhl/villagePersonnel/export',
    {
      townshipName: q.townshipName,
      villageName: q.villageName,
      customerCategory: q.customerCategory,
      personName: q.personName
    },
    `村人员信息_${township}_${village}_${new Date().getTime()}.xlsx`
  )
}
function resetForm() {
  form.value = {
    id: undefined,
    townshipName: undefined,
    villageName: undefined,
    customerCategory: undefined,
    personName: undefined,
    idCard: undefined,
    phoneNumber: undefined,
    houseNumber: undefined,
    spouseName: undefined,
    spouseIdCard: undefined,
    resourceDesc: undefined,
    remark: undefined
  }
  proxy.resetForm('formRef')
}


function cancel() {
  open.value = false
  submitLoading.value = false
  resetForm()
}



function handleUpdate(row) {
  resetForm()
  getVillagePersonnel(row.id, {
    villageName: row.villageName,
    idCard: row.idCard,
    customerCategory: row.customerCategory
  }).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '修改村人员'
  })
}



function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    updateVillagePersonnel(form.value)
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

onMounted(() => {
  loadTownships()
})

onActivated(() => {
  // if (queryParams.value.townshipName && queryParams.value.villageName) {
    getList()
  // }
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>

