import request from '@/utils/request'

// CRM 搜索条件专用机构树
export function listCrmOrgTree() {
  return request({
    url: '/crm/org/tree',
    method: 'get'
  })
}
