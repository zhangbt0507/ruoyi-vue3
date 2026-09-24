import request from '@/utils/request'

/**
 * 查询待建档合同明细列表（分页）
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listToBeSet(query) {
  return request({
    url: '/badLoan/tobeset/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询待建档合同明细详细信息
 * @param {string} contractNo 合同编号
 * @returns {Promise}
 */
export function getToBeSet(contractNo) {
  return request({
    url: `/badLoan/tobeset/${contractNo}`,
    method: 'get'
  })
}

/**
 * 新增待建档合同明细
 * @param {Object} data 待建档合同明细
 * @returns {Promise}
 */
export function addToBeSet(data) {
  return request({
    url: '/badLoan/tobeset',
    method: 'post',
    data: data
  })
}

/**
 * 修改待建档合同明细
 * @param {Object} data 待建档合同明细
 * @returns {Promise}
 */
export function updateToBeSet(data) {
  return request({
    url: '/badLoan/tobeset',
    method: 'put',
    data: data
  })
}

/**
 * 删除待建档合同明细
 * @param {string|string[]} contractNo 合同编号（支持单个或数组）
 * @returns {Promise}
 */
export function delToBeSet(contractNo) {
  return request({
    url: `/badLoan/tobeset/${contractNo}`,
    method: 'delete'
  })
}

/**
 * 导出待建档合同明细
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportToBeSet(query) {
  return request({
    url: '/badLoan/tobeset/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

