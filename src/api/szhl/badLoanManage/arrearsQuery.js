import request from '@/utils/request'

/**
 * 查询欠缴查询列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listArrearsQuery(query) {
  return request({
    url: '/badLoan/arrearsQuery/list',
    method: 'get',
    params: query
  })
}

/**
 * 导出欠缴查询
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportArrearsQuery(query) {
  return request({
    url: '/badLoan/arrearsQuery/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

