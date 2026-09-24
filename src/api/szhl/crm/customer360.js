import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 客户 360 首屏定位与归属信息
export function getCustomer360Bootstrap(customerNo) {
  return request({
    url: '/crm/customer360/bootstrap/' + customerNo,
    method: 'get'
  })
}

// 客户 360 基础与扩展信息
export function getCustomer360Basic(customerId) {
  return request({
    url: '/crm/customer360/' + customerId + '/basic',
    method: 'get'
  })
}

// 客户 360 地址和电话
export function getCustomer360ContactPoints(customerId) {
  return request({
    url: '/crm/customer360/' + customerId + '/contact-points',
    method: 'get'
  })
}

// 客户 360 产品状态
export function getCustomer360ProductStatus(customerId) {
  return request({
    url: '/crm/customer360/' + customerId + '/product-status',
    method: 'get'
  })
}

// 客户 360 画像标签
export function getCustomer360PortraitTags(customerId) {
  return request({
    url: '/crm/customer360/' + customerId + '/portrait-tags',
    method: 'get'
  })
}

// 客户 360 产品量化信息
export function getCustomer360ProductMetrics(customerNo) {
  return request({
    url: '/crm/customer360/' + customerNo + '/product-metrics',
    method: 'get'
  })
}

// 客户 360 资产信息
export function getCustomer360Assets(customerId) {
  return request({
    url: '/crm/customer360/' + customerId + '/assets',
    method: 'get'
  })
}

// 客户 360 行内合同：按关联客户组取数，onlyMainCustomer=true 时仅查当前客户自身
export function getCustomer360InternalContracts(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/customer360/' + customerId + '/internal-contracts',
    method: 'get',
    params: { onlyMainCustomer }
  })
}

// 客户 360 行内贷款分页：按关联客户组取数，固定过滤金额 > 0
export function queryCustomer360InternalLoans({
  customerId,
  onlyMainCustomer = false,
  pageNum,
  pageSize,
  sortField,
  sortDirection
}) {
  return request({
    url: '/crm/customer360/internal-loans',
    method: 'post',
    params: {
      customerId,
      onlyMainCustomer,
      pageNum,
      pageSize,
      sortField,
      sortDirection
    }
  })
}

// 客户 360 行内对外担保：按关联客户组取数，onlyMainCustomer=true 时仅查当前客户自身
export function getCustomer360InternalGuarantees(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/customer360/' + customerId + '/internal-guarantees',
    method: 'get',
    params: { onlyMainCustomer }
  })
}

function idNosParams(idNos) {
  return { idNos: (idNos || []).join(',') }
}

// 客户 360 所有银行贷款（汇总、明细和历史负债共享）
export function queryCustomer360ExternalLoans(idNos) {
  return request({
    url: '/crm/customer360/external-loans',
    method: 'post',
    params: idNosParams(idNos)
  })
}

// 客户 360 所有银行贷款：按关联客户组取数，onlyMainCustomer=true 时仅查当前客户自身
export function queryCustomer360ExternalLoansByCustomer(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/customer360/external-loans/by-customer',
    method: 'post',
    params: { customerId, onlyMainCustomer }
  })
}

// 客户 360 信用卡
export function queryCustomer360CreditCards(idNos) {
  return request({
    url: '/crm/customer360/credit-cards',
    method: 'post',
    params: idNosParams(idNos)
  })
}

// 客户 360 信用卡：按关联客户组取数，onlyMainCustomer=true 时仅查当前客户自身
export function queryCustomer360CreditCardsByCustomer(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/customer360/credit-cards/by-customer',
    method: 'post',
    params: { customerId, onlyMainCustomer }
  })
}

// 客户 360 相关还款责任
export function queryCustomer360RepaymentResponsibilities(idNos) {
  return request({
    url: '/crm/customer360/repayment-responsibilities',
    method: 'post',
    params: idNosParams(idNos)
  })
}

// 客户 360 家庭成员
export function queryCustomer360HouseholdMembers(idNos) {
  return request({
    url: '/crm/customer360/household-members',
    method: 'post',
    params: idNosParams(idNos)
  })
}

// 客户 360 经营主体
export function queryCustomer360BusinessSubjects(idNos) {
  return request({
    url: '/crm/customer360/business-subjects',
    method: 'post',
    params: idNosParams(idNos)
  })
}

// 客户 360 关联客户
export function getCustomer360Relations(customerId) {
  return request({
    url: '/crm/customer360/' + customerId + '/relations',
    method: 'get'
  })
}

// 客户 360 管户变更历史
export function getCustomer360AttributionHistory(customerNo) {
  return request({
    url: '/crm/customer360/' + customerNo + '/attribution-history',
    method: 'get'
  })
}

// 客户 360 欠息历史
export function getCustomer360ArrearsHistory(customerNo) {
  return request({
    url: '/crm/customer360/' + customerNo + '/arrears-history',
    method: 'get'
  })
}

// 客户 360 触达时间线
export function getCustomer360TouchTimeline(customerNo) {
  return request({
    url: '/crm/customer360/' + customerNo + '/touch-timeline',
    method: 'get'
  })
}

// 客户 360 不良建档
export function getCustomer360BadLoans(customerNo) {
  return request({
    url: '/crm/customer360/' + customerNo + '/bad-loans',
    method: 'get'
  })
}
