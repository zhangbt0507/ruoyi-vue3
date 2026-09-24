import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询定价分成参数列表
export function listPricingShareParam(query) {
  return request({
    url: '/pricing/share/list',
    method: 'get',
    params: query
  })
}

// 查询定价分成参数详细
export function getPricingShareParam(id) {
  return request({
    url: '/pricing/share/' + id,
    method: 'get'
  })
}

// 新增定价分成参数
export function addPricingShareParam(data) {
  return request({
    url: '/pricing/share',
    method: 'post',
    data: data
  })
}

// 修改定价分成参数
export function updatePricingShareParam(data) {
  return request({
    url: '/pricing/share',
    method: 'put',
    data: data
  })
}

// 删除定价分成参数
export function delPricingShareParam(id) {
  return request({
    url: '/pricing/share/' + id,
    method: 'delete'
  })
}

// 批量删除定价分成参数
export function delPricingShareParams(ids) {
  return request({
    url: '/pricing/share/' + ids,
    method: 'delete'
  })
}

// 导出定价分成参数
export function exportPricingShareParam(query) {
  return request({
    url: '/pricing/share/export',
    method: 'post',
    params: query
  })
}

// 根据条件查询定价分成参数
export function getPricingShareParamByCondition(isStock, rewardType, guaranteeType, useBranchAuthority) {
  return request({
    url: '/pricing/share/condition',
    method: 'get',
    params: {
      isStock,
      rewardType,
      guaranteeType,
      useBranchAuthority
    }
  })
}

// 根据分档范围查询定价分成参数
export function getPricingShareParamByRange(isStock, rewardType, guaranteeType, branchValue) {
  return request({
    url: '/pricing/share/range',
    method: 'get',
    params: {
      isStock,
      rewardType,
      guaranteeType,
      branchValue
    }
  })
}