/** 党建管理 - 党员环节与资料常量 */
/** 环节编码 */
export const MEMBER_STAGE = {
  APPLY_TALK: '101',
  APPLY_AUDIT: '102',
  APPLY_REJECTED: '103',
  APPLY_TALK_OVERDUE: '104',
  ACTIVIST_PENDING: '201',
  ACTIVIST_CONFIRMED: '202',
  DEV_PENDING: '301',
  DEV_CONFIRMED: '302',
  PROB_PENDING: '401',
  PROB_CONFIRMED: '402',
  PROB_TRANSFER: '403',
  FORMAL: '501'
}

/** 环节编码与党员状态、环节名称映射 */
export const STAGE_OPTIONS = [
  { label: '待谈话', value: '101', dyzt: '1' },
  { label: '待审核', value: '102', dyzt: '1' },
  { label: '审核未通过', value: '103', dyzt: '1' },
  { label: '谈话超期', value: '104', dyzt: '1' },
  { label: '待定积极分子', value: '201', dyzt: '2' },
  { label: '确定积极分子', value: '202', dyzt: '2' },
  { label: '待定发展对象', value: '301', dyzt: '3' },
  { label: '确定发展对象', value: '302', dyzt: '3' },
  { label: '待定预备党员', value: '401', dyzt: '4' },
  { label: '确定预备党员', value: '402', dyzt: '4' },
  { label: '转正/延期待审', value: '403', dyzt: '4' },
  { label: '正式党员', value: '501', dyzt: '5' }
]

/** 环节操作动作编码（与后端 stageAction 接口对应） */
export const STAGE_ACTION = {
  UPLOAD_TALK: 'UPLOAD_TALK',
  AUDIT_APPLY: 'AUDIT_APPLY',
  REJECT_APPLY: 'REJECT_APPLY',
  CONFIRM_ACTIVIST: 'CONFIRM_ACTIVIST',
  AUDIT_ACTIVIST: 'AUDIT_ACTIVIST',
  CONFIRM_DEV: 'CONFIRM_DEV',
  AUDIT_DEV: 'AUDIT_DEV',
  CONFIRM_PROB: 'CONFIRM_PROB',
  SUBMIT_TRANSFER: 'SUBMIT_TRANSFER',
  APPROVE_FORMAL: 'APPROVE_FORMAL',
  APPROVE_DELAY: 'APPROVE_DELAY'
}

/** 需要回执的资料类型 */
export const RECEIPT_REQUIRED_TYPES = ['FZDXBA', 'YBDYYSDJB']

/** 资料类型 */
export const MATERIAL_TYPE = {
  RDSSS: 'RDSSS',
  THZL: 'THZL',
  DYTJHZ: 'DYTJHZ',
  DYTJSP: 'DYTJSP',
  GHTJHZ: 'GHTJHZ',
  GHTJSP: 'GHTJSP',
  TQTJHZ: 'TQTJHZ',
  TQTJSP: 'TQTJSP',
  ZBHYJJ: 'ZBHYJJ',
  JJFZBA: 'JJFZBA',
  JDSXHB: 'JDSXHB',
  BNKC: 'BNKC',
  FZDXYJ: 'FZDXYJ',
  FZDZBHY: 'FZDZBHY',
  ZSCL: 'ZSCL',
  ZZ: 'ZZ',
  FZDXBA: 'FZDXBA',
  JYZS: 'JYZS',
  FZSXHB: 'FZSXHB',
  YBDYYJ: 'YBDYYJ',
  YBDYGS: 'YBDYGS',
  YBDYHY: 'YBDYHY',
  YBDYZHSC: 'YBDYZHSC',
  YBDYYSBG: 'YBDYYSBG',
  YBDYYSDJB: 'YBDYYSDJB',
  YBDYTP: 'YBDYTP',
  YBDYQS: 'YBDYQS',
  YBDYSPYJ: 'YBDYSPYJ',
  ZZSQ: 'ZZSQ',
  YQSQ: 'YQSQ',
  ZZBHY: 'ZZBHY',
  ZBQZCL: 'ZBQZCL',
  ZZBHY_ZZ: 'ZZBHY_ZZ',
  ZBQZCL_ZZ: 'ZBQZCL_ZZ',
  ZZBHY_YQ: 'ZZBHY_YQ',
  ZBQZCL_YQ: 'ZBQZCL_YQ',
  YJYJHZ_ZZ: 'YJYJHZ_ZZ',
  YJYJHZ_YQ: 'YJYJHZ_YQ'
}

/** 资料类型编码与中文名称映射 */
export const MATERIAL_TYPE_LABELS = {
  RDSSS: '入党申请书',
  THZL: '谈话资料',
  DYTJHZ: '党员推荐汇总表',
  DYTJSP: '党员推荐审批表',
  GHTJHZ: '工会组织推荐汇总表',
  GHTJSP: '工会组织推荐审批表',
  TQTJHZ: '团组织推荐汇总表',
  TQTJSP: '团组织推荐审批表',
  ZBHYJJ: '支部会议记录',
  JJFZBA: '入党积极分子备案登记表',
  JDSXHB: '季度思想汇报',
  BNKC: '半年考察资料',
  FZDXYJ: '发展对象意见征求记录',
  FZDZBHY: '党支部会议资料',
  ZSCL: '政审资料',
  ZZ: '自传',
  FZDXBA: '发展对象备案登记表',
  JYZS: '结业证书',
  FZSXHB: '思想汇报',
  YBDYYJ: '预备党员征求意见',
  YBDYGS: '预备党员公示情况',
  YBDYHY: '预备党员会议记录',
  YBDYZHSC: '预备党员综合审查情况报告',
  YBDYYSBG: '预备党员预审报告',
  YBDYYSDJB: '预备党员预审登记表',
  YBDYTP: '预备党员投票情况汇总表',
  YBDYQS: '预备党员请示',
  YBDYSPYJ: '预备党员审批意见',
  ZZSQ: '转正申请',
  YQSQ: '延期申请',
  ZZBHY: '支部会议记录',
  ZBQZCL: '支部请示材料',
  ZZBHY_ZZ: '支部会议记录（转正）',
  ZBQZCL_ZZ: '支部请示材料（转正）',
  ZZBHY_YQ: '支部会议记录（延期）',
  ZBQZCL_YQ: '支部请示材料（延期）',
  YJYJHZ_ZZ: '意见回执（转正）',
  YJYJHZ_YQ: '意见回执（延期）'
}

/** 转正/延期申请标记类型（系统内部使用，详情页不展示） */
export const APPLY_MARKER_MATERIAL_TYPES = [
  MATERIAL_TYPE.ZZSQ,
  MATERIAL_TYPE.YQSQ
]

/** 转正申请需上传的资料类型 */
export const TRANSFER_APPLY_MATERIAL_TYPES = [
  MATERIAL_TYPE.ZZBHY_ZZ,
  MATERIAL_TYPE.ZBQZCL_ZZ
]

/** 延期申请需上传的资料类型 */
export const DELAY_APPLY_MATERIAL_TYPES = [
  MATERIAL_TYPE.ZZBHY_YQ,
  MATERIAL_TYPE.ZBQZCL_YQ
]

const APPLY_MARKER_TYPE_SET = new Set(APPLY_MARKER_MATERIAL_TYPES)
const TRANSFER_APPLY_TYPE_SET = new Set(TRANSFER_APPLY_MATERIAL_TYPES)
const DELAY_APPLY_TYPE_SET = new Set(DELAY_APPLY_MATERIAL_TYPES)

/** 各阶段可上传资料 */
export const STAGE_MATERIALS = {
  '1': [
    { type: MATERIAL_TYPE.RDSSS, label: '入党申请书', required: true },
    { type: MATERIAL_TYPE.THZL, label: '谈话资料', required: true }
  ],
  '2': [
    { type: MATERIAL_TYPE.DYTJHZ, label: '党员推荐汇总表', required: true },
    { type: MATERIAL_TYPE.DYTJSP, label: '党员推荐审批表', required: true },
    { type: MATERIAL_TYPE.GHTJHZ, label: '工会组织推荐汇总表', required: true },
    { type: MATERIAL_TYPE.GHTJSP, label: '工会组织推荐审批表', required: true },
    { type: MATERIAL_TYPE.TQTJHZ, label: '团组织推荐汇总表', required: true, ageLimit: 28 },
    { type: MATERIAL_TYPE.TQTJSP, label: '团组织推荐审批表', required: true, ageLimit: 28 },
    { type: MATERIAL_TYPE.ZBHYJJ, label: '支部会议记录', required: true },
    { type: MATERIAL_TYPE.JJFZBA, label: '入党积极分子备案登记表', required: true },
    { type: MATERIAL_TYPE.JDSXHB, label: '季度思想汇报', required: true, periodic: true },
    { type: MATERIAL_TYPE.BNKC, label: '半年考察资料', required: true, periodic: true }
  ],
  '3': [
    { type: MATERIAL_TYPE.FZDXYJ, label: '发展对象意见征求记录', required: true },
    { type: MATERIAL_TYPE.FZDZBHY, label: '党支部会议资料', required: true },
    { type: MATERIAL_TYPE.ZSCL, label: '政审资料', required: true },
    { type: MATERIAL_TYPE.ZZ, label: '自传', required: true },
    { type: MATERIAL_TYPE.FZDXBA, label: '发展对象备案登记表', required: true, needReceipt: true },
    { type: MATERIAL_TYPE.JYZS, label: '结业证书', required: true },
    { type: MATERIAL_TYPE.FZSXHB, label: '思想汇报', required: true, periodic: true }
  ],
  '4': [
    { type: MATERIAL_TYPE.YBDYYJ, label: '预备党员征求意见', required: true },
    { type: MATERIAL_TYPE.YBDYGS, label: '预备党员公示情况', required: true },
    { type: MATERIAL_TYPE.YBDYHY, label: '预备党员会议记录', required: true },
    { type: MATERIAL_TYPE.YBDYZHSC, label: '预备党员综合审查情况报告', required: true },
    { type: MATERIAL_TYPE.YBDYYSBG, label: '预备党员预审报告', required: true },
    { type: MATERIAL_TYPE.YBDYYSDJB, label: '预备党员预审登记表', required: true, needReceipt: true },
    { type: MATERIAL_TYPE.YBDYTP, label: '预备党员投票情况汇总表', required: true },
    { type: MATERIAL_TYPE.YBDYQS, label: '预备党员请示', required: true },
    { type: MATERIAL_TYPE.YBDYSPYJ, label: '预备党员审批意见', required: true },
    { type: MATERIAL_TYPE.ZZBHY_ZZ, label: '支部会议记录（转正）', required: true },
    { type: MATERIAL_TYPE.ZBQZCL_ZZ, label: '支部请示材料（转正）', required: true },
    { type: MATERIAL_TYPE.ZZBHY_YQ, label: '支部会议记录（延期）', required: true },
    { type: MATERIAL_TYPE.ZBQZCL_YQ, label: '支部请示材料（延期）', required: true },
    { type: MATERIAL_TYPE.YJYJHZ_ZZ, label: '意见回执（转正）', required: true },
    { type: MATERIAL_TYPE.YJYJHZ_YQ, label: '意见回执（延期）', required: true }
  ]
}

/** 发展资料表格：状态分组展示名 */
export const MATERIAL_STATUS_LABELS = {
  '1': '入党申请',
  '2': '积极分子',
  '3': '发展对象',
  '4': '预备党员',
  '5': '正式党员'
}

const MATERIAL_TYPE_DYZT_MAP = (() => {
  const map = {}
  Object.entries(STAGE_MATERIALS).forEach(([dyzt, materials]) => {
    materials.forEach(item => {
      map[item.type] = dyzt
    })
  })
  return map
})()

const STATUS_ORDER = ['1', '2', '3', '4', '5']

/** 解析资料所属党员状态 */
export function resolveMaterialDyzt(material) {
  if (!material) return '1'
  const type = material.materialType
  if (type && MATERIAL_TYPE_DYZT_MAP[type]) {
    return MATERIAL_TYPE_DYZT_MAP[type]
  }
  if (material.hj) {
    const stage = STAGE_OPTIONS.find(item => item.value === material.hj)
    if (stage?.dyzt) return stage.dyzt
  }
  return '1'
}

/** 获取资料状态分组显示名 */
export function materialStatusLabel(dyzt) {
  return MATERIAL_STATUS_LABELS[dyzt] || '—'
}

/** 获取资料类型在阶段定义中的排序索引（用于详情页同组内排序） */
function materialTypeSortIndex(dyzt, type) {
  const defs = STAGE_MATERIALS[dyzt] || []
  const index = defs.findIndex(item => item.type === type)
  return index >= 0 ? index : 999
}

/** 转正/延期申请资料：返回「转正」「延期」或空 */
export function materialApplyTypeLabel(materialType) {
  if (TRANSFER_APPLY_TYPE_SET.has(materialType) || materialType === MATERIAL_TYPE.YJYJHZ_ZZ) return '转正'
  if (DELAY_APPLY_TYPE_SET.has(materialType) || materialType === MATERIAL_TYPE.YJYJHZ_YQ) return '延期'
  return ''
}

/** 是否为审批意见回执资料 */
export function isOpinionReceiptMaterial(materialType) {
  return materialType === MATERIAL_TYPE.YJYJHZ_ZZ || materialType === MATERIAL_TYPE.YJYJHZ_YQ
}

/** 资料回执列展示：意见回执上传即视为已回执 */
export function materialReceiptLabel(material) {
  if (!material) return '—'
  if (material.receiptTime || (isOpinionReceiptMaterial(material.materialType) && material.fileUrl)) {
    return '是'
  }
  return '—'
}

/** 判断是否为申请标记类资料 */
export function isApplyMarkerMaterial(materialType) {
  return APPLY_MARKER_TYPE_SET.has(materialType)
}

/** 是否已上传转正申请资料 */
export function hasTransferApplyMaterials(materials) {
  return (materials || []).some(item => TRANSFER_APPLY_TYPE_SET.has(item.materialType))
}

/** 是否已上传延期申请资料 */
export function hasDelayApplyMaterials(materials) {
  return (materials || []).some(item => DELAY_APPLY_TYPE_SET.has(item.materialType))
}

/** 获取需清除的互斥申请资料类型 */
export function getOppositeApplyMaterialTypes(applyType) {
  if (applyType === 'delay') {
    return [...APPLY_MARKER_MATERIAL_TYPES, ...TRANSFER_APPLY_MATERIAL_TYPES]
  }
  return [...APPLY_MARKER_MATERIAL_TYPES, ...DELAY_APPLY_MATERIAL_TYPES]
}

/** 根据已上传资料推断申请类型 */
export function inferTransferApplyType(materials) {
  const list = materials || []
  if (hasDelayApplyMaterials(list) && !hasTransferApplyMaterials(list)) return 'delay'
  if (hasTransferApplyMaterials(list) && !hasDelayApplyMaterials(list)) return 'transfer'
  const hasDelayMarker = list.some(item => item.materialType === MATERIAL_TYPE.YQSQ)
  const hasTransferMarker = list.some(item => item.materialType === MATERIAL_TYPE.ZZSQ)
  if (hasDelayMarker && !hasTransferMarker) return 'delay'
  if (hasTransferMarker && !hasDelayMarker) return 'transfer'
  return 'transfer'
}

/** 是否可作为培养联系人/入党介绍人（在册、在职、无处分的正式党员） */
export function isEligibleContactFormalMember(member) {
  if (!member?.gyh) return false
  const zzgx = member.zzgx || '1'
  const ryzt = member.ryzt || '1'
  const sfycf = member.sfycf || '0'
  return zzgx === '1' && ryzt === '1' && sfycf === '0'
}

/** 映射正式党员为下拉选项（仅含在册、在职、无处分） */
export function mapFormalMemberSelectOptions(rows, excludeGyh = '') {
  return (rows || [])
    .filter(item => item.gyh && item.gyh !== excludeGyh && isEligibleContactFormalMember(item))
    .map(item => ({
      userName: item.gyh,
      nickName: item.xm
    }))
}

/** 同状态分组内资料排序：上传时间倒序，再按类型定义顺序 */
function compareMaterialsInGroup(dyzt, a, b) {
  const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
  const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
  if (timeA !== timeB) return timeB - timeA
  const typeDiff = materialTypeSortIndex(dyzt, a.materialType) - materialTypeSortIndex(dyzt, b.materialType)
  if (typeDiff !== 0) return typeDiff
  return (a.materialType || '').localeCompare(b.materialType || '')
}

/** 按状态分组，供详情页发展资料表格合并展示 */
export function buildGroupedMaterialRows(materials) {
  const displayMaterials = (materials || []).filter(item => !isApplyMarkerMaterial(item.materialType))
  const grouped = {}
  displayMaterials.forEach(item => {
    const dyzt = resolveMaterialDyzt(item)
    if (!grouped[dyzt]) grouped[dyzt] = []
    grouped[dyzt].push(item)
  })

  const rows = []
  ;[...STATUS_ORDER].reverse().forEach(dyzt => {
    const list = grouped[dyzt]
    if (!list?.length) return
    list.sort((a, b) => compareMaterialsInGroup(dyzt, a, b))
    list.forEach((item, index) => {
      rows.push({
        material: item,
        dyzt,
        statusLabel: materialStatusLabel(dyzt),
        statusRowspan: index === 0 ? list.length : 0,
        applyTypeLabel: materialApplyTypeLabel(item.materialType)
      })
    })
  })
  return rows
}

/** 获取环节显示名称 */
export function stageLabel(hj) {
  return STAGE_OPTIONS.find(item => item.value === hj)?.label || hj || '—'
}

/** 列表环节展示：待定/待审核类（蓝色带框） */
export const STAGE_DISPLAY_BLUE = new Set([
  MEMBER_STAGE.APPLY_TALK,
  MEMBER_STAGE.APPLY_AUDIT,
  MEMBER_STAGE.ACTIVIST_PENDING,
  MEMBER_STAGE.DEV_PENDING,
  MEMBER_STAGE.PROB_PENDING
])

/** 列表环节展示：确定类（绿色带框） */
export const STAGE_DISPLAY_GREEN = new Set([
  MEMBER_STAGE.ACTIVIST_CONFIRMED,
  MEMBER_STAGE.DEV_CONFIRMED,
  MEMBER_STAGE.PROB_CONFIRMED
])

/** 获取环节列表展示样式 class */
export function stageDisplayClass(hj) {
  if (STAGE_DISPLAY_BLUE.has(hj)) return 'stage-tag stage-tag-blue'
  if (STAGE_DISPLAY_GREEN.has(hj)) return 'stage-tag stage-tag-green'
  return ''
}

/** 获取资料类型显示名称 */
export function materialTypeLabel(type) {
  return MATERIAL_TYPE_LABELS[type] || type || '—'
}

/** 按党员状态筛选环节选项 */
export function stageOptionsByDyzt(dyzt) {
  return STAGE_OPTIONS.filter(item => item.dyzt === dyzt)
}

/** 是否已到转正提醒日 */
export function isTransferRemindDue(row) {
  if (!row || row.hj !== MEMBER_STAGE.PROB_CONFIRMED || !row.xczztxr) {
    return false
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const remind = new Date(row.xczztxr)
  remind.setHours(0, 0, 0, 0)
  return remind <= today
}

/** 积极分子审核确认最早可用日期（成为积极分子时间 + 1 年） */
export function getActivistAuditEligibleDate(jjfzsj) {
  if (!jjfzsj) return null
  const eligible = new Date(jjfzsj)
  eligible.setFullYear(eligible.getFullYear() + 1)
  eligible.setHours(0, 0, 0, 0)
  return eligible
}

/** 是否已满一年可进行积极分子审核确认 */
export function isActivistAuditAvailable(row) {
  const eligible = getActivistAuditEligibleDate(row?.jjfzsj)
  if (!eligible) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eligible <= today
}

/** 判断资料类型是否需要回执 */
export function needReceipt(type) {
  return RECEIPT_REQUIRED_TYPES.includes(type)
}

/** 资料是否必填（28周岁以上可不填团组织推荐资料） */
export function isMaterialRequired(material, member) {
  if (!material) return false
  if (material.ageLimit != null) {
    const csrq = member?.csrq
    if (!csrq) {
      return true
    }
    const limitDate = new Date()
    limitDate.setFullYear(limitDate.getFullYear() - material.ageLimit)
    limitDate.setHours(0, 0, 0, 0)
    const birth = new Date(csrq)
    birth.setHours(0, 0, 0, 0)
    return birth.getTime() >= limitDate.getTime()
  }
  return material.required !== false
}

/** 确定积极分子需上传的资料（不含期次类） */
export function activistConfirmMaterialDefs(member) {
  return (STAGE_MATERIALS['2'] || [])
    .filter(item => !item.periodic)
    .map(item => ({
      ...item,
      required: isMaterialRequired(item, member)
    }))
}

/** 确定发展对象需上传的资料（不含期次类） */
export function devConfirmMaterialDefs(member) {
  return (STAGE_MATERIALS['3'] || [])
    .filter(item => !item.periodic)
    .map(item => ({
      ...item,
      required: isMaterialRequired(item, member)
    }))
}

/** 确定预备党员弹窗需上传的资料类型（不含转正/延期类） */
const PROB_CONFIRM_MATERIAL_TYPES = [
  MATERIAL_TYPE.YBDYYJ,
  MATERIAL_TYPE.YBDYGS,
  MATERIAL_TYPE.YBDYHY,
  MATERIAL_TYPE.YBDYZHSC,
  MATERIAL_TYPE.YBDYYSBG,
  MATERIAL_TYPE.YBDYYSDJB,
  MATERIAL_TYPE.YBDYTP,
  MATERIAL_TYPE.YBDYQS,
  MATERIAL_TYPE.YBDYSPYJ
]

/** 确定预备党员需上传的资料定义 */
export function probConfirmMaterialDefs(member) {
  const typeSet = new Set(PROB_CONFIRM_MATERIAL_TYPES)
  return (STAGE_MATERIALS['4'] || [])
    .filter(item => typeSet.has(item.type))
    .map(item => ({
      ...item,
      required: isMaterialRequired(item, member)
    }))
}

/** 转正/延期申请需上传的资料 */
export function transferApplyMaterialDefs(applyType = 'transfer') {
  if (applyType === 'delay') {
    return [
      { type: MATERIAL_TYPE.ZZBHY_YQ, label: '支部会议记录', required: true },
      { type: MATERIAL_TYPE.ZBQZCL_YQ, label: '支部请示材料', required: true }
    ]
  }
  return [
    { type: MATERIAL_TYPE.ZZBHY_ZZ, label: '支部会议记录', required: true },
    { type: MATERIAL_TYPE.ZBQZCL_ZZ, label: '支部请示材料', required: true }
  ]
}

/** 同意转正/延期审批时需上传的意见回执资料类型 */
export function transferApproveReceiptMaterialType(applyType = 'transfer') {
  return applyType === 'delay' ? MATERIAL_TYPE.YJYJHZ_YQ : MATERIAL_TYPE.YJYJHZ_ZZ
}

/** 同意转正/延期审批时需上传的意见回执资料定义 */
export function transferApproveReceiptMaterialDef(applyType = 'transfer') {
  const type = transferApproveReceiptMaterialType(applyType)
  return {
    type,
    label: materialTypeLabel(type)
  }
}

/** 获取未上传的必填资料名称 */
export function getMissingRequiredMaterialLabels(materialDefs, uploadedTypes) {
  const uploadedSet = new Set(uploadedTypes || [])
  return materialDefs
    .filter(item => item.required && !uploadedSet.has(item.type))
    .map(item => item.label)
}
