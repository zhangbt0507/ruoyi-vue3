import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 新增触达记录（客群触达可通过 products 关联多个客群）
export function addContactRecord(data) {
  return request({
    url: '/crm/contact/record/add',
    method: 'post',
    data: data
  })
}

// 客户触达记录列表（months 可选，近 N 个月）
export function listContactRecord(customerId, months) {
  return request({
    url: '/crm/contact/record/list',
    method: 'get',
    params: { customerId, months }
  })
}

// 取客户所属有效客群（触达弹窗多选）
export function customerGroups(customerId) {
  return request({
    url: '/crm/contact/record/customer-groups',
    method: 'get',
    params: { customerId }
  })
}
