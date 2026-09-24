import request from '@/utils/request'

/**
 * 获取不良贷款建档信息（包含客户信息和贷款信息）
 * @param {string} contractNo 合同号
 * @returns {Promise}
 */
export function getBadLoanFiling(contractNo) {
  return request({
    url: `/badLoan/filing/${contractNo}`,
    method: 'get'
  })
}

/**
 * 保存不良贷款建档信息（包含客户信息和贷款信息）
 * 使用事务确保数据一致性
 * @param {Object} data 建档信息（包含客户信息和贷款信息）
 * @returns {Promise}
 */
export function saveBadLoanFiling(data) {
  return request({
    url: '/badLoan/filing',
    method: 'post',
    data: data
  })
} 