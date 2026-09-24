import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
const url = '/fin-base-customer';

// 获取列表
export function getFinBaseCustomerList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

    // 删除
export function delFinBaseCustomer(data) {
    return request({
      url: url,
      method: 'delete',
      data: data
    })
  }