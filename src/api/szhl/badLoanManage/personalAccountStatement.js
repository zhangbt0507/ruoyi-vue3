import request from '@/utils/request'

/**
 * 查询个人账户流水表列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listPersonalAccountStatement(query) {
  return request({
    url: '/badLoan/personalAccountStatement/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询个人账户流水表详细信息
 * @param {number} id 主键ID
 * @returns {Promise}
 */
export function getPersonalAccountStatement(id) {
  return request({
    url: `/badLoan/personalAccountStatement/${id}`,
    method: 'get'
  })
}

/**
 * 新增个人账户流水表
 * @param {Object} data 个人账户流水表信息
 * @returns {Promise}
 */
export function addPersonalAccountStatement(data) {
  return request({
    url: '/badLoan/personalAccountStatement',
    method: 'post',
    data: data
  })
}

/**
 * 修改个人账户流水表
 * @param {Object} data 个人账户流水表信息
 * @returns {Promise}
 */
export function updatePersonalAccountStatement(data) {
  return request({
    url: '/badLoan/personalAccountStatement',
    method: 'put',
    data: data
  })
}

/**
 * 删除个人账户流水表
 * @param {Array} ids 主键ID数组
 * @returns {Promise}
 */
export function delPersonalAccountStatement(ids) {
  return request({
    url: `/badLoan/personalAccountStatement/${ids}`,
    method: 'delete'
  })
}

/**
 * 导出个人账户流水表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportPersonalAccountStatement(query) {
  return request({
    url: '/badLoan/personalAccountStatement/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 复核个人账户流水表
 * @param {number} id 主键ID
 * @returns {Promise}
 */
export function reviewPersonalAccountStatement(id) {
  return request({
    url: `/badLoan/personalAccountStatement/review/${id}`,
    method: 'put'
  })
}

/**
 * 复核通过个人账户流水表
 * @param {Object} data 复核数据
 * @returns {Promise}
 */
export function approvePersonalAccountStatement(data) {
  return request({
    url: '/badLoan/personalAccountStatement/approve',
    method: 'put',
    data: data
  })
}

/**
 * 作废个人账户流水表
 * @param {Object} data 作废数据
 * @returns {Promise}
 */
export function invalidatePersonalAccountStatement(data) {
  return request({
    url: '/badLoan/personalAccountStatement/invalidate',
    method: 'put',
    data: data
  })
}

