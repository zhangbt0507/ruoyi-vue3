import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 客户触达统计列表
export function listContactStats(query) {
  return request({
    url: '/crm/stats/contact/list',
    method: 'get',
    params: query
  })
}

// 客户触达统计-按机构汇总
export function contactSummaryOrg(query) {
  return request({
    url: '/crm/stats/contact/summary/org',
    method: 'get',
    params: query
  })
}

// 客户触达统计-按管户经理汇总
export function contactSummaryManager(query) {
  return request({
    url: '/crm/stats/contact/summary/manager',
    method: 'get',
    params: query
  })
}

// 客群业绩统计列表
export function listGroupStats(query) {
  return request({
    url: '/crm/stats/group/list',
    method: 'get',
    params: query
  })
}

// 客群业绩统计-按机构汇总
export function groupSummaryOrg(query) {
  return request({
    url: '/crm/stats/group/biz-summary/org',
    method: 'get',
    params: query
  })
}

// 客群业绩统计-按管户经理汇总
export function groupSummaryManager(query) {
  return request({
    url: '/crm/stats/group/biz-summary/manager',
    method: 'get',
    params: query
  })
}

// 客户业绩统计列表
export function listCustomerStats(query) {
  return request({
    url: '/crm/stats/customer/list',
    method: 'get',
    params: query
  })
}

// 客户业绩统计-按机构汇总
export function customerSummaryOrg(query) {
  return request({
    url: '/crm/stats/customer/biz-summary/org',
    method: 'get',
    params: query
  })
}

// 客户业绩统计-按管户经理汇总
export function customerSummaryManager(query) {
  return request({
    url: '/crm/stats/customer/biz-summary/manager',
    method: 'get',
    params: query
  })
}

// 差值指标列清单（业绩页列显示设定；registry 静态推导）
export function getDeltaColumns() {
  return request({
    url: '/crm/stats/delta-columns',
    method: 'get'
  })
}

// 提交业绩页异步导出任务（同一用户串行，进行中重复提交返回 500）
export function submitGroupStatsExport(query) {
  return request({
    url: '/crm/stats/group/export',
    method: 'post',
    params: query
  })
}

// 提交客户业绩异步导出任务
export function submitCustomerStatsExport(query) {
  return request({
    url: '/crm/stats/customer/export',
    method: 'post',
    params: query
  })
}

// 当前用户导出任务状态（RUNNING/SUCCESS/FAIL/NONE）
export function getExportStatus() {
  return request({
    url: '/crm/stats/export/status',
    method: 'get'
  })
}
