import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
const url = '/group-customer';

  // 查询详细
  export function getSingleCustomer(khh) {
    return request({
      url: url + '/' + khh,
      method: 'get'
    })
  }

  // 查询列表
export function listGroupCustomer(query) {
  return request({
    url: url + '/list',
    method: 'get',
    params: query
  })
}

// 新增客户
export function addGroupCustomer(data) {
  return request({
    url: url ,
    method: 'post',
    data: data
  })
}

// 修改
export function updateGroupCustomer(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}

// 删除
export function delGroupCustomer(nms) {
  return request({
    url: url + '/'+nms,
    method: 'delete'
  })
}
