import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

export function getReachSummary(query) {
  return request({
    url: '/crm/reach/summary',
    method: 'get',
    params: query
  })
}

export function listReachDetail(query) {
  return request({
    url: '/crm/reach/detail/list',
    method: 'get',
    params: query
  })
}
