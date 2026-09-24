import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 客户模糊搜索（名称/客户号，最多返回 50 条）
export function searchCustomer(keyword) {
  return request({
    url: '/crm/customer/search',
    method: 'get',
    params: { keyword }
  })
}

// 校验客户号是否为我行客户（360 视图证件号/统信码跳转前置校验）
export function checkCustomerExists(customerNo) {
  return request({
    url: '/crm/customer/exists',
    method: 'get',
    params: { customerNo }
  })
}

// 查询客户公私类型（0 对私 / 1 对公）
export function getCustomerPublicPrivateType(customerNo) {
  return request({
    url: '/crm/customer/public-private-type',
    method: 'get',
    params: { customerNo }
  })
}
