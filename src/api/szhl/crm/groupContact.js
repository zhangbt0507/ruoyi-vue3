import request from '@/utils/request'

function normalizeGroupCustomerQuery(query) {
  const params = { ...query }
  if (Array.isArray(params.groupIds)) {
    params.groupIds = params.groupIds.join(',')
  }
  if (Array.isArray(params.portraitTagIds)) {
    params.portraitTagIds = params.portraitTagIds.join(',')
  }
  if (Array.isArray(params.dataFields)) {
    params.dataFields = params.dataFields.join(',')
  }
  return params
}

// 客群客户列表（groupIds 客群多选必选）
export function listGroupCustomer(query) {
  return request({
    url: '/crm/contact/customer/list',
    method: 'get',
    params: normalizeGroupCustomerQuery(query)
  })
}

// 分解管户（ids 为客群客户表 id）
export function assignGroupCustomer(data) {
  return request({
    url: '/crm/contact/assign',
    method: 'post',
    data: data
  })
}

// 客户分层（dimension: MANAGER 管户人 / LEADER 负责人）
export function setCustomerLevel(data) {
  return request({
    url: '/crm/contact/level/set',
    method: 'post',
    data: data
  })
}
