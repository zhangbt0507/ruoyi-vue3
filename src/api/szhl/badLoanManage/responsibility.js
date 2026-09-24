import request from '@/utils/request'

/**
 * 查询责任与风险金表列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function listResponsibility(query) {
  return request({
    url: '/badLoan/responsibility/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询风险金扣款列表
 * @param {string} id 责任与风险金表主键
 * @returns {Promise}
 */
export function getRiskFundDedution(query) {
  return request({
    url: `/badLoan/responsibility/getRiskFundDedution`,
    method: 'get',
    params: query
  })
}

/**
 * 查询责任与风险金表详细
 * @param {string} id 责任与风险金表主键
 * @returns {Promise}
 */
export function getRiskFundList(query) {
  return request({
    url: `/badLoan/responsibility/getRiskFundList`,
    method: 'get',
    params: query
  })
}

/**
 * 查询责任与风险金表详细
 * @param {string} id 责任与风险金表主键
 * @returns {Promise}
 */
export function getResponsibility(id) {
  return request({
    url: `/badLoan/responsibility/${id}`,
    method: 'get'
  })
}

/**
 * 根据合同号查询责任与风险金表列表（不分页）
 * @param {string} contractNo 合同号
 * @returns {Promise}
 */
export function getResponsibilityByContractNo(contractNo) {
  return request({
    url: `/badLoan/responsibility/getContract/${contractNo}`,
    method: 'get'
  })
}

/**
 * 新增责任与风险金表（单条）
 * @param {Object} data 责任与风险金表
 * @returns {Promise}
 */
export function addResponsibility(data) {
  return request({
    url: '/badLoan/responsibility',
    method: 'post',
    data: data
  })
}

/**
 * 批量新增责任与风险金表
 * @param {Array} responsibilityList 责任与风险金表列表
 * @returns {Promise}
 */
export function addAllResponsibility(responsibilityList) {
  return request({
    url: '/badLoan/responsibility/addAll',
    method: 'post',
    data: responsibilityList
  })
}

/**
 * 修改责任与风险金表
 * @param {Object} data 责任与风险金表
 * @returns {Promise}
 */
export function updateResponsibility(data) {
  return request({
    url: '/badLoan/responsibility',
    method: 'put',
    data: data
  })
}

/**
 * 批量保存责任与风险金表（用于责任初分功能）
 * @param {string} contractNo 合同号
 * @param {Array} responsibilityList 责任与风险金表列表
 * @returns {Promise}
 */
export function batchSave(contractNo, responsibilityList) {
  return request({
    url: `/badLoan/responsibility/batch/${contractNo}`,
    method: 'post',
    data: responsibilityList
  })
}

/**
 * 删除责任与风险金表
 * @param {string} id 责任与风险金表主键
 * @returns {Promise}
 */
export function delResponsibility(id) {
  return request({
    url: `/badLoan/responsibility/${id}`,
    method: 'delete'
  })
}

/**
 * 导出责任与风险金表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function exportResponsibility(query) {
  return request({
    url: '/badLoan/responsibility/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 责任人认定
 * @param {Object} data 责任与风险金表
 * @returns {Promise}
 */
export function responsibilityVerification(data) {
  return request({
    url: '/badLoan/responsibility/verification',
    method: 'put',
    data: data
  })
}

/**
 * 总行定责保存（会议定责）
 * @param {string} contractNo 合同号
 * @param {Array} responsibilityList 责任与风险金表列表
 * @returns {Promise}
 */
export function saveHeadDetermination(contractNo, responsibilityList) {
  return request({
    url: '/badLoan/responsibility/headDetermination',
    method: 'post',
    params: { contractNo },
    data: responsibilityList
  })
}

/**
 * 常规审批批量通过
 * @param {string} contractNo 合同号
 * @returns {Promise}
 */
export function batchApprove(contractNo) {
  return request({
    url: `/badLoan/responsibility/batchApprove/${contractNo}`,
    method: 'put'
  })
}

/**
 * 风险金计算与分摊保存
 * @param {string} contractNo 合同号
 * @param {Array} responsibilityRiskFundList 责任与风险金分摊列表
 * @param {Object} badLoanAccount 不良贷款台账风险金相关字段
 * @returns {Promise}
 */
export function riskCalculate(responsibilityRiskFundList, badLoanAccount) {
  return request({
    url: `/badLoan/responsibility/riskCalculate`,
    method: 'post',
    data: {
      responsibilityRiskFundList,
      badLoanAccount
    }
  })
}

/**
 * 风险金退缴
 * @param {Object} data 退缴参数
 * @returns {Promise}
 */
export function refundRiskFund(data) {
  return request({
    url: '/badLoan/responsibility/refund',
    method: 'post',
    data
  })
}

/**
 * 查询原核心系统责任情况（初始责任比）
 * @param {string} contractNumber 合同号
 * @returns {Promise}
 */
export function getOriginalLiability(contractNumber) {
  return request({
    url: '/loan/Liability/list',
    method: 'get',
    params: { contractNumber }
  })
}
