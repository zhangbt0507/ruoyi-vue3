import request from '@/utils/request'

// 查询营销客群归燕列表
export function listSwallow(query) {
  return request({
    url: '/market/swallow/list',
    method: 'get',
    params: query
  })
}

// 根据客户号查询最近一次交互信息
export function prevRecordByCustId(custId) {
  return request({
    url: `/market/swallow/record-prev/${custId}`,
    method: 'get'
  })
}

// 新增归燕触达交互记录
export function addRecord(data) {
  return request({
    url: '/market/swallow/add-record',
    method: 'post',
    data
  })
}

// 导出营销客群归燕
export function exportSwallow(query) {
  return request({
    url: '/market/swallow/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}


// 修改营销客群归燕责任人
export function updateReturnSwallowZrr(data) {
  return request({
    url: '/market/swallow/edit-zrr',
    method: 'put',
    data
  })
}