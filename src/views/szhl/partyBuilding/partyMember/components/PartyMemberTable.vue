<template>
  <el-table v-loading="loading" :data="list">
    <template v-if="isApplyPreset">
      <el-table-column label="姓名" align="center" prop="xm" min-width="90" />
      <el-table-column label="性别" align="center" prop="xb" width="70">
        <template #default="scope">
          <span>{{ genderLabel(scope.row.xb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出生日期" align="center" prop="csrq" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.csrq) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学历" align="center" prop="xl" min-width="90" />
      <el-table-column label="所属网点" align="center" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="sys_org_name" :value="scope.row.gzdw" />
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="sqrdrq" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.sqrdrq) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="环节" align="center" prop="hj" width="120">
        <template #default="scope">
          <PartyMemberStageTag :hj="scope.row.hj" :row="scope.row" />
        </template>
      </el-table-column>
    </template>
    <template v-else-if="isActivistPreset">
      <el-table-column label="姓名" align="center" prop="xm" min-width="90" />
      <el-table-column label="性别" align="center" prop="xb" width="70">
        <template #default="scope">
          <span>{{ genderLabel(scope.row.xb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出生日期" align="center" prop="csrq" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.csrq) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="sqrdrq" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.sqrdrq) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成为积极分子时间" align="center" prop="jjfzsj" width="130">
        <template #default="scope">
          <span>{{ formatDate(scope.row.jjfzsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="培养联系人" align="center" min-width="140" show-overflow-tooltip>
        <template #default="scope">
          <span class="user-tag-list">
            <dict-tag v-if="scope.row.pylxrGyh" :options="sys_user_name" :value="scope.row.pylxrGyh" />
            <dict-tag v-if="scope.row.pylxr2Gyh" :options="sys_user_name" :value="scope.row.pylxr2Gyh" />
            <span v-if="!scope.row.pylxrGyh && !scope.row.pylxr2Gyh">—</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="所属党组织" align="center" prop="dzzmc" min-width="140" show-overflow-tooltip />
      <el-table-column label="环节" align="center" prop="hj" width="120">
        <template #default="scope">
          <PartyMemberStageTag :hj="scope.row.hj" :row="scope.row" />
        </template>
      </el-table-column>
    </template>
    <template v-else-if="isDevelopmentPreset">
      <el-table-column label="姓名" align="center" prop="xm" min-width="90" />
      <el-table-column label="性别" align="center" prop="xb" width="70">
        <template #default="scope">
          <span>{{ genderLabel(scope.row.xb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成为积极分子时间" align="center" prop="jjfzsj" width="130">
        <template #default="scope">
          <span>{{ formatDate(scope.row.jjfzsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成为发展对象时间" align="center" prop="fzdxsj" width="130">
        <template #default="scope">
          <span>{{ formatDate(scope.row.fzdxsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入党介绍人" align="center" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span class="user-tag-list">
            <dict-tag v-if="scope.row.rdjsrGyh" :options="sys_user_name" :value="scope.row.rdjsrGyh" />
            <dict-tag v-if="scope.row.rdjsr2Gyh" :options="sys_user_name" :value="scope.row.rdjsr2Gyh" />
            <span v-if="!scope.row.rdjsrGyh && !scope.row.rdjsr2Gyh">—</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="所属党组织" align="center" prop="dzzmc" min-width="140" show-overflow-tooltip />
      <el-table-column label="环节" align="center" prop="hj" width="120">
        <template #default="scope">
          <PartyMemberStageTag :hj="scope.row.hj" :row="scope.row" />
        </template>
      </el-table-column>
    </template>
    <template v-else-if="isProbationaryPreset">
      <el-table-column label="姓名" align="center" prop="xm" min-width="90" />
      <el-table-column label="性别" align="center" prop="xb" width="70">
        <template #default="scope">
          <span>{{ genderLabel(scope.row.xb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成为发展对象时间" align="center" prop="fzdxsj" width="130">
        <template #default="scope">
          <span>{{ formatDate(scope.row.fzdxsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成为预备党员时间" align="center" prop="ybdysj" width="130">
        <template #default="scope">
          <span>{{ formatDate(scope.row.ybdysj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入党介绍人" align="center" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span class="user-tag-list">
            <dict-tag v-if="scope.row.rdjsrGyh" :options="sys_user_name" :value="scope.row.rdjsrGyh" />
            <dict-tag v-if="scope.row.rdjsr2Gyh" :options="sys_user_name" :value="scope.row.rdjsr2Gyh" />
            <span v-if="!scope.row.rdjsrGyh && !scope.row.rdjsr2Gyh">—</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="所属党组织" align="center" prop="dzzmc" min-width="140" show-overflow-tooltip />
      <el-table-column label="环节" align="center" prop="hj" width="120">
        <template #default="scope">
          <PartyMemberStageTag :hj="scope.row.hj" :row="scope.row" show-transfer-remind />
        </template>
      </el-table-column>
    </template>
    <template v-else-if="isFormalPreset">
      <el-table-column label="姓名" align="center" prop="xm" min-width="90" />
      <el-table-column label="性别" align="center" prop="xb" width="70">
        <template #default="scope">
          <span>{{ genderLabel(scope.row.xb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出生日期" align="center" prop="csrq" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.csrq) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属党组织" align="center" prop="dzzmc" min-width="140" show-overflow-tooltip />
      <el-table-column label="入党时间" align="center" prop="rdsj" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.rdsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入党介绍人" align="center" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span class="user-tag-list">
            <dict-tag v-if="scope.row.rdjsrGyh" :options="sys_user_name" :value="scope.row.rdjsrGyh" />
            <dict-tag v-if="scope.row.rdjsr2Gyh" :options="sys_user_name" :value="scope.row.rdjsr2Gyh" />
            <span v-if="!scope.row.rdjsrGyh && !scope.row.rdjsr2Gyh">—</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="党内职务" align="center" prop="dnzw" min-width="120" show-overflow-tooltip />
      <el-table-column label="组织关系" align="center" prop="zzgx" width="90">
        <template #default="scope">
          <PartyMemberArchiveTag :label="orgRelationLabel(scope.row.zzgx)"
            :display-class="orgRelationDisplayClass(scope.row.zzgx)" />
        </template>
      </el-table-column>
      <el-table-column label="党员状态" align="center" prop="ryzt" width="90">
        <template #default="scope">
          <PartyMemberArchiveTag :label="memberWorkStatusLabel(scope.row.ryzt)"
            :display-class="memberWorkStatusDisplayClass(scope.row.ryzt)" />
        </template>
      </el-table-column>
      <el-table-column label="是否有处分" align="center" prop="sfycf" width="100">
        <template #default="scope">
          <PartyMemberArchiveTag :label="hasDisciplineLabel(scope.row.sfycf)"
            :display-class="hasDisciplineDisplayClass(scope.row.sfycf)" />
        </template>
      </el-table-column>
    </template>
    <template v-else>
      <el-table-column label="序号" type="index" width="60" align="center" :index="indexMethod" />
      <el-table-column label="姓名" align="center" prop="xm" min-width="90" />
      <el-table-column v-if="showStage" label="环节" align="center" prop="hj" width="120">
        <template #default="scope">
          <PartyMemberStageTag :hj="scope.row.hj" :row="scope.row" show-transfer-remind />
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" prop="xb" width="70">
        <template #default="scope">
          <span>{{ genderLabel(scope.row.xb) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身份证号" align="center" prop="sfzh" min-width="170" show-overflow-tooltip />
      <el-table-column label="联系电话" align="center" prop="lxdh" min-width="120" />
      <el-table-column v-if="showGzdw" label="归属网点" align="center" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="sys_org_name" :value="scope.row.gzdw" />
        </template>
      </el-table-column>
      <el-table-column label="入党时间" align="center" prop="rdsj" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.rdsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作时间" align="center" prop="gzsj" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.gzsj) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showPartyJobFields" label="党内职务" align="center" prop="dnzw" min-width="100"
        show-overflow-tooltip />
      <el-table-column v-if="showPartyJobFields" label="岗位职务" align="center" prop="gwzw" min-width="100"
        show-overflow-tooltip />
      <el-table-column label="学历" align="center" prop="xl" min-width="90" />
      <el-table-column label="出生日期" align="center" prop="csrq" width="110">
        <template #default="scope">
          <span>{{ formatDate(scope.row.csrq) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属党支部" align="center" prop="dzzmc" min-width="140" show-overflow-tooltip />
      <el-table-column v-if="showStatus" label="状态" align="center" prop="dyzt" width="110">
        <template #default="scope">
          <span>{{ memberStatusLabel(scope.row.dyzt) }}</span>
        </template>
      </el-table-column>
    </template>
    <el-table-column v-if="showActions || showEditOnly" label="操作" align="center"
      :width="actionColumnWidth" fixed="right" class-name="small-padding fixed-width">
      <template #default="scope">
        <div v-if="useActionRows" class="action-rows">
          <div class="action-row">
            <el-button link type="primary" icon="View" @click="handleDetail(scope.row)"
              v-hasPermi="['data:partyMember:list']">查看</el-button>
            <el-button v-if="showEditOnly || showActions" link type="primary" icon="Edit"
              @click="$emit('update', scope.row)" v-hasPermi="['data:partyMember:edit']">修改</el-button>
            <el-button v-if="!showEditOnly && canAdd" link type="primary" icon="Delete"
              @click="$emit('delete', scope.row)" v-hasPermi="['data:partyMember:remove']">删除</el-button>
          </div>
          <div v-if="!showEditOnly && showStageActions" class="action-row">
            <PartyMemberStageActions :row="scope.row" @success="$emit('refresh')" />
          </div>
        </div>
        <template v-else>
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)"
            v-hasPermi="['data:partyMember:list']">查看</el-button>
          <el-button v-if="showEditOnly || showActions" link type="primary" icon="Edit" @click="$emit('update', scope.row)"
            v-hasPermi="['data:partyMember:edit']">修改</el-button>
          <template v-if="!showEditOnly && showStageActions">
            <PartyMemberStageActions :row="scope.row" @success="$emit('refresh')" />
          </template>
          <el-button v-if="!showEditOnly && canAdd" link type="primary" icon="Delete" @click="$emit('delete', scope.row)"
            v-hasPermi="['data:partyMember:remove']">删除</el-button>
        </template>
      </template>
    </el-table-column>
  </el-table>

  <PartyMemberDetailDialog v-model:visible="detailOpen" :member-gyh="detailGyh"
    :show-party-job-fields="showPartyJobFields" />
</template>

<script setup>
/** 党建管理 - 党员表格 */
import { ref, computed } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import {
  memberStatusLabel,
  orgRelationLabel,
  memberWorkStatusLabel,
  hasDisciplineLabel,
  orgRelationDisplayClass,
  memberWorkStatusDisplayClass,
  hasDisciplineDisplayClass
} from '@/api/szhl/partyBuilding/partyMember'
import PartyMemberStageActions from './PartyMemberStageActions.vue'
import PartyMemberDetailDialog from './PartyMemberDetailDialog.vue'
import PartyMemberStageTag from './PartyMemberStageTag.vue'
import PartyMemberArchiveTag from './PartyMemberArchiveTag.vue'

const props = defineProps({
  list: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pageNum: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  columnPreset: { type: String, default: 'default' },
  showStatus: { type: Boolean, default: true },
  showStage: { type: Boolean, default: true },
  showPartyJobFields: { type: Boolean, default: false },
  showGzdw: { type: Boolean, default: false },
  showActions: { type: Boolean, default: false },
  showStageActions: { type: Boolean, default: true },
  showEditOnly: { type: Boolean, default: false },
  canAdd: { type: Boolean, default: false }
})

defineEmits(['update', 'delete', 'refresh'])

const { proxy } = getCurrentInstance()
const { sys_org_name, sys_user_name } = proxy.useDict('sys_org_name', 'sys_user_name')

const isApplyPreset = computed(() => props.columnPreset === 'apply')
const isActivistPreset = computed(() => props.columnPreset === 'activist')
const isDevelopmentPreset = computed(() => props.columnPreset === 'development')
const isProbationaryPreset = computed(() => props.columnPreset === 'probationary')
const isFormalPreset = computed(() => props.columnPreset === 'formal')

const useActionRows = computed(() =>
  isApplyPreset.value || isActivistPreset.value || isDevelopmentPreset.value || isProbationaryPreset.value)

const actionColumnWidth = computed(() => {
  if (props.showEditOnly) return 180
  if (isApplyPreset.value) return 220
  if (isActivistPreset.value) return 300
  if (isDevelopmentPreset.value) return 280
  if (isProbationaryPreset.value) return 320
  if (isFormalPreset.value) return 220
  return 480
})

const detailOpen = ref(false)
const detailGyh = ref('')

/** 打开党员详情弹窗 */
function handleDetail(row) {
  detailGyh.value = row.gyh
  detailOpen.value = true
}

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

/** 计算分页序号 */
function indexMethod(index) {
  return (props.pageNum - 1) * props.pageSize + index + 1
}
</script>

<style scoped>
.ml4 {
  margin-left: 4px;
}

.user-tag-list {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.action-rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
</style>
