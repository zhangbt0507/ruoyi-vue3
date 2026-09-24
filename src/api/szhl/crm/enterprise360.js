import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 企业 360 首屏定位与归属信息
export function getEnterprise360Bootstrap(customerNo) {
  return request({
    url: '/crm/enterprise360/bootstrap/' + customerNo,
    method: 'get'
  })
}

// 企业 360 基础信息
export function getEnterprise360Basic(customerId) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/basic',
    method: 'get'
  })
}

// 企业 360 地址和电话
export function getEnterprise360ContactPoints(customerId) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/contact-points',
    method: 'get'
  })
}

// 企业 360 画像标签
export function getEnterprise360PortraitTags(customerId) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/portrait-tags',
    method: 'get'
  })
}

// 企业 360 企业资料
export function getEnterprise360CorporateProfile(customerNo, customerId) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/profile',
    method: 'get',
    params: { customerId }
  })
}

// 企业 360 产品状态
export function getEnterprise360ProductStatus(customerId) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/product-status',
    method: 'get'
  })
}

// 企业 360 产品量化信息
export function getEnterprise360ProductMetrics(customerNo) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/product-metrics',
    method: 'get'
  })
}

// 企业 360 开户信息
export function getEnterprise360BankAccounts(customerId) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/bank-accounts',
    method: 'get'
  })
}

// 企业 360 行内有效合同：按关联客户组取数，onlyMainCustomer=true 时仅查当前客户自身
export function getEnterprise360InternalContracts(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/internal-contracts',
    method: 'get',
    params: { onlyMainCustomer }
  })
}

// 企业 360 行内贷款分页：按关联客户组取数，固定过滤金额 > 0
export function queryEnterprise360InternalLoans({
  customerId,
  onlyMainCustomer = false,
  pageNum,
  pageSize,
  sortField,
  sortDirection
}) {
  return request({
    url: '/crm/enterprise360/internal-loans',
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

// 企业 360 行内对外担保：按关联客户组取数，onlyMainCustomer=true 时仅查当前客户自身
export function getEnterprise360InternalGuarantees(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/internal-guarantees',
    method: 'get',
    params: { onlyMainCustomer }
  })
}

// 企业 360 关联客户
export function getEnterprise360Relations(customerId) {
  return request({
    url: '/crm/enterprise360/' + customerId + '/relations',
    method: 'get'
  })
}

function idNosParams(idNos) {
  return { idNos: (idNos || []).join(',') }
}

// 企业 360 所有银行贷款
export function queryEnterprise360ExternalLoans(idNos) {
  return request({
    url: '/crm/enterprise360/external-loans',
    method: 'post',
    params: idNosParams(idNos)
  })
}

// 企业 360 所有银行贷款：按关联客户组取数，onlyMainCustomer=true 时仅查当前企业自身
export function queryEnterprise360ExternalLoansByCustomer(customerId, onlyMainCustomer = false) {
  return request({
    url: '/crm/enterprise360/external-loans/by-customer',
    method: 'post',
    params: { customerId, onlyMainCustomer }
  })
}

// 企业 360 企业征信历史负债
export function getEnterprise360CorporateCreditHistory(customerNo) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/corporate-credit-history',
    method: 'get'
  })
}

// 企业 360 不良建档
export function getEnterprise360BadLoans(customerNo) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/bad-loans',
    method: 'get'
  })
}

// 企业 360 管户变更历史
export function getEnterprise360AttributionHistory(customerNo) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/attribution-history',
    method: 'get'
  })
}

// 企业 360 欠息历史
export function getEnterprise360ArrearsHistory(customerNo) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/arrears-history',
    method: 'get'
  })
}

// 企业 360 触达时间线
export function getEnterprise360TouchTimeline(customerNo) {
  return request({
    url: '/crm/enterprise360/' + customerNo + '/touch-timeline',
    method: 'get'
  })
}
