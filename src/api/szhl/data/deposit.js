import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/deposit';

// 获取列表
export function getDepositList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

    // 获取列表
export function getSumDepositList(query) {
    return request({
        url: url + '/sum-list',
        method: 'get',
        params: query
      })
  }