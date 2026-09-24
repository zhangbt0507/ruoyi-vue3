import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 根据客户内码获取客户存款信息
export function getCustDepositInfo(custNo) {
  return request({
    url: `/cust/deposit/${custNo}`,
    method: 'get'
  })
} 