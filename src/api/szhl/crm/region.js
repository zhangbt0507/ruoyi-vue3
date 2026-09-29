import { createRequest } from '@/utils/subRequest'

// 子系统接口必须显式声明 appCode，否则网关会把 /crm/** 路由到 auth
const request = createRequest('crm')

/**
 * 懒加载直接子节点。parentCode 为空表示取根节点（省/直辖市）。
 * 省外数据接入后整棵树会很大，所以只按需取一层，不提供全量树接口。
 */
export function listRegionChildren(parentCode) {
  return request({
    url: '/crm/region/children',
    method: 'get',
    params: parentCode ? { parentCode } : {}
  })
}

/**
 * 按名称关键字定位。命中项带 path / pathName，前端据此逐级展开，
 * 不做「前端全量加载后本地搜」。
 */
export function searchRegion(keyword, limit = 10) {
  return request({
    url: '/crm/region/search',
    method: 'get',
    params: { keyword, limit }
  })
}

// 由编码反查完整路径：v-model 只存编码，回显完全依赖这个接口
export function getRegionPath(code) {
  return request({
    url: '/crm/region/path',
    method: 'get',
    params: { code }
  })
}

// 全量启用节点（扁平），一次性拉回后前端本地建树/展开/定位。
// 表当前 600+ 行，一次加载可接受；此后展开、搜索、回显都不再打后端。
export function listRegionAll() {
  return request({
    url: '/crm/region/all',
    method: 'get'
  })
}
