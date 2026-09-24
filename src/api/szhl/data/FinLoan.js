import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
const url = '/fin-loan';

// 获取列表
export function getFinLoanList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }