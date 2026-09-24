<template>
  <div class="stage-actions">
    <!-- 申请入党 -->
    <template v-if="row.dyzt === '1'">
      <el-button v-if="canUploadTalk" v-hasPermi="[STAGE_BUTTON_PERMS.UPLOAD_TALK]" link type="primary"
        icon="Upload" @click="openMaterial(MATERIAL_TYPE.THZL, '谈话资料')">谈话</el-button>
      <el-button v-if="row.hj === MEMBER_STAGE.APPLY_AUDIT" v-hasPermi="[STAGE_BUTTON_PERMS.AUDIT_APPLY]"
        link type="primary" icon="CircleCheck" @click="openApplyAudit">审核</el-button>
    </template>

    <!-- 入党积极分子 -->
    <template v-if="row.dyzt === '2'">
      <el-button v-if="row.hj === MEMBER_STAGE.ACTIVIST_PENDING"
        v-hasPermi="[STAGE_BUTTON_PERMS.CONFIRM_ACTIVIST]" link type="primary" icon="FolderOpened"
        @click="openActivistConfirmPanel">确定积极分子</el-button>
      <el-button v-if="row.hj === MEMBER_STAGE.ACTIVIST_CONFIRMED"
        v-hasPermi="ACTIVIST_MATERIAL_PERMS" link type="primary" icon="Upload"
        @click="openMaterial(MATERIAL_TYPE.JDSXHB, '季度思想汇报', true)">思想汇报</el-button>
      <el-button v-if="row.hj === MEMBER_STAGE.ACTIVIST_CONFIRMED"
        v-hasPermi="ACTIVIST_MATERIAL_PERMS" link type="primary" icon="Upload"
        @click="openMaterial(MATERIAL_TYPE.BNKC, '半年考察资料', true)">考察资料</el-button>
      <el-tooltip v-if="row.hj === MEMBER_STAGE.ACTIVIST_CONFIRMED" :content="activistAuditTip(row)"
        :disabled="isActivistAuditAvailable(row)" placement="top">
        <span v-hasPermi="[STAGE_BUTTON_PERMS.AUDIT_ACTIVIST]" class="inline-btn-wrap">
          <el-button link type="primary" icon="CircleCheck" :disabled="!isActivistAuditAvailable(row)"
            @click="doAction(STAGE_ACTION.AUDIT_ACTIVIST, '确认审核通过并进入待定发展对象？')">审核确认</el-button>
        </span>
      </el-tooltip>
    </template>

    <!-- 发展对象 -->
    <template v-if="row.dyzt === '3'">
      <el-button v-if="row.hj === MEMBER_STAGE.DEV_PENDING" v-hasPermi="[STAGE_BUTTON_PERMS.CONFIRM_DEV]"
        link type="primary" icon="FolderOpened" @click="openDevConfirmPanel">确定发展对象</el-button>
      <el-button v-if="row.hj === MEMBER_STAGE.DEV_CONFIRMED" v-hasPermi="[STAGE_BUTTON_PERMS.UPLOAD_DEV_THOUGHT]"
        link type="primary" icon="Upload"
        @click="openMaterial(MATERIAL_TYPE.FZSXHB, '思想汇报', true)">思想汇报</el-button>
      <el-button v-if="row.hj === MEMBER_STAGE.DEV_CONFIRMED" v-hasPermi="[STAGE_BUTTON_PERMS.AUDIT_DEV]"
        link type="primary" icon="CircleCheck"
        @click="doAction(STAGE_ACTION.AUDIT_DEV, '确认审核通过并进入待定预备党员？')">审核确认</el-button>
    </template>

    <!-- 预备党员 -->
    <template v-if="row.dyzt === '4'">
      <el-tag v-if="transferRemindDue" type="warning" size="small" class="remind-tag">转正提醒</el-tag>
      <el-button v-if="row.hj === MEMBER_STAGE.PROB_PENDING" v-hasPermi="[STAGE_BUTTON_PERMS.CONFIRM_PROB]"
        link type="primary" icon="FolderOpened" @click="openProbConfirmPanel">确定预备党员</el-button>
      <template v-if="row.hj === MEMBER_STAGE.PROB_CONFIRMED">
        <el-button v-hasPermi="[STAGE_BUTTON_PERMS.SUBMIT_TRANSFER]" link type="primary" icon="Promotion"
          @click="openTransferApplyPanel">转正/延期申请</el-button>
      </template>
      <template v-if="row.hj === MEMBER_STAGE.PROB_TRANSFER">
        <el-button v-hasPermi="[STAGE_BUTTON_PERMS.APPROVE_FORMAL]" link type="primary" icon="CircleCheck"
          @click="openTransferApprovePanel('transfer')">同意转正</el-button>
        <el-button v-hasPermi="[STAGE_BUTTON_PERMS.APPROVE_DELAY]" link type="primary" icon="Clock"
          @click="openTransferApprovePanel('delay')">同意延期</el-button>
      </template>
    </template>

    <PartyMemberActivistConfirmDialog v-model:visible="activistPanelOpen" :member="row"
      @success="$emit('success')" />

    <PartyMemberDevConfirmDialog v-model:visible="devPanelOpen" :member="row"
      @success="$emit('success')" />

    <PartyMemberProbConfirmDialog v-model:visible="probPanelOpen" :member="row"
      @success="$emit('success')" />

    <PartyMemberTransferApplyDialog v-model:visible="transferApplyOpen" :member="row"
      @success="$emit('success')" />

    <PartyMemberTransferApproveDialog v-model:visible="transferApproveOpen" :member="row"
      :apply-type="transferApproveType" @success="$emit('success')" />

    <PartyMemberMaterialDialog v-model:visible="materialOpen" :member-gyh="row.gyh"
      :material-type="currentMaterialType" :material-label="currentMaterialLabel"
      :show-period="materialShowPeriod" :need-receipt="currentNeedReceipt" :member-hj="row.hj"
      @success="$emit('success')" />

    <el-dialog v-model="applyAuditOpen" title="审核" width="680px" append-to-body destroy-on-close>
      <div v-loading="applyAuditLoading">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="入党申请书">
            <template v-if="applyAuditMaterials.rdsss">
              <el-link type="primary" :href="fileUrl(applyAuditMaterials.rdsss.fileUrl)" target="_blank">
                {{ applyAuditMaterials.rdsss.fileName || '查看文件' }}
              </el-link>
            </template>
            <el-tag v-else type="danger" size="small">未上传</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="谈话资料">
            <template v-if="applyAuditMaterials.thzl">
              <el-link type="primary" :href="fileUrl(applyAuditMaterials.thzl.fileUrl)" target="_blank">
                {{ applyAuditMaterials.thzl.fileName || '查看文件' }}
              </el-link>
            </template>
            <el-tag v-else type="danger" size="small">未上传</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button type="primary" :disabled="!canApplyAuditPass" v-hasPermi="[STAGE_BUTTON_PERMS.AUDIT_APPLY]"
          @click="submitApplyAudit">审核通过</el-button>
        <el-button type="danger" v-hasPermi="[STAGE_BUTTON_PERMS.AUDIT_APPLY]"
          @click="submitApplyReject">审核未通过</el-button>
        <el-button @click="applyAuditOpen = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/** 党建管理 - 党员环节操作 */
import { ref, computed } from 'vue'
import {
  executeStageAction,
  listPartyMemberMaterial,
  MEMBER_STAGE,
  STAGE_ACTION,
  STAGE_BUTTON_PERMS,
  ACTIVIST_MATERIAL_PERMS,
  MATERIAL_TYPE,
  isTransferRemindDue,
  isActivistAuditAvailable,
  getActivistAuditEligibleDate
} from '@/api/szhl/partyBuilding/partyMember'
import { parseTime } from '@/utils/ruoyi'
import PartyMemberMaterialDialog from './PartyMemberMaterialDialog.vue'
import PartyMemberActivistConfirmDialog from './PartyMemberActivistConfirmDialog.vue'
import PartyMemberDevConfirmDialog from './PartyMemberDevConfirmDialog.vue'
import PartyMemberProbConfirmDialog from './PartyMemberProbConfirmDialog.vue'
import PartyMemberTransferApplyDialog from './PartyMemberTransferApplyDialog.vue'
import PartyMemberTransferApproveDialog from './PartyMemberTransferApproveDialog.vue'

const props = defineProps({
  row: { type: Object, required: true }
})

const emit = defineEmits(['success'])

const { proxy } = getCurrentInstance()

const materialOpen = ref(false)
const activistPanelOpen = ref(false)
const devPanelOpen = ref(false)
const probPanelOpen = ref(false)
const transferApplyOpen = ref(false)
const transferApproveOpen = ref(false)
const transferApproveType = ref('transfer')
const currentMaterialType = ref('')
const currentMaterialLabel = ref('')
const materialShowPeriod = ref(false)
const currentNeedReceipt = ref(false)

const applyAuditOpen = ref(false)
const applyAuditLoading = ref(false)
const applyAuditMaterials = ref({ rdsss: null, thzl: null })

const transferRemindDue = computed(() => isTransferRemindDue(props.row))
const canApplyAuditPass = computed(() => !!applyAuditMaterials.value.rdsss && !!applyAuditMaterials.value.thzl)
const canUploadTalk = computed(() =>
  props.row.hj === MEMBER_STAGE.APPLY_TALK || props.row.hj === MEMBER_STAGE.APPLY_TALK_OVERDUE
)

/** 获取积极分子审核确认提示文本 */
function activistAuditTip(row) {
  const eligible = getActivistAuditEligibleDate(row?.jjfzsj)
  if (!eligible) {
    return '请先完成确定积极分子'
  }
  return `确定积极分子满一年后可操作（最早 ${parseTime(eligible, '{y}-{m}-{d}')}）`
}

/** 打开资料上传弹窗 */
function openMaterial(type, label, showPeriod = false, needReceiptFlag = false) {
  currentMaterialType.value = type
  currentMaterialLabel.value = label
  materialShowPeriod.value = showPeriod
  currentNeedReceipt.value = needReceiptFlag
  materialOpen.value = true
}

/** 打开确定积极分子弹窗 */
function openActivistConfirmPanel() {
  activistPanelOpen.value = true
}

/** 打开确定发展对象弹窗 */
function openDevConfirmPanel() {
  devPanelOpen.value = true
}

/** 打开确定预备党员弹窗 */
function openProbConfirmPanel() {
  probPanelOpen.value = true
}

/** 打开转正/延期申请弹窗 */
function openTransferApplyPanel() {
  transferApplyOpen.value = true
}

/** 打开转正/延期审批弹窗 */
function openTransferApprovePanel(type) {
  transferApproveType.value = type
  transferApproveOpen.value = true
}

/** 拼接完整文件访问地址 */
function fileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return import.meta.env.VITE_APP_BASE_API + url
}

/** 按资料类型查找资料记录 */
function findMaterialByType(list, type) {
  return (list || []).find(item => item.materialType === type) || null
}

/** 加载申请审核所需资料 */
function loadApplyAuditMaterials() {
  applyAuditLoading.value = true
  return listPartyMemberMaterial({ memberGyh: props.row.gyh }).then(res => {
    const list = res.data || []
    applyAuditMaterials.value = {
      rdsss: findMaterialByType(list, MATERIAL_TYPE.RDSSS),
      thzl: findMaterialByType(list, MATERIAL_TYPE.THZL)
    }
  }).finally(() => {
    applyAuditLoading.value = false
  })
}

/** 打开申请审核弹窗 */
function openApplyAudit() {
  applyAuditMaterials.value = { rdsss: null, thzl: null }
  loadApplyAuditMaterials().then(() => {
    applyAuditOpen.value = true
  })
}

/** 提交申请审核通过 */
function submitApplyAudit() {
  if (!canApplyAuditPass.value) {
    proxy.$modal.msgWarning('请先上传入党申请书和谈话资料')
    return
  }
  proxy.$modal.confirm('确认审核通过并进入待定积极分子？').then(() => {
    return executeStageAction({ gyh: props.row.gyh, action: STAGE_ACTION.AUDIT_APPLY })
  }).then(() => {
    proxy.$modal.msgSuccess('审核通过')
    applyAuditOpen.value = false
    emit('success')
  }).catch(() => {})
}

/** 提交申请审核未通过 */
function submitApplyReject() {
  proxy.$modal.confirm('确认审核未通过？').then(() => {
    return executeStageAction({ gyh: props.row.gyh, action: STAGE_ACTION.REJECT_APPLY })
  }).then(() => {
    proxy.$modal.msgSuccess('已标记为审核未通过')
    applyAuditOpen.value = false
    emit('success')
  }).catch(() => {})
}

/** 执行环节流转操作 */
function doAction(action, confirmMsg, extra = {}) {
  proxy.$modal.confirm(confirmMsg).then(() => {
    return executeStageAction({ gyh: props.row.gyh, action, ...extra })
  }).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    emit('success')
  }).catch(() => {})
}
</script>

<style scoped>
.stage-actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0;
  justify-content: center;
  align-items: center;
}
.remind-tag {
  margin-right: 4px;
}
.ml4 {
  margin-left: 4px;
}
.inline-btn-wrap {
  display: inline-flex;
  vertical-align: middle;
}
</style>
