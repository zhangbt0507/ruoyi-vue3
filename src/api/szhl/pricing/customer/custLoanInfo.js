import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 获取客户贷款详情信息
export function getCustLoanInfo(custNo) {
  return request({
    url: `/cust/loanInfo/${custNo}`,
    method: 'get'
  })
} 