import router from '@/router'
import { resolveGatewayBaseURL, getRouteAppCode } from '@/config/backendApps'

/**
 * 构建完整 API 地址（用于 el-upload action、下载链接等不经过 axios 的场景）
 * @param {string} path 以 / 开头的接口路径
 * @param {string} [appCode] 不传则取当前菜单归属系统
 */
export function gatewayUrl(path, appCode) {
  const [pathname, query] = path.split('?')
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  const code = appCode || getRouteAppCode(router.currentRoute.value)
  const base = resolveGatewayBaseURL(normalized, { appCode: code }) + normalized
  return query ? `${base}?${query}` : base
}

export default gatewayUrl
