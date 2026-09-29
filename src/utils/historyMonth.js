import cache from '@/plugins/cache'

/**
 * 归属列表「数据月份」的当前选择，供 axios 请求拦截器注入 X-Crm-Data-Month 请求头。
 *
 * 值为 stat_date（如 2026-08-31），空表示「当前」视图。归属页卸载时会主动清空，
 * 避免影响共用 /crm/contact/record、/crm/defer、/crm/dispute 的其他页面。
 */
const KEY = 'crm-attribution-data-month'

export function getHistoryMonth () {
  return cache.session.get(KEY) || ''
}

export function setHistoryMonth (statDate) {
  if (statDate) {
    cache.session.set(KEY, statDate)
  } else {
    cache.session.remove(KEY)
  }
}
