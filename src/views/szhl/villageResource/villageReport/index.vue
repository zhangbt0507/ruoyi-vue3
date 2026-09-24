<template>
  <div class="app-container village-report-page">
    <el-card shadow="never" class="selector-card">
      <el-form :inline="true" label-width="100px">
        <el-form-item label="街道 / 乡镇">
          <el-select
            v-model="townshipName"
            placeholder="请选择街道 / 乡镇"
            filterable
            clearable
            style="width: 240px"
            :loading="townshipLoading"
            @change="onTownshipChange"
          >
            <el-option
              v-for="item in townshipOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="社区 / 村">
          <el-select
            v-model="villageName"
            placeholder="请先选择街道"
            filterable
            clearable
            style="width: 240px"
            :disabled="!townshipName"
            :loading="villageLoading"
            @change="onVillageChange"
          >
            <el-option
              v-for="item in villageOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" :disabled="!townshipName || !villageName" @click="loadReport">
            查询
          </el-button>
          <el-button icon="Refresh" @click="resetSelection">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="reportLoading" shadow="never" class="report-card">
      <VillageReportContent
        v-if="report"
        :report="report"
        @navigate-journals="goJournalList"
      />
      <el-empty
        v-else-if="!reportLoading"
        description="请选择街道 / 乡镇与社区 / 村后查看资源采集表"
      />
    </el-card>
  </div>
</template>

<script setup name="VillageReport">
import { getCurrentInstance, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  listReportTownships,
  listReportVillages,
  getVillageReportByLocation
} from '@/api/szhl/villageResource/villageInfo'
import VillageReportContent from '../villageInfo/VillageReportContent.vue'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const townshipName = ref('')
const villageName = ref('')
const townshipOptions = ref([])
const villageOptions = ref([])
const townshipLoading = ref(false)
const villageLoading = ref(false)
const reportLoading = ref(false)
const report = ref(null)

function loadTownships() {
  townshipLoading.value = true
  return listReportTownships()
    .then((res) => {
      townshipOptions.value = res.data || []
    })
    .finally(() => {
      townshipLoading.value = false
    })
}

function loadVillages() {
  if (!townshipName.value) {
    villageOptions.value = []
    return Promise.resolve()
  }
  villageLoading.value = true
  return listReportVillages(townshipName.value)
    .then((res) => {
      villageOptions.value = res.data || []
      if (villageName.value && !villageOptions.value.includes(villageName.value)) {
        villageName.value = ''
        report.value = null
      }
    })
    .finally(() => {
      villageLoading.value = false
    })
}

function loadReport() {
  if (!townshipName.value || !villageName.value) {
    proxy.$modal.msgWarning('请选择街道 / 乡镇与社区 / 村')
    return
  }
  reportLoading.value = true
  getVillageReportByLocation(townshipName.value, villageName.value)
    .then((res) => {
      report.value = res.data
    })
    .catch(() => {
      report.value = null
    })
    .finally(() => {
      reportLoading.value = false
    })
}

function onTownshipChange() {
  villageName.value = ''
  report.value = null
  loadVillages()
}

function onVillageChange() {
  if (townshipName.value && villageName.value) {
    loadReport()
  } else {
    report.value = null
  }
}

function resetSelection() {
  townshipName.value = ''
  villageName.value = ''
  villageOptions.value = []
  report.value = null
}

function goJournalList() {
  const r = report.value
  if (!r) return
  router.push({
    path: '/villageResource/villageWeeklyJournal',
    query: {
      townshipName: r.townshipName || '',
      villageName: r.villageName || ''
    }
  })
}

function applyRouteQuery() {
  const t = route.query.townshipName
  const v = route.query.villageName
  if (!t) return
  townshipName.value = String(t)
  loadVillages().then(() => {
    if (v) {
      villageName.value = String(v)
      loadReport()
    }
  })
}

onMounted(() => {
  loadTownships().then(() => applyRouteQuery())
})

watch(
  () => route.query,
  () => {
    if (route.path.includes('villageReport') && route.query.townshipName) {
      applyRouteQuery()
    }
  }
)
</script>

<style scoped>
.village-report-page .selector-card {
  margin-bottom: 16px;
  border-radius: 10px;
}
.village-report-page .report-card {
  min-height: 320px;
  border-radius: 10px;
  background: #f0f2f5;
}
.village-report-page .report-card :deep(.el-card__body) {
  padding: 24px 28px 28px;
}
</style>
