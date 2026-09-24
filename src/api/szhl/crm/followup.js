import request from '@/utils/request'

// 待跟踪列表
export function listFollowup(query) {
  return request({
    url: '/crm/followup/list',
    method: 'get',
    params: query
  })
}

// 跟踪历史
export function listFollowupHistory(contactId) {
  return request({
    url: `/crm/followup/history/${contactId}`,
    method: 'get'
  })
}

// 登记跟踪记录（followupStatus: 0 未完 / 1 完成）
export function createFollowup(data) {
  return request({
    url: '/crm/followup/create',
    method: 'post',
    data: data
  })
}
