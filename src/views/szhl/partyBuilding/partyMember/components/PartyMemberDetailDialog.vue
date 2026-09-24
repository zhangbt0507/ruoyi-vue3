<template>
  <el-dialog :model-value="visible" :title="title" width="900px" append-to-body destroy-on-close @close="handleClose">
    <div v-loading="loading">
      <div class="section-title">基础信息</div>
      <el-descriptions :column="2" border size="small" class="mb16">
        <el-descriptions-item label="姓名">{{ detail.xm || '—' }}</el-descriptions-item>
        <el-descriptions-item label="柜员号">{{ detail.gyh || '—' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderLabel(detail.xb) }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.lxdh || '—' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.sfzh || '—' }}</el-descriptions-item>
        <el-descriptions-item label="工作时间">{{ formatDate(detail.gzsj) }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ detail.xl || '—' }}</el-descriptions-item>
        <el-descriptions-item label="归属网点">
          <dict-tag :options="sys_org_name" :value="detail.gzdw" />
        </el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ formatDate(detail.csrq) }}</el-descriptions-item>
        <el-descriptions-item label="所属党支部">{{ detail.dzzmc || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ memberStatusLabel(detail.dyzt) }}</el-descriptions-item>
        <el-descriptions-item label="当前环节">{{ stageLabel(detail.hj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showTrainingContact" label="培养联系人">
          <span class="user-tag-list">
            <dict-tag v-if="detail.pylxrGyh" :options="sys_user_name" :value="detail.pylxrGyh" />
            <dict-tag v-if="detail.pylxr2Gyh" :options="sys_user_name" :value="detail.pylxr2Gyh" />
            <span v-if="!detail.pylxrGyh && !detail.pylxr2Gyh">—</span>
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="showPartyIntroducer" label="入党介绍人">
          <span class="user-tag-list">
            <dict-tag v-if="detail.rdjsrGyh" :options="sys_user_name" :value="detail.rdjsrGyh" />
            <dict-tag v-if="detail.rdjsr2Gyh" :options="sys_user_name" :value="detail.rdjsr2Gyh" />
            <span v-if="!detail.rdjsrGyh && !detail.rdjsr2Gyh">—</span>
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="showPartyJobFields" label="党内职务">{{ detail.dnzw || '—' }}</el-descriptions-item>
        <el-descriptions-item v-if="showPartyJobFields" label="岗位职务">{{ detail.gwzw || '—' }}</el-descriptions-item>
        <el-descriptions-item v-if="showArchiveFields" label="组织关系">{{ orgRelationLabel(detail.zzgx) }}</el-descriptions-item>
        <el-descriptions-item v-if="showArchiveFields" label="党员状态">{{ memberWorkStatusLabel(detail.ryzt) }}</el-descriptions-item>
        <el-descriptions-item v-if="showArchiveFields" label="是否有处分">{{ hasDisciplineLabel(detail.sfycf) }}</el-descriptions-item>
        <el-descriptions-item v-if="showArchiveFields" label="处分说明" :span="2">
          {{ detail.sfycf === '1' ? (detail.cfsm || '—') : '—' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="section-title">关键时间节点</div>
      <el-descriptions :column="2" border size="small" class="mb16">
        <el-descriptions-item label="申请入党日期">{{ formatDate(detail.sqrdrq) }}</el-descriptions-item>
        <el-descriptions-item label="提交申请书时间">{{ formatDateTime(detail.tjrdsssj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showBecomeActivist" label="成为积极分子">{{ formatDate(detail.jjfzsj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showBecomeDevelopment" label="成为发展对象">{{ formatDate(detail.fzdxsj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showBecomeProbationary" label="成为预备党员">{{ formatDate(detail.ybdysj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showBecomeFormal" label="成为正式党员">{{ formatDate(detail.zzdysj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showPartyJoinDate" label="入党时间">{{ formatDate(detail.rdsj) }}</el-descriptions-item>
        <el-descriptions-item v-if="showTransferRemind" label="下次转正提醒">{{ formatDate(detail.xczztxr) }}</el-descriptions-item>
        <el-descriptions-item v-if="showDelayCount" label="延期次数">{{ detail.yqcs ?? 0 }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">发展资料</div>
      <el-table :data="groupedMaterialRows" size="small" max-height="320" empty-text="暂无资料"
        border :span-method="materialSpanMethod" class="material-table">
        <el-table-column label="状态" prop="statusLabel" width="130" align="center" />
        <el-table-column label="资料类型" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ materialTypeLabel(scope.row.material.materialType) }}</template>
        </el-table-column>
        <el-table-column v-if="showMaterialApplyType" label="申请类型" width="90" align="center">
          <template #default="scope">{{ scope.row.applyTypeLabel || '—' }}</template>
        </el-table-column>
        <el-table-column label="文件名" min-width="300" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.material.fileName || '—' }}</template>
        </el-table-column>
        <el-table-column v-if="showMaterialPeriod" label="期次" width="100" align="center">
          <template #default="scope">{{ scope.row.material.periodKey || '—' }}</template>
        </el-table-column>
        <el-table-column v-if="showMaterialReceipt" label="回执" width="100" align="center">
          <template #default="scope">
            <span>{{ materialReceiptLabel(scope.row.material) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="120" align="center">
          <template #default="scope">{{ formatDate(scope.row.material.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="scope">
            <el-link v-if="scope.row.material.fileUrl" type="primary"
              :href="fileUrl(scope.row.material.fileUrl)" target="_blank">查看</el-link>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>

      <el-descriptions v-if="detail.remark" :column="1" border size="small" class="mt16">
        <el-descriptions-item label="备注">{{ detail.remark }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="handleClose">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/** 党建管理 - 党员详情弹窗 */
import { ref, watch, computed } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  getPartyMember,
  listPartyMemberMaterial,
  memberStatusLabel,
  stageLabel,
  materialTypeLabel,
  buildGroupedMaterialRows,
  materialReceiptLabel,
  orgRelationLabel,
  memberWorkStatusLabel,
  hasDisciplineLabel
} from '@/api/szhl/partyBuilding/partyMember'

const { proxy } = getCurrentInstance()
const { sys_org_name, sys_user_name } = proxy.useDict('sys_org_name', 'sys_user_name')

const props = defineProps({
  visible: { type: Boolean, default: false },
  memberGyh: { type: String, default: '' },
  showPartyJobFields: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible'])

const loading = ref(false)
const detail = ref({})
const materialList = ref([])

const title = computed(() => '党员详情 - ' + (detail.value.xm || ''))
const isApplyMember = computed(() => detail.value.dyzt === '1')
const isActivistMember = computed(() => detail.value.dyzt === '2')
const isDevelopmentMember = computed(() => detail.value.dyzt === '3')
const isProbationaryMember = computed(() => detail.value.dyzt === '4')
const isFormalMember = computed(() => detail.value.dyzt === '5')
const groupedMaterialRows = computed(() => buildGroupedMaterialRows(materialList.value))

const showTrainingContact = computed(() => !isApplyMember.value)
const showPartyIntroducer = computed(() => !isApplyMember.value && !isActivistMember.value)
const showBecomeActivist = computed(() => !isApplyMember.value)
const showBecomeDevelopment = computed(() => !isApplyMember.value && !isActivistMember.value)
const showLaterStageTimeline = computed(() => !isApplyMember.value && !isActivistMember.value && !isDevelopmentMember.value)
const showBecomeProbationary = computed(() => showLaterStageTimeline.value)
const showBecomeFormal = computed(() => isFormalMember.value)
const showPartyJoinDate = computed(() => isFormalMember.value)
const showTransferRemind = computed(() => showLaterStageTimeline.value && !isFormalMember.value)
const showDelayCount = computed(() => showLaterStageTimeline.value && !isFormalMember.value)
const showMaterialPeriod = computed(() =>
  isActivistMember.value || isDevelopmentMember.value || isProbationaryMember.value || isFormalMember.value
)
const showMaterialReceipt = computed(() =>
  isDevelopmentMember.value || isProbationaryMember.value || isFormalMember.value
)
const showMaterialApplyType = computed(() => showMaterialReceipt.value)
/** 正式党员详情，或组织管理党员列表详情 */
const showArchiveFields = computed(() => isFormalMember.value || props.showPartyJobFields)

const genderOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' }
]

/** 获取性别显示名称 */
function genderLabel(value) {
  return genderOptions.find(item => item.value === value)?.label || value || '—'
}

/** 格式化日期显示 */
function formatDate(value) {
  return value ? parseTime(value, '{y}-{m}-{d}') : '—'
}

/** 格式化日期时间显示 */
function formatDateTime(value) {
  return value ? parseTime(value, '{y}-{m}-{d} {h}:{i}') : '—'
}

/** 拼接完整文件访问地址 */
function fileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return import.meta.env.VITE_APP_BASE_API + url
}

/** 发展资料表格状态列合并 */
function materialSpanMethod({ row, columnIndex }) {
  if (columnIndex === 0) {
    if (row.statusRowspan > 0) {
      return { rowspan: row.statusRowspan, colspan: 1 }
    }
    return { rowspan: 0, colspan: 0 }
  }
}

/** 加载党员详情及资料 */
function loadDetail() {
  if (!props.memberGyh) return
  loading.value = true
  Promise.all([
    getPartyMember(props.memberGyh),
    listPartyMemberMaterial({ memberGyh: props.memberGyh })
  ]).then(([memberRes, materialRes]) => {
    detail.value = memberRes.data || {}
    materialList.value = materialRes.data || []
  }).finally(() => {
    loading.value = false
  })
}

watch(() => props.visible, (val) => {
  if (!val) return
  detail.value = {}
  materialList.value = []
  loadDetail()
})

/** 关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
}
</script>

<style scoped>
.user-tag-list {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}
.mb16 {
  margin-bottom: 16px;
}
.mt16 {
  margin-top: 16px;
}
.material-table :deep(.el-table__cell) {
  vertical-align: middle;
}
</style>
