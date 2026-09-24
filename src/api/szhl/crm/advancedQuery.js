import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// CRM高级查询场景条件目录
export function listAdvancedQueryConditions(target) {
  return request({
    url: '/crm/advancedQuery/condition/list',
    method: 'get',
    params: { target }
  })
}
