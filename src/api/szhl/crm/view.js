import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 客户 360 视图（base + db2 + portraitTagNames）
export function getCustomerView(customerNo) {
  return request({
    url: '/crm/view/customer/' + customerNo,
    method: 'get'
  })
}

// 客户 360 V2 按需板块查询（如行内贷款明细 BANK_LOAN，取数 JZFY.CUST_LOAN_DETAIL）
// pagination 仅作用于 BANK_LOAN 板块：{ pageNum, pageSize }
export function queryCustomerViewV2(customerNo, sections, pagination) {
  return request({
    url: '/crm/view/v2/query',
    method: 'post',
    data: { customerNo, sections, ...pagination }
  })
}

// 客户 360 V2 轻量板块查询：仅行内板块（BANK_LOAN/BANK_CONTRACT/BANK_GUARANTEE），
// 不加载 Hive 快照，供翻页/排序等高频交互使用；响应结构与 v2/query 相同（未查板块为 null）
export function querySectionV2(customerNo, sections, pagination) {
  return request({
    url: '/crm/view/v2/section',
    method: 'post',
    data: { customerNo, sections, ...pagination }
  })
}

// 企业 360 视图（base + db2 + changes + contacts）
export function getCorpView(customerNo) {
  return request({
    url: '/crm/view/corp/' + customerNo,
    method: 'get'
  })
}

// 归属变更履历
export function getChangeLogs(customerNo) {
  return request({
    url: '/crm/view/' + customerNo + '/changes',
    method: 'get'
  })
}

// 触达记录（不限月份）
export function getViewContacts(customerNo) {
  return request({
    url: '/crm/view/' + customerNo + '/contacts',
    method: 'get'
  })
}

// 历史欠息：前4年取年末报告期，当年取 T+1 报告期
// 返回 reportDate、loanBalance、overdueInterestTotal、overdueMonths
export function getHistoryArrears(custId) {
  return request({
    url: '/crm/loanOverdue/' + custId + '/yearly',
    method: 'get'
  })
}
