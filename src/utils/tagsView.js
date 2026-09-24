const viewCacheNames = {
  '/crm/attribution/index': 'Attribution',
  '/crm/attribution/image-query': 'CrmImageQuery',
  '/crm/dataplatform/reach': 'CrmReach',
  '/crm/dataplatform/contract': 'Contact',
  '/crm/dataplatform/stats-group': 'StatsGroup',
  '/crm/dataplatform/stats-customer': 'StatsCustomer',
  '/crm/dataplatform/stats-contact': 'StatsContact'
}

export function getViewCacheName(view) {
  if (!view.meta || !view.meta.multiInstance) {
    return viewCacheNames[view.path] || view.name
  }
  const pathKey = encodeURIComponent(view.path).replace(/%/g, '_')
  return `${String(view.name)}__${pathKey}`
}

export function getViewTitle(view) {
  const baseTitle = view.meta.title || 'no-name'
  if (!view.meta.multiInstance) {
    return baseTitle
  }
  const customerName = view.query && view.query.customerName
  const customerNo = view.params && view.params.customerNo
  return `${baseTitle}-${customerName || customerNo || ''}`.replace(/-$/, '')
}
