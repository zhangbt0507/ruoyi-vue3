import request from '@/utils/request'

/**
 * 查询个人账户余额列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listPersonalAccountBalance(query) {
  return request({
    url: '/badLoan/personalAccountBalance/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询个人账户余额详细信息
 * @param {string} accountNumber 账号
 * @returns {Promise}
 */
export function getPersonalAccountBalance(accountNumber) {
  return request({
    url: `/badLoan/personalAccountBalance/${accountNumber}`,
    method: 'get'
  })
}

/**
 * 导出个人账户余额
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportPersonalAccountBalance(query) {
  return request({
    url: '/badLoan/personalAccountBalance/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 风险金扣款
 * @param {Object} data 扣款数据
 * @returns {Promise}
 */
export function deductRiskFund(data) {
  return request({
    url: '/badLoan/personalAccountStatement/deduct',
    method: 'post',
    data: data
  })
}

