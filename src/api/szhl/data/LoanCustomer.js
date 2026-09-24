import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
const url = '/loan-customer';

// 获取列表
export function getLoanCustomerList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

  // 获取列表
export function getLoanCustomerSum(query) {
    return request({
        url: url + '/sum-list',
        method: 'get',
        params: query
      })
  }

  // 获取客户经理管户列表
export function getLoanCustomerManagerList(query) {
  return request({
      url: url + '/manager-list',
      method: 'get',
      params: query
    })
}