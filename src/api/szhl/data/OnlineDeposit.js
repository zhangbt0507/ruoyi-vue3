import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/OnlineDeposit';
// 获取列表
export function getOnlineDepositList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

  // 查询详细
export function getOnlineDeposit(accountNo,workDate) {
    return request({
      url: url + '/account/?accountNo=' + accountNo + '&workDate=' + workDate,
      method: 'get'
    })
  }

  // 新增
export function addOnlineDepositChange(data) {
    return request({
      url: url,
      method: 'post',
      data: data
    })
  }

  // 获取列表
export function getSumOnlineDepositList(query) {
    return request({
        url: url + '/sum-list',
        method: 'get',
        params: query
      })
  }