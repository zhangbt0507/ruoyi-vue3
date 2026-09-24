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
export function getRate(param_id, effect_date) {
  return request({
    url: '/finance/rate/' + param_id + '/' + effect_date,
    method: 'get'
  })
}

// 新增利率
export function addRate(data) {
  return request({
    url: '/finance/rate',
    method: 'post',
    data: data
  })
}

// 修改利率
export function updateRate(data) {
  return request({
    url: '/finance/rate',
    method: 'put',
    data: data
  })
}

// 删除利率
export function delRate(param_id, effect_date) {
  return request({
    url: '/finance/rate/' + param_id + '/' + effect_date,
    method: 'delete'
  })
} 