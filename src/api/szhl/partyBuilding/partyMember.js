/** 党建管理 - 党员 API */
import request from '@/utils/request'

/** 党员管理接口前缀 */
const url = '/PartyMember'

/** 查询可新增为党员的系统用户（未在党员库中） */
export function listAvailablePartyMemberUsers() {
  return request({
    url: url + '/availableUsers',
    method: 'get'
  })
}

/** 查询可选为培养联系人/入党介绍人的正式党员 */
export function listEligibleFormalMembersForContact() {
  return request({
    url: url + '/eligibleFormalMembers',
    method: 'get'
  })
}

/** 分页查询党员列表 */
export function listPartyMember(query) {
  return request({
    url: url + '/list',
    method: 'get',
    params: query
  })
}

/** 获取党员详情 */
export function getPartyMember(gyh) {
  return request({
    url: url + '/' + gyh,
    method: 'get'
  })
}

/** 新增党员（入党申请） */
export function addPartyMember(data) {
  return request({
    url: url,
    method: 'post',
    data: data
  })
}

/** 修改党员基本信息 */
export function updatePartyMember(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}

/** 变更党员状态 */
export function changePartyMemberStatus(data) {
  return request({
    url: url + '/changeStatus',
    method: 'put',
    data: data
  })
}

/** 执行党员发展环节操作（确定积极分子、确定发展对象、转正/延期等） */
export function executeStageAction(data) {
  return request({
    url: url + '/stageAction',
    method: 'put',
    data: data
  })
}

/** 查询党员发展资料列表 */
export function listPartyMemberMaterial(query) {
  return request({
    url: url + '/material/list',
    method: 'get',
    params: query
  })
}

/** 上传或更新党员发展资料 */
export function savePartyMemberMaterial(data) {
  return request({
    url: url + '/material',
    method: 'post',
    data: data
  })
}

/** 删除党员发展资料 */
export function delPartyMemberMaterial(idstr) {
  return request({
    url: url + '/material/' + idstr,
    method: 'delete'
  })
}

/** 标记资料为回执文件 */
export function markMaterialReceipt(idstr) {
  return request({
    url: url + '/material/receipt/' + idstr,
    method: 'put'
  })
}

/** 删除党员 */
export function delPartyMember(gyh) {
  return request({
    url: url + '/' + gyh,
    method: 'delete'
  })
}

/** 状态：1申请入党 2入党积极分子 3发展对象 4预备党员 5正式党员 */
export const MEMBER_STATUS = {
  APPLY: '1',
  ACTIVIST: '2',
  DEVELOPMENT: '3',
  PROBATIONARY: '4',
  FORMAL: '5'
}

/** 党员状态下拉选项 */
export const MEMBER_STATUS_OPTIONS = [
  { label: '申请入党', value: '1' },
  { label: '入党积极分子', value: '2' },
  { label: '发展对象', value: '3' },
  { label: '预备党员', value: '4' },
  { label: '正式党员', value: '5' }
]

/** 党内职务选项 */
export const PARTY_JOB_OPTIONS = [
  '支部书记',
  '支部副书记',
  '组织委员兼统战委员',
  '宣传委员',
  '纪检委员'
]

/** 构建党内职务下拉选项（含当前已保存但不在预设列表中的值） */
export function buildPartyJobSelectOptions(currentDnzw = '') {
  if (currentDnzw && !PARTY_JOB_OPTIONS.includes(currentDnzw)) {
    return [currentDnzw, ...PARTY_JOB_OPTIONS]
  }
  return PARTY_JOB_OPTIONS
}

/** 组织关系：1在册 2已转出 */
export const ORG_RELATION_OPTIONS = [
  { label: '在册', value: '1' },
  { label: '已转出', value: '2' }
]

/** 党员状态（在职情况）：1在职 2退休 3离职 */
export const MEMBER_WORK_STATUS_OPTIONS = [
  { label: '在职', value: '1' },
  { label: '退休', value: '2' },
  { label: '离职', value: '3' }
]

/** 是否有处分：1是 0否 */
export const HAS_DISCIPLINE_OPTIONS = [
  { label: '是', value: '1' },
  { label: '否', value: '0' }
]

/** 党员档案字段默认值 */
export function createMemberArchiveDefaults() {
  return {
    zzgx: '1',
    ryzt: '1',
    sfycf: '0',
    cfsm: ''
  }
}

/** 构建党员档案字段校验规则 */
export function buildMemberArchiveRules(form) {
  const rules = {
    zzgx: [{ required: true, message: '请选择组织关系', trigger: 'change' }],
    ryzt: [{ required: true, message: '请选择党员状态', trigger: 'change' }],
    sfycf: [{ required: true, message: '请选择是否有处分', trigger: 'change' }]
  }
  if (form?.sfycf === '1') {
    rules.cfsm = [{ required: true, message: '请填写处分说明', trigger: 'blur' }]
  }
  return rules
}

/** 组织关系展示名称 */
export function orgRelationLabel(value) {
  return ORG_RELATION_OPTIONS.find(item => item.value === value)?.label || value || '—'
}

/** 党员状态（在职情况）展示名称 */
export function memberWorkStatusLabel(value) {
  return MEMBER_WORK_STATUS_OPTIONS.find(item => item.value === value)?.label || value || '—'
}

/** 是否有处分展示名称 */
export function hasDisciplineLabel(value) {
  return HAS_DISCIPLINE_OPTIONS.find(item => item.value === value)?.label || value || '—'
}

/** 组织关系列表展示样式 */
export function orgRelationDisplayClass(value) {
  const v = value || '1'
  if (v === '1') return 'archive-tag archive-tag-green'
  if (v === '2') return 'archive-tag archive-tag-red'
  return ''
}

/** 党员状态（在职情况）列表展示样式 */
export function memberWorkStatusDisplayClass(value) {
  const v = value || '1'
  if (v === '1') return 'archive-tag archive-tag-green'
  if (v === '2') return 'archive-tag archive-tag-red'
  if (v === '3') return 'archive-tag archive-tag-gray'
  return ''
}

/** 是否有处分列表展示样式 */
export function hasDisciplineDisplayClass(value) {
  const v = value || '0'
  if (v === '0') return 'archive-tag archive-tag-green'
  if (v === '1') return 'archive-tag archive-tag-red'
  return ''
}

/** 党员状态展示名称 */
export function memberStatusLabel(value) {
  return MEMBER_STATUS_OPTIONS.find(item => item.value === value)?.label || value || '—'
}

/** 环节操作按钮权限标识（需在系统菜单/角色中配置对应按钮权限） */
export const STAGE_BUTTON_PERMS = {
  UPLOAD_TALK: 'data:partyMember:uploadTalk',
  AUDIT_APPLY: 'data:partyMember:auditApply',
  CONFIRM_ACTIVIST: 'data:partyMember:confirmActivist',
  /** 积极分子思想汇报、考察资料共用 */
  UPLOAD_ACTIVIST_MATERIAL: 'data:partyMember:uploadActivistMaterial',
  AUDIT_ACTIVIST: 'data:partyMember:auditActivist',
  CONFIRM_DEV: 'data:partyMember:confirmDev',
  UPLOAD_DEV_THOUGHT: 'data:partyMember:uploadDevThought',
  AUDIT_DEV: 'data:partyMember:auditDev',
  CONFIRM_PROB: 'data:partyMember:confirmProb',
  SUBMIT_TRANSFER: 'data:partyMember:submitTransfer',
  APPROVE_FORMAL: 'data:partyMember:approveFormal',
  APPROVE_DELAY: 'data:partyMember:approveDelay',
  /** 标记资料为回执文件 */
  CONFIRM_RECEIPT: 'data:partyMember:confirmReceipt',
  /** 删除已上传资料 */
  REMOVE_MATERIAL: 'data:partyMember:removeMaterial'
}

/** 删除已上传资料按钮权限（含上传相关权限，可删除本人刚上传的文件） */
export const MATERIAL_REMOVE_PERMS = [
  STAGE_BUTTON_PERMS.REMOVE_MATERIAL,
  'data:partyMember:edit',
  'data:partyMember:add'
]

/** 积极分子资料上传按钮权限（含旧权限标识，兼容已配置角色） */
export const ACTIVIST_MATERIAL_PERMS = [
  STAGE_BUTTON_PERMS.UPLOAD_ACTIVIST_MATERIAL,
  'data:partyMember:uploadActivistThought',
  'data:partyMember:uploadActivistInspect'
]

export {
  MEMBER_STAGE,
  STAGE_OPTIONS,
  STAGE_ACTION,
  MATERIAL_TYPE,
  MATERIAL_TYPE_LABELS,
  STAGE_MATERIALS,
  stageLabel,
  stageDisplayClass,
  materialTypeLabel,
  buildGroupedMaterialRows,
  materialApplyTypeLabel,
  isOpinionReceiptMaterial,
  materialReceiptLabel,
  isApplyMarkerMaterial,
  hasTransferApplyMaterials,
  hasDelayApplyMaterials,
  getOppositeApplyMaterialTypes,
  inferTransferApplyType,
  mapFormalMemberSelectOptions,
  isEligibleContactFormalMember,
  materialStatusLabel,
  stageOptionsByDyzt,
  isTransferRemindDue,
  getActivistAuditEligibleDate,
  isActivistAuditAvailable,
  needReceipt,
  isMaterialRequired,
  activistConfirmMaterialDefs,
  devConfirmMaterialDefs,
  probConfirmMaterialDefs,
  transferApplyMaterialDefs,
  transferApproveReceiptMaterialDef,
  transferApproveReceiptMaterialType,
  getMissingRequiredMaterialLabels
} from './partyMemberStage'
