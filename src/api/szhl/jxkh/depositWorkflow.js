import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/deposit-workflow';
// 根据存款账号获取
export function getAccount(depositAccount) {
    return request({
      url: url + '/account/'+depositAccount,
      method: 'get'
    })
  }

  // 创建流程
export function createWorkflow() {
    return request({
      url: url + '/apply',
      method: 'get'
    })
  }