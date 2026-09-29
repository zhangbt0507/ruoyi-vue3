import { listRegionAll } from '@/api/szhl/crm/region'

// 根节点在索引里的 key（parentCode 为空串/null 时统一收敛到这个 key）
const ROOT_KEY = '__ROOT__'

// 层级名称兜底：/all 已由后端 fillLevelName 下发 levelName，这里只在缺失时补。
// 绝不能反过来用层级/编码长度判断叶子——是否叶子一律看有没有子节点。
const LEVEL_NAME_FALLBACK = {
  1: '省/直辖市',
  2: '地级市',
  3: '县/市/区',
  4: '乡镇/街道',
  5: '行政村/社区',
  6: '网格'
}

// 模块级缓存：行政区划是低频变动的参考数据，整棵树一次性拉回后常驻。
// 同一页面多个选择器实例、反复开合弹层都复用，展开/搜索/回显全在本地算，不再打后端。
let allNodes = []
const byCode = new Map()            // code -> 节点
const childrenByParent = new Map()  // parentKey -> 直接子节点[]（保序）
// 整棵树只加载一次：并发调用共享同一个 Promise；失败后清空，允许重试
let loadPromise = null

// 后端返回体可能是 AjaxResult(data) 或 TableDataInfo(rows)，统一取数组
function pickList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.rows)) return res.rows
  return []
}

export function normalizeNode(raw) {
  if (!raw || raw.code === undefined || raw.code === null) return null
  const code = String(raw.code)
  const level = Number(raw.level) || Math.ceil(code.length / 3) || 1
  return {
    code,
    name: raw.name || code,
    parentCode: raw.parentCode === undefined || raw.parentCode === null ? '' : String(raw.parentCode),
    level,
    levelName: raw.levelName || LEVEL_NAME_FALLBACK[level] || `第 ${level} 级`,
    scope: raw.scope || '',
    refreshName: raw.refreshName || '',
    // leaf / childCount 在建索引后据全量数据回填（/all 不下发这两个）
    leaf: undefined,
    childCount: undefined
  }
}

// 建索引：byCode 便于按编码取节点，childrenByParent 便于取直接子节点。
// 有全量数据后就地判定 childCount / leaf，替代后端逐节点下发。
function buildIndex(list) {
  allNodes = list
  byCode.clear()
  childrenByParent.clear()
  for (const node of list) {
    byCode.set(node.code, node)
    const parentKey = node.parentCode || ROOT_KEY
    let bucket = childrenByParent.get(parentKey)
    if (!bucket) {
      bucket = []
      childrenByParent.set(parentKey, bucket)
    }
    bucket.push(node)
  }
  for (const node of list) {
    const kids = childrenByParent.get(node.code)
    node.childCount = kids ? kids.length : 0
    node.leaf = node.childCount === 0
  }
}

/** 整棵树只拉一次，并发共享同一 Promise；失败不缓存空树 */
export function loadAll() {
  if (loadPromise) return loadPromise
  loadPromise = listRegionAll()
    .then(res => {
      buildIndex(pickList(res).map(normalizeNode).filter(Boolean))
      return allNodes
    })
    .catch(err => {
      loadPromise = null
      throw err
    })
  return loadPromise
}

// 是否叶子一律看有没有子节点，前端不按层级写死
export function isLeafNode(node) {
  return node ? node.leaf === true : false
}

export function pathNameOf(node) {
  if (!node) return ''
  if (node.pathName) return node.pathName
  if (node.path && node.path.length) return node.path.map(item => item.name).join(' / ')
  return node.name || ''
}

// 沿 parentCode 向上串出祖先链（含自身），从省级到自身；带环保护防脏数据成环
function ancestorsOf(node) {
  const chain = []
  const seen = new Set()
  let cur = node
  while (cur && !seen.has(cur.code)) {
    chain.unshift(cur)
    seen.add(cur.code)
    cur = cur.parentCode ? byCode.get(cur.parentCode) : null
  }
  return chain
}

// 给节点挂上 path / pathName（返回副本，不污染缓存里的树节点）
// path 每项带 level：调用方需要按层级定位某一级祖先（如行政区划第 4 级=乡镇、第 5 级=村）
function withPath(node) {
  const chain = ancestorsOf(node)
  return {
    ...node,
    path: chain.map(n => ({ code: n.code, name: n.name, level: n.level })),
    pathName: chain.map(n => n.name).join(' / ')
  }
}

/** 直接子节点，命中本地索引直接返回（保持与旧接口一致的 Promise 契约） */
export function loadChildren(parentCode) {
  return loadAll().then(() => childrenByParent.get(parentCode ? String(parentCode) : ROOT_KEY) || [])
}

/** 由编码反查完整路径，用于 v-model 回显；编码不存在返回 null */
export function loadPath(code) {
  return loadAll().then(() => {
    const node = byCode.get(String(code))
    return node ? withPath(node) : null
  })
}

/**
 * 取某一层级及其以下的嵌套子树，供级联控件（el-cascader）这类需要 children 的控件直接消费。
 *
 * 低于 minLevel 的节点不出现在结果里，其子节点直接成为树根——例如 minLevel=4 时
 * 树根即「乡镇/街道」，省市县不展示（后端也只有在第 4/5/6 级上有对应筛选列）。
 *
 * @param {number} minLevel 起始层级（含），1=省 2=市 3=县 4=乡镇/街道 5=行政村/社区 6=网格
 * @returns 嵌套节点数组 [{code,name,level,leaf,children}]，children 递归同构
 */
export function loadTree(minLevel = 1) {
  return loadAll().then(() => {
    const roots = []
    for (const node of allNodes) {
      if ((node.level || 0) < minLevel) continue
      const parent = node.parentCode ? byCode.get(node.parentCode) : null
      // 父级被层级区间挡在外面（含本身就是顶层节点）时，本节点即树根
      if (!parent || (parent.level || 0) < minLevel) roots.push(node)
    }
    return roots.map(node => toSubtree(node, minLevel))
  })
}

function toSubtree(node, minLevel) {
  const children = (childrenByParent.get(node.code) || []).filter(child => (child.level || 0) >= minLevel)
  return {
    code: node.code,
    name: node.name,
    level: node.level,
    leaf: children.length === 0,
    children: children.map(child => toSubtree(child, minLevel))
  }
}

/** 关键字定位：本地按规范名或回刷名过滤，层级从小到大（浅层优先，调用方常取第一个） */
export function searchRegionNodes(keyword, limit = 10) {
  const kw = (keyword || '').trim()
  return loadAll().then(() => {
    if (!kw) return []
    const hits = allNodes.filter(n => (n.name && n.name.includes(kw)) || (n.refreshName && n.refreshName.includes(kw)))
    hits.sort((a, b) => (a.level || 0) - (b.level || 0))
    return hits.slice(0, limit).map(withPath)
  })
}

export function clearRegionCache() {
  loadPromise = null
  allNodes = []
  byCode.clear()
  childrenByParent.clear()
}
