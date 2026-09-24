/** 应知应会制度学习 API */
import request from '@/utils/request'

const url = '/policyLearning'

/** 学习状态选项 */
export const LEARNING_STATUS_OPTIONS = [
  { label: '待学习', value: '0' },
  { label: '已学习', value: '1' }
]

export function learningStatusLabel(value) {
  const item = LEARNING_STATUS_OPTIONS.find(o => o.value === value)
  return item ? item.label : value
}

export function listPolicyLearning(query) {
  return request({
    url: url + '/list',
    method: 'get',
    params: query
  })
}

export function getPolicyLearning(id) {
  return request({
    url: url + '/' + id,
    method: 'get'
  })
}

export function submitPolicyLearning(data) {
  return request({
    url,
    method: 'put',
    data
  })
}

export function delPolicyLearning(ids) {
  return request({
    url: url + '/' + ids,
    method: 'delete'
  })
}