import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')
/**
 * 获取个人客户中间业务信息
 * @param {string} custId 客户内码
 * @returns {Promise}
 */
export function getPerBusinessInfo(custId) {
  return request({
    url: `/cust/business/personal/${custId}`,
    method: 'get'
  })
}

/**
 * 获取对公客户中间业务信息
 * @param {string} custId 客户内码
 * @returns {Promise}
 */
export function getPubBusinessInfo(custId) {
  return request({
    url: `/cust/business/corporate/${custId}`,
    method: 'get'
  })
} 