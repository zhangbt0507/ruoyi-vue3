import request from '@/utils/request'

// 列表展示字段集（六张 Hive 源表字段契约，后端走 Redis 缓存）
export function listDataTag() {
  return request({
    url: '/crm/dataTag/list',
    method: 'get'
  })
}

export function listDataTagDefinitions(params) {
  return request({
    url: '/crm/dataTag/manage/list',
    method: 'get',
    params
  })
}

export function getDataTagDefinition(id) {
  return request({
    url: `/crm/dataTag/manage/${id}`,
    method: 'get'
  })
}

export function listAvailableDataTagFields(subjectScope) {
  return request({
    url: '/crm/dataTag/manage/physicalFields',
    method: 'get',
    params: { subjectScope }
  })
}

export function batchUpdateDataTagStatus(data) {
  return request({
    url: '/crm/dataTag/manage/status',
    method: 'put',
    data
  })
}

export function updateDataTagOrder(data) {
  return request({
    url: '/crm/dataTag/manage/order',
    method: 'put',
    data
  })
}

export function addDataTagDefinition(data) {
  return request({
    url: '/crm/dataTag/manage',
    method: 'post',
    data
  })
}

export function updateDataTagDefinition(data) {
  return request({
    url: '/crm/dataTag/manage',
    method: 'put',
    data
  })
}

export function deleteDataTagDefinition(id) {
  return request({
    url: `/crm/dataTag/manage/${id}`,
    method: 'delete'
  })
}

// 手动触发六张 Hive 客户表聚合重建（异步执行）
export function triggerDataTagRebuild() {
  return request({
    url: '/crm/dataTag/manage/sync/dataTagRebuild',
    method: 'post'
  })
}

// 手动触发三源最近触达时间同步（异步执行）
export function triggerLatestContactSync() {
  return request({
    url: '/crm/dataTag/manage/sync/latestContact',
    method: 'post'
  })
}

// 手动同步任务进度
export function getSyncProgress() {
  return request({
    url: '/crm/dataTag/manage/sync/progress',
    method: 'get'
  })
}

// 按六张 Hive 源表字段契约补齐、对齐并清理标签定义
export function initDataTagFromWideTable() {
  return request({
    url: '/crm/dataTag/manage/initFromWideTable',
    method: 'post'
  })
}

// 自定义分类
export function listDataTagCategories() {
  return request({
    url: '/crm/dataTag/manage/category/list',
    method: 'get'
  })
}

export function addDataTagCategory(data) {
  return request({
    url: '/crm/dataTag/manage/category',
    method: 'post',
    data
  })
}

export function updateDataTagCategory(data) {
  return request({
    url: '/crm/dataTag/manage/category',
    method: 'put',
    data
  })
}

export function deleteDataTagCategory(id) {
  return request({
    url: `/crm/dataTag/manage/category/${id}`,
    method: 'delete'
  })
}

// 批量操作：显隐 / 归类
export function batchUpdateDataTagVisible(data) {
  return request({
    url: '/crm/dataTag/manage/visible',
    method: 'put',
    data
  })
}

export function batchUpdateDataTagCategory(data) {
  return request({
    url: '/crm/dataTag/manage/category/batch',
    method: 'put',
    data
  })
}
