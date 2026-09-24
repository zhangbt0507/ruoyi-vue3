import request from '@/utils/request'

/**
 * 查询基本信息建档列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listCustomerBasicInfo(query) {
  return request({
    url: '/customer/basicInfo/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询基本信息建档详细信息
 * @param {string} customerNo 客户号
 * @returns {Promise}
 */
export function getCustomerBasicInfo(customerNo) {
  return request({
    url: `/customer/basicInfo/${customerNo}`,
    method: 'get'
  })
}

/**
 * 新增基本信息建档
 * @param {Object} data 基本信息建档信息
 * @returns {Promise}
 */
export function addCustomerBasicInfo(data) {
  return request({
    url: '/customer/basicInfo',
    method: 'post',
    data: data
  })
}

/**
 * 修改基本信息建档
 * @param {Object} data 基本信息建档信息
 * @returns {Promise}
 */
export function updateCustomerBasicInfo(data) {
  return request({
    url: '/customer/basicInfo',
    method: 'put',
    data: data
  })
}

/**
 * 删除基本信息建档
 * @param {string} customerNo 客户号
 * @returns {Promise}
 */
export function delCustomerBasicInfo(customerNo) {
  return request({
    url: `/customer/basicInfo/${customerNo}`,
    method: 'delete'
  })
}

/**
 * 导出基本信息建档
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportCustomerBasicInfo(query) {
  return request({
    url: '/customer/basicInfo/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
} 