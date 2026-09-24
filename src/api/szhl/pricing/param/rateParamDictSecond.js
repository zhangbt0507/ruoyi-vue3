import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询二级参数列表
export function listRateParamDictSecond(query) {
  return request({
    url: '/rate/second/list',
    method: 'get',
    params: query
  })
}

// 查询二级参数详细
export function getRateParamDictSecond(param_id, effect_date, customer_type) {
  return request({
    url: `/rate/second/getInfo`,
    params: {
      paramId: param_id,
      effectDate: effect_date,
      customerType: customer_type
    }
  })
}

// 新增二级参数
export function addRateParamDictSecond(data) {
  return request({
    url: '/rate/second',
    method: 'post',
    data: data
  })
}

// 修改二级参数
export function updateRateParamDictSecond(data) {
  return request({
    url: '/rate/second',
    method: 'put',
    data: data
  })
} 


// 获取利率二级参数
export function getSecondRateParamDictList(customerType, parentIds) {
  return request({
    url: '/rate/second/getSecondRateParamDictList',
    method: 'post',
    params: { customerType },
    data: parentIds
  })
} 