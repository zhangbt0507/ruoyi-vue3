import request from '@/utils/request'

/**
 * 查询不良贷款台账列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listBadLoan(query) {
  return request({
    url: '/badLoan/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询不良贷款台账详细信息
 * @param {string} contractNo 合同号
 * @returns {Promise}
 */
export function getBadLoan(contractNo) {
  return request({
    url: `/badLoan/${contractNo}`,
    method: 'get'
  })
}

/**
 * 新增不良贷款台账
 * @param {Object} data 不良贷款台账信息
 * @returns {Promise}
 */
export function addBadLoan(data) {
  return request({
    url: '/badLoan',
    method: 'post',
    data: data
  })
}

/**
 * 修改不良贷款台账
 * @param {Object} data 不良贷款台账信息
 * @returns {Promise}
 */
export function updateBadLoan(data) {
  return request({
    url: '/badLoan',
    method: 'put',
    data: data
  })
}

/**
 * 删除不良贷款台账
 * @param {string} contractNo 合同号
 * @returns {Promise}
 */
export function delBadLoan(contractNo) {
  return request({
    url: `/badLoan/${contractNo}`,
    method: 'delete'
  })
}

/**
 * 导出不良贷款台账
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportBadLoan(query) {
  return request({
    url: '/badLoan/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
} 