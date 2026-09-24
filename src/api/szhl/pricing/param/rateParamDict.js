import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询利率参数列表
export function listRateParamDict(query) {
  return request({
    url: '/rate/dict/list',
    method: 'get',
    params: query
  })
}

// 查询利率参数详细
export function getRateParamDict(param_id, effect_date, customer_type) {
  return request({
    url: '/rate/dict/getInfo',
    method: 'get',
    params: {
      paramId: param_id,
      effectDate: effect_date,
      customerType: customer_type
    }
  })
}

// 查询一级利率正常参数map
export function getParamDict(type) {
  return request({
    url: '/rate/dict/getParamDict',
    method: 'get',
    params: {
      customerType: type
    }
  })
}

// 新增利率参数
export function addRateParamDict(data) {
  return request({
    url: '/rate/dict',
    method: 'post',
    data: data
  })
}

// 修改利率参数
export function updateRateParamDict(data) {
  return request({
    url: '/rate/dict',
    method: 'put',
    data: data
  })
}

// 查询正常或者对公利率参数列表
export function getRateParamDictList(type) {
  return request({
    url: '/rate/dict/getRateParamDictList',
    method: 'get',
    params: {
      customerType: type
    }
  })
}