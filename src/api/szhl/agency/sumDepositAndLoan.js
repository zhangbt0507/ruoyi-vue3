import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

// 获取存贷款汇总
export function getSumDepositAndLoan(date,orgNo,queryType) {
    return request({
      url: '/sum-deposit-and-loan/query?date='+date+"&orgNo="+orgNo+"&queryType="+queryType,
      method: 'get'
    })
  }

  // 获取跑批日期
export function getEtlDate() {
  return request({
    url: '/sum-deposit-and-loan/date',
    method: 'get'
  })
}

  // 获取跑批日期T+2
  export function getEtlDateDiff() {
    return request({
      url: '/sum-deposit-and-loan/date/2',
      method: 'get'
    })
  }
