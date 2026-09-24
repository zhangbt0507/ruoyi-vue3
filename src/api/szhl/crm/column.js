import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

// 获取列显示配置
export function getColumnConfig(pageKey) {
  return request({
    url: '/crm/column/config',
    method: 'get',
    params: { pageKey }
  })
}

// 保存列显示配置（同用户同 pageKey 覆盖）
export function saveColumnConfig(data) {
  return request({
    url: '/crm/column/config',
    method: 'post',
    data: data
  })
}
