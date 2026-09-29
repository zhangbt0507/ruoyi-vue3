import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// CRM 搜索条件专用机构树
export function listCrmOrgTree() {
  return request({
    url: '/crm/org/tree',
    method: 'get'
  })
}
