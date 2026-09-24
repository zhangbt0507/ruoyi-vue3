import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询定价流程列表
export function listRateProcess(query) {
  return request({
    url: '/pricing/process/list',
    method: 'get',
    params: query
  })
}

// 查询定价流程详细
export function getRateProcess(pricingNo) {
  return request({
    url: '/pricing/process/' + pricingNo,
    method: 'get'
  })
}

// 查询定价流程详细（根据ID）
export function getRateProcessByNo(pricingNo) {
  return request({
    url: '/pricing/process/' + pricingNo,
    method: 'get'
  })
}

// 新增定价流程
export function addRateProcess(data) {
  return request({
    url: '/pricing/process',
    method: 'post',
    data: data
  })
}

// 修改定价流程
export function updateRateProcess(data) {
  return request({
    url: '/pricing/process',
    method: 'put',
    data: data
  })
}

// 审批流程
export function approve(data) {
  return request({
    url: '/pricing/process/approve',
    method: 'post',
    data: data
  })
}

// 删除定价流程
export function delRateProcess(pricingNo) {
  return request({
    url: '/pricing/process/' + pricingNo,
    method: 'delete'
  })
}

// 作废定价流程
export function cancelRateProcess(pricingNo) {
  return request({
    url: '/pricing/process/cancel',
    method: 'put',
    data: {
      pricingNo,
      remark
    }
  })
}

// 作废定价流程
export function exportRateProcess(pricingNo) {
  return request({
    url: '/pricing/process/export',
    method: 'post',
    data: data
  })
}