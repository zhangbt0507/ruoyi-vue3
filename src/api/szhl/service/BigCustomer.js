import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

// 查询机构类客户列表
export function listBigCustomer(query) {
  return request({
    url: '/BigCustomer/jgl/list',
    method: 'get',
    params: query
  })
}

// 查询机构类客户详细
export function getBigCustomer(khh) {
  return request({
    url: '/BigCustomer/jgl/' + khh,
    method: 'get'
  })
}

// 新增机构类客户
export function addBigCustomer(data) {
  return request({
    url: '/BigCustomer/jgl',
    method: 'post',
    data: data
  })
}

// 修改机构类客户
export function updateBigCustomer(data) {
  return request({
    url: '/BigCustomer/jgl',
    method: 'put',
    data: data
  })
}

// 删除机构类客户
export function delBigCustomer(khh) {
  return request({
    url: '/BigCustomer/jgl/' + khh,
    method: 'delete'
  })
}