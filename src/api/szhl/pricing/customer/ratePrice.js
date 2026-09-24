import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询客户利率定价记录
export function getRatePrice(customerId) {
  return request({
    url: '/cust/pricing/' + customerId,
    method: 'get'
  })
}

// 查询参与分成的数据
export function listSharedPricing(query) {
  return request({
    url: '/cust/pricing/sharedList',
    method: 'get',
    params: query
  })
}

// 新增客户利率定价
export function saveRatePrice(data) {
  return request({
    url: '/cust/pricing',
    method: 'post',
    data: data
  })
}

// 修改客户利率定价
export function updateRatePrice(data) {
  return request({
    url: '/cust/pricing',
    method: 'put',
    data: data
  })
}

// 删除客户利率定价
export function delRatePrice(customerId) {
  return request({
    url: '/cust/pricing/' + customerId,
    method: 'delete'
  })
}

// 查询客户列表
export function listRatePrice(query) {
  return request({
    url: '/cust/pricing/list',
    method: 'get',
    params: query
  })
}