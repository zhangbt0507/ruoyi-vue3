import request from '@/utils/request'

// 暂缓申请列表
export function listDefer(query) {
  return request({
    url: '/crm/defer/list',
    method: 'get',
    params: query
  })
}

// 发起暂缓申请
export function createDefer(data) {
  return request({
    url: '/crm/defer/create',
    method: 'post',
    data: data
  })
}

// 暂缓审批
export function approveDefer(data) {
  return request({
    url: '/crm/defer/approve',
    method: 'post',
    data: data
  })
}
