import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询二级参数名称列表
export function listRateSecondParam(query) {
  return request({
    url: '/second/param/list',
    method: 'get',
    params: query
  })
}

// 查询二级参数名称详细
export function getRateSecondParam(paramCode) {
  return request({
    url: `/second/param/${paramCode}`,
    method: 'get'
  })
}

// 新增二级参数名称
export function addRateSecondParam(data) {
  return request({
    url: '/second/param',
    method: 'post',
    data: data
  })
} 