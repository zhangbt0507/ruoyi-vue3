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

/**
 * 批量取编码及其全部祖先（扁平列表，含每条的 level / name / parentCode）。
 * 供「拿到一批编码、要显示它们上溯两级的名称」这类场景一次问回，
 * 例如触达统计页按当前页每行的 grid_code 解析乡镇(level4)/村社区(level5)。
 * 编码数量由后端钳制上限。
 */
export function listRegionAncestors(codes) {
  return request({
    url: '/crm/region/ancestors',
    method: 'get',
    params: { codes: Array.isArray(codes) ? codes.join(',') : codes }
  })
}
