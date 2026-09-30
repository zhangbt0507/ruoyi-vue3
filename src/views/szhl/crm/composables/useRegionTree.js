import { getRegionPath, listRegionChildren, searchRegion } from '@/api/szhl/crm/region'

// 行政区划（crm_region_code）取数入口。整棵树 6 万节点，一律逐级懒加载：
// 展开一层一个请求，搜索与回显各一个请求，不做全量拉回和本地索引。
//
// 对外只暴露这几个函数，调用方（AttributionRegionGridDialog / CustomerGridSelect）
// 拿到的节点形状与后端三个端点的返回体一致：
//   { code, name, parentCode, level, levelName, scope, childCount, path?, pathName? }
// 导入后省内到 15 位（网格）、省外到 12 位（村社区），跨分支深度不一，
// 故**是否叶子一律看 childCount，不能按编码长度或层级写死**。

// 层级名称兜底：三个端点都经后端 fillLevelName 下发 levelName，这里只在缺失时补。
const LEVEL_NAME_FALLBACK = {
  1: '省/直辖市',
  2: '地级市',
  3: '县/市/区',
  4: '乡镇/街道',
  5: '行政村/社区',
  6: '网格'
}

// 编码位数 -> 层级，与后端 CrmRegionCodeServiceImpl.LEN_TO_LEVEL、建表与导入脚本三处一致。
// 仅在 level 意外缺失时兜底。这里不能写成 ceil(len / 3)：9 位会被算成 3、12 位算成 4。
const LEN_TO_LEVEL = { 2: 1, 4: 2, 6: 3, 9: 4, 12: 5, 15: 6 }

// 响应体可能是 AjaxResult(data) 或 TableDataInfo(rows)，统一取数组
function pickList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.rows)) return res.rows
  return []
}

// 后端节点 -> 前端节点。path / pathName 只有 search 与 path 端点下发，children 端点为 undefined。
// 刻意不透传 refreshName：三个端点都不 select refresh_name，而搜索已由后端同时匹配规范名与
// 回刷旧称（searchByKeyword），前端不再需要这个字段。
export function normalizeNode(raw) {
  if (!raw || raw.code === undefined || raw.code === null) return null
  const code = String(raw.code)
  const level = Number(raw.level) || LEN_TO_LEVEL[code.length] || 1
  return {
    code,
    name: raw.name || code,
    parentCode: raw.parentCode === undefined || raw.parentCode === null ? '' : String(raw.parentCode),
    level,
    levelName: raw.levelName || LEVEL_NAME_FALLBACK[level] || `第 ${level} 级`,
    scope: raw.scope || '',
    childCount: Number(raw.childCount) || 0,
    path: Array.isArray(raw.path) ? raw.path : undefined,
    pathName: raw.pathName || ''
  }
}

/** 是否叶子：只认 childCount，省内外深度不同，不能按层级判断 */
export function isLeafNode(node) {
  return node ? !(node.childCount > 0) : false
}

export function pathNameOf(node) {
  if (!node) return ''
  if (node.pathName) return node.pathName
  if (Array.isArray(node.path) && node.path.length) return node.path.map(item => item.name).join(' / ')
  return node.name || ''
}

/**
 * 直接子节点，parentCode 为空表示取根节点（省/直辖市）。
 * 保持与旧实现一致的 Promise 契约，调用方无需改动。
 */
export function loadChildren(parentCode) {
  return listRegionChildren(parentCode ? String(parentCode) : '')
    .then(res => pickList(res).map(normalizeNode).filter(Boolean))
}

/** 由编码反查完整路径，用于 v-model 回显；编码非法或不存在时返回 null */
export function loadPath(code) {
  if (code === undefined || code === null || code === '') return Promise.resolve(null)
  return getRegionPath(String(code)).then(res => normalizeNode(res?.data ?? null))
}

/** 关键字定位：后端同时匹配规范名与回刷旧称，按层级升序返回，调用方常取第一个 */
export function searchRegionNodes(keyword, limit = 10) {
  const kw = (keyword || '').trim()
  if (!kw) return Promise.resolve([])
  return searchRegion(kw, limit).then(res => pickList(res).map(normalizeNode).filter(Boolean))
}
