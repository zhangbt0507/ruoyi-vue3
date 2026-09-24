import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询利率列表
export function listRate(query) {
  return request({
    url: '/finance/rate/list',
    method: 'get',
    params: query
  })
}

// 查询利率详细
export function getRate(param_id, effect_date, customer_type, pledge_type) {
  return request({
    url: '/finance/rate/getRate',
    method: 'get',
    params: {
      paramId: param_id,
      effectDate: effect_date,
      customerType: customer_type,
      pledgeType: pledge_type
    }
  })
}

// 新增利率
export function addRate(data) {
  return request({
    url: '/finance/rate/add',
    method: 'post',
    data: data
  })
}

// 修改利率
export function updateRate(data) {
  return request({
    url: '/finance/rate/edit',
    method: 'put',
    data: data
  })
}

// 获取利率参数列表
export function getRateParamList(paramId, pledgeType) {
  return request({
    url: '/finance/rate/getRateParamList',
    method: 'get',
    params: { paramId: paramId,
      pledgeType:pledgeType }
  })
} 