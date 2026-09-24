import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询贷款合同文件列表
export function listCoreBlfmconf(query) {
  return request({
    url: '/szhl/contract/list',
    method: 'get',
    params: query
  })
}

// 查询贷款合同文件详细
export function getCoreBlfmconf(nfaacono) {
  return request({
    url: '/szhl/contract/' + nfaacono,
    method: 'get'
  })
}

// 根据客户内码和定价日期查询合同信息
export function queryContractByCustomerAndDate(query) {
  return request({
    url: '/szhl/contract/queryByCustomerAndDate',
    method: 'get',
    params: query
  })
}

// 批量绑定合同
export function bindContracts(data) {
  return request({
    url: '/szhl/contractRelation/bind',
    method: 'post',
    data: data
  })
}

// 解绑合同
export function unbindContracts(pricingNo) {
  return request({
    url: '/szhl/contractRelation/unbind',
    method: 'post',
    params: { pricingNo }
  })
}

// 查询绑定的合同关系
export function getContractsByPricingNo(pricingNo) {
  return request({
    url: `/szhl/contractRelation/byPricingNo/${pricingNo}`,
    method: 'get'
  })
}

// 查询合同关系列表
export function listContractRelation(query) {
  return request({
    url: '/szhl/contractRelation/list',
    method: 'get',
    params: query
  })
} 