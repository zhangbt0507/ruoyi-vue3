import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/org-temp-two';

// 获取存贷款奖金区别机构类
export function getDepositOrLoan(workDate,type) {
    return request({
      url: url + '/' + workDate+ '/' +type,
      method: 'get'
    })
  }

  // 获取贷款奖金
export function getLoanZjx(workDate) {
  return request({
    url: url + '/loan/' + workDate,
    method: 'get'
  })
}