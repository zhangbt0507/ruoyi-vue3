/** 子系统 app_code 与网关后缀映射（新增子系统在此追加一行） */
export const APP_GATEWAY_SUFFIX = {
  'auth-center': 'auth',
  main: 'main',
  'rate-pricing': 'pricing',
  performance: 'performance',
  'crm':'crm',
  'party-building': 'party'
}

export const DEFAULT_APP_CODE = 'main'

/** 始终走认证中心 8082 的接口前缀 */
export const AUTH_API_PREFIXES = [
  '/login',
  '/logout',
  '/getInfo',
  '/getRouters',
  '/captchaImage',
  '/register',
  '/system/dict',
  '/system/user',
  '/system/dept',
  '/common',
  '/profile'
]

/** 始终走主系统 8088 的接口前缀（菜单管理等） */
export const MAIN_API_PREFIXES = [
  '/system/menu',
  '/system/role',
  '/system/config',
  '/system/notice',
  '/system/post',
  '/system/operate',
  '/monitor',
  '/tool',
  '/swagger-ui',
  '/druid'
]

export function buildGateway(suffix) {
  const root = import.meta.env.VITE_APP_BASE_API || '/dev-api'
  return `${root}-${suffix}`
}

export function getGatewayByAppCode(appCode) {
  const suffix = APP_GATEWAY_SUFFIX[appCode] || APP_GATEWAY_SUFFIX.main
  return buildGateway(suffix)
}

export function getAuthGateway() {
  return getGatewayByAppCode('auth-center')
}

function normalizePath(url) {
  if (!url) {
    return ''
  }
  const path = url.split('?')[0]
  return path.startsWith('/') ? path : `/${path}`
}

function matchesPrefix(path, prefixes) {
  return prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}

/**
 * 从当前匹配路由取归属系统：叶子 → 父级向上找第一个非空 appCode，没有则 main。
 * 这样父菜单设为 performance、子菜单留空时，子页面也会走绩效。
 */
export function getRouteAppCode(route) {
  if (!route?.matched?.length) {
    return DEFAULT_APP_CODE
  }
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const appCode = route.matched[i].meta?.appCode
    if (appCode) {
      return appCode
    }
  }
  return DEFAULT_APP_CODE
}

/**
 * 解析请求应使用的网关 baseURL
 * 优先级：公共 AUTH → API 显式 appCode → 公共 MAIN → 菜单归属 → 默认 main
 *
 * 显式 appCode 优先于 MAIN，以便 /monitor/job/run 等可按任务组打到子系统。
 * 业务接口若希望「跟菜单归属走」，不要用 createRequest 写死子系统。
 */
export function resolveGatewayBaseURL(url, options = {}) {
  const explicitAppCode = typeof options === 'string' ? undefined : options.appCode
  const routeAppCode = typeof options === 'string' ? options : options.routeAppCode
  const path = normalizePath(url)
  if (matchesPrefix(path, AUTH_API_PREFIXES)) {
    return getAuthGateway()
  }
  if (explicitAppCode) {
    return getGatewayByAppCode(explicitAppCode)
  }
  if (matchesPrefix(path, MAIN_API_PREFIXES)) {
    return getGatewayByAppCode('main')
  }
  return getGatewayByAppCode(routeAppCode || DEFAULT_APP_CODE)
}
