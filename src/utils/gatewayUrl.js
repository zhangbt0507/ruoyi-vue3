import router from '@/router'
import { resolveGatewayBaseURL, getGatewayByAppCode, getRouteAppCode } from '@/config/backendApps'

/**
 * 构建完整 API 地址（用于 el-upload action、下载链接等不经过 axios 的场景）
 * @param {string} path 以 / 开头的接口路径
 * @param {string} [appCode] 不传则取当前菜单归属系统
 */
export function gatewayUrl(path, appCode) {
  const [pathname, query] = path.split('?')
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  // 显式指定归属时直接取该网关：/common、/system 等公共前缀本会被改写到 auth/main，
  // 使子系统自产的文件下载（crm 异步导出的 /common/download）回不到本服务
  const base = appCode
    ? getGatewayByAppCode(appCode)
    : resolveGatewayBaseURL(normalized, { appCode: getRouteAppCode(router.currentRoute.value) })
  const full = base + normalized
  return query ? `${full}?${query}` : full
}

export default gatewayUrl
